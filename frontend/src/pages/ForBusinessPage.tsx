import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Container, Icon, type IconName } from "@/shared/ui";

const benefits: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "leads",
    title: "Заявки в одном окне",
    text:
      "Все обращения клиентов попадают в кабинет компании со статусами «новая / в работе / завершена / отклонена». Не нужно следить за десятком мессенджеров.",
  },
  {
    icon: "analytics",
    title: "Аналитика по карточке",
    text:
      "Просмотры, клики, конверсия в заявки, топ услуг — данные за 14 дней с динамикой. Видно, какие услуги «продают» лучше других.",
  },
  {
    icon: "bolt",
    title: "Управление услугами",
    text:
      "Добавляйте услуги из общего каталога, ставьте свои цены и скидки. Каталог обновляется — клиент сразу видит актуальный прайс.",
  },
  {
    icon: "shield-check",
    title: "Без комиссии с заказов",
    text:
      "Мы не берём процент с выполненных работ и не перепродаём контакты. Заявка приходит напрямую — договор и оплата только между вами и клиентом.",
  },
  {
    icon: "star",
    title: "Реальные отзывы",
    text:
      "Отзывы можно оставить только после реальной заявки через платформу. Это защищает компанию от накруток и недобросовестных конкурентов.",
  },
  {
    icon: "eye",
    title: "Видимость в каталоге",
    text:
      "Карточка с фотографиями работ, описанием и скидками показывается клиентам, которые ищут именно вашу услугу в вашем городе.",
  },
];

const onboarding = [
  {
    n: "01",
    title: "Регистрируете аккаунт",
    text:
      "Достаточно email и пароля. Никаких заявок на модерацию перед регистрацией — это пять минут.",
  },
  {
    n: "02",
    title: "Подгружаем данные по ИНН",
    text:
      "Вводите ИНН — система автоматически подтягивает название, адрес, ОГРН и дату регистрации компании.",
  },
  {
    n: "03",
    title: "Заполняете профиль",
    text:
      "Логотип, баннер, описание, услуги с ценами, скидки, фотографии работ. Это занимает 20–30 минут.",
  },
  {
    n: "04",
    title: "Проходите верификацию",
    text:
      "Модераторы проверяют документы и портфолио в течение 2 рабочих дней. После — карточка получает отметку «Проверена» и публикуется.",
  },
];

const pricing = [
  {
    name: "Старт",
    price: "Бесплатно",
    suffix: "",
    desc: "Чтобы попробовать платформу и получить первых клиентов",
    features: [
      "До 5 услуг в каталоге",
      "До 20 заявок в месяц",
      "Базовая аналитика за 7 дней",
      "Отметка «Проверена» после модерации",
    ],
    cta: "Начать бесплатно",
    tone: "default" as const,
  },
  {
    name: "Бизнес",
    price: "2 900",
    suffix: "₽ / мес",
    desc: "Для активных компаний с регулярным потоком клиентов",
    features: [
      "Неограниченное число услуг",
      "Неограниченное число заявок",
      "Расширенная аналитика за 90 дней",
      "Приоритет в каталоге и поиске",
      "Скидки и акции на карточке",
      "Поддержка в течение 4 часов",
    ],
    cta: "Выбрать тариф",
    tone: "accent" as const,
    highlight: true,
  },
  {
    name: "Корпорация",
    price: "По запросу",
    suffix: "",
    desc: "Для сетевых компаний с несколькими филиалами",
    features: [
      "Всё из тарифа «Бизнес»",
      "Несколько филиалов в одном аккаунте",
      "Несколько менеджеров с правами",
      "Интеграция с вашей CRM по API",
      "Персональный менеджер",
    ],
    cta: "Связаться",
    tone: "default" as const,
  },
];

