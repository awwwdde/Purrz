import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Modal, Select, Textarea, Icon } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Company } from "@/shared/types";
import { useAuth } from "@/app/store/auth";
import { formatPrice } from "@/shared/lib/format";

interface Props {
  open: boolean;
  onClose: () => void;
  company: Company;
  preselectServiceId?: string;
}

export function LeadModal({ open, onClose, company, preselectServiceId }: Props) {
  const user = useAuth((s) => s.user);
  const [serviceId, setServiceId] = useState(
    preselectServiceId ?? company.services[0]?.serviceId ?? "",
  );
  const [name, setName] = useState(user?.name ?? "");
  const [contact, setContact] = useState(user?.phone ?? user?.email ?? "");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preselectServiceId) setServiceId(preselectServiceId);
  }, [preselectServiceId]);

  useEffect(() => {
    if (!open) return;
    Promise.all(company.services.map((s) => mockApi.getService(s.serviceId))).then((arr) => {
      const map: Record<string, string> = {};
      arr.forEach((s) => {
        if (s) map[s.id] = s.name;
      });
      setServiceNames(map);
    });
  }, [open, company.services]);

  useEffect(() => {
    if (!open) {
      setDone(false);
      setComment("");
    }
  }, [open]);

  const selected = company.services.find((s) => s.serviceId === serviceId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !serviceId) return;
    setSubmitting(true);
    try {
      await mockApi.createLead({
        companyId: company.id,
        serviceId,
        userName: name,
        userContact: contact,
        comment,
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={done ? undefined : `Оставить заявку — ${company.name}`}
    >
      {done ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-signal-green/15 text-signal-green grid place-items-center mb-5">
            <Icon name="check" size={32} />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-2">
            Заявка отправлена!
          </h3>
          <p className="text-ink-600 mb-6">
            Компания «{company.name}» получила вашу заявку и свяжется с вами в
            ближайшее время.
          </p>
          <Button variant="primary" onClick={onClose} fullWidth>
            Закрыть
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Select
            label="Услуга"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            options={company.services.map((s) => ({
              value: s.serviceId,
              label: serviceNames[s.serviceId] ?? "Загрузка...",
            }))}
          />

          {selected && (
            <div className="bg-ink-50 border border-ink-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-ink-600">Стоимость</span>
              <div className="text-right">
                <span className="font-display font-semibold">{formatPrice(selected.price)}</span>
                {selected.discount && (
                  <span className="ml-2 text-xs text-signal-green font-semibold">
                    −{selected.discount}%
                  </span>
                )}
              </div>
            </div>
          )}

          <Input
            label="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван Петров"
            required
          />
          <Input
            label="Телефон или email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="+7 (___) ___-__-__"
            required
          />
          <Textarea
            label="Комментарий (опционально)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Уточните детали задачи, размеры, сроки..."
            rows={3}
          />

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Отправляем..." : "Отправить заявку"}
            </Button>
          </div>

          <p className="text-xs text-ink-500 text-center">
            Нажимая «Отправить», вы соглашаетесь с условиями платформы.
          </p>
        </form>
      )}
    </Modal>
  );
}
