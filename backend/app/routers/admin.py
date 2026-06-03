"""Админ-эндпоинты Purrz — для модераторов.

Категории/услуги CRUD, верификация компаний, бан-флаги, удаление отзывов.
Доступ: require_admin (роль == admin).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_admin
from ..models import Category, Company, Review, Service, User
from ..schemas import (
    AdminBanToggle,
    AdminVerifyToggle,
    CategoryIn,
    CategoryOut,
    OkResponse,
    ServiceIn,
    ServiceOut,
    UserOut,
)
from .reviews import _recompute_company_rating

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


# ── Категории CRUD ──────────────────────────────────────────────────────────

@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryIn, db: Session = Depends(get_db)) -> Category:
    if db.scalar(select(Category).where(Category.slug == payload.slug)):
        raise HTTPException(status_code=409, detail="Slug уже занят")
    cat = Category(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/categories/{cat_id}", response_model=CategoryOut)
def update_category(
    cat_id: int, payload: CategoryIn, db: Session = Depends(get_db)
) -> Category:
    cat = db.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Не найдено")
    for field, value in payload.model_dump().items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{cat_id}", response_model=OkResponse)
def delete_category(cat_id: int, db: Session = Depends(get_db)) -> OkResponse:
    cat = db.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Не найдено")
    db.delete(cat)
    db.commit()
    return OkResponse()


# ── Услуги CRUD ────────────────────────────────────────────────────────────

@router.post("/services", response_model=ServiceOut, status_code=201)
def create_service(payload: ServiceIn, db: Session = Depends(get_db)) -> Service:
    if db.scalar(select(Service).where(Service.slug == payload.slug)):
        raise HTTPException(status_code=409, detail="Slug уже занят")
    if not db.get(Category, payload.categoryId):
        raise HTTPException(status_code=400, detail="Категория не найдена")
    svc = Service(
        slug=payload.slug,
        name=payload.name,
        description=payload.description,
        category_id=payload.categoryId,
        min_price=payload.minPrice,
        max_price=payload.maxPrice,
    )
    db.add(svc)
    db.commit()
    db.refresh(svc)
    return svc


@router.put("/services/{svc_id}", response_model=ServiceOut)
def update_service(svc_id: int, payload: ServiceIn, db: Session = Depends(get_db)) -> Service:
    svc = db.get(Service, svc_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Не найдено")
    svc.slug = payload.slug
    svc.name = payload.name
    svc.description = payload.description
    svc.category_id = payload.categoryId
    svc.min_price = payload.minPrice
    svc.max_price = payload.maxPrice
    db.commit()
    db.refresh(svc)
    return svc


@router.delete("/services/{svc_id}", response_model=OkResponse)
def delete_service(svc_id: int, db: Session = Depends(get_db)) -> OkResponse:
    svc = db.get(Service, svc_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Не найдено")
    db.delete(svc)
    db.commit()
    return OkResponse()


# ── Модерация компаний ────────────────────────────────────────────────────

@router.patch("/companies/{company_id}/verify", response_model=OkResponse)
def toggle_verify(
    company_id: int,
    payload: AdminVerifyToggle,
    db: Session = Depends(get_db),
) -> OkResponse:
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Компания не найдена")
    company.verified = payload.verified
    db.commit()
    return OkResponse(detail="verified" if payload.verified else "unverified")


@router.patch("/companies/{company_id}/ban", response_model=OkResponse)
def toggle_company_ban(
    company_id: int,
    payload: AdminBanToggle,
    db: Session = Depends(get_db),
) -> OkResponse:
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Компания не найдена")
    company.is_active = payload.is_active
    db.commit()
    return OkResponse(detail="active" if payload.is_active else "banned")


@router.delete("/companies/{company_id}", response_model=OkResponse)
def delete_company(company_id: int, db: Session = Depends(get_db)) -> OkResponse:
    """Полностью снести компанию. Каскадно удалит её услуги, отзывы и лиды
    (см. cascade='all, delete-orphan' в models). У всех привязанных
    менеджеров обнулит company_id (FK ondelete=SET NULL) — следующий /me
    self-heal приведёт их в роль user."""
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Компания не найдена")
    db.delete(company)
    db.commit()
    return OkResponse()


# ── Модерация отзывов ──────────────────────────────────────────────────────

@router.delete("/reviews/{review_id}", response_model=OkResponse)
def delete_review(review_id: int, db: Session = Depends(get_db)) -> OkResponse:
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Не найдено")
    company_id = review.company_id
    db.delete(review)
    db.flush()
    _recompute_company_rating(db, company_id)
    db.commit()
    return OkResponse()


# ── Пользователи ───────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc()).limit(500)))


@router.patch("/users/{user_id}/ban", response_model=OkResponse)
def toggle_user_ban(
    user_id: int,
    payload: AdminBanToggle,
    db: Session = Depends(get_db),
) -> OkResponse:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Не найден")
    user.is_active = payload.is_active
    db.commit()
    return OkResponse()
