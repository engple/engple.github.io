import asyncio
from pathlib import Path

import pytest

from engple.config import config
from engple.core.blog_writer import BlogWriter, GeneratedBlog
from engple.services import write_blog as write_blog_service


def _write_existing_post(path: Path, expression: str, meaning: str) -> None:
    path.write_text(
        (
            "---\n"
            f"title: \"'{meaning}' 영어로 어떻게 표현할까\"\n"
            'category: "영어표현"\n'
            "---\n\n"
            f"## 🌟 영어 표현 - {expression}\n\n"
            "Existing body.\n"
        ),
        encoding="utf-8",
    )


def _build_generated_blog(expression: str, meaning: str) -> GeneratedBlog:
    return GeneratedBlog(
        expression=expression,
        meanings=[meaning],
        content=(
            "---\n"
            'category: "영어표현"\n'
            "---\n\n"
            f"## 🌟 영어 표현 - {expression}\n\n"
            "Generated body.\n"
        ),
    )


def _split_expression_seed(seed: str) -> tuple[str, str]:
    english, _, remainder = seed.partition("(")
    return english.strip(), remainder.rstrip(") ").strip()


async def _noop_thumbnail(*args, **kwargs):
    return None


@pytest.fixture
def temp_blog_dirs(tmp_path, monkeypatch):
    """Provide a temporary blog directory with one existing expression post."""
    blog_dir = tmp_path / "blog"
    in_english_dir = blog_dir / "in-english"
    in_english_dir.mkdir(parents=True)
    _write_existing_post(in_english_dir / "001.drop-off.md", "drop off", "내려주다")

    monkeypatch.setattr(config, "blog_dir", blog_dir)

    return blog_dir, in_english_dir


def test_handle_write_blog_writes_only_unique_english_expressions(
    temp_blog_dirs,
    monkeypatch,
):
    """`handle_write_blog` should dedupe by English part and write only unique posts."""
    _, in_english_dir = temp_blog_dirs
    requested_counts: list[int] = []

    async def generate_candidate_expressions(
        self, existing_expressions: list[str], count: int
    ):
        requested_counts.append(count)
        assert "drop off (내려주다)" in existing_expressions
        return [
            "drop off (떨어뜨리다)",
            "take off (떠나다)",
            "take off (벗다)",
            "stop over (경유하다)",
            "look after (돌보다)",
            "brand new (완전히 새로운)",
        ]

    async def generate(
        self, expression: str, blog_num: int, posted_at
    ) -> GeneratedBlog:
        english, meaning = _split_expression_seed(expression)
        return _build_generated_blog(english, meaning)

    monkeypatch.setattr(
        BlogWriter, "generate_candidate_expressions", generate_candidate_expressions
    )
    monkeypatch.setattr(BlogWriter, "generate", generate)
    monkeypatch.setattr(write_blog_service, "generate_thumbnail", _noop_thumbnail)

    # given
    count = 3

    # when
    result = asyncio.run(write_blog_service.handle_write_blog(count))

    # then
    assert requested_counts == [6]
    assert result == ["take off", "stop over", "look after"]
    assert (in_english_dir / "002.take-off.md").exists()
    assert (in_english_dir / "003.stop-over.md").exists()
    assert (in_english_dir / "004.look-after.md").exists()


def test_handle_write_blog_retries_until_requested_count(
    temp_blog_dirs,
    monkeypatch,
):
    """`handle_write_blog` should retry with the remaining count times two."""
    _, in_english_dir = temp_blog_dirs
    requested_counts: list[int] = []
    candidate_round = {"value": 0}

    async def generate_candidate_expressions(
        self, existing_expressions: list[str], count: int
    ):
        requested_counts.append(count)
        candidate_round["value"] += 1

        if candidate_round["value"] == 1:
            return [
                "drop off (내려주다)",
                "take off (떠나다)",
                "take off (벗다)",
                "drop off (떨어뜨리다)",
            ]

        return [
            "look after (돌보다)",
            "break down (고장 나다)",
            "drop off (떨어뜨리다)",
            "look after (보살피다)",
        ]

    async def generate(
        self, expression: str, blog_num: int, posted_at
    ) -> GeneratedBlog:
        english, meaning = _split_expression_seed(expression)
        return _build_generated_blog(english, meaning)

    monkeypatch.setattr(
        BlogWriter, "generate_candidate_expressions", generate_candidate_expressions
    )
    monkeypatch.setattr(BlogWriter, "generate", generate)
    monkeypatch.setattr(write_blog_service, "generate_thumbnail", _noop_thumbnail)

    # given
    count = 3

    # when
    result = asyncio.run(write_blog_service.handle_write_blog(count))

    # then
    assert requested_counts == [6, 4]
    assert result == ["take off", "look after", "break down"]
    assert (in_english_dir / "002.take-off.md").exists()
    assert (in_english_dir / "003.look-after.md").exists()
    assert (in_english_dir / "004.break-down.md").exists()


def test_handle_write_blog_raises_when_retry_cap_is_hit(
    temp_blog_dirs,
    monkeypatch,
):
    """`handle_write_blog` should fail when retries still produce no new English expressions."""
    _, in_english_dir = temp_blog_dirs

    async def generate_candidate_expressions(
        self, existing_expressions: list[str], count: int
    ):
        return ["drop off (내려주다)", "drop off (떨어뜨리다)"]

    async def generate(self, expression: str, blog_num: int, posted_at):
        raise AssertionError(
            "generate should not be called when every candidate is rejected"
        )

    monkeypatch.setattr(
        BlogWriter, "generate_candidate_expressions", generate_candidate_expressions
    )
    monkeypatch.setattr(BlogWriter, "generate", generate)
    monkeypatch.setattr(write_blog_service, "MAX_CANDIDATE_GENERATION_ROUNDS", 2)

    # given
    count = 2

    # when / then
    with pytest.raises(
        RuntimeError,
        match="Requested 2, wrote 0 after 2 rounds",
    ):
        asyncio.run(write_blog_service.handle_write_blog(count))

    assert sorted(path.name for path in in_english_dir.glob("*.md")) == [
        "001.drop-off.md"
    ]


def test_handle_write_blog_rejects_expression_drift_to_existing_post(
    temp_blog_dirs,
    monkeypatch,
):
    """`handle_write_blog` should reject a drifted model output when the English part changes."""
    _, in_english_dir = temp_blog_dirs

    async def generate_candidate_expressions(
        self, existing_expressions: list[str], count: int
    ):
        return ["brand new (완전히 새로운)"]

    async def generate(
        self, expression: str, blog_num: int, posted_at
    ) -> GeneratedBlog:
        return _build_generated_blog("drop off", "내려주다")

    monkeypatch.setattr(
        BlogWriter, "generate_candidate_expressions", generate_candidate_expressions
    )
    monkeypatch.setattr(BlogWriter, "generate", generate)
    monkeypatch.setattr(write_blog_service, "MAX_CANDIDATE_GENERATION_ROUNDS", 1)
    monkeypatch.setattr(write_blog_service, "_generate_thumbnail", _noop_thumbnail)

    # given
    count = 1

    # when / then
    with pytest.raises(
        RuntimeError,
        match="Requested 1, wrote 0 after 1 rounds",
    ):
        asyncio.run(write_blog_service.handle_write_blog(count))

    assert sorted(path.name for path in in_english_dir.glob("*.md")) == [
        "001.drop-off.md"
    ]
