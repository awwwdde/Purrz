import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, Icon, Input, Rating, Textarea } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Company } from "@/shared/types";
import { useAuth } from "@/app/store/auth";

export function CrmProfilePage() {
  const user = useAuth((s) => s.user);
  const [company, setCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    site: "",
    address: "",
    discount: "0",
    logo: "",
    banner: "",
  });

  useEffect(() => {
    if (!user?.companyId) return;
    mockApi.getCompany(user.companyId).then((c) => {
      if (!c) return;
      setCompany(c);
      setForm({
        name: c.name,
        description: c.description,
        phone: c.contacts.phone,
        email: c.contacts.email,
        site: c.contacts.site ?? "",
        address: c.address,
        discount: String(c.discount),
        logo: c.logo,
        banner: c.banner,
      });
    });
  }, [user?.companyId]);

  async function save() {
    if (!company) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await mockApi.updateCompany(company.id, {
        name: form.name,
        description: form.description,
        address: form.address,
        discount: Number(form.discount) || 0,
        logo: form.logo,
        banner: form.banner,
        contacts: {
          phone: form.phone,
          email: form.email,
          site: form.site || undefined,
        },
      });
      setCompany(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (!company) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      <div>
        <h1 className="heading-3 mb-1">Профиль компании</h1>
        <p className="text-ink-600">Эта информация видна клиентам на карточке</p>
      </div>

      {/* Banner preview */}
      <div className="relative h-44 rounded-card overflow-hidden border border-ink-200">
        <img src={form.banner} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-end gap-3">
          <img
            src={form.logo}
            alt=""
            className="w-16 h-16 rounded-2xl border border-accent"
          />
          <div className="text-white">
            <div className="font-display text-xl font-semibold">{form.name}</div>
            <div className="flex items-center gap-2 text-sm">
              <Rating value={company.rating} reviews={company.reviewsCount} size="sm" className="!text-white" />
              {company.verified && (
                <Badge tone="accent" className="border-accent">
                  <Icon name="check" size={10} /> verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-ink-200 rounded-card p-6 lg:p-8 space-y-4">
        <h2 className="font-display text-lg font-semibold">Основное</h2>
        <Input
          label="Название"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Textarea
          label="Описание"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
        />
        <Input
          label="Адрес"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="ИНН"
            value={company.inn}
            disabled
            hint="ИНН нельзя изменить"
          />
          <Input
            label="Скидка по умолчанию %"
            type="number"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
          />
          <Input
            label="Год основания"
            value={String(new Date().getFullYear() - company.yearsOnMarket)}
            disabled
          />
        </div>
      </div>

      <div className="bg-white border border-ink-200 rounded-card p-6 lg:p-8 space-y-4">
        <h2 className="font-display text-lg font-semibold">Контакты</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Телефон"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <Input
          label="Сайт (опционально)"
          value={form.site}
          onChange={(e) => setForm({ ...form, site: e.target.value })}
        />
      </div>

      <div className="bg-white border border-ink-200 rounded-card p-6 lg:p-8 space-y-4">
        <h2 className="font-display text-lg font-semibold">Медиа</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="URL логотипа"
            value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
          />
          <Input
            label="URL баннера"
            value={form.banner}
            onChange={(e) => setForm({ ...form, banner: e.target.value })}
          />
        </div>
        <div className="text-xs text-ink-500">
          DEMO: в продакшене здесь будет загрузка файлов в S3.
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex justify-end items-center gap-3 bg-white border border-ink-200 rounded-card px-5 py-3 shadow-brutal">
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-signal-green font-display font-semibold inline-flex items-center gap-1"
          >
            <Icon name="check" size={14} /> Сохранено
          </motion.div>
        )}
        <Button onClick={save} disabled={saving} iconRight={!saving && <Icon name="check" size={16} />}>
          {saving ? "Сохраняем..." : "Сохранить изменения"}
        </Button>
      </div>
    </motion.div>
  );
}
