"""Link expressions in markdown files."""

import re
from pathlib import Path

from engple.config import config
from ..models import Expression, LinkingResult, LinkMatch
from .context_detector import ContextDetector
from loguru import logger


class ExpressionLinker:
    """Links a single expression across markdown files."""

    def __init__(
        self,
        dry_run: bool = False,
    ):
        self.dry_run = dry_run
        self.context_detector = ContextDetector()

    def link_expression(self, expression: Expression, max_links: int | None = None) -> LinkingResult:
        """Link a single expression across all markdown files."""
        logger.info(f"Linking expression: {expression.base_form}")
        logger.info(f"Variations: {expression.variations}")
        logger.info(f"Target path: {expression.url_path}")
        markdown_files = list(config.blog_dir.rglob("*.md"))
        logger.info(f"Found {len(markdown_files)} markdown files")

        result = LinkingResult(
            files_processed=0,
            files_modified=0,
            links_added=0,
            expressions_linked={},
        )

        for file_path in markdown_files:
            if file_path.resolve() == expression.file_path.resolve():
                continue

            if max_links is not None:
                content = file_path.read_text(encoding="utf-8")
                existing_links = self.context_detector.count_existing_links(content)

                if existing_links >= max_links:
                    logger.warning(
                        f"Skipping {file_path.name}: existing links {existing_links} >= max {max_links}"
                    )
                    result.files_processed += 1
                    continue

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
        with file_path.open("r", encoding="utf-8") as f:
            content = f.read()

        if not content:
            return LinkingResult(
                files_processed=1,
                files_modified=0,
                links_added=0,
                expressions_linked={},
            )

        modified_content, links_added = self.apply_link(content, expression)

        if links_added > 0 and modified_content != content:
            if self._write_file(
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
    
    def _write_file(self, file_path: Path, content: str, dry_run: bool) -> bool:
        """Write content to a file."""
        if dry_run:
            logger.info(f"[DRY RUN] Would write to {file_path}")
            return True

        try:
            file_path.write_text(content, encoding="utf-8")
            return True
        except Exception as e:
            logger.error(f"Error writing {file_path}: {e}")
            return False

    def apply_link(self, content: str, expression: Expression) -> tuple[str, int]:
        """Apply link for an expression in content. Returns (modified_content, links_added)."""

        matches = self._find_matches(content, expression)
        for match in matches:
            if self._is_valid_match(content, match):
                if match.is_html_context:
                    link = f'<a href="{expression.url_path}">{match.text}</a>'
                else:
                    link = f"[{match.text}]({expression.url_path})"

                # Apply the link
                modified_content = content[: match.start] + link + content[match.end :]

                logger.debug(
                    f"Linked '{match.text}' -> '{expression.base_form}' "
                    f"({'HTML' if match.is_html_context else 'Markdown'})"
                )

                return modified_content, 1

        return content, 0

    def _find_matches(self, content: str, expression: Expression) -> list[LinkMatch]:
        """Find all potential matches for expression variations."""
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

        return sorted(matches, key=lambda m: m.start)

    def _is_valid_match(self, content: str, match: LinkMatch) -> bool:
        """Check if a match is valid for linking."""
        # Skip if inside existing link
        if self.context_detector.is_inside_existing_link(content, match.start):
            return False

        # Skip if in inappropriate context
        if self.context_detector.should_skip_context(content, match.start, match.end):
            return False

        return True