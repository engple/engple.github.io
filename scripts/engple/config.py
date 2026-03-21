import os
from pathlib import Path
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_examples: str = "openai:gpt-4.1-mini"
    model_translation: str = "openai:gpt-4o-mini"
    model_content: str = "openai:gpt-4.1"
    model_meta: str = "openai:gpt-4.1-mini"
    model_expressions: str = "openai:gpt-4.1-mini"
    model_image_selector: str = "openai:gpt-4o-mini"
    blog_dir: Path = Path(__file__).resolve().parents[2] / "src" / "posts" / "blog"
    openai_api_key: SecretStr = SecretStr("YOUR_API_KEY")
    notion_api_key: SecretStr = SecretStr("YOUR_API_KEY")
    notion_engple_database_id: str = "YOUR_DATABASE_ID"
    unsplash_access_key: SecretStr = SecretStr("YOUR_API_KEY")
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    def export_variables(self):
        """Export some configuration values to environment variables."""
        os.environ["OPENAI_API_KEY"] = self.openai_api_key.get_secret_value()


config = Config()

config.export_variables()


__all__ = ["config", "Config"]