export function ForBusinessPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink-950 text-white grid-pattern-dark border-b border-ink-200 relative overflow-hidden">
        <Container className="py-20 lg:py-28 relative">
          <div className="max-w-3xl">
            <div className="eyebrow text-accent mb-4">для компаний</div>
            <h1 className="heading-1 text-white mb-6">
              Заявки от клиентов{" "}
              <span className="text-accent">без посредников</span>{" "}
              и без комиссий
            </h1>
            <p className="text-lg md:text-xl text-ink-300 leading-relaxed mb-8 max-w-2xl">
              Разместите компанию в реестре Purrz, чтобы получать клиентов из
              каталога. Платите только за инструменты — мы не берём процент с
              ваших заказов.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register-company">
                <Button size="lg" iconRight={<Icon name="arrow-right" size={18} />}>
                  Разместить компанию
                </Button>
              </Link>
              <a href="#tariffs">
                <Button variant="outline" size="lg" className="!bg-transparent !text-white !border-white hover:!bg-white hover:!text-ink-950">
                  Посмотреть тарифы
                </Button>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Преимущества */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="max-w-2xl mb-12">
            <div className="eyebrow mb-3">возможности</div>
            <h2 className="heading-2">Что вы получаете в кабинете</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white border border-ink-200 rounded-card p-6 hover:shadow-lift hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-accent grid place-items-center border border-ink-200 mb-5">
                  <Icon name={b.icon} size={22} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{b.text}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Онбординг */}
      <section className="py-20 lg:py-28 bg-ink-50 border-y border-ink-200">
        <Container>
          <div className="max-w-2xl mb-12">
            <div className="eyebrow mb-3">как разместиться</div>
            <h2 className="heading-2">От регистрации до первой заявки</h2>
            <p className="text-ink-600 mt-4 text-lg">
              Полный путь от создания аккаунта до публикации карточки занимает
              в среднем один рабочий день.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {onboarding.map((s) => (
              <div
                key={s.n}
                className="bg-white border border-ink-200 rounded-card p-6 relative"
              >
                <div className="absolute -top-3 -left-3 w-12 h-12 bg-accent border border-ink-200 rounded-full grid place-items-center font-display font-bold text-lg shadow-brutal-sm">
                  {s.n}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 mt-5">{s.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Тарифы */}
      <section id="tariffs" className="py-20 lg:py-28">
        <Container>
          <div className="max-w-2xl mb-12">
            <div className="eyebrow mb-3">тарифы</div>
            <h2 className="heading-2">Прозрачные тарифы без скрытых сборов</h2>
            <p className="text-ink-600 mt-4 text-lg">
              Никаких процентов с заказов. Фиксированная подписка или
              индивидуальный план для крупных компаний.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pricing.map((p) => (
              <div
                key={p.name}
                className={`rounded-card p-7 border border-ink-200 ${
                  p.highlight
                    ? "bg-accent shadow-brutal"
                    : "bg-white shadow-brutal-sm"
                }`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-display text-xl font-bold">{p.name}</h3>
                  {p.highlight && (
                    <span className="text-xs font-display font-bold uppercase tracking-wider bg-ink-950 text-accent px-2 py-1 rounded-full">
                      популярный
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-4xl font-bold tracking-tight">
                    {p.price}
                  </span>
                  {p.suffix && (
                    <span className="font-display text-sm text-ink-700">{p.suffix}</span>
                  )}
                </div>
                <p className="text-sm text-ink-700 mb-5 min-h-[42px]">{p.desc}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Icon name="check" size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register-company">
                  <Button
                    fullWidth
                    variant={p.highlight ? "secondary" : "outline"}
                  >
                    {p.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ short */}
      <section className="py-20 bg-ink-50 border-t border-ink-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
            <div>
              <div className="eyebrow mb-3">остались вопросы</div>
              <h2 className="heading-3 mb-4">
                Свяжитесь с командой Purrz
              </h2>
              <p className="text-ink-600 mb-6">
                Мы отвечаем в рабочие дни с 10:00 до 19:00 по Москве.
                Подскажем, какой тариф подойдёт, и поможем правильно оформить карточку.
              </p>
              <div className="space-y-2 text-sm">
                <a
                  href="mailto:business@purrz.demo"
                  className="flex items-center gap-2 font-semibold hover:text-ink-700"
                >
                  <Icon name="mail" size={16} /> business@purrz.demo
                </a>
                <a
                  href="tel:+74950000000"
                  className="flex items-center gap-2 font-semibold hover:text-ink-700"
                >
                  <Icon name="phone" size={16} /> +7 (495) 000-00-00
                </a>
              </div>
            </div>

            <div className="bg-white border border-ink-200 rounded-card p-7 lg:p-10 shadow-brutal">
              <h3 className="font-display text-2xl font-semibold mb-4">
                Готовы попробовать?
              </h3>
              <p className="text-ink-600 mb-6">
                Тариф «Старт» полностью бесплатный. До 5 услуг и 20 заявок в
                месяц — этого хватит, чтобы оценить платформу и получить
                первых клиентов.
              </p>
              <Link to="/register-company">
                <Button size="lg" fullWidth iconRight={<Icon name="arrow-right" size={18} />}>
                  Разместить компанию
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
