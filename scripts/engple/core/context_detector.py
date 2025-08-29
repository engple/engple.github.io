"""Detect context for appropriate linking format."""


class ContextDetector:
    """Detects context to determine appropriate linking behavior."""

    def is_inside_existing_link(self, text: str, position: int) -> bool:
        """Check if position is inside an existing markdown or HTML link."""
        import re
        
        # Check for markdown links [text](url)
        # Find all markdown links in the text
        for match in re.finditer(r'\[([^\]]+)\]\(([^)]+)\)', text):
            link_start, link_end = match.span()
            bracket_end = match.start(2) - 2  # End of ']' before '('
            
            # Check if position is within the link text [text] part
            if match.start(1) <= position <= bracket_end:
                return True
                
            # Check if position is within the URL part (url)
            if match.start(2) <= position <= match.end(2):
                return True

        # Check for HTML links <a href="">text</a>
        for match in re.finditer(r'<a\s+[^>]*href=[\"\']([^\"\']+)[\"\'][^>]*>(.*?)</a>', text, re.IGNORECASE | re.DOTALL):
            link_start, link_end = match.span()
            # Check if position is anywhere within the HTML link
            if link_start <= position <= link_end:
                return True

        return False

    def is_html_context(self, text: str, position: int) -> bool:
        """Check if position is inside HTML tags requiring <a href> format."""
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
        # Skip code blocks
        if self._is_in_code_block(text, start):
            return True

        # Skip headers
        if self._is_in_header(text, start):
            return True

        # Skip YAML front matter
        if self._is_in_yaml_frontmatter(text, start):
            return True

        # Skip HTML comments
        if self._is_in_html_comment(text, start):
            return True

        # Skip inside HTML tags
        if self._is_in_html_tag(text, start):
            return True

        return False

    def _is_in_html_tag(self, text: str, position: int) -> bool:
        """Check if position is inside an HTML tag."""
        before_text = text[:position]
        after_text = text[position:]

        last_open_bracket = before_text.rfind("<")
        last_close_bracket = before_text.rfind(">")

        # If the last '<' is after the last '>', we are potentially inside a tag
        if last_open_bracket > last_close_bracket:
            # Check if there is a closing '>' after the position
            if ">" in after_text:
                return True

        return False

    def _is_in_code_block(self, text: str, position: int) -> bool:
        """Check if position is inside a code block."""
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
        # YAML frontmatter must start at the beginning of the file
        if not text.startswith("---"):
            return False

        # Look for the second occurrence of "---" (after the opening one)
        first_line_end = text.find("\n")
        if first_line_end == -1:
            return False

        remaining_text = text[first_line_end + 1 :]
        closing_marker_pos = remaining_text.find("\n---")

        if closing_marker_pos == -1:
            # No closing marker found, assume entire file is frontmatter (shouldn't happen)
            return True

        # Calculate absolute position of closing marker
        absolute_closing_pos = (
            first_line_end + 1 + closing_marker_pos + 4
        )  # +4 for "\n---"

        # Position is in frontmatter if it's before the closing marker
        return position < absolute_closing_pos

    def _is_in_html_comment(self, text: str, position: int) -> bool:
        """Check if position is inside an HTML comment (<!-- ... -->)."""
        before_text = text[:position]
        last_open = before_text.rfind("<!--")
        last_close = before_text.rfind("-->")
        # Inside comment if the last open marker is after the last close marker
        return last_open != -1 and last_open > last_close

    def count_existing_links(self, content: str) -> int:
        """Count existing links in the content.

        Counts both markdown and HTML links. Excludes code blocks, headers,
        and YAML front matter regions using context detection.
        """
        import re
        
        count = 0

        # Markdown links: [text](url)
        for m in re.finditer(r"\[([^\]]+)\]\(([^)]+)\)", content):
            start, end = m.span()
            if self.should_skip_context(content, start, end):
                continue
            count += 1

        # HTML links: <a href="url">text</a>
        for m in re.finditer(r"<a\s+[^>]*href=[\"\']([^\"\']+)[\"\'][^>]*>.*?</a>", content, re.IGNORECASE | re.DOTALL):
            start, end = m.span()
            if self.should_skip_context(content, start, end):
                continue
            count += 1
        
        return count
