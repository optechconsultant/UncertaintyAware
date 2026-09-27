"""Application configuration loaded from environment variables."""
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "conformguard-student3"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8003

    # Database
    DATABASE_URL: str = "sqlite:////tmp/conformguard_student3.db"

    # API Keys (module-to-module authentication)
    STUDENT2_API_KEY: str = "student2-dev-key"
    STUDENT4_API_KEY: str = "student4-dev-key"
    ADMIN_API_KEY: str = "admin-dev-key"

    # Optional LLM for risk analysis
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    LLM_RISK_ANALYSIS_ENABLED: bool = False

    # Logging
    LOG_DIR: str = "logs"
    RESULTS_LOG_FILE: str = "logs/results_log.jsonl"
    RESULTS_LOG_INPROGRESS_FILE: str = "logs/results_log_INPROGRESS.jsonl"

    # Defaults for analytics (never hard-code business thresholds)
    DEFAULT_ALPHA: float = 0.05


@lru_cache
def get_settings() -> Settings:
    return Settings()
