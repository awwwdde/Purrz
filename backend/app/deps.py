"""FastAPI-зависимости общего назначения."""
from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from .db import get_db
from .models import User, UserRole
from .security import decode_token


def get_current_user_optional(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> User | None:
    """Возвращает текущего юзера если есть валидный токен, иначе None.

    Удобно для эндпоинтов где гость допустим (POST /leads).
    """
    if not authorization.startswith("Bearer "):
        return None
    token = authorization[len("Bearer ") :].strip()
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    try:
        uid = int(payload["sub"])
    except (KeyError, ValueError):
        return None
    user = db.get(User, uid)
    if not user or not user.is_active:
        return None
    return user


def get_current_user(
    user: User | None = Depends(get_current_user_optional),
) -> User:
    """Требует валидного access-токена. 401 если нет."""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_role(*roles: UserRole):
    """Factory зависимости — пускает только если роль в списке."""

    def _checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Доступ запрещён")
        return user

    return _checker


def require_company_manager(user: User = Depends(get_current_user)) -> User:
    """Должен быть менеджером с привязанной компанией."""
    if user.role not in (UserRole.company_manager, UserRole.admin):
        raise HTTPException(status_code=403, detail="Только для менеджеров компании")
    if user.role == UserRole.company_manager and not user.company_id:
        raise HTTPException(status_code=403, detail="У пользователя нет привязанной компании")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Только для админов")
    return user
