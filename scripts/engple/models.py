"""Data models for expressions and linking results."""

from dataclasses import dataclass
from pathlib import Path
from typing import List, Dict


@dataclass
class Expression:
    """Represents an English expression with its variations and target path."""

    base_form: str
    url_path: str
    file_path: Path
    variations: List[str]


@dataclass
class LinkMatch:
    """Represents a potential link match in text."""

    start: int
    end: int
    text: str
    expression: Expression
    is_html_context: bool


@dataclass
class LinkingResult:
    """Results from processing a file or set of files."""

    files_processed: int
    files_modified: int
    links_added: int
    expressions_linked: Dict[str, int]
    errors: list[Exception] | None = None

    def __post_init__(self):
        if self.errors is None:
            self.errors = []
