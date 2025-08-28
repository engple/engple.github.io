import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Config(BaseSettings):
    blog_dir: Path = Path(os.path.join(os.path.dirname(__file__), "../../src/posts/blog"))

config = Config()

__all__ = ["config", "Config"]