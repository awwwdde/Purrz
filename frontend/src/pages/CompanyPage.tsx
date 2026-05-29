import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge, Button, Container, Icon, Rating } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Company, Service } from "@/shared/types";
import { formatPrice, formatRelative } from "@/shared/lib/format";
import { LeadModal } from "@/features/leads/LeadModal";

export function CompanyPage() {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [leadOpen, setLeadOpen] = useState(false);
  const [preselectService, setPreselectService] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    mockApi.getCompany(id).then(async (c) => {
      if (!c) return;
      setCompany(c);
      const arr = await Promise.all(
        c.services.map((s) => mockApi.getService(s.serviceId)),
      );
      const map: Record<string, Service> = {};
      arr.forEach((s) => {
        if (s) map[s.id] = s;
      });
      setServices(map);
    });
  }, [id]);

  if (!company) {
    return (
      <Container className="py-20">
        <div className="bg-white border border-ink-200 rounded-card p-10 text-center">
          Загрузка...
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Banner */}
      <div className="relative h-56 md:h-80 bg-ink-950 overflow-hidden border-b border-ink-200">
        <img
          src={company.banner}
          alt=""
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
      </div>

      <Container className="relative -mt-20 pb-20">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-white/80 mb-5 font-display">
          <Link to="/" className="hover:text-accent">Главная</Link>
          <Icon name="chevron-right" size={14} />
          <Link to="/catalog" className="hover:text-accent">Каталог</Link>
          <Icon name="chevron-right" size={14} />
          <span className="text-white">{company.name}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-ink-200 rounded-card p-6 lg:p-8 shadow-brutal mb-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={company.logo}
              alt={company.name}
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-ink-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="heading-3">{company.name}</h1>
                {company.verified && (
                  <Badge tone="success">
                    <Icon name="check" size={10} /> verified
                  </Badge>
                )}
                {company.discount > 0 && (
                  <Badge tone="accent">−{company.discount}% скидка</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-ink-600 mb-4">
                <Rating value={company.rating} reviews={company.reviewsCount} />
                <span>·</span>
                <span>{company.yearsOnMarket} лет на рынке</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Icon name="eye" size={14} /> {company.views.toLocaleString("ru-RU")}
                </span>
              </div>
              <p className="text-ink-700 leading-relaxed max-w-3xl">
                {company.description}
              </p>
            </div>
            <div className="flex md:flex-col gap-2">
              <Button
                size="lg"
                onClick={() => {
                  setPreselectService(undefined);
                  setLeadOpen(true);
                }}
                iconRight={<Icon name="arrow-right" size={18} />}
              >
                Оставить заявку
              </Button>
              <Button variant="outline" size="lg" iconLeft={<Icon name="phone" size={16} />}>
                Позвонить
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main column */}
          <div className="space-y-6">
            {/* Services */}
            <section className="bg-white border border-ink-200 rounded-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl font-semibold">Услуги и цены</h2>
                <Badge tone="default">{company.services.length}</Badge>
              </div>
              <div className="space-y-3">
                {company.services.map((cs) => {
                  const svc = services[cs.serviceId];
                  return (
                    <div
                      key={cs.serviceId}
                      className="flex items-center justify-between gap-4 p-4 border border-ink-200 rounded-xl hover:border-ink-950 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-display font-semibold mb-1">
                          {svc?.name ?? "..."}
                        </div>
                        {svc && (
                          <div className="text-sm text-ink-500 line-clamp-1">
                            {svc.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-display text-lg font-bold">
                          {formatPrice(cs.price)}
                        </div>
                        {cs.discount && (
                          <div className="text-xs text-signal-green font-semibold">
                            −{cs.discount}%
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPreselectService(cs.serviceId);
                          setLeadOpen(true);
                        }}
                      >
                        Заявка
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Gallery */}
            {company.gallery.length > 0 && (
              <section className="bg-white border border-ink-200 rounded-card p-6">
                <h2 className="font-display text-2xl font-semibold mb-5">Работы</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {company.gallery.map((src, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="aspect-[4/3] rounded-xl overflow-hidden border border-ink-200 cursor-zoom-in"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="bg-white border border-ink-200 rounded-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl font-semibold">Отзывы</h2>
                <Rating value={company.rating} reviews={company.reviewsCount} />
              </div>
              <div className="space-y-4">
                {company.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="border border-ink-200 rounded-xl p-4 hover:border-ink-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-display font-semibold">{r.author}</div>
                      <div className="flex items-center gap-2">
                        <Rating value={r.rating} size="sm" />
                        <span className="text-xs text-ink-500">{formatRelative(r.date)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-ink-700 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-ink-950 text-white rounded-card p-6 border border-ink-200 shadow-brutal">
              <div className="eyebrow text-accent mb-3">контакты</div>
              <div className="space-y-3">
                <a
                  href={`tel:${company.contacts.phone}`}
                  className="flex items-center gap-3 hover:text-accent transition-colors"
                >
                  <Icon name="phone" size={18} />
                  <span className="font-display font-semibold">
                    {company.contacts.phone}
                  </span>
                </a>
                <a
                  href={`mailto:${company.contacts.email}`}
                  className="flex items-center gap-3 hover:text-accent transition-colors text-sm"
                >
                  <Icon name="mail" size={18} />
                  {company.contacts.email}
                </a>
                {company.contacts.site && (
                  <div className="flex items-center gap-3 text-sm text-ink-300">
                    <Icon name="external" size={18} />
                    {company.contacts.site}
                  </div>
                )}
                <div className="flex items-start gap-3 text-sm text-ink-300 pt-2 border-t border-ink-800">
                  <Icon name="map-pin" size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{company.address}</span>
                </div>
              </div>
              <Button
                fullWidth
                size="lg"
                className="mt-5"
                onClick={() => {
                  setPreselectService(undefined);
                  setLeadOpen(true);
                }}
                iconRight={<Icon name="arrow-right" size={16} />}
              >
                Оставить заявку
              </Button>
            </div>

            <div className="bg-white border border-ink-200 rounded-card p-6">
              <div className="eyebrow mb-3">реквизиты</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-500">ИНН</span>
                  <span className="font-mono">{company.inn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Опыт</span>
                  <span>{company.yearsOnMarket} лет</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Просмотров</span>
                  <span>{company.views.toLocaleString("ru-RU")}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      <LeadModal
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        company={company}
        preselectServiceId={preselectService}
      />
    </div>
  );
}
