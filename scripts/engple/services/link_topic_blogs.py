import sys
from dataclasses import dataclass
from pathlib import Path

from loguru import logger

from engple.config import config
from engple.core import BatchLinker
from engple.models import Expression
from engple.utils import generate_variations
from engple.utils.expr_path import iter_expr_path


@dataclass
class TopicBlogLinkingResult:
    """Summarizes topic blog linking across one or more posts."""

    files_processed: int = 0
    files_modified: int = 0
    links_added: int = 0


def handle_link_topic_blogs(
    max_links: int | None = None,
    dry_run: bool = False,
    verbose: bool = False,
    target_paths: list[Path] | None = None,
) -> TopicBlogLinkingResult:
    """Link existing expression posts inside topic blog markdown files."""
    if verbose:
        logger.remove()
        logger.add(lambda msg: print(msg, end=""), level="DEBUG")

    if max_links is not None and max_links <= 0:
        logger.error("max_links must be a positive integer or None for unlimited")
        sys.exit(2)

    topic_paths = _get_topic_paths(target_paths)
    expressions = _get_expression_targets()
    result = _link_topic_paths(topic_paths, expressions, max_links, dry_run)

    logger.info("")
    logger.info("📊 Topic Blog Link Results:")
    logger.info(f"   Files processed: {result.files_processed}")
    logger.info(f"   Files modified: {result.files_modified}")
    logger.info(f"   Links added: {result.links_added}")

    if dry_run:
        logger.info("🔍 Dry run completed - no files were modified")
    else:
        logger.success("✅ Topic blog linking completed successfully!")

    return result


def _get_topic_paths(target_paths: list[Path] | None) -> list[Path]:
    if target_paths is not None:
        return [path for path in target_paths if _is_topic_post(path)]

    topic_dir = config.blog_dir / "topic"
    if not topic_dir.exists():
        return []

    return sorted(topic_dir.rglob("*.md"))


def _is_topic_post(path: Path) -> bool:
    try:
        path.resolve().relative_to((config.blog_dir / "topic").resolve())
    except ValueError:
        return False
    return path.suffix == ".md"


def _get_expression_targets() -> list[Expression]:
    return [
        Expression(
            base_form=expr_path.expr,
            url_path=expr_path.url_path,
            file_path=expr_path.file_path,
            variations=generate_variations(expr_path.expr),
        )
        for expr_path in iter_expr_path()
        if not _is_topic_post(expr_path.file_path)
    ]


def _link_topic_paths(
    topic_paths: list[Path],
    expressions: list[Expression],
    max_links: int | None,
    dry_run: bool,
) -> TopicBlogLinkingResult:
    result = TopicBlogLinkingResult()
    batch = BatchLinker(dry_run=dry_run, max_links=max_links)

    for topic_path in topic_paths:
        file_result = batch.run(topic_path, expressions)
        result.files_processed += 1
        result.links_added += file_result.total_links_added
        if file_result.total_links_added > 0:
            result.files_modified += 1
            logger.info(
                f"Modified topic blog: {topic_path.name} "
                f"(+{file_result.total_links_added} links)"
            )

    return result


__all__ = ["TopicBlogLinkingResult", "handle_link_topic_blogs"]
