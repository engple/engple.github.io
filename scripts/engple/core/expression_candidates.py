from __future__ import annotations

import asyncio
import re

import httpx
from loguru import logger
from spacy.lang.en.stop_words import STOP_WORDS

from engple.utils import clean_expression, normalize_expression

try:
    from wordfreq import top_n_list, zipf_frequency
except ImportError:  # pragma: no cover - exercised in environments without deps synced
    top_n_list = None
    zipf_frequency = None


DEFAULT_WORD_POOL_SIZE = 5000
DEFAULT_DATAMUSE_RESULTS = 32
DEFAULT_MIN_ZIPF = 3.8
DATAMUSE_TIMEOUT = 10.0
DATAMUSE_TOPIC_SEEDS = (
    "work",
    "school",
    "travel",
    "money",
    "food",
    "family",
    "friendship",
    "health",
    "shopping",
    "weather",
    "emotion",
    "time",
)
EXPRESSION_RE = re.compile(r"^[a-z][a-z' -]*[a-z]$")
BLOCKED_SINGLE_WORDS = {
    "a",
    "about",
    "above",
    "across",
    "after",
    "again",
    "against",
    "all",
    "almost",
    "alone",
    "along",
    "already",
    "also",
    "always",
    "an",
    "and",
    "another",
    "any",
    "anybody",
    "anyone",
    "anything",
    "anyway",
    "anywhere",
    "are",
    "around",
    "as",
    "away",
    "at",
    "back",
    "be",
    "because",
    "become",
    "becomes",
    "became",
    "becoming",
    "before",
    "been",
    "behind",
    "being",
    "below",
    "beside",
    "besides",
    "between",
    "both",
    "but",
    "by",
    "came",
    "come",
    "comes",
    "coming",
    "did",
    "do",
    "does",
    "doing",
    "done",
    "down",
    "during",
    "each",
    "either",
    "else",
    "enough",
    "especially",
    "etc",
    "even",
    "ever",
    "every",
    "everybody",
    "everyone",
    "everything",
    "everywhere",
    "far",
    "few",
    "first",
    "from",
    "further",
    "for",
    "generally",
    "get",
    "gets",
    "getting",
    "got",
    "gone",
    "good",
    "great",
    "had",
    "hardly",
    "has",
    "have",
    "he",
    "hello",
    "hence",
    "here",
    "her",
    "hers",
    "herself",
    "him",
    "his",
    "himself",
    "how",
    "however",
    "i",
    "ie",
    "if",
    "indeed",
    "in",
    "into",
    "is",
    "it",
    "its",
    "itself",
    "just",
    "kind",
    "kinda",
    "last",
    "least",
    "less",
    "lot",
    "lots",
    "many",
    "may",
    "maybe",
    "mine",
    "more",
    "most",
    "much",
    "must",
    "me",
    "my",
    "myself",
    "near",
    "nearly",
    "need",
    "needs",
    "neither",
    "never",
    "next",
    "no",
    "nobody",
    "none",
    "noone",
    "nor",
    "not",
    "nothing",
    "now",
    "nowhere",
    "of",
    "off",
    "often",
    "okay",
    "ok",
    "once",
    "one",
    "ones",
    "only",
    "on",
    "onto",
    "other",
    "others",
    "otherwise",
    "or",
    "our",
    "ours",
    "ourselves",
    "out",
    "over",
    "own",
    "perhaps",
    "pretty",
    "quite",
    "rather",
    "really",
    "same",
    "she",
    "should",
    "since",
    "small",
    "someone",
    "something",
    "sometime",
    "somewhere",
    "so",
    "some",
    "still",
    "such",
    "than",
    "that",
    "thee",
    "the",
    "then",
    "there",
    "therefore",
    "their",
    "theirs",
    "them",
    "they",
    "thing",
    "things",
    "though",
    "through",
    "throughout",
    "thru",
    "this",
    "thus",
    "till",
    "together",
    "toward",
    "towards",
    "those",
    "to",
    "too",
    "under",
    "until",
    "up",
    "upon",
    "us",
    "very",
    "via",
    "well",
    "whatever",
    "whenever",
    "where",
    "wherever",
    "whether",
    "while",
    "whole",
    "whom",
    "whose",
    "why",
    "within",
    "without",
    "yes",
    "was",
    "we",
    "were",
    "will",
    "would",
    "what",
    "when",
    "which",
    "who",
    "with",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves",
}
BLOCKED_CONTRACTIONS = {
    "ain't",
    "aren't",
    "can't",
    "could've",
    "couldn't",
    "didn't",
    "doesn't",
    "don't",
    "gonna",
    "didn't",
    "hadn't",
    "had've",
    "hasn't",
    "haven't",
    "he's",
    "he'd",
    "he'll",
    "here'd",
    "here'll",
    "here's",
    "how's",
    "how'd",
    "how'll",
    "i'd",
    "i'll",
    "i'm",
    "i've",
    "isn't",
    "it's",
    "it'd",
    "it'll",
    "kinda",
    "lemme",
    "let's",
    "might've",
    "mightn't",
    "must've",
    "mustn't",
    "needn't",
    "o'clock",
    "oughtn't",
    "she'd",
    "she'll",
    "she's",
    "shouldn't",
    "should've",
    "somebody's",
    "someone's",
    "something's",
    "sorta",
    "that'd",
    "that'll",
    "that's",
    "there'd",
    "there'll",
    "there's",
    "they've",
    "they'd",
    "they'll",
    "they're",
    "wanna",
    "wasn't",
    "we'd",
    "we'll",
    "we're",
    "we've",
    "weren't",
    "what'd",
    "what'll",
    "what's",
    "when's",
    "where's",
    "who'd",
    "who'll",
    "who's",
    "won't",
    "wouldn't",
    "would've",
    "y'all",
    "you'd",
    "you'll",
    "you're",
    "you've",
}
ENGLISH_STOP_WORDS = STOP_WORDS | BLOCKED_SINGLE_WORDS | BLOCKED_CONTRACTIONS


