"""
GDPR Compliance Analyzer using Playwright
Checks for cookies deposited before consent and detects CMP.
"""
import logging
import asyncio
from typing import List, Optional
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
from ..models import GDPRResult, CookieItem, SeverityLevel
from ..config import get_settings

class GDPRAnalyzer:
    """Analyzes GDPR compliance by efficiently scanning cookies and consent banners"""
    
    # Known tracker domains/subdomains (partial list)
    TRACKER_DOMAINS = [
        "google-analytics.com", "doubleclick.net", "facebook.com", 
        "googleadservices.com", "googletagmanager.com", "hotjar.com",
        "criteo.com", "outbrain.com", "taboola.com", "twitter.com",
        "linkedin.com", "bing.com", "tiktok.com", "snapchat.com",
        "adsrvr.org", "adnxs.com", "smartadserver.com", "yandex.ru"
    ]
    
    # Known marketing/tracking cookie names (prefixes/exact)
    TRACKING_COOKIES = [
        "_ga", "_gid", "_fbp", "fr", "_uetsid", "_uetvid", 
        "ads", "sc_is_visitor_unique", "_hjid", "IDE", "test_cookie",
        "datr", "sb", "c_user", "xs"
    ]
    
    # Known CMPs (Consent Management Platforms) identifiers in DOM
    CMP_SIGNATURES = {
        "Didomi": ["#didomi-host", ".didomi-popup", "#didomi-notice"],
        "OneTrust": ["#onetrust-banner-sdk", ".ot-sdk-container", "#onetrust-consent-sdk"],
        "Cookiebot": ["#CybotCookiebotDialog", "script[id='Cookiebot']", "#CookiebotSession"],
        "Axeptio": ["#axeptio-overlay", ".axeptio_mount_node", "script[src*='axeptio']"],
        "Tarteaucitron": ["#tarteaucitronRoot", "#tarteaucitronAlertBig"],
        "Quantcast": [".qc-cmp2-container", ".qc-cmp-ui-container"],
        "Borlabs": ["#borlabs-cookie", ".borlabs-cookie-container"],
        "Complianz": [".cmplz-cookiebanner", "#cmplz-cookiebanner-container"],
        "Sirdata": ["#sd-cmp", ".sd-cmp"],
        "TrustCommander": ["#trust_commander", ".tc_privacy_container"]
    }

    def __init__(self):
        self.settings = get_settings()
        self.logger = logging.getLogger(__name__)

    async def analyze(self, url: str) -> GDPRResult:
        """Run GDPR analysis asynchronously by offloading sync Playwright to a thread"""
        return await asyncio.to_thread(self._analyze_sync, url)

    def _analyze_sync(self, url: str) -> GDPRResult:
        """Synchronous implementation of GDPR analysis using sync Playwright"""
        result = GDPRResult()
        
        try:
            self.logger.info(f"Starting GDPR analysis (Sync) for {url}")
            with sync_playwright() as p:
                # Launch browser (headless)
                browser = p.chromium.launch(headless=True)
                
                # New incognito context with generic user agent
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 GDPR-Scanner/1.0"
                )
                
                page = context.new_page()
                
                # Passive navigation
                try:
                    page.goto(url, wait_until="domcontentloaded", timeout=20000)
                except Exception as e:
                    self.logger.warning(f"GDPR navigation warning: {e}")
                    # Continue anyway to check cookies
                
                # Wait 5 seconds passively for trackers to fire
                page.wait_for_timeout(5000)
                
                # Extract Cookies
                cookies = context.cookies()
                
                # Detect CMP
                cmp_detected = None
                
                # Quick check logic for CMPs
                for cmp_name, selectors in self.CMP_SIGNATURES.items():
                    for selector in selectors:
                        try:
                            # Use simple count, fast
                            count = page.locator(selector).count()
                            if count > 0:
                                cmp_detected = cmp_name
                                break
                        except:
                            continue
                    if cmp_detected:
                        break
                
                result.cmp_detected = cmp_detected
                
                # Analyze Cookies
                domain_parsed = urlparse(url).netloc
                # Normalize domain (remove port, www)
                domain_clean = domain_parsed.split(':')[0]
                if domain_clean.startswith("www."):
                    domain_clean = domain_clean[4:]
                
                compliance_score = 100
                violation_count = 0
                
                for c in cookies:
                    item = self._analyze_cookie(c, domain_clean)
                    result.cookies.append(item)
                    
                    if not item.is_compliant:
                        violation_count += 1
                        compliance_score -= 20 # Deduct score per violation
                
                result.violation_count = violation_count
                result.score = max(0, compliance_score)
                result.compliant = (violation_count == 0)
                
                # Privacy Policy Detection (Enhanced & Strict)
                try:
                    found_url = None
                    
                    # 1. Priority: URL-based detection (High confidence)
                    # Look for standard limits in URLs
                    url_keywords = [
                        "confidentialite", "privacy", "rgpd", "gdpr", 
                        "donnees-personnelles", "mentions-legales", "legal-notice"
                    ]
                    
                    for keyword in url_keywords:
                        try:
                            # Case insensitive attribute selector
                            # Note: CSS selectors are case-insensitive for attribute values in HTML usually, but safely use contains
                            matches = page.locator(f"a[href*='{keyword}' i]").all() # 'i' modifier for CSS4? Playwright supports strict selectors. 
                            # Simplest: a[href*='keyword']
                            matches = page.locator(f"a[href*='{keyword}']").all()
                            
                            if matches:
                                found_url = matches[0].get_attribute("href")
                                break
                        except:
                            continue

                    # 2. Secondary: Strict Text detection (if URL failed)
                    if not found_url:
                        text_keywords = [
                            "politique de confidentialité", "privacy policy", 
                            "mentions légales", "legal notice",
                            "données personnelles", "personal data",
                            "charte de confidentialité", "vie privée",
                            "protection des données"
                        ]
                        import re
                        pattern = re.compile(f"({'|'.join(text_keywords)})", re.IGNORECASE)
                        
                        # Get all links matching text
                        candidates = page.locator("a").filter(has_text=pattern).all()
                        
                        for link in candidates:
                            try:
                                txt = link.text_content()
                                if not txt: continue
                                txt_clean = txt.strip().lower()
                                
                                # Filter out "random" links like "Base de données" by checking length
                                # Policy links are usually short: "Politique de confidentialité"
                                if len(txt_clean) < 60:
                                    found_url = link.get_attribute("href")
                                    if found_url: break
                            except:
                                continue

                    if found_url:
                        result.privacy_policy_detected = True
                        if not found_url.startswith(("http", "//")):
                             from urllib.parse import urljoin
                             found_url = urljoin(url, found_url)
                        result.privacy_policy_url = found_url
                    else:
                        result.privacy_policy_detected = False
                        
                except Exception as e:
                    self.logger.warning(f"Privacy policy checks failed: {e}")

                browser.close()
                
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            self.logger.error(f"GDPR Analysis failed: {repr(e)}")
            self.logger.error(tb)
            
            # Set compliance to False on error to avoid misleading "Green" status
            result.compliant = False
            result.error = f"Engine Error: {repr(e)}"
            result.score = 0
            
        return result
    
    def _analyze_cookie(self, cookie: dict, main_domain: str) -> CookieItem:
        name = cookie.get("name", "")
        domain = cookie.get("domain", "").lstrip(".")
        
        # Categorize
        category = "Unknown"
        is_compliant = True
        risk = SeverityLevel.INFO
        
        # Check explicit tracking names
        if any(name.startswith(t) or name == t for t in self.TRACKING_COOKIES):
            category = "Marketing/Analytics"
            is_compliant = False
            risk = SeverityLevel.HIGH
        
        # Check third-party trackers
        elif any(t in domain for t in self.TRACKER_DOMAINS):
            category = "Third-Party Tracker"
            is_compliant = False
            risk = SeverityLevel.CRITICAL
            
        # Session / Essential guess
        elif "session" in name.lower() or "csrf" in name.lower() or "auth" in name.lower() or "consent" in name.lower():
            category = "Essential"
            is_compliant = True
            risk = SeverityLevel.INFO
        
        # First-party matching
        elif main_domain in domain or domain in main_domain:
             category = "First-Party (Unknown)"
             # Assume compliant unless name is suspicious (checked above)
             is_compliant = True 
        else:
             category = "Third-Party (Unknown)"
             # Any unknown third party is suspicious if deposited before consent
             is_compliant = False 
             risk = SeverityLevel.MEDIUM
             
        return CookieItem(
            name=name,
            domain=domain,
            secure=cookie.get("secure", False),
            http_only=cookie.get("httpOnly", False),
            path=cookie.get("path", "/"),
            expires=cookie.get("expires"),
            is_session=cookie.get("expires", -1) == -1,
            same_site=cookie.get("sameSite"),
            is_compliant=is_compliant,
            category=category,
            risk_level=risk
        )
