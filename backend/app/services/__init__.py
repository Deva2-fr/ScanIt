"""
Services for SiteAuditor
"""
from .seo import SEOAnalyzer
from .security import SecurityAnalyzer
from .tech import TechStackAnalyzer
from .links import BrokenLinksAnalyzer
from .gdpr import GDPRAnalyzer
from .smo import SMOAnalyzer
from .green_it import GreenITAnalyzer
from .dns_health import DNSAnalyzer

__all__ = [
    "SEOAnalyzer",
    "SecurityAnalyzer",
    "TechStackAnalyzer",
    "BrokenLinksAnalyzer",
    "GDPRAnalyzer",
    "SMOAnalyzer",
    "GreenITAnalyzer",
    "DNSAnalyzer"
]
