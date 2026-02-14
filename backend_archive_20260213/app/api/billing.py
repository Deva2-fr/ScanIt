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
    Create a Stripe Checkout session
    """
    # MOCK/DEV MODE: Handle placeholder IDs without calling Stripe
    logger.info(f"Billing Checkout Request: {price_id} User: {user.email}")
    
    if price_id in ["price_pro_monthly", "price_agency_monthly", "free"]:
        logger.info(f"MOCK CHECKOUT: processing {price_id} for user {user.email}")
        
        # Ensure user is attached to this session
        user_db = session.get(User, user.id)
        if not user_db:
             raise HTTPException(status_code=404, detail="User not found")

        import uuid
        
        # Set plan based on ID
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
            # Simulate downgrade
            user_db.plan_tier = "starter"
            user_db.subscription_active = True
            # Keep customer ID but clear sub? Or keep mocked.
            
        session.add(user_db)
        session.commit()
        session.refresh(user_db)
        
        # Return success URL immediately
        origin = settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:3000"
        base_url = origin.rstrip("/")
        redirect_url = f"{base_url}/dashboard/subscription?checkout_success=true"
        logger.info(f"Redirecting to: {redirect_url}")
        return {"url": redirect_url}

    # Validation: Ensure price_id corresponds to a valid plan (Pro or Agency) based on config
    # For now, we trust the frontend sends the right ID, or we check against config
    if price_id not in [settings.stripe_price_id_pro, settings.stripe_price_id_agency]:
         # If not matching known IDs, warning (or loose check if config is empty)
         if settings.stripe_price_id_pro or settings.stripe_price_id_agency:
             pass # In strict mode we might reject
             
    success_url = f"{settings.cors_origins_list[0]}/dashboard?checkout_success=true"
    cancel_url = f"{settings.cors_origins_list[0]}/pricing?checkout_canceled=true"
    
    checkout_url = await stripe_service.create_checkout_session(user, price_id, success_url, cancel_url)
    
    # If we created a customer ID during this process, we should save it
    # The user object is attached to the session, so changes might be tracked
    # But stripe_service updates the object, we need to commit
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
    Stripe Webhook Handler
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = await stripe_service.construct_event(payload, sig_header)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Webhook Error: {e}")
        raise HTTPException(status_code=400, detail="Webhook Error")
        
    event_type = event["type"]
    data = event["data"]["object"]
    
    logger.info(f"Received Stripe event: {event_type}")
    
    if event_type == "checkout.session.completed":
        # Payment successful, subscription created
        user_id = data.get("client_reference_id") or data.get("metadata", {}).get("user_id")
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")
        
        if user_id:
            user = session_db.get(User, int(user_id))
            if user:
                user.stripe_customer_id = customer_id
                user.stripe_subscription_id = subscription_id
                user.subscription_active = True
                
                # Determine plan based on amount or product
                # This is tricky without fetching the product/price details
                # Or we can rely on what we sent in metadata if accessible
                # Simpler: If the price matches PRO or AGENCY
                # Need to fetch subscription to see items
                try:
                    # Retrieve full subscription to get price ID
                    # Or simpler, check the session line items if expanded? No.
                    # We'll assume the status is active and set a default or try to guess.
                    # Ideally, fetch the subscription from Stripe to be sure.
                    pass
                except:
                   pass
                   
                # Hardcoded logic fallback: Check price ID from config match?
                # We can't easily know which plan it is from just session completed without expanding line_items.
                # Let's assume the user becomes 'pro' by default if not 'agency'. 
                # Improving this: Fetch subscription
                sub = stripe.Subscription.retrieve(subscription_id)
                price_id = sub["items"]["data"][0]["price"]["id"]
                
                if price_id == settings.stripe_price_id_agency:
                    user.plan_tier = "agency"
                else:
                    user.plan_tier = "pro"
                
                session_db.add(user)
                session_db.commit()
                logger.info(f"User {user_id} upgraded to {user.plan_tier}")

    elif event_type == "customer.subscription.deleted":
        # Subscription canceled/expired
        subscription_id = data.get("id")
        statement = select(User).where(User.stripe_subscription_id == subscription_id)
        user = session_db.exec(statement).first()
        
        if user:
            user.subscription_active = False
            user.plan_tier = "starter"
            session_db.add(user)
            session_db.commit()
            logger.info(f"User {user.id} subscription canceled")
            
    elif event_type == "invoice.payment_succeeded":
        # Recurring payment successful
        # Update expiration date if we stored it
        pass
        
    elif event_type == "invoice.payment_failed":
        # Payment failed
        subscription_id = data.get("subscription")
        statement = select(User).where(User.stripe_subscription_id == subscription_id)
        user = session_db.exec(statement).first()
        if user:
             user.subscription_status = "past_due"
             session_db.add(user)
             session_db.commit()

    return {"status": "success"}
