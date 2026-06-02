"""CRM-эндпоинты для company_manager.

Все эндпоинты работают в контексте `user.company_id`. Менеджер видит
только данные своей компании.
"""
from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..deps import require_company_manager
from ..models import (
    Company,
    CompanyService,
    Lead,
    LeadStatus,
    Service,
    User,
)
from ..schemas import (
    CompanyOut,
    CompanyServiceIn,
    CompanyUpdate,
    CrmAnalytics,
    CrmDayPoint,
    CrmFunnel,
    CrmStats,
    LeadOut,
    LeadStatusUpdate,
    OkResponse,
)
from .companies import _to_company_out
from .leads import _to_lead_out

router = APIRouter(prefix="/crm", tags=["crm"])


# ── Helpers ─────────────────────────────────────────────────────────────────

def _company(db: Session, manager: User) -> Company:
    company = db.get(Company, manager.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Компания не найдена")
    return company


# ── Лиды ───────────────────────────────────────────────────────────────────

@router.get("/leads", response_model=list[LeadOut])
def list_leads(
    status: LeadStatus | None = None,
    db: Session = Depends(get_db),
    manager: User = Depends(require_company_manager),
) -> list[LeadOut]:
    q = (
        select(Lead)
        .where(Lead.company_id == manager.company_id)
        .options(selectinload(Lead.company), selectinload(Lead.service))
        .order_by(Lead.created_at.desc())
    )
    if status is not None:
        q = q.where(Lead.status == status)
    return [_to_lead_out(l) for l in db.scalars(q)]


@router.patch("/leads/{lead_id}", response_model=LeadOut)
def update_lead_status(
    lead_id: int,
    payload: LeadStatusUpdate,
    db: Session = Depends(get_db),
    manager: User = Depends(require_company_manager),
) -> LeadOut:
    lead = db.get(Lead, lead_id)
    if not lead or lead.company_id != manager.company_id:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    lead.status = payload.status
    db.commit()
    db.refresh(lead)
    return _to_lead_out(lead)


# ── Stats ──────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=CrmStats)
def stats(
    db: Session = Depends(get_db),
    manager: User = Depends(require_company_manager),
) -> CrmStats:
    company = _company(db, manager)
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    all_leads = list(
        db.scalars(select(Lead).where(Lead.company_id == company.id))
    )
    by_status: Counter[LeadStatus] = Counter(l.status for l in all_leads)
    total = len(all_leads)
    done = by_status.get(LeadStatus.done, 0)
    conv = (done / total * 100) if total else 0.0

    return CrmStats(
        leadsTotal=total,
        leadsNew=by_status.get(LeadStatus.new, 0),
        leadsInProgress=by_status.get(LeadStatus.in_progress, 0),
        leadsDone=done,
        leadsRejected=by_status.get(LeadStatus.rejected, 0),
        leadsWeek=sum(1 for l in all_leads if l.created_at >= week_ago),
        leadsToday=sum(1 for l in all_leads if l.created_at >= today_start),
        rating=round(company.rating_avg, 2),
        reviewsCount=company.reviews_count,
        views=company.views,
        conversionRate=round(conv, 1),
    )


@router.get("/analytics", response_model=CrmAnalytics)
def analytics(
    days: int = 30,
    db: Session = Depends(get_db),
    manager: User = Depends(require_company_manager),
) -> CrmAnalytics:
    """Аналитика: timeseries по дням, funnel по статусам, по услугам."""
    if days < 1 or days > 365:
        days = 30
    company_id = manager.company_id
    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=days)).replace(hour=0, minute=0, second=0, microsecond=0)

    leads = list(
        db.scalars(
            select(Lead)
            .where(Lead.company_id == company_id, Lead.created_at >= start)
            .options(selectinload(Lead.service))
        )
    )

    # Timeseries — каждый день в диапазоне (включая нулевые).
    buckets: dict[str, int] = {}
    for i in range(days + 1):
        d = (start + timedelta(days=i)).date().isoformat()
        buckets[d] = 0
    for l in leads:
        key = l.created_at.date().isoformat()
        if key in buckets:
            buckets[key] += 1

    timeseries = [CrmDayPoint(date=d, leads=n) for d, n in buckets.items()]

    # Funnel
    by_status: Counter[LeadStatus] = Counter(l.status for l in leads)
    funnel = CrmFunnel(
        new=by_status.get(LeadStatus.new, 0),
        in_progress=by_status.get(LeadStatus.in_progress, 0),
        done=by_status.get(LeadStatus.done, 0),
        rejected=by_status.get(LeadStatus.rejected, 0),
    )

    # По услугам
    svc_counter: Counter[int] = Counter(l.service_id for l in leads)
    by_service = []
    if svc_counter:
        services = {
            s.id: s.name
            for s in db.scalars(select(Service).where(Service.id.in_(svc_counter)))
        }
        by_service = [
            {"serviceId": sid, "serviceName": services.get(sid, "—"), "leads": n}
            for sid, n in svc_counter.most_common()
        ]

    return CrmAnalytics(timeseries=timeseries, funnel=funnel, byService=by_service)