class ExpressionCandidateCreator:
    BASE_URL = "https://api.datamuse.com"

    def __init__(
        self,
        *,
        client: httpx.AsyncClient | None = None,
        word_pool_size: int = DEFAULT_WORD_POOL_SIZE,
        datamuse_results: int = DEFAULT_DATAMUSE_RESULTS,
        min_zipf: float = DEFAULT_MIN_ZIPF,
    ) -> None:
        self.word_pool_size = word_pool_size
        self.datamuse_results = datamuse_results
        self.min_zipf = min_zipf
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            base_url=self.BASE_URL,
            timeout=DATAMUSE_TIMEOUT,
        )

    async def aclose(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def generate(
        self,
        existing_expressions: list[str],
        count: int,
    ) -> list[str]:
        if count <= 0:
            return []

        known_expressions = {
            normalize_expression(expression) for expression in existing_expressions
        }
        scored_candidates: dict[str, float] = {}

        for expression in self._get_wordfreq_candidates(limit=max(count * 8, count)):
            self._add_candidate(
                scored_candidates,
                expression,
                known_expressions,
                source_bonus=0.0,
            )

        for expression in await self._get_datamuse_candidates(limit=max(count * 8, count)):
            self._add_candidate(
                scored_candidates,
                expression,
                known_expressions,
                source_bonus=0.15,
            )

        ranked_candidates = sorted(
            scored_candidates.items(),
            key=lambda item: (-item[1], item[0]),
        )
        return [expression for expression, _ in ranked_candidates[:count]]

    def _get_wordfreq_candidates(self, limit: int) -> list[str]:
        if top_n_list is None:
            logger.warning(
                "wordfreq is not installed. Candidate generation will rely on Datamuse only."
            )
            return []

        candidates: list[str] = []
        for expression in top_n_list("en", self.word_pool_size):
            if not self._is_candidate_expression(expression):
                continue

            candidates.append(clean_expression(expression))
            if len(candidates) >= limit:
                break

        return candidates

    async def _get_datamuse_candidates(self, limit: int) -> list[str]:
        tasks = [
            self._fetch_datamuse_topic(seed, self.datamuse_results)
            for seed in DATAMUSE_TOPIC_SEEDS
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        candidates: list[str] = []
        for result in results:
            if isinstance(result, Exception):
                logger.warning("Datamuse lookup failed: {}", result)
                continue

            for expression in result:
                if not self._is_candidate_expression(expression):
                    continue

                candidates.append(clean_expression(expression))
                if len(candidates) >= limit:
                    return candidates

        return candidates

    async def _fetch_datamuse_topic(self, topic: str, limit: int) -> list[str]:
        response = await self._client.get(
            "/words",
            params={"ml": topic, "max": limit},
        )
        response.raise_for_status()
        data = response.json()
        return [
            item["word"]
            for item in data
            if isinstance(item, dict) and isinstance(item.get("word"), str)
        ]

    def _add_candidate(
        self,
        scored_candidates: dict[str, float],
        expression: str,
        known_expressions: set[str],
        *,
        source_bonus: float,
    ) -> None:
        normalized = normalize_expression(expression)
        if not normalized or normalized in known_expressions:
            return

        score = self._score_expression(expression) + source_bonus
        if score <= 0:
            return

        current_score = scored_candidates.get(expression)
        if current_score is None or score > current_score:
            scored_candidates[expression] = score

    def _score_expression(self, expression: str) -> float:
        if zipf_frequency is None:
            return 1.0

        score = float(zipf_frequency(expression, "en"))
        if score < self.min_zipf:
            return 0.0

        if " " in expression:
            score += 0.25

        return score

    def _is_candidate_expression(self, expression: str) -> bool:
        cleaned = clean_expression(expression).lower()
        if not cleaned:
            return False

        if not EXPRESSION_RE.match(cleaned):
            return False

        words = cleaned.split()
        if len(words) > 3:
            return False

        if len(words) == 1 and words[0] in ENGLISH_STOP_WORDS:
            return False

        if any(len(word) == 1 for word in words):
            return False

        return True


__all__ = ["ExpressionCandidateCreator"]
