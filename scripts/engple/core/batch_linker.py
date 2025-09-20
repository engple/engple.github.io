"""Batch processing for linking expressions within a single target post."""

from __future__ import annotations

import pathlib
from dataclasses import dataclass

from loguru import logger


from ..models import Expression
from .expression_linker import ExpressionLinker
from .context_detector import ContextDetector


@dataclass
class BatchResult:
    """Stores the aggregated result of a batch linking operation."""

    total_links_added: int = 0


class BatchLinker:
    """Orchestrates linking multiple expressions within a single target file."""

    def __init__(
        self,
        dry_run: bool = False,
        max_links: int | None = None,
    ) -> None:
        """Initializes the BatchLinker."""
        self.dry_run = dry_run
        self.max_links = max_links
        self.context_detector = ContextDetector()
        self.linker = ExpressionLinker(dry_run=dry_run)

    def run(
        self, target_post_path: str | pathlib.Path, expressions: list[Expression]
    ) -> BatchResult:
        """
        Links all provided expressions within the single target post.

        Args:
            target_post_path: The file path of the post to add links to.
            expressions: A list of expressions to find and link within the post.

        Returns:
            A BatchResult summarizing the operation.
        """
        result = BatchResult()

        target_path = pathlib.Path(target_post_path)
        if not target_path.exists():
            logger.error(f"Target file not found: {target_path}")
            return result

        content = target_path.read_text(encoding="utf-8")

        if self.max_links is not None:
            existing_links = self.context_detector.count_existing_links(content)
            if existing_links >= self.max_links:
                logger.debug(
                    f"Skipping {target_path.name}: existing links {existing_links} >= max {self.max_links}"
                )
                return result

        for expr in expressions:
            content, link_added = self.linker.apply_link(content, expr)
            result.total_links_added += link_added

        self._write_file(target_path, content)

        return result

    def _write_file(self, path: pathlib.Path, content: str) -> None:
        if self.dry_run:
            logger.info(f"[DRY RUN] Would write to {path}")
            return

        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
