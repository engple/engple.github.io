import asyncio
from pathlib import Path

import pytest

from engple.config import config
from engple.constants import TOPIC_PROMPT
from engple.core.topic_blog_writer import (
    GeneratedTopicBlog,
    TopicBlogContent,
    TopicBlogMeta,
    TopicVocabCandidates,
    TopicBlogWriter,
    TopicFAQ,
)
from engple.core.topic_vocab import TopicVocabCandidate
from engple.core import topic_blog_writer as topic_blog_writer_module
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

    async def select_topic_vocabs(topic: str, excludes: list[str]):
        return [
            TopicVocabCandidate(korean="토끼", english="Rabbit"),
            TopicVocabCandidate(korean="소", english="Cow"),
            TopicVocabCandidate(korean="말", english="Horse"),
            TopicVocabCandidate(korean="양", english="Sheep"),
            TopicVocabCandidate(korean="돼지", english="Pig"),
        ]

    async def write_topic_content(
        topic: str, vocabs: list[TopicVocabCandidate]
    ):
        return TopicBlogContent(
            vocabs=["rabbit", "cow", "horse", "sheep", "pig"],
            content=(
                "## 1. 토끼 (Rabbit)\n\n토끼를 뜻해요.\n\n"
                "## 2. 소 (Cow)\n\n소를 뜻해요.\n\n"
                "## 3. 말 (Horse)\n\n말을 뜻해요.\n\n"
                "## 4. 양 (Sheep)\n\n양을 뜻해요.\n\n"
                "## 5. 돼지 (Pig)\n\n돼지를 뜻해요."
            ),
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

    monkeypatch.setattr(writer, "_select_topic_vocabs", select_topic_vocabs)
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


def test_topic_blog_writer_selects_unique_vocab_before_writing_content(monkeypatch):
    """`TopicBlogWriter` should filter duplicate candidates before writing content."""
    candidate_outputs = [
        TopicVocabCandidates(
            vocabs=[
                TopicVocabCandidate(korean="개", english="Dog"),
                TopicVocabCandidate(korean="토끼", english="Rabbit"),
                TopicVocabCandidate(korean="소", english="Cow"),
                TopicVocabCandidate(korean="말", english="Horse"),
            ],
        ),
        TopicVocabCandidates(
            vocabs=[
                TopicVocabCandidate(korean="소", english="Cow"),
                TopicVocabCandidate(korean="양", english="Sheep"),
                TopicVocabCandidate(korean="돼지", english="Pig"),
                TopicVocabCandidate(korean="닭", english="Chicken"),
            ],
        ),
    ]
    content_prompts: list[str] = []
    generated_meta_prompt: dict[str, str] = {}

    class FakeRunResult:
        def __init__(self, output):
            self.output = output

    class FakeAgent:
        def __init__(self, model, *, output_type, system_prompt, **kwargs):
            self.output_type = output_type
            self.system_prompt = system_prompt

        async def run(self, prompt):
            if self.output_type is TopicVocabCandidates:
                return FakeRunResult(candidate_outputs.pop(0))

            if self.output_type is TopicBlogContent:
                content_prompts.append(prompt)
                return FakeRunResult(
                    TopicBlogContent(
                        vocabs=["rabbit", "cow", "horse", "sheep", "pig"],
                        content=(
                            "동물 표현을 배워볼게요.\n\n"
                            "## 1. 토끼 (Rabbit)\n\n토끼를 뜻해요.\n\n"
                            "## 2. 소 (Cow)\n\n소를 뜻해요.\n\n"
                            "## 3. 말 (Horse)\n\n말을 뜻해요.\n\n"
                            "## 4. 양 (Sheep)\n\n양을 뜻해요.\n\n"
                            "## 5. 돼지 (Pig)\n\n돼지를 뜻해요."
                        ),
                    )
                )

            generated_meta_prompt["prompt"] = prompt
            return FakeRunResult(
                TopicBlogMeta(
                    title="동물 영어로 배우기 #2 - 토끼, 소, 말 영어로",
                    alt="동물 영어 표현 썸네일",
                    description="'토끼', '소', '말'을 영어로 배워요.",
                    faqs=[
                        TopicFAQ(
                            question="토끼를 영어로 어떻게 표현할까요?",
                            answer="토끼는 영어로 'rabbit'이라고 표현해요.",
                        )
                    ],
                )
            )

    monkeypatch.setattr(topic_blog_writer_module, "Agent", FakeAgent)

    # Given
    writer = TopicBlogWriter()

    # When
    result = asyncio.run(
        writer.generate(
            "동물",
            5,
            excludes=["개", "Dog"],
            topic_sequence=2,
            include_thumbnail=False,
        )
    )

    # Then
    assert "## 1. 토끼 (Rabbit)" in result.content
    assert "## 2. 소 (Cow)" in result.content
    assert "## 3. 말 (Horse)" in result.content
    assert "## 4. 양 (Sheep)" in result.content
    assert "## 5. 돼지 (Pig)" in result.content
    assert "개 (Dog)" not in result.content
    assert "닭 (Chicken)" not in result.content
    assert result.vocabs == ["Rabbit", "Cow", "Horse", "Sheep", "Pig"]
    assert len(content_prompts) == 1
    assert "1. 토끼 (Rabbit)" in content_prompts[0]
    assert "5. 돼지 (Pig)" in content_prompts[0]
    assert "닭 (Chicken)" not in generated_meta_prompt["prompt"]


def test_topic_blog_writer_retries_content_when_heading_format_drifts(monkeypatch):
    """`TopicBlogWriter` should retry content that changes selected heading text."""
    content_outputs = [
        TopicBlogContent(
            vocabs=["rabbit", "cow", "horse", "sheep", "pig"],
            content=(
                "동물 표현을 배워볼게요.\n\n"
                "## 9. 토끼 (rabbit)\n\n토끼를 뜻해요.\n\n"
                "## 2. 소 (Cow)\n\n소를 뜻해요.\n\n"
                "## 3. 말 (Horse)\n\n말을 뜻해요.\n\n"
                "## 4. 양 (Sheep)\n\n양을 뜻해요.\n\n"
                "## 5. 돼지 (Pig)\n\n돼지를 뜻해요."
            ),
        ),
        TopicBlogContent(
            vocabs=["rabbit", "cow", "horse", "sheep", "pig"],
            content=(
                "동물 표현을 배워볼게요.\n\n"
                "## 1. 토끼 (Rabbit)\n\n토끼를 뜻해요.\n\n"
                "## 2. 소 (Cow)\n\n소를 뜻해요.\n\n"
                "## 3. 말 (Horse)\n\n말을 뜻해요.\n\n"
                "## 4. 양 (Sheep)\n\n양을 뜻해요.\n\n"
                "## 5. 돼지 (Pig)\n\n돼지를 뜻해요."
            ),
        ),
    ]

    class FakeRunResult:
        def __init__(self, output):
            self.output = output

    class FakeAgent:
        def __init__(self, model, *, output_type, **kwargs):
            self.output_type = output_type

        async def run(self, prompt):
            if self.output_type is TopicVocabCandidates:
                return FakeRunResult(
                    TopicVocabCandidates(
                        vocabs=[
                            TopicVocabCandidate(korean="토끼", english="Rabbit"),
                            TopicVocabCandidate(korean="소", english="Cow"),
                            TopicVocabCandidate(korean="말", english="Horse"),
                            TopicVocabCandidate(korean="양", english="Sheep"),
                            TopicVocabCandidate(korean="돼지", english="Pig"),
                        ],
                    )
                )

            if self.output_type is TopicBlogContent:
                return FakeRunResult(content_outputs.pop(0))

            return FakeRunResult(
                TopicBlogMeta(
                    title="동물 영어로 배우기 #2 - 토끼, 소, 말 영어로",
                    alt="동물 영어 표현 썸네일",
                    description="'토끼', '소', '말'을 영어로 배워요.",
                    faqs=[
                        TopicFAQ(
                            question="토끼를 영어로 어떻게 표현할까요?",
                            answer="토끼는 영어로 'rabbit'이라고 표현해요.",
                        )
                    ],
                )
            )

    monkeypatch.setattr(topic_blog_writer_module, "Agent", FakeAgent)

    # Given
    writer = TopicBlogWriter()

    # When
    result = asyncio.run(
        writer.generate(
            "동물",
            5,
            excludes=[],
            topic_sequence=2,
            include_thumbnail=False,
        )
    )

    # Then
    assert "## 1. 토끼 (Rabbit)" in result.content
    assert "## 9. 토끼 (rabbit)" not in result.content
    assert content_outputs == []
