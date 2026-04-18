import datetime
from typing import cast
from textwrap import dedent
from zoneinfo import ZoneInfo
import re
import json

from pydantic import BaseModel, Field, field_validator
from pydantic_ai import Agent, PromptedOutput

from loguru import logger
from pydantic_ai.settings import ModelSettings
from engple.config import config
from engple.constants import (
    BLOG_EXAMPLE_PATH,
    BLOG_PROMPT,
    BLOGMETA_EXAMPLE_PATH,
    EXAMPLE_SENTENCES_PATH,
    RECOMMENDATION_EXAMPLES_PATH,
)
from engple.core.candidate_meanings import CandidateMeaningCreator
from engple.core.expression_candidates import ExpressionCandidateCreator
from engple.utils import normalize_expression


class BlogContent(BaseModel):
    expression: str = Field(description="The expression to write a blog for")
    korean_meanings: list[str] = Field(
        description="The Korean meanings used in the title"
    )
    title: str = Field(
        description=dedent("""\
            Blog title for the english. Follow the format.
            Format: '<K1>' 영어로 어떻게 표현할까 <emoji> - <K2>, <K3> 영어로
            - <K1>: Primary Korean meaning of <expression>.
            - <K2>, <K3>: Related Korean synonyms of <expression>.
            - <emoji>: Emoji relevant to the meanings <K1>, <K2>, and <K3>.
            """),
    )
    body: str = Field(
        description="Content of the blog written in Korean.",
    )

    @field_validator("body")
    def validate_body(cls, v: str) -> str:
        return v.replace("\\n", "\n")

    @field_validator("expression")
    def validate_expression(cls, v: str) -> str:
        return re.sub(r"\([^)]*\)", "", v).strip()


class RelatedExpression(BaseModel):
    expression: str = Field(
        description="Expression similar to or opposite of <expression> used in everyday conversations"
    )
    explanation: str = Field(description="Explanation of the expression in Korean")
    example: str = Field(description="A natural example sentence using the expression")
    translation: str = Field(
        description="Korean translation of the 'example' field, written in a natural, conversational style (ending with '~해요')."
    )


class Recommendation(BaseModel):
    data: list[RelatedExpression] = Field(
        description="A set of related expressions to the given expression",
    )


class FAQ(BaseModel):
    question: str
    answer: str


class BlogMeta(BaseModel):
    description: str = Field(
        description="A concise and engaging blog post description in Korean (~100 characters)."
    )
    faqs: list[FAQ] = Field(
        description="A list of 4-5 question-and-answer pairs about the expression in Korean."
    )


class GeneratedBlog(BaseModel):
    expression: str
    content: str
    meanings: list[str]


