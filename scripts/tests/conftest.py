"""Pytest configuration and fixtures for expression linking tests."""

import pytest
import tempfile
import shutil
from pathlib import Path


@pytest.fixture
def temp_dir():
    """Create a temporary directory for testing."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def test_fixtures_dir():
    """Get the path to test fixtures directory."""
    return Path(__file__).parent / "fixtures"


@pytest.fixture
def comprehensive_md(test_fixtures_dir):
    """Load comprehensive test markdown file."""
    with open(test_fixtures_dir / "comprehensive.md", "r", encoding="utf-8") as f:
        return f.read()


@pytest.fixture
def html_contexts_md(test_fixtures_dir):
    """Load HTML contexts test markdown file."""
    with open(test_fixtures_dir / "html_contexts.md", "r", encoding="utf-8") as f:
        return f.read()


@pytest.fixture
def edge_cases_md(test_fixtures_dir):
    """Load edge cases test markdown file."""
    with open(test_fixtures_dir / "edge_cases.md", "r", encoding="utf-8") as f:
        return f.read()


@pytest.fixture
def sample_expressions():
    """Sample expressions for testing."""
    return [
        {
            "base_form": "get rid of",
            "path": "/blog/in-english/398.get-rid-of/",
            "variations": ["get rid of", "gets rid of", "getting rid of", "got rid of"],
        },
        {
            "base_form": "choice",
            "path": "/blog/in-english/399.choice/",
            "variations": ["choice", "choices"],
        },
        {
            "base_form": "honestly",
            "path": "/blog/in-english/336.honestly/",
            "variations": ["honestly"],
        },
        {
            "base_form": "sometimes",
            "path": "/blog/in-english/270.sometimes/",
            "variations": ["sometimes"],
        },
        {
            "base_form": "try to",
            "path": "/blog/in-english/117.try-to/",
            "variations": ["try to", "tries to", "trying to", "tried to"],
        },
        {
            "base_form": "decide to",
            "path": "/blog/in-english/062.decide-to/",
            "variations": ["decide to", "decides to", "deciding to", "decided to"],
        },
        {
            "base_form": "used to",
            "path": "/blog/in-english/143.used-to/",
            "variations": ["used to"],
        },
        {
            "base_form": "go with",
            "path": "/blog/vocab-1/021.go-with/",
            "variations": [
                "go with",
                "goes with",
                "going with",
                "went with",
                "gone with",
            ],
        },
        {
            "base_form": "hold on to",
            "path": "/blog/vocab-1/031.hold-on-to/",
            "variations": ["hold on to", "holds on to", "holding on to", "held on to"],
        },
        {
            "base_form": "collect",
            "path": "/blog/in-english/350.collect/",
            "variations": ["collect", "collects", "collecting", "collected"],
        },
    ]


@pytest.fixture
def setup_test_directory(temp_dir, test_fixtures_dir):
    """Setup a complete test directory with all fixtures."""
    # Copy all fixture files to temp directory
    for fixture_file in test_fixtures_dir.glob("*.md"):
        shutil.copy(fixture_file, temp_dir)

    return temp_dir
