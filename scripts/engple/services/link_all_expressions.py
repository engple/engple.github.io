import sys
from loguru import logger

from engple.core import BatchLinker
from engple.models import Expression
from engple.utils import generate_variations, get_expr_path
from engple.utils.expr_path import iter_expr_path


def handle_link_all_expressions(
    target_expr: str,
    max_links: int | None = None,
    dry_run: bool = False,
    verbose: bool = False,
) -> None:
    """Discover all expressions and link them within a single target post.

    - Finds the file for the target_expr.
    - Scans that file for occurrences of all other expressions.
    - Links those occurrences to their dedicated posts.
    - Respects max_links for the target file.

    Args:
        target_expr: The target expression to link other expressions to
        max_links: Maximum links per post (None for unlimited)
        dry_run: Preview changes without applying them
        verbose: Enable verbose logging
    """
    if verbose:
        logger.remove()
        logger.add(lambda msg: print(msg, end=""), level="DEBUG")

    # Validate max_links
    if max_links is not None and max_links <= 0:
        logger.error("max_links must be a positive integer or None for unlimited")
        sys.exit(2)

    logger.info(f"🎯 Targeting expression: '{target_expr}'")

    target_expr_path = get_expr_path(target_expr)
    if not target_expr_path:
        logger.error(f"Could not find file for target expression: '{target_expr}'")
        sys.exit(1)

    logger.info("🔎 Discovering all other expressions...")
    other_expressions = [
        Expression(
            base_form=expr_path.expr,
            url_path=expr_path.url_path,
            file_path=expr_path.file_path,
            variations=generate_variations(expr_path.expr),
        )
        for expr_path in iter_expr_path()
        if expr_path.expr != target_expr
    ]
    logger.info(f"Found {len(other_expressions)} other expressions to link.")

    batch = BatchLinker(
        dry_run=dry_run,
        max_links=max_links,
    )
    agg = batch.run(
        target_post_path=target_expr_path.file_path, expressions=other_expressions
    )

    logger.info("")
    logger.info("📊 Batch Results:")
    logger.info(f"   File processed: {target_expr_path.file_path}")
    logger.info(f"   Links added: {agg.total_links_added}")

    if dry_run:
        logger.info("🔍 Dry run completed - no files were modified")
    else:
        logger.success("✅ Batch expression linking completed successfully!")


__all__ = ["handle_link_all_expressions"]
