import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Badge, Button, Container, Icon, Input, Textarea } from "@/shared/ui";
import { realApi } from "@/shared/api/api";
import type { Company, InnLookupResult } from "@/shared/types";
import { useAuth } from "@/app/store/auth";

type Step = 1 | 2 | 3;

export function RegisterCompanyPage() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  // После создания компании дёргаем hydrate() — он перечитает /api/auth/me
  // и обновит user.companyId + role на актуальные с бэка. Это надёжнее, чем
  // локально подменять через attachCompany (мок-эпоха, фейк-id).
  const hydrate = useAuth((s) => s.hydrate);

  const [existingCompany, setExistingCompany] = useState<Company | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [step, setStep] = useState<Step>(1);
  const [inn, setInn] = useState("");
  const [lookup, setLookup] = useState<InnLookupResult | null>(null);
  const [looking, setLooking] = useState(false);
  const [innErr, setInnErr] = useState<string | null>(null);

  // Шаг 2 — карточка компании
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Если у пользователя уже привязана компания — показываем редирект-блок
  useEffect(() => {
    if (!user?.companyId) {
      setCheckingExisting(false);
      return;
    }
    realApi.getCompany(String(user.companyId)).then((c) => {
      if (c) setExistingCompany(c);
      setCheckingExisting(false);
    });
  }, [user?.companyId]);

  async function doLookup() {
    setInnErr(null);
    setLooking(true);
    try {
      const res = await realApi.lookupInn(inn);
      setLookup(res);
      setName(res.name);
      setDescription(
        `Компания «${res.name}» работает с ${new Date(res.registeredAt).getFullYear()} года.`,
      );
      setEmail(user?.email ?? "");
      setPhone(user?.phone ?? "");
      setStep(2);
    } catch (e) {
      setInnErr((e as Error).message);
    } finally {
      setLooking(false);
    }
  }

  async function submit() {
    if (!lookup || !user) return;
    setSubmitting(true);
    try {
      await realApi.createCompany({
        name,
        inn: lookup.inn,
        description,
        logo:
          logo ||
          `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0A0A0B&textColor=D6FF3D`,
        banner:
          banner ||
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80",
        discount: 0,
        contacts: { phone, email },
        address: lookup.address,
        services: [],
        gallery: [],
        yearsOnMarket:
          new Date().getFullYear() - new Date(lookup.registeredAt).getFullYear(),
        verified: false,
      });
      // Бэк сам привязал компанию к юзеру и поднял роль до company_manager.
      // Перечитываем /me чтобы zustand-store увидел свежие companyId+role.
      await hydrate();
      setStep(3);
    } catch (e) {
      setInnErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  // Состояние «уже есть компания» — нельзя создать вторую
  if (checkingExisting) {
    return (
      <Container className="py-20">
        <div className="text-center text-ink-500">Загрузка...</div>
      </Container>
    );
  }

  if (existingCompany) {
    return (
      <Container className="py-12 lg:py-16">
        <div className="max-w-2xl mx-auto bg-white border border-ink-200 rounded-card p-8 lg:p-10 shadow-brutal">
          <Badge tone="info" className="mb-4">
            <Icon name="shield-check" size={10} /> у вас уже есть компания
          </Badge>
          <h1 className="font-display text-3xl font-semibold mb-2">
            «{existingCompany.name}» уже размещена на платформе
          </h1>
          <p className="text-ink-600 mb-6">
            Один пользователь может управлять только одной компанией. Откройте
            кабинет компании, чтобы редактировать услуги и видеть заявки.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="lg"
              onClick={() => navigate("/crm")}
              iconRight={<Icon name="arrow-right" size={18} />}
            >
              Открыть кабинет компании
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/account")}>
              В личный кабинет
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Кто размещает */}
        {user && (
          <div className="mb-6 flex items-center gap-3 bg-white border border-ink-200 rounded-card px-4 py-3 shadow-brutal-sm">
            <img
              src={user.avatar}
              alt=""
              className="w-9 h-9 rounded-full border border-ink-200"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-ink-500">Размещаете от имени</div>
              <div className="font-display font-semibold truncate">
                {user.name} <span className="text-ink-500 font-normal">· {user.email}</span>
              </div>
            </div>
            <Link
              to="/account"
              className="text-xs font-display font-semibold text-ink-700 hover:text-ink-950"
            >
              Сменить аккаунт →
            </Link>
          </div>
        )}

        {/* Шаги */}
        <div className="flex items-center justify-between mb-8">
          {[
            { n: 1, label: "ИНН" },
            { n: 2, label: "О компании" },
            { n: 3, label: "Готово" },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full border border-ink-200 grid place-items-center font-display font-bold text-sm transition-colors ${
                    step >= s.n ? "bg-ink-950 text-accent" : "bg-white text-ink-400"
                  }`}
                >
                  {step > s.n ? <Icon name="check" size={16} /> : s.n}
                </div>
                <span className="text-xs mt-1 font-display font-semibold text-ink-600 hidden sm:block">
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    step > s.n ? "bg-ink-950" : "bg-ink-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="bg-white border border-ink-200 rounded-card p-8 shadow-brutal"
            >
              <div className="mb-6">
                <h1 className="font-display text-3xl font-semibold mb-2">
                  Разместить компанию
                </h1>
                <p className="text-ink-600">
                  Введите ИНН — мы автоматически подгрузим данные из реестра.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="ИНН"
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                  placeholder="10 или 12 цифр"
                  inputMode="numeric"
                  hint="Для демо подойдут любые 10–12 цифр — данные сгенерируются автоматически."
                  error={innErr ?? undefined}
                />
                <Button
                  fullWidth
                  size="lg"
                  onClick={doLookup}
                  disabled={looking || inn.replace(/\D/g, "").length < 10}
                  iconRight={!looking && <Icon name="arrow-right" size={18} />}
                >
                  {looking ? "Ищем в реестре..." : "Найти компанию"}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && lookup && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="bg-white border border-ink-200 rounded-card p-8 shadow-brutal"
            >
              <Badge tone="success" className="mb-4">
                <Icon name="check" size={10} /> Найдено в реестре
              </Badge>
              <h2 className="font-display text-2xl font-semibold mb-1">{lookup.name}</h2>
              <div className="text-sm text-ink-500 mb-6 space-y-0.5">
                <div>ИНН: <span className="font-mono">{lookup.inn}</span></div>
                <div>ОГРН: <span className="font-mono">{lookup.ogrn}</span></div>
                <div>Адрес: {lookup.address}</div>
                <div>Директор: {lookup.director}</div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Название (как показывать клиентам)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Textarea
                  label="Описание компании"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Расскажите, чем занимаетесь и в чём ваша сила"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Телефон"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                  />
                  <Input
                    label="Контактный email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@company.ru"
                    hint="На этот адрес будут приходить уведомления о заявках"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Ссылка на логотип (необязательно)"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://..."
                  />
                  <Input
                    label="Ссылка на баннер (необязательно)"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>
                  Назад
                </Button>
                <Button
                  className="flex-1"
                  onClick={submit}
                  disabled={submitting || !name}
                  iconRight={!submitting && <Icon name="arrow-right" size={18} />}
                >
                  {submitting ? "Создаём..." : "Создать компанию"}
                </Button>
              </div>

              <p className="text-xs text-ink-500 mt-4 text-center">
                Управлять компанией сможете вы — <span className="font-semibold">{user?.email}</span>.
                Позже можно будет добавить других сотрудников.
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-ink-200 rounded-card p-10 shadow-brutal text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-accent grid place-items-center border border-ink-200 mb-5">
                <Icon name="check" size={36} />
              </div>
              <h2 className="font-display text-3xl font-semibold mb-3">
                Компания создана!
              </h2>
              <p className="text-ink-600 mb-8 max-w-md mx-auto">
                Теперь добавьте услуги, цены и фотографии в кабинете компании — и
                карточка станет видна клиентам.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/crm")}
                  iconRight={<Icon name="arrow-right" size={18} />}
                >
                  Открыть кабинет компании
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/account")}>
                  В личный кабинет
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Container>
  );
}
