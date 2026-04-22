from __future__ import annotations

import asyncio
from dataclasses import dataclass
import random
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
DEFAULT_CANDIDATE_POOL_MULTIPLIER = 6
DEFAULT_CANDIDATE_POOL_MINIMUM = 24
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
# Compare against a small set of high-signal non-English corpora so we can
# catch obvious foreign-dominant tokens without rejecting common English
# loanwords due to noise from every supported language in wordfreq.
NON_ENGLISH_LANGUAGE_CODES = ("es", "fr", "de", "it", "pt")
SPELLING_VARIANT_SUFFIXES = (
    ("isations", "izations"),
    ("isation", "ization"),
    ("ising", "izing"),
    ("ised", "ized"),
    ("ises", "izes"),
    ("ise", "ize"),
    ("ours", "ors"),
    ("our", "or"),
    ("ogue", "og"),
)
DOUBLE_L_VARIANT_SUFFIXES = (
    ("lers", "ers"),
    ("ler", "er"),
    ("ling", "ing"),
    ("led", "ed"),
)
DOUBLE_L_VARIANT_STEMS = (
    "cancel",
    "channel",
    "dial",
    "duel",
    "equal",
    "fuel",
    "label",
    "level",
    "marshal",
    "marvel",
    "model",
    "panel",
    "pedal",
    "quarrel",
    "rival",
    "signal",
    "total",
    "travel",
    "trial",
    "tunnel",
)
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


@dataclass(frozen=True)
class CandidateOption:
    expression: str
    score: float
    family_key: str
    diversity_key: str
    is_multiword: bool


