from datetime import datetime, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session

from app.database import get_session
from app.deps import get_current_user
from app.models.user import User

# Prefix matches the user's request: /billing
# Tags allow grouping in Swagger UI
router = APIRouter(prefix="/billing", tags=["Billing Mock"])

class UpgradeRequest(BaseModel):
    # Restrict to valid plans
    plan: Literal["pro", "agency"]

@router.post("/simulate-upgrade")
async def simulate_upgrade(
    request: UpgradeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Simmulate an instant upgrade to Pro or Agency plan.
    Sets plan_tier and extends subscription by 30 days.
    """
    import uuid
    current_user.plan_tier = request.plan
    current_user.subscription_active = True
    current_user.subscription_end_date = datetime.utcnow() + timedelta(days=30)
    
    # Set mock IDs so the Portal logic knows it's a fake user
    if not current_user.stripe_customer_id:
        current_user.stripe_customer_id = f"cus_mock_{current_user.id}"
    
    # Always update sub ID for new 'period'
    current_user.stripe_subscription_id = f"sub_mock_{uuid.uuid4().hex[:8]}"
    
    # Optional: Reset or update quotas if needed immediately, 
    # currently handled by FeatureGuard checks dynamically.
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {"message": f"Félicitations, vous êtes maintenant membre {request.plan.upper()} !"}

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Cancel subscription and downgrade to starter immediately.
    """
    current_user.plan_tier = "starter"
    current_user.subscription_active = False # Or True if we consider Starter as active 'free plan'? User said "always True". Lets put True for consistency with "always active"
    # But for "cancel", logic implies "no paid sub".
    # User said: "subscription_active: Boolean. Défaut : True (car c'est fictif, on considère que c'est toujours actif)."
    # If I set it to False, it might block access if there's a check `if not user.subscription_active: block`.
    # FeatureGuard assumes plan="starter" if default.
    # Let's keep it True or make it True.
    # But logically, "cancel" implies stopping the *paid* part.
    # If I set `subscription_active = True` always, the field is redundant? 
    # Maybe "subscription_active" is just "account is in good standing".
    # I'll enable it for starter too as per "Défaut: True".
    current_user.subscription_active = True
    current_user.subscription_end_date = None
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {"message": "Votre abonnement a été annulé. Vous êtes repassé au plan Starter."}
