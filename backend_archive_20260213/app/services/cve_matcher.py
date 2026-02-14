"""
CVE Matcher Service
Checks detected technologies against a local database of known vulnerabilities.
"""
from typing import Dict, Any, List, Optional
from packaging.version import parse as parse_version, Version
import logging

logger = logging.getLogger(__name__)

class CVEMatcher:
    """
    Local Vulnerability Database for Top Technologies.
    Avoids external API calls by keeping a curated list of high-profile CVEs.
    """
    
    # Simple Vulnerability Database
    # Format: Tech -> [ { min_ver, max_ver, cve_id, sev, desc } ]
    # max_ver is exclusive (<)
    VULN_DB = {
        "WordPress": [
            {"min": "0.0.0", "max": "6.1.2", "cve": "CVE-2022-4452", "severity": "HIGH", "desc": "CSRF vulnerability leading to account takeover"},
            {"min": "6.0.0", "max": "6.0.3", "cve": "CVE-2022-43497", "severity": "MEDIUM", "desc": "Auth bypass in WP_Query"},
            {"min": "0.0.0", "max": "5.8.3", "cve": "CVE-2022-21661", "severity": "CRITICAL", "desc": "SQL Injection in WP_Query core"}
        ],
        "jQuery": [
            {"min": "0.0.0", "max": "3.5.0", "cve": "CVE-2020-11022", "severity": "MEDIUM", "desc": "Cross-Site Scripting (XSS) in jQuery.htmlPrefilter"},
            {"min": "0.0.0", "max": "3.0.0", "cve": "CVE-2015-9251", "severity": "MEDIUM", "desc": "XSS in jQuery get/post helpers"}
        ],
        "Apache": [
            {"min": "2.4.0", "max": "2.4.52", "cve": "CVE-2021-44790", "severity": "CRITICAL", "desc": "Buffer overflow in mod_lua"},
            {"min": "2.4.49", "max": "2.4.51", "cve": "CVE-2021-41773", "severity": "CRITICAL", "desc": "Path traversal and file disclosure"}
        ],
        "Nginx": [
             {"min": "0.6.18", "max": "1.20.1", "cve": "CVE-2021-23017", "severity": "HIGH", "desc": "Off-by-one error enabling RCE via DNS resolver"}
        ],
        "PHP": [
            {"min": "8.1.0", "max": "8.1.19", "cve": "CVE-2023-3824", "severity": "HIGH", "desc": "Buffer overflow in header parsing"},
            {"min": "7.0.0", "max": "7.4.33", "cve": "EOL", "severity": "CRITICAL", "desc": "PHP 7.4 is End-of-Life and no longer receives security updates."}
        ],
        "Bootstrap": [
            {"min": "3.0.0", "max": "3.4.1", "cve": "CVE-2019-8331", "severity": "MEDIUM", "desc": "XSS in tooltip/popover data-template"},
            {"min": "4.0.0", "max": "4.3.1", "cve": "CVE-2019-8331", "severity": "MEDIUM", "desc": "XSS in tooltip/popover data-template"}
        ]
    }
    
    # End of Life / Outdated Reference
    LATEST_VERSIONS = {
        "WordPress": "6.4.3",
        "Drupal": "10.2.2",
        "Joomla": "5.0.2",
        "jQuery": "3.7.1",
        "Bootstrap": "5.3.2",
        "React": "18.2.0",
        "Vue.js": "3.4.15",
        "Angular": "17.1.0",
        "PHP": "8.3.2",
        "Python": "3.12.1",
        "Nginx": "1.25.3",
        "Apache": "2.4.58"
    }

    @classmethod
    def check_vulnerabilities(cls, tech_name: str, version: str) -> List[Dict[str, Any]]:
        """
        Check if a specific version of a technology has known vulnerabilities.
        """
        if not version or tech_name not in cls.VULN_DB:
            return []
            
        detected_vulns = []
        try:
            # Clean version string (remove 'v', build numbers if complex)
            clean_ver = cls._clean_version(version)
            current_ver = parse_version(clean_ver)
            
            for vuln in cls.VULN_DB[tech_name]:
                # Handle EOL checks
                if vuln.get("cve") == "EOL":
                    # Simple range check
                    min_v = parse_version(vuln["min"])
                    max_v = parse_version(vuln["max"])
                    if min_v <= current_ver <= max_v:
                        detected_vulns.append(vuln)
                    continue

                # Standard CVE checks
                min_v = parse_version(vuln["min"])
                max_v = parse_version(vuln["max"])
                
                if min_v <= current_ver < max_v:
                    detected_vulns.append(vuln)
                    
        except Exception as e:
            logger.debug(f"Version match failed for {tech_name} {version}: {e}")
            pass
            
        return detected_vulns

    @classmethod
    def check_outdated(cls, tech_name: str, version: str) -> Dict[str, Any]:
        """
        Check if the version is significantly outdated compared to latest stable.
        """
        res = {"is_outdated": False, "latest": None}
        
        if tech_name in cls.LATEST_VERSIONS:
            latest_str = cls.LATEST_VERSIONS[tech_name]
            res["latest"] = latest_str
            
            if version:
                try:
                    curr = parse_version(cls._clean_version(version))
                    latest = parse_version(latest_str)
                    
                    if curr < latest:
                        res["is_outdated"] = True
                except:
                    pass
        return res

    @staticmethod
    def _clean_version(version: str) -> str:
        # Remove non-numeric start
        # e.g. "1.12.4-min" -> "1.12.4"
        import re
        match = re.search(r'(\d+(\.\d+)*)', version)
        if match:
            return match.group(0)
        return version.strip()
