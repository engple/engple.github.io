from dataclasses import dataclass
import os
import re
from typing import Iterable

from pathlib import Path


EXPR_HEADER_RE = re.compile(r"^##\s*🌟\s*영어 표현\s*-\s*(.+)$", re.MULTILINE)


@dataclass
class ExprPath:
    """Represents the file path for an expression."""

    expr: str
    url_path: str
    file_path: Path


def get_expr_path(expr: str) -> ExprPath | None:
    """Infer the file path for a given expression."""
    for expr_path in iter_expr_path():
        if expr_path.expr == expr:
            return expr_path
    return None


def iter_expr_path() -> Iterable[ExprPath]:
    blog_dir = os.path.join(os.path.dirname(__file__), "../../../src/posts/blog")
    for md in Path(blog_dir).rglob("*.md"):
        try:
            content = md.read_text(encoding="utf-8")
        except Exception:
            continue

        m = EXPR_HEADER_RE.search(content)
        if not m:
            continue

        expr = m.group(1).strip()
        url = _compute_url_path(blog_dir, md)

        yield ExprPath(expr=expr, url_path=url, file_path=md.resolve())


def _compute_url_path(blog_dir: Path, md_file: Path) -> str:
    rel = md_file.relative_to(blog_dir)
    rel_no_suffix = rel.with_suffix("")
    parts = rel_no_suffix.parts
    # Collapse season-1 to root, keep other subfolders (e.g., in-english, vocab-1)
    if len(parts) >= 2 and parts[0] == "season-1":
        parts = parts[1:]
    rel_path = "/".join(parts)
    return f"/blog/{rel_path}/"
