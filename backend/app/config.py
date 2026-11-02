from __future__ import annotations

import secrets
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "FINDtech API"
    environment: str = Field(default="development", description="development | production")
    debug: bool = False

    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "findtech"

    secret_key: str = "dev-secret-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    # Comma-separated allowed browser origins (no wildcards in production)
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Comma-separated hosts for TrustedHostMiddleware (Render: your-service.onrender.com)
    allowed_hosts: str = "*"

    # Use in-memory DB when MongoDB is unavailable (local dev without Atlas/Docker)
    use_memory_db: bool = False

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def allowed_hosts_list(self) -> list[str]:
        hosts = [h.strip() for h in self.allowed_hosts.split(",") if h.strip()]
        return hosts if hosts else ["*"]

    @field_validator("secret_key")
    @classmethod
    def secret_key_not_empty(cls, v: str) -> str:
        if not v or len(v) < 16:
            raise ValueError("SECRET_KEY must be at least 16 characters")
        return v

    def validate_production(self) -> None:
        """Raise if production config is insecure."""
        if not self.is_production:
            return
        if self.debug:
            raise ValueError("DEBUG must be false in production")
        if len(self.secret_key) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters in production")
        if self.secret_key in (
            "dev-secret-change-in-production",
            "change-this-to-a-long-random-secret-in-production",
        ):
            raise ValueError("SECRET_KEY must not use the example placeholder in production")
        if "*" in self.cors_origins:
            raise ValueError("CORS_ORIGINS must not contain wildcards in production")
        if not self.cors_origins_list:
            raise ValueError("CORS_ORIGINS must list your Vercel frontend URL(s) in production")


def generate_secret_key() -> str:
    """Generate a secure JWT secret for production."""
    return secrets.token_urlsafe(48)


@lru_cache
def get_settings() -> Settings:
    return Settings()
