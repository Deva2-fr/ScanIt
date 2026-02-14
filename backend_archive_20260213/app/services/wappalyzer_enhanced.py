"""
Enhanced Wappalyzer Service
Wraps python-Wappalyzer to ensure better detection of versions and metadata.
"""
from Wappalyzer import Wappalyzer, WebPage
import re
from typing import Dict, List, Any, Optional

class EnhancedWappalyzer:
    def __init__(self):
        self.wappalyzer = Wappalyzer.latest()
        
    def analyze(self, url: str, html: str, headers: Dict[str, str]) -> List[Dict[str, Any]]:
        """
        Analyze a webpage using Wappalyzer with enhanced version extraction
        """
        webpage = WebPage(url, html, headers)
        
        # 1. Standard Wappalyzer detection
        # This returns specific tech names that matched
        detected_techs_names = self.wappalyzer.analyze(webpage)
        
        # 2. Extract Details (Version, Categories)
        # Wappalyzer.analyze() just returns names in current version of python-Wappalyzer usually,
        # We need to dig into the internal engine or use 'get_implied_technologies' if needed,
        # But 'get_technologies()' returns the definition.
        
        # Actually, python-Wappalyzer 'analyze_with_versions' (if available) or we manually match.
        # But standard `analyze` often returns just a set of strings.
        # However, looking at the library, it might return just strings.
        # We need to map these strings back to the definitions to find categories and versions.
        
        results = []
        
        # Access internal categories map if possible, or use our static maps?
        # Wappalyzer object has 'technologies' dict.
        
        for tech_name in detected_techs_names:
            tech_def = self.wappalyzer.technologies.get(tech_name, {})
            
            # Categories
            categories = []
            if "cats" in tech_def:
                for cat_id in tech_def["cats"]:
                    cat_name = self.wappalyzer.categories.get(str(cat_id), {}).get("name", "Unknown")
                    categories.append(cat_name)
                    
            # Version Detection
            # Wappalyzer usually detects version if pattern has "version:\\1" group.
            # But the python wrapper `analyze` method might not return it directly.
            # We will use our own simplified heuristic or checking if the library supports it.
            # The library `analyze` returns a set of names. 
            # We might need to implement a 'get_version' similar to how Wappalyzer does it
            # or rely on our custom fallback.
            
            # Let's try to extract version using custom fallback if we can't get it from lib
            version = self._detect_version(tech_name, html, headers, tech_def)
            
            results.append({
                "name": tech_name,
                "categories": categories,
                "version": version,
                "website": tech_def.get("website", ""),
                "description": tech_def.get("description", ""),
                "icon": tech_def.get("icon", f"{tech_name}.svg")
            })
            
        return results

    def _detect_version(self, tech_name: str, html: str, headers: Dict[str, str], tech_def: Dict) -> Optional[str]:
        """
        Try to detect version using regex patterns from Wappalyzer definition or fallbacks
        """
        # 1. Check Meta Generator (Most common for CMS)
        # Search for <meta name="generator" content="WordPress 6.1.1">
        meta_gen_pattern = re.compile(r'<meta[^>]*name=["\']generator["\'][^>]*content=["\']([^"\']+)["\']', re.IGNORECASE)
        for gen_content in meta_gen_pattern.findall(html):
            if tech_name.lower() in gen_content.lower():
                version_match = re.search(r'([\d.]+)', gen_content)
                if version_match:
                    return version_match.group(1)

        if tech_name.lower() in ["wordpress", "drupal", "joomla", "typo3"]:
            meta_match = re.search(fr'{tech_name}.*?([\d.]+)', html, re.IGNORECASE)
            if meta_match:
                return meta_match.group(1)
                
        # 2. Check Script and Link Sources (e.g. plugin.js?ver=14.2)
        # We look for the tech name in the path, and a version-like string nearby
        normalized_name = tech_name.lower().replace(" ", "[-_]?")
        
        # Pattern 1: tech-name.js?ver=1.2.3 or tech-name-1.2.3.min.js
        pattern1 = re.compile(fr'/{normalized_name}[^"\' >]*?(?:(?:\-|v|ver=|version=)([\d.]+))', re.IGNORECASE)
        match1 = pattern1.search(html)
        if match1:
             return match1.group(1)
             
        # Pattern 2: /wp-content/plugins/tech-name/.*?ver=1.2.3
        # More aggressive for CMS plugins
        pattern2 = re.compile(fr'/{normalized_name}/[^"\' >]*?(?:(?:\-|v|ver=|version=)([\d.]+))', re.IGNORECASE)
        match2 = pattern2.search(html)
        if match2:
            return match2.group(1)
             
        # 3. Headers
        for h, v in headers.items():
            if tech_name.lower() in h.lower() or tech_name.lower() in v.lower():
                 # Simple version extraction
                 ver_match = re.search(r'([\d]+\.[\d]+(?:\.[\d]+)?)', v)
                 if ver_match:
                     return ver_match.group(1)
                     
        return None

