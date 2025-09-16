"""CLI for automated expression linking system."""

import datetime
import sys
from typing import Iterator, cast
import typer
from loguru import logger

from engple.core import (
    ExpressionLinker,
    BatchLinker,
    BlogWriter,
)
from engple.models import EngpleItem, Expression
from engple.utils import generate_variations, get_expr_path
from engple.utils.expr_path import iter_expr_path
from engple.constants import BLOG_IN_ENGLISH_DIR
from notion_client import Client as NotionClient
from engple.config import config

app = typer.Typer(help="Automated English Expression Linking System")


@app.command()
def link_expression(
    expr: str = typer.Argument(..., help="The expression to link"),
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


@app.command()
def link_all_expressions(
    target_expr: str = typer.Argument(
        ..., help="The target expression to link other expressions to"
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
    """Discover all expressions and link them within a single target post.

    - Finds the file for the `target-expr`.
    - Scans that file for occurrences of all other expressions.
    - Links those occurrences to their dedicated posts.
    - Respects --max-links for the target file.
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


@app.command()
def write_blog(
    count: int = typer.Option(1, help="Maximum number of posts to generate"),
):
    """Generate a blog post draft with a specified number of expressions."""
    writer = BlogWriter()

    for item in stream_engple_item(count):
        blog_num = get_blog_num(item.expression)
        content = writer.generate(item.expression)

        path = BLOG_IN_ENGLISH_DIR / f"{blog_num}.{item.expression}.md"
        with open(path, "w") as f:
            f.write(content)


def stream_engple_item(count: int) -> Iterator[EngpleItem]:
    notion_client = NotionClient(auth=config.notion_api_key.get_secret_value())
    database = cast(
        dict,
        notion_client.databases.query(
            database_id=config.notion_engple_database_id,
            filter={
                "and": [
                    {"property": "status", "select": {"is_empty": True}},
                    {"property": "thumbnail", "files": {"is_not_empty": True}},
                ]
            },
        ),
    )

    for idx, page in enumerate(database["results"]):
        status = (
            page["properties"]["status"]["select"]["name"]
            if page["properties"]["status"]["select"]
            else None
        )

        yield EngpleItem(
            expression=page["properties"]["expression"]["title"][0]["text"]["content"],
            thumbnail_url=page["properties"]["thumbnail"]["files"][0]["file"]["url"],
            status=status,
            created=datetime.datetime.fromisoformat(
                page["properties"]["created"]["created_time"]
            ),
        )

        if count - 1 == idx:
            break


def get_blog_num() -> str:
    last_num = max(
        [
            int(p.stem.split(".")[0])
            for p in BLOG_IN_ENGLISH_DIR.rglob("*.md")
            if p.stem.split(".")[0].isdigit()
        ]
    )
    num = f"{last_num + 1:03d}"
    return num


if __name__ == "__main__":
    app()
