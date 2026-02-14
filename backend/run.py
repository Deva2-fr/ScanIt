import uvicorn
from app.core.config import get_settings

if __name__ == "__main__":
    settings = get_settings()
    print(f"DEBUG: Using DATABASE_URL={settings.database_url.split('@')[-1]}")
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )
