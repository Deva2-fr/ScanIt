"""
Technology Stack Detection Service
Fingerprints technologies used by the website
"""
import httpx
import re
from typing import Optional, Dict, Any, List, Set
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from ..config import get_settings
from ..models import TechStackResult, Technology, CompanyInfo, ContactInfo, SeverityLevel


from .wappalyzer_enhanced import EnhancedWappalyzer
from .cve_matcher import CVEMatcher
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

class TechStackAnalyzer:
    """Detects technologies and vulnerabilities used by a website"""
    
    def __init__(self):
        self.settings = get_settings()
        self.wappalyzer = EnhancedWappalyzer()
    
    async def analyze(self, url: str, html_content: Optional[str] = None, headers: Optional[Dict] = None) -> TechStackResult:
        """
        Detect technologies and scan for vulnerabilities
        """
        result = TechStackResult()
        
        try:
            target_html = ""
            target_headers = {}

            # Prepare content
            if html_content:
                target_html = html_content
                target_headers = headers or {}
            else:
                async with httpx.AsyncClient(
                    timeout=self.settings.request_timeout,
                    follow_redirects=True,
                    verify=False,
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
                ) as client:
                    response = await client.get(url)
                    target_html = response.text
                    target_headers = dict(response.headers)
            
            # 1. Enhanced Wappalyzer Detection
            # This handles detection + granular version extraction
            detected_raw = self.wappalyzer.analyze(url, target_html, target_headers)
            
            for item in detected_raw:
                version = item.get("version")
                tech_name = item.get("name")
                
                # Create Tech Object
                tech = Technology(
                    name=tech_name,
                    categories=item.get("categories", []),
                    version=version,
                    confidence=100,
                    website=item.get("website"),
                    icon=item.get("icon")
                )
                
                # 2. Vulnerability Scanning (Local CVE DB)
                if version:
                    # Check for CVEs
                    vulns = CVEMatcher.check_vulnerabilities(tech_name, version)
                    if vulns:
                        tech.vulnerabilities = vulns
                        tech.severity = SeverityLevel.HIGH # Default high if any vuln
                        # Find max severity
                        for v in vulns:
                            if v["severity"] == "CRITICAL":
                                tech.severity = SeverityLevel.CRITICAL
                            elif v["severity"] == "HIGH" and tech.severity != SeverityLevel.CRITICAL:
                                tech.severity = SeverityLevel.HIGH
                                
                        result.error = f"Vulnerabilities detected in {tech_name}" # Warning flag
                    
                    # Store vulns in some field if Technology model supported it
                    # (Assuming Technology model might need update, or we just flag outdated)
                    
                    # Check Outdated
                    outdated_info = CVEMatcher.check_outdated(tech_name, version)
                    if outdated_info["is_outdated"]:
                        tech.is_outdated = True
                        tech.latest_version = outdated_info["latest"]
                        if tech.severity == SeverityLevel.OK:
                            tech.severity = SeverityLevel.MEDIUM
                
                result.technologies.append(tech)
            
            # 3. Categorize (CMS, etc.)
            result = self._categorize_technologies(result)
            
            # Count outdated
            result.outdated_count = sum(1 for t in result.technologies if t.is_outdated)
            
            # 4. Calculate Score
            score = 100
            for tech in result.technologies:
                if tech.severity == SeverityLevel.CRITICAL:
                    score -= 40
                elif tech.severity == SeverityLevel.HIGH:
                    score -= 20
                elif tech.severity == SeverityLevel.MEDIUM:
                    score -= 10
                elif tech.is_outdated and tech.severity == SeverityLevel.OK:
                    score -= 5
            
            result.score = max(0, score)
                
        except Exception as e:
            logger.error(f"Tech detection failed: {e}")
            result.error = f"Technology detection error: {str(e)}"
        
        return result

    def _categorize_technologies(self, result: TechStackResult) -> TechStackResult:
        """Categorize detected technologies"""
        for tech in result.technologies:
            categories = tech.categories
            
            if "CMS" in categories or "Blogs" in categories:
                result.cms = tech.name
            
            if "JavaScript Framework" in categories or "Web Framework" in categories:
                 # Prioritize JS framework over CSS framework for the single 'framework' field
                if not result.framework:
                    result.framework = tech.name
            
            if "Web Server" in categories:
                result.server = tech.name
            
            if "Programming Language" in categories:
                result.programming_language = tech.name
            
            if "CDN" in categories:
                result.cdn = tech.name
            
            if "Analytics" in categories or "Tag Manager" in categories:
                result.analytics.append(tech.name)
        
        result.analytics = list(set(result.analytics))  # Deduplicate
        return result
