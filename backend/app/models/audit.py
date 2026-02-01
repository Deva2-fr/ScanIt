"""
Audit Model - SQLModel ORM
Defines the Audit/Scan table structure for history
"""
from datetime import datetime
from typing import Optional, Any
from sqlmodel import Field, SQLModel, JSON

class Audit(SQLModel, table=True):
    """Audit model for storing scan history"""
    __tablename__ = "audits"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="users.id")
    url: str = Field(index=True)
    score: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Store a summary of the results (can be large)
    # Using JSON type for summary data
    summary: str = Field(default="{}", description="JSON string of the audit summary")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "url": "https://example.com",
                "score": 85,
                "created_at": "2026-01-31T15:30:00",
                "summary": "{...}"
            }
        }

class AuditCreate(SQLModel):
    """Schema for creating an audit"""
    url: str
    score: int
    summary: dict

class AuditRead(SQLModel):
    """Schema for reading audit data"""
    id: int
    user_id: int
    url: str
    score: int
    created_at: datetime
    summary: str
    
class AuditDetail(AuditRead):
    """Schema for reading detailed audit data"""
    pass
