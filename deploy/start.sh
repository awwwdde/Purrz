#!/usr/bin/env bash
#
# Entrypoint контейнера Purrz.
#
# 1) убеждаемся что nginx-кэш и /var/log/nginx существуют;
# 2) если задан DATABASE_URL — ждём пока Postgres ответит (макс 60 с);
# 3) отдаём управление supervisor'у — он поднимает nginx + uvicorn,
#    а uvicorn на старте сам прогонит init_db + seed (см. main.lifespan).

set -euo pipefail

echo "[start] purrz контейнер запускается…"

# Каталоги для nginx (slim-образ может не иметь их по умолчанию).
mkdir -p /var/log/nginx /var/lib/nginx /run

# DATABASE_URL — пробрасывает awwwdde-панель (postgres гостя).
if [[ -n "${DATABASE_URL:-}" ]]; then
  masked="${DATABASE_URL%%@*}@***"
  echo "[start] DATABASE_URL=${masked}"

  # Ждём, пока БД станет доступна. На холодном старте Postgres у соседнего
  # контейнера ещё не успел подняться — uvicorn упадёт без этого ожидания.
  python3 - <<'PY'
import os, sys, time
import psycopg

url = os.environ["DATABASE_URL"]
# Нормализация driver-префикса (psycopg.connect не понимает postgresql+psycopg://).
url_clean = url.replace("postgresql+psycopg://", "postgresql://").replace("postgres://", "postgresql://")

deadline = time.time() + 60
last_err = None
while time.time() < deadline:
    try:
        with psycopg.connect(url_clean, connect_timeout=3) as conn:
            conn.execute("SELECT 1")
        print("[start] Postgres готов.")
        sys.exit(0)
    except Exception as exc:
        last_err = exc
        time.sleep(2)

print(f"[start] Postgres не ответил за 60с: {last_err!r}", file=sys.stderr)
sys.exit(1)
PY
else
  echo "[start] DATABASE_URL не задан — бэк работает с SQLite-файлом ./purrz_dev.db."
fi

echo "[start] launching supervisor (nginx + uvicorn)"
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
