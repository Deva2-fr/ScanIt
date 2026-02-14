"""
Database Configuration and Session Management
SQLModel/SQLAlchemy setup with SQLite
"""
from sqlmodel import SQLModel, Session, create_engine
from typing import Generator
import os
from pathlib import Path
from .config import get_settings

# Get settings
settings = get_settings()

# Handle Database URL
# The .env might have "postgresql+asyncpg://..." for async context.
# For synchronous engine, we need "postgresql://" or "postgresql+psycopg2://"
DATABASE_URL = settings.database_url

if DATABASE_URL.startswith("postgresql+asyncpg"):
    # Convert to sync driver for standard requests
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql")

# Create engine
# connect_args is empty for Postgres, strictly only for SQLite if needed
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args=connect_args
)
print(f"DEBUG DB: Engine created with URL: {DATABASE_URL}")


def _migrate_users_columns():
    if "sqlite" in DATABASE_URL:
        return
    from sqlalchemy import text
    columns_sql = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT TRUE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS scans_count_today INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_scan_date DATE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_tier VARCHAR DEFAULT 'starter'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_name VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_color VARCHAR DEFAULT '#7c3aed'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_url VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP",
    ]
    with engine.begin() as conn:
        for stmt in columns_sql:
            try:
                conn.execute(text(stmt))
            except Exception as e:
                if "already exists" not in str(e).lower() and "duplicate" not in str(e).lower():
                    print(f"[!] Migration: {e}")


def _migrate_monitors_columns():
    if "sqlite" in DATABASE_URL:
        return
    from sqlalchemy import text
    columns_sql = [
        "ALTER TABLE monitors ADD COLUMN IF NOT EXISTS check_hour INTEGER DEFAULT 9",
        "ALTER TABLE monitors ADD COLUMN IF NOT EXISTS check_day INTEGER",
        "ALTER TABLE monitors ADD COLUMN IF NOT EXISTS last_screenshot_path VARCHAR",
    ]
    with engine.begin() as conn:
        for stmt in columns_sql:
            try:
                conn.execute(text(stmt))
            except Exception as e:
                if "already exists" not in str(e).lower() and "duplicate" not in str(e).lower():
                    print(f"[!] Migration monitors: {e}")


def create_db_and_tables():
    from .models.user import User
    from .models.audit import Audit
    from .models.monitor import Monitor
    from .models.api_key import ApiKey
    from .models.lead import Lead
    from .models.task import ScanTask
    SQLModel.metadata.create_all(engine)
    _migrate_users_columns()
    _migrate_monitors_columns()
    print(f"[+] Database initialized with URL: {DATABASE_URL}")


def get_session() -> Generator[Session, None, None]:
    """
    Dependency to get DB session
    Usage in FastAPI routes:
        session: Session = Depends(get_session)
    """
    with Session(engine) as session:
        yield session
