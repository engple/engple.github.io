"""Tests for candidate expression generation outcomes."""

import asyncio
import random

from engple.core import expression_candidates as expression_candidates_module
from engple.core.expression_candidates import ExpressionCandidateCreator


def test_generate_groups_spelling_variants_and_keeps_multiword_candidates(
    monkeypatch,
):
    """`generate` should collapse spelling variants while preserving multi-word variety."""
    monkeypatch.setattr(
        expression_candidates_module,
        "top_n_list",
        _build_top_n_list(
            [
                "traveler",
                "traveller",
                "look after",
                "schoolhouse",
                "plow",
                "outing",
            ]
        ),
    )
    monkeypatch.setattr(
        expression_candidates_module,
        "zipf_frequency",
        _build_zipf_frequency_lookup(
            {
                ("traveler", "en"): 5.3,
                ("traveller", "en"): 5.3,
                ("look after", "en"): 5.5,
                ("schoolhouse", "en"): 4.9,
                ("plow", "en"): 4.8,
                ("outing", "en"): 4.7,
                ("look", "en"): 5.4,
                ("schoolhouse", "en"): 4.9,
                ("plow", "en"): 4.8,
                ("outing", "en"): 4.7,
                ("figure out", "en"): 5.4,
                ("make for", "en"): 5.0,
                ("figure", "en"): 5.1,
                ("make", "en"): 5.0,
            }
        ),
    )

    creator = ExpressionCandidateCreator(
        client=_FakeAsyncClient(
            {
                "work": ["figure out", "make for", "traveller"],
            }
        ),
        rng=random.Random(7),
        word_pool_size=6,
        datamuse_results=3,
    )

    # Given: The candidate sources contain spelling variants and several multi-word expressions.
    existing_expressions: list[str] = []

    # When: Candidate generation runs through the public API.
    generated = asyncio.run(creator.generate(existing_expressions, 4))

    # Then: Only one spelling variant should survive and at least two multi-word candidates should remain.
    assert len(generated) == 4
    assert len({"traveler", "traveller"} & set(generated)) <= 1
    assert sum(" " in expression for expression in generated) >= 2
    assert {"look after", "figure out", "make for"} & set(generated)

def test_generate_mixes_single_and_multiword_candidates_when_both_exist(
    monkeypatch,
):
    """`generate` should not fill the whole result with multi-word candidates when single words are available."""
    monkeypatch.setattr(
        expression_candidates_module,
        "top_n_list",
        _build_top_n_list(
            [
                "look after",
                "figure out",
                "make for",
                "inside joke",
                "work on",
                "traveler",
                "schoolhouse",
                "outing",
                "plow",
                "harbor",
            ]
        ),
    )
    monkeypatch.setattr(
        expression_candidates_module,
        "zipf_frequency",
        _build_zipf_frequency_lookup(
            {
                ("look after", "en"): 5.8,
                ("figure out", "en"): 5.7,
                ("make for", "en"): 5.6,
                ("inside joke", "en"): 5.5,
                ("work on", "en"): 5.4,
                ("traveler", "en"): 4.0,
                ("schoolhouse", "en"): 4.2,
                ("outing", "en"): 4.1,
                ("plow", "en"): 3.9,
                ("harbor", "en"): 3.8,
                ("look", "en"): 5.2,
                ("figure", "en"): 5.1,
                ("make", "en"): 5.0,
                ("inside", "en"): 5.0,
                ("joke", "en"): 4.9,
                ("work", "en"): 5.0,
            }
        ),
    )

    creator = ExpressionCandidateCreator(
        client=_FakeAsyncClient({}),
        rng=random.Random(4),
        word_pool_size=10,
        datamuse_results=1,
    )

    # Given: The candidate pool contains enough high-scoring multi-word and single-word options.
    existing_expressions: list[str] = []

    # When: Candidate generation selects five public candidates.
    generated = asyncio.run(creator.generate(existing_expressions, 5))

    # Then: The result should keep a visible mix instead of becoming all multi-word expressions.
    assert len(generated) == 5
    assert any(" " in expression for expression in generated)
    assert any(" " not in expression for expression in generated)
def test_generate_expands_candidate_search_when_top_results_are_exhausted(
    monkeypatch,
):
    """`generate` should widen the candidate window until it finds an unseen expression."""
    monkeypatch.setattr(
        expression_candidates_module,
        "top_n_list",
        _build_top_n_list(
            ["known expression"] * 20
            + ["fresh phrase"]
            + ["backup phrase", "reserve phrase"]
        ),
    )
    monkeypatch.setattr(
        expression_candidates_module,
        "zipf_frequency",
        _build_zipf_frequency_lookup(
            {
                ("known expression", "en"): 5.1,
                ("fresh phrase", "en"): 5.0,
                ("backup phrase", "en"): 4.9,
                ("reserve phrase", "en"): 4.8,
                ("known", "en"): 5.0,
                ("expression", "en"): 5.0,
                ("fresh", "en"): 4.9,
                ("phrase", "en"): 4.9,
                ("backup", "en"): 4.8,
                ("reserve", "en"): 4.8,
            }
        ),
    )

    creator = ExpressionCandidateCreator(
        client=_FakeAsyncClient({}),
        rng=random.Random(3),
        word_pool_size=24,
        datamuse_results=1,
    )

    # Given: The early candidate window is filled with already-published expressions.
    existing_expressions = ["known expression"]

    # When: Candidate generation asks for a new expression.
    generated = asyncio.run(creator.generate(existing_expressions, 1))

    # Then: The generator should widen the search enough to find a fresh candidate.
    assert generated == ["fresh phrase"]


