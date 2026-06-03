"""Идемпотентный сидинг демо-данных Purrz.

Что генерируется при первом старте (или если соответствующих сущностей нет):
  - 6 категорий (slug-стабильные)
  - ~30 услуг, по 4-6 на категорию
  - Bootstrap-аккаунты (если заданы env BOOTSTRAP_*):
      ADMIN  — модератор
      MANAGER — владелец «Арктика-Сервис» (демо-компания)
      USER   — обычный пользователь
  - Demo-компания «Арктика-Сервис» (для manager'а)
  - ~85 случайных компаний с процедурно сгенерированными:
      названиями, ИНН, описаниями, услугами, ценами, отзывами, рейтингом
  - 50 лидов на demo-компанию за 30 дней (для красивой аналитики)

Запускается в start.sh после init_db. Всё что уже есть — пропускается.
"""
from __future__ import annotations

import json
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .db import SessionLocal
from .models import (
    Category,
    Company,
    CompanyService,
    CompanyTariff,
    Lead,
    LeadStatus,
    Review,
    Service,
    User,
    UserRole,
)
from .security import hash_password


# ── Категории и услуги — стабильный seed ────────────────────────────────────

CATEGORIES = [
    {"slug": "hvac",         "name": "Кондиционеры и климат", "icon": "snowflake",
     "description": "Установка и обслуживание сплит-систем, вентиляция."},
    {"slug": "renovation",   "name": "Ремонт квартир",        "icon": "hammer",
     "description": "Ремонт под ключ, отделка, перепланировка."},
    {"slug": "cleaning",     "name": "Клининг",               "icon": "sparkles",
     "description": "Уборка квартир, офисов, после ремонта."},
    {"slug": "electric",     "name": "Электрика",             "icon": "zap",
     "description": "Электромонтаж, замена проводки, щитки."},
    {"slug": "plumbing",     "name": "Сантехника",            "icon": "droplet",
     "description": "Сантехнические работы любой сложности."},
    {"slug": "construction", "name": "Строительство",         "icon": "building",
     "description": "Строительство домов, фундаменты, кровля."},
]

SERVICES = [
    # hvac
    ("svc-split-install",   "Установка сплит-системы",       "hvac",        6000,  18000),
    ("svc-split-service",   "Чистка и заправка кондиционера","hvac",        3000,   8000),
    ("svc-vent-install",    "Монтаж вентиляции",             "hvac",       15000,  60000),
    ("svc-vrf",             "VRF-система",                   "hvac",      120000, 450000),
    ("svc-recovery",        "Рекуператор воздуха",           "hvac",       45000, 120000),
    # renovation
    ("svc-renov-capital",   "Капитальный ремонт",            "renovation", 12000,  45000),
    ("svc-renov-cosmetic",  "Косметический ремонт",          "renovation",  4500,  14000),
    ("svc-renov-bath",      "Ремонт санузла",                "renovation", 35000, 150000),
    ("svc-renov-kitchen",   "Ремонт кухни",                  "renovation", 45000, 180000),
    ("svc-renov-design",    "Дизайн-проект",                 "renovation",  1500,   5000),
    # cleaning
    ("svc-clean-flat",      "Уборка квартиры",               "cleaning",    2000,   8000),
    ("svc-clean-office",    "Уборка офиса",                  "cleaning",    3500,  15000),
    ("svc-clean-aftrepair", "После ремонта",                 "cleaning",    6000,  18000),
    ("svc-clean-windows",   "Мойка окон",                    "cleaning",    1500,   6000),
    ("svc-clean-uppol",     "Химчистка мебели",              "cleaning",    2500,   9000),
    # electric
    ("svc-elec-wiring",     "Замена проводки",               "electric",    8000,  40000),
    ("svc-elec-shield",     "Сборка щитка",                  "electric",    5000,  18000),
    ("svc-elec-sockets",    "Установка розеток",             "electric",     700,   1500),
    ("svc-elec-light",      "Монтаж освещения",              "electric",    3000,  15000),
    ("svc-elec-smarthome",  "Умный дом",                     "electric",   25000, 120000),
    # plumbing
    ("svc-plumb-fix",       "Замена смесителя",              "plumbing",    1500,   4500),
    ("svc-plumb-pipes",     "Замена труб",                   "plumbing",    7000,  35000),
    ("svc-plumb-toilet",    "Установка унитаза",             "plumbing",    2500,   6500),
    ("svc-plumb-leak",      "Устранение протечки",           "plumbing",    2000,   8000),
    ("svc-plumb-heater",    "Установка водонагревателя",     "plumbing",    3500,   9000),
    # construction
    ("svc-cons-house",      "Строительство дома",            "construction", 8000,  35000),
    ("svc-cons-found",      "Фундамент",                     "construction", 6000,  18000),
    ("svc-cons-roof",       "Монтаж кровли",                 "construction", 4500,  16000),
    ("svc-cons-facade",     "Отделка фасада",                "construction", 3500,  14000),
    ("svc-cons-bath",       "Строительство бани",            "construction", 8500,  25000),
]