# ── Профиль компании ──────────────────────────────────────────────────────

@router.get("/profile", response_model=CompanyOut)
def get_profile(
    db: Session = Depends(get_db),
    manager: User = Depends(require_company_manager),
) -> CompanyOut:
    company = (
        db.execute(
            select(Company)
            .where(Company.id == manager.company_id)
            .options(
                selectinload(Company.company_services),
                selectinload(Company.reviews),
            )
        )
        .scalars()
        .first()
    )
    if not company:
        raise HTTPException(status_code=404, detail="Не найдено")
    services_map = {
        s.id: s.name
        for s in db.scalars(
            select(Service).where(
                Service.id.in_({cs.service_id for cs in company.company_services})
            )
        )
    } if company.company_services else {}
    return _to_company_out(company, services_map)


@router.put("/profile", response_model=CompanyOut)
def update_profile(
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
    manager: User = Depends(require_company_manager),
) -> CompanyOut:
    company = _company(db, manager)
    data = payload.model_dump(exclude_unset=True)
    if "gallery" in data:
        company.gallery_json = json.dumps(data.pop("gallery"))
    for field, value in data.items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return get_profile(db=db, manager=manager)  # type: ignore[arg-type]


# ── Услуги компании ──────────────────────────────────────────────────────

@router.post("/services", response_model=OkResponse, status_code=201)
def add_company_service(
    payload: CompanyServiceIn,
    db: Session = Depends(get_db),
    manager: User = Depends(require_company_manager),
) -> OkResponse:
    svc = db.get(Service, payload.serviceId)
    if not svc:
        raise HTTPException(status_code=400, detail="Услуга не найдена")
    exists = db.scalar(
        select(CompanyService).where(
            CompanyService.company_id == manager.company_id,
            CompanyService.service_id == svc.id,
        )
    )
    if exists:
        raise HTTPException(status_code=409, detail="Эта услуга уже добавлена")
    db.add(CompanyService(
        company_id=manager.company_id,
        service_id=svc.id,
        price=payload.price,
        discount=payload.discount,
        description=payload.description,
    ))
    db.commit()
    return OkResponse()


@router.put("/services/{cs_id}", response_model=OkResponse)
def update_company_service(
    cs_id: int,
    payload: CompanyServiceIn,
    db: Session = Depends(get_db),
    manager: User = Depends(require_company_manager),
) -> OkResponse:
    cs = db.get(CompanyService, cs_id)
    if not cs or cs.company_id != manager.company_id:
        raise HTTPException(status_code=404, detail="Не найдено")
    cs.price = payload.price
    cs.discount = payload.discount
    cs.description = payload.description
    db.commit()
    return OkResponse()


@router.delete("/services/{cs_id}", response_model=OkResponse)
def delete_company_service(
    cs_id: int,
    db: Session = Depends(get_db),
    manager: User = Depends(require_company_manager),
) -> OkResponse:
    cs = db.get(CompanyService, cs_id)
    if not cs or cs.company_id != manager.company_id:
        raise HTTPException(status_code=404, detail="Не найдено")
    db.delete(cs)
    db.commit()
    return OkResponse()
