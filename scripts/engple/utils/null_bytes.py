from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class NullByteRemovalResult:
    path: Path
    changed: bool


def remove_null_bytes(text: str) -> str:
    return text.replace("\x00", "")


def remove_null_bytes_from_post_files(
    paths: list[Path],
    *,
    write: bool,
) -> list[NullByteRemovalResult]:
    return [_remove_null_bytes_from_post_file(path, write=write) for path in paths]


def _remove_null_bytes_from_post_file(
    path: Path,
    *,
    write: bool,
) -> NullByteRemovalResult:
    original = path.read_text(encoding="utf-8")
    cleaned = remove_null_bytes(original)
    changed = cleaned != original

    if changed and write:
        path.write_text(cleaned, encoding="utf-8")

    return NullByteRemovalResult(path=path, changed=changed)


def collect_markdown_posts(root: Path) -> list[Path]:
    return sorted(root.rglob("*.md"))
