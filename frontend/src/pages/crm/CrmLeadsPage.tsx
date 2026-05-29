import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, Icon, Input, Select } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Lead, LeadStatus } from "@/shared/types";
import { useAuth } from "@/app/store/auth";
import { formatRelative, pluralize } from "@/shared/lib/format";

const statusOptions: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "Все статусы" },
  { value: "new", label: "Новые" },
  { value: "in_progress", label: "В обработке" },
  { value: "done", label: "Завершены" },
  { value: "rejected", label: "Отклонены" },
];

const statusBadge: Record<LeadStatus, { label: string; tone: "info" | "warning" | "success" | "danger" }> = {
  new: { label: "Новая", tone: "info" },
  in_progress: { label: "В обработке", tone: "warning" },
  done: { label: "Завершена", tone: "success" },
  rejected: { label: "Отклонена", tone: "danger" },
};

export function CrmLeadsPage() {
  const user = useAuth((s) => s.user);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.companyId) return;
    mockApi.listLeads({ companyId: user.companyId }).then(setLeads);
  }, [user?.companyId]);

  const filtered = useMemo(() => {
    let out = leads;
    if (filter !== "all") out = out.filter((l) => l.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.serviceName.toLowerCase().includes(q) ||
          l.userContact.toLowerCase().includes(q),
      );
    }
    return out;
  }, [leads, filter, search]);

  async function changeStatus(id: string, status: LeadStatus) {
    const updated = await mockApi.updateLeadStatus(id, status);
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-3 mb-1">Лиды</h1>
          <p className="text-ink-600">
            {filtered.length} {pluralize(filtered.length, ["заявка", "заявки", "заявок"])}
          </p>
        </div>
      </div>

      <div className="bg-white border border-ink-200 rounded-card p-4 flex flex-col sm:flex-row gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени, услуге, контакту..."
          className="flex-1"
        />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as LeadStatus | "all")}
          options={statusOptions}
          className="sm:w-56"
        />
      </div>

      <div className="bg-white border border-ink-200 rounded-card overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1.5fr_1.2fr_1.5fr_1fr_1fr_140px] gap-4 px-5 py-3 bg-ink-950 text-white text-xs uppercase tracking-wider font-display">
          <span>Клиент</span>
          <span>Контакт</span>
          <span>Услуга</span>
          <span>Дата</span>
          <span>Статус</span>
          <span className="text-right">Действия</span>
        </div>

        <div className="divide-y-2 divide-ink-100">
          {filtered.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.2) }}
              className="grid grid-cols-1 md:grid-cols-[1.5fr_1.2fr_1.5fr_1fr_1fr_140px] gap-3 md:gap-4 px-5 py-4 hover:bg-ink-50 transition-colors"
            >
              <div className="md:col-span-1">
                <div className="font-display font-semibold">{l.userName}</div>
                {l.comment && (
                  <div className="text-xs text-ink-500 line-clamp-1 mt-0.5">
                    «{l.comment}»
                  </div>
                )}
              </div>
              <div className="text-sm text-ink-700 truncate">{l.userContact}</div>
              <div className="text-sm">{l.serviceName}</div>
              <div className="text-sm text-ink-500">{formatRelative(l.date)}</div>
              <div>
                <Badge tone={statusBadge[l.status].tone}>{statusBadge[l.status].label}</Badge>
              </div>
              <div className="flex justify-end gap-1">
                {l.status === "new" && (
                  <Button size="sm" variant="outline" onClick={() => changeStatus(l.id, "in_progress")}>
                    В работу
                  </Button>
                )}
                {l.status === "in_progress" && (
                  <>
                    <Button size="sm" variant="primary" onClick={() => changeStatus(l.id, "done")} title="Готово">
                      <Icon name="check" size={14} />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => changeStatus(l.id, "rejected")} title="Отклонить">
                      <Icon name="x" size={14} />
                    </Button>
                  </>
                )}
                {(l.status === "done" || l.status === "rejected") && (
                  <Button size="sm" variant="ghost" onClick={() => changeStatus(l.id, "new")}>
                    Вернуть
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-ink-500">
              <Icon name="leads" size={36} className="mx-auto mb-3 text-ink-300" />
              Заявки не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
