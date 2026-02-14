from sqlalchemy import text
from app.database import engine

def migrate():
    print("Starting migration...")
    with engine.connect() as conn:
        # Transactions are handled via commit()
        print("Adding stripe_customer_id...")
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR"))
        
        print("Adding stripe_subscription_id...")
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR"))
        
        print("Adding plan_tier...")
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_tier VARCHAR DEFAULT 'free'"))
        
        print("Adding subscription_status...")
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR DEFAULT 'active'"))
        
        # Index creation
        print("Creating index...")
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_users_stripe_customer_id ON users (stripe_customer_id)"))
        
        conn.commit()
        print("Migration successful: Added Stripe columns to users table.")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"Migration failed: {e}")
