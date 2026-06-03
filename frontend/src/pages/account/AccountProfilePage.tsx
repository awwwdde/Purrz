/**
 * Личный кабинет — главная страница.
 *
 * Состоит из четырёх вертикальных блоков:
 *   1. Hero — аватар + имя + роль-badge + быстрые факты (email, дата
 *      регистрации, статус компании).
 *   2. «Профиль» — поля имя/email/телефон в режиме view/edit.
 *   3. «Моя компания» — единая карточка под три состояния:
 *        loaded   — превью компании + CTA «Кабинет компании» и «Как клиент»
 *        loading  — нейтральный placeholder
 *        иначе    — CTA «Разместить компанию»
 *      Состояние берём из useUserCompany — он же чистит phantom companyId.
 *   4. «Безопасность» — заглушка под смену пароля (DEMO).
 *
 * Единая стилистика: rounded-card, border ink-200, акценты на bg-accent
 * и тёмный ink-950 для CTA-блока компании.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge, Button, Icon, Input } from "@/shared/ui";
import { useAuth } from "@/app/store/auth";
import { useUserCompany } from "@/shared/lib/useUserCompany";
import { formatDate } from "@/shared/lib/format";

export function AccountProfilePage() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const { company, status } = useUserCompany();

  if (!user) return null;

  function save() {
    if (!user) return;
    setUser({ ...user, name, phone });
    setEditing(false);
  }

  // Лейбл роли — то, что увидит пользователь рядом с именем.
  const roleLabel =
    user.role === "admin"
      ? "Администратор"
      : status === "loaded"
        ? "Владелец компании"
        : "Покупатель";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ─────────────────────────────────────────────────────────────
          Hero: имя, роль, базовые факты, кнопка «Изменить»
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-ink-200 rounded-card p-6 lg:p-8 shadow-brutal-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <img
            src={user.avatar}
            alt=""
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-ink-200 object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="eyebrow mb-1">личный кабинет</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2 truncate">
              {user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{roleLabel}</Badge>
              <Badge tone="default">{user.email}</Badge>
              <Badge tone="default">
                <Icon name="calendar" size={10} />
                <span className="ml-1">с {formatDate(user.createdAt)}</span>
              </Badge>
            </div>
          </div>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              iconLeft={<Icon name="edit" size={14} />}
              className="self-start md:self-center"
            >
              Изменить
            </Button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Профиль: имя, email, телефон, дата
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-ink-200 rounded-card p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-5">
          <Icon name="user" />
          <h2 className="font-display text-lg font-semibold">Профиль</h2>
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
            value={editing ? phone : (user.phone ?? "")}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!editing}
            placeholder="+7 (___) ___-__-__"
          />
          <Input
            label="Дата регистрации"
            value={formatDate(user.createdAt)}
            disabled
          />
        </div>
        {editing && (
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setName(user.name);
                setPhone(user.phone ?? "");
                setEditing(false);
              }}
            >
              Отмена
            </Button>
            <Button onClick={save} iconRight={<Icon name="check" size={14} />}>
              Сохранить
            </Button>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          Моя компания — три состояния
         ───────────────────────────────────────────────────────────── */}
      {status === "loaded" && company ? (
        <section className="bg-ink-950 text-white rounded-card p-6 lg:p-8 border border-ink-200 shadow-brutal">
          <div className="flex items-center gap-3 mb-5">
            <Icon name="shield-check" className="text-accent" />
            <div className="eyebrow text-accent">моя компания</div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <img
              src={company.logo}
              alt=""
              className="w-16 h-16 rounded-2xl border border-accent flex-shrink-0 object-cover bg-ink-800"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl font-semibold mb-1 truncate">
                {company.name}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge tone={company.verified ? "success" : "warning"}>
                  {company.verified ? "verified" : "на модерации"}
                </Badge>
                <Badge tone="accent" className="border-accent">
                  ИНН {company.inn}
                </Badge>
              </div>
              <p className="text-sm text-ink-300">
                Управление услугами, заявками и профилем — в CRM.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:flex-shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate(`/company/${company.id}`)}
                iconRight={<Icon name="external" size={14} />}
                className="!border-ink-700 !text-white hover:!bg-ink-800"
              >
                Как клиент
              </Button>
              <Button
                size="md"
                onClick={() => navigate("/crm")}
                iconRight={<Icon name="arrow-right" size={16} />}
              >
                Кабинет компании
              </Button>
            </div>
          </div>
        </section>
      ) : status === "loading" ? (
        <section className="bg-white border border-ink-200 rounded-card p-6 lg:p-8 animate-pulse">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-ink-100 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-ink-100 rounded w-1/3" />
              <div className="h-3 bg-ink-100 rounded w-2/3" />
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white border-2 border-dashed border-ink-300 rounded-card p-6 lg:p-8 hover:border-ink-950 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-accent border border-ink-200 grid place-items-center flex-shrink-0">
              <Icon name="building" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-semibold mb-1">
                У вас ещё нет компании
              </h3>
              <p className="text-ink-600">
                Разместите свою компанию на Purrz — клиенты увидят её в каталоге,
                а заявки придут прямо в CRM. Достаточно ИНН, остальное подгрузим.
              </p>
            </div>
            <Button
              size="md"
              onClick={() => navigate("/register-company")}
              iconRight={<Icon name="arrow-right" size={16} />}
              className="md:flex-shrink-0"
            >
              Разместить компанию
            </Button>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          Безопасность: пока DEMO-заглушка
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-ink-200 rounded-card p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-5">
          <Icon name="shield-check" />
          <h2 className="font-display text-lg font-semibold">Безопасность</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            disabled
            className="text-left p-4 rounded-card border border-ink-200 bg-ink-50 cursor-not-allowed opacity-70"
          >
            <div className="font-display font-semibold mb-1">Смена пароля</div>
            <div className="text-xs text-ink-500">
              В следующем релизе. Сейчас пароли не хранятся локально.
            </div>
          </button>
          <button
            disabled
            className="text-left p-4 rounded-card border border-ink-200 bg-ink-50 cursor-not-allowed opacity-70"
          >
            <div className="font-display font-semibold mb-1">Двухфакторка</div>
            <div className="text-xs text-ink-500">
              В планах: TOTP через приложение-аутентификатор.
            </div>
          </button>
        </div>
      </section>
    </motion.div>
  );
}
