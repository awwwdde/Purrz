import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge, Icon, Rating, type IconName } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Company, Lead } from "@/shared/types";
import { useAuth } from "@/app/store/auth";
import { formatRelative } from "@/shared/lib/format";

interface KpiProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: IconName;
  accent?: boolean;
}
function Kpi({ label, value, delta, icon, accent }: KpiProps) {
  return (
    <div
      className={`rounded-card border border-ink-200 p-5 ${accent ? "bg-accent" : "bg-white"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-ink-950 text-accent grid place-items-center">
          <Icon name={icon} size={16} />
        </div>
        {delta && (
          <span className="text-xs font-display font-semibold text-signal-green inline-flex items-center gap-1">
            <Icon name="trending-up" size={12} /> {delta}
          </span>
        )}
      </div>
      <div className="font-display text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-ink-700 mt-1 font-display uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

export function CrmDashboardPage() {
  const user = useAuth((s) => s.user);
  const [company, setCompany] = useState<Company | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    if (!user?.companyId) return;
    mockApi.getCompany(user.companyId).then((c) => setCompany(c ?? null));
    mockApi.listLeads({ companyId: user.companyId }).then(setLeads);
  }, [user?.companyId]);

  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const inProgress = leads.filter((l) => l.status === "in_progress").length;
    const done = leads.filter((l) => l.status === "done").length;
    const conversion = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, newCount, inProgress, done, conversion };
  }, [leads]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-3 mb-1">Здравствуйте, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-ink-600">
            Сводка по компании {company ? `«${company.name}»` : ""} за сегодня
          </p>
        </div>
        {company && (
          <Link
            to={`/company/${company.id}`}
            className="inline-flex items-center gap-1.5 font-display font-semibold text-ink-700 hover:text-ink-950"
          >
            Посмотреть как клиент
            <Icon name="external" size={14} />
          </Link>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Kpi label="Всего лидов" value={stats.total} icon="leads" delta="+18%" accent />
        <Kpi label="Новые" value={stats.newCount} icon="bolt" delta="+3" />
        <Kpi label="Конверсия" value={`${stats.conversion}%`} icon="trending-up" delta="+5%" />
        <Kpi label="Просмотры" value={company?.views.toLocaleString("ru-RU") ?? "—"} icon="eye" delta="+24%" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Воронка */}
        <div className="lg:col-span-2 bg-white border border-ink-200 rounded-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold">Воронка заявок</h2>
            <Badge tone="default">за 30 дней</Badge>
          </div>
          <div className="space-y-3">
            {[
              { label: "Новые", value: stats.newCount, color: "bg-signal-blue" },
              { label: "В обработке", value: stats.inProgress, color: "bg-signal-yellow" },
              { label: "Завершены", value: stats.done, color: "bg-signal-green" },
              { label: "Отклонены", value: leads.filter((l) => l.status === "rejected").length, color: "bg-signal-red" },
            ].map((row) => {
              const max = Math.max(1, stats.total);
              const pct = Math.round((row.value / max) * 100);
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-display font-semibold">{row.label}</span>
                    <span className="text-ink-500">
                      {row.value} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 bg-ink-100 rounded-full overflow-hidden border border-ink-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full ${row.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Компания статус */}
        <div className="bg-ink-950 text-white rounded-card p-6 border border-ink-200 shadow-brutal">
          <div className="eyebrow text-accent mb-4">статус карточки</div>
          {company && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={company.logo}
                  alt=""
                  className="w-12 h-12 rounded-xl border border-accent"
                />
                <div className="min-w-0">
                  <div className="font-display font-semibold truncate">{company.name}</div>
                  <Rating value={company.rating} reviews={company.reviewsCount} size="sm" className="!text-white" />
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-ink-800 pt-4">
                <div className="flex justify-between">
                  <span className="text-ink-400">Услуг</span>
                  <span>{company.services.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Скидка</span>
                  <span>{company.discount > 0 ? `${company.discount}%` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Верификация</span>
                  <span>
                    {company.verified ? (
                      <Badge tone="success">verified</Badge>
                    ) : (
                      <Badge tone="warning">в процессе</Badge>
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Последние лиды */}
      <div className="bg-white border border-ink-200 rounded-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-semibold">Последние заявки</h2>
          <Link
            to="/crm/leads"
            className="inline-flex items-center gap-1 font-display font-semibold text-sm hover:text-ink-700"
          >
            Все лиды <Icon name="arrow-right" size={14} />
          </Link>
        </div>
        <div className="divide-y divide-ink-100">
          {leads.slice(0, 5).map((l) => (
            <div key={l.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-display font-semibold truncate">{l.userName}</div>
                <div className="text-sm text-ink-500 truncate">
                  {l.serviceName} · {l.userContact}
                </div>
              </div>
              <div className="text-right text-sm text-ink-500 hidden sm:block">
                {formatRelative(l.date)}
              </div>
              <Badge
                tone={
                  l.status === "new"
                    ? "info"
                    : l.status === "in_progress"
                    ? "warning"
                    : l.status === "done"
                    ? "success"
                    : "danger"
                }
              >
                {l.status === "new" && "Новая"}
                {l.status === "in_progress" && "В работе"}
                {l.status === "done" && "Готово"}
                {l.status === "rejected" && "Отклонена"}
              </Badge>
            </div>
          ))}
          {leads.length === 0 && (
            <div className="py-8 text-center text-ink-500">Пока нет заявок</div>
          )}
        </div>
      </div>
    </div>
  );
}
