import pytest
from engple.utils.variation_generator import generate_variations


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
        ("", set()),  # empty input
        ("   ", set()),  # whitespace only
    ])
    def test_generate_variations(self, word, expected_variations):
        """Test variation generation for various word types."""
        variations = generate_variations(word)

        assert set(variations) == expected_variations
