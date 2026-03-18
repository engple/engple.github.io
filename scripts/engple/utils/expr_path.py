from dataclasses import dataclass
import re
from typing import Iterable

from pathlib import Path

from engple.config import config


EXPR_HEADER_RE = re.compile(r"^##\s*🌟\s*영어 표현\s*-\s*(.+)$", re.MULTILINE)
EXPR_PAREN_RE = re.compile(r"\([^)]*\)")
EXPR_SPACE_RE = re.compile(r"\s+")
TITLE_MEANING_RE = re.compile(
    r"^title:\s*[\"']?'([^']+)' 영어로 어떻게 표현할까",
    re.MULTILINE,
)


@dataclass
class ExprPath:
    """Represents the file path for an expression."""

    expr: str
    url_path: str
    file_path: Path


def clean_expression(expr: str) -> str:
    """Extract the English expression and normalize whitespace."""
    without_gloss = EXPR_PAREN_RE.sub("", expr)
    return EXPR_SPACE_RE.sub(" ", without_gloss.strip())


def normalize_expression(expr: str) -> str:
    """Create a stable key for expression deduplication."""
    return clean_expression(expr).lower()


def get_expr_path(expr: str) -> ExprPath | None:
    """Infer the file path for a given expression."""
    for expr_path in iter_expr_path():
        if expr_path.expr == expr:
            return expr_path
    return None


def get_existing_expression_map() -> dict[str, str]:
    """Return published expressions keyed by English expression only."""
    expressions: dict[str, str] = {}
    blog_dir = config.blog_dir
    for md in blog_dir.rglob("*.md"):
        try:
            content = md.read_text(encoding="utf-8")
        except Exception:
            continue

        expr_match = EXPR_HEADER_RE.search(content)
        if not expr_match:
            continue

        expression = clean_expression(expr_match.group(1).strip())
        normalized = normalize_expression(expression)
        meaning = _extract_primary_korean_meaning(content)
        expressions.setdefault(normalized, format_expression_seed(expression, meaning))
    return expressions


def iter_expr_path() -> Iterable[ExprPath]:
    blog_dir = config.blog_dir
    for md in blog_dir.rglob("*.md"):
        try:
            content = md.read_text(encoding="utf-8")
        except Exception:
            continue

        m = EXPR_HEADER_RE.search(content)
        if not m:
            continue

        expr = m.group(1).strip()
        url = _compute_url_path(md, blog_dir)

        yield ExprPath(expr=expr, url_path=url, file_path=md.resolve())


def _compute_url_path(md_file: Path, blog_dir: Path) -> str:
    rel = md_file.relative_to(blog_dir)
    rel_no_suffix = rel.with_suffix("")
    parts = rel_no_suffix.parts
    # Collapse season-1 to root, keep other subfolders (e.g., in-english, vocab-1)
    if len(parts) >= 2 and parts[0] == "season-1":
        parts = parts[1:]
    rel_path = "/".join(parts)
    return f"/blog/{rel_path}/"


def format_expression_seed(expression: str, meaning: str | None = None) -> str:
    if not meaning:
        return clean_expression(expression)
    return f"{clean_expression(expression)} ({meaning.strip()})"


def _extract_primary_korean_meaning(content: str) -> str | None:
    match = TITLE_MEANING_RE.search(content)
    if not match:
        return None
    return match.group(1).strip()