# ── Шаблоны для процедурной генерации компаний ─────────────────────────────

_NAME_TEMPLATES = [
    # Категория hvac
    ("hvac", ["{prefix}-Сервис", "Климат-{prefix}", "{prefix}-Мастер", "{prefix} Engineering"]),
    ("renovation", ["{prefix}-Строй", "Мастер-{prefix}", "{prefix} Ремонт", "Дом {prefix}"]),
    ("cleaning", ["{prefix}-Клин", "Чисто {prefix}", "{prefix} Service", "Блеск-{prefix}"]),
    ("electric", ["{prefix} Электро", "{prefix}-Свет", "Энерго-{prefix}", "{prefix} Вольт"]),
    ("plumbing", ["{prefix}-Сантех", "Аква-{prefix}", "{prefix} Water", "{prefix}-Трубы"]),
    ("construction", ["{prefix}-Строй", "{prefix} Build", "Кров-{prefix}", "Дом {prefix}"]),
]

_PREFIXES = [
    "Арктика", "Скиф", "Виктория", "Альфа", "Бета", "Урал", "Норд", "Сфера",
    "Меридиан", "Элемент", "Атмосфера", "Восход", "Прима", "Лидер", "Стандарт",
    "Партнёр", "Гарант", "Гранит", "Кварц", "Прогресс", "Эталон", "Технология",
    "Орбита", "Континент", "Терра", "Фронт", "Профи", "Эксперт", "Базис",
    "Опора", "Мастер", "Импульс", "Континент-плюс", "Гермес", "Сибирь",
    "Кубань", "Балтика", "Звезда", "Радуга", "Тренд",
]

_DESCRIPTIONS = [
    "Работаем с 20{year}. Гарантия на все услуги, прозрачные цены.",
    "Команда из {team}+ инженеров. Сертифицированные специалисты.",
    "Берём только проверенные материалы. Гарантия {warranty} лет.",
    "Без посредников, без переплат. Выезд бесплатно в день обращения.",
    "Опыт {team}+ объектов в Москве и области.",
    "Делаем под ключ: от консультации до сдачи объекта.",
]

_STREETS = [
    "Ленинский", "Кутузовский", "Мира", "Большая Якиманка", "Профсоюзная",
    "Тверской", "Садовое кольцо", "Новый Арбат", "Маросейка", "Электрозаводская",
    "Большая Дмитровка", "Малая Бронная", "Покровский бульвар",
]


def _gen_inn(seed: int) -> str:
    # 10-значный ИНН, детерминированный по seed'у.
    rng = random.Random(seed)
    return "77" + "".join(str(rng.randint(0, 9)) for _ in range(8))


