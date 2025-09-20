"""CLI for automated expression linking system."""

from loguru import logger
import typer

from engple.services.write_blog import handle_write_blog
from engple.services.link_expression import handle_link_expression
from engple.services.link_all_expressions import handle_link_all_expressions

app = typer.Typer(help="Automated English Expression Linking System")

logger.remove()
logger.add(lambda msg: print(msg, end=""), level="INFO")


@app.command()
def link_expression(
    expr: str = typer.Argument(..., help="The expression to link"),
    max_links: int = typer.Option(
        8,
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
    handle_link_expression(expr, max_links, dry_run, verbose)


@app.command()
def link_all_expressions(
    target_expr: str = typer.Argument(
        ..., help="The target expression to link other expressions to"
    ),
    max_links: int = typer.Option(
        8,
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
    handle_link_all_expressions(target_expr, max_links, dry_run, verbose)


@app.command()
def write_blog(
    count: int = typer.Option(1, help="Maximum number of posts to generate"),
    no_link: bool = typer.Option(False, help="Do not link the expressions"),
    max_links: int = typer.Option(
        8,
        "--max-links",
        help="Maximum links per post (omit for unlimited)",
    ),
):
    """Generate a blog post draft with a specified number of expressions."""
    expressions = handle_write_blog(count)

    if not no_link:
        for expression in expressions:
            handle_link_expression(expression, max_links=max_links)
            handle_link_all_expressions(expression, max_links=max_links)


if __name__ == "__main__":
    app()
