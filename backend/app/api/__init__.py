"""
API Routes for SiteAuditor
"""
from .analyze import router as analyze_router

__all__ = ["analyze_router"]
