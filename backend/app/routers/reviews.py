"""Отзывы на компании. Оставлять можно только если у тебя есть lead со
статусом 'done' на эту компанию.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user
from ..models import Company, Lead, LeadStatus, Review, User
from ..schemas import ReviewCreate, ReviewOut

router = APIRouter(tags=["reviews"])


def _recompute_company_rating(db: Session, company_id: int) -> None:
    """Пересчитать кэш rating_avg/reviews_count после изменения отзывов."""
    avg = db.scalar(
        select(func.avg(Review.rating)).where(Review.company_id == company_id)
    )
    cnt = db.scalar(
        select(func.count(Review.id)).where(Review.company_id == company_id)
    ) or 0
    company = db.get(Company, company_id)
    if company:
        company.rating_avg = float(avg or 0.0)
        company.reviews_count = int(cnt)


@router.post("/reviews", response_model=ReviewOut, status_code=201)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Review:
    company = db.get(Company, payload.companyId)
    if not company or not company.is_active:
        raise HTTPException(status_code=400, detail="Компания не найдена")

    # Должен быть хотя бы один свой lead со статусом done на эту компанию.
    has_done_lead = db.scalar(
        select(Lead.id).where(
            Lead.user_id == user.id,
            Lead.company_id == company.id,
            Lead.status == LeadStatus.done,
        )
    )
    if not has_done_lead:
        raise HTTPException(
            status_code=403,
            detail="Отзыв можно оставить только после выполненной заявки в этой компании",
        )

    review = Review(
        company_id=company.id,
        user_id=user.id,
        author_name=user.name or user.email,
        rating=payload.rating,
        text=payload.text.strip(),
    )
    db.add(review)
    db.flush()
    _recompute_company_rating(db, company.id)
    db.commit()
    db.refresh(review)
    return review
