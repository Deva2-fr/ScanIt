"""
User Routes
Endpoints for managing user profile and settings
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from ..database import get_session
from ..models.user import User, UserRead, UserUpdate, PasswordChange
from ..core.security import verify_password, get_password_hash
from ..deps import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.patch("/me", response_model=UserRead)
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update current user profile (email, name)
    """
    if user_update.email and user_update.email != current_user.email:
        # Check if new email is already taken
        statement = select(User).where(User.email == user_update.email)
        existing_user = session.exec(statement).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé par un autre compte."
            )
        current_user.email = user_update.email
        
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
        
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user


@router.post("/me/password", status_code=status.HTTP_200_OK)
async def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Change current user password
    """
    if not verify_password(password_change.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le mot de passe actuel est incorrect."
        )
        
    if len(password_change.new_password) < 8:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nouveau mot de passe doit faire au moins 8 caractères."
        )
        
    current_user.hashed_password = get_password_hash(password_change.new_password)
    
    session.add(current_user)
    session.commit()
    
    return {"message": "Mot de passe modifié avec succès"}
