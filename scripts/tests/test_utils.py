from pathlib import Path
import pytest
from engple.utils import generate_variations, get_expr_path


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
        result1 = get_expr_path("get rid of")
        assert result1 is not None
        assert result1.expr == "get rid of"
        assert result1.url_path == "/blog/in-english/398.get-rid-of/"
        assert result1.file_path.resolve() == Path("../src/posts/blog/in-english/398.get-rid-of.md").resolve()


        result2 = get_expr_path("on time")
        assert result2 is not None
        assert result2.expr == "on time"
        assert result2.url_path == "/blog/vocab-1/043.on-time/"
        assert result2.file_path.resolve() == Path("../src/posts/blog/vocab-1/043.on-time.md").resolve()
        
        result3 = get_expr_path("There's a good chance")
        assert result3 is not None
        assert result3.expr == "There's a good chance"
        assert result3.url_path == "/blog/가능성이-높아-영어표현/"
        assert result3.file_path.resolve() == Path("../src/posts/blog/season-1/가능성이-높아-영어표현.md").resolve()

    def test_get_expr_path_not_found(self):
        """Test get_expr_path with expressions not found."""
        assert get_expr_path("nonexistent expression") is None