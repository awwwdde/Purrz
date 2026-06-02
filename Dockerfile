# Purrz — образ для платформы awwwdde.
#
# Контракт гостя нашей панели:
#   • один контейнер, слушает порт 8080 внутри
#   • GET /healthz → 200, когда сервис готов
#   • DATABASE_URL берётся из env (Postgres от awwwdde-панели)
#
# Multistage:
#   1. node — собирает SPA через pnpm в frontend/dist
#   2. python:3.12-slim — ставит nginx + uvicorn + supervisor + psycopg,
#      nginx раздаёт SPA и проксирует /api → uvicorn (127.0.0.1:8000),
#      внешний порт = 8080.

# ─── Stage 1: фронт ──────────────────────────────────────────────────────
FROM node:20-alpine AS web
WORKDIR /build

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

COPY frontend ./frontend

# Фронт ходит относительно (одна origin с бэком через nginx).
ARG VITE_API_BASE="/api"
ENV VITE_API_BASE=${VITE_API_BASE}

RUN pnpm --filter purrz-frontend build


# ─── Stage 2: runtime ────────────────────────────────────────────────────
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONIOENCODING=utf-8

# nginx + supervisor + curl (для отладки healthcheck'ов) + libpq для psycopg.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
         nginx supervisor curl libpq5 \
    && rm -rf /var/lib/apt/lists/* /var/log/nginx/*

WORKDIR /app

# Python deps бэка — отдельный слой (кешируется).
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install -r /app/backend/requirements.txt

# Бэкенд-код
COPY backend /app/backend

# Конфиги nginx + supervisor + entrypoint
COPY deploy/nginx.conf       /etc/nginx/nginx.conf
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY deploy/start.sh         /app/start.sh
RUN chmod +x /app/start.sh

# Собранный SPA из stage 1 → nginx раздаёт
COPY --from=web /build/frontend/dist /srv/web

EXPOSE 8080

CMD ["/app/start.sh"]
