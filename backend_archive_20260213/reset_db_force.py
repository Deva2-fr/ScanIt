import os
import sys

# Add current dir to path to find app module
sys.path.append(os.getcwd())

from app.database import create_db_and_tables

def reset_db():
    print("--- FORCING DATABASE RESET ---")
    
    # Try to delete existing DB files
    db_files = ["siteauditor.db", "database.db"]
    for db in db_files:
        if os.path.exists(db):
            try:
                os.remove(db)
                print(f"[OK] Deleted {db}")
            except Exception as e:
                print(f"[ERROR] Could not delete {db}: {e}")
                print("!!! PLEASE STOP ALL PYTHON PROCESSES MANUALLY AND RETRY !!!")
                return

    print("Creating new tables...")
    try:
        create_db_and_tables()
        print("[SUCCESS] All tables created.")
    except Exception as e:
        print(f"[FATAL ERROR] Table creation failed: {e}")

if __name__ == "__main__":
    reset_db()
