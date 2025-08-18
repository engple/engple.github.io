"""Detect context for appropriate linking format."""


class ContextDetector:
    """Detects context to determine appropriate linking behavior."""

    def is_inside_existing_link(self, text: str, position: int) -> bool:
        """Check if position is inside an existing markdown or HTML link."""
        # TODO: Implement existing link detection
        before_text = text[:position]
        after_text = text[position:]

        # Check for markdown links [text](url)
        open_brackets = before_text.count("[") - before_text.count("]")
        if open_brackets > 0:
            if "](" in after_text:
                return True

        # Check for HTML links <a href="">text</a>
        last_open_tag = before_text.rfind("<a ")
        last_close_tag = before_text.rfind("</a>")
        if last_open_tag > last_close_tag:
            if "</a>" in after_text:
                return True

        return False

    def is_html_context(self, text: str, position: int) -> bool:
        """Check if position is inside HTML tags requiring <a href> format."""
        # TODO: Implement HTML context detection
        before_text = text[:position]

        # Check for common HTML tags
        html_tags = ["<span", "<div", "<p", "<li", "<td", "<th"]

        for tag in html_tags:
            last_open = before_text.rfind(tag)
            if last_open != -1:
                tag_name = tag[1:]  # Remove '<'
                close_tag = f"</{tag_name}>"
                last_close = before_text.rfind(close_tag)
                if last_open > last_close:
                    return True

        return False

    def should_skip_context(self, text: str, start: int, end: int) -> bool:
        """Check if we should skip linking in this context."""
        # TODO: Implement context skipping logic

        # Skip code blocks
        if self._is_in_code_block(text, start):
            return True

        # Skip headers
        if self._is_in_header(text, start):
            return True

        # Skip YAML front matter
        if self._is_in_yaml_frontmatter(text, start):
            return True

        return False

    def _is_in_code_block(self, text: str, position: int) -> bool:
        """Check if position is inside a code block."""
        # TODO: Implement code block detection
        before_text = text[:position]

        # Count triple backticks
        triple_ticks = before_text.count("```")
        if triple_ticks % 2 == 1:  # Odd number means inside code block
            return True

        # Check inline code
        line_start = before_text.rfind("\n") + 1
        line_before = before_text[line_start:]
        if line_before.count("`") % 2 == 1:  # Inside inline code
            return True

        return False

    def _is_in_header(self, text: str, position: int) -> bool:
        """Check if position is inside a markdown header."""
        # TODO: Implement header detection
        before_text = text[:position]
        line_start = before_text.rfind("\n") + 1
        line = text[
            line_start : text.find("\n", position)
            if "\n" in text[position:]
            else len(text)
        ]

        return line.strip().startswith("#")

    def _is_in_yaml_frontmatter(self, text: str, position: int) -> bool:
        """Check if position is inside YAML front matter."""
        # TODO: Implement YAML front matter detection
        return position < 200 and "---" in text[:position]
