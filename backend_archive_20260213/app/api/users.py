"""
User Routes
Endpoints for managing user profile and settings
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlmodel import Session, select
from pathlib import Path
import shutil
import time
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
    Update current user profile (email, name, branding)
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

    # Handle Branding Updates
    if user_update.agency_name is not None:
        current_user.agency_name = user_update.agency_name
    
    if user_update.brand_color is not None:
        current_user.brand_color = user_update.brand_color
        
    if user_update.logo_url is not None:
        current_user.logo_url = user_update.logo_url
        
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user


@router.post("/me/logo", response_model=UserRead)
async def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Upload agency logo
    """
    # Validation du type MIME
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(
            status_code=400, 
            detail="Format non supporté. Utilisez JPG, PNG ou WEBP."
        )

    # Création du dossier d'upload s'il n'existe pas
    upload_dir = Path("static/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Nom sécurisé ou UUID
    file_extension = file.filename.split('.')[-1]
    filename = f"logo_{current_user.id}_{int(time.time())}.{file_extension}"
    file_path = upload_dir / filename
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Mise à jour de l'URL du logo pour l'utilisateur
        # Note: L'URL dépendra de la configuration StaticFiles dans main.py
        # On suppose que "/static" est monté
        logo_url = f"http://localhost:8000/static/uploads/{filename}"
        current_user.logo_url = logo_url
        
        session.add(current_user)
        session.commit()
        session.refresh(current_user)
        
        return current_user
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")


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
