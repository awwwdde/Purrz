# Purrz — Demo Service Aggregator

Современная DEMO-версия сайта-агрегатора инженерных компаний и услуг.

## Структура

```
/frontend   — Vite + React + TS + Tailwind + Framer Motion (FSD)
/backend    — FastAPI + SQLite (заготовка с базовыми endpoints)
```

## Быстрый старт

Из корня проекта:

```bash
# один раз — установить зависимости
pnpm install
pnpm run install:backend     # python deps для бэка

# поднять frontend + backend одной командой
pnpm run dev
```

* Frontend: http://localhost:5173
* Backend:  http://localhost:8000  (docs: /docs)

## Требования

* Node.js 20+, pnpm 9+
* Python 3.10+ (для бэка)

## Стек

* **Frontend:** Vite, React 18, TypeScript (strict), TailwindCSS, Framer Motion, React Router, Zustand
* **Backend:** FastAPI, SQLAlchemy, SQLite → PostgreSQL, JWT
* **Архитектура:** Feature-Sliced Design

## Реализовано в DEMO

- Главная (hero, категории, популярные компании, преимущества)
- Каталог услуг с фильтрами и сортировкой
- Карточка компании
- Авторизация / регистрация (пользователь и менеджер компании)
- Регистрация компании с автоподгрузкой по ИНН (mock)
- Личный кабинет пользователя + история откликов
- CRM: дашборд, лиды, аналитика, услуги, профиль
- Mock API внутри фронта + минимальный FastAPI на бэке
- Адаптив, анимации, brutalism/minimalism стиль
