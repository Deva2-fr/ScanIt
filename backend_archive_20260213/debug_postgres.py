import sys
import os
from sqlmodel import Session, select, create_engine, SQLModel, text

# Force usage of the Postgres URL directly to test
DATABASE_URL = "postgresql://checksec_user:secure_password_checking_123!@127.0.0.1:5432/checksec_db"

def test_postgres():
    print(f"Testing connection to: {DATABASE_URL}")
    try:
        import psycopg2
        print(f"Psycopg2 version: {psycopg2.__version__}")
    except ImportError:
        print("❌ psycopg2 not installed!")
        return

    try:
        engine = create_engine(DATABASE_URL)
        print("Engine created. Connecting...")
        with engine.connect() as conn:
            print("Connection acquired. Executing query...")
            result = conn.execute(text("SELECT 1"))
            print("✅ Connection successful!")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    # Try to import models to ensure we can create tables
    try:
        # Add backend to path
        sys.path.append(os.getcwd())
        from app.models.user import User
        
        # Create tables
        print("Ensuring tables exist...")
        SQLModel.metadata.create_all(engine)
        print("✅ Tables initialized")
        
        # Check/Create User
        with Session(engine) as session:
            email = "admin@example.com"
            statement = select(User).where(User.email == email)
            user = session.exec(statement).first()
            
            if user:
                print(f"✅ User {email} already exists.")
                # Reset password to be sure? No, just notify.
            else:
                print(f"Creating user {email}...")
                from app.core.security import get_password_hash
                user = User(
                    email=email,
                    hashed_password=get_password_hash("password"),
                    full_name="Admin PostgreSQL",
                    is_active=True,
                    is_verified=True,
                    is_superuser=True
                )
                session.add(user)
                session.commit()
                print(f"✅ User created! Login: {email} / password")
                
    except Exception as e:
        print(f"❌ Model/Data error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_postgres()
