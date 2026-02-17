from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from functools import lru_cache

class Settings(BaseSettings):
    # App
    app_name: str = "SiteAuditor API"
    
    # ⚠️  WARNING: DEBUG must be False in production.
    #    When True, mock checkout is enabled (free upgrades without payment),
    #    verbose logging is active, and tracebacks may leak.
    #    Set via the DEBUG env var. Defaults to False (production-safe).
    debug: bool = False
    
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Database
    database_url: str
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Timeouts
    request_timeout: float = 10.0
    ssl_timeout: float = 5.0
    
    # CORS
    cors_origins: str = "*"

    # Google PageSpeed
    google_pagespeed_api_key: str = ""

    # Email
    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = ""
    mail_port: int = 587
    mail_server: str = ""
    mail_starttls: bool = True
    mail_ssl_tls: bool = False
    
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id_pro: str = "price_pro_monthly"
    stripe_price_id_agency: str = "price_agency_monthly"

    # Celery
    celery_broker_url: str = "redis://redis:6379/0"
    celery_result_backend: str = "redis://redis:6379/0"

    # Redis
    redis_url: str = "redis://redis:6379/0"

    # AI / LLM
    openrouter_api_key: str = ""
    openai_api_key: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = SettingsConfigDict(
        env_file=[".env", "backend/.env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()
