import random
from typing import Iterator, cast
from zoneinfo import ZoneInfo
from loguru import logger
from engple.constants import BLOG_IN_ENGLISH_DIR
from engple.core.blog_writer import BlogWriter
from engple.models import EngpleItem

from engple.config import config
from engple.utils.image import url_to_file
from notion_client import Client as NotionClient
import datetime


def handle_write_blog(count: int) -> list[str]:
    writer = BlogWriter()
    expressions = []
    first_post_at = datetime.datetime.now(
        tz=ZoneInfo("Asia/Seoul")
    ) - _get_post_interval() * (count - 1)
    for idx, item in enumerate(_stream_engple_item(count)):
        posted_at = first_post_at + _get_post_interval() * idx
        blog_num = _get_next_blog_num()
        content = writer.generate(item.expression, blog_num, posted_at)

        file_name = f"{blog_num}.{item.expression.replace(' ', '-')}.md"
        blog_path = BLOG_IN_ENGLISH_DIR / file_name
        thumbnail_path = BLOG_IN_ENGLISH_DIR / f"{blog_num}.png"

        with open(blog_path, "w") as f:
            f.write(content)
            logger.debug(f"✅ Successfully wrote blog for {item.expression}")

        with open(thumbnail_path, "wb") as f:
            f.write(item.thumbnail.getbuffer())
            logger.debug(f"✅ Successfully wrote thumbnail for {item.expression}")

        expressions.append(item.expression)
        _mark_as_done(item.page_id)
    return expressions


def _get_post_interval() -> datetime.timedelta:
    return datetime.timedelta(
        minutes=30 + random.randint(0, 30), seconds=random.randint(0, 60)
    )


def _stream_engple_item(count: int) -> Iterator[EngpleItem]:
    notion_client = NotionClient(auth=config.notion_api_key.get_secret_value())
    database = cast(
        dict,
        notion_client.databases.query(
            database_id=config.notion_engple_database_id,
            filter={
                "and": [
                    {"property": "status", "select": {"is_empty": True}},
                    {"property": "thumbnail", "files": {"is_not_empty": True}},
                ]
            },
            sorts=[
                {
                    "property": "created",
                    "direction": "ascending",
                }
            ],
        ),
    )

    for idx, page in enumerate(database["results"]):
        status = (
            page["properties"]["status"]["select"]["name"]
            if page["properties"]["status"]["select"]
            else None
        )

        thumbnail_url = page["properties"]["thumbnail"]["files"][0]["file"]["url"]
        thumbnail = url_to_file(thumbnail_url, image_format="WEBP")

        yield EngpleItem(
            page_id=page["id"],
            expression=page["properties"]["expression"]["title"][0]["text"]["content"],
            thumbnail=thumbnail,
            status=status,
            created=datetime.datetime.fromisoformat(
                page["properties"]["created"]["created_time"]
            ),
        )

        if count - 1 == idx:
            break


def _get_next_blog_num() -> str:
    last_num = max(
        [
            int(p.stem.split(".")[0])
            for p in BLOG_IN_ENGLISH_DIR.rglob("*.md")
            if p.stem.split(".")[0].isdigit()
        ]
    )
    num = f"{last_num + 1:03d}"
    return num


def _mark_as_done(page_id: str):
    notion_client = NotionClient(auth=config.notion_api_key.get_secret_value())
    notion_client.pages.update(
        page_id=page_id, properties={"status": {"select": {"name": "DONE"}}}
    )


__all__ = ["handle_write_blog"]
