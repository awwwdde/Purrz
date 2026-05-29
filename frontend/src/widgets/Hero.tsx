import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Container, Icon, Rating } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Service } from "@/shared/types";

const trustBadges = [
  { label: "Проверка по ИНН" },
  { label: "Договор с подрядчиком" },
  { label: "Отзывы только от клиентов" },
  { label: "Без комиссий с заказов" },
];

export function Hero() {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.listServices().then(setServices);
  }, []);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return services.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 5);
  }, [query, services]);

  return (
    <section className="relative bg-ink-50 overflow-hidden">
      {/* Тонкий узор-сетка как лёгкая текстура */}
      <div className="absolute inset-0 grid-pattern opacity-60" />

      <Container className="relative pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Текстовая колонка */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            {/* Trust badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 mb-6 bg-white rounded-pill border border-ink-200 shadow-brutal-sm">
              <Rating value={4.8} size="sm" hideNumber={false} />
              <span className="text-sm text-ink-700 font-medium">
                <strong className="text-ink-950">12 800+</strong> довольных клиентов
              </span>
            </div>

            <h1 className="heading-1 text-ink-950 mb-6">
              Найдите проверенного{" "}
              <span className="relative inline-block">
                <span className="relative z-10">исполнителя</span>
                <svg
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  className="absolute left-0 right-0 -bottom-1 w-full h-3 text-accent"
                  fill="currentColor"
                >
                  <path d="M0 6 Q 75 0, 150 4 T 300 6 L 300 12 L 0 12 Z" />
                </svg>
              </span>
              <br />
              для любой задачи
            </h1>

            <p className="text-lg text-ink-600 max-w-xl leading-relaxed mb-8">
              Реестр инженерных и сервисных компаний с проверенными ценами,
              рейтингами и реальными отзывами. Заявка попадает напрямую к
              подрядчику.
            </p>

            {/* Поиск */}
            <div className="relative max-w-xl mb-6">
              <div className="flex items-center bg-white rounded-[18px] border border-ink-200 shadow-brutal-sm focus-within:border-accent focus-within:shadow-ring transition-all">
                <Icon name="search" className="ml-4 text-ink-500" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  placeholder="Какая услуга нужна? Напр. «установка сплит-системы»"
                  className="flex-1 min-w-0 px-3 py-4 bg-transparent focus:outline-none text-[15px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/catalog?q=${encodeURIComponent(query)}`);
                  }}
                />
                <div className="p-1.5">
                  <Button
                    size="md"
                    onClick={() => navigate(`/catalog?q=${encodeURIComponent(query)}`)}
                    iconRight={<Icon name="arrow-right" size={16} />}
                  >
                    Найти
                  </Button>
                </div>
              </div>

              {focused && matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[18px] border border-ink-200 shadow-lift overflow-hidden z-20"
                >
                  {matches.map((s) => (
                    <Link
                      key={s.id}
                      to={`/catalog?service=${s.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-accent-soft transition-colors border-b border-ink-100 last:border-0"
                    >
                      <div>
                        <div className="font-display font-semibold text-sm">{s.name}</div>
                        <div className="text-xs text-ink-500 mt-0.5">
                          от {s.minPrice.toLocaleString("ru-RU")} ₽
                        </div>
                      </div>
                      <Icon name="arrow-up-right" size={16} className="text-ink-400" />
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Популярные запросы */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-ink-500 mr-1">Часто ищут:</span>
              {[
                { label: "Сплит-система", q: "сплит" },
                { label: "Ремонт квартиры", q: "ремонт" },
                { label: "Клининг", q: "уборка" },
                { label: "Электрика", q: "электр" },
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => navigate(`/catalog?q=${encodeURIComponent(t.q)}`)}
                  className="px-3 py-1.5 rounded-pill bg-white border border-ink-200 text-sm text-ink-700 hover:border-ink-950 hover:text-ink-950 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Колонка с фото */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-[28px] overflow-hidden bg-ink-200">
              <img
                src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=900&q=85"
                alt="Инженер за работой"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
              {/* Лёгкий вертикальный градиент для читаемости плашек */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 via-transparent to-transparent" />
            </div>

            {/* Floating плашка — статус */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -left-3 lg:-left-8 top-8 bg-white rounded-2xl border border-ink-200 shadow-lift px-4 py-3 flex items-center gap-3 max-w-[230px]"
            >
              <div className="w-10 h-10 rounded-full bg-accent-soft text-accent grid place-items-center flex-shrink-0">
                <Icon name="shield-check" size={20} />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-ink-950 leading-tight">
                  240+ компаний
                </div>
                <div className="text-xs text-ink-500">прошли верификацию</div>
              </div>
            </motion.div>

            {/* Floating плашка — заявка */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute -right-3 lg:-right-8 bottom-10 bg-white rounded-2xl border border-ink-200 shadow-lift px-4 py-3 max-w-[240px]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-display font-semibold text-ink-700 uppercase tracking-wider">
                  только что
                </span>
              </div>
              <div className="text-sm text-ink-950 leading-snug">
                Анна оставила заявку на установку сплит-системы
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Trust row */}
        <div className="mt-16 lg:mt-20 pt-8 border-t border-ink-200 grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustBadges.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent grid place-items-center flex-shrink-0">
                <Icon name="check" size={18} />
              </div>
              <span className="text-sm font-display font-semibold text-ink-800 leading-tight">
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
