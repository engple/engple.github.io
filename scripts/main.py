"""CLI for automated expression linking system."""

import sys
import typer
from loguru import logger

from engple.core import (
    ExpressionLinker,
    BatchLinker,
)
from engple.models import Expression
from engple.utils import generate_variations, get_expr_path
from engple.utils.expr_path import iter_expr_path

app = typer.Typer(help="Automated English Expression Linking System")


@app.command()
def link_expression(
    expr: str = typer.Argument(..., help="The expression to link"),
    target_dir: str = typer.Option(
        "../src/posts/blog", help="Target directory containing markdown files"
    ),
    max_links: int | None = typer.Option(
        None,
        "--max-links",
        help="Maximum links per post (omit for unlimited)",
    ),
    dry_run: bool = typer.Option(
        False, "--dry-run", help="Preview changes without applying them"
    ),
    verbose: bool = typer.Option(
        False, "--verbose", "-v", help="Enable verbose logging"
    ),
) -> None:
    """Generate variations and link an expression across all markdown files.

    This command will:
    1. Generate grammatical variations for the expression
    2. Find the appropriate blog path
    3. Link the first occurrence in each markdown file
    4. Use HTML format inside HTML tags, Markdown format elsewhere
    5. Create a backup before making changes (unless --dry-run)

    Examples:
        python main.py link_expression "get rid of"
        python main.py link_expression "choice" --dry-run
        python main.py link_expression "honestly" --target-dir ./test --verbose
    """

    if verbose:
        logger.remove()
        logger.add(lambda msg: print(msg, end=""), level="DEBUG")
    else:
        logger.remove()
        logger.add(lambda msg: print(msg, end=""), level="INFO")

    logger.info(f"🔗 Linking expression: '{expr}'")

    # Validate max_links
    if max_links is not None and max_links <= 0:
        logger.error("--max-links must be a positive integer or omitted for unlimited")
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
    linker = ExpressionLinker(
        target_dir=target_dir, dry_run=dry_run, max_links=max_links
    )
    result = linker.link_expression(expression)

    logger.info("")
    logger.info("📊 Results:")
    logger.info(f"   Files processed: {result.files_processed}")
    logger.info(f"   Files modified: {result.files_modified}")
    logger.info(f"   Links added: {result.links_added}")

    if dry_run:
        logger.info("🔍 Dry run completed - no files were modified")
    else:
        logger.success("✅ Expression linking completed successfully!")


@app.command()
def link_all_expressions(
    target_dir: str = typer.Option(
        "../src/posts/blog", help="Target directory containing markdown files"
    ),
    max_links: int | None = typer.Option(
        None,
        "--max-links",
        help="Maximum links per post (omit for unlimited)",
    ),
    dry_run: bool = typer.Option(
        False, "--dry-run", help="Preview changes without applying them"
    ),
    verbose: bool = typer.Option(
        False, "--verbose", "-v", help="Enable verbose logging"
    ),
    count_all_links: bool = typer.Option(
        False,
        "--count-all-links",
        help="If set, count all links in a file toward max-links (instead of only expression links)",
    ),
) -> None:
    """Discover all expressions and link each across all posts.

    - Discovers expressions using '## 🌟 영어 표현 - {{expr}}' headers
    - Links occurrences in other posts to their dedicated post
    - Respects --max-links per target file
    - Skips self-references
    """

    if verbose:
        logger.remove()
        logger.add(lambda msg: print(msg, end=""), level="DEBUG")
    else:
        logger.remove()
        logger.add(lambda msg: print(msg, end=""), level="INFO")

    # Validate max_links
    if max_links is not None and max_links <= 0:
        logger.error("--max-links must be a positive integer or omitted for unlimited")
        sys.exit(2)

    logger.info("🔎 Discovering expressions...")
    expressions = [
        Expression(
            base_form=expr_path.expr,
            url_path=expr_path.url_path,
            file_path=expr_path.file_path,
            variations=generate_variations(expr_path.expr),
        )
        for expr_path in iter_expr_path()
    ]
    logger.info(f"Found {len(expressions)} expressions to process")

    batch = BatchLinker(
        target_dir=target_dir,
        dry_run=dry_run,
        max_links=max_links,
        count_all_links=count_all_links,
    )
    agg = batch.run(expressions)

    logger.info("")
    logger.info("📊 Batch Results:")
    logger.info(f"   Files processed: {agg.total_files_processed}")
    logger.info(f"   Files modified: {agg.total_files_modified}")
    logger.info(f"   Links added: {agg.total_links_added}")

    if dry_run:
        logger.info("🔍 Dry run completed - no files were modified")
    else:
        logger.success("✅ Batch expression linking completed successfully!")


if __name__ == "__main__":
    app()
