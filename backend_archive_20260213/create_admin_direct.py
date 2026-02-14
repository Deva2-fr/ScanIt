import sys
from sqlalchemy import create_engine, text
# import datetime
# from passlib.context import CryptContext

# Use 127.0.0.1 and psycopg2
DATABASE_URL = "postgresql://checksec_user:secure_password_checking_123!@127.0.0.1:5432/checksec_db"

def create_admin():
    print(f"Connecting to: {DATABASE_URL}")
    try:
        engine = create_engine(DATABASE_URL)
        
        # Hash password
        # pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        # hashed_pw = pwd_context.hash("Admin123!")
        hashed_pw = "$2b$12$hardcodedhashforadmin123xyz" # Dummy bcrypt hash
        
        with engine.connect() as conn:
            # Check if user exists
            result = conn.execute(text("SELECT email FROM users WHERE email = 'admin@example.com'"))
            if result.fetchone():
                print("User admin@example.com already exists.")
                return

            print("Creating user...")
            # Insert
            now = "2026-02-04 18:00:00" # datetime.datetime.utcnow()
            
            stmt = text("""
                INSERT INTO users (email, hashed_password, full_name, is_active, is_verified, is_superuser, created_at, brand_color)
                VALUES (:email, :pwd, :name, :active, :verified, :superuser, :created, :color)
            """)
            
            conn.execute(stmt, {
                "email": "admin@example.com",
                "pwd": hashed_pw,
                "name": "Admin User",
                "active": True,
                "verified": True,
                "superuser": True,
                "created": now,
                "color": "#7c3aed"
            })
            conn.commit()
            print("✅ Admin user created successfully!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_admin()
