"""
SEO & Performance Analysis Service
Uses Google PageSpeed Insights API (Lighthouse)
"""
import httpx
import logging
from typing import Optional, Dict, Any, List
from ..config import get_settings
from ..models import SEOResult, CoreWebVitals, LighthouseScores

# Configure logging
logger = logging.getLogger(__name__)


class SEOAnalyzer:
    """Analyzes SEO and performance using Google PageSpeed Insights"""
    
    PAGESPEED_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    
    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.google_pagespeed_api_key
    
    async def analyze(self, url: str, lang: str = "en") -> SEOResult:
        """
        Run PageSpeed Insights analysis on the given URL
        
        Args:
            url: The URL to analyze
            lang: Language code for results (en, fr)
            
        Returns:
            SEOResult with Lighthouse scores and Core Web Vitals
        """
        logger.info(f"📊 Starting SEO analysis for: {url} (lang: {lang})")
        
        # Check API key status
        has_api_key = bool(self.api_key and self.api_key != "your_api_key_here" and len(self.api_key) > 10)
        logger.info(f"🔑 Google API Key configured: {has_api_key}")
        if has_api_key:
            logger.info(f"🔑 API Key (first 8 chars): {self.api_key[:8]}...")
        
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                params = {
                    "url": url,
                    "strategy": "mobile",  # or "desktop"
                    "category": ["performance", "seo", "accessibility", "best-practices"],
                    "locale": lang
                }
                
                # Add API key if available
                if has_api_key:
                    params["key"] = self.api_key
                    logger.info("🔑 Using API key for PageSpeed request")
                else:
                    logger.warning("⚠️ No API key - using anonymous mode (rate limited)")
                
                logger.info(f"🌐 Sending request to PageSpeed API...")
                logger.info(f"   URL: {self.PAGESPEED_API_URL}")
                logger.info(f"   Target: {url}")
                
                response = await client.get(self.PAGESPEED_API_URL, params=params)
                
                logger.info(f"📥 Response status code: {response.status_code}")
                
                if response.status_code == 429:
                    logger.error("❌ Rate limit exceeded!")
                    return SEOResult(error="Rate limit exceeded. Please try again later or add a Google API key.")
                
                if response.status_code == 400:
                    error_data = response.json()
                    error_msg = error_data.get("error", {}).get("message", "Bad request")
                    logger.error(f"❌ Bad request: {error_msg}")
                    return SEOResult(error=f"PageSpeed API error: {error_msg}")
                
                if response.status_code != 200:
                    logger.error(f"❌ PageSpeed API error: {response.status_code}")
                    logger.error(f"   Response: {response.text[:500]}")
                    return SEOResult(error=f"PageSpeed API error: {response.status_code}")
                
                data = response.json()
                
                # Log raw response structure for debugging
                logger.info(f"✅ Got PageSpeed response successfully")
                logger.info(f"   Has lighthouseResult: {'lighthouseResult' in data}")
                if "lighthouseResult" in data:
                    categories = data["lighthouseResult"].get("categories", {})
                    logger.info(f"   Categories found: {list(categories.keys())}")
                    for cat_name, cat_data in categories.items():
                        score = cat_data.get("score")
                        logger.info(f"     - {cat_name}: {score * 100 if score else 'null'}")
                
                return self._parse_response(data)
                
        except httpx.TimeoutException:
            logger.error(f"❌ PageSpeed API request timed out for {url}")
            return SEOResult(error="PageSpeed API request timed out. The target site may be slow to respond.")
        except httpx.RequestError as e:
            logger.error(f"❌ Request error: {str(e)}")
            return SEOResult(error=f"Request error: {str(e)}")
        except Exception as e:
            logger.error(f"❌ Unexpected error during SEO analysis: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return SEOResult(error=f"Unexpected error: {str(e)}")
    
    def _parse_response(self, data: Dict[str, Any]) -> SEOResult:
        """Parse PageSpeed Insights API response"""
        result = SEOResult()
        
        try:
            lighthouse = data.get("lighthouseResult", {})
            categories = lighthouse.get("categories", {})
            audits = lighthouse.get("audits", {})
            
            logger.info(f"📊 Parsing Lighthouse results...")
            
            # Extract category scores (0-1 scale, convert to 0-100)
            perf_score = self._extract_score(categories.get("performance"))
            seo_score = self._extract_score(categories.get("seo"))
            a11y_score = self._extract_score(categories.get("accessibility"))
            bp_score = self._extract_score(categories.get("best-practices"))
            
            logger.info(f"   Performance: {perf_score}")
            logger.info(f"   SEO: {seo_score}")
            logger.info(f"   Accessibility: {a11y_score}")
            logger.info(f"   Best Practices: {bp_score}")
            
            result.scores = LighthouseScores(
                performance=perf_score,
                seo=seo_score,
                accessibility=a11y_score,
                best_practices=bp_score
            )
            
            # Extract Core Web Vitals
            result.core_web_vitals = self._extract_core_web_vitals(audits, data)
            
            # Extract detailed audits
            result.audits = self._extract_audits(audits)
            
            # Extract opportunities (performance improvements)
            result.opportunities = self._extract_opportunities(audits)
            
            # Extract diagnostics
            result.diagnostics = self._extract_diagnostics(audits)
            
            logger.info(f"✅ SEO analysis complete")
            
        except Exception as e:
            logger.error(f"❌ Error parsing PageSpeed response: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            result.error = f"Error parsing response: {str(e)}"
        
        return result
    
    def _extract_score(self, category: Optional[Dict]) -> Optional[int]:
        """Extract score from category data"""
        if category and "score" in category:
            score = category["score"]
            if score is not None:
                return int(score * 100)
        return None
    
    def _extract_core_web_vitals(self, audits: Dict, data: Dict) -> CoreWebVitals:
        """Extract Core Web Vitals metrics"""
        vitals = CoreWebVitals()
        
        # Try to get from loading experience (real user data) first
        loading_exp = data.get("loadingExperience", {}).get("metrics", {})
        
        # LCP - Largest Contentful Paint
        lcp_data = loading_exp.get("LARGEST_CONTENTFUL_PAINT_MS", {})
        if lcp_data:
            vitals.lcp = lcp_data.get("percentile", 0) / 1000  # Convert to seconds
            vitals.lcp_score = lcp_data.get("category", "").lower().replace("_", "-")
        elif "largest-contentful-paint" in audits:
            vitals.lcp = audits["largest-contentful-paint"].get("numericValue", 0) / 1000
            vitals.lcp_score = self._get_metric_rating(vitals.lcp, 2.5, 4.0)
        
        # FID - First Input Delay (or INP as replacement)
        fid_data = loading_exp.get("FIRST_INPUT_DELAY_MS", {})
        if fid_data:
            vitals.fid = fid_data.get("percentile", 0)
            vitals.fid_score = fid_data.get("category", "").lower().replace("_", "-")
        
        # INP - Interaction to Next Paint (newer metric)
        inp_data = loading_exp.get("INTERACTION_TO_NEXT_PAINT", {})
        if inp_data:
            vitals.inp = inp_data.get("percentile", 0)
        elif "experimental-interaction-to-next-paint" in audits:
            vitals.inp = audits["experimental-interaction-to-next-paint"].get("numericValue")
        
        # CLS - Cumulative Layout Shift
        cls_data = loading_exp.get("CUMULATIVE_LAYOUT_SHIFT_SCORE", {})
        if cls_data:
            vitals.cls = cls_data.get("percentile", 0) / 100
            vitals.cls_score = cls_data.get("category", "").lower().replace("_", "-")
        elif "cumulative-layout-shift" in audits:
            vitals.cls = audits["cumulative-layout-shift"].get("numericValue", 0)
            vitals.cls_score = self._get_metric_rating(vitals.cls, 0.1, 0.25)
        
        # FCP - First Contentful Paint
        if "first-contentful-paint" in audits:
            vitals.fcp = audits["first-contentful-paint"].get("numericValue", 0) / 1000
        
        # TTFB - Time to First Byte
        if "server-response-time" in audits:
            vitals.ttfb = audits["server-response-time"].get("numericValue")
        
        return vitals
    
    def _get_metric_rating(self, value: float, good_threshold: float, poor_threshold: float) -> str:
        """Get rating based on thresholds"""
        if value <= good_threshold:
            return "good"
        elif value <= poor_threshold:
            return "needs-improvement"
        return "poor"
    
    def _extract_audits(self, audits: Dict) -> List[Dict[str, Any]]:
        """Extract key audits with their status"""
        key_audits = [
            "meta-description", "document-title", "viewport", "robots-txt",
            "canonical", "hreflang", "structured-data", "http-status-code",
            "is-crawlable", "link-text", "image-alt", "heading-order"
        ]
        
        extracted = []
        for audit_id in key_audits:
            if audit_id in audits:
                audit = audits[audit_id]
                extracted.append({
                    "id": audit_id,
                    "title": audit.get("title", ""),
                    "description": audit.get("description", ""),
                    "score": audit.get("score"),
                    "displayValue": audit.get("displayValue", ""),
                    "passed": audit.get("score", 0) == 1
                })
        
        return extracted
    
    def _extract_opportunities(self, audits: Dict) -> List[Dict[str, Any]]:
        """Extract performance improvement opportunities"""
        opportunity_ids = [
            "render-blocking-resources", "unused-css-rules", "unused-javascript",
            "modern-image-formats", "uses-optimized-images", "uses-responsive-images",
            "efficient-animated-content", "preload-lcp-image", "total-byte-weight",
            "uses-text-compression", "uses-rel-preconnect"
        ]
        
        opportunities = []
        for audit_id in opportunity_ids:
            if audit_id in audits:
                audit = audits[audit_id]
                score = audit.get("score", 1)
                
                # Only include if there's room for improvement
                if score is not None and score < 1:
                    opportunities.append({
                        "id": audit_id,
                        "title": audit.get("title", ""),
                        "description": audit.get("description", ""),
                        "score": score,
                        "savings": audit.get("numericValue"),
                        "displayValue": audit.get("displayValue", "")
                    })
        
        # Sort by score (lowest first = most impactful)
        opportunities.sort(key=lambda x: x.get("score", 1))
        
        return opportunities[:10]  # Return top 10
    
    def _extract_diagnostics(self, audits: Dict) -> List[Dict[str, Any]]:
        """Extract diagnostic information"""
        diagnostic_ids = [
            "dom-size", "critical-request-chains", "largest-contentful-paint-element",
            "layout-shift-elements", "long-tasks", "main-thread-work-breakdown",
            "bootup-time", "font-display", "third-party-summary"
        ]
        
        diagnostics = []
        for audit_id in diagnostic_ids:
            if audit_id in audits:
                audit = audits[audit_id]
                diagnostics.append({
                    "id": audit_id,
                    "title": audit.get("title", ""),
                    "description": audit.get("description", ""),
                    "displayValue": audit.get("displayValue", ""),
                    "score": audit.get("score")
                })
        
        return diagnostics
