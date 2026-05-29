import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge, Container, Icon, Input, Rating, Select } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Company, ServiceCategory } from "@/shared/types";
import { formatPrice, pluralize } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

type Sort = "rating" | "price" | "discount" | "reviews";

export function CatalogPage() {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [sort, setSort] = useState<Sort>("rating");

  useEffect(() => {
    mockApi.listCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!categorySlug) {
      setActiveCategory(undefined);
      return;
    }
    const c = categories.find((x) => x.slug === categorySlug);
    setActiveCategory(c?.id);
  }, [categorySlug, categories]);

  useEffect(() => {
    setLoading(true);
    mockApi
      .listCompanies({
        categoryId: activeCategory,
        minRating: minRating || undefined,
        hasDiscount: onlyDiscount || undefined,
        sort,
        search: search.trim() || undefined,
      })
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      });
  }, [activeCategory, minRating, onlyDiscount, sort, search]);

  const currentCat = categories.find((c) => c.id === activeCategory);

  const headerText = useMemo(() => {
    if (currentCat) return currentCat.name;
    if (search) return `Поиск: «${search}»`;
    return "Каталог компаний";
  }, [currentCat, search]);

  return (
    <div className="bg-ink-50 min-h-screen">
      <Container className="py-10 lg:py-16">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-ink-500 mb-5 font-display">
          <Link to="/" className="hover:text-ink-950">Главная</Link>
          <Icon name="chevron-right" size={14} />
          <Link to="/catalog" className="hover:text-ink-950">Каталог</Link>
          {currentCat && (
            <>
              <Icon name="chevron-right" size={14} />
              <span className="text-ink-950">{currentCat.name}</span>
            </>
          )}
        </div>

        <div className="mb-8">
          <h1 className="heading-2 mb-3">{headerText}</h1>
          {currentCat?.description && (
            <p className="text-ink-600 text-lg max-w-2xl">{currentCat.description}</p>
          )}
        </div>

        {/* Categories tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            to="/catalog"
            className={cn(
              "px-4 py-2 rounded-full border border-ink-200 font-display font-semibold text-sm transition-colors",
              !activeCategory ? "bg-ink-950 text-accent" : "bg-white hover:bg-ink-100",
            )}
          >
            Все
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/catalog/${c.slug}`}
              className={cn(
                "px-4 py-2 rounded-full border border-ink-200 font-display font-semibold text-sm transition-colors",
                activeCategory === c.id ? "bg-ink-950 text-accent" : "bg-white hover:bg-ink-100",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
            <div className="bg-white border border-ink-200 rounded-card p-5 shadow-brutal-sm">
              <div className="font-display font-semibold mb-3 flex items-center gap-2">
                <Icon name="search" size={16} /> Поиск
              </div>
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchParams(
                    e.target.value ? { q: e.target.value } : {},
                    { replace: true },
                  );
                }}
                placeholder="Название или описание"
              />
            </div>

            <div className="bg-white border border-ink-200 rounded-card p-5 shadow-brutal-sm">
              <div className="font-display font-semibold mb-3 flex items-center gap-2">
                <Icon name="filter" size={16} /> Фильтры
              </div>

              <div className="space-y-4">
                <Select
                  label="Сортировка"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  options={[
                    { value: "rating", label: "По рейтингу" },
                    { value: "price", label: "По цене" },
                    { value: "discount", label: "По скидке" },
                    { value: "reviews", label: "По отзывам" },
                  ]}
                />

                <Select
                  label="Минимальный рейтинг"
                  value={String(minRating)}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  options={[
                    { value: "0", label: "Любой" },
                    { value: "4", label: "От 4.0" },
                    { value: "4.5", label: "От 4.5" },
                    { value: "4.8", label: "От 4.8" },
                  ]}
                />

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyDiscount}
                    onChange={(e) => setOnlyDiscount(e.target.checked)}
                    className="w-5 h-5 border border-ink-200 rounded accent-ink-950"
                  />
                  <span className="text-sm font-display font-semibold">
                    Только со скидкой
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-ink-600 font-display">
                {loading
                  ? "Загрузка..."
                  : `Найдено ${companies.length} ${pluralize(companies.length, ["компания", "компании", "компаний"])}`}
              </div>
            </div>

            {!loading && companies.length === 0 && (
              <div className="bg-white border border-ink-200 rounded-card p-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-ink-100 grid place-items-center mb-4">
                  <Icon name="search" size={28} className="text-ink-500" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  Ничего не нашли
                </h3>
                <p className="text-ink-600">Попробуйте изменить фильтры или поисковой запрос.</p>
              </div>
            )}

            <div className="space-y-4">
              {companies.map((c, i) => {
                const minP = Math.min(...c.services.map((s) => s.price));
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <Link
                      to={`/company/${c.id}`}
                      className="block group bg-white border border-ink-200 rounded-card p-5 hover:shadow-lift hover:-translate-y-1 transition-all"
                    >
                      <div className="flex flex-col md:flex-row gap-5">
                        <img
                          src={c.logo}
                          alt={c.name}
                          className="w-20 h-20 rounded-xl border border-ink-200 flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                            {c.verified && (
                              <Badge tone="success">
                                <Icon name="check" size={10} /> verified
                              </Badge>
                            )}
                            {c.discount > 0 && <Badge tone="accent">−{c.discount}%</Badge>}
                          </div>

                          <div className="flex items-center gap-3 text-sm text-ink-500 mb-2 flex-wrap">
                            <Rating value={c.rating} reviews={c.reviewsCount} size="sm" />
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Icon name="map-pin" size={13} />
                              {c.address.split(",")[0]}
                            </span>
                            <span>·</span>
                            <span>{c.yearsOnMarket} лет</span>
                          </div>

                          <p className="text-sm text-ink-600 line-clamp-2 mb-3">
                            {c.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {c.services.slice(0, 3).map((s) => (
                              <Badge key={s.serviceId} tone="default">
                                {s.serviceId.replace("svc-", "").replace(/-/g, " ")}
                              </Badge>
                            ))}
                            {c.services.length > 3 && (
                              <span className="text-xs text-ink-500">
                                +{c.services.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="md:text-right md:min-w-[140px] flex md:flex-col justify-between md:justify-start">
                          <div>
                            <div className="text-xs text-ink-500">от</div>
                            <div className="font-display text-2xl font-bold">
                              {formatPrice(minP)}
                            </div>
                          </div>
                          <div className="md:mt-auto inline-flex items-center gap-1 text-sm font-display font-semibold text-ink-950 group-hover:gap-2 transition-all self-end md:self-auto">
                            Подробнее
                            <Icon name="arrow-right" size={14} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
