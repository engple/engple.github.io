"""CLI for automated expression linking system."""

import typer
from loguru import logger

from engple.core import VariationGenerator, ExpressionLinker

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

    # Setup logging
    if verbose:
        logger.remove()
        logger.add(lambda msg: print(msg, end=""), level="DEBUG")
    else:
        logger.remove()
        logger.add(lambda msg: print(msg, end=""), level="INFO")

    logger.info(f"🔗 Linking expression: '{expr}'")

    try:
        # 1. Generate variations and create Expression object
        generator = VariationGenerator()
        expression = generator.create_expression(expr)

        logger.info(
            f"📝 Generated {len(expression.variations)} variations: {', '.join(expression.variations)}"
        )
        logger.info(f"🎯 Target path: {expression.path}")

        # 2. Link expression across all files
        linker = ExpressionLinker(target_dir=target_dir, dry_run=dry_run)
        result = linker.link_expression(expression)

        # 3. Report results
        logger.info("")
        logger.info("📊 Results:")
        logger.info(f"   Files processed: {result.files_processed}")
        logger.info(f"   Files modified: {result.files_modified}")
        logger.info(f"   Links added: {result.links_added}")

        if result.backup_created:
            logger.info("💾 Backup created successfully")

        if dry_run:
            logger.info("🔍 Dry run completed - no files were modified")
        else:
            logger.success("✅ Expression linking completed successfully!")

    except Exception as e:
        logger.error(f"❌ Error: {e}")
        raise typer.Exit(1)


if __name__ == "__main__":
    app()
