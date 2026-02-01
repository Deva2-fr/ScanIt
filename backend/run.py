"""
SiteAuditor Backend Entry Point
Run with: python run.py
"""
import uvicorn
import sys
import asyncio
from app.config import get_settings

# Enforce ProactorEventLoop on Windows for Playwright compatibility
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())


def main():
    """Start the FastAPI server"""
    settings = get_settings()
    
    print("=" * 50)
    print("   SiteAuditor Backend Server")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level="info" if settings.debug else "warning"
    )


if __name__ == "__main__":
    main()
