"""
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  WARNING: THIS SCRIPT DROPS ALL TABLES AND RECREATES THEM  ║
║                                                                  ║
║  ALL DATA WILL BE PERMANENTLY LOST.                              ║
║                                                                  ║
║  DO NOT RUN IN PRODUCTION.                                       ║
║                                                                  ║
║  Use Alembic migrations instead:                                 ║
║    alembic upgrade head                                          ║
║    alembic revision --autogenerate -m "description"              ║
║                                                                  ║
║  See MIGRATION_GUIDE.md for details.                             ║
╚══════════════════════════════════════════════════════════════════╝
"""
import os
import sys

# ── PRODUCTION GUARD ──
# Block execution if ENV is set to production
env = os.getenv("ENV", "development").lower()
debug = os.getenv("DEBUG", "false").lower()

if env == "production" or debug == "false":
    print("=" * 60)
    print("  ❌ BLOCKED: reset_db.py cannot run in production mode.")
    print(f"     ENV={env}, DEBUG={debug}")
    print("")
    print("  Use Alembic instead:")
    print("    python -m alembic upgrade head")
    print("=" * 60)
    sys.exit(1)

print("⚠️  WARNING: This will DROP ALL TABLES and recreate them.")
print("   All data will be permanently lost.")
confirm = input("   Type 'YES' to confirm: ")
if confirm != "YES":
    print("Aborted.")
    sys.exit(0)

from sqlmodel import SQLModel, create_engine, text
from app.core.config import get_settings
from app.models.user import User
from app.models.audit import Audit

settings = get_settings()
DATABASE_URL = settings.database_url
if DATABASE_URL.startswith("postgresql+asyncpg"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql")

engine = create_engine(DATABASE_URL, echo=True)

def reset_db():
    print("Dropping all tables with CASCADE...")
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS monitors CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS audits CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE;"))
        conn.commit()
    
    print("Creating all tables...")
    from app.models.user import User
    from app.models.audit import Audit
    from app.models.monitor import Monitor
    SQLModel.metadata.create_all(engine)
    print("Database reset complete.")

if __name__ == "__main__":
    reset_db()
