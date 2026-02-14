from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Lead(SQLModel, table=True):
    __tablename__ = "leads"

    id: Optional[int] = Field(default=None, primary_key=True)
    agency_id: int = Field(index=True) # ID of the agency User
    prospect_email: str
    prospect_url: str
    scan_score: int
    status: str = Field(default="new") # new, contacted, converted
    created_at: datetime = Field(default_factory=datetime.utcnow)