class ExpressionCandidateCreator:
    BASE_URL = "https://api.datamuse.com"

    def __init__(
        self,
        *,
        client: httpx.AsyncClient | None = None,
        word_pool_size: int = DEFAULT_WORD_POOL_SIZE,
        datamuse_results: int = DEFAULT_DATAMUSE_RESULTS,
        min_zipf: float = DEFAULT_MIN_ZIPF,
        rng: random.Random | None = None,
    ) -> None:
        self.word_pool_size = word_pool_size
        self.datamuse_results = datamuse_results
        self.min_zipf = min_zipf
        self._rng = rng or random.Random()
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
        known_families = {
            self._get_candidate_family_key(expression)
            for expression in existing_expressions
        }
        candidates = await self._collect_candidates(
            known_expressions,
            known_families,
            count,
        )
        if not candidates:
            return []

        return self._select_candidates(candidates, count)

    async def _collect_candidates(
        self,
        known_expressions: set[str],
        known_families: set[str],
        count: int,
    ) -> list[CandidateOption]:
        grouped_candidates: dict[str, CandidateOption] = {}

        for limit in self._build_candidate_limits(count):
            for expression in self._get_wordfreq_candidates(limit=limit):
                self._add_candidate(
                    grouped_candidates,
                    expression,
                    known_expressions,
                    known_families,
                    source_bonus=0.0,
                )

            for expression in await self._get_datamuse_candidates(limit=limit):
                self._add_candidate(
                    grouped_candidates,
                    expression,
                    known_expressions,
                    known_families,
                    source_bonus=0.15,
                )

            if len(grouped_candidates) >= self._get_target_pool_size(count):
                break

        return list(grouped_candidates.values())

    def _select_candidates(
        self,
        candidates: list[CandidateOption],
        count: int,
    ) -> list[str]:
        if len(candidates) <= count:
            ranked_candidates = sorted(
                candidates,
                key=lambda candidate: (-candidate.score, candidate.expression),
            )
            return [candidate.expression for candidate in ranked_candidates]

        selected: list[CandidateOption] = []
        remaining = list(candidates)
        multiword_candidates = [
            candidate for candidate in remaining if candidate.is_multiword
        ]
        single_word_candidates = [
            candidate for candidate in remaining if not candidate.is_multiword
        ]
        multiword_quota, single_word_quota = self._get_type_selection_quotas(
            multiword_candidates,
            single_word_candidates,
            count,
        )

        selected.extend(
            self._draw_candidates(
                multiword_candidates,
                multiword_quota,
                selected,
            )
        )
        remaining = self._exclude_selected_candidates(remaining, selected)

        selected.extend(
            self._draw_candidates(
                [candidate for candidate in remaining if not candidate.is_multiword],
                single_word_quota,
                selected,
            )
        )
        remaining = self._exclude_selected_candidates(remaining, selected)

        selected.extend(
            self._draw_candidates(
                remaining,
                count - len(selected),
                selected,
            )
        )

        return [candidate.expression for candidate in selected[:count]]

    def _get_type_selection_quotas(
        self,
        multiword_candidates: list[CandidateOption],
        single_word_candidates: list[CandidateOption],
        count: int,
    ) -> tuple[int, int]:
        if count <= 1 or not multiword_candidates or not single_word_candidates:
            return 0, 0

        multiword_quota = min(len(multiword_candidates), max(1, count // 2))
        single_word_quota = min(
            len(single_word_candidates),
            max(1, count - multiword_quota),
        )

        return multiword_quota, single_word_quota

    def _draw_candidates(
        self,
        candidates: list[CandidateOption],
        target_count: int,
        selected: list[CandidateOption],
    ) -> list[CandidateOption]:
        if target_count <= 0 or not candidates:
            return []

        shortlist = self._build_selection_shortlist(candidates, target_count)
        chosen: list[CandidateOption] = []
        used_diversity_keys = {
            candidate.diversity_key for candidate in selected if candidate.diversity_key
        }

        while shortlist and len(chosen) < target_count:
            eligible = [
                candidate
                for candidate in shortlist
                if candidate.diversity_key not in used_diversity_keys
            ]
            if not eligible:
                eligible = shortlist

            candidate = self._pick_weighted_candidate(eligible)
            chosen.append(candidate)
            used_diversity_keys.add(candidate.diversity_key)
            shortlist = [
                option
                for option in shortlist
                if option.family_key != candidate.family_key
            ]

        return chosen

    def _build_selection_shortlist(
        self,
        candidates: list[CandidateOption],
        target_count: int,
    ) -> list[CandidateOption]:
        shortlist_size = max(target_count * DEFAULT_CANDIDATE_POOL_MULTIPLIER, 12)
        ranked_candidates = sorted(
            candidates,
            key=lambda candidate: (-candidate.score, candidate.expression),
        )
        return ranked_candidates[:shortlist_size]

    def _pick_weighted_candidate(
        self,
        candidates: list[CandidateOption],
    ) -> CandidateOption:
        weights = [
            max(candidate.score - self.min_zipf + 1.0, 0.1) for candidate in candidates
        ]
        return self._rng.choices(candidates, weights=weights, k=1)[0]

    def _exclude_selected_candidates(
        self,
        candidates: list[CandidateOption],
        selected: list[CandidateOption],
    ) -> list[CandidateOption]:
        selected_families = {candidate.family_key for candidate in selected}
        return [
            candidate
            for candidate in candidates
            if candidate.family_key not in selected_families
        ]

    def _build_candidate_limits(self, count: int) -> list[int]:
        limits: list[int] = []
        for multiplier in (8, 20, 40):
            limit = max(count * multiplier, count)
            if limit not in limits:
                limits.append(limit)
        return limits

    def _get_target_pool_size(self, count: int) -> int:
        return max(count * DEFAULT_CANDIDATE_POOL_MULTIPLIER, DEFAULT_CANDIDATE_POOL_MINIMUM)

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
        grouped_candidates: dict[str, CandidateOption],
        expression: str,
        known_expressions: set[str],
        known_families: set[str],
        *,
        source_bonus: float,
    ) -> None:
        normalized = normalize_expression(expression)
        if not normalized or normalized in known_expressions:
            return

        score = self._score_expression(expression) + source_bonus
        if score <= 0:
            return

        family_key = self._get_candidate_family_key(expression)
        if family_key in known_families:
            return

        option = CandidateOption(
            expression=clean_expression(expression),
            score=score,
            family_key=family_key,
            diversity_key=self._get_candidate_diversity_key(expression),
            is_multiword=" " in clean_expression(expression),
        )
        current_option = grouped_candidates.get(family_key)
        if current_option is None or self._should_replace_candidate(
            current_option,
            option,
        ):
            grouped_candidates[family_key] = option

    def _should_replace_candidate(
        self,
        current_option: CandidateOption,
        new_option: CandidateOption,
    ) -> bool:
        if new_option.score != current_option.score:
            return new_option.score > current_option.score

        if len(new_option.expression) != len(current_option.expression):
            return len(new_option.expression) < len(current_option.expression)

        return new_option.expression < current_option.expression

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

        if any(
            len(word) > 2 and not self._looks_like_english_word(word)
            for word in words
        ):
            return False

        return True

    def _looks_like_english_word(self, word: str) -> bool:
        if zipf_frequency is None:
            return True

        english_score = float(zipf_frequency(word, "en"))
        if english_score < self.min_zipf:
            return False

        foreign_scores = [
            float(zipf_frequency(word, language))
            for language in NON_ENGLISH_LANGUAGE_CODES
        ]
        max_foreign_score = max(foreign_scores, default=0.0)

        # Keep established English loanwords and homographs unless another
        # language is overwhelmingly more likely for this token.
        if english_score >= self.min_zipf + 0.4:
            return True

        return max_foreign_score < english_score + 0.75

    def _get_candidate_family_key(self, expression: str) -> str:
        normalized = normalize_expression(expression)
        tokens = normalized.split()
        canonical_tokens = [self._canonicalize_token(token) for token in tokens]
        return " ".join(canonical_tokens)

    def _get_candidate_diversity_key(self, expression: str) -> str:
        normalized = normalize_expression(expression)
        tokens = normalized.split()
        content_tokens = [
            token for token in tokens if token not in ENGLISH_STOP_WORDS
        ]
        seed_token = content_tokens[0] if content_tokens else tokens[0]
        return self._canonicalize_token(seed_token)

    def _canonicalize_token(self, token: str) -> str:
        canonical_token = token.lower()
        for source_suffix, target_suffix in SPELLING_VARIANT_SUFFIXES:
            if (
                canonical_token.endswith(source_suffix)
                and len(canonical_token) > len(source_suffix) + 1
            ):
                canonical_token = (
                    canonical_token[: -len(source_suffix)] + target_suffix
                )
                break
        return self._canonicalize_double_l_variant(canonical_token)

    def _canonicalize_double_l_variant(self, token: str) -> str:
        for stem in DOUBLE_L_VARIANT_STEMS:
            for source_suffix, target_suffix in DOUBLE_L_VARIANT_SUFFIXES:
                if token == f"{stem}{source_suffix}":
                    return f"{stem}{target_suffix}"

        return token

__all__ = ["ExpressionCandidateCreator"]
