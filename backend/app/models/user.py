"""
User Model - SQLModel ORM
Defines the User table structure for authentication
"""
from datetime import datetime, date
from typing import Optional
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    verification_code: Optional[str] = Field(default=None, max_length=6)
    is_superuser: bool = Field(default=False)
    
    # White Label Branding
    agency_name: Optional[str] = Field(default=None, max_length=255)
    brand_color: str = Field(default="#7c3aed", max_length=7)  # Default violet
    logo_url: Optional[str] = Field(default=None, max_length=512)

    # Billing / Mock System
    stripe_customer_id: Optional[str] = Field(default=None, index=True)
    stripe_subscription_id: Optional[str] = Field(default=None)
    plan_tier: str = Field(default="starter") # starter, pro, agency
    subscription_active: bool = Field(default=True)
    subscription_status: str = Field(default="active")  # active, past_due, canceled, trialing
    subscription_end_date: Optional[datetime] = Field(default=None)
    scans_count_today: int = Field(default=0)
    last_scan_date: Optional[date] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None, sa_column_kwargs={"onupdate": datetime.utcnow})
    
    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
                "is_active": True,
                "is_superuser": False,
                "agency_name": "My Agency",
                "brand_color": "#ff0000"
            }
        }


class UserCreate(SQLModel):
    """Schema for creating a new user"""
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=100)
    full_name: Optional[str] = Field(default=None, max_length=255)
    agency_name: Optional[str] = Field(default=None, max_length=255)
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "strongPassword123!",
                "full_name": "John Doe"
            }
        }


class EmailVerificationRequest(SQLModel):
    """Schema for verifying email"""
    email: str
    code: str

class EmailResendRequest(SQLModel):
    """Schema for resending verification email"""
    email: str

class UserLogin(SQLModel):
    """Schema for user login"""
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "strongPassword123!"
            }
        }


class UserRead(SQLModel):
    """Schema for reading user data (without password)"""
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    is_superuser: bool
    
    # White Label
    agency_name: Optional[str]
    brand_color: str
    logo_url: Optional[str]

    # Billing
    plan_tier: str = "starter"
    subscription_active: bool = True
    subscription_status: str = "active"
    subscription_end_date: Optional[datetime] = None
    scans_count_today: int = 0
    last_scan_date: Optional[date] = None

    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "full_name": "John Doe",
                "is_active": True,
                "created_at": "2026-01-31T15:00:00",
                "brand_color": "#7c3aed"
            }
        }


class UserUpdate(SQLModel):
    """Schema for updating user profile"""
    email: Optional[str] = Field(default=None, min_length=3, max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)
    agency_name: Optional[str] = Field(default=None, max_length=255)
    brand_color: Optional[str] = Field(default=None, max_length=7)
    logo_url: Optional[str] = Field(default=None, max_length=512)


class PasswordChange(SQLModel):
    """Schema for changing password"""
    current_password: str
    new_password: str = Field(min_length=8, max_length=100)


class Token(SQLModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }


class TokenData(SQLModel):
    """Schema for token data payload"""
    email: Optional[str] = None
