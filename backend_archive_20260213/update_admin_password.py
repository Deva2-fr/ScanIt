import sys
from sqlalchemy import create_engine, text
from passlib.context import CryptContext

DATABASE_URL = "postgresql://checksec_user:secure_password_checking_123!@127.0.0.1:5432/checksec_db"

def update():
    print("Hashing password...")
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_pw = pwd_context.hash("Admin123!")
    
    print(f"Connecting to: {DATABASE_URL}")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            stmt = text("UPDATE users SET hashed_password = :pwd WHERE email = 'admin@example.com'")
            conn.execute(stmt, {"pwd": hashed_pw})
            conn.commit()
            print("✅ Admin password updated successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    update()
