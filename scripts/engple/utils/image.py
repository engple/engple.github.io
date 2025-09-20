"""Utility functions for image processing."""

import io
import requests
from PIL import Image


def url_to_file(url: str, image_format: str = "WEBP") -> io.BytesIO:
    """
    Convert an image URL to base64 string.

    Args:
        url: The URL of the image to download

    Returns:
        BytesIO of the image

    Raises:
        requests.RequestException: If there's an error downloading the image
        PIL.UnidentifiedImageError: If the downloaded content is not a valid image
    """
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    image = Image.open(io.BytesIO(response.content))
    if image.mode != "RGB":
        image = image.convert("RGB")

    buffer = io.BytesIO()
    image.save(buffer, format=image_format)
    return buffer
