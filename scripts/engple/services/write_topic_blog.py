import datetime
import random
import re
from pathlib import Path
from zoneinfo import ZoneInfo

from loguru import logger

from engple.config import config
from engple.constants import TOPIC_PROMPT
from engple.core.image_searcher import search_image
from engple.core.topic_blog_writer import GeneratedTopicBlog, TopicBlogWriter
from engple.utils import render_topic_thumbnail

TOPIC_HEADING_RE = re.compile(
    r"^##\s+\d+\.\s+(.+?)\s*\((.+?)\)\s*$",
    re.MULTILINE,
)
TITLE_RE = re.compile(r'^title:\s*["\']?(.+?)["\']?\s*$', re.MULTILINE)
TOPIC_TITLE_RE = re.compile(r"^(.+?)\s+영어(?:로)?\s+(?:표현하기|배우기|단어 배우기)")


async def handle_write_topic_blog(
    topic: str | None = None,
    *,
    excludes: list[str] | None = None,
    with_thumbnail: bool = True,
) -> Path:
    writer = TopicBlogWriter()
    selected_topic = _select_topic(topic)
    blog_num = _get_next_topic_blog_num()
    posted_at = datetime.datetime.now(tz=ZoneInfo("Asia/Seoul"))
    topic_excludes = _build_topic_excludes(excludes or [])
    topic_sequence = _get_next_topic_sequence(selected_topic)
    generated_blog = await writer.generate(
        selected_topic,
        blog_num,
        posted_at,
        topic_excludes,
        topic_sequence,
        with_thumbnail,
    )
    _reject_duplicate_vocabs(generated_blog, topic_excludes)

    blog_path = _get_topic_post_path(blog_num)

    if with_thumbnail:
        thumbnail_path = blog_path.with_suffix(".png")
        await generate_topic_thumbnail(thumbnail_path, selected_topic)

    _write_topic_post(generated_blog, blog_path)

    logger.debug(f"✅ Successfully wrote topic blog for {selected_topic}")
    return blog_path


def _select_topic(topic: str | None) -> str:
    if topic:
        return topic

    topic_pool = [item.strip() for item in TOPIC_PROMPT["topic_pool"] if item.strip()]
    if not topic_pool:
        raise RuntimeError("Topic pool is empty.")

    return random.choice(topic_pool)


def _get_next_topic_blog_num() -> int:
    topic_dir = config.blog_dir / "topic"
    existing_numbers = [
        int(path.stem.split(".")[0])
        for path in sorted(topic_dir.rglob("*.md"))
        if path.stem.split(".")[0].isdigit()
    ]
    if not existing_numbers:
        return 1
    return max(existing_numbers) + 1


def _build_topic_excludes(requested_excludes: list[str]) -> list[str]:
    existing_excludes = _get_existing_topic_vocabs()
    deduped: list[str] = []
    seen: set[str] = set()
    for item in [*existing_excludes, *requested_excludes]:
        key = item.strip().lower()
        if not key or key in seen:
            continue
        deduped.append(item.strip())
        seen.add(key)
    return deduped


def _reject_duplicate_vocabs(
    generated_blog: GeneratedTopicBlog, topic_excludes: list[str]
) -> None:
    excluded = {_normalize_vocab(item) for item in topic_excludes}
    generated = {
        _normalize_vocab(item)
        for item in [
            *generated_blog.vocabs,
            *_extract_topic_heading_vocabs(generated_blog.content),
        ]
    }
    duplicates = sorted(item for item in generated if item in excluded)
    if duplicates:
        raise RuntimeError(
            "Generated topic blog reused excluded vocabulary: "
            f"{', '.join(duplicates)}"
        )


def _extract_topic_heading_vocabs(content: str) -> list[str]:
    vocabs: list[str] = []
    for korean, english in TOPIC_HEADING_RE.findall(content):
        vocabs.extend([korean.strip(), english.strip()])
    return vocabs


def _normalize_vocab(vocab: str) -> str:
    return vocab.strip().lower()


def _get_next_topic_sequence(topic: str) -> int:
    topic_dir = config.blog_dir / "topic"
    if not topic_dir.exists():
        return 1

    post_count = 0
    for path in sorted(topic_dir.rglob("*.md")):
        content = path.read_text(encoding="utf-8")
        title = _extract_title(content)
        if _is_topic_title_match(title, topic):
            post_count += 1
    return post_count + 1


def _is_topic_title_match(title: str, topic: str) -> bool:
    return _normalize_topic(_extract_topic_from_title(title)) == _normalize_topic(topic)


def _extract_topic_from_title(title: str) -> str:
    match = TOPIC_TITLE_RE.search(title)
    if not match:
        return ""
    return re.sub(r"\s+#\d+\s*$", "", match.group(1)).strip()


def _normalize_topic(topic: str) -> str:
    return re.sub(r"\s+", "", topic.strip().lower())


def _get_existing_topic_vocabs() -> list[str]:
    topic_dir = config.blog_dir / "topic"
    if not topic_dir.exists():
        return []

    vocabs: list[str] = []
    for path in sorted(topic_dir.rglob("*.md")):
        content = path.read_text(encoding="utf-8")
        vocabs.extend(_extract_topic_heading_vocabs(content))
    return vocabs


def _extract_title(content: str) -> str:
    match = TITLE_RE.search(content)
    if not match:
        return ""
    return match.group(1).strip()


def _get_topic_post_path(blog_num: int) -> Path:
    topic_dir = config.blog_dir / "topic"
    topic_dir.mkdir(parents=True, exist_ok=True)
    return topic_dir / f"{blog_num:03d}.md"


def _write_topic_post(generated_blog: GeneratedTopicBlog, blog_path: Path) -> None:
    blog_path.write_text(generated_blog.content, encoding="utf-8")


async def generate_topic_thumbnail(path: Path, topic: str) -> None:
    image = await search_image(f"{topic} English vocabulary")
    render_topic_thumbnail(path.as_posix(), image.url, topic)
    logger.debug(f"✅ Successfully generated topic thumbnail for {topic}")


__all__ = [
    "generate_topic_thumbnail",
    "handle_write_topic_blog",
]
