from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlmodel import Session
from app.db.session import get_session
from app.models.user import User, UserRead, UserUpdate
from app.deps import get_current_user
import shutil
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])

@router.patch("/me", response_model=UserRead)
async def update_user_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if user_data.agency_name is not None:
        current_user.agency_name = user_data.agency_name
    if user_data.brand_color is not None:
        current_user.brand_color = user_data.brand_color
    if user_data.email is not None:
         # Optional: validate email uniqueness if changed
         current_user.email = user_data.email
    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name
    
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
    # Ensure directory exists
    # If running from root d:\Entreprise\Deva2\Check_securite\backend
    UPLOAD_DIR = Path("static/uploads")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    if file_extension.lower() not in ['.png', '.jpg', '.jpeg', '.webp']:
         raise HTTPException(status_code=400, detail="Invalid file type. Only PNG, JPG, WEBP are allowed.")
         
    filename = f"user_{current_user.id}_logo{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    # Remove old logo if exists? 
    # (Optional, but good practice to clean up)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save logo: {e}")
        raise HTTPException(status_code=500, detail="Could not save file")
        
    # Update user logo_url
    # Accessible via /api/static/uploads/...
    current_user.logo_url = f"/api/static/uploads/{filename}" 
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user
