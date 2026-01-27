"""Unsplash API 비동기 클라이언트"""

from engple.clients.unsplash.models import UnleashHeader
from engple.clients.unsplash.models import UnleashResponse
import httpx
from typing import Literal

from engple.clients.unsplash.errors import UnsplashError, UnsplashHTTPError
from engple.clients.unsplash.models import SearchPhotosResponse


class UnsplashClient:
    """Unsplash API 비동기 클라이언트"""

    BASE_URL = "https://api.unsplash.com"

    def __init__(self, access_key: str, timeout: float = 30.0):
        """
        Args:
            access_key: Unsplash API access key
        """
        self.access_key = access_key
        self._client: httpx.AsyncClient = httpx.AsyncClient(
            base_url=self.BASE_URL,
            headers={
                "Authorization": f"Client-ID {self.access_key}",
                "Accept-Version": "v1",
            },
            timeout=timeout,
        )

    async def _get(
        self, path: str, params: dict[str, str | int] | None = None
    ) -> httpx.Response:
        response = await self._client.get(path, params=params)
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            message = f"[{e.response.status_code}]"
            raise UnsplashHTTPError(message, e.response)
        return response

    async def search_photos(
        self,
        query: str,
        per_page: int = 10,
        orientation: Literal["landscape", "portrait", "squarish"] | None = None,
    ) -> UnleashResponse[SearchPhotosResponse]:
        """
        사진 검색 API 호출 - 원본 응답 반환

        Args:
            query: 검색 키워드
            per_page: 페이지당 결과 수 (최대 30)
            orientation: 이미지 방향 ("landscape", "portrait", "squarish")
        """

        if per_page > 30:
            raise UnsplashError("per_page must be less than or equal to 30")

        params: dict[str, str | int] = {"query": query, "per_page": per_page}

        if orientation:
            params["orientation"] = orientation

        response = await self._get("/search/photos", params)

        return UnleashResponse(
            headers=UnleashHeader.model_validate(response.headers),
            data=SearchPhotosResponse.model_validate(response.json()),
        )
