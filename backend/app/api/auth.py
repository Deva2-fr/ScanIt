"""
Authentication Routes
User registration and login endpoints
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from ..database import get_session
from ..models.user import User, UserCreate, UserLogin, UserRead, Token, EmailVerificationRequest, EmailResendRequest
from ..core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..core.email import send_verification_email
from ..deps import get_current_user
import random
import string

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    session: Session = Depends(get_session)
):
    """
    Register a new user
    
    - **email**: Valid email address (must be unique)
    - **password**: Minimum 8 characters
    - **full_name**: Optional full name
    
    Returns the created user (without password)
    """
    # Check if user already exists
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà enregistré."
        )
    
    # Create new user with hashed password
    hashed_password = get_password_hash(user_data.password)
    
    # Generate verification code (6 digits)
    verification_code = ''.join(random.choices(string.digits, k=6))
    
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_verified=False,
        verification_code=verification_code
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    # Send verification email
    await send_verification_email(new_user.email, verification_code)
    
    return new_user


@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(
    verification_data: EmailVerificationRequest,
    session: Session = Depends(get_session)
):
    """
    Verify user email with code
    """
    email = verification_data.email
    code = verification_data.code
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé."
        )
    
    if user.is_verified:
        return {"message": "Compte déjà vérifié."}
        
    if user.verification_code != code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code de vérification incorrect."
        )
        
    user.is_verified = True
    user.verification_code = None
    session.add(user)
    session.commit()
    
    return {"message": "Compte vérifié avec succès."}


@router.post("/resend-code", status_code=status.HTTP_200_OK)
async def resend_verification_code(
    request: EmailResendRequest,
    session: Session = Depends(get_session)
):
    """
    Resend verification code
    """
    email = request.email
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if not user:
        # Don't reveal if user exists
        return {"message": "Si l'email existe, un code a été envoyé."}
        
    if user.is_verified:
        return {"message": "Compte déjà vérifié."}
        
    # Generate new code
    verification_code = ''.join(random.choices(string.digits, k=6))
    user.verification_code = verification_code
    session.add(user)
    session.commit()
    
    # Send email
    await send_verification_email(user.email, verification_code)
    
    return {"message": "Code envoyé."}


@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    """
    Login endpoint (OAuth2 compatible)
    """
    # Get user by email (form_data.username is email in our case)
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Utilisateur inactif."
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email non vérifié. Veuillez vérifier votre email."
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.post("/login", response_model=Token)
async def login_json(
    user_login: UserLogin,
    session: Session = Depends(get_session)
):
    """
    Alternative login endpoint accepting JSON
    """
    # Get user by email
    statement = select(User).where(User.email == user_login.email)
    user = session.exec(statement).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Utilisateur inactif."
        )
        
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email non vérifié. Veuillez vérifier votre email."
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information
    """
    return current_user
