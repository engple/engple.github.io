"""CLI for automated expression linking system."""

import sys
import typer
from loguru import logger

from engple.core import ExpressionLinker
from engple.models import Expression
from engple.utils import generate_variations, get_expr_path

app = typer.Typer(help="Automated English Expression Linking System")


@app.command()
def link_expression(
    expr: str = typer.Argument(..., help="The expression to link"),
    target_dir: str = typer.Option(
        "../src/posts/blog", help="Target directory containing markdown files"
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

    variations = generate_variations(expr)
    expr_path = get_expr_path(expr)

    if not expr_path:
        logger.warning(f"❌ Expression path not found for: '{expr}'")
        sys.exit(1)

    expression = Expression(base_form=expr, url_path=expr_path.url_path, file_path=expr_path.file_path, variations=variations)
    linker = ExpressionLinker(target_dir=target_dir, dry_run=dry_run)
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


if __name__ == "__main__":
    app()
