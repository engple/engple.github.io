import datetime
from textwrap import dedent
import tomllib
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field
from pydantic_ai import Agent, PromptedOutput

from engple.utils.file import read_file  # type: ignore[import-untyped]
from loguru import logger
from engple.config import config


BLOG_PROMPT = tomllib.loads(read_file("./engple/prompts/blog.toml"))


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
        description="Main content of the blog written in Korean '~해요'체",
    )


class FAQ(BaseModel):
    question: str = Field(description="질문")
    answer: str = Field(description="답변")


class RelatedExpression(BaseModel):
    expression: str = Field(
        description=BLOG_PROMPT["related_expression"]["expression_description"]
    )
    explanation: str = Field(
        description=BLOG_PROMPT["related_expression"]["explanation_description"]
    )
    example: str = Field(
        description=BLOG_PROMPT["related_expression"]["example_description"]
    )
    translation: str = Field(
        description=BLOG_PROMPT["related_expression"]["translation_description"]
    )


class Recommendation(BaseModel):
    data: list[RelatedExpression] = Field(
        description="""- 5개의 관련 표현 목록
- 유사되는 표현 3개, 반대되는 표현 2개""",
        examples=[
            [
                RelatedExpression(
                    expression=item[0],
                    explanation=item[1],
                    example=item[2],
                    translation=item[3],
                )
                for item in BLOG_PROMPT["recommendation"]["examples"]
            ]
        ],
    )


class BlogMeta(BaseModel):
    description: str
    faqs: list[FAQ]


class BlogWriter:
    def __init__(self, *, expression_count: int = 10, recommendation_count: int = 3):
        self.expression_count = expression_count
        self.model_translation = config.model_translation
        self.model_content = config.model_content
        self.model_meta = config.model_meta
        self.model_recommend = config.model_recommend
        self.recommendation_count = recommendation_count

    def generate(self, expression: str) -> str:
        """
        Write a blog for the given expression using pydantic-ai agents
        """

        examples = self._generate_blog_examples(expression)
        translations = self._translate_blog_examples(examples)
        formatted_examples = self._format_blog_examples(examples, translations)
        content = self._write_blog_content(expression)
        blog_meta = self._write_blog_meta(expression, content)
        recommendations = self._recommend_other_expressions(expression)
        final = self._get_final_content(
            expression, content, blog_meta, formatted_examples, recommendations
        )
        return final

    def _generate_blog_examples(self, expression: str) -> list[str]:
        """
        Generate examples for the given expression
        """
        logger.info("📄 예제 생성 중...")
        # Build agent that returns a list[str]
        examples_agent = Agent(
            config.model_examples,
            output_type=PromptedOutput(list[str]),
        )
        res = examples_agent.run_sync(
            BLOG_PROMPT["example"]["prompt"].format(
                expression=expression, count=self.expression_count
            )
        )
        return res.output

    def _translate_blog_examples(self, examples: list[str]) -> list[str]:
        """
        Translate examples for the given expression
        """
        logger.info("📄 예제 번역 중...")
        translate_agent = Agent(
            self.model_translation,
            output_type=PromptedOutput(list[str]),
        )
        res = translate_agent.run_sync(
            BLOG_PROMPT["translation"]["prompt"].format(input=examples)
        )
        return res.output

    def _write_blog_content(self, expression: str) -> BlogContent:
        """
        Write a blog content for the given expression
        """
        logger.info("💬 블로그 작성 중...")
        blog_example = read_file("./data/blog_example-delay.md")

        example = BlogContent(
            expression="delay",
            title="'지연되다' 영어로 어떻게 표현할까 ⏳ - 연기, 미룸 영어로",
            body=blog_example,
        )
        content_agent = Agent(
            self.model_content,
            output_type=BlogContent,
            system_prompt=BLOG_PROMPT["blog_content"]["prompt"].format(
                examples=[example.model_dump_json()]
            ),
        )
        res = content_agent.run_sync(expression)
        return res.output

    def _write_blog_meta(self, expression: str, content: BlogContent) -> BlogMeta:
        """
        Write a og description for the given expression
        """
        logger.info("📝 블로그 메타 설명 작성 중...")
        meta_agent = Agent(
            self.model_meta,
            output_type=PromptedOutput(BlogMeta),
        )
        res = meta_agent.run_sync(
            BLOG_PROMPT["blogmeta"]["prompt"].format(
                expression=expression, input=content.body
            )
        )
        return res.output

    def _recommend_other_expressions(self, expression: str) -> list[RelatedExpression]:
        """
        Recommend other expressions for the given expression
        """
        logger.info("🔍 다른 표현 추천 중...")
        recommend_agent = Agent(
            self.model_recommend,
            output_type=PromptedOutput(list[RelatedExpression]),
        )
        res = recommend_agent.run_sync(
            BLOG_PROMPT["recommendation"]["prompt"].format(
                expression=expression, recommendation_count=self.recommendation_count
            )
        )
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

        full_content = (
            (
                "---\n"
                f'category: "영어표현"\n'
                f'date: "{datetime.datetime.now(tz=ZoneInfo("Asia/Seoul")).isoformat(timespec="seconds")}"\n'
                f'thumbnail: "000.png"\n'
                f"alt: \"'{expression}' 영어표현 썸네일\"\n"
                f'title: "{self._escape_text(content.title)}"\n'
                f"desc: "
                f'"{blog_meta.description} 다양한 예문을 통해서 연습하고 본인의 표현으로 만들어 보세요."\n'
                f"faqs: \n"
                f"{faq_section}"
                f"---\n\n"
                f"!['{expression}' 영어표현](./000.png)\n\n"
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
        )

        return full_content

    def _escape_text(self, text: str) -> str:
        """
        Escape the text for the given expression
        """
        return text.replace('"', "'")
