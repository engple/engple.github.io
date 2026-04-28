import asyncio
from pathlib import Path

import pytest

from engple.config import config
from engple.constants import TOPIC_PROMPT
from engple.core.topic_blog_writer import (
    GeneratedTopicBlog,
    TopicBlogContent,
    TopicBlogMeta,
    TopicBlogWriter,
    TopicFAQ,
)
from engple.services import write_topic_blog as write_topic_blog_service


@pytest.fixture
def temp_topic_blog_dir(tmp_path, monkeypatch):
    """Provide a temporary blog directory with existing topic posts."""
    blog_dir = tmp_path / "blog"
    topic_dir = blog_dir / "topic"
    topic_dir.mkdir(parents=True)
    (topic_dir / "001.md").write_text(
        (
            "---\n"
            'title: "동물 영어로 배우기 - 개, 고양이 영어로"\n'
            'category: "주제별영어"\n'
            "---\n\n"
            "## 1. 개 (Dog)\n\n"
            "## 2. 고양이(Cat)\n"
        ),
        encoding="utf-8",
    )
    (topic_dir / "002.md").write_text(
        (
            "---\n"
            'title: "가구 영어로 배우기 - 의자 영어로"\n'
            'category: "주제별영어"\n'
            "---\n\n"
            "## 1. 의자 (Chair)\n"
        ),
        encoding="utf-8",
    )
    (topic_dir / "003.md").write_text(
        (
            "---\n"
            'title: "가전제품 영어로 배우기 #2 ⚡ - 다리미 영어로"\n'
            'category: "주제별영어"\n'
            "---\n\n"
            "## 1. 다리미 (Iron)\n"
        ),
        encoding="utf-8",
    )
    (topic_dir / "004.md").write_text(
        (
            "---\n"
            'title: "운동 기구 영어로 배우기 #1 💪 - 덤벨 영어로"\n'
            'category: "주제별영어"\n'
            "---\n\n"
            "## 1. 덤벨 (Dumbbell)\n"
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(config, "blog_dir", blog_dir)
    return topic_dir


def test_handle_write_topic_blog_writes_next_topic_post_with_excludes(
    temp_topic_blog_dir,
    monkeypatch,
):
    """`handle_write_topic_blog` should write the next topic post with deduped excludes."""
    captured: dict[str, object] = {}

    async def generate(
        self,
        topic,
        blog_num,
        posted_at,
        excludes,
        topic_sequence,
        include_thumbnail,
    ):
        captured["topic"] = topic
        captured["blog_num"] = blog_num
        captured["excludes"] = excludes
        captured["topic_sequence"] = topic_sequence
        captured["include_thumbnail"] = include_thumbnail
        return GeneratedTopicBlog(
            topic=topic,
            vocabs=["rabbit"],
            content="---\ncategory: \"주제별영어\"\n---\n\nGenerated body.\n",
        )

    async def fail_thumbnail(*args, **kwargs):
        raise AssertionError("thumbnail generation should be disabled")

    monkeypatch.setattr(TopicBlogWriter, "generate", generate)
    monkeypatch.setattr(
        write_topic_blog_service,
        "generate_topic_thumbnail",
        fail_thumbnail,
    )

    # Given
    topic = "동물"
    excludes = ["Cat", "소"]

    # When
    result = asyncio.run(
        write_topic_blog_service.handle_write_topic_blog(
            topic,
            excludes=excludes,
            with_thumbnail=False,
        )
    )

    # Then
    assert result == temp_topic_blog_dir / "005.md"
    assert result.read_text(encoding="utf-8").endswith("Generated body.\n")
    assert captured["topic"] == "동물"
    assert captured["blog_num"] == 5
    assert captured["excludes"] == [
        "개",
        "Dog",
        "고양이",
        "Cat",
        "의자",
        "Chair",
        "다리미",
        "Iron",
        "덤벨",
        "Dumbbell",
        "소",
    ]
    assert captured["topic_sequence"] == 2
    assert captured["include_thumbnail"] is False


def test_handle_write_topic_blog_generates_thumbnail_by_default(
    temp_topic_blog_dir,
    monkeypatch,
):
    """`handle_write_topic_blog` should generate a matching PNG thumbnail by default."""
    captured_thumbnail: dict[str, object] = {}

    async def generate(
        self,
        topic,
        blog_num,
        posted_at,
        excludes,
        topic_sequence,
        include_thumbnail,
    ):
        return GeneratedTopicBlog(
            topic=topic,
            vocabs=["rabbit"],
            content="---\ncategory: \"주제별영어\"\n---\n\nGenerated body.\n",
        )

    async def generate_thumbnail(path: Path, topic: str):
        captured_thumbnail["path"] = path
        captured_thumbnail["topic"] = topic

    monkeypatch.setattr(TopicBlogWriter, "generate", generate)
    monkeypatch.setattr(
        write_topic_blog_service,
        "generate_topic_thumbnail",
        generate_thumbnail,
    )

    # Given
    topic = "동물"

    # When
    result = asyncio.run(write_topic_blog_service.handle_write_topic_blog(topic))

    # Then
    assert result == temp_topic_blog_dir / "005.md"
    assert captured_thumbnail == {
        "path": temp_topic_blog_dir / "005.png",
        "topic": "동물",
    }


def test_handle_write_topic_blog_does_not_write_post_when_thumbnail_fails(
    temp_topic_blog_dir,
    monkeypatch,
):
    """`handle_write_topic_blog` should leave no markdown post when thumbnail generation fails."""

    async def generate(
        self,
        topic,
        blog_num,
        posted_at,
        excludes,
        topic_sequence,
        include_thumbnail,
    ):
        return GeneratedTopicBlog(
            topic=topic,
            vocabs=["rabbit"],
            content="---\ncategory: \"주제별영어\"\n---\n\nGenerated body.\n",
        )

    async def fail_thumbnail(path: Path, topic: str):
        raise RuntimeError("thumbnail failed")

    monkeypatch.setattr(TopicBlogWriter, "generate", generate)
    monkeypatch.setattr(
        write_topic_blog_service,
        "generate_topic_thumbnail",
        fail_thumbnail,
    )

    # Given
    topic = "동물"

    # When / Then
    with pytest.raises(RuntimeError, match="thumbnail failed"):
        asyncio.run(write_topic_blog_service.handle_write_topic_blog(topic))

    assert not (temp_topic_blog_dir / "005.md").exists()


def test_handle_write_topic_blog_rejects_generated_duplicate_vocabulary(
    temp_topic_blog_dir,
    monkeypatch,
):
    """`handle_write_topic_blog` should reject output that reuses excluded vocabulary."""

    async def generate(
        self,
        topic,
        blog_num,
        posted_at,
        excludes,
        topic_sequence,
        include_thumbnail,
    ):
        return GeneratedTopicBlog(
            topic=topic,
            vocabs=["rabbit"],
            content=(
                "---\ncategory: \"주제별영어\"\n---\n\n"
                "## 1. 토끼 (Rabbit)\n\n"
                "## 2. 개 (Dog)\n"
            ),
        )

    async def fail_thumbnail(*args, **kwargs):
        raise AssertionError("thumbnail generation should not run for duplicates")

    monkeypatch.setattr(TopicBlogWriter, "generate", generate)
    monkeypatch.setattr(
        write_topic_blog_service,
        "generate_topic_thumbnail",
        fail_thumbnail,
    )

    # Given
    topic = "동물"

    # When / Then
    with pytest.raises(RuntimeError, match="dog"):
        asyncio.run(write_topic_blog_service.handle_write_topic_blog(topic))

    assert not (temp_topic_blog_dir / "005.md").exists()


def test_handle_write_topic_blog_auto_selects_new_topic(
    temp_topic_blog_dir,
    monkeypatch,
):
    """`handle_write_topic_blog` should select a topic from the configured pool."""
    captured: dict[str, object] = {}

    async def generate(
        self,
        topic,
        blog_num,
        posted_at,
        excludes,
        topic_sequence,
        include_thumbnail,
    ):
        captured["topic"] = topic
        captured["excludes"] = excludes
        captured["topic_sequence"] = topic_sequence
        return GeneratedTopicBlog(
            topic=topic,
            vocabs=["rabbit"],
            content="---\ncategory: \"주제별영어\"\n---\n\nGenerated body.\n",
        )

    async def generate_thumbnail(path: Path, topic: str):
        captured["thumbnail_topic"] = topic

    monkeypatch.setattr(write_topic_blog_service.random, "choice", lambda _: "동물")
    monkeypatch.setattr(TopicBlogWriter, "generate", generate)
    monkeypatch.setattr(
        write_topic_blog_service,
        "generate_topic_thumbnail",
        generate_thumbnail,
    )

    # Given
    topic = None

    # When
    result = asyncio.run(write_topic_blog_service.handle_write_topic_blog(topic))

    # Then
    assert result == temp_topic_blog_dir / "005.md"
    assert captured["topic"] == "동물"
    assert captured["excludes"] == [
        "개",
        "Dog",
        "고양이",
        "Cat",
        "의자",
        "Chair",
        "다리미",
        "Iron",
        "덤벨",
        "Dumbbell",
    ]
    assert captured["topic_sequence"] == 2
    assert captured["thumbnail_topic"] == "동물"


def test_handle_write_topic_blog_raises_when_topic_pool_is_empty(
    tmp_path,
    monkeypatch,
):
    """`handle_write_topic_blog` should fail when no automatic topics are configured."""
    blog_dir = tmp_path / "blog"
    monkeypatch.setattr(config, "blog_dir", blog_dir)
    monkeypatch.setitem(write_topic_blog_service.TOPIC_PROMPT, "topic_pool", [])

    async def fail_generate(*args, **kwargs):
        raise AssertionError("generate should not run without a topic")

    monkeypatch.setattr(TopicBlogWriter, "generate", fail_generate)

    # Given
    topic = None

    # When / Then
    with pytest.raises(RuntimeError, match="Topic pool is empty"):
        asyncio.run(
            write_topic_blog_service.handle_write_topic_blog(
                topic,
                with_thumbnail=False,
            )
        )


def test_handle_write_topic_blog_matches_existing_vocab_by_exact_topic(
    temp_topic_blog_dir,
    monkeypatch,
):
    """`handle_write_topic_blog` should not mix overlapping topic vocabularies."""
    captured: dict[str, object] = {}

    async def generate(
        self,
        topic,
        blog_num,
        posted_at,
        excludes,
        topic_sequence,
        include_thumbnail,
    ):
        captured["topic"] = topic
        captured["excludes"] = excludes
        captured["topic_sequence"] = topic_sequence
        return GeneratedTopicBlog(
            topic=topic,
            vocabs=["stretching"],
            content="---\ncategory: \"주제별영어\"\n---\n\nGenerated body.\n",
        )

    monkeypatch.setattr(write_topic_blog_service.random, "choice", lambda _: "운동")
    monkeypatch.setattr(TopicBlogWriter, "generate", generate)

    # Given
    topic = None

    # When
    result = asyncio.run(
        write_topic_blog_service.handle_write_topic_blog(
            topic,
            with_thumbnail=False,
        )
    )

    # Then
    assert result == temp_topic_blog_dir / "005.md"
    assert captured["topic"] == "운동"
    assert captured["excludes"] == [
        "개",
        "Dog",
        "고양이",
        "Cat",
        "의자",
        "Chair",
        "다리미",
        "Iron",
        "덤벨",
        "Dumbbell",
    ]
    assert captured["topic_sequence"] == 1


def test_topic_pool_has_enough_unique_topics():
    """`topic_pool` should keep enough unique topics for automation."""
    # Given
    topic_pool = TOPIC_PROMPT["topic_pool"]

    # When
    unique_topics = set(topic_pool)

    # Then
    assert len(topic_pool) >= 100
    assert len(unique_topics) == len(topic_pool)
    assert "야채" not in topic_pool
    assert "부엌" not in topic_pool


def test_topic_blog_writer_omits_image_references_without_thumbnail(monkeypatch):
    """`TopicBlogWriter` should omit thumbnail references when thumbnail generation is disabled."""
    writer = TopicBlogWriter()

    async def write_topic_content(topic: str, excludes: list[str]):
        return TopicBlogContent(
            vocabs=["rabbit"],
            content="## 1. 토끼 (Rabbit)\n\n토끼를 뜻해요.",
        )

    async def write_topic_meta(
        topic: str,
        content: TopicBlogContent,
        topic_sequence: int,
    ):
        return TopicBlogMeta(
            title="동물 영어로 배우기 #2 - 토끼 영어로",
            alt="동물 영어 표현 썸네일",
            description="'토끼'를 영어로 어떻게 표현하면 좋을까요?",
            faqs=[
                TopicFAQ(
                    question="토끼를 영어로 어떻게 표현할까요?",
                    answer="토끼는 영어로 'rabbit'이라고 표현해요.",
                )
            ],
        )

    monkeypatch.setattr(writer, "_write_topic_content", write_topic_content)
    monkeypatch.setattr(writer, "_write_topic_meta", write_topic_meta)

    # Given
    include_thumbnail = False

    # When
    result = asyncio.run(
        writer.generate(
            "동물",
            3,
            excludes=[],
            topic_sequence=2,
            include_thumbnail=include_thumbnail,
        )
    )

    # Then
    assert 'thumbnail: "./003.png"' not in result.content
    assert "동물 영어 표현 썸네일" not in result.content
    assert "![동물 영어 표현 썸네일](./003.png)" not in result.content
