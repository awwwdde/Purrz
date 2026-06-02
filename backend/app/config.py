"""Конфигурация Purrz-бэка.

Всё берётся из переменных окружения. Дефолты подобраны так, чтобы
`pnpm run dev:backend` поднимал локально без .env (для разработки).
В docker-контейнере наша awwwdde-панель прокидывает DATABASE_URL и
секреты автоматически.
"""
from __future__ import annotations

import secrets
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── БД ──────────────────────────────────────────────────────────────────
    # В docker-режиме DATABASE_URL пробрасывает awwwdde-панель (postgres).
    # Для локальной разработки берём SQLite-файл — чтобы не тянуть postgres.
    database_url: str = "sqlite:///./purrz_dev.db"

    # ── Auth ────────────────────────────────────────────────────────────────
    # JWT-secret: панель прокидывает JWT_SECRET автоматически (см. engine.py).
    # Дефолт — случайный per-process; в проде ОБЯЗАТЕЛЬНО переопределяется
    # из env, иначе после рестарта сессии инвалидируются.
    jwt_secret: str = secrets.token_urlsafe(48)
    jwt_access_ttl_hours: int = 12
    jwt_refresh_ttl_days: int = 30

    # ── Bootstrap-аккаунты (создаются при первом сидинге) ───────────────────
    # Заполни эти env через UI «.env» в awwwdde-панели или вручную.
    # Если не заданы — bootstrap-юзеры не создаются, заведёшь через /docs.
    bootstrap_admin_email: str | None = None
    bootstrap_admin_password: str | None = None
    bootstrap_manager_email: str | None = None
    bootstrap_manager_password: str | None = None
    bootstrap_user_email: str | None = None
    bootstrap_user_password: str | None = None

    # ── CORS ────────────────────────────────────────────────────────────────
    # В проде фронт и бэк живут на одном origin (nginx внутри контейнера),
    # CORS не нужен. Добавляем dev-origins для удобства разработки.
    extra_cors_origins: str = ""  # через запятую


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
