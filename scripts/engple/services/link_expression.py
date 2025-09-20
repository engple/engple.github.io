import sys
from loguru import logger

from engple.core import ExpressionLinker
from engple.models import Expression
from engple.utils import generate_variations, get_expr_path


def handle_link_expression(
    expr: str,
    max_links: int | None = None,
    dry_run: bool = False,
    verbose: bool = False,
) -> None:
    """Generate variations and link an expression across all markdown files.

    This function will:
    1. Generate grammatical variations for the expression
    2. Find the appropriate blog path
    3. Link the first occurrence in each markdown file
    4. Use HTML format inside HTML tags, Markdown format elsewhere
    5. Create a backup before making changes (unless dry_run=True)

    Args:
        expr: The expression to link
        max_links: Maximum links per post (None for unlimited)
        dry_run: Preview changes without applying them
        verbose: Enable verbose logging
    """
    if verbose:
        logger.remove()
        logger.add(lambda msg: print(msg, end=""), level="DEBUG")

    logger.info(f"🔗 Linking expression: '{expr}'")

    # Validate max_links
    if max_links is not None and max_links <= 0:
        logger.error("max_links must be a positive integer or None for unlimited")
        sys.exit(2)

    variations = generate_variations(expr)
    expr_path = get_expr_path(expr)

    if not expr_path:
        logger.warning(f"❌ Expression path not found for: '{expr}'")
        sys.exit(1)

    expression = Expression(
        base_form=expr,
        url_path=expr_path.url_path,
        file_path=expr_path.file_path,
        variations=variations,
    )
    linker = ExpressionLinker(dry_run=dry_run)
    result = linker.link_expression(expression, max_links)

    logger.info("")
    logger.info("📊 Results:")
    logger.info(f"   Files processed: {result.files_processed}")
    logger.info(f"   Files modified: {result.files_modified}")
    logger.info(f"   Links added: {result.links_added}")

    if dry_run:
        logger.info("🔍 Dry run completed - no files were modified")
    else:
        logger.success("✅ Expression linking completed successfully!")


__all__ = ["handle_link_expression"]
