import httpx


class UnsplashError(Exception):
    """Unsplash API 오류"""


class UnsplashHTTPError(UnsplashError):
    """Unsplash API HTTP 오류"""

    def __init__(self, message: str, response: httpx.Response):
        super().__init__(message)
        self.response = response
