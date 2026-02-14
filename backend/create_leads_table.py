from app.db.session import engine
from sqlmodel import SQLModel
from app.models.user import User
from app.models.lead import Lead

def fix():
    print("Creating tables (idempotent)...")
    SQLModel.metadata.create_all(engine)
    print("Done.")

if __name__ == "__main__":
    fix()
