"""
Scanner Service
Orchestrates the analysis of URLs using various specialized analyzers.
"""
import asyncio
import time
import json
from datetime import datetime
from typing import List, Optional, AsyncGenerator
import httpx
import logging
from .rendering import RenderingService

logger = logging.getLogger(__name__)

from ..models import (
    AnalyzeResponse, 
    AuditStatus,
    SEOResult,
    SecurityResult,
    TechStackResult,
    BrokenLinksResult,
    GDPRResult,
    SMOResult,
    GreenResult,
    DNSHealthResult
)

from .seo import SEOAnalyzer
from .security import SecurityAnalyzer
from .tech import TechStackAnalyzer
from .links import BrokenLinksAnalyzer
from .gdpr import GDPRAnalyzer
from .smo import SMOAnalyzer
from .green_it import GreenITAnalyzer
from .dns_health import DNSAnalyzer

async def process_url(url: str, lang: str = "en", allowed_features: List[str] = None) -> tuple[AnalyzeResponse, Optional[bytes]]:
    """
    Process a single URL (Wrapper around stream).
    Returns (Result, ScreenshotBytes)
    """
    final_result = None
    screenshot_bytes = None
    
    async for chunk in process_url_stream(url, lang, allowed_features):
        try:
            data = json.loads(chunk)
            if data.get("type") == "complete":
                final_result = AnalyzeResponse(**data["data"])
            elif data.get("type") == "screenshot":
                import base64
                screenshot_bytes = base64.b64decode(data["data"])
        except:
            pass
            
    if not final_result:
        raise Exception("Analysis stream completed without result")
        
    return final_result, screenshot_bytes


async def process_url_stream(url: str, lang: str = "en", allowed_features: List[str] = None) -> AsyncGenerator[str, None]:
    """
    Generator that streams analysis progress and final result.
    Yields JSON strings (NDJSON format).
    """
    start_time = time.time()
    
    # Default to all if not specified (backward compatibility/admin)
    # But ideally, caller should always specify.
    if allowed_features is None:
        allowed_features = ["basic_scan", "seo_scan", "tech_scan", "links_scan", "smo_scan", "dns_scan", "security_scan", "gdpr_scan", "green_scan", "deep_scan"]

    # 1. Yield Start
    yield json.dumps({"type": "log", "step": "init", "message": f"Starting analysis for {url}..."}) + "\n"

    # Initialize analyzers based on permissions
    analyzers_tasks = []
    
    # Map feature names to (AnalyzerInstance, TaskName)
    # feature_key -> (Analyzer, "internal_name")
    
    # Map feature names to (AnalyzerClass, TaskName) - Class not Instance!
    potential_analyzers = [
        ("seo_scan", SEOAnalyzer, "seo"),
        ("security_scan", SecurityAnalyzer, "security"),
        ("tech_scan", TechStackAnalyzer, "tech"),
        ("links_scan", BrokenLinksAnalyzer, "links"),
        ("gdpr_scan", GDPRAnalyzer, "gdpr"),
        ("smo_scan", SMOAnalyzer, "smo"),
        ("green_scan", GreenITAnalyzer, "green"),
        ("dns_scan", DNSAnalyzer, "dns"),
    ]

    errors = []
    
    try:
        rendered_html = None
        headers = None
        
        # 2. Check Accessibility (Pre-flight check)
        yield json.dumps({"type": "log", "step": "network", "message": "Checking site accessibility..."}) + "\n"
        
        # Use a shared client for pre-flight to avoid overhead
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, verify=False) as client:
            try:
                 # Check if site is reachable
                 try:
                    response = await client.head(url)
                    headers = dict(response.headers)
                    if response.status_code >= 400:
                        # try GET if HEAD failed
                         response = await client.get(url)
                         headers = dict(response.headers)
                 except httpx.ConnectError:
                      # DNS or connection failure
                      raise Exception(f"Could not connect to {url}. The site may not exist or is unreachable.")
                 except Exception as e:
                      # Other network error, try one last GET
                      try:
                           response = await client.get(url)
                           headers = dict(response.headers)
                      except Exception:
                           raise Exception(f"Could not connect to {url}. Is the URL correct?")
                 
                 # Final verification
                 if response.status_code >= 500:
                      yield json.dumps({"type": "log", "step": "network", "message": f"Warning: Server returned {response.status_code}."}) + "\n"

            except Exception as e:
                error_msg = str(e)
                logger.error(f"Pre-flight check failed for {url}: {e}")
                yield json.dumps({"type": "error", "message": error_msg}) + "\n"
                return
            
        yield json.dumps({"type": "log", "step": "network", "message": "Site is accessible."}) + "\n"

        # 3. Fetch Rendered DOM (Only if deep_scan is allowed)
        if "deep_scan" in allowed_features:
            yield json.dumps({"type": "log", "step": "rendering", "message": "Simulating browser visit (Puppeteer)..."}) + "\n"
            try:
                rendered_html, screenshot_bytes = await RenderingService.fetch_rendered_html(url)
                yield json.dumps({"type": "log", "step": "rendering", "message": "Page rendered successfully."}) + "\n"
                
                if screenshot_bytes:
                     import base64
                     b64_img = base64.b64encode(screenshot_bytes).decode('utf-8')
                     yield json.dumps({"type": "screenshot", "data": b64_img}) + "\n"
                     
            except Exception as e:
                logger.error(f"Deep Scan failed for {url}: {e}")
                rendered_html = None 
                yield json.dumps({"type": "log", "step": "rendering", "message": "Rendering failed, falling back to static analysis."}) + "\n"
        else:
            yield json.dumps({"type": "log", "step": "rendering", "message": "Deep Scan (Puppeteer) skipped (Plan limit)."}) + "\n"
            # Fallback: simple fetch for static analysis if no rendered_html
            if not headers:
                  # Should have been fetched in pre-flight, but lets allow simple text fetch if needed by analyzers
                  pass

        # 4. Prepare Parallel Tasks
        yield json.dumps({"type": "log", "step": "analysis", "message": "Running specialized scanners..."}) + "\n"
        
        async def run_wrapper(name, coro):
            try:
                res = await coro
                return name, res
            except Exception as e:
                return name, e

        tasks = []
        
        for feature_key, analyzer_cls, internal_name in potential_analyzers:
            if feature_key in allowed_features:
                # Lazy Instantiation here!
                analyzer = analyzer_cls()
                
                coro = None
                if internal_name == "seo":
                    coro = analyzer.analyze(url, lang, html_content=rendered_html)
                elif internal_name == "security":
                    coro = analyzer.analyze(url)
                elif internal_name == "tech":
                    coro = analyzer.analyze(url, html_content=rendered_html, headers=headers)
                elif internal_name == "links":
                    coro = analyzer.analyze(url, html_content=rendered_html)
                elif internal_name == "gdpr":
                    coro = analyzer.analyze(url)
                elif internal_name == "smo":
                    coro = analyzer.analyze(url, html_content=rendered_html)
                elif internal_name == "green":
                    coro = analyzer.analyze(url, html_content=rendered_html)
                elif internal_name == "dns":
                    coro = analyzer.analyze(url)
                
                if coro:
                    tasks.append(run_wrapper(internal_name, coro))
            else:
                 yield json.dumps({"type": "log", "step": internal_name, "message": f"⏭️ {internal_name.upper()} skipped (Plan limit)."}) + "\n"

        
        results_map = {}
        
        # 5. Run and yield as completed
        if tasks:
            for future in asyncio.as_completed(tasks):
                 name, result = await future
                 results_map[name] = result
                 
                 # Yield progress log
                 clean_name = name.upper() if len(name) < 4 else name.title()
                 if isinstance(result, Exception):
                     yield json.dumps({"type": "log", "step": name, "message": f"❌ {clean_name} failed."}) + "\n"
                 else:
                     yield json.dumps({"type": "log", "step": name, "message": f"✅ {clean_name} completed."}) + "\n"
        else:
             yield json.dumps({"type": "log", "step": "analysis", "message": "No scanners selected."}) + "\n"

        # 6. Aggregate Results
        yield json.dumps({"type": "log", "step": "finalize", "message": "Aggregating results..."}) + "\n"
        
        # Helper to extract or handle error
        def get_res(key, default_cls, err_append):
            res = results_map.get(key)
            if isinstance(res, Exception):
                err_append.append(f"{key.upper()} analysis failed: {str(res)}")
                return default_cls(error=str(res))
            # If not in results map (skipped), return empty/skipped result?
            # Or return None? The model expects Optional or a default object.
            # Returning default object with "Skipped" error/status might be cleaner for frontend 
            if res is None:
                # Check if it was skipped or just missing
                # If feature not in allowed, it was skipped
                return default_cls(error="Skipped (Plan Limit)")
            
            return res or default_cls(error="Result missing")

        seo_result = get_res("seo", SEOResult, errors)
        security_result = get_res("security", SecurityResult, errors)
        tech_result = get_res("tech", TechStackResult, errors)
        links_result = get_res("links", BrokenLinksResult, errors)
        gdpr_result = get_res("gdpr", GDPRResult, errors)
        smo_result = get_res("smo", SMOResult, errors)
        green_result = get_res("green", GreenResult, errors)
        dns_result = get_res("dns", DNSHealthResult, errors)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Build response
        final_response = AnalyzeResponse(
            url=url,
            analyzed_at=datetime.utcnow(),
            status=AuditStatus.COMPLETED,
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
        final_response.calculate_global_score()

        # 7. Yield Final Result
        yield json.dumps({
            "type": "complete", 
            "data": final_response.model_dump(mode='json')
        }) + "\n"

    except Exception as e:
        logger.error(f"Stream failed: {e}")
        yield json.dumps({"type": "error", "message": str(e)}) + "\n"
        raise e


async def process_battle_stream(
    url: str, 
    competitor_url: str, 
    lang: str = "en", 
    allowed_features: List[str] = None
) -> AsyncGenerator[str, None]:
    """
    Stream battle mode analysis (Target vs Competitor).
    Runs two streams concurrently and merges logs.
    """
    import asyncio
    
    # queues to hold chunks from each stream
    q_target = asyncio.Queue()
    q_competitor = asyncio.Queue()
    
    async def consume_stream(stream, queue, label):
        try:
            async for chunk in stream:
                await queue.put((label, chunk))
        except Exception as e:
            await queue.put((label, json.dumps({"type": "error", "message": str(e)}) + "\n"))
        finally:
            await queue.put(None) # Sentinel

    # Start producers
    stream_target = process_url_stream(url, lang, allowed_features)
    stream_competitor = process_url_stream(competitor_url, lang, allowed_features)
    
    t1 = asyncio.create_task(consume_stream(stream_target, q_target, "Target"))
    t2 = asyncio.create_task(consume_stream(stream_competitor, q_competitor, "Competitor"))
    
    target_done = False
    competitor_done = False
    
    target_result = None
    competitor_result = None
    
    yield json.dumps({"type": "log", "step": "init", "message": "⚔️ Starting Battle Mode..."}) + "\n"

    while not (target_done and competitor_done):
        # We want to yield logs as they come in.
        # We'll race getting from both queues.
        
        get_t = asyncio.create_task(q_target.get()) if not target_done else None
        get_c = asyncio.create_task(q_competitor.get()) if not competitor_done else None
        
        wait_list = [t for t in [get_t, get_c] if t is not None]
        
        if not wait_list:
            break
            
        done, pending = await asyncio.wait(wait_list, return_when=asyncio.FIRST_COMPLETED)
        
        for task in done:
            if task == get_t:
                res = task.result()
                if res is None:
                    target_done = True
                else:
                    label, chunk = res
                    # Parse chunk to verify type
                    try:
                        data = json.loads(chunk)
                        if data["type"] == "log":
                            # Prefix log message
                            data["message"] = f"[{label}] {data['message']}"
                            yield json.dumps(data) + "\n"
                        elif data["type"] == "complete":
                            target_result = AnalyzeResponse(**data["data"])
                        elif data["type"] == "error":
                            yield chunk # Propagate error
                    except:
                        pass # Ignore parse errors
            
            elif task == get_c:
                res = task.result()
                if res is None:
                    competitor_done = True
                else:
                    label, chunk = res
                    try:
                        data = json.loads(chunk)
                        if data["type"] == "log":
                            data["message"] = f"[{label}] {data['message']}"
                            yield json.dumps(data) + "\n"
                        elif data["type"] == "complete":
                            competitor_result = AnalyzeResponse(**data["data"])
                        elif data["type"] == "error":
                            yield chunk
                    except:
                        pass

        # clean up pending? actually we should probably cancel them or re-use them
        # but for simplicity in this loop we just cancel and re-create next iteration
        # This is slightly inefficient but safe. 
        # Better: keep the pending tasks for next iteration.
        for task in pending:
            task.cancel()
    
    # Both done. Compare results.
    if target_result and competitor_result:
        yield json.dumps({"type": "log", "step": "finalize", "message": "🏆 Calculating winner..."}) + "\n"
        
        target_result.competitor = competitor_result
        target_result.versus_mode = True
        
        main_score = target_result.global_score
        comp_score = competitor_result.global_score
        
        if main_score > comp_score:
            target_result.winner = "target"
        elif main_score < comp_score:
            target_result.winner = "competitor"
        else:
            target_result.winner = "draw"
            
        yield json.dumps({
            "type": "complete", 
            "data": target_result.model_dump(mode='json')
        }) + "\n"
    else:
        yield json.dumps({"type": "error", "message": "Battle failed: One or both scans did not complete."}) + "\n"
