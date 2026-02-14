import sys
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://checksec_user:secure_password_checking_123!@127.0.0.1:5432/checksec_db"

def drop():
    print(f"Connecting to: {DATABASE_URL}")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("Dropping users table...")
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            conn.commit()
            print("✅ Users table dropped.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    drop()
