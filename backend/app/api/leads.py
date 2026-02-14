from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.lead import Lead
from app.api.auth import get_current_user
from app.models.user import User
from app.core.permissions import FeatureGuard

router = APIRouter()

@router.get("/", response_model=List[Lead])
def read_leads(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Check Plan
    if not FeatureGuard.can_perform_action(current_user, "lead_widget"):
        raise HTTPException(status_code=403, detail="Feature locked. Upgrade to Agency plan.")

    leads = session.exec(select(Lead).where(Lead.agency_id == current_user.id).order_by(Lead.created_at.desc())).all()
    return leads
