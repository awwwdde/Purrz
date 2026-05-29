"""
Purrz backend — DEMO skeleton.

Цель текущей итерации: чтобы `pnpm run dev` поднимал и фронт, и бэк.
Базовые эндпоинты возвращают мок-данные, чтобы фронт мог постепенно
переключаться с встроенного mockApi на реальный API без поломок.

Следующая итерация: SQLAlchemy + SQLite, JWT-аутентификация, миграции,
полноценные CRUD-операции.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Purrz API",
    description="DEMO backend for service aggregator",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Schemas ----------

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str


class Category(BaseModel):
    id: str
    name: str
    slug: str
    icon: str
    description: str


class Service(BaseModel):
    id: str
    name: str
    categoryId: str
    description: str
    minPrice: int
    maxPrice: int


class CompanyService(BaseModel):
    serviceId: str
    price: int
    discount: Optional[int] = None


class CompanyContacts(BaseModel):
    phone: str
    email: str
    site: Optional[str] = None


class Company(BaseModel):
    id: str
    name: str
    inn: str
    description: str
    logo: str
    rating: float
    reviewsCount: int
    discount: int
    address: str
    contacts: CompanyContacts
    services: list[CompanyService]
    verified: bool


class LeadCreate(BaseModel):
    companyId: str
    serviceId: str
    userName: str = Field(..., min_length=1)
    userContact: str = Field(..., min_length=1)
    comment: str = ""


class Lead(LeadCreate):
    id: str
    status: str
    date: str


class InnLookupResponse(BaseModel):
    name: str
    inn: str
    address: str
    ogrn: str
    director: str
    registeredAt: str


# ---------- Seed data (минимальное зеркало того, что во фронте) ----------

CATEGORIES: list[Category] = [
    Category(id="cat-hvac", name="Кондиционеры и климат", slug="hvac", icon="snowflake",
             description="Установка и обслуживание сплит-систем"),
    Category(id="cat-renovation", name="Ремонт квартир", slug="renovation", icon="hammer",
             description="Ремонт под ключ"),
    Category(id="cat-cleaning", name="Клининг", slug="cleaning", icon="sparkles",
             description="Уборка любой сложности"),
    Category(id="cat-electric", name="Электрика", slug="electric", icon="zap",
             description="Электромонтаж"),
    Category(id="cat-plumbing", name="Сантехника", slug="plumbing", icon="droplet",
             description="Сантехнические работы"),
    Category(id="cat-construction", name="Строительство", slug="construction", icon="building",
             description="Строительство домов"),
]

SERVICES: list[Service] = [
    Service(id="svc-split-install", name="Установка сплит-системы", categoryId="cat-hvac",
            description="Полный монтаж", minPrice=6000, maxPrice=18000),
    Service(id="svc-renov-capital", name="Капитальный ремонт", categoryId="cat-renovation",
            description="Под ключ", minPrice=12000, maxPrice=45000),
    Service(id="svc-clean-flat", name="Уборка квартиры", categoryId="cat-cleaning",
            description="Генеральная уборка", minPrice=2000, maxPrice=8000),
]

COMPANIES: list[Company] = [
    Company(
        id="co-arctica",
        name="Арктика-Сервис",
        inn="7701234567",
        description="Монтаж и обслуживание сплит-систем с 2009 года.",
        logo="https://api.dicebear.com/9.x/initials/svg?seed=Arctica&backgroundColor=0A0A0B&textColor=D6FF3D",
        rating=4.9,
        reviewsCount=234,
        discount=15,
        address="Москва, ул. Электрозаводская, 27",
        contacts=CompanyContacts(
            phone="+7 (495) 123-45-67",
            email="info@arctica-service.demo",
            site="arctica-service.demo",
        ),
        services=[CompanyService(serviceId="svc-split-install", price=8500, discount=15)],
        verified=True,
    ),
]

LEADS: list[Lead] = []


# ---------- Routes ----------

@app.get("/", tags=["root"])
def root():
    return {"name": "Purrz API", "docs": "/docs", "version": "0.1.0"}


@app.get("/health", response_model=HealthResponse, tags=["root"])
def health():
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(timezone.utc).isoformat(),
        version="0.1.0",
    )


@app.get("/categories", response_model=list[Category], tags=["services"])
def list_categories():
    return CATEGORIES


@app.get("/services", response_model=list[Service], tags=["services"])
def list_services(category_id: Optional[str] = None):
    if category_id:
        return [s for s in SERVICES if s.categoryId == category_id]
    return SERVICES


@app.get("/services/{service_id}", response_model=Service, tags=["services"])
def get_service(service_id: str):
    for s in SERVICES:
        if s.id == service_id:
            return s
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Service not found")


@app.get("/companies", response_model=list[Company], tags=["companies"])
def list_companies():
    return COMPANIES


@app.get("/companies/{company_id}", response_model=Company, tags=["companies"])
def get_company(company_id: str):
    for c in COMPANIES:
        if c.id == company_id:
            return c
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Company not found")


@app.post("/leads", response_model=Lead, status_code=201, tags=["leads"])
def create_lead(payload: LeadCreate):
    if not any(c.id == payload.companyId for c in COMPANIES):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown companyId")
    if not any(s.id == payload.serviceId for s in SERVICES):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown serviceId")
    lead = Lead(
        id=f"l-{uuid4().hex[:8]}",
        status="new",
        date=datetime.now(timezone.utc).isoformat(),
        **payload.model_dump(),
    )
    LEADS.append(lead)
    return lead


@app.get("/companies/{company_id}/leads", response_model=list[Lead], tags=["leads"])
def list_company_leads(company_id: str):
    return [l for l in LEADS if l.companyId == company_id]


@app.get("/inn/{inn}", response_model=InnLookupResponse, tags=["misc"])
def lookup_inn(inn: str):
    cleaned = "".join(ch for ch in inn if ch.isdigit())
    if len(cleaned) < 10:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "ИНН должен содержать 10 или 12 цифр")
    seed = int(cleaned[-4:]) or 1
    names = [
        "ООО «Стройинвест»",
        "ООО «Технологии комфорта»",
        "ООО «АльфаСервис»",
        "ООО «Прогресс-М»",
    ]
    return InnLookupResponse(
        name=names[seed % len(names)],
        inn=cleaned,
        address=f"Москва, пр-т Мира, д. {(seed % 200) + 1}",
        ogrn=f"1{cleaned}{seed % 1000:03d}",
        director="Иванов И.И.",
        registeredAt=datetime.now(timezone.utc).isoformat(),
    )
