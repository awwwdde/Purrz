import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge, Button, Icon, Input } from "@/shared/ui";
import { useAuth } from "@/app/store/auth";
import { realApi } from "@/shared/api/api";
import type { Company } from "@/shared/types";
import { formatDate } from "@/shared/lib/format";

export function AccountProfilePage() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (user?.companyId) {
      // user.companyId с бэка приходит как number; realApi.getCompany ждёт
      // string-id (или null/undefined). Приводим явно.
      realApi.getCompany(String(user.companyId)).then((c) => setCompany(c ?? null));
    } else {
      setCompany(null);
    }
  }, [user?.companyId]);

  if (!user) return null;

  function save() {
    if (!user) return;
    setUser({ ...user, name, phone });
    setEditing(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="heading-3 mb-1">Личный кабинет</h1>
        <p className="text-ink-600">Управляйте профилем, заявками и компанией</p>
      </div>

      {/* Профиль */}
      <div className="bg-white border border-ink-200 rounded-card p-6 lg:p-8">
        <div className="flex items-start gap-5 mb-8">
          <img
            src={user.avatar}
            alt=""
            className="w-20 h-20 rounded-2xl border border-ink-200"
          />
          <div className="flex-1">
            <h2 className="font-display text-2xl font-semibold mb-1">
              {user.name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="default">{user.email}</Badge>
              {company ? (
                <Badge tone="accent">Владелец компании</Badge>
              ) : (
                <Badge tone="accent">Покупатель</Badge>
              )}
            </div>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} iconLeft={<Icon name="edit" size={14} />}>
              Изменить
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Имя"
            value={editing ? name : user.name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editing}
          />
          <Input
            label="Email"
            value={user.email}
            disabled
            hint="Email нельзя изменить"
          />
          <Input
            label="Телефон"
            value={editing ? phone : user.phone ?? ""}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!editing}
            placeholder="+7 (___) ___-__-__"
          />
          <Input label="Дата регистрации" value={formatDate(user.createdAt)} disabled />
        </div>

        {editing && (
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditing(false)}>
              Отмена
            </Button>
            <Button onClick={save}>Сохранить</Button>
          </div>
        )}
      </div>

      {/* Моя компания — без аналитики, только переход в кабинет */}
      {company ? (
        <div className="bg-ink-950 text-white rounded-card p-6 lg:p-8 border border-ink-200 shadow-brutal">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="shield-check" className="text-accent" />
            <div className="eyebrow text-accent">моя компания</div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <img
              src={company.logo}
              alt=""
              className="w-16 h-16 rounded-2xl border border-accent flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl font-semibold mb-1 truncate">
                {company.name}
              </h3>
              <p className="text-sm text-ink-300">
                Управление услугами, заявками и профилем — в кабинете компании.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:flex-shrink-0">
              <Button
                size="md"
                onClick={() => navigate("/crm")}
                iconRight={<Icon name="arrow-right" size={16} />}
              >
                Перейти в профиль компании
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-ink-300 rounded-card p-6 lg:p-8 hover:border-ink-950 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-accent border border-ink-200 grid place-items-center flex-shrink-0">
              <Icon name="building" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-semibold mb-1">
                У вас ещё нет компании
              </h3>
              <p className="text-ink-600">
                Разместите свою компанию на Purrz и начните получать заявки от клиентов.
                Достаточно ИНН — остальные данные подгрузим автоматически.
              </p>
            </div>
            <Button
              size="md"
              onClick={() => navigate("/register-company")}
              iconRight={<Icon name="arrow-right" size={16} />}
            >
              Разместить компанию
            </Button>
          </div>
        </div>
      )}

      {/* Безопасность */}
      <div className="bg-white border border-ink-200 rounded-card p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="shield-check" />
          <div className="eyebrow">безопасность</div>
        </div>
        <h3 className="font-display text-xl font-semibold mb-2">DEMO-аккаунт</h3>
        <p className="text-ink-600 text-sm mb-4">
          В демо-версии все данные хранятся локально в браузере. В продакшене
          здесь будут пароли, 2FA и сессии.
        </p>
        <Button variant="outline" size="sm" disabled>
          Скоро
        </Button>
      </div>
    </motion.div>
  );
}
