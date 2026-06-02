"""SQLAlchemy-модели Purrz.

Сущности:
  - User             — пользователь (роли: user / company_manager / admin)
  - Category         — категория услуг (Кондиционеры, Ремонт и пр.)
  - Service          — услуга внутри категории (Установка сплит-системы)
  - Company          — компания
  - CompanyService   — конкретная услуга от конкретной компании (с ценой)
  - Review           — отзыв на компанию
  - Lead             — заявка пользователя в компанию по конкретной услуге
  - InnCacheRow      — кэш ИНН-mock-lookup'а

Связи:
  - User N:1 Company  (несколько менеджеров на одну компанию)
  - CompanyService N:1 Company, N:1 Service
  - Review N:1 Company, N:1 User
  - Lead N:1 Company, N:1 Service, N:0..1 User (гостевые лиды без user_id)
"""
from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


# ── Enum'ы ──────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    user = "user"
    company_manager = "company_manager"
    admin = "admin"


class LeadStatus(str, enum.Enum):
    new = "new"
    in_progress = "in_progress"
    done = "done"
    rejected = "rejected"


class CompanyTariff(str, enum.Enum):
    free = "free"
    premium = "premium"


# ── User ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255))
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), default=UserRole.user, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Сколько у нас многих менеджеров на компанию — FK на companies. Может быть NULL.
    company_id: Mapped[int | None] = mapped_column(
        ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True
    )
    company: Mapped["Company | None"] = relationship(back_populates="managers", foreign_keys=[company_id])

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    leads: Mapped[list["Lead"]] = relationship(back_populates="user")
    reviews: Mapped[list["Review"]] = relationship(back_populates="user")


# ── Каталог ────────────────────────────────────────────────────────────────

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    icon: Mapped[str] = mapped_column(String(40), default="tag")
    description: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    services: Mapped[list["Service"]] = relationship(back_populates="category", cascade="all, delete-orphan")


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text, default="")
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"), index=True
    )
    min_price: Mapped[int] = mapped_column(Integer, default=0)
    max_price: Mapped[int] = mapped_column(Integer, default=0)

    category: Mapped[Category] = relationship(back_populates="services")
    company_offers: Mapped[list["CompanyService"]] = relationship(
        back_populates="service", cascade="all, delete-orphan"
    )


# ── Компании ────────────────────────────────────────────────────────────────

class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str | None] = mapped_column(String(80), unique=True, index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(200))
    inn: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    logo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    banner: Mapped[str | None] = mapped_column(String(500), nullable=True)
    address: Mapped[str] = mapped_column(String(300), default="")

    # Контакты (плоский набор — гибкости JSONB здесь не нужно).
    contact_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(254), nullable=True)
    contact_site: Mapped[str | None] = mapped_column(String(254), nullable=True)

    # Витринные поля.
    discount: Mapped[int] = mapped_column(Integer, default=0)  # %
    years_on_market: Mapped[int] = mapped_column(Integer, default=0)
    views: Mapped[int] = mapped_column(Integer, default=0)

    # Кэш для быстрой выдачи в листинге (пересчитываем при изменении отзывов).
    rating_avg: Mapped[float] = mapped_column(Float, default=0.0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)

    # Галерея — массив URL'ов. JSON-строка для SQLite-совместимости; в Postgres
    # тоже хранится текстом, читаем/пишем json.loads/dumps на уровне роутера.
    gallery_json: Mapped[str] = mapped_column(Text, default="[]")

    tariff: Mapped[CompanyTariff] = mapped_column(
        Enum(CompanyTariff, name="company_tariff"), default=CompanyTariff.free, nullable=False
    )
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)  # ban-флаг

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    managers: Mapped[list[User]] = relationship(back_populates="company", foreign_keys="User.company_id")
    company_services: Mapped[list["CompanyService"]] = relationship(
        back_populates="company", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="company", cascade="all, delete-orphan"
    )
    leads: Mapped[list["Lead"]] = relationship(back_populates="company", cascade="all, delete-orphan")


class CompanyService(Base):
    """Услуга, которую оказывает конкретная компания, со своей ценой."""

    __tablename__ = "company_services"
    __table_args__ = (UniqueConstraint("company_id", "service_id", name="uq_company_service"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), index=True
    )
    price: Mapped[int] = mapped_column(Integer)
    discount: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    company: Mapped[Company] = relationship(back_populates="company_services")
    service: Mapped[Service] = relationship(back_populates="company_offers")


# ── Отзывы ──────────────────────────────────────────────────────────────────

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    # Снимок имени автора на момент создания (если user удалится, история останется).
    author_name: Mapped[str] = mapped_column(String(120))
    rating: Mapped[int] = mapped_column(Integer)  # 1..5
    text: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    company: Mapped[Company] = relationship(back_populates="reviews")
    user: Mapped[User | None] = relationship(back_populates="reviews")


# ── Лиды ───────────────────────────────────────────────────────────────────

class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Контакт от гостя или снимок данных в момент создания.
    user_name: Mapped[str] = mapped_column(String(120))
    user_contact: Mapped[str] = mapped_column(String(254), index=True)
    comment: Mapped[str] = mapped_column(Text, default="")

    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, name="lead_status"), default=LeadStatus.new, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    company: Mapped[Company] = relationship(back_populates="leads")
    service: Mapped[Service] = relationship()
    user: Mapped[User | None] = relationship(back_populates="leads")


# ── ИНН-cache ───────────────────────────────────────────────────────────────

class InnCacheRow(Base):
    """Кэш на сгенерированный mock-ответ /inn/{value}.

    Чтобы один и тот же ИНН возвращал одни и те же «данные» между перезапусками
    и для разных пользователей.
    """

    __tablename__ = "inn_cache"

    inn: Mapped[str] = mapped_column(String(20), primary_key=True)
    payload_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