def _gen_company(idx: int, services_by_cat: dict[str, list[Service]]) -> tuple[Company, list[CompanyService]]:
    rng = random.Random(idx)
    cat_slug, templates = _NAME_TEMPLATES[idx % len(_NAME_TEMPLATES)]
    prefix = _PREFIXES[idx % len(_PREFIXES)]
    name = templates[idx % len(templates)].format(prefix=prefix)
    inn = _gen_inn(1000 + idx)

    description = _DESCRIPTIONS[idx % len(_DESCRIPTIONS)].format(
        year=str(rng.randint(5, 23)).zfill(2),
        team=rng.randint(3, 40),
        warranty=rng.randint(2, 10),
    )

    street = _STREETS[idx % len(_STREETS)]
    address = f"Москва, {street}, д. {rng.randint(1, 200)}"

    avg_rating = round(rng.uniform(3.8, 5.0), 2)
    reviews_count = rng.randint(20, 480)
    discount = rng.choice([0, 5, 10, 15, 20, 0, 0])
    years = rng.randint(2, 22)
    tariff = CompanyTariff.premium if idx % 5 == 0 else CompanyTariff.free
    verified = rng.random() < 0.7

    # Логотип через DiceBear initials — стабильный по name.
    bg = rng.choice(["0A0A0B", "D6FF3D", "1FCB6B", "4D7BFF", "FFD43D", "FF4D3D"])
    fg = "0A0A0B" if bg != "0A0A0B" else "D6FF3D"
    logo = (
        f"https://api.dicebear.com/9.x/initials/svg?seed={prefix}&backgroundColor={bg}"
        f"&textColor={fg}&fontWeight=700"
    )

    # Галерея — 2-4 случайных unsplash-картинки тематических.
    photo_pool = [
        "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&q=80",
        "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1200&q=80",
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
        "https://images.unsplash.com/photo-1565608438257-fac3c27beb36?w=1200&q=80",
        "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&q=80",
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    ]
    gallery = rng.sample(photo_pool, k=rng.randint(2, 4))

    company = Company(
        name=name,
        inn=inn,
        description=description,
        logo=logo,
        banner=gallery[0],
        address=address,
        contact_phone=f"+7 (495) {rng.randint(100, 999)}-{rng.randint(10, 99)}-{rng.randint(10, 99)}",
        contact_email=f"info@{prefix.lower()}-{rng.randint(10, 99)}.demo",
        contact_site=f"{prefix.lower()}-{rng.randint(10, 99)}.demo",
        discount=discount,
        years_on_market=years,
        views=rng.randint(50, 5000),
        rating_avg=avg_rating,
        reviews_count=reviews_count,
        gallery_json=json.dumps(gallery),
        tariff=tariff,
        verified=verified,
        is_active=True,
    )

    # Услуги: 2-4 из своей категории.
    pool = services_by_cat.get(cat_slug, [])
    company_services: list[CompanyService] = []
    if pool:
        picked = rng.sample(pool, k=min(len(pool), rng.randint(2, 4)))
        for svc in picked:
            price = rng.randint(svc.min_price, svc.max_price)
            company_services.append(CompanyService(
                service_id=svc.id,
                price=price,
                discount=rng.choice([None, None, 5, 10, 15]),
                description=None,
            ))

    return company, company_services


# ── Сидинг ─────────────────────────────────────────────────────────────────

def _seed_catalog(db: Session) -> None:
    """Категории и услуги — идемпотентно по slug."""
    cats_by_slug: dict[str, Category] = {}
    for i, data in enumerate(CATEGORIES):
        cat = db.scalar(select(Category).where(Category.slug == data["slug"]))
        if not cat:
            cat = Category(**data, sort_order=i)
            db.add(cat)
            db.flush()
        cats_by_slug[cat.slug] = cat
    db.commit()

    for slug, name, cat_slug, lo, hi in SERVICES:
        svc = db.scalar(select(Service).where(Service.slug == slug))
        if svc:
            continue
        cat = cats_by_slug[cat_slug]
        db.add(Service(
            slug=slug, name=name, category_id=cat.id, min_price=lo, max_price=hi,
            description=f"Услуга «{name}» — {cat.name.lower()}",
        ))
    db.commit()


