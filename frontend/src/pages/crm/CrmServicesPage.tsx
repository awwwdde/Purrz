import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, Icon, Input, Modal, Select } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Company, CompanyService, Service } from "@/shared/types";
import { useAuth } from "@/app/store/auth";
import { formatPrice } from "@/shared/lib/format";

export function CrmServicesPage() {
  const user = useAuth((s) => s.user);
  const [company, setCompany] = useState<Company | null>(null);
  const [catalog, setCatalog] = useState<Service[]>([]);
  const [serviceMap, setServiceMap] = useState<Record<string, Service>>({});
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<CompanyService | null>(null);

  const [form, setForm] = useState<{ serviceId: string; price: string; discount: string }>({
    serviceId: "",
    price: "",
    discount: "",
  });

  useEffect(() => {
    if (!user?.companyId) return;
    mockApi.getCompany(user.companyId).then((c) => setCompany(c ?? null));
    mockApi.listServices().then((arr) => {
      setCatalog(arr);
      const map: Record<string, Service> = {};
      arr.forEach((s) => (map[s.id] = s));
      setServiceMap(map);
    });
  }, [user?.companyId]);

  function openAdd() {
    setEditing(null);
    setForm({ serviceId: catalog[0]?.id ?? "", price: "", discount: "" });
    setAdding(true);
  }

  function openEdit(cs: CompanyService) {
    setEditing(cs);
    setForm({
      serviceId: cs.serviceId,
      price: String(cs.price),
      discount: cs.discount ? String(cs.discount) : "",
    });
    setAdding(true);
  }

  async function save() {
    if (!company) return;
    const price = Number(form.price);
    if (!form.serviceId || !Number.isFinite(price) || price <= 0) return;
    const discount = form.discount ? Number(form.discount) : undefined;

    const next: CompanyService[] = editing
      ? company.services.map((s) =>
          s.serviceId === editing.serviceId
            ? { serviceId: form.serviceId, price, discount }
            : s,
        )
      : [
          ...company.services.filter((s) => s.serviceId !== form.serviceId),
          { serviceId: form.serviceId, price, discount },
        ];

    const updated = await mockApi.updateCompany(company.id, { services: next });
    setCompany(updated);
    setAdding(false);
  }

  async function remove(serviceId: string) {
    if (!company) return;
    const next = company.services.filter((s) => s.serviceId !== serviceId);
    const updated = await mockApi.updateCompany(company.id, { services: next });
    setCompany(updated);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-3 mb-1">Услуги</h1>
          <p className="text-ink-600">
            Управляйте каталогом услуг — цены, скидки, описание
          </p>
        </div>
        <Button onClick={openAdd} iconLeft={<Icon name="plus" size={16} />}>
          Добавить услугу
        </Button>
      </div>

      {company && company.services.length === 0 && (
        <div className="bg-white border border-ink-200 rounded-card p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-ink-100 grid place-items-center mb-4">
            <Icon name="bolt" size={28} className="text-ink-500" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">Услуги ещё не добавлены</h3>
          <p className="text-ink-600 mb-5">
            Добавьте первую услугу — без неё клиенты не смогут оставить заявку.
          </p>
          <Button onClick={openAdd} iconLeft={<Icon name="plus" size={16} />}>
            Добавить услугу
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {company?.services.map((cs, i) => {
          const svc = serviceMap[cs.serviceId];
          return (
            <motion.div
              key={cs.serviceId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white border border-ink-200 rounded-card p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-display text-lg font-semibold">
                    {svc?.name ?? cs.serviceId}
                  </h3>
                  {cs.discount && <Badge tone="accent">−{cs.discount}%</Badge>}
                </div>
                {svc && (
                  <div className="text-sm text-ink-500 line-clamp-1">{svc.description}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-ink-500">Цена</div>
                <div className="font-display text-xl font-bold">{formatPrice(cs.price)}</div>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => openEdit(cs)}>
                  <Icon name="edit" size={14} />
                </Button>
                <Button size="sm" variant="danger" onClick={() => remove(cs.serviceId)}>
                  <Icon name="trash" size={14} />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title={editing ? "Редактировать услугу" : "Добавить услугу"}
      >
        <div className="space-y-4">
          <Select
            label="Услуга из каталога"
            value={form.serviceId}
            onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
            options={catalog.map((s) => ({ value: s.id, label: s.name }))}
            disabled={!!editing}
          />
          {form.serviceId && serviceMap[form.serviceId] && (
            <div className="bg-ink-50 border border-ink-200 rounded-lg p-3 text-xs text-ink-600">
              Рекомендуемая вилка: {formatPrice(serviceMap[form.serviceId].minPrice)} —{" "}
              {formatPrice(serviceMap[form.serviceId].maxPrice)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ваша цена ₽"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="8500"
            />
            <Input
              label="Скидка % (опц.)"
              type="number"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              placeholder="10"
              max={90}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setAdding(false)} className="flex-1">
              Отмена
            </Button>
            <Button onClick={save} className="flex-1">
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
