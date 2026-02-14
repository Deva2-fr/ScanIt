from sqlalchemy import text
from app.database import engine

def migrate():
    print("Starting V2 migration...")
    with engine.connect() as conn:
        print("Adding subscription_end_date...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN subscription_end_date DATETIME"))
        except Exception as e:
            print(f"Skipped subscription_end_date (maybe exists): {e}")

        print("Adding scans_today...")
        try:
             conn.execute(text("ALTER TABLE users ADD COLUMN scans_today INTEGER DEFAULT 0"))
        except Exception as e:
            print(f"Skipped scans_today (maybe exists): {e}")
        
        print("Adding last_scan_date...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN last_scan_date DATE"))
        except Exception as e:
            print(f"Skipped last_scan_date (maybe exists): {e}")
        
        conn.commit()
        print("Migration V2 successful.")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"Migration failed: {e}")
