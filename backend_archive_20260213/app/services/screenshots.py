"""
Screenshot storage service
Handles saving screenshots to the static directory.
"""
from pathlib import Path
import os
import io

# Static directory for screenshots
SCREENSHOT_DIR = Path("static/screenshots")

def save_screenshot(screenshot_bytes: bytes, user_id: int, site_url_hash: str, timestamp_str: str) -> str:
    """
    Save screenshot bytes to disk.
    Returns the relative path to be stored in DB.
    
    Path structure: static/screenshots/{user_id}/{site_hash}/{timestamp}.jpg
    """
    if not screenshot_bytes:
        return None
        
    # Create directory structure
    user_dir = SCREENSHOT_DIR / str(user_id) / site_url_hash
    user_dir.mkdir(parents=True, exist_ok=True)
    
    filename = f"{timestamp_str}.jpg"
    file_path = user_dir / filename
    
    with open(file_path, "wb") as f:
        f.write(screenshot_bytes)
        
    # Return relative URL path (assuming /static is mounted)
    return str(file_path).replace("\\", "/")

def get_screenshot_path(relative_path: str) -> str:
    """Convert DB relative path to absolute system path"""
    return str(Path(relative_path).absolute())
