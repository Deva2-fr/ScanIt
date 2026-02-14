import sys
import os
from sqlalchemy import create_engine
from sqlmodel import SQLModel

# Add current dir to path
sys.path.append(os.getcwd())

# Import models to register them
from app.models.user import User
# from app.models.audit import Audit # Import others if needed

DATABASE_URL = "postgresql://checksec_user:secure_password_checking_123!@127.0.0.1:5432/checksec_db"

def init_db():
    print(f"Connecting to: {DATABASE_URL}")
    try:
        # Use simple sqlalchemy create_engine
        engine = create_engine(DATABASE_URL)
        
        print("Creating tables...")
        SQLModel.metadata.create_all(engine)
        print("✅ Tables created.")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    init_db()
