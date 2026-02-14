import sys
from sqlalchemy import create_engine, text

# Hardcoded 127.0.0.1 based on docker port mapping
DATABASE_URL = "postgresql://checksec_user:secure_password_checking_123!@127.0.0.1:5432/checksec_db"

def test():
    print(f"Connecting to: {DATABASE_URL}")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("Connected! Executing SELECT 1...")
            result = conn.execute(text("SELECT 1"))
            print(f"Result: {result.scalar()}")
            
            # Now try to insert our user in this same script that we know works
            print("Step 2: Inserting user...")
            hashed_pw = "$2b$12$hardcodedhashforadmin123xyz"
            now = "2026-02-04 18:00:00"
            
            # Check exist
            try:
                r = conn.execute(text("SELECT email FROM users WHERE email = 'admin@example.com'"))
                if r.fetchone():
                    print("User exists.")
                    return
            except Exception as e:
                print(f"Select failed: {e}")
                # Maybe table doesn't exist?
                return

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
        print("❌ ERROR CAUGHT:")
        print(str(e))
        if hasattr(e, 'orig'):
            print("--- Original Error ---")
            print(str(e.orig))

if __name__ == "__main__":
    test()
