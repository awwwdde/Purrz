"""Purrz backend — главный entrypoint.

Регистрирует роутеры, поднимает CORS, на старте дёргает init_db + seed.

Эндпоинты сгруппированы по тегам:
  auth, account, catalog, companies, leads, reviews, crm, admin, root.

Swagger: /docs, OpenAPI: /openapi.json.
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import settings
from .db import init_db
from .routers import (
    account,
    admin,
    auth,
    catalog,
    companies,
    crm,
    inn,
    leads,
    reviews,
)
from .seed import seed_if_empty


# ── Lifespan ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Старт-апа: создать таблицы и засеять демо-данные. Идемпотентно."""
    init_db()
    try:
        seed_if_empty()
    except Exception as exc:  # noqa: BLE001
        # Сидинг не должен ронять бэк — пишем в лог и продолжаем.
        print(f"[seed] WARNING: {exc!r}")
    yield


app = FastAPI(
    title="Purrz API",
    description="Aggregator backend",
    version="0.2.0",
    lifespan=lifespan,
)


# ── CORS ────────────────────────────────────────────────────────────────────

_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://purrz.awwwdde.art",
]
_extra = [o.strip() for o in (settings.extra_cors_origins or "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _extra,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health/Root ─────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str


@app.get("/", tags=["root"])
def root() -> dict:
    return {"name": "Purrz API", "docs": "/docs", "version": app.version}


@app.get("/health", response_model=HealthResponse, tags=["root"])
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=app.version,
    )


@app.get("/healthz", response_model=HealthResponse, tags=["root"])
def healthz() -> HealthResponse:
    """Алиас /health для awwwdde-панели."""
    return health()


# ── Регистрация роутеров ───────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(account.router)
app.include_router(catalog.router)
app.include_router(companies.router)
app.include_router(leads.router)
app.include_router(reviews.router)
app.include_router(inn.router)
app.include_router(crm.router)
app.include_router(admin.router)
