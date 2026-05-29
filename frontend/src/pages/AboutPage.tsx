import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Container, Icon, type IconName } from "@/shared/ui";

const stats = [
  { v: "240+", k: "проверенных компаний" },
  { v: "12 800", k: "выполненных заказов" },
  { v: "4.8", k: "средний рейтинг" },
  { v: "<24 ч", k: "первый отклик" },
];

const principles: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "shield-check",
    title: "Проверяем каждого исполнителя",
    text:
      "Перед публикацией мы сверяем компанию по ИНН в открытых реестрах, запрашиваем документы и проверяем портфолио. Карточка получает отметку «Проверена» только после ручной модерации.",
  },
  {
    icon: "bolt",
    title: "Заявка занимает минуту",
    text:
      "Никаких регистраций перед заказом. Выбираете услугу, указываете контакты и комментарий — заявка уходит напрямую в кабинет компании. Менеджер перезванивает в среднем за 24 часа.",
  },
  {
    icon: "trending-up",
    title: "Прозрачные цены",
    text:
      "Стоимость, скидки и состав работ указаны до отправки заявки. Подрядчик подписывает фиксированную смету в договоре — ни рубля сверху без согласования.",
  },
  {
    icon: "star",
    title: "Отзывы только от реальных клиентов",
    text:
      "Отзыв можно оставить только после завершённой через платформу заявки. Накрутки и фейковые аккаунты исключены технически.",
  },
];

const steps = [
  {
    n: "01",
    title: "Выбираете услугу",
    text: "Просматриваете каталог по категориям или ищете напрямую то, что нужно.",
  },
  {
    n: "02",
    title: "Сравниваете компании",
    text: "Цены, скидки, рейтинг, отзывы, годы на рынке — всё на одном экране, без переходов на 10 сайтов.",
  },
  {
    n: "03",
    title: "Оставляете заявку",
    text: "Один отклик попадает в CRM компании. Подрядчик связывается с вами сам.",
  },
  {
    n: "04",
    title: "Получаете услугу",
    text: "После выполнения заявки оставляете отзыв — он попадает в карточку компании и помогает другим клиентам.",
  },
];

export function AboutPage() {
  return (
    <>
      {/* Hero страницы */}
      <section className="bg-ink-50 grid-pattern noise border-b border-ink-200">
        <Container className="py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="eyebrow mb-4">о сервисе</div>
            <h1 className="heading-1 mb-6">
              Реестр инженерных подрядчиков{" "}
              <span className="relative inline-block">
                <span className="relative z-10">без посредников</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-accent z-0" />
              </span>
              .
            </h1>
            <p className="text-lg md:text-xl text-ink-600 leading-relaxed mb-8">
              Purrz помогает находить компании по нужной услуге, сравнивать
              предложения и заказывать работы напрямую. Мы не берём процент с
              заказов и не перепродаём контакты — зарабатываем на инструментах
              для подрядчиков.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalog">
                <Button size="lg" iconRight={<Icon name="arrow-right" size={18} />}>
                  Открыть каталог
                </Button>
              </Link>
              <Link to="/for-business">
                <Button variant="outline" size="lg">
                  Я представляю компанию
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Цифры */}
      <section className="py-20 lg:py-24 bg-ink-950 text-white">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.k}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="font-display text-4xl md:text-5xl font-bold text-accent mb-2 tracking-tight">
                  {s.v}
                </div>
                <div className="text-sm text-ink-400 uppercase tracking-wider font-display">
                  {s.k}
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Принципы */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="max-w-2xl mb-12">
            <div className="eyebrow mb-3">принципы</div>
            <h2 className="heading-2">Почему это работает иначе</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {principles.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white border border-ink-200 rounded-card p-7"
              >
                <div className="w-12 h-12 rounded-xl bg-accent grid place-items-center border border-ink-200 mb-5">
                  <Icon name={p.icon} size={22} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{p.title}</h3>
                <p className="text-ink-600 leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Как это работает */}
      <section className="py-20 lg:py-28 bg-ink-50 border-y border-ink-200">
        <Container>
          <div className="max-w-2xl mb-12">
            <div className="eyebrow mb-3">как это работает</div>
            <h2 className="heading-2">От поиска до завершения работ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white border border-ink-200 rounded-card p-7 relative"
              >
                <div className="absolute -top-3 -left-3 w-12 h-12 bg-accent border border-ink-200 rounded-full grid place-items-center font-display font-bold text-lg shadow-brutal-sm">
                  {s.n}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 mt-5">{s.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA блок */}
      <section className="py-20 lg:py-24">
        <Container>
          <div className="bg-ink-950 text-white rounded-card border border-ink-200 shadow-brutal p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <div className="eyebrow text-accent mb-3">готовы начать?</div>
              <h2 className="heading-2 text-white mb-4">
                Найдите подходящую компанию за 2 минуты
              </h2>
              <p className="text-ink-300 leading-relaxed max-w-lg">
                Откройте каталог — фильтры по цене, рейтингу и скидкам помогут
                выбрать исполнителя для любой задачи.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link to="/catalog">
                <Button size="lg" fullWidth iconRight={<Icon name="arrow-right" size={18} />}>
                  Открыть каталог
                </Button>
              </Link>
              <Link to="/help">
                <Button variant="outline" size="lg" fullWidth>
                  Частые вопросы
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
