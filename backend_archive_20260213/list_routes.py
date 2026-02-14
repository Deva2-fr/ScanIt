import sys
import os

# Add current dir to path
sys.path.append(os.getcwd())

from app.main import app

print("--- REGISTERED ROUTES ---")
for route in app.routes:
    methods = getattr(route, "methods", None)
    path = getattr(route, "path", None)
    if methods and path:
        print(f"{methods} {path}")
