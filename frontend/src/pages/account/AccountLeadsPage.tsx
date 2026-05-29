import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge, Button, Icon } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Lead, LeadStatus } from "@/shared/types";
import { useAuth } from "@/app/store/auth";
import { formatRelative, pluralize } from "@/shared/lib/format";

const statusMeta: Record<LeadStatus, { label: string; tone: "info" | "warning" | "success" | "danger" }> = {
  new: { label: "Новая", tone: "info" },
  in_progress: { label: "В обработке", tone: "warning" },
  done: { label: "Завершена", tone: "success" },
  rejected: { label: "Отклонена", tone: "danger" },
};

export function AccountLeadsPage() {
  const user = useAuth((s) => s.user);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    mockApi.listLeads({ userId: user.id }).then((all) => {
      // в демо показываем заявки demo-пользователя для наглядности
      setLeads(all.filter((l) => l.userId === "u-demo" || l.userId === user.id));
      setLoading(false);
    });
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-3 mb-1">Мои отклики</h1>
          <p className="text-ink-600">
            {loading
              ? "Загрузка..."
              : `${leads.length} ${pluralize(leads.length, ["заявка", "заявки", "заявок"])} всего`}
          </p>
        </div>
        <Link to="/catalog">
          <Button variant="outline" iconLeft={<Icon name="plus" size={16} />}>
            Найти компанию
          </Button>
        </Link>
      </div>

      {!loading && leads.length === 0 && (
        <div className="bg-white border border-ink-200 rounded-card p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-ink-100 grid place-items-center mb-4">
            <Icon name="leads" size={28} className="text-ink-500" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">
            Пока нет откликов
          </h3>
          <p className="text-ink-600 mb-5">
            Найдите подходящую компанию и оставьте свою первую заявку.
          </p>
          <Link to="/catalog">
            <Button iconRight={<Icon name="arrow-right" size={16} />}>В каталог</Button>
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {leads.map((l, i) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white border border-ink-200 rounded-card p-5 hover:shadow-brutal-sm transition-all"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Link
                    to={`/company/${l.companyId}`}
                    className="font-display text-lg font-semibold hover:underline"
                  >
                    {l.companyName}
                  </Link>
                  <Badge tone={statusMeta[l.status].tone}>
                    {statusMeta[l.status].label}
                  </Badge>
                </div>
                <div className="text-sm text-ink-600 mb-2">
                  Услуга:{" "}
                  <span className="font-semibold text-ink-950">{l.serviceName}</span>
                </div>
                {l.comment && (
                  <p className="text-sm text-ink-600 bg-ink-50 border border-ink-200 rounded-lg p-3 mt-2">
                    «{l.comment}»
                  </p>
                )}
              </div>
              <div className="text-right text-sm text-ink-500 flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1">
                  <Icon name="calendar" size={13} />
                  {formatRelative(l.date)}
                </span>
                <Link
                  to={`/company/${l.companyId}`}
                  className="font-display font-semibold text-ink-950 inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Открыть <Icon name="arrow-right" size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
