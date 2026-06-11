from engple.utils import (
    collect_markdown_posts,
    remove_null_bytes,
    remove_null_bytes_from_post_files,
)


def test_remove_null_bytes_preserves_html():
    """`remove_null_bytes` should remove only null bytes and preserve HTML text."""
    # given
    text = '<a href="/blog/test/">링\x00크</a><span data-answer>답\x00</span>'

    # when
    result = remove_null_bytes(text)

    # then
    assert result == '<a href="/blog/test/">링크</a><span data-answer>답</span>'


def test_remove_null_bytes_from_post_files_requires_write_to_update_files(tmp_path):
    """`remove_null_bytes_from_post_files` should write only when requested."""
    # given
    post = tmp_path / "001.md"
    post.write_text(
        (
            "---\n"
            'title: "질\x00문"\n'
            "---\n\n"
            '<span data-answer>HTML\x00 유지</span>\n'
        ),
        encoding="utf-8",
    )
    paths = collect_markdown_posts(tmp_path)

    # when
    preview_results = remove_null_bytes_from_post_files(paths, write=False)
    preview_content = post.read_text(encoding="utf-8")
    write_results = remove_null_bytes_from_post_files(paths, write=True)
    written_content = post.read_text(encoding="utf-8")

    # then
    assert [result.changed for result in preview_results] == [True]
    assert "\x00" in preview_content
    assert [result.changed for result in write_results] == [True]
    assert "\x00" not in written_content
    assert '<span data-answer>HTML 유지</span>' in written_content
