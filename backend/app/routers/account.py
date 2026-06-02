"""Личный кабинет пользователя."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..deps import get_current_user
from ..models import Lead, User
from ..schemas import LeadOut, UserOut
from .leads import _to_lead_out

router = APIRouter(prefix="/account", tags=["account"])


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.get("/leads", response_model=list[LeadOut])
def my_leads(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[LeadOut]:
    leads = list(db.scalars(
        select(Lead)
        .where(Lead.user_id == user.id)
        .options(selectinload(Lead.company), selectinload(Lead.service))
        .order_by(Lead.created_at.desc())
    ))
    return [_to_lead_out(l) for l in leads]
