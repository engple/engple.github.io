import pytest
from engple.utils.variation_generator import generate_variations
from engple.utils.expr_path import get_expr_path


class TestVariationGenerator:
    """Test cases for variation_generator functions."""

    @pytest.mark.parametrize("word,expected_variations", [
        ("want", {"want", "wants", "wanted", "wanting"}),
        ("happen", {"happen", "happens", "happened", "happening"}),
        ("go", {"go", "goes", "went", "gone", "going"}),
        ("eat", {"eat", "eats", "ate", "eaten", "eating"}),
        ("cat", {"cat", "cats"}),
        ("child", {"child", "children"}),
        ("quickly", {"quickly"}),  # adverbs should not be inflected
        ("give up", {"give up", "gives up", "gave up", "given up", "giving up"}),
        ("get rid of", {"gets rid of", "got rid of", "getting rid of", "gotten rid of", "get rid of"}),
        ("", set()),  # empty input
        ("   ", set()),  # whitespace only
    ])
    def test_generate_variations(self, word, expected_variations):
        """Test variation generation for various word types."""
        actual_variations = generate_variations(word)

        assert set(actual_variations) == expected_variations


class TestExprPath:
    """Test cases for expr_path functions."""

    def test_get_expr_path(self):
        """Test get_expr_path with various expressions."""
        assert get_expr_path("get rid of") == "/blog/in-english/398.get-rid-of/"
        assert get_expr_path("on time") == "/blog/vocab-1/043.on-time/"
        assert get_expr_path("There's a good chance") == "/blog/가능성이-높아-영어표현/"

    def test_get_expr_path_not_found(self):
        """Test get_expr_path with expressions not found."""
        assert get_expr_path("nonexistent expression") is None