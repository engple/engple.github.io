"""Core functionality for expression linking."""

from .variation_generator import VariationGenerator
from .expression_linker import ExpressionLinker
from .file_processor import FileProcessor

__all__ = ["VariationGenerator", "ExpressionLinker", "FileProcessor"]
