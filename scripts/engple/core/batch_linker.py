"""Batch processing for linking all discovered expressions."""

from __future__ import annotations

from dataclasses import dataclass

from loguru import logger

from ..models import LinkingResult, Expression
from .expression_linker import ExpressionLinker


@dataclass
class BatchResult:
    total_files_processed: int
    total_files_modified: int
    total_links_added: int
    per_expression: dict[str, LinkingResult]


class BatchLinker:
    def __init__(
        self,
        target_dir: str,
        dry_run: bool = False,
        max_links: int | None = None,
        count_all_links: bool = False,
    ) -> None:
        self.target_dir = target_dir
        self.dry_run = dry_run
        self.max_links = max_links
        self.count_all_links = count_all_links

    def run(self, expressions: list[Expression]) -> BatchResult:
        per_expression: dict[str, LinkingResult] = {}
        total_files_processed = 0
        total_files_modified = 0
        total_links_added = 0

        for i, expr in enumerate(expressions, start=1):
            logger.info(
                f"[{i}/{len(expressions)}] Linking expression: {expr.base_form}"
            )
            linker = ExpressionLinker(
                target_dir=self.target_dir,
                dry_run=self.dry_run,
                max_links=self.max_links,
            )
            res = linker.link_expression(expr)
            per_expression[expr.base_form] = res
            total_files_processed += res.files_processed
            total_files_modified += res.files_modified
            total_links_added += res.links_added

        return BatchResult(
            total_files_processed=total_files_processed,
            total_files_modified=total_files_modified,
            total_links_added=total_links_added,
            per_expression=per_expression,
        )
