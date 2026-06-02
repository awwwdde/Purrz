"""Pydantic-схемы Purrz.

Названия полей в схемах для фронта сохраняем как в исходном TypeScript:
camelCase. Это позволяет фронту не переписывать ничего — те же сигнатуры
что в mockApi.
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from .models import CompanyTariff, LeadStatus, UserRole


# ── Auth ───────────────────────────────────────────────────────────────────

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: str | None = None


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    email: str
    name: str
    phone: str | None
    avatar: str | None
    role: UserRole
    companyId: int | None = Field(alias="company_id")
    createdAt: datetime = Field(alias="created_at")


# ── Каталог ────────────────────────────────────────────────────────────────

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    slug: str
    name: str
    icon: str
    description: str


class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    slug: str
    name: str
    description: str
    categoryId: int = Field(alias="category_id")
    minPrice: int = Field(alias="min_price")
    maxPrice: int = Field(alias="max_price")


class ServiceIn(BaseModel):
    slug: str
    name: str = Field(..., min_length=1, max_length=160)
    description: str = ""
    categoryId: int
    minPrice: int = 0
    maxPrice: int = 0


class CategoryIn(BaseModel):
    slug: str
    name: str = Field(..., min_length=1, max_length=120)
    icon: str = "tag"
    description: str = ""
    sort_order: int = 0


# ── Компании ───────────────────────────────────────────────────────────────

class CompanyContacts(BaseModel):
    phone: str | None = None
    email: str | None = None
    site: str | None = None


class CompanyServiceOut(BaseModel):
    serviceId: int
    serviceName: str | None = None  # дублируем для удобства фронта
    price: int
    discount: int | None = None
    description: str | None = None


class CompanyOut(BaseModel):
    """Полная карточка компании. Для листинга используем тот же объект —
    галерея/отзывы могут быть пустыми, фронт сам выберет что показывать."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    name: str
    inn: str
    description: str
    logo: str | None
    banner: str | None
    address: str
    contacts: CompanyContacts
    discount: int
    yearsOnMarket: int = Field(alias="years_on_market")
    views: int
    rating: float = Field(alias="rating_avg")
    reviewsCount: int = Field(alias="reviews_count")
    tariff: CompanyTariff
    verified: bool
    services: list[CompanyServiceOut] = []
    gallery: list[str] = []
    reviews: list["ReviewOut"] = []


class CompanyCreate(BaseModel):
    """Создание новой компании (через /api/auth/register-company)."""

    name: str = Field(..., min_length=1, max_length=200)
    inn: str = Field(..., pattern=r"^\d{10}(\d{2})?$")
    description: str = ""
    logo: str | None = None
    banner: str | None = None
    address: str = ""
    contact_phone: str | None = None
    contact_email: str | None = None
    contact_site: str | None = None
    services: list["CompanyServiceIn"] = []


class CompanyServiceIn(BaseModel):
    serviceId: int
    price: int = Field(..., ge=0)
    discount: int | None = Field(default=None, ge=0, le=100)
    description: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    logo: str | None = None
    banner: str | None = None
    address: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    contact_site: str | None = None
    discount: int | None = None
    gallery: list[str] | None = None


# ── Отзывы ─────────────────────────────────────────────────────────────────

class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    author: str = Field(alias="author_name")
    rating: int
    text: str
    date: datetime = Field(alias="created_at")


class ReviewCreate(BaseModel):
    companyId: int
    rating: int = Field(..., ge=1, le=5)
    text: str = Field(..., min_length=1, max_length=2000)


# ── Лиды ───────────────────────────────────────────────────────────────────

class LeadCreate(BaseModel):
    companyId: int
    serviceId: int
    userName: str = Field(..., min_length=1, max_length=120)
    userContact: str = Field(..., min_length=3, max_length=254)
    comment: str = ""

    @field_validator("userContact")
    @classmethod
    def _normalize_contact(cls, v: str) -> str:
        return v.strip()


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    companyId: int = Field(alias="company_id")
    companyName: str | None = None
    serviceId: int = Field(alias="service_id")
    serviceName: str | None = None
    userId: int | None = Field(alias="user_id", default=None)
    userName: str = Field(alias="user_name")
    userContact: str = Field(alias="user_contact")
    comment: str
    status: LeadStatus
    date: datetime = Field(alias="created_at")


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


# ── ИНН lookup ─────────────────────────────────────────────────────────────

class InnLookupResponse(BaseModel):
    name: str
    inn: str
    address: str
    ogrn: str
    director: str
    registeredAt: str


# ── CRM ────────────────────────────────────────────────────────────────────

class CrmStats(BaseModel):
    leadsTotal: int
    leadsNew: int
    leadsInProgress: int
    leadsDone: int
    leadsRejected: int
    leadsWeek: int
    leadsToday: int
    rating: float
    reviewsCount: int
    views: int
    conversionRate: float  # done / total * 100


class CrmDayPoint(BaseModel):
    date: str   # YYYY-MM-DD
    leads: int


class CrmFunnel(BaseModel):
    new: int
    in_progress: int
    done: int
    rejected: int


class CrmAnalytics(BaseModel):
    timeseries: list[CrmDayPoint]
    funnel: CrmFunnel
    byService: list[dict]  # [{serviceId, serviceName, leads}]


# ── Уведомления / Admin ────────────────────────────────────────────────────

class AdminVerifyToggle(BaseModel):
    verified: bool


class AdminBanToggle(BaseModel):
    is_active: bool


# Сообщение в ответ на любые action'ы
class OkResponse(BaseModel):
    ok: bool = True
    detail: str | None = None


# Listing / pagination
class CompaniesListResponse(BaseModel):
    items: list[CompanyOut]
    total: int
    page: int
    pageSize: int


# Forward refs resolve
CompanyOut.model_rebuild()
CompanyCreate.model_rebuild()
