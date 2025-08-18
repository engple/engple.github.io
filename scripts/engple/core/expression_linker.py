"""Link expressions in markdown files."""

import re
from typing import List
from pathlib import Path
from ..models import Expression, LinkingResult, LinkMatch
from ..utils import ContextDetector, BackupManager
from .file_processor import FileProcessor
from loguru import logger


class ExpressionLinker:
    """Links a single expression across markdown files."""

    def __init__(self, target_dir: str = "../src/posts/blog", dry_run: bool = False):
        self.target_dir = Path(target_dir)
        self.dry_run = dry_run
        self.context_detector = ContextDetector()
        self.backup_manager = BackupManager()
        self.file_processor = FileProcessor()

    def link_expression(self, expression: Expression) -> LinkingResult:
        """Link a single expression across all markdown files."""
        # TODO: Implement the main linking logic

        logger.info(f"Linking expression: {expression.base_form}")
        logger.info(f"Variations: {expression.variations}")
        logger.info(f"Target path: {expression.path}")

        # 1. Find all markdown files
        markdown_files = self.file_processor.find_markdown_files(self.target_dir)
        logger.info(f"Found {len(markdown_files)} markdown files")

        # 2. Create backup if not dry run
        backup_created = False
        if not self.dry_run and markdown_files:
            backup_created = self.backup_manager.create_backup(self.target_dir)

        # 3. Process each file
        result = LinkingResult(
            files_processed=0,
            files_modified=0,
            links_added=0,
            expressions_linked={},
            backup_created=backup_created,
        )

        for file_path in markdown_files:
            file_result = self._process_file(file_path, expression)
            result.files_processed += 1

            if file_result.links_added > 0:
                result.files_modified += 1
                result.links_added += file_result.links_added

                if expression.base_form not in result.expressions_linked:
                    result.expressions_linked[expression.base_form] = 0
                result.expressions_linked[expression.base_form] += (
                    file_result.links_added
                )

                logger.info(
                    f"Modified: {file_path.name} (+{file_result.links_added} links)"
                )

        return result

    def _process_file(self, file_path: Path, expression: Expression) -> LinkingResult:
        """Process a single markdown file."""
        # TODO: Implement single file processing

        # Read file
        content = self.file_processor.read_file(file_path)
        if content is None:
            return LinkingResult(
                files_processed=1,
                files_modified=0,
                links_added=0,
                expressions_linked={},
            )

        # Find and apply links
        modified_content, links_added = self._apply_links(content, expression)

        # Write back if modified
        if links_added > 0 and modified_content != content:
            if self.file_processor.write_file(
                file_path, modified_content, self.dry_run
            ):
                return LinkingResult(
                    files_processed=1,
                    files_modified=1,
                    links_added=links_added,
                    expressions_linked={expression.base_form: links_added},
                )

        return LinkingResult(
            files_processed=1, files_modified=0, links_added=0, expressions_linked={}
        )

    def _apply_links(self, content: str, expression: Expression) -> tuple[str, int]:
        """Apply links for an expression in content. Returns (modified_content, links_added)."""
        # TODO: Implement link application logic

        # Find all potential matches
        matches = self._find_matches(content, expression)

        # Apply first valid match only
        for match in matches:
            if self._is_valid_match(content, match):
                # Create appropriate link format
                if match.is_html_context:
                    link = f'<a href="{expression.path}">{match.text}</a>'
                else:
                    link = f"[{match.text}]({expression.path})"

                # Apply the link
                modified_content = content[: match.start] + link + content[match.end :]

                logger.debug(
                    f"Linked '{match.text}' -> '{expression.base_form}' "
                    f"({'HTML' if match.is_html_context else 'Markdown'})"
                )

                return modified_content, 1

        return content, 0

    def _find_matches(self, content: str, expression: Expression) -> List[LinkMatch]:
        """Find all potential matches for expression variations."""
        # TODO: Implement match finding
        matches = []

        for variation in expression.variations:
            pattern = r"\b" + re.escape(variation) + r"\b"

            for match in re.finditer(pattern, content, re.IGNORECASE):
                is_html = self.context_detector.is_html_context(content, match.start())

                matches.append(
                    LinkMatch(
                        start=match.start(),
                        end=match.end(),
                        text=match.group(),
                        expression=expression,
                        is_html_context=is_html,
                    )
                )

        # Sort by position (earliest first)
        return sorted(matches, key=lambda m: m.start)

    def _is_valid_match(self, content: str, match: LinkMatch) -> bool:
        """Check if a match is valid for linking."""
        # TODO: Implement match validation

        # Skip if inside existing link
        if self.context_detector.is_inside_existing_link(content, match.start):
            return False

        # Skip if in inappropriate context
        if self.context_detector.should_skip_context(content, match.start, match.end):
            return False

        return True
