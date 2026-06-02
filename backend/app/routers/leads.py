"""Заявки (Leads) — публичные и пользовательские эндпоинты."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user_optional
from ..models import Company, Lead, Service, User
from ..schemas import LeadCreate, LeadOut

router = APIRouter(tags=["leads"])


def _to_lead_out(lead: Lead) -> LeadOut:
    return LeadOut(
        id=lead.id,
        company_id=lead.company_id,
        companyName=lead.company.name if lead.company else None,
        service_id=lead.service_id,
        serviceName=lead.service.name if lead.service else None,
        user_id=lead.user_id,
        user_name=lead.user_name,
        user_contact=lead.user_contact,
        comment=lead.comment,
        status=lead.status,
        created_at=lead.created_at,
    )


@router.post("/leads", response_model=LeadOut, status_code=201)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
) -> LeadOut:
    company = db.get(Company, payload.companyId)
    if not company or not company.is_active:
        raise HTTPException(status_code=400, detail="Компания не найдена")
    service = db.get(Service, payload.serviceId)
    if not service:
        raise HTTPException(status_code=400, detail="Услуга не найдена")

    lead = Lead(
        company_id=company.id,
        service_id=service.id,
        user_id=user.id if user else None,
        user_name=payload.userName.strip(),
        user_contact=payload.userContact,
        comment=payload.comment,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return _to_lead_out(lead)
