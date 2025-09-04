import os
from pathlib import Path
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    blog_dir: Path = Path(
        os.path.join(os.path.dirname(__file__), "../../src/posts/blog")
    )

    model_examples: str = "openai:gpt-4.1"
    model_translation: str = "openai:gpt-4.1-mini"
    model_content: str = "openai:gpt-4.1"
    model_meta: str = "openai:gpt-4.1"
    model_recommend: str = "openai:gpt-4.1"
    openai_api_key: SecretStr = SecretStr("YOUR_API_KEY")
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    def export_variables(self):
        """Export some configuration values to environment variables."""
        os.environ["OPENAI_API_KEY"] = self.openai_api_key.get_secret_value()


config = Config()  # type: ignore[call-arg]

config.export_variables()


__all__ = ["config", "Config"]
