"""
API Dependencies
Authentication and common dependencies
"""
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from .database import get_session
from .models.user import User, TokenData
from .core.security import decode_access_token

# OAuth2 scheme for token authentication
# tokenUrl should match the login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    """
    Get current authenticated user from JWT token
    
    Args:
        token: JWT token from Authorization header
        session: Database session
        
    Returns:
        User object if authenticated
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token
    email = decode_access_token(token)
    if email is None:
        raise credentials_exception
    
    # Get user from database
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure user is active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure user is superuser (admin)
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user


async def requires_pro_plan(user: User = Depends(get_current_active_user)) -> User:
    """Check if user has Pro plan or higher"""
    allowed_tiers = ["pro", "agency"]
    if user.plan_tier not in allowed_tiers and not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires a Pro subscription."
        )
    return user


async def requires_agency_plan(user: User = Depends(get_current_active_user)) -> User:
    """Check if user has Agency plan"""
    allowed_tiers = ["agency"]
    if user.plan_tier not in allowed_tiers and not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires an Agency subscription."
        )
    return user


def require_feature(feature_name: str):
    """Dependency factory: require a specific feature for the user's plan."""
    async def _require_feature(user: User = Depends(get_current_active_user)) -> User:
        from .core.permissions import FeatureGuard
        if not FeatureGuard.can_perform_action(user, feature_name) and not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature is not included in your plan."
            )
        return user
    return _require_feature
