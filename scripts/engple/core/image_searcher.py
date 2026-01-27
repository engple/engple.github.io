"""이미지 검색 비즈니스 로직"""

from pydantic_ai.messages import ModelMessage

from textwrap import dedent
from typing import Literal

from loguru import logger
from pydantic import BaseModel, Field, TypeAdapter
from pydantic_ai import Agent

from engple.clients.unsplash import UnsplashClient
from engple.clients.unsplash.models import Photo
from engple.config import config

CONTEXT = "English Learning Blog Thumbnail"


class ImageMetadata(BaseModel):
    """AI 선별용 경량 이미지 메타데이터"""

    id: str
    description: str | None
    alt_description: str | None
    tags: list[str]
    thumb_url: str
    regular_url: str
    photographer: str

    @classmethod
    def from_photo(cls, photo: Photo) -> "ImageMetadata":
        """Photo 객체로부터 ImageMetadata 생성"""
        return cls(
            id=photo.id,
            description=photo.description,
            alt_description=None,  # Photo 모델에 없음
            tags=[],  # Photo 모델에 없음
            thumb_url=str(photo.urls.thumb),
            regular_url=str(photo.urls.regular),
            photographer=photo.user.name,
        )


class SearchQuery(BaseModel):
    """검색 쿼리"""

    query: str = Field(description="Unsplash 검색용 영어 키워드 (1-2개 핵심 단어)")


class ImageEvaluation(BaseModel):
    """이미지 결과 평가"""

    is_satisfactory: bool = Field(
        description="검색 결과가 만족스러운가? (적어도 하나의 적합한 이미지가 있는가)"
    )
    selected_id: str | None = Field(
        description="선택된 이미지 ID (만족스러운 경우)", default=None
    )
    alternative_query: str | None = Field(
        description="불만족스러운 경우 대안 검색어 제안 (영어, 1-2개 핵심 단어)",
        default=None,
    )


class ImageCandidate(BaseModel):
    """이미지 후보"""

    id: str
    description: str | None


ImageCandidates = TypeAdapter(list[ImageCandidate])