class BlogWriter:
    def __init__(self, *, expression_count: int = 10, recommendation_count: int = 3):
        self.expression_count = expression_count
        self.model_translation = config.model_translation
        self.model_content = config.model_content
        self.model_meta = config.model_meta
        self.model_expressions = config.model_expressions
        self.recommendation_count = recommendation_count

    async def generate(
        self,
        expression: str,
        blog_num: int,
        posted_at: datetime.datetime | None = None,
    ) -> GeneratedBlog:
        """
        Write a blog for the given expression using pydantic-ai agents
        """
        examples = await self._generate_blog_examples(expression)
        translations = await self._translate_blog_examples(examples)
        formatted_examples = self._format_blog_examples(examples, translations)
        content = await self._write_blog_content(expression)
        blog_meta = await self._write_blog_meta(expression)
        recommendations = await self._recommend_other_expressions(expression)
        if normalize_expression(content.expression) != normalize_expression(expression):
            logger.warning(
                "Generated expression drifted from planned expression: '{}' -> '{}'",
                expression,
                content.expression,
            )
        final = self._get_final_content(
            expression,
            content,
            blog_meta,
            formatted_examples,
            recommendations,
            blog_num,
            posted_at,
        )
        return GeneratedBlog(
            expression=content.expression,
            meanings=content.korean_meanings,
            content=final,
        )

    async def generate_candidate_expressions(
        self, existing_expressions: list[str], count: int
    ) -> list[str]:
        """Generate plain English candidate expressions from ranked sources."""
        logger.info("🧠 새 표현 후보 수집 중...")
        candidate_creator = ExpressionCandidateCreator()
        try:
            return await candidate_creator.generate(existing_expressions, count)
        finally:
            await candidate_creator.aclose()

    async def annotate_candidate_expressions(
        self, candidate_expressions: list[str]
    ) -> list[str]:
        meaning_creator = CandidateMeaningCreator(self.model_expressions)
        return await meaning_creator.annotate(candidate_expressions)


    async def _generate_blog_examples(self, expression: str):
        """
        Generate examples for the given expression
        """
        logger.info("📄 예제 생성 중...")
        examples_agent = Agent(
            config.model_examples,
            output_type=list[str],
            system_prompt=BLOG_PROMPT["example"]["prompt"].format(
                count=self.expression_count,
                examples=EXAMPLE_SENTENCES_PATH.read_text(),
            ),
            retries=2,
        )
        res = await examples_agent.run(f"expression: '{expression}'")
        return cast(list[str], res.output)

    async def _translate_blog_examples(self, examples: list[str]):
        """
        Translate examples for the given expression
        """
        logger.info("📄 예제 번역 중...")
        translate_agent = Agent(
            self.model_translation,
            output_type=list[str],
            system_prompt=BLOG_PROMPT["translation"]["prompt"],
            retries=2,
        )
        res = await translate_agent.run(json.dumps(examples))
        return cast(list[str], res.output)

    async def _write_blog_content(self, expression: str):
        """
        Write a blog content for the given expression
        """
        logger.info("💬 블로그 작성 중...")

        example = BlogContent(
            expression="delay",
            korean_meanings=["지연되다", "연기", "미룸"],
            title="'지연되다' 영어로 어떻게 표현할까 ⏳ - 연기, 미룸 영어로",
            body=BLOG_EXAMPLE_PATH.read_text(),
        )
        content_agent = Agent(
            self.model_content,
            output_type=BlogContent,
            system_prompt=BLOG_PROMPT["blog_content"]["prompt"].format(
                examples=[example.model_dump_json()]
            ),
            retries=2,
            model_settings=ModelSettings(temperature=0.0),
        )
        res = await content_agent.run(self._get_expression_prompt(expression))
        return cast(BlogContent, res.output)

    async def _write_blog_meta(self, expression: str):
        """
        Write a og description for the given expression
        """
        logger.info("📝 블로그 메타 설명 작성 중...")
        example = BlogMeta.model_validate_json(BLOGMETA_EXAMPLE_PATH.read_bytes())
        meta_agent = Agent(
            self.model_meta,
            output_type=BlogMeta,
            system_prompt=BLOG_PROMPT["blogmeta"]["prompt"].format(
                examples=example.model_dump_json()
            ),
            retries=2,
            model_settings=ModelSettings(temperature=0.0),
        )
        res = await meta_agent.run(self._get_expression_prompt(expression))
        return cast(BlogMeta, res.output)

    async def _recommend_other_expressions(self, expression: str):
        """
        Recommend other expressions for the given expression
        """
        logger.info("🔍 다른 표현 추천 중...")

        examples = Recommendation.model_validate_json(
            RECOMMENDATION_EXAMPLES_PATH.read_bytes()
        )
        recommend_agent = Agent(
            self.model_expressions,
            output_type=PromptedOutput(list[RelatedExpression]),
            system_prompt=BLOG_PROMPT["recommendation"]["prompt"].format(
                count=self.recommendation_count,
                examples=examples.model_dump_json(),
            ),
            retries=2,
            model_settings=ModelSettings(temperature=0.0),
        )
        res = await recommend_agent.run(f"expression: '{expression}'")
        return cast(list[RelatedExpression], res.output)

    def _format_blog_examples(
        self, examples: list[str], translations: list[str]
    ) -> str:
        """
        Format examples for the given expression

        <ul data-interactive-list>

          <li data-interactive-item>
            <span data-toggler>{translation}</span>
            <span data-answer>{example}</span>
          </li>

        </ul>
        """
        logger.info("🔍 예제 포맷팅 중...")

        def create_list_item(example: str, translation: str) -> str:
            """Create an HTML list item for an interactive example."""
            return (
                f"  <li data-interactive-item>\n"
                f"    <span data-toggler>{translation.strip()}</span>\n"
                f"    <span data-answer>{example.strip()}</span>\n"
                f"  </li>"
            )

        list_items = [
            create_list_item(example, translation)
            for example, translation in zip(examples, translations, strict=True)
        ]

        formatted_examples = (
            f"<ul data-interactive-list>\n\n{'\n\n'.join(list_items)}\n\n</ul>"
        )

        return formatted_examples

    def _get_final_content(
        self,
        expression: str,
        content: BlogContent,
        blog_meta: BlogMeta,
        formatted_examples: str,
        recommendations: list[RelatedExpression],
        blog_num: int,
        posted_at: datetime.datetime | None = None,
    ) -> str:
        """
        Get the final content for the given parameters
        """
        logger.info("💾 블로그 출력 저장 중...")
        sanitized_expression = re.sub(r"\([^)]*\)", "", expression).strip()
        try:
            content_body, content_footer = content.body.split("---\n\n")
        except ValueError:
            content_body = content.body
            content_footer = ""

        # Build FAQ section
        faqs_section = ""
        for faq in blog_meta.faqs:
            faqs_section += f'  - question: "{self._escape_text(faq.question)}"\n'
            faqs_section += f'    answer: "{self._escape_text(faq.answer)}"\n'

        # Build recommendations section
        recommendations_section = ""
        for recommendation in recommendations:
            recommendations_section += f"### {recommendation.expression}\n\n"
            recommendations_section += f"{recommendation.explanation}\n\n"
            recommendations_section += f'- "{recommendation.example}"\n'
            recommendations_section += f'- "{recommendation.translation}"\n\n'

        post_date = (
            posted_at.isoformat(timespec="seconds")
            if posted_at
            else datetime.datetime.now(tz=ZoneInfo("Asia/Seoul")).isoformat(
                timespec="seconds"
            )
        )
        full_content = (
            (
                "---\n"
                f'category: "영어표현"\n'
                f'date: "{post_date}"\n'
                f'thumbnail: "{blog_num:03d}.png"\n'
                f"alt: \"'{sanitized_expression}' 영어표현 썸네일\"\n"
                f'title: "{self._escape_text(content.title)}"\n'
                f"desc: "
                f'"{blog_meta.description} 다양한 예문을 통해서 연습하고 본인의 표현으로 만들어 보세요."\n'
                f"faqs: \n"
                f"{faqs_section}"
                f"---\n\n"
                f"!['{sanitized_expression}' 영어표현](./{blog_num:03d}.png)\n\n"
                f"## 🌟 영어 표현 - {sanitized_expression}\n\n"
                f"{content_body}\n\n"
                f"## 💬 연습해보기\n\n"
                f"{formatted_examples}\n\n"
                f"## 🤝 함께 알아두면 좋은 표현들\n\n"
                f"{recommendations_section}"
                f"---\n\n"
                f"{content_footer}\n\n"
            )
            .replace("‘", "'")
            .replace("’", "'")
            .replace("“", '"')
            .replace("”", '"')
            .replace("~요", "")
        )

        return full_content

    def _escape_text(self, text: str) -> str:
        """
        Escape the text for the given expression
        """
        return text.replace('"', "'")

    def _get_expression_prompt(self, expression: str) -> str:
        """
        Get the input prompt for the given expression
        """
        if "(" in expression and ")" in expression:
            return f"expression: '{expression}' // REMOVE text inside parentheses in the output"
        return f"expression: '{expression}'"
