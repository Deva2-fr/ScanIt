import sys
import traceback

print("Importing sqlmodel...")
try:
    import sqlmodel
    print("sqlmodel loaded")
except:
    traceback.print_exc()

print("Importing sqlalchemy...")
try:
    import sqlalchemy
    print("sqlalchemy loaded")
except:
    traceback.print_exc()

print("Importing app.config...")
try:
    import app.config
    print("app.config loaded")
except:
    traceback.print_exc()

print("Importing app.database...")
try:
    import app.database
    print("app.database loaded")
except:
    traceback.print_exc()

print("Importing app.models.user...")
try:
    import app.models.user
    print("app.models.user loaded")
except:
    traceback.print_exc()

print("Importing app.api.auth...")
try:
    import app.api.auth
    print("app.api.auth loaded")
except:
    traceback.print_exc()

print("Importing app.main...")
try:
    import app.main
    print("app.main loaded")
except:
    traceback.print_exc()
