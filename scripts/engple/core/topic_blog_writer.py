import datetime
from textwrap import dedent
from typing import cast
from zoneinfo import ZoneInfo

from loguru import logger
from pydantic import BaseModel, Field, field_validator
from pydantic_ai import Agent
from pydantic_ai.settings import ModelSettings

from engple.config import config
from engple.constants import TOPIC_PROMPT


class TopicFAQ(BaseModel):
    question: str
    answer: str


class TopicBlogMeta(BaseModel):
    title: str = Field(
        description=dedent("""\
            Korean blog title for topic vocabulary.
            Format: '<TOPIC> 영어로 배우기 <emoji> - <K1>, <K2>, <K3> 영어로'
            If this is a follow-up post for the same topic, include '#<NUMBER>'.
            Example: '동물 영어로 배우기 🐾 - 개, 고양이, 토끼 영어로'
            Example: '가전제품 영어로 배우기 #1 📺 - 에어컨, 세탁기, 냉장고 영어로'
            """),
    )
    alt: str = Field(
        description="Korean alt text for the blog thumbnail image.",
    )
    description: str = Field(
        description=dedent("""\
            Korean SEO description around 100-160 characters.
            Mention 3-5 Korean vocabulary items from the content and practical examples.
            Example: "'개', '고양이', '토끼'를 영어로 어떻게 표현하면 좋을까요? '개를 산책시키다', '고양이에게 밥을 주다' 등을 영어로 표현하는 법을 배워봅시다."
            """),
    )
    faqs: list[TopicFAQ] = Field(
        description="4-5 Korean FAQ pairs based on vocabulary from the content.",
    )


class TopicBlogContent(BaseModel):
    vocabs: list[str] = Field(
        description=dedent("""\
            English vocabulary items included in the post.
            Use 5-8 items.
            Items must belong to the same hierarchy level.
            """),
    )
    content: str = Field(
        description="Markdown body for the topic vocabulary post in Korean.",
    )

    @field_validator("content")
    def validate_content(cls, value: str) -> str:
        return value.replace("\\n", "\n").strip()


class GeneratedTopicBlog(BaseModel):
    topic: str
    vocabs: list[str]
    content: str


class TopicBlogWriter:
    def __init__(self):
        self.model_content = config.model_content
        self.model_meta = config.model_meta

    async def generate(
        self,
        topic: str,
        blog_num: int,
        posted_at: datetime.datetime | None = None,
        excludes: list[str] | None = None,
        topic_sequence: int = 1,
        include_thumbnail: bool = True,
    ) -> GeneratedTopicBlog:
        """Write a topic vocabulary blog for the given topic."""
        topic_content = await self._write_topic_content(topic, excludes or [])
        topic_meta = await self._write_topic_meta(topic, topic_content, topic_sequence)
        final_content = self._get_final_content(
            topic_content,
            topic_meta,
            blog_num,
            posted_at,
            include_thumbnail,
        )
        return GeneratedTopicBlog(
            topic=topic,
            vocabs=topic_content.vocabs,
            content=final_content,
        )

    async def _write_topic_content(
        self, topic: str, excludes: list[str]
    ) -> TopicBlogContent:
        """Write the topic vocabulary blog body."""
        logger.info("✍️ 주제별 영어 블로그 작성 중...")
        content_agent = Agent(
            self.model_content,
            output_type=TopicBlogContent,
            system_prompt=self._build_topic_prompt(excludes),
            retries=2,
            model_settings=ModelSettings(temperature=0.7),
        )
        result = await content_agent.run(f"topic: '{topic}'")
        return cast(TopicBlogContent, result.output)

    def _build_topic_prompt(self, excludes: list[str]) -> str:
        prompt = TOPIC_PROMPT["prompt"].format(
            example=TOPIC_PROMPT["content"]["example"]
        )
        if excludes:
            prompt += "\n\n" + TOPIC_PROMPT["exclude_prompt"].format(
                excludes=", ".join(excludes)
            )
        return prompt

    async def _write_topic_meta(
        self, topic: str, content: TopicBlogContent, topic_sequence: int
    ) -> TopicBlogMeta:
        """Write metadata for the topic vocabulary blog."""
        logger.info("📝 주제별 영어 메타 설명 작성 중...")
        meta_agent = Agent(
            self.model_meta,
            output_type=TopicBlogMeta,
            system_prompt=TOPIC_PROMPT["meta_prompt"],
            retries=2,
            model_settings=ModelSettings(temperature=0.3),
        )
        result = await meta_agent.run(
            f"topic: {topic}\nseries_number: {topic_sequence}\n\n{content.content}"
        )
        return cast(TopicBlogMeta, result.output)

    def _get_final_content(
        self,
        content: TopicBlogContent,
        meta: TopicBlogMeta,
        blog_num: int,
        posted_at: datetime.datetime | None,
        include_thumbnail: bool,
    ) -> str:
        """Get the final markdown content for a topic post."""
        logger.info("💾 주제별 영어 블로그 출력 저장 중...")
        post_date = self._get_post_date(posted_at)
        faqs_section = self._format_faqs(meta.faqs)
        thumbnail_frontmatter = self._format_thumbnail_frontmatter(
            meta,
            blog_num,
            include_thumbnail,
        )
        thumbnail_body = self._format_thumbnail_body(meta, blog_num, include_thumbnail)
        return (
            "---\n"
            f'title: "{self._escape_text(meta.title)}"\n'
            'category: "주제별영어"\n'
            f'date: "{post_date}"\n'
            f"{thumbnail_frontmatter}"
            f'desc: "{self._format_description(meta.description)}"\n'
            "faqs:\n"
            f"{faqs_section}"
            "---\n\n"
            f"{thumbnail_body}"
            f"{content.content}\n"
        )

    def _format_thumbnail_frontmatter(
        self, meta: TopicBlogMeta, blog_num: int, include_thumbnail: bool
    ) -> str:
        if not include_thumbnail:
            return ""
        return (
            f'thumbnail: "./{blog_num:03d}.png"\n'
            f'alt: "{self._escape_text(meta.alt)}"\n'
        )

    def _format_thumbnail_body(
        self, meta: TopicBlogMeta, blog_num: int, include_thumbnail: bool
    ) -> str:
        if not include_thumbnail:
            return ""
        return f"![{self._escape_text(meta.alt)}](./{blog_num:03d}.png)\n\n"

    def _get_post_date(self, posted_at: datetime.datetime | None) -> str:
        date = posted_at or datetime.datetime.now(tz=ZoneInfo("Asia/Seoul"))
        if date.tzinfo is None:
            date = date.replace(tzinfo=ZoneInfo("Asia/Seoul"))
        return date.isoformat(timespec="minutes")

    def _format_description(self, description: str) -> str:
        escaped_description = self._escape_text(description)
        return (
            f"{escaped_description} 다양한 예문을 통해서 연습하고 "
            "본인의 표현으로 만들어 보세요."
        )

    def _format_faqs(self, faqs: list[TopicFAQ]) -> str:
        faqs_section = ""
        for faq in faqs:
            faqs_section += f'  - question: "{self._escape_text(faq.question)}"\n'
            faqs_section += f'    answer: "{self._escape_text(faq.answer)}"\n'
        return faqs_section

    def _escape_text(self, text: str) -> str:
        return text.replace('"', "'").replace("‘", "'").replace("’", "'")


__all__ = [
    "GeneratedTopicBlog",
    "TopicBlogContent",
    "TopicBlogMeta",
    "TopicBlogWriter",
]
