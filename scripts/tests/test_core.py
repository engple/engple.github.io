"""
Integration tests for ExpressionLinker.apply_link method.

Tests the integration between ExpressionLinker and ContextDetector,
focusing on essential functionality and key edge cases.
"""

import pytest
from pathlib import Path

from engple.core.expression_linker import ExpressionLinker
from engple.models import Expression


class TestApplyLinkIntegration:
    """Integration tests for apply_link method with ContextDetector."""

    @pytest.fixture
    def linker(self):
        return ExpressionLinker(dry_run=True)

    @pytest.fixture
    def basic_expression(self):
        return Expression(
            base_form="get rid of",
            url_path="/expressions/get-rid-of/",
            file_path=Path("/test/get-rid-of.md"),
            variations=["get rid of", "gets rid of", "getting rid of", "got rid of"]
        )

    @pytest.fixture
    def html_expression(self):
        return Expression(
            base_form="try to",
            url_path="/expressions/try-to/",
            file_path=Path("/test/try-to.md"),
            variations=["try to", "tries to", "trying to", "tried to"]
        )

    # Basic Functionality Tests
    def test_basic_markdown_linking(self, linker, basic_expression):
        """Test basic markdown linking in plain text."""
        # Given: Plain text content with target expression
        content = "I need to get rid of this old computer."
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Expression should be linked in markdown format
        expected = "I need to [get rid of](/expressions/get-rid-of/) this old computer."
        assert result_content == expected
        assert links_added == 1

    def test_html_context_linking(self, linker, html_expression):
        """Test HTML linking inside HTML tags."""
        # Given: Content inside HTML paragraph tags
        content = '<p>I try to learn English daily.</p>'
        
        # When: Applying link to the HTML content
        result_content, links_added = linker.apply_link(content, html_expression)
        
        # Then: Expression should be linked in HTML format
        expected = '<p>I <a href="/expressions/try-to/">try to</a> learn English daily.</p>'
        assert result_content == expected
        assert links_added == 1

    def test_case_insensitive_matching(self, linker, basic_expression):
        """Test that matching is case-insensitive."""
        # Given: Content with expression in uppercase
        content = "I need to GET RID OF this old computer."
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Expression should be linked preserving original case
        expected = "I need to [GET RID OF](/expressions/get-rid-of/) this old computer."
        assert result_content == expected
        assert links_added == 1

    def test_first_match_only(self, linker, basic_expression):
        """Test that only the first occurrence is linked."""
        # Given: Content with multiple occurrences of the expression
        content = "I get rid of things and then get rid of more things."
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Only the first occurrence should be linked
        assert result_content.count("[get rid of]") == 1
        assert links_added == 1

    def test_no_matches(self, linker, basic_expression):
        """Test content without target expression."""
        # Given: Content that doesn't contain the target expression
        content = "This is some random content without the target phrase."
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Content should remain unchanged
        assert result_content == content
        assert links_added == 0

    # Context Detection Tests
    def test_skip_existing_markdown_links(self, linker, basic_expression):
        """Test that existing markdown links are not modified."""
        # Given: Content with existing markdown link and free expression
        content = "This is a [get rid of](http://example.com) and this is another get rid of."
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Only the free expression should be linked, existing link preserved
        expected = "This is a [get rid of](http://example.com) and this is another [get rid of](/expressions/get-rid-of/)."
        assert result_content == expected
        assert links_added == 1

    def test_skip_existing_html_links(self, linker, basic_expression):
        """Test that existing HTML links are not modified."""
        # Given: Content with existing HTML link and free expression
        content = 'This is a <a href="http://example.com">get rid of</a> and this is another get rid of.'
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Only the free expression should be linked, existing link preserved
        expected = 'This is a <a href="http://example.com">get rid of</a> and this is another [get rid of](/expressions/get-rid-of/).'
        assert result_content == expected
        assert links_added == 1

    def test_skip_code_blocks(self, linker, basic_expression):
        """Test that code blocks are skipped."""
        # Given: Content with expression inside code block and outside
        content = """```python
def clean_up():
    get rid of old files
```
I need to get rid of this code."""
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Only expression outside code block should be linked
        assert "get rid of old files" in result_content  # Unchanged in code block
        assert "I need to [get rid of](/expressions/get-rid-of/) this code." in result_content
        assert links_added == 1

    def test_skip_inline_code(self, linker, basic_expression):
        """Test that inline code is skipped."""
        # Given: Content with expression inside inline code and outside
        content = "Use the `get rid of` function and get rid of old data."
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Only expression outside inline code should be linked
        expected = "Use the `get rid of` function and [get rid of](/expressions/get-rid-of/) old data."
        assert result_content == expected
        assert links_added == 1

    def test_skip_headers(self, linker, basic_expression):
        """Test that headers are skipped."""
        # Given: Content with expression in header and paragraph
        content = """# How to get rid of problems

This section explains how to get rid of issues."""
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Only expression in paragraph should be linked, header unchanged
        assert "# How to get rid of problems" in result_content  # Header unchanged
        assert "This section explains how to [get rid of](/expressions/get-rid-of/) issues." in result_content
        assert links_added == 1

    def test_skip_yaml_frontmatter(self, linker, basic_expression):
        """Test that YAML frontmatter is skipped."""
        # Given: Content with expression in YAML frontmatter and body
        content = """---
title: "How to get rid of things"
---

This post is about how to get rid of clutter."""
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Only expression in body should be linked, frontmatter unchanged
        assert 'title: "How to get rid of things"' in result_content  # Frontmatter unchanged
        assert "This post is about how to [get rid of](/expressions/get-rid-of/) clutter." in result_content
        assert links_added == 1

    def test_skip_html_comments(self, linker, basic_expression):
        """Test that HTML comments are skipped."""
        # Given: Content with expression in HTML comment and outside
        content = "<!-- Note: get rid of this comment --> I need to get rid of this item."
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Only expression outside comment should be linked
        expected = "<!-- Note: get rid of this comment --> I need to [get rid of](/expressions/get-rid-of/) this item."
        assert result_content == expected
        assert links_added == 1

    # HTML Context Tests
    def test_nested_html_context(self, linker, html_expression):
        """Test linking inside nested HTML tags."""
        # Given: Content with expression inside nested HTML tags
        content = '<div class="content"><span class="highlight">I try to stay positive.</span></div>'
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, html_expression)
        
        # Then: Expression should be linked in HTML format
        expected = '<div class="content"><span class="highlight">I <a href="/expressions/try-to/">try to</a> stay positive.</span></div>'
        assert result_content == expected
        assert links_added == 1

    def test_mixed_markdown_html(self, linker, html_expression):
        """Test content with both markdown and HTML."""
        # Given: Mixed content with expression in header, HTML div, and paragraph
        content = '''# Learning English

<div class="tip">
I try to practice daily.
</div>

And I try to stay consistent.'''
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, html_expression)
        
        # Then: Header should be skipped, first valid occurrence in HTML should be linked
        assert "# Learning English" in result_content  # Header unchanged
        assert 'I <a href="/expressions/try-to/">try to</a> practice daily.' in result_content
        assert links_added == 1

    # Edge Cases
    def test_word_boundaries(self, linker, basic_expression):
        """Test that only complete words are matched."""
        # Given: Content with partial match and complete match
        content = "I need to getridof and get rid of things."
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Only complete word match should be linked
        expected = "I need to getridof and [get rid of](/expressions/get-rid-of/) things."
        assert result_content == expected
        assert links_added == 1

    def test_expression_with_punctuation(self, linker, basic_expression):
        """Test expressions followed by punctuation."""
        # Given: Content with expression followed by punctuation
        content = "I need to get rid of things, right?"
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Expression should be linked correctly with punctuation preserved
        expected = "I need to [get rid of](/expressions/get-rid-of/) things, right?"
        assert result_content == expected
        assert links_added == 1

    def test_expression_variations(self, linker, basic_expression):
        """Test that different variations are matched."""
        # Given: Content with different variations of the expression
        test_cases = [
            "She gets rid of clutter weekly.",
            "He is getting rid of old books.", 
            "They got rid of the old furniture."
        ]
        
        # When: Applying link to each variation
        # Then: Each variation should be linked correctly
        for content in test_cases:
            result_content, links_added = linker.apply_link(content, basic_expression)
            assert "/expressions/get-rid-of/" in result_content
            assert links_added == 1

    def test_regex_special_characters(self, linker):
        """Test expressions containing regex special characters."""
        # Given: Expression with regex special characters and matching content
        regex_expression = Expression(
            base_form="test.case",
            url_path="/expressions/test-case/",
            file_path=Path("/test/test-case.md"),
            variations=["test.case", "test+case"]
        )
        content = "This is a test.case example."
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, regex_expression)
        
        # Then: Expression with special characters should be linked correctly
        expected = "This is a [test.case](/expressions/test-case/) example."
        assert result_content == expected
        assert links_added == 1

    def test_empty_content(self, linker, basic_expression):
        """Test empty content."""
        # Given: Empty content string
        content = ""
        
        # When: Applying link to empty content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Content should remain empty with no links added
        assert result_content == ""
        assert links_added == 0

    def test_multiline_content(self, linker, basic_expression):
        """Test content spanning multiple lines."""
        # Given: Multiline content with expression in the middle
        content = """This is the first line.
I need to get rid of old files.
This is the third line."""
        
        # When: Applying link to the multiline content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Expression should be linked while preserving line structure
        expected = """This is the first line.
I need to [get rid of](/expressions/get-rid-of/) old files.
This is the third line."""
        
        assert result_content == expected
        assert links_added == 1

    def test_code_within_html(self, linker, basic_expression):
        """Test code blocks inside HTML elements."""
        # Given: HTML content with code block and expression in both places
        content = """<div class="example">
```python
# get rid of old code
```
I need to get rid of this approach.
</div>"""
        
        # When: Applying link to the content
        result_content, links_added = linker.apply_link(content, basic_expression)
        
        # Then: Code block should be untouched, HTML context should be linked
        assert "# get rid of old code" in result_content  # Code unchanged
        assert 'I need to <a href="/expressions/get-rid-of/">get rid of</a> this approach.' in result_content
        assert links_added == 1
