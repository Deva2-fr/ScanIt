"""
Monitor Model - SQLModel ORM
Defines the Monitor table for the Watchdog feature
"""
from datetime import datetime
from typing import Optional
from enum import Enum
from sqlmodel import Field, SQLModel

class Frequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"

class Monitor(SQLModel, table=True):
    """Monitor model for persistent URL watching"""
    __tablename__ = "monitors"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="users.id")
    url: str = Field(max_length=2048)
    frequency: Frequency = Field(default=Frequency.DAILY)
    is_active: bool = Field(default=True)
    last_score: Optional[int] = Field(default=None)
    # Alert logic: We alert if score DROPS by this amount
    alert_threshold: int = Field(default=10, description="Score drop required to trigger alert")
    # New: Preferred hour for the check (UTC)
    check_hour: int = Field(default=9, ge=0, le=23, description="Hour of day to run check (0-23 UTC)")
    # New: Preferred day for weekly checks (0=Monday ... 6=Sunday). None = Daily/Any
    check_day: Optional[int] = Field(default=None, ge=0, le=6, description="Day of week (0=Mon, 6=Sun)")
    
    # Store path to the last screenshot for comparison
    last_screenshot_path: Optional[str] = Field(default=None, description="Relative path to last screenshot")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_checked_at: Optional[datetime] = Field(default=None)

    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://example.com",
                "frequency": "daily",
                "alert_threshold": 10
            }
        }

class MonitorCreate(SQLModel):
    """Schema for creating a new monitor"""
    url: str = Field(max_length=2048)
    frequency: Frequency = Field(default=Frequency.DAILY)
    alert_threshold: int = Field(default=10, ge=1, le=100)
    check_hour: int = Field(default=9, ge=0, le=23)
    check_day: Optional[int] = Field(default=None, ge=0, le=6)

class MonitorRead(SQLModel):
    """Schema for reading monitor data"""
    id: int
    user_id: int
    url: str
    frequency: Frequency
    is_active: bool
    last_score: Optional[int]
    alert_threshold: int
    check_hour: int
    check_day: Optional[int]
    last_screenshot_path: Optional[str]
    created_at: datetime
    last_checked_at: Optional[datetime]

class MonitorUpdate(SQLModel):
    """Schema for updating monitor"""
    is_active: Optional[bool] = None
    frequency: Optional[Frequency] = None
    alert_threshold: Optional[int] = None
    check_hour: Optional[int] = None
    check_day: Optional[int] = None
