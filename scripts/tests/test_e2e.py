"""End-to-end tests for the expression linking CLI tool.

These tests validate the complete workflow from CLI invocation to file modifications.
Tests use only the public interface (CLI commands) and mock the blog directory to use test fixtures.
"""

import tempfile
import shutil
import pytest
from pathlib import Path
from unittest.mock import patch
from typer.testing import CliRunner
from engple.config import config
import main
from main import app

FIXTURES_DIR = Path(__file__).parent / "fixtures"
MOCK_BLOG_DIR = FIXTURES_DIR / "mock_blog"


@pytest.fixture
def mock_blog_dir():
    """Create a temporary copy of the mock blog directory for each test."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_blog_dir = Path(temp_dir) / "mock_blog"
        shutil.copytree(MOCK_BLOG_DIR, temp_blog_dir)
        with patch.object(config, "blog_dir", temp_blog_dir):
            yield temp_blog_dir


@pytest.fixture
def runner():
    """Create a CliRunner instance for testing."""
    return CliRunner()


class TestLinkExpressionCommand:
    """Test cases for the link-expression CLI command."""

    def test_basic_linking(self, mock_blog_dir, runner):
        """Basic expression linking with real file modification."""
        # when
        result = runner.invoke(app, ["link-expression", "try to"])

        # then
        assert result.exit_code == 0
        assert "Files processed: 4" in result.stdout
        assert "Files modified: 2" in result.stdout
        assert "Links added: 2" in result.stdout

    def test_max_links_constraint(self, mock_blog_dir, runner):
        """Expression linking with max links constraint."""
        # when
        result = runner.invoke(app, ["link-expression", "try to", "--max-links", "5"])

        # then
        assert result.exit_code == 0
        assert "Modified: 035.morning-person.md (+1 links)" in result.stdout
        assert "Modified: 394.improve.md (+1 links)" in result.stdout
        assert "Skipping 125.ask-for.md: existing links 5 >= max 5" in result.stdout
        assert "Files processed: 4" in result.stdout
        assert "Files modified: 2" in result.stdout
        assert "Links added: 2" in result.stdout


    def test_nonexistent_expression_error(self, mock_blog_dir, runner):
        """Error handling for non-existent expressions."""
        # when
        result = runner.invoke(app, ["link-expression", "nonexistent-expression"])
        
        # then
        assert result.exit_code == 1
        assert "Expression path not found for: 'nonexistent-expression'" in result.stdout



class TestLinkAllExpressionsCommand:
    """Test cases for the link-all-expressions CLI command."""

    def test_basic_batch_linking(self, mock_blog_dir, runner):
        """Basic batch linking with real file modification."""
        # when
        result = runner.invoke(app, ["link-all-expressions", "improve"])

        # then
        assert result.exit_code == 0
        assert "394.improve.md" in result.stdout
        assert "Links added: 2" in result.stdout

    def test_batch_linking_with_max_links(self, mock_blog_dir, runner):
        """Batch linking with max links constraint."""
        # when
        result = runner.invoke(app, ["link-all-expressions", "try to", "--max-links", "3"])

        # then
        assert result.exit_code == 0
        assert "117.try-to.md" in result.stdout
        assert "Skipping 117.try-to.md: existing links 10 >= max 3" in result.stdout


    def test_nonexistent_target_expression_error(self, mock_blog_dir, runner):
        """Error handling for non-existent target expressions."""
        # when
        result = runner.invoke(app, ["link-all-expressions", "nonexistent-target"])

        # then
        assert result.exit_code == 1


class TestLinkTopicBlogsCommand:
    """Test cases for the link-topic-blogs CLI command."""

    def test_links_existing_topic_blogs_only(self, mock_blog_dir, runner):
        """Backfill topic blog links without modifying regular expression posts."""
        topic_path = mock_blog_dir / "topic" / "003.md"
        expression_path = mock_blog_dir / "in-english" / "035.morning-person.md"
        expression_before = expression_path.read_text(encoding="utf-8")
        topic_path.write_text(
            (
                "---\n"
                'title: "try to improve 영어로 배우기"\n'
                'desc: "try to improve should stay unlinked here"\n'
                "---\n\n"
                "## try to improve heading\n\n"
                '<span data-answer="try to improve">Attribute stays untouched.</span>\n\n'
                "Already linked: [try to](/blog/in-english/117.try-to/).\n\n"
                "I try to improve my English every day.\n"
            ),
            encoding="utf-8",
        )

        # Given
        command = ["link-topic-blogs"]

        # When
        result = runner.invoke(app, command)

        # Then
        assert result.exit_code == 0
        assert "Files processed: 2" in result.stdout
        assert "Files modified: 1" in result.stdout
        assert "Links added: 2" in result.stdout
        assert expression_path.read_text(encoding="utf-8") == expression_before

        content = topic_path.read_text(encoding="utf-8")
        assert 'title: "try to improve 영어로 배우기"' in content
        assert 'desc: "try to improve should stay unlinked here"' in content
        assert "## try to improve heading" in content
        assert 'data-answer="try to improve"' in content
        assert "Already linked: [try to](/blog/in-english/117.try-to/)." in content
        assert "I [try to](/blog/in-english/117.try-to/) [improve](/blog/in-english/394.improve/) my English every day." in content

    def test_link_topic_blogs_respects_max_links(self, mock_blog_dir, runner):
        """Backfill topic blog links should stop once max links is reached."""
        topic_path = mock_blog_dir / "topic" / "003.md"
        topic_path.write_text(
            (
                "---\n"
                'title: "학습 영어로 배우기"\n'
                "---\n\n"
                "I try to improve my English every day.\n"
            ),
            encoding="utf-8",
        )

        # Given
        command = ["link-topic-blogs", "--max-links", "1"]

        # When
        result = runner.invoke(app, command)

        # Then
        assert result.exit_code == 0
        assert "Links added: 1" in result.stdout

        content = topic_path.read_text(encoding="utf-8")
        assert content.count("](/blog/in-english/") == 1

    def test_write_topic_blog_links_generated_topic_post(
        self,
        mock_blog_dir,
        runner,
        monkeypatch,
    ):
        """`write-topic-blog` should link the generated topic post by default."""

        async def write_generated_topic_blog(topic, excludes, with_thumbnail):
            blog_path = mock_blog_dir / "topic" / "003.md"
            blog_path.write_text(
                (
                    "---\n"
                    'title: "학습 영어로 배우기"\n'
                    "---\n\n"
                    "I try to improve my English every day.\n"
                ),
                encoding="utf-8",
            )
            return blog_path

        monkeypatch.setattr(
            main,
            "handle_write_topic_blog",
            write_generated_topic_blog,
        )

        # Given
        command = ["write-topic-blog", "학습", "--no-thumbnail"]

        # When
        result = runner.invoke(app, command)

        # Then
        assert result.exit_code == 0
        assert "Generated topic blog:" in result.stdout

        content = (mock_blog_dir / "topic" / "003.md").read_text(encoding="utf-8")
        assert "I [try to](/blog/in-english/117.try-to/) [improve](/blog/in-english/394.improve/) my English every day." in content

    def test_write_topic_blog_respects_no_link(
        self,
        mock_blog_dir,
        runner,
        monkeypatch,
    ):
        """`write-topic-blog --no-link` should leave generated topic content unchanged."""

        async def write_generated_topic_blog(topic, excludes, with_thumbnail):
            blog_path = mock_blog_dir / "topic" / "003.md"
            blog_path.write_text(
                (
                    "---\n"
                    'title: "학습 영어로 배우기"\n'
                    "---\n\n"
                    "I try to improve my English every day.\n"
                ),
                encoding="utf-8",
            )
            return blog_path

        monkeypatch.setattr(
            main,
            "handle_write_topic_blog",
            write_generated_topic_blog,
        )

        # Given
        command = ["write-topic-blog", "학습", "--no-thumbnail", "--no-link"]

        # When
        result = runner.invoke(app, command)

        # Then
        assert result.exit_code == 0

        content = (mock_blog_dir / "topic" / "003.md").read_text(encoding="utf-8")
        assert "I try to improve my English every day." in content
