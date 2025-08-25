"""Discover expressions and their target posts in the blog directory."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List

from loguru import logger

from ..models import Expression
from ..utils import generate_variations


EXPR_HEADER_RE = re.compile(r"^##\s*🌟\s*영어 표현\s*-\s*(.+)$", re.MULTILINE)


def _compute_url_path(blog_root: Path, md_file: Path) -> str:
    rel = md_file.relative_to(blog_root)
    rel_no_suffix = rel.with_suffix("")
    parts = rel_no_suffix.parts
    # Collapse season-1 to root, keep other subfolders (e.g., in-english, vocab-1)
    if len(parts) >= 2 and parts[0] == "season-1":
        parts = parts[1:]
    rel_path = "/".join(parts)
    return f"/blog/{rel_path}/"


@dataclass
class DiscoveredExpression:
    base_form: str
    file_path: Path
    url_path: str


class ExpressionDiscovery:
    """Scans markdown files to discover expressions and targets."""

    def __init__(self, target_dir: str = "../src/posts/blog") -> None:
        self.blog_root = Path(target_dir).resolve()

    def discover(self) -> List[DiscoveredExpression]:
        if not self.blog_root.exists():
            logger.error(f"Blog directory not found: {self.blog_root}")
            return []

        found: Dict[str, DiscoveredExpression] = {}
        for md in self.blog_root.rglob("*.md"):
            try:
                content = md.read_text(encoding="utf-8")
            except Exception as e:
                logger.error(f"Error reading {md}: {e}")
                continue

            m = EXPR_HEADER_RE.search(content)
            if not m:
                continue

            expr = m.group(1).strip()
            url = _compute_url_path(self.blog_root, md)
            if expr not in found:
                found[expr] = DiscoveredExpression(
                    base_form=expr, file_path=md.resolve(), url_path=url
                )

        # Deterministic order by expression
        return sorted(found.values(), key=lambda d: d.base_form.lower())

    def to_expressions(self, discovered: Iterable[DiscoveredExpression]) -> List[Expression]:
        result: List[Expression] = []
        for d in discovered:
            variations = generate_variations(d.base_form)
            result.append(
                Expression(
                    base_form=d.base_form,
                    url_path=d.url_path,
                    file_path=d.file_path,
                    variations=variations,
                )
            )
        return result
