"""
API Routes for SiteAuditor
"""
from .analyze import router as analyze_router
from .users import router as users_router
from .admin import router as admin_router

__all__ = ["analyze_router", "users_router", "admin_router"]
