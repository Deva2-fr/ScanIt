from sqlmodel import Session, select
from app.database import engine
from app.models.user import User

def list_users():
    print(f"{'ID':<4} | {'Email':<30} | {'Plan':<10} | {'Active?':<8} | {'Scans Today'}")
    print("-" * 80)
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        for user in users:
            print(f"{user.id:<4} | {user.email:<30} | {user.plan_tier:<10} | {str(user.subscription_active):<8} | {user.scans_count_today}")

if __name__ == "__main__":
    try:
        list_users()
    except Exception as e:
        print(f"Erreur de lecture: {e}")
