"""
Image Difference Service
Compares two images and calculates the visual difference.
Uses Pillow and Numpy.
"""
from PIL import Image, ImageChops, ImageEnhance
import numpy as np
import io
from typing import Tuple, Optional
import os

def compare_images(img_path_a: str, img_path_b: str, output_diff_path: Optional[str] = None) -> dict:
    """
    Compare two images and return the difference percentage and optional diff image path.
    img_path_a: 'Before' image
    img_path_b: 'After' image
    """
    try:
        img_a = Image.open(img_path_a).convert('RGB')
        img_b = Image.open(img_path_b).convert('RGB')
    except Exception as e:
        return {"error": f"Failed to open images: {str(e)}", "percentage": 0.0}

    # 1. Normalization (Resize to simplify comparison if dimensions differ slightly)
    # We resize B to match A
    if img_a.size != img_b.size:
        img_b = img_b.resize(img_a.size, Image.Resampling.LANCZOS)

    # 2. Difference
    diff = ImageChops.difference(img_a, img_b)
    
    # 3. Calculate Score
    # Convert to grayscale to count changed pixels
    # We can also use a threshold to ignore minor compression artifacts
    gray_diff = diff.convert('L')
    
    # Convert to numpy array for fast counting
    # Threshold: pixels with difference < 15 are ignored (noise)
    arr = np.array(gray_diff)
    threshold = 20
    
    # Count pixels that are effectively different
    diff_pixels = np.count_nonzero(arr > threshold)
    total_pixels = arr.size
    
    diff_percent = (diff_pixels / total_pixels) * 100
    
    # 4. Generate Visual Diff Image (Red Highlight)
    if output_diff_path:
        # Create a mask of differences
        # Where differences exist, we show bright red.
        # Where they don't, we show the original image faded out (ghostly).
        
        # Faded background (Image B)
        # diff_img = img_b.point(lambda p: p * 0.3)
        
        # Just use the standard difference image inverted or enhanced
        # A common way is to show the difference on black
        # Or showing the changed pixels in magenta over the original
        
        # Let's create a red overlay
        # Mask where difference is significant
        mask = Image.fromarray((arr > threshold).astype('uint8') * 255)
        
        # Create a red image
        red = Image.new('RGB', img_a.size, (255, 0, 255)) # Magenta/Red
        
        # Composite: Original image B as base
        base = img_b.copy()
        # Paste red where mask is white
        base.paste(red, (0, 0), mask)
        
        # Blend with original to see context
        final_diff = Image.blend(img_b, base, 0.5)
        
        final_diff.save(output_diff_path)

    return {
        "percentage": round(diff_percent, 2),
        "diff_path": output_diff_path if output_diff_path else None
    }
