from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from ..database import get_session
from ..models.user import User
from ..deps import get_current_active_user
from ..config import get_settings
import logging
import uuid
import uuid

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/billing/mock", tags=["billing-mock"])
settings = get_settings()

@router.post("/checkout")
async def create_mock_checkout_session(
    price_id: str,
    user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Mock Checkout Session (DEV ONLY).
    Directly upgrades the user without Stripe interaction.
    """
    if not settings.debug:
         raise HTTPException(
            status_code=403,
            detail="Mock checkout is disabled."
        )

    logger.info(f"[DEV] MOCK CHECKOUT: processing {price_id} for user {user.email}")
    
    mock_price_ids = {"price_pro_monthly", "price_agency_monthly", "free", "starter"}
    if price_id not in mock_price_ids:
         raise HTTPException(status_code=400, detail=f"Invalid mock price_id: {price_id}")

    user_db = session.get(User, user.id)
    if not user_db:
            raise HTTPException(status_code=404, detail="User not found")

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
    elif price_id in ("starter", "free"):
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

@router.post("/portal")
async def create_mock_portal_session(
    user: User = Depends(get_current_active_user)
):
    """
    Mock Portal Session (DEV ONLY).
    """
    if not settings.debug:
         raise HTTPException(status_code=403, detail="Mock portal disabled")

    base_url = settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:3000"
    return {"url": f"{base_url}/dashboard?portal_mock=true"}
