import re

from pydantic import BaseModel, Field

TOPIC_HEADING_RE = re.compile(
    r"^##\s+(?P<number>\d+)\.\s+(?P<korean>.+?)\s*\((?P<english>.+?)\)\s*$",
    re.MULTILINE,
)


class TopicVocabCandidate(BaseModel):
    korean: str = Field(description="Korean vocabulary item.")
    english: str = Field(description="English vocabulary item.")


def extract_topic_heading_lines(content: str) -> list[str]:
    return [match.group(0).strip() for match in TOPIC_HEADING_RE.finditer(content)]


def extract_topic_heading_vocabs(content: str) -> list[TopicVocabCandidate]:
    return [
        TopicVocabCandidate(
            korean=match.group("korean").strip(),
            english=match.group("english").strip(),
        )
        for match in TOPIC_HEADING_RE.finditer(content)
    ]


def flatten_topic_vocabs(vocabs: list[TopicVocabCandidate]) -> list[str]:
    flattened: list[str] = []
    for vocab in vocabs:
        flattened.extend([vocab.korean, vocab.english])
    return flattened


def normalize_topic_vocab(vocab: str) -> str:
    return vocab.strip().lower()
