from sqlmodel import create_engine, text
from app.config import get_settings

settings = get_settings()

def update_schema():
    print(f"Connecting to {settings.database_url}...")
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        conn.begin()
        try:
            # Check if table exists
            print("Checking monitors table...")
            # We just drop it to be safe and let SQLModel recreate it
            conn.execute(text("DROP TABLE IF EXISTS monitors CASCADE;"))
            print("Dropped monitors table.")
            conn.commit()
            print("Schema update triggered. Please restart backend to recreate table.")
        except Exception as e:
            print(f"Error: {e}")
            conn.rollback()

if __name__ == "__main__":
    update_schema()
