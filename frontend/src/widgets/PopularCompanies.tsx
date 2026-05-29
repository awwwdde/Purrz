import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge, Container, Icon, Rating } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Company } from "@/shared/types";
import { formatPrice, pluralize } from "@/shared/lib/format";

/** Картинка с грациозным фоллбэком — если src не загрузится, показываем плашку с инициалами */
function CompanyCover({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(!src);
  const initials = name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (failed || !src) {
    return (
      <div className="w-full h-full grid place-items-center bg-gradient-to-br from-ink-100 to-ink-200">
        <span className="font-display font-extrabold text-5xl text-ink-400 select-none">
          {initials}
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      loading="lazy"
    />
  );
}

export function PopularCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    mockApi.listCompanies({ sort: "rating" }).then((all) => setCompanies(all.slice(0, 4)));
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-ink-50">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="eyebrow mb-3">рейтинг недели</div>
            <h2 className="heading-2 mb-3">Лучшие компании</h2>
            <p className="text-ink-600 text-lg max-w-xl">
              Топ-исполнители платформы — по рейтингу клиентов, скорости
              ответа и завершённым заказам.
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 font-display font-semibold text-ink-700 hover:text-ink-950 group transition-colors"
          >
            Все компании
            <Icon
              name="arrow-right"
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {companies.map((c, i) => {
            const minPrice = Math.min(...c.services.map((s) => s.price));
            const servicesCount = c.services.length;
            const heroImage = c.banner;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Link
                  to={`/company/${c.id}`}
                  className="group block bg-white border border-ink-200 rounded-card overflow-hidden hover:shadow-lift hover:-translate-y-1 hover:border-ink-300 transition-all duration-300 h-full"
                >
                  {/* Фото-плита */}
                  <div className="relative aspect-[16/9] bg-ink-100 overflow-hidden">
                    <CompanyCover src={heroImage} name={c.name} />
                    {/* Скидка-плашка */}
                    {c.discount > 0 && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-pill bg-ink-950 text-white font-display text-xs font-bold">
                        −{c.discount}%
                      </span>
                    )}
                  </div>

                  {/* Контент */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={c.logo}
                        alt=""
                        className="w-11 h-11 rounded-xl border border-ink-200 flex-shrink-0 bg-white"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-lg font-bold text-ink-950 truncate">
                            {c.name}
                          </h3>
                          {c.verified && (
                            <Badge tone="accent">
                              <Icon name="check" size={10} /> проверена
                            </Badge>
                          )}
                        </div>
                        <Rating value={c.rating} reviews={c.reviewsCount} size="sm" className="mt-0.5" />
                      </div>
                    </div>

                    <p className="text-sm text-ink-600 line-clamp-2 mb-5 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex items-end justify-between gap-3 pt-4 border-t border-ink-100">
                      <div>
                        <div className="text-xs text-ink-500 mb-0.5">от</div>
                        <div className="font-display text-2xl font-extrabold text-ink-950 tracking-tight">
                          {formatPrice(minPrice)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-ink-500 mb-1">
                          {servicesCount}{" "}
                          {pluralize(servicesCount, ["услуга", "услуги", "услуг"])}
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-display font-semibold text-ink-950 group-hover:gap-2 transition-all">
                          Открыть
                          <Icon name="arrow-right" size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
