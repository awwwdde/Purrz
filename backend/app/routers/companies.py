"""Публичный листинг и карточка компании."""
from __future__ import annotations

import json
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, asc, desc, func, or_, select
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..models import Company, CompanyService, Review, Service
from ..schemas import (
    CompaniesListResponse,
    CompanyContacts,
    CompanyOut,
    CompanyServiceOut,
    ReviewOut,
)

router = APIRouter(tags=["companies"])


SortKey = Literal["rating", "price", "discount", "reviews", "newest"]


def _to_company_out(
    company: Company, services_map: dict[int, str]
) -> CompanyOut:
    """Сериализуем компанию с подгруженными услугами и отзывами."""
    services = [
        CompanyServiceOut(
            serviceId=cs.service_id,
            serviceName=services_map.get(cs.service_id),
            price=cs.price,
            discount=cs.discount,
            description=cs.description,
        )
        for cs in company.company_services
    ]
    gallery: list[str] = []
    try:
        gallery = json.loads(company.gallery_json or "[]")
    except (ValueError, TypeError):
        gallery = []

    return CompanyOut(
        id=company.id,
        name=company.name,
        inn=company.inn,
        description=company.description,
        logo=company.logo,
        banner=company.banner,
        address=company.address,
        contacts=CompanyContacts(
            phone=company.contact_phone,
            email=company.contact_email,
            site=company.contact_site,
        ),
        discount=company.discount,
        yearsOnMarket=company.years_on_market,
        views=company.views,
        rating=round(company.rating_avg, 2),
        reviewsCount=company.reviews_count,
        tariff=company.tariff,
        verified=company.verified,
        services=services,
        gallery=gallery,
        reviews=[ReviewOut.model_validate(r) for r in company.reviews],
    )


@router.get("/companies", response_model=CompaniesListResponse)
def list_companies(
    db: Session = Depends(get_db),
    category_id: int | None = None,
    service_id: int | None = None,
    min_rating: float | None = None,
    has_discount: bool | None = None,
    search: str | None = None,
    sort: SortKey = "rating",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> CompaniesListResponse:
    # Базовый запрос: только активные компании.
    base = select(Company).where(Company.is_active.is_(True))

    if category_id is not None:
        # Подзапрос — id услуг в этой категории.
        svc_ids = select(Service.id).where(Service.category_id == category_id)
        base = base.where(
            Company.id.in_(
                select(CompanyService.company_id).where(CompanyService.service_id.in_(svc_ids))
            )
        )

    if service_id is not None:
        base = base.where(
            Company.id.in_(
                select(CompanyService.company_id).where(CompanyService.service_id == service_id)
            )
        )

    if min_rating is not None:
        base = base.where(Company.rating_avg >= min_rating)

    if has_discount:
        base = base.where(Company.discount > 0)

    if search:
        like = f"%{search.lower()}%"
        base = base.where(or_(
            func.lower(Company.name).like(like),
            func.lower(Company.description).like(like),
        ))

    # Сортировка
    if sort == "price":
        # Минимальная цена среди услуг компании
        min_price_sq = (
            select(CompanyService.company_id, func.min(CompanyService.price).label("mp"))
            .group_by(CompanyService.company_id)
            .subquery()
        )
        base = base.join(min_price_sq, min_price_sq.c.company_id == Company.id, isouter=True)
        base = base.order_by(asc(min_price_sq.c.mp).nullslast(), desc(Company.rating_avg))
    elif sort == "discount":
        base = base.order_by(desc(Company.discount), desc(Company.rating_avg))
    elif sort == "reviews":
        base = base.order_by(desc(Company.reviews_count), desc(Company.rating_avg))
    elif sort == "newest":
        base = base.order_by(desc(Company.created_at))
    else:  # rating
        base = base.order_by(desc(Company.rating_avg), desc(Company.reviews_count))

    # Total
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0

    # Пагинация + жадно подтягиваем связанные сущности.
    rows = list(
        db.scalars(
            base.options(
                selectinload(Company.company_services),
                selectinload(Company.reviews),
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    )

    # Имена услуг разом одним запросом.
    needed = {cs.service_id for c in rows for cs in c.company_services}
    services_map: dict[int, str] = {}
    if needed:
        services_map = {
            s.id: s.name for s in db.scalars(select(Service).where(Service.id.in_(needed)))
        }

    return CompaniesListResponse(
        items=[_to_company_out(c, services_map) for c in rows],
        total=int(total),
        page=page,
        pageSize=page_size,
    )


@router.get("/companies/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)) -> CompanyOut:
    company = (
        db.execute(
            select(Company)
            .where(Company.id == company_id, Company.is_active.is_(True))
            .options(
                selectinload(Company.company_services),
                selectinload(Company.reviews),
            )
        )
        .scalars()
        .first()
    )
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Инкрементируем счётчик просмотров (in-place, без транзакционных гарантий
    # — для demo достаточно).
    company.views += 1
    db.commit()

    services_map = {
        s.id: s.name
        for s in db.scalars(
            select(Service).where(
                Service.id.in_({cs.service_id for cs in company.company_services})
            )
        )
    } if company.company_services else {}

    return _to_company_out(company, services_map)
