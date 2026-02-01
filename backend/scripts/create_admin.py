"""
Create Admin Script
Utilities to create a superuser from command line
"""
import sys
import os
from getpass import getpass

# Add backend directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from app.database import engine
from app.models.user import User
from app.core.security import get_password_hash

def create_admin():
    print("--- Create Superuser ---")
    email = input("Email: ")
    password = getpass("Password: ")
    full_name = input("Full Name (optional): ")
    
    with Session(engine) as session:
        # Check if user exists
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        
        if user:
            print(f"User {email} already exists.")
            make_admin = input("Do you want to promote this user to admin? (y/n): ")
            if make_admin.lower() == 'y':
                user.is_superuser = True
                user.is_active = True
                user.is_verified = True
                session.add(user)
                session.commit()
                print(f"User {email} is now an admin.")
            else:
                print("Operation cancelled.")
        else:
            hashed_password = get_password_hash(password)
            new_user = User(
                email=email,
                hashed_password=hashed_password,
                full_name=full_name,
                is_active=True,
                is_verified=True,
                is_superuser=True
            )
            session.add(new_user)
            session.commit()
            print(f"Superuser {email} created successfully.")

if __name__ == "__main__":
    create_admin()
