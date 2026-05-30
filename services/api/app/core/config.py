# PURPOSE:
#   Central configuration management for the entire application.
#   Uses pydantic-settings to read values from .env file automatically.
#   Any service or module that needs a setting imports `settings` from here.
#
# HOW IT CONNECTS:
#   → main.py imports settings for app metadata
#   → core/database.py imports settings for DATABASE_URL
#   → auth/ imports settings for SECRET_KEY and token expiry times

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """
    All configuration values for SynapseOS.
    Values are automatically loaded from the .env file.
    """

    # ── App ───────────────────────────────────────────────────────────────
    APP_NAME: str = "SynapseOS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ALLOWED_ORIGINS: list[str] = ["*"]

    # ── Database ──────────────────────────────────────────────────────────
    # asyncpg driver is required for async SQLAlchemy
    DATABASE_URL: str

    # ── JWT / Security ────────────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Future services (placeholders) ────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"
    QDRANT_URL: str = "http://localhost:6333"

    # Tells pydantic-settings to read from .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# lru_cache ensures Settings() is only created ONCE (singleton pattern).
# This is important — we don't want to re-read the .env file on every import.
@lru_cache()
def get_settings() -> Settings:
    return Settings()


# A module-level shortcut so other files can just do:
#   from app.core.config import settings
settings = get_settings()
