# ── Standard Library ──
import logging
from typing import Any

# ── Third-Party ──
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

# ── Local ──
from app.db.session import get_session
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserCreate, UserRead, Token, UserLogin
from app.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserRead, status_code=201)
def register(user_in: UserCreate, session: Session = Depends(get_session)) -> Any:
    user = session.exec(select(User).where(User.email == user_in.email)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user = User(**user_in.model_dump(exclude={"password"}))
    user.hashed_password = get_password_hash(user_in.password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(form_data: UserLogin, session: Session = Depends(get_session)) -> Any:
    user = session.exec(select(User).where(User.email == form_data.email)).first()
    if not user:
        logger.debug("Login failed: invalid credentials")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not verify_password(form_data.password, user.hashed_password):
        logger.debug("Login failed: invalid credentials")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/access-token", response_model=Token)
def login_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)) -> Any:
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user
