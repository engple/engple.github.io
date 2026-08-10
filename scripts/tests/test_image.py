import pytest

from engple.utils import image as image_module


class RecordingTextPart:
    def __init__(self, *, text, color=None, **kwargs):
        self.text = text
        self.color = color


class RecordingCanvas:
    captured_text_parts: list[RecordingTextPart] = []

    @classmethod
    def from_aspect_ratio(cls, ratio, base_width):
        return cls()

    def background(self, **kwargs):
        return self

    def text(self, content, **kwargs):
        type(self).captured_text_parts = content
        return self

    def render(self, path):
        return None


@pytest.fixture
def capture_thumbnail_text_parts(monkeypatch):
    monkeypatch.setattr(image_module, "Canvas", RecordingCanvas)
    monkeypatch.setattr(image_module, "TextPart", RecordingTextPart)

    def capture(renderer, title):
        renderer("thumbnail.png", "https://example.com/background.jpg", title)
        return RecordingCanvas.captured_text_parts

    return capture


def test_it_uses_the_legacy_neon_green_accent_for_expression_thumbnails(
    capture_thumbnail_text_parts,
):
    # Given
    renderer = image_module.render_expression_thumbnail

    # When
    text_parts = capture_thumbnail_text_parts(renderer, "내려주다")

    # Then
    assert text_parts[0].color == "#1FFFAA"


def test_it_keeps_the_amber_accent_for_topic_thumbnails(
    capture_thumbnail_text_parts,
):
    # Given
    renderer = image_module.render_topic_thumbnail

    # When
    text_parts = capture_thumbnail_text_parts(renderer, "동물")

    # Then
    assert text_parts[0].color == "#FBBF24"
