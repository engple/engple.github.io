"""Utility functions for image processing."""

import os

import io
import requests
from quickthumb import Canvas, TextPart, Stroke, FitMode
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


def render_expression_thumbnail(path: str, image_url: str, ko: str) -> None:
    """
    Render a expression thumbnail image from a title and subtitle.

    Args:
        path: The path to save the thumbnail
        image_url: The URL of the image
        ko: The Korean meaning of the expression
    """
    font_dir = os.path.join(os.path.dirname(__file__), "../assets/fonts")
    canvas = (
        Canvas.from_aspect_ratio("16:9", 1280)
        .background(image=image_url, fit=FitMode.COVER)
        .background(color="#000000", opacity=0.66)
        .text(
            content=[
                TextPart(
                    text=f"'{ko}'\n",
                    color="#1FFFAA",
                    size=112,
                    font=os.path.join(font_dir, "JalnanGothic.otf"),
                    effects=[Stroke(width=8, color="#000000")],
                ),
                TextPart(
                    text=" \n",
                    size=28,
                ),
                TextPart(
                    text="영어로 어떻게 표현할까?",
                    color="#FFFFFF",
                    size=52,
                    font=os.path.join(font_dir, "SpoqaHanSansNeo-Medium.otf"),
                ),
            ],
            position=("50%", "50%"),
            align=("center", "middle"),
            bold=True,
        )
        .outline(width=16, color="#1FFFAA")
    )
    canvas.render(path)
