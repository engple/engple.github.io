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
