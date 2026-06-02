"""Auth-примитивы Purrz: bcrypt-хэши + JWT (access + refresh).

bcrypt мы зовём напрямую (не через passlib) — как в нашей awwwdde-панели:
passlib 1.7 несовместим с bcrypt 5.x. Пред-хэшируем пароль через SHA-256,
чтобы обойти ограничение bcrypt в 72 байта.
"""
from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone
from typing import Literal

import bcrypt
import jwt

from .config import settings

_JWT_ALG = "HS256"

TokenType = Literal["access", "refresh"]


# ── Пароли ─────────────────────────────────────────────────────────────────

def _prepare(plain: str) -> bytes:
    return hashlib.sha256(plain.encode("utf-8")).hexdigest().encode("ascii")


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(_prepare(plain), bcrypt.gensalt()).decode("ascii")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare(plain), hashed.encode("ascii"))
    except (ValueError, AttributeError):
        return False


# ── JWT ────────────────────────────────────────────────────────────────────

def _exp_for(kind: TokenType) -> datetime:
    if kind == "access":
        return datetime.now(timezone.utc) + timedelta(hours=settings.jwt_access_ttl_hours)
    return datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_ttl_days)


def issue_token(user_id: int, kind: TokenType) -> tuple[str, datetime]:
    exp = _exp_for(kind)
    payload = {"sub": str(user_id), "type": kind, "exp": int(exp.timestamp())}
    token = jwt.encode(payload, settings.jwt_secret, algorithm=_JWT_ALG)
    return token, exp


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[_JWT_ALG])
    except jwt.PyJWTError:
        return None


def issue_pair(user_id: int) -> tuple[str, str, datetime]:
    """Возвращает (access, refresh, access_exp)."""
    access, access_exp = issue_token(user_id, "access")
    refresh, _ = issue_token(user_id, "refresh")
    return access, refresh, access_exp