def test_generate_rejects_foreign_dominant_words(
    monkeypatch,
):
    """`generate` should filter out foreign-dominant words and keep clear English candidates."""
    monkeypatch.setattr(
        expression_candidates_module,
        "top_n_list",
        _build_top_n_list(
            [
                "escolar",
                "traveler",
                "schoolhouse",
            ]
        ),
    )
    monkeypatch.setattr(
        expression_candidates_module,
        "zipf_frequency",
        _build_zipf_frequency_lookup(
            {
                ("escolar", "en"): 4.1,
                ("escolar", "es"): 5.4,
                ("escolar", "pt"): 4.2,
                ("traveler", "en"): 5.0,
                ("schoolhouse", "en"): 4.8,
            }
        ),
    )

    creator = ExpressionCandidateCreator(
        client=_FakeAsyncClient({}),
        rng=random.Random(11),
        word_pool_size=3,
        datamuse_results=1,
    )

    # Given: The source list mixes a Spanish-dominant token with clear English words.
    existing_expressions: list[str] = []

    # When: Candidate generation runs end-to-end.
    generated = asyncio.run(creator.generate(existing_expressions, 2))

    # Then: The foreign-dominant token should be excluded from the public result.
    assert "escolar" not in generated
    assert "traveler" in generated


def test_generate_keeps_common_english_loanwords(
    monkeypatch,
):
    """`generate` should keep common English words even when they score well in other languages too."""
    monkeypatch.setattr(
        expression_candidates_module,
        "top_n_list",
        _build_top_n_list(
            [
                "menu",
                "pizza",
                "cafe",
            ]
        ),
    )
    monkeypatch.setattr(
        expression_candidates_module,
        "zipf_frequency",
        _build_zipf_frequency_lookup(
            {
                ("menu", "en"): 4.26,
                ("menu", "fr"): 4.2,
                ("pizza", "en"): 4.43,
                ("pizza", "it"): 4.62,
                ("cafe", "en"): 4.09,
                ("cafe", "es"): 3.81,
                ("cafe", "fr"): 3.18,
            }
        ),
    )

    creator = ExpressionCandidateCreator(
        client=_FakeAsyncClient({}),
        rng=random.Random(5),
        word_pool_size=3,
        datamuse_results=1,
    )

    # Given: The candidate source contains common English loanwords.
    existing_expressions: list[str] = []

    # When: Candidate generation runs end-to-end.
    generated = asyncio.run(creator.generate(existing_expressions, 3))

    # Then: The common English words should remain eligible.
    assert generated == ["pizza", "menu", "cafe"]


def test_generate_keeps_tire_distinct_from_existing_tier(
    monkeypatch,
):
    """`generate` should not collapse unrelated `-re` and `-er` words into one family."""
    monkeypatch.setattr(
        expression_candidates_module,
        "top_n_list",
        _build_top_n_list(
            [
                "tire",
                "look after",
            ]
        ),
    )
    monkeypatch.setattr(
        expression_candidates_module,
        "zipf_frequency",
        _build_zipf_frequency_lookup(
            {
                ("tire", "en"): 4.02,
                ("tire", "fr"): 4.53,
                ("tire", "pt"): 4.09,
                ("look after", "en"): 5.2,
                ("look", "en"): 5.1,
            }
        ),
    )

    creator = ExpressionCandidateCreator(
        client=_FakeAsyncClient({}),
        rng=random.Random(13),
        word_pool_size=2,
        datamuse_results=1,
    )

    # Given: A different word with a similar ending is already published.
    existing_expressions = ["tier"]

    # When: Candidate generation selects new expressions.
    generated = asyncio.run(creator.generate(existing_expressions, 2))

    # Then: The new word should still be considered distinct.
    assert "tire" in generated

def test_generate_keeps_filled_distinct_from_existing_filed(
    monkeypatch,
):
    """`generate` should not collapse unrelated doubled-l words into a spelling-variant family."""
    monkeypatch.setattr(
        expression_candidates_module,
        "top_n_list",
        _build_top_n_list(
            [
                "filled",
                "look after",
            ]
        ),
    )
    monkeypatch.setattr(
        expression_candidates_module,
        "zipf_frequency",
        _build_zipf_frequency_lookup(
            {
                ("filled", "en"): 4.6,
                ("look after", "en"): 5.2,
                ("look", "en"): 5.1,
            }
        ),
    )

    creator = ExpressionCandidateCreator(
        client=_FakeAsyncClient({}),
        rng=random.Random(17),
        word_pool_size=2,
        datamuse_results=1,
    )

    # Given: A different English word with a similar doubled-l ending is already published.
    existing_expressions = ["filed"]

    # When: Candidate generation selects new expressions.
    generated = asyncio.run(creator.generate(existing_expressions, 2))

    # Then: The doubled-l word should remain distinct instead of being deduped away.
    assert "filled" in generated
class _FakeAsyncClient:
    def __init__(self, topic_results: dict[str, list[str]]) -> None:
        self._topic_results = topic_results

    async def get(self, _path: str, params: dict[str, object]) -> "_FakeResponse":
        topic = str(params["ml"])
        return _FakeResponse(self._topic_results.get(topic, []))

    async def aclose(self) -> None:
        return None


class _FakeResponse:
    def __init__(self, words: list[str]) -> None:
        self._words = words

    def raise_for_status(self) -> None:
        return None

    def json(self) -> list[dict[str, str]]:
        return [{"word": word} for word in self._words]


def _build_top_n_list(words: list[str]):
    def fake_top_n_list(_language: str, _pool_size: int) -> list[str]:
        return words

    return fake_top_n_list


def _build_zipf_frequency_lookup(
    values: dict[tuple[str, str], float],
):
    def fake_zipf_frequency(word: str, language: str) -> float:
        if (word, language) in values:
            return values[(word, language)]

        if language == "en":
            return 4.8

        return 0.0

    return fake_zipf_frequency
