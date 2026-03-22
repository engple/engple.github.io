import datetime
import random
from pathlib import Path
from zoneinfo import ZoneInfo

from loguru import logger

from engple.config import config
from engple.core.blog_writer import BlogWriter
from engple.core.image_searcher import search_image
from engple.utils import (
    clean_expression,
    format_expression_seed,
    get_existing_expression_map,
    normalize_expression,
)
from engple.utils.image import render_expression_thumbnail

OVERSAMPLE_MULTIPLIER = 2
MAX_CANDIDATE_GENERATION_ROUNDS = 5


async def handle_write_blog(count: int) -> list[str]:
    writer = BlogWriter()
    accepted_expressions: list[str] = []
    known_expressions = get_existing_expression_map()
    post_schedule = _build_post_schedule(count)
    blog_in_english_dir = config.blog_dir / "in-english"

    for round_idx in range(MAX_CANDIDATE_GENERATION_ROUNDS):
        if len(accepted_expressions) >= count:
            break

        remaining = count - len(accepted_expressions)
        batch_size = _get_candidate_batch_size(remaining)
        candidate_expressions = await writer.generate_candidate_expressions(
            sorted(known_expressions.values()),
            batch_size,
        )
        filtered_candidates = _filter_candidate_expressions(
            candidate_expressions,
            known_expressions,
        )
        annotated_candidates = await writer.annotate_candidate_expressions(
            filtered_candidates
        )

        if not annotated_candidates:
            logger.warning(
                "No unique candidate expressions accepted in generation round {}.",
                round_idx + 1,
            )
            continue

        for candidate in annotated_candidates:
            if len(accepted_expressions) >= count:
                break

            canonical_expression = clean_expression(candidate)
            candidate_key = normalize_expression(candidate)
            blog_num = _get_next_blog_num()
            posted_at = post_schedule[len(accepted_expressions)]
            generated_blog = await writer.generate(candidate, blog_num, posted_at)
            generated_key = normalize_expression(generated_blog.expression)

            if generated_key != candidate_key:
                logger.warning(
                    "Rejected generated blog due to expression drift: '{}' -> '{}'",
                    candidate,
                    generated_blog.expression,
                )
                continue

            blog_path = (
                blog_in_english_dir
                / f"{blog_num:03d}.{canonical_expression.replace(' ', '-')}.md"
            )
            thumbnail_path = blog_in_english_dir / f"{blog_num:03d}.png"

            await generate_thumbnail(
                thumbnail_path,
                canonical_expression,
                generated_blog.meanings,
            )

            blog_path.write_text(generated_blog.content, encoding="utf-8")
            logger.debug(f"✅ Successfully wrote blog for {canonical_expression}")

            accepted_expressions.append(canonical_expression)
            known_expressions[candidate_key] = format_expression_seed(
                canonical_expression,
                generated_blog.meanings[0] if generated_blog.meanings else None,
            )

    if len(accepted_expressions) < count:
        if not accepted_expressions:
            raise RuntimeError(
                "Unable to generate enough unique expressions. "
                f"Requested {count}, wrote {len(accepted_expressions)} after "
                f"{MAX_CANDIDATE_GENERATION_ROUNDS} rounds."
            )

        logger.warning(
            "Generated only {} of {} requested expressions after {} rounds. "
            "Continuing with partial output.",
            len(accepted_expressions),
            count,
            MAX_CANDIDATE_GENERATION_ROUNDS,
        )

    return accepted_expressions


def _build_post_schedule(count: int) -> list[datetime.datetime]:
    if count <= 0:
        return []

    post_schedule = [datetime.datetime.now(tz=ZoneInfo("Asia/Seoul"))]
    for _ in range(count - 1):
        post_schedule.append(post_schedule[-1] - _get_post_interval())

    return list(reversed(post_schedule))


def _get_candidate_batch_size(remaining: int) -> int:
    return max(remaining * OVERSAMPLE_MULTIPLIER, remaining)


def _filter_candidate_expressions(
    candidates: list[str],
    known_expressions: dict[str, str],
) -> list[str]:
    filtered: list[str] = []
    seen_in_batch: set[str] = set()

    for candidate in candidates:
        cleaned = clean_expression(candidate)
        normalized = normalize_expression(cleaned)

        if not normalized:
            continue

        if normalized in known_expressions or normalized in seen_in_batch:
            continue

        filtered.append(cleaned)
        seen_in_batch.add(normalized)

    return filtered


def _get_post_interval() -> datetime.timedelta:
    return datetime.timedelta(
        minutes=30 + random.randint(0, 20), seconds=random.randint(0, 60)
    )


def _get_next_blog_num() -> int:
    blog_in_english_dir = config.blog_dir / "in-english"
    last_num = max(
        [
            int(p.stem.split(".")[0])
            for p in blog_in_english_dir.rglob("*.md")
            if p.stem.split(".")[0].isdigit()
        ]
    )
    num = f"{last_num + 1:03d}"
    return int(num)


async def generate_thumbnail(path: Path, expression: str, meanings: list[str]):
    best_meaning = meanings[0]
    query = f"{expression} ({best_meaning})"
    image = await search_image(query)
    render_expression_thumbnail(path.as_posix(), image.url, best_meaning)
    logger.debug(f"✅ Successfully generated thumbnail for {expression}")


__all__ = ["handle_write_blog", "generate_thumbnail"]