class ImageSearcher:
    """AI 기반 이미지 검색 및 선별"""

    def __init__(self, max_retries: int = 3):
        """
        Args:
            max_retries: 최대 재시도 횟수
        """
        self.max_retries = max_retries
        self._client = UnsplashClient(
            access_key=config.unsplash_access_key.get_secret_value()
        )
        self._query_generator_agent = self._create_query_generator()
        self._evaluator_agent = self._create_evaluator()

    def _create_query_generator(self):
        """쿼리 생성 에이전트 생성"""
        return Agent(
            config.model_image_selector,
            output_type=SearchQuery,
            system_prompt=dedent("""\
                Generate a single, visual, concrete English keyword (one word only) for Unsplash image search.

                Rules:
                - Prefer things with clear physical form: tangible objects, people, or animals over abstract concepts
                - Use just one concrete concept that can be easily visually represented
                - For idioms or abstractions, choose a single keyword that visualizes the meaning as a specific object, animal, or human
                - Keep it simple

                Examples:
                "in the near future" → "clock"
                "break the ice" → "handshake"
                "success" → "trophy"
                "happiness" → "smiling person"
            """),
            retries=2,
        )

    def _create_evaluator(self):
        """이미지 평가 에이전트 생성"""
        return Agent(
            config.model_image_selector,
            output_type=ImageEvaluation,
            system_prompt=dedent("""\
                Evaluate search results and select the best image for blog thumbnail.

                Criteria (priority order):
                1. Context relevance
                2. Visually conveys the expression's meaning
                3. Aesthetic quality
                4. Clear description

                Output:
                - If any image fits: is_satisfactory=True, select best ID
                - If none fit: is_satisfactory=False, suggest alternative 1-2 keywords from different angle
            """),
            retries=2,
        )

    async def aclose(self):
        """클라이언트 리소스 정리"""
        if self._client._client:
            await self._client._client.aclose()

    async def search_and_select(
        self,
        expression: str,
        per_page: int = 10,
        orientation: Literal["landscape", "portrait", "squarish"] | None = None,
    ) -> ImageMetadata:
        """
        표현식으로부터 적합한 이미지를 지능적으로 검색하고 선택

        Args:
            expression: 영어 표현 (예: "in the near future (머지않아)")
            per_page: 검색 결과 수 (최대 30)
            orientation: 이미지 방향

        Returns:
            선택된 이미지 메타데이터
        """
        logger.info(f"🎯 표현 분석 중: '{expression}'")

        query_res = await self._generate_initial_query(expression)

        # 재시도 루프
        for attempt in range(self.max_retries):
            result = await self._attempt_search_and_evaluate(
                expression=expression,
                search_query=query_res.output,
                per_page=per_page,
                orientation=orientation,
                attempt=attempt,
            )

            # 성공적으로 이미지를 찾았으면 반환
            if result:
                return result

            # 재시도가 필요한 경우 다음 쿼리 생성
            if self._should_retry(attempt):
                query_res = await self._generate_alternative_query(
                    query_res.all_messages(),
                )
            else:
                raise ValueError(f"적합한 이미지를 찾을 수 없습니다: {expression}")

        raise ValueError(f"적합한 이미지를 찾을 수 없습니다: {expression}")

    async def _attempt_search_and_evaluate(
        self,
        expression: str,
        search_query: str,
        per_page: int,
        orientation: Literal["landscape", "portrait", "squarish"] | None,
        attempt: int,
    ) -> ImageMetadata | None:
        """검색 시도 및 평가 수행"""
        photos = await self._search_photos(search_query, per_page, orientation)

        if not photos:
            return self._handle_no_results(attempt)

        logger.info(f"📸 {len(photos)}개 이미지 발견, AI 평가 중...")

        res = await self._evaluate_photos(photos, expression, search_query)

        # 평가 결과에 따라 처리
        if res.output.is_satisfactory and res.output.selected_id:
            return self._handle_satisfactory_result(res.output, photos)
        else:
            return self._handle_unsatisfactory_result(res.output, photos, attempt)

    async def _generate_initial_query(self, expression: str):
        """초기 검색 쿼리 생성"""
        res = await self._query_generator_agent.run(
            f"Expression: {expression}\nContext: {CONTEXT}"
        )

        logger.info(f"🔍 생성된 검색어: '{res.output}'")
        return res

    async def _generate_alternative_query(self, message_history: list[ModelMessage]):
        """대안 검색 쿼리 생성"""
        res = await self._query_generator_agent.run(
            "Try different angle.",
            message_history=message_history,
        )

        logger.info(f"🔄 대안 검색어: '{res.output}'")
        return res

    async def _search_photos(
        self,
        query: str,
        per_page: int,
        orientation: Literal["landscape", "portrait", "squarish"] | None,
    ) -> list[Photo]:
        """Unsplash에서 사진 검색"""
        response = await self._client.search_photos(
            query=query,
            per_page=per_page,
            orientation=orientation,
        )
        return response.data.results

    async def _evaluate_photos(
        self,
        photos: list[Photo],
        expression: str,
        search_query: str,
    ):
        """AI로 사진 결과 평가"""
        candidates = ImageCandidates.dump_json(
            [
                ImageCandidate(id=photo.id, description=photo.description)
                for photo in photos
            ]
        )
        res = await self._evaluator_agent.run(
            f"Expression: {expression}\nContext: {CONTEXT}\n"
            f"Query: {search_query}\n\nCandidates:\n{candidates}"
        )
        return res

    def _handle_satisfactory_result(
        self, evaluation: ImageEvaluation, photos: list[Photo]
    ) -> ImageMetadata:
        """만족스러운 결과 처리"""
        selected_photo = next(
            (p for p in photos if p.id == evaluation.selected_id),
            None,
        )

        if selected_photo:
            return ImageMetadata.from_photo(selected_photo)
        else:
            logger.warning("⚠️  선택된 ID를 찾을 수 없음, 첫 이미지 사용")
            return ImageMetadata.from_photo(photos[0])

    def _handle_unsatisfactory_result(
        self, evaluation: ImageEvaluation, photos: list[Photo], attempt: int
    ) -> ImageMetadata | None:
        """불만족스러운 결과 처리"""
        if self._should_retry(attempt):
            logger.info(f"🔄 결과 불만족 (시도 {attempt + 1}/{self.max_retries})")
            return None
        else:
            logger.warning("⚠️  최대 재시도 도달, 현재 결과에서 최선 선택")
            return ImageMetadata.from_photo(photos[0])

    def _handle_no_results(self, attempt: int) -> None:
        """검색 결과 없음 처리"""
        logger.warning(f"⚠️  검색 결과 없음 (시도 {attempt + 1}/{self.max_retries})")
        if not self._should_retry(attempt):
            raise ValueError("검색 결과를 찾을 수 없습니다")
        return None

    def _should_retry(self, attempt: int) -> bool:
        """재시도 가능 여부 확인"""
        return attempt < self.max_retries - 1


async def search_image(
    expression: str,
    per_page: int = 10,
    orientation: Literal["landscape", "portrait", "squarish"] | None = None,
    max_retries: int = 3,
) -> ImageMetadata:
    """
    편의 함수: 표현식으로부터 이미지 검색 및 AI 선별 (자동으로 리소스 정리)

    Args:
        expression: 영어 표현 (예: "in the near future (머지않아)")
        context: 이미지 사용 목적/맥락
        per_page: 검색 결과 수
        orientation: 이미지 방향
        max_retries: 최대 재시도 횟수

    Returns:
        선택된 이미지 메타데이터

    Example:
        >>> image = await search_image(
        ...     expression="break the ice (어색함을 깨다)",
        ...     context="영어 블로그 썸네일"
        ... )
    """
    searcher = ImageSearcher(max_retries=max_retries)
    try:
        return await searcher.search_and_select(expression, per_page, orientation)
    finally:
        await searcher.aclose()


__all__ = ["ImageSearcher", "ImageMetadata", "search_image"]
