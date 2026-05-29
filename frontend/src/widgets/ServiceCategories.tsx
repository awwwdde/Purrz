import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, Icon, type IconName } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { ServiceCategory } from "@/shared/types";

// Тёплые pastel-цвета для иконок категорий
const categoryColor: Record<string, string> = {
  hvac: "bg-[#E8F4F8] text-[#2563EB]",
  renovation: "bg-[#FEF3C7] text-[#B45309]",
  cleaning: "bg-accent-soft text-accent-dark",
  electric: "bg-[#FEF9C3] text-[#A16207]",
  plumbing: "bg-[#DBEAFE] text-[#1D4ED8]",
  construction: "bg-[#FEE2E2] text-[#B91C1C]",
};

export function ServiceCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    mockApi.listCategories().then(setCategories);
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="eyebrow mb-3">направления</div>
            <h2 className="heading-2 mb-3">Что нужно сделать?</h2>
            <p className="text-ink-600 text-lg max-w-xl">
              Выберите категорию — и сравните проверенных подрядчиков по
              цене, рейтингу и срокам.
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 font-display font-semibold text-ink-700 hover:text-ink-950 group transition-colors"
          >
            Весь каталог
            <Icon
              name="arrow-right"
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/catalog/${cat.slug}`}
                className="group block bg-white border border-ink-200 rounded-card p-7 hover:border-ink-300 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${categoryColor[cat.slug] ?? "bg-ink-100 text-ink-950"} grid place-items-center mb-5 group-hover:scale-105 transition-transform`}
                >
                  <Icon name={cat.icon as IconName} size={26} />
                </div>
                <h3 className="font-display text-xl font-bold mb-2 text-ink-950">
                  {cat.name}
                </h3>
                <p className="text-sm text-ink-600 leading-relaxed mb-6">
                  {cat.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-display font-semibold text-ink-950 transition-colors">
                  Выбрать компанию
                  <Icon
                    name="arrow-right"
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
