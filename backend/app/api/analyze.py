"""
Analysis Endpoint
Main API route for URL analysis
"""
import asyncio
import time
import validators
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from ..models import AnalyzeRequest, AnalyzeResponse, AuditStatus
from ..services import (
    SEOAnalyzer,
    SecurityAnalyzer, 
    TechStackAnalyzer,
    BrokenLinksAnalyzer,
    GDPRAnalyzer,
    SMOAnalyzer,
    GreenITAnalyzer,
    DNSAnalyzer
)


router = APIRouter(prefix="/api", tags=["Analysis"])


async def _process_url(url: str, lang: str) -> AnalyzeResponse:
    """
    Helper function to process a single URL.
    Runs all analyzers in parallel.
    """
    start_time = time.time()
    
    # Initialize analyzers
    seo_analyzer = SEOAnalyzer()
    security_analyzer = SecurityAnalyzer()
    tech_analyzer = TechStackAnalyzer()
    links_analyzer = BrokenLinksAnalyzer()
    gdpr_analyzer = GDPRAnalyzer()
    smo_analyzer = SMOAnalyzer()
    green_analyzer = GreenITAnalyzer()
    dns_analyzer = DNSAnalyzer()
    
    errors = []
    
    try:
        # Run all analyses in parallel
        seo_result, security_result, tech_result, links_result, gdpr_result, smo_result, green_result, dns_result = await asyncio.gather(
            seo_analyzer.analyze(url, lang),
            security_analyzer.analyze(url),
            tech_analyzer.analyze(url),
            links_analyzer.analyze(url),
            gdpr_analyzer.analyze(url),
            smo_analyzer.analyze(url),
            green_analyzer.analyze(url),
            dns_analyzer.analyze(url),
            return_exceptions=True
        )
        
        # Handle any exceptions from individual analyzers
        if isinstance(seo_result, Exception):
            errors.append(f"SEO analysis failed: {str(seo_result)}")
            from ..models import SEOResult
            seo_result = SEOResult(error=str(seo_result))
        
        if isinstance(security_result, Exception):
            errors.append(f"Security analysis failed: {str(security_result)}")
            from ..models import SecurityResult
            security_result = SecurityResult(error=str(security_result))
        
        if isinstance(tech_result, Exception):
            errors.append(f"Tech stack analysis failed: {str(tech_result)}")
            from ..models import TechStackResult
            tech_result = TechStackResult(error=str(tech_result))
        
        if isinstance(links_result, Exception):
            errors.append(f"Broken links analysis failed: {str(links_result)}")
            from ..models import BrokenLinksResult
            links_result = BrokenLinksResult(error=str(links_result))

        if isinstance(gdpr_result, Exception):
            errors.append(f"GDPR analysis failed: {str(gdpr_result)}")
            from ..models import GDPRResult
            gdpr_result = GDPRResult(error=str(gdpr_result))

        if isinstance(smo_result, Exception):
            errors.append(f"SMO analysis failed: {str(smo_result)}")
            from ..models import SMOResult
            smo_result = SMOResult(error=str(smo_result))

        if isinstance(green_result, Exception):
            errors.append(f"Green IT analysis failed: {str(green_result)}")
            from ..models import GreenResult
            green_result = GreenResult(error=str(green_result))

        if isinstance(dns_result, Exception):
            errors.append(f"DNS analysis failed: {str(dns_result)}")
            from ..models import DNSHealthResult
            dns_result = DNSHealthResult(error=str(dns_result))
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Build response
        response = AnalyzeResponse(
            url=url,
            analyzed_at=datetime.utcnow(),
            status=AuditStatus.COMPLETED if not errors else AuditStatus.COMPLETED,
            seo=seo_result,
            security=security_result,
            tech_stack=tech_result,
            broken_links=links_result,
            gdpr=gdpr_result,
            smo=smo_result,
            green_it=green_result,
            dns_health=dns_result,
            scan_duration_seconds=round(duration, 2),
            errors=errors
        )
        
        # Calculate global score
        response.calculate_global_score()
        
        return response
        
    except Exception as e:
        # Ensure we don't crash the whole parallel execution if one site completely fails before gathering
        raise e


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_url(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyze a URL for SEO, Security, Technology Stack, and Broken Links.
    If competitor_url is provided, analyzes both in parallel.
    """
    url = request.url
    
    # Validate URLs
    if not validators.url(url):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid URL format: {url}"
        )
    
    if request.competitor_url and not validators.url(request.competitor_url):
         raise HTTPException(
            status_code=400,
            detail=f"Invalid Competitor URL format: {request.competitor_url}"
        )
    
    try:
        # Prepare tasks
        tasks = [_process_url(url, request.lang)]
        
        if request.competitor_url:
            tasks.append(_process_url(request.competitor_url, request.lang))
        
        # Run in parallel
        results = await asyncio.gather(*tasks)
        
        main_response = results[0]
        
        # Attach competitor result if present
        if len(results) > 1:
            main_response.competitor = results[1]
            
        return main_response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@router.post("/analyze/seo")
async def analyze_seo_only(request: AnalyzeRequest):
    """Analyze only SEO and Performance"""
    url = request.url
    
    if not validators.url(url):
        raise HTTPException(status_code=400, detail=f"Invalid URL: {url}")
    
    analyzer = SEOAnalyzer()
    result = await analyzer.analyze(url, request.lang)
    return result


@router.post("/analyze/security")
async def analyze_security_only(request: AnalyzeRequest):
    """Analyze only Security"""
    url = request.url
    
    if not validators.url(url):
        raise HTTPException(status_code=400, detail=f"Invalid URL: {url}")
    
    analyzer = SecurityAnalyzer()
    result = await analyzer.analyze(url)
    return result


@router.post("/analyze/tech")
async def analyze_tech_only(request: AnalyzeRequest):
    """Analyze only Technology Stack"""
    url = request.url
    
    if not validators.url(url):
        raise HTTPException(status_code=400, detail=f"Invalid URL: {url}")
    
    analyzer = TechStackAnalyzer()
    result = await analyzer.analyze(url)
    return result


@router.post("/analyze/links")
async def analyze_links_only(request: AnalyzeRequest):
    """Analyze only Broken Links"""
    url = request.url
    
    if not validators.url(url):
        raise HTTPException(status_code=400, detail=f"Invalid URL: {url}")
    
    analyzer = BrokenLinksAnalyzer()
    result = await analyzer.analyze(url)
    return result
