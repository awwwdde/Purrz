"""Auth-эндпоинты Purrz.

POST /auth/register           — регистрация обычного user'а
POST /auth/login              — выдать access+refresh
POST /auth/refresh            — обменять refresh → новый access+refresh
GET  /auth/me                 — текущий пользователь
POST /auth/register-company   — авторизованный user становится company_manager
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user
from ..models import Company, CompanyService, CompanyTariff, Lead, Service, User, UserRole
from ..schemas import (
    CompanyCreate,
    CompanyOut,
    LoginRequest,
    OkResponse,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
    UserOut,
)
from ..security import decode_token, hash_password, issue_pair, issue_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _emit_token_pair(user_id: int) -> TokenPair:
    access, refresh, access_exp = issue_pair(user_id)
    return TokenPair(access_token=access, refresh_token=refresh, expires_at=access_exp)


def _self_heal_user(db: Session, user: User) -> User:
    """Если у юзера в company_id стоит ссылка на несуществующую/забаненную
    компанию, обнуляем — иначе UI показывает «Кабинет компании», а пуск в CRM
    падает. Возвращает того же user-а (теперь с актуальными полями)."""
    if user.company_id:
        c = db.get(Company, user.company_id)
        if not c or not c.is_active:
            user.company_id = None
            if user.role == UserRole.company_manager:
                user.role = UserRole.user
            db.commit()
    return user


def _attach_guest_leads(db: Session, user: User) -> int:
    """Связать гостевые лиды с этим юзером по email/phone.

    Зовётся после регистрации. Возвращает сколько лидов подцепили.
    """
    contacts = [c for c in (user.email, user.phone) if c]
    if not contacts:
        return 0
    leads = list(db.scalars(
        select(Lead).where(Lead.user_id.is_(None), Lead.user_contact.in_(contacts))
    ))
    for lead in leads:
        lead.user_id = user.id
    if leads:
        db.commit()
    return len(leads)


@router.post("/register", response_model=TokenPair, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenPair:
    email = payload.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="Email уже зарегистрирован")
    user = User(
        email=email,
        phone=(payload.phone or None),
        name=payload.name.strip(),
        password_hash=hash_password(payload.password),
        role=UserRole.user,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _attach_guest_leads(db, user)
    return _emit_token_pair(user.id)


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenPair:
    email = payload.email.strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    _self_heal_user(db, user)
    return _emit_token_pair(user.id)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenPair:
    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Невалидный refresh-токен")
    try:
        uid = int(data["sub"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Битый payload")
    user = db.get(User, uid)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Пользователь отключён")
    _self_heal_user(db, user)
    return _emit_token_pair(user.id)


@router.get("/me", response_model=UserOut)
def me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    return _self_heal_user(db, user)


@router.post("/register-company", response_model=CompanyOut, status_code=201)
def register_company(
    payload: CompanyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CompanyOut:
    # Защитная пара проверок: если у юзера уже есть company — отправим обратно
    # эту же компанию (вместо ошибки), чтобы фронт мог продолжить флоу.
    if user.company_id:
        existing = db.get(Company, user.company_id)
        if existing:
            return _serialize_company(db, existing)
        # компания исчезла — обнуляем у юзера, продолжаем регистрацию
        user.company_id = None
        db.commit()

    dup = db.scalar(select(Company).where(Company.inn == payload.inn))
    if dup:
        raise HTTPException(status_code=409, detail="Компания с этим ИНН уже зарегистрирована")

    company = Company(
        name=payload.name,
        inn=payload.inn,
        description=payload.description,
        logo=payload.logo,
        banner=payload.banner,
        address=payload.address,
        contact_phone=payload.contact_phone,
        contact_email=payload.contact_email,
        contact_site=payload.contact_site,
        tariff=CompanyTariff.free,
        verified=False,
    )
    db.add(company)
    db.flush()  # получить company.id для FK ниже

    # Услуги
    for s in payload.services:
        svc = db.get(Service, s.serviceId)
        if not svc:
            raise HTTPException(status_code=400, detail=f"Услуга {s.serviceId} не найдена")
        db.add(CompanyService(
            company_id=company.id, service_id=svc.id,
            price=s.price, discount=s.discount, description=s.description,
        ))

    # Связываем user → company и повышаем роль
    user.company_id = company.id
    user.role = UserRole.company_manager

    db.commit()
    db.refresh(company)
    # Возвращаем уже сериализованный CompanyOut — иначе pydantic пытается
    # читать у SQLAlchemy-объекта поле `contacts` (его нет, есть только
    # contact_phone/email/site) и валит 500.
    return _serialize_company(db, company)


def _serialize_company(db: Session, company: Company) -> CompanyOut:
    """То же что companies._to_company_out, но локально — без циклов импорта."""
    from ..routers.companies import _to_company_out

    services_map: dict[int, str] = {}
    if company.company_services:
        services_map = {
            s.id: s.name
            for s in db.scalars(
                select(Service).where(
                    Service.id.in_({cs.service_id for cs in company.company_services})
                )
            )
        }
    return _to_company_out(company, services_map)
