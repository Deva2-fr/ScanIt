import asyncio
import logging
from typing import Set, List, Dict
from urllib.parse import urljoin, urlparse, urldefrag

import aiohttp
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

class AsyncCrawler:
    def __init__(self, base_url: str, max_pages: int = 50, max_depth: int = 3):
        self.base_url = base_url
        self.max_pages = max_pages
        self.max_depth = max_depth
        self.visited: Set[str] = set()
        self.results: List[Dict[str, str]] = []  # Stores found URLs with metadata if needed
        self.domain = urlparse(base_url).netloc
        self.base_scheme = urlparse(base_url).scheme

    def _normalize_url(self, url: str, current_url: str) -> str | None:
        """
        Normalizes the URL:
        1. Resolves relative paths.
        2. Removes fragments (#).
        3. Checks domain validity.
        4. Ignores mailto: etc.
        """
        # Remove whitespace
        url = url.strip()
        
        # Ignored schemes
        if url.startswith(("mailto:", "tel:", "javascript:", "data:")):
            return None

        # Resolve relative URL using the page where the link was found
        absolute_url = urljoin(current_url, url)

        # Remove anchors/fragments
        absolute_url, _ = urldefrag(absolute_url)

        # Parse normalized URL
        parsed = urlparse(absolute_url)

        # Ensure scheme is http or https
        if parsed.scheme not in ("http", "https"):
            return None

        # Check domain (must be same domain or subdomain if strictness allows, usually strictly same netloc for simple site explorer)
        # Check against initial domain. 
        if parsed.netloc != self.domain:
            return None
            
        return absolute_url

    async def _fetch(self, session: aiohttp.ClientSession, url: str) -> str:
        try:
            async with session.get(url, timeout=10, ssl=False) as response:
                if response.status == 200:
                    # Only text/html
                    content_type = response.headers.get("Content-Type", "")
                    if "text/html" in content_type:
                        return await response.text()
                return ""
        except Exception as e:
            logger.warning(f"Failed to fetch {url}: {str(e)}")
            return ""

    async def crawl(self) -> Set[str]:
        """
        Starts the BFS crawl.
        Returns the set of visited URLs.
        """
        queue = [(self.base_url, 0)] # Tuple (url, depth)
        self.visited.add(self.base_url)
        
        # Use a single session for all requests
        async with aiohttp.ClientSession() as session:
            while queue and len(self.visited) < self.max_pages:
                current_url, depth = queue.pop(0) # FIFO -> BFS
                
                if depth >= self.max_depth:
                    continue

                html = await self._fetch(session, current_url)
                if not html:
                    continue

                soup = BeautifulSoup(html, "html.parser")
                
                # Extract links
                for a_tag in soup.find_all("a", href=True):
                    href = a_tag["href"]
                    normalized = self._normalize_url(href, current_url)

                    if normalized and normalized not in self.visited:
                        if len(self.visited) >= self.max_pages:
                            break
                        
                        self.visited.add(normalized)
                        queue.append((normalized, depth + 1))
                        
        return self.visited

if __name__ == "__main__":
    # Test simple
    async def main():
        crawler = AsyncCrawler("https://example.com", max_pages=10, max_depth=2)
        urls = await crawler.crawl()
        print(f"URLs found ({len(urls)}):")
        for u in urls:
            print(u)
            
    # asyncio.run(main())
