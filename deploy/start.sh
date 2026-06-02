#!/usr/bin/env bash
#
# Entrypoint контейнера Purrz.
#
# Этап «MVP-деплоя» (mock-данные, без БД):
#   1) убеждаемся что nginx-кэш и /var/log/nginx существуют;
#   2) отдаём управление supervisor'у — он поднимает nginx + uvicorn.
#
# Когда подключим Postgres / Alembic — сюда добавится прогон миграций и
# идемпотентный seed.

set -euo pipefail

echo "[start] purrz контейнер запускается…"

# Каталоги для nginx (в slim-образах может не быть pid/log dirs).
mkdir -p /var/log/nginx /var/lib/nginx /run

# DATABASE_URL присылает awwwdde-панель; пока бэк его не использует,
# но печатаем замаскированный — удобно дебажить.
if [[ -n "${DATABASE_URL:-}" ]]; then
  masked="${DATABASE_URL%%@*}@***"
  echo "[start] DATABASE_URL=${masked}"
else
  echo "[start] DATABASE_URL не задан — бэк в mock-режиме."
fi

echo "[start] launching supervisor (nginx + uvicorn)"
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
