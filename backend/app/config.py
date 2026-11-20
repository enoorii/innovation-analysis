from os import getenv
from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/config.py → backend/
PROJECT_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / getenv("ENV_FILE", ".env")),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ---- OpenAI / OpenAI-compatible provider ----
    # Set OPENAI_BASE_URL to point at Groq, Together, Ollama, vLLM, etc.
    # Leave blank to use the default https://api.openai.com/v1.
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str | None = None
    OPENAI_CHAT_MODEL: str = "gpt-6-luna"
    OPENAI_EMBED_MODEL: str = "text-embedding-3-small"

    # ---- storage ----
    CHROMA_DIR: Path = Path("./chroma_db")
    KNOWLEDGE_DIR: Path = Path("../data/knowledge")
    DATA_DIR: Path = Path("../data/processed")

    # ---- http ----
    DASHBOARD_ORIGIN: str = "http://localhost:5173"

    # ---- chunking ----
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 80
    TOP_K: int = 5

    # ---- session ----
    SESSION_TTL_SECONDS: int = 3600

    @model_validator(mode="after")
    def _resolve_paths(self) -> "Settings":
        """Resolve relative paths against PROJECT_ROOT so CWD doesn't matter."""
        for attr in ("CHROMA_DIR", "KNOWLEDGE_DIR", "DATA_DIR"):
            p: Path = getattr(self, attr)
            if not p.is_absolute():
                setattr(self, attr, (PROJECT_ROOT / p).resolve())
        return self


settings = Settings()
