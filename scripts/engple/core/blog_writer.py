import datetime
import json
from textwrap import dedent
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field, field_validator
from pydantic_ai import Agent, PromptedOutput

from loguru import logger
from engple.config import config
from engple.constants import (
    BLOG_EXAMPLE_PATH,
    BLOG_PROMPT,
    BLOGMETA_EXAMPLE_PATH,
    EXAMPLE_SENTENCES_PATH,
    RECOMMENDATION_EXAMPLES_PATH,
)


class BlogContent(BaseModel):
    expression: str
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


class BlogWriter:
    def __init__(self, *, expression_count: int = 10, recommendation_count: int = 3):
        self.expression_count = expression_count
        self.model_translation = config.model_translation
        self.model_content = config.model_content
        self.model_meta = config.model_meta
        self.model_recommend = config.model_recommend
        self.recommendation_count = recommendation_count

    def generate(
        self,
        expression: str,
        blog_num: int,
        posted_at: datetime.datetime | None = None,
    ) -> str:
        """
        Write a blog for the given expression using pydantic-ai agents
        """
        examples = self._generate_blog_examples(expression)
        translations = self._translate_blog_examples(examples)
        formatted_examples = self._format_blog_examples(examples, translations)
        content = self._write_blog_content(expression)
        blog_meta = self._write_blog_meta(expression)
        recommendations = self._recommend_other_expressions(expression)
        final = self._get_final_content(
            expression,
            content,
            blog_meta,
            formatted_examples,
            recommendations,
            blog_num,
            posted_at,
        )
        return final

    def _generate_blog_examples(self, expression: str) -> list[str]:
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
        res = examples_agent.run_sync(f"expression: '{expression}'")
        return res.output

    def _translate_blog_examples(self, examples: list[str]) -> list[str]:
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
        res = translate_agent.run_sync(json.dumps(examples))
        return res.output

    def _write_blog_content(self, expression: str) -> BlogContent:
        """
        Write a blog content for the given expression
        """
        logger.info("💬 블로그 작성 중...")

        example = BlogContent(
            expression="delay",
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
        )
        res = content_agent.run_sync(f"expression: '{expression}'")
        return res.output

    def _write_blog_meta(self, expression: str) -> BlogMeta:
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
        )
        res = meta_agent.run_sync(f"expression: '{expression}'")
        return res.output

    def _recommend_other_expressions(self, expression: str) -> list[RelatedExpression]:
        """
        Recommend other expressions for the given expression
        """
        logger.info("🔍 다른 표현 추천 중...")

        examples = Recommendation.model_validate_json(
            RECOMMENDATION_EXAMPLES_PATH.read_bytes()
        )
        recommend_agent = Agent(
            self.model_recommend,
            output_type=PromptedOutput(list[RelatedExpression]),
            system_prompt=BLOG_PROMPT["recommendation"]["prompt"].format(
                count=self.recommendation_count,
                examples=examples.model_dump_json(),
            ),
            retries=2,
        )
        res = recommend_agent.run_sync(f"expression: '{expression}'")
        return res.output

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
        try:
            content_body, content_footer = content.body.split("---\n\n")
        except ValueError:
            content_body = content.body
            content_footer = ""

        # Build FAQ section
        faq_section = ""
        for faq in blog_meta.faqs:
            faq_section += f'  - question: "{self._escape_text(faq.question)}"\n'
            faq_section += f'    answer: "{self._escape_text(faq.answer)}"\n'

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
                f'thumbnail: "{blog_num}.png"\n'
                f"alt: \"'{expression}' 영어표현 썸네일\"\n"
                f'title: "{self._escape_text(content.title)}"\n'
                f"desc: "
                f'"{blog_meta.description} 다양한 예문을 통해서 연습하고 본인의 표현으로 만들어 보세요."\n'
                f"faqs: \n"
                f"{faq_section}"
                f"---\n\n"
                f"!['{expression}' 영어표현](./{blog_num}.png)\n\n"
                f"## 🌟 영어 표현 - {expression}\n\n"
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
            .replace("요~요", "요")
        )

        return full_content

    def _escape_text(self, text: str) -> str:
        """
        Escape the text for the given expression
        """
        return text.replace('"', "'")
