from __future__ import annotations

import json
from typing import cast

from loguru import logger
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.settings import ModelSettings

from engple.constants import BLOG_PROMPT
from engple.utils import normalize_expression


class CandidateMeaning(BaseModel):
    expression: str = Field(
        description="The original English expression copied exactly from the input list.",
        examples=["like", "set up"],
    )
    meaning: str = Field(
        description="A short Korean gloss for the expression, without parentheses.",
        examples=["좋아하다", "설정하다"],
    )


class CandidateMeaningCreator:
    def __init__(self, model: str) -> None:
        self.model = model

    async def annotate(self, expressions: list[str]) -> list[str]:
        if not expressions:
            return []

        logger.info("🏷️ 후보 표현 뜻 보강 중...")
        meaning_agent = Agent(
            self.model,
            output_type=list[CandidateMeaning],
            system_prompt=BLOG_PROMPT["candidate_meaning"]["prompt"],
            retries=1,
            model_settings=ModelSettings(temperature=0.0),
        )
        res = await meaning_agent.run(json.dumps(expressions, ensure_ascii=False))
        annotated = cast(list[CandidateMeaning], res.output)

        meaning_map = {
            normalize_expression(item.expression): item.meaning.strip()
            for item in annotated
            if item.meaning.strip()
        }

        results: list[str] = []
        for expression in expressions:
            meaning = meaning_map.get(normalize_expression(expression))
            if meaning:
                results.append(f"{expression} ({meaning})")
                continue

            logger.warning(
                "Missing Korean gloss for candidate expression '{}'. Returning plain expression.",
                expression,
            )
            results.append(expression)

        return results


__all__ = ["CandidateMeaning", "CandidateMeaningCreator"]
