"""Подключение к БД.

Поддерживает два режима:
  - dev: SQLite-файл (никаких внешних зависимостей)
  - prod: Postgres (awwwdde-панель прокидывает DATABASE_URL)

`init_db()` идемпотентно создаёт таблицы; миграции схемы пока без alembic —
для демо достаточно create_all. Если понадобится менять колонки на живой
БД — добавим ALTER TABLE IF NOT EXISTS-блоки.
"""
from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings


def _normalize_db_url(url: str) -> str:
    """postgresql:// → postgresql+psycopg:// (явный драйвер psycopg3)."""
    if url.startswith("postgresql+"):
        return url
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://") :]
    return url


_normalized = _normalize_db_url(settings.database_url)
_is_sqlite = _normalized.startswith("sqlite")

engine = create_engine(
    _normalized,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Создать все таблицы. Идемпотентно: уже существующие не трогает."""
    from . import models  # noqa: F401  — регистрируем модели

    Base.metadata.create_all(bind=engine)
