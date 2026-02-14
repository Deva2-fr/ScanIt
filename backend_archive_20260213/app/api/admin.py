"""
Admin Routes
Endpoints for administrative tasks and dashboard
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlmodel import Session, select, func, desc
from ..database import get_session
from ..models.user import User, UserRead
from ..models.audit import Audit, AuditRead
from ..deps import get_current_superuser

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class AdminStats(UserRead):
    scan_count: int = 0


class AdminAuditRead(AuditRead):
    user_email: str


class DashboardStats(UserRead):
    total_users: int
    total_scans: int
    average_score: float


@router.get("/users", response_model=List[AdminStats])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_superuser),
    session: Session = Depends(get_session)
):
    """
    Get all users (Admin only)
    """
    # Create a query that joins User and Audit to count scans
    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()
    
    admin_users = []
    for user in users:
        # Count scans for each user
        # Note: In a larger DB, this N+1 query should be optimized with a join
        scan_count = session.exec(select(func.count(Audit.id)).where(Audit.user_id == user.id)).one()
        
        # Convert to AdminStats
        user_dict = user.model_dump()
        user_dict["scan_count"] = scan_count
        admin_users.append(user_dict)
        
    return admin_users


@router.get("/scans", response_model=List[AdminAuditRead])
async def read_scans(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_superuser),
    session: Session = Depends(get_session)
):
    """
    Get all scans (Admin only)
    """
    statement = select(Audit, User.email).join(User).order_by(desc(Audit.created_at)).offset(skip).limit(limit)
    results = session.exec(statement).all()
    
    admin_scans = []
    for audit, email in results:
        audit_dict = audit.model_dump()
        audit_dict["user_email"] = email
        admin_scans.append(audit_dict)
        
    return admin_scans


@router.get("/stats")
async def read_stats(
    current_user: User = Depends(get_current_superuser),
    session: Session = Depends(get_session)
):
    """
    Get global platform stats (Admin only)
    """
    total_users = session.exec(select(func.count(User.id))).one()
    total_scans = session.exec(select(func.count(Audit.id))).one()
    
    # Calculate average score (handle case with 0 scans)
    avg_score_result = session.exec(select(func.avg(Audit.score))).one()
    average_score = round(avg_score_result, 1) if avg_score_result is not None else 0
    
    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "average_score": average_score
    }

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_superuser),
    session: Session = Depends(get_session)
):
    """
    Delete a user (Admin only)
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account"
        )

    # Delete related audits first (manual cascade since we don't know DB config)
    statement = select(Audit).where(Audit.user_id == user_id)
    user_audits = session.exec(statement).all()
    for audit in user_audits:
        session.delete(audit)
        
    session.delete(user)
    session.commit()
    
    return None
