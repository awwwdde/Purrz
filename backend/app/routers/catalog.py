"""Категории и услуги — публичные эндпоинты."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Category, Service
from ..schemas import CategoryOut, ServiceOut

router = APIRouter(tags=["catalog"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.sort_order, Category.id)))


@router.get("/services", response_model=list[ServiceOut])
def list_services(
    category_id: int | None = None,
    db: Session = Depends(get_db),
) -> list[Service]:
    q = select(Service).order_by(Service.id)
    if category_id is not None:
        q = q.where(Service.category_id == category_id)
    return list(db.scalars(q))


@router.get("/services/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)) -> Service:
    svc = db.get(Service, service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    return svc