def _seed_bootstrap_users(db: Session) -> tuple[User | None, User | None, User | None]:
    """Создаёт админа/менеджера/юзера если env-credentials заданы."""

    def ensure(email_env: str | None, password_env: str | None, role: UserRole, name: str) -> User | None:
        if not email_env or not password_env:
            return None
        email_norm = email_env.strip().lower()
        u = db.scalar(select(User).where(User.email == email_norm))
        if u:
            return u
        u = User(
            email=email_norm,
            name=name,
            password_hash=hash_password(password_env),
            role=role,
            avatar=f"https://api.dicebear.com/9.x/initials/svg?seed={name}&backgroundColor=D6FF3D&textColor=0A0A0B",
        )
        db.add(u)
        db.flush()
        print(f"[seed] bootstrap-юзер создан: {email_norm} (роль={role.value})")
        return u

    admin = ensure(settings.bootstrap_admin_email, settings.bootstrap_admin_password, UserRole.admin, "Модератор")
    manager = ensure(settings.bootstrap_manager_email, settings.bootstrap_manager_password, UserRole.company_manager, "Менеджер Арктики")
    demo_user = ensure(settings.bootstrap_user_email, settings.bootstrap_user_password, UserRole.user, "Иван Демов")

    # Принудительный ресет demo-юзера на каждом старте: если кто-то
    # экспериментировал с регистрацией компании из-под demo@…, у него
    # повисала привязка к чужой/тестовой компании, и при логине UI тащил
    # его в /crm. Демо-юзер должен быть всегда «чистым» покупателем.
    if demo_user and (demo_user.company_id or demo_user.role != UserRole.user):
        demo_user.company_id = None
        demo_user.role = UserRole.user
        print(f"[seed] demo-юзер {demo_user.email} сброшен в роль user, company_id=None")

    db.commit()
    return admin, manager, demo_user


def _seed_demo_company(
    db: Session, services_by_cat: dict[str, list[Service]], manager: User | None
) -> Company:
    """Демонстрационная компания «Арктика-Сервис» — на ней живут синтетические лиды."""
    inn = "7701234567"
    company = db.scalar(select(Company).where(Company.inn == inn))
    if company:
        if manager and not manager.company_id:
            manager.company_id = company.id
            db.commit()
        return company

    hvac_svcs = services_by_cat.get("hvac", [])
    company = Company(
        name="Арктика-Сервис",
        inn=inn,
        description="Монтаж и обслуживание сплит-систем с 2009 года. Команда из 18+ инженеров, гарантия 5 лет.",
        logo="https://api.dicebear.com/9.x/initials/svg?seed=Arctica&backgroundColor=0A0A0B&textColor=D6FF3D&fontWeight=700",
        banner="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1600&q=80",
        address="Москва, ул. Электрозаводская, 27",
        contact_phone="+7 (495) 123-45-67",
        contact_email="info@arctica-service.demo",
        contact_site="arctica-service.demo",
        discount=15,
        years_on_market=15,
        views=4200,
        rating_avg=4.9,
        reviews_count=234,
        gallery_json=json.dumps([
            "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1600&q=80",
            "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1600&q=80",
            "https://images.unsplash.com/photo-1565608438257-fac3c27beb36?w=1600&q=80",
        ]),
        tariff=CompanyTariff.premium,
        verified=True,
        is_active=True,
    )
    db.add(company)
    db.flush()
    for svc in hvac_svcs[:3]:
        db.add(CompanyService(
            company_id=company.id, service_id=svc.id,
            price=(svc.min_price + svc.max_price) // 2,
            discount=15,
            description=None,
        ))
    if manager and not manager.company_id:
        manager.company_id = company.id
    db.commit()
    db.refresh(company)
    return company


def _seed_random_companies(db: Session, services_by_cat: dict[str, list[Service]]) -> None:
    """85 компаний — генерируем за один проход, если их меньше N."""
    existing_count = db.scalar(select(Company.id).limit(1))
    # Если в базе уже больше двух компаний — считаем что сидинг проходил.
    if db.scalar(select(Company).where(Company.inn != "7701234567")):
        return

    for i in range(85):
        company, company_services = _gen_company(i, services_by_cat)
        db.add(company)
        db.flush()
        for cs in company_services:
            cs.company_id = company.id
            db.add(cs)
        if i % 20 == 19:
            db.commit()
    db.commit()


