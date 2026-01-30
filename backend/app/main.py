"""
SiteAuditor Backend - FastAPI Application
Main entry point for the API server
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
import time
import sys
import asyncio

# Enforce ProactorEventLoop on Windows for Playwright compatibility
# Crucial for reloader subprocesses where run.py might not be the entry point
if sys.platform == "win32":
    try:
        if isinstance(asyncio.get_event_loop_policy(), asyncio.WindowsSelectorEventLoopPolicy):
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except ImportError:
        pass

from .config import get_settings
from .api import analyze_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# Application lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown"""
    # Startup
    print("🚀 SiteAuditor Backend starting...")
    settings = get_settings()
    print(f"📍 Running on http://{settings.api_host}:{settings.api_port}")
    print(f"🔧 Debug mode: {settings.debug}")
    
    yield
    
    # Shutdown
    print("👋 SiteAuditor Backend shutting down...")


# Create FastAPI application
app = FastAPI(
    title="SiteAuditor API",
    description="""
    ## 🔍 SiteAuditor - Website Audit API
    
    A comprehensive website analysis tool that provides:
    
    - **SEO Analysis**: Lighthouse scores, Core Web Vitals, meta tags
    - **Security Analysis**: HTTP headers, SSL/TLS, exposed files
    - **Technology Detection**: CMS, frameworks, libraries, servers
    - **Broken Links Check**: Internal and external link validation
    
    ### Usage
    
    Send a POST request to `/api/analyze` with a JSON body:
    ```json
    {"url": "https://example.com"}
    ```
    
    ### Rate Limits
    
    - 10 requests per minute per IP
    - Analysis may take 30-60 seconds depending on the target site
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)


# CORS Configuration
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    """Add response timing header"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time, 3))
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )


# Include API routes
app.include_router(analyze_router)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API info"""
    return {
        "name": "SiteAuditor API",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/api/health"
    }


# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="SiteAuditor API",
        version="1.0.0",
        description="Website audit and analysis API",
        routes=app.routes,
    )
    
    # Add custom logo/branding
    openapi_schema["info"]["x-logo"] = {
        "url": "https://example.com/logo.png"
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


# Entry point for running with uvicorn
if __name__ == "__main__":
    import uvicorn
    
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )
