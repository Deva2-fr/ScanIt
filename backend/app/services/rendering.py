"""
Rendering Service
Uses Playwright to render SPA (Single Page Applications) and fetch full DOM.
Optimized to use a persistent Async Playwright Browser instance to avoid overhead and zombies.
"""
from typing import Optional
from playwright.async_api import async_playwright, Browser, Playwright, Page, Error as PlaywrightError
import logging
import asyncio

logger = logging.getLogger(__name__)

class GlobalBrowserManager:
    """
    Singleton to manage a persistent Playwright Browser instance.
    """
    _playwright: Optional[Playwright] = None
    _browser: Optional[Browser] = None
    _lock = asyncio.Lock()

    @classmethod
    async def get_browser(cls) -> Browser:
        async with cls._lock:
            if cls._browser is None:
                logger.info("🚀 BrowserManager: Launching persistent browser...")
                cls._playwright = await async_playwright().start()
                # Default args
                launch_args = [
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--no-first-run",
                    "--no-zygote",
                    "--single-process",
                    "--disable-gpu"
                ]

                # Security: --no-sandbox is dangerous. Only use if necessary (e.g. Docker).
                # Default to False (Secure) if not specified, OR True if we want to keep current behavior?
                # Given the user's report, let's look for an explicit env var.
                # If CHROME_NO_SANDBOX is '1' or 'true', we add it. 
                import os
                if os.getenv("CHROME_NO_SANDBOX", "true").lower() == "true":
                    launch_args.append("--no-sandbox")

                cls._playwright = await async_playwright().start()
                cls._browser = await cls._playwright.chromium.launch(
                    headless=True,
                    args=launch_args
                )
            return cls._browser

    @classmethod
    async def close(cls):
        if cls._browser:
            await cls._browser.close()
            cls._browser = None
        if cls._playwright:
            await cls._playwright.stop()
            cls._playwright = None
        logger.info("🛑 BrowserManager: Browser stopped.")

class RenderingService:
    """
    Service to handle Headless Browser rendering using Playwright.
    """
    
    @classmethod
    async def start(cls):
        """Initialize the browser pool on startup"""
        await GlobalBrowserManager.get_browser()
        logger.info("🚀 RenderingService: Ready (Async Pool Mode)")

    @classmethod
    async def stop(cls):
        """Cleanup browser on shutdown"""
        await GlobalBrowserManager.close()

    @classmethod
    async def _process_page(cls, url: str, timeout: int) -> tuple[str, Optional[bytes]]:
        """Internal logic to process a page in a new context"""
        browser = await GlobalBrowserManager.get_browser()
        context = await browser.new_context(
            user_agent="SiteAuditorBot/1.0 (Deep Scan Mode; +https://example.com/bot)"
        )
        
        try:
            page = await context.new_page()
            
            # Strict timeout for navigation
            await page.goto(url, timeout=timeout * 1000, wait_until="domcontentloaded")
            
            try:
                await page.wait_for_load_state("networkidle", timeout=5000) # shorter timeout for idle
            except Exception:
                pass # Warning: networkidle timeout, proceed anyway
            
            content = await page.content()
            
            screenshot_bytes = None
            try:
                screenshot_bytes = await page.screenshot(type="jpeg", quality=80, full_page=True)
            except Exception:
                try:
                    screenshot_bytes = await page.screenshot(type="jpeg", quality=80)
                except:
                    pass

            return content, screenshot_bytes
            
        finally:
            await context.close()

    @classmethod
    async def fetch_rendered_html(cls, url: str, timeout: int = 30) -> tuple[str, Optional[bytes]]:
        """
        Navigate to URL, wait for network idle, and return full HTML.
        Uses a persistent browser and global timeout protection.
        """
        try:
            logger.info(f"🕸️ Deep Scan: Navigating to {url} with timeout {timeout}s...")
            
            # Wrap the entire processing in a global timeout to prevent zombies
            content, screenshot = await asyncio.wait_for(
                cls._process_page(url, timeout),
                timeout=timeout + 5 # Add small buffer for cleanup
            )
            
            logger.info(f"✅ Deep Scan: Retrieved {len(content)} bytes of HTML.")
            return content, screenshot
            
        except asyncio.TimeoutError:
            logger.error(f"❌ Deep Scan Timeout on {url} (Global Limit Reached)")
            raise Exception("Rendering timed out")
        except Exception as e:
            logger.error(f"❌ Deep Scan Error on {url}: {e}")
            raise e
