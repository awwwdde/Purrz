import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button, Container, Icon, type IconName } from "@/shared/ui";

const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "shield-check",
    title: "Проверенные компании",
    text: "Каждый исполнитель проходит верификацию по ИНН, документам и реальным отзывам.",
  },
  {
    icon: "bolt",
    title: "Быстрая заявка",
    text: "Один отклик — и подрядчик связывается с вами в среднем за 24 часа.",
  },
  {
    icon: "trending-up",
    title: "Прозрачные цены",
    text: "Стоимость, скидки и сроки указаны заранее. Никаких сюрпризов в смете.",
  },
  {
    icon: "star",
    title: "Реальные отзывы",
    text: "Отзывы оставляют только клиенты, заказавшие услугу через платформу.",
  },
];

const stats = [
  { value: "240+", label: "проверенных компаний" },
  { value: "12 800", label: "выполненных заказов" },
  { value: "4.8", label: "средний рейтинг" },
  { value: "24/7", label: "поддержка платформы" },
];

export function WhyUs() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="eyebrow mb-3">почему мы</div>
            <h2 className="heading-2 mb-4">Платформа, которой доверяют</h2>
            <p className="text-lg text-ink-600 leading-relaxed">
              Мы соединяем заказчиков с проверенными компаниями и берём на себя
              самое скучное — поиск, проверку и сравнение.
            </p>
          </div>
          <Link to="/about">
            <Button variant="outline" iconRight={<Icon name="arrow-right" size={16} />}>
              Подробнее о сервисе
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-ink-50 border border-ink-200 rounded-card p-6 hover:bg-white hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent text-white grid place-items-center mb-5">
                <Icon name={f.icon} size={22} />
              </div>
              <h3 className="font-display text-lg font-bold mb-2 text-ink-950">{f.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats CTA band */}
        <div className="bg-ink-950 text-white rounded-card overflow-hidden relative">
          <div className="absolute inset-0 grid-pattern-dark opacity-40" />
          <div className="relative p-8 md:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="font-display text-4xl md:text-5xl font-extrabold text-accent mb-2 tracking-tight">
                  {s.value}
                </div>
                <div className="text-sm text-ink-400 font-display">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
