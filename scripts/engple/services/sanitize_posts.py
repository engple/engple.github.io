from pathlib import Path

from loguru import logger

from engple.config import config
from engple.utils.null_bytes import (
    NullByteRemovalResult,
    collect_markdown_posts,
    remove_null_bytes_from_post_files,
)


def handle_sanitize_posts(
    *,
    write: bool = False,
    target_dir: Path | None = None,
) -> list[NullByteRemovalResult]:
    root = target_dir or config.blog_dir
    results = remove_null_bytes_from_post_files(
        collect_markdown_posts(root),
        write=write,
    )
    changed_results = [result for result in results if result.changed]

    action = "Updated" if write else "Would update"
    for result in changed_results:
        logger.info("{} {}\n", action, result.path)

    logger.info(
        "{} null bytes in {} of {} markdown post(s).\n",
        action,
        len(changed_results),
        len(results),
    )
    return results


__all__ = ["handle_sanitize_posts"]
