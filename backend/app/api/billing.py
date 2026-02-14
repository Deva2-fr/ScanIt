from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select
from ..database import get_session
from ..models.user import User
from ..deps import get_current_active_user
from ..services.stripe_service import StripeService
from ..config import get_settings
import stripe
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/billing", tags=["billing"])

stripe_service = StripeService()
settings = get_settings()

@router.post("/checkout")
async def create_checkout_session(
    price_id: str,
    user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Create a Stripe Checkout session.
    In DEBUG mode, mock price IDs are accepted for local development.
    In production, only real Stripe price IDs are allowed.
    """
    logger.info(f"Billing Checkout Request: {price_id} User: {user.email}")
    
    mock_price_ids = {"price_pro_monthly", "price_agency_monthly", "free"}
    
    # ──────────────────────────────────────────────────────────
    # MOCK CHECKOUT — DEVELOPMENT ONLY
    # ⚠️  This block MUST remain behind the settings.debug guard.
    #     Removing the guard allows free plan upgrades in production.
    # ──────────────────────────────────────────────────────────
    if price_id in mock_price_ids:
        if not settings.debug:
            logger.warning(f"BLOCKED mock checkout attempt in production: {price_id} by {user.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Mock checkout is disabled in production. Use a real Stripe price ID."
            )
        
        logger.info(f"[DEV] MOCK CHECKOUT: processing {price_id} for user {user.email}")
        
        user_db = session.get(User, user.id)
        if not user_db:
             raise HTTPException(status_code=404, detail="User not found")

        import uuid
        
        if price_id == "price_pro_monthly":
            user_db.plan_tier = "pro"
            user_db.subscription_active = True
            user_db.stripe_customer_id = f"cus_mock_{user.id}"
            user_db.stripe_subscription_id = f"sub_mock_{uuid.uuid4().hex[:8]}"
        elif price_id == "price_agency_monthly":
            user_db.plan_tier = "agency"
            user_db.subscription_active = True
            user_db.stripe_customer_id = f"cus_mock_{user.id}"
            user_db.stripe_subscription_id = f"sub_mock_{uuid.uuid4().hex[:8]}"
        elif price_id == "starter" or price_id == "free":
            user_db.plan_tier = "starter"
            user_db.subscription_active = True
            
        session.add(user_db)
        session.commit()
        session.refresh(user_db)
        
        origin = settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:3000"
        base_url = origin.rstrip("/")
        redirect_url = f"{base_url}/dashboard/subscription?checkout_success=true"
        logger.info(f"[DEV] Redirecting to: {redirect_url}")
        return {"url": redirect_url}

    # ──────────────────────────────────────────────────────────
    # REAL STRIPE CHECKOUT — Production path
    # ──────────────────────────────────────────────────────────
    if price_id not in [settings.stripe_price_id_pro, settings.stripe_price_id_agency]:
         if settings.stripe_price_id_pro or settings.stripe_price_id_agency:
             pass
             
    success_url = f"{settings.cors_origins_list[0]}/dashboard?checkout_success=true"
    cancel_url = f"{settings.cors_origins_list[0]}/pricing?checkout_canceled=true"
    
    checkout_url = await stripe_service.create_checkout_session(user, price_id, success_url, cancel_url)
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return {"url": checkout_url}

@router.post("/portal")
async def create_portal_session(
    user: User = Depends(get_current_active_user)
):
    """
    Create a Customer Portal session
    """
    base_url = settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:3000"

    # MOCK MODE: If user is on a mock subscription, don't hit Stripe
    if user.stripe_customer_id and user.stripe_customer_id.startswith("cus_mock_"):
        return {"url": f"{base_url}/dashboard?portal_mock=true"}

    return_url = f"{base_url}/dashboard"
    portal_url = await stripe_service.create_portal_session(user, return_url)
    return {"url": portal_url}

@router.post("/webhook")
async def stripe_webhook(request: Request, session_db: Session = Depends(get_session)):
    """
    Stripe Webhook Handler.
    Processes subscription lifecycle events from Stripe.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = await stripe_service.construct_event(payload, sig_header)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Webhook signature verification failed")
        
    event_type = event["type"]
    data = event["data"]["object"]
    
    logger.info(f"Received Stripe event: {event_type}")
    
    if event_type == "checkout.session.completed":
        user_id = data.get("client_reference_id") or data.get("metadata", {}).get("user_id")
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")
        
        if user_id:
            user = session_db.get(User, int(user_id))
            if user:
                user.stripe_customer_id = customer_id
                user.stripe_subscription_id = subscription_id
                user.subscription_active = True
                user.subscription_status = "active"
                
                # Fetch subscription from Stripe to determine the correct plan tier
                try:
                    sub = stripe.Subscription.retrieve(subscription_id)
                    price_id = sub["items"]["data"][0]["price"]["id"]
                    
                    if price_id == settings.stripe_price_id_agency:
                        user.plan_tier = "agency"
                    else:
                        user.plan_tier = "pro"
                except stripe.error.StripeError as e:
                    logger.error(f"Failed to retrieve subscription {subscription_id} from Stripe: {e}")
                    user.plan_tier = "pro"  # Safe fallback
                except (KeyError, IndexError) as e:
                    logger.error(f"Unexpected subscription data structure: {e}")
                    user.plan_tier = "pro"
                
                session_db.add(user)
                session_db.commit()
                logger.info(f"User {user_id} upgraded to {user.plan_tier}")

    elif event_type == "customer.subscription.updated":
        # Subscription changed (upgrade, downgrade, or status change)
        subscription_id = data.get("id")
        stripe_status = data.get("status", "active")  # active, past_due, canceled, etc.
        
        statement = select(User).where(User.stripe_subscription_id == subscription_id)
        user = session_db.exec(statement).first()
        
        if user:
            user.subscription_status = stripe_status
            user.subscription_active = stripe_status in ("active", "trialing")
            session_db.add(user)
            session_db.commit()
            logger.info(f"User {user.id} subscription updated: status={stripe_status}")

    elif event_type == "customer.subscription.deleted":
        subscription_id = data.get("id")
        statement = select(User).where(User.stripe_subscription_id == subscription_id)
        user = session_db.exec(statement).first()
        
        if user:
            user.subscription_active = False
            user.subscription_status = "canceled"
            user.plan_tier = "starter"
            session_db.add(user)
            session_db.commit()
            logger.info(f"User {user.id} subscription canceled")
            
    elif event_type == "invoice.payment_succeeded":
        subscription_id = data.get("subscription")
        if subscription_id:
            statement = select(User).where(User.stripe_subscription_id == subscription_id)
            user = session_db.exec(statement).first()
            if user:
                user.subscription_status = "active"
                user.subscription_active = True
                session_db.add(user)
                session_db.commit()
                logger.info(f"User {user.id} payment succeeded, status=active")
        
    elif event_type == "invoice.payment_failed":
        subscription_id = data.get("subscription")
        if subscription_id:
            statement = select(User).where(User.stripe_subscription_id == subscription_id)
            user = session_db.exec(statement).first()
            if user:
                user.subscription_status = "past_due"
                session_db.add(user)
                session_db.commit()
                logger.warning(f"User {user.id} payment failed, status=past_due")

    return {"status": "success"}