def _seed_demo_leads(db: Session, demo_company: Company, services_by_cat: dict[str, list[Service]]) -> None:
    """50 синтетических лидов за 30 дней на демо-компанию."""
    existing = db.scalar(select(Lead).where(Lead.company_id == demo_company.id).limit(1))
    if existing:
        return

    hvac = services_by_cat.get("hvac", [])
    if not hvac:
        return

    rng = random.Random(42)
    names = ["Иван", "Мария", "Олег", "Алексей", "Светлана", "Дмитрий", "Анна", "Сергей", "Екатерина", "Михаил"]
    surnames = ["И.", "П.", "С.", "К.", "В.", "М.", "Р."]
    statuses_weighted = (
        [LeadStatus.done] * 14
        + [LeadStatus.in_progress] * 9
        + [LeadStatus.new] * 19
        + [LeadStatus.rejected] * 8
    )

    now = datetime.now(timezone.utc)
    for i in range(50):
        days_ago = rng.randint(0, 30)
        hours_ago = rng.randint(0, 23)
        when = now - timedelta(days=days_ago, hours=hours_ago)
        first = rng.choice(names)
        last = rng.choice(surnames)
        contact_kind = rng.choice(["phone", "email"])
        contact = (
            f"+7 (9{rng.randint(0, 99):02d}) {rng.randint(100, 999)}-"
            f"{rng.randint(10, 99)}-{rng.randint(10, 99)}"
        ) if contact_kind == "phone" else f"{first.lower()}.{rng.randint(10, 99)}@mail.demo"
        svc = rng.choice(hvac)
        lead = Lead(
            company_id=demo_company.id,
            service_id=svc.id,
            user_id=None,
            user_name=f"{first} {last}",
            user_contact=contact,
            comment=rng.choice([
                "Нужна установка кондиционера в 3-комнатной квартире.",
                "Сломался компрессор, нужна диагностика.",
                "Хотим обслуживание ВРВ-системы в офисе.",
                "Подскажите цену под ключ.",
                "Когда сможете приехать на замер?",
                "",
            ]),
            status=rng.choice(statuses_weighted),
            created_at=when,
        )
        db.add(lead)
    db.commit()


def _seed_reviews(db: Session, services_by_cat: dict[str, list[Service]]) -> None:
    """Раскидываем отзывы по компаниям. Идемпотентно — пропускаем если уже есть отзывы."""
    existing = db.scalar(select(Review).limit(1))
    if existing:
        return

    rng = random.Random(7)
    review_texts = [
        "Очень довольны работой, всё чисто и в срок.",
        "Установили кондиционер за один день, рекомендую.",
        "Делали ремонт под ключ, претензий нет.",
        "Профессионально, без задержек.",
        "Цены выше среднего, но качество того стоит.",
        "Команда вежливая, всё объясняли по ходу работы.",
        "Сделали быстро, но осталось немного мусора — пришлось убирать самому.",
        "Лучшая компания в районе, обращаемся не первый раз.",
    ]
    authors = ["Алексей К.", "Мария В.", "Дмитрий С.", "Светлана П.", "Олег М.", "Анна Р.", "Сергей Д."]

    companies = list(db.scalars(select(Company)))
    for c in companies:
        n = rng.randint(2, 6)
        for _ in range(n):
            db.add(Review(
                company_id=c.id,
                user_id=None,
                author_name=rng.choice(authors),
                rating=rng.choice([5, 5, 5, 4, 4, 3]),
                text=rng.choice(review_texts),
            ))
    db.commit()


def seed_if_empty() -> None:
    """Главный entrypoint сидинга. Безопасно зовётся при каждом старте."""
    with SessionLocal() as db:
        # 1. Каталог.
        _seed_catalog(db)
        services_by_cat: dict[str, list[Service]] = {}
        for cat in db.scalars(select(Category)):
            services_by_cat[cat.slug] = list(
                db.scalars(select(Service).where(Service.category_id == cat.id))
            )

        # 2. Bootstrap-аккаунты.
        admin, manager, demo_user = _seed_bootstrap_users(db)

        # 3. Демо-компания + связь с manager'ом.
        demo_company = _seed_demo_company(db, services_by_cat, manager)

        # 4. 85 случайных компаний.
        _seed_random_companies(db, services_by_cat)

        # 5. 50 синтетических лидов на демо-компанию (для красивой аналитики).
        _seed_demo_leads(db, demo_company, services_by_cat)

        # 6. Отзывы.
        _seed_reviews(db, services_by_cat)

        print("[seed] готово.")
