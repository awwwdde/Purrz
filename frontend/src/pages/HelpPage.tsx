import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Container, Icon } from "@/shared/ui";

type FaqGroup = {
  group: string;
  items: { q: string; a: string }[];
};

const faq: FaqGroup[] = [
  {
    group: "Для клиентов",
    items: [
      {
        q: "Нужно ли регистрироваться, чтобы оставить заявку?",
        a: "Нет. Найдите подходящую компанию в каталоге, выберите услугу и заполните форму — заявка уйдёт напрямую в кабинет подрядчика. Регистрация нужна только для того, чтобы видеть историю своих заявок и оставлять отзывы.",
      },
      {
        q: "Кому именно я отправляю заявку?",
        a: "Заявка попадает в кабинет компании, чью карточку вы открыли. Никаких посредников, колл-центров и перепродажи контактов: данные видит только тот подрядчик, которого вы сами выбрали.",
      },
      {
        q: "Можно ли отправить одну заявку нескольким компаниям сразу?",
        a: "Нет. Это ограничение работает в обе стороны: вы получаете персональное предложение, а компания знает, что заявка адресована именно ей, и оперативно отвечает. При желании просто отправьте заявки нескольким исполнителям и сравните ответы.",
      },
      {
        q: "Как я могу быть уверен в подрядчике?",
        a: "Каждая компания с отметкой «Проверена» прошла проверку по ИНН, документам и портфолио. У карточки указан рейтинг, количество и даты отзывов, годы на рынке и адрес офиса. Отзывы оставляют только клиенты, заказавшие услугу через платформу.",
      },
      {
        q: "Что делать, если подрядчик не вышел на связь?",
        a: "Напишите нам на support@purrz.demo, мы выясним причину и при необходимости снизим компании рейтинг или снимем её с публикации. Время первого ответа от компаний в среднем меньше 24 часов.",
      },
    ],
  },
  {
    group: "Для компаний",
    items: [
      {
        q: "Сколько стоит размещение компании?",
        a: "Тариф «Старт» полностью бесплатный: до 5 услуг и 20 заявок в месяц. Для активных компаний есть тариф «Бизнес» за 2 900 ₽/мес — без ограничений и с расширенной аналитикой. Подробнее — на странице «Для компаний».",
      },
      {
        q: "Берёте ли вы комиссию с заказов?",
        a: "Нет. Мы не берём процент с выполненных работ и не перепродаём контакты. Заявки приходят напрямую в кабинет — договор и оплата только между вами и клиентом.",
      },
      {
        q: "Как быстро карточка появится в каталоге?",
        a: "После заполнения профиля карточка отправляется на верификацию. В среднем модерация занимает 1–2 рабочих дня. После проверки карточка получает отметку «Проверена» и публикуется автоматически.",
      },
      {
        q: "Можно ли управлять компанией с нескольких аккаунтов?",
        a: "В тарифах «Старт» и «Бизнес» компанией управляет один владелец. На корпоративном тарифе можно подключить нескольких менеджеров с разными правами доступа.",
      },
      {
        q: "Что если я хочу удалить компанию с платформы?",
        a: "В кабинете компании в разделе «Профиль» есть кнопка «Снять с публикации». Карточка перестанет быть видна клиентам, а данные сохранятся в архиве — если решите вернуться, восстановить можно в один клик.",
      },
    ],
  },
  {
    group: "Аккаунт и безопасность",
    items: [
      {
        q: "Как я могу удалить свой аккаунт?",
        a: "В личном кабинете в разделе «Профиль» в самом низу есть кнопка «Удалить аккаунт». Все ваши данные, включая историю заявок и отзывы, будут удалены безвозвратно в течение 24 часов.",
      },
      {
        q: "Что вы делаете с моими данными?",
        a: "Мы храним только то, что необходимо для работы платформы: имя, email, телефон, историю заявок и отзывов. Не передаём данные третьим лицам, не используем для рекламы. Полные условия — в Политике конфиденциальности.",
      },
      {
        q: "Я забыл пароль, что делать?",
        a: "На странице входа нажмите «Забыли пароль». Мы отправим письмо с ссылкой для восстановления на ваш email. Ссылка действует 30 минут.",
      },
    ],
  },
];

export function HelpPage() {
  const [openId, setOpenId] = useState<string | null>("Для клиентов::0");

  return (
    <>
      <section className="bg-ink-50 grid-pattern noise border-b border-ink-200">
        <Container className="py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="eyebrow mb-4">помощь</div>
            <h1 className="heading-1 mb-5">Частые вопросы</h1>
            <p className="text-lg text-ink-600 leading-relaxed max-w-2xl">
              Ответы на популярные вопросы клиентов и компаний. Если не нашли
              нужный — напишите на{" "}
              <a
                href="mailto:support@purrz.demo"
                className="underline font-semibold hover:text-ink-950"
              >
                support@purrz.demo
              </a>
              , отвечаем в рабочее время.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
            {/* Nav */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white border border-ink-200 rounded-card p-5 shadow-brutal-sm">
                <div className="eyebrow mb-4">разделы</div>
                <nav className="flex flex-col gap-1">
                  {faq.map((g) => (
                    <a
                      key={g.group}
                      href={`#${slug(g.group)}`}
                      className="font-display text-sm font-semibold px-3 py-2 rounded-lg hover:bg-ink-100"
                    >
                      {g.group}
                    </a>
                  ))}
                </nav>
                <div className="border-t border-ink-200 mt-5 pt-5 space-y-3 text-sm">
                  <a
                    href="mailto:support@purrz.demo"
                    className="flex items-center gap-2 hover:text-ink-700"
                  >
                    <Icon name="mail" size={16} /> support@purrz.demo
                  </a>
                  <a
                    href="tel:+74950000000"
                    className="flex items-center gap-2 hover:text-ink-700"
                  >
                    <Icon name="phone" size={16} /> +7 (495) 000-00-00
                  </a>
                </div>
              </div>
            </aside>

            {/* Groups */}
            <div className="space-y-12">
              {faq.map((g) => (
                <div key={g.group} id={slug(g.group)} className="scroll-mt-24">
                  <h2 className="heading-3 mb-5">{g.group}</h2>
                  <div className="space-y-3">
                    {g.items.map((it, i) => {
                      const id = `${g.group}::${i}`;
                      const open = openId === id;
                      return (
                        <div
                          key={id}
                          className="bg-white border border-ink-200 rounded-card overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenId(open ? null : id)}
                            className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-display font-semibold hover:bg-ink-50 transition-colors"
                          >
                            <span className="text-base">{it.q}</span>
                            <span
                              className={`w-8 h-8 grid place-items-center rounded-lg border border-ink-200 transition-transform ${
                                open ? "rotate-45 bg-accent" : "bg-white"
                              }`}
                            >
                              <Icon name="plus" size={16} />
                            </span>
                          </button>
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.div
                                key="content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                              >
                                <div className="px-5 pb-5 pt-1 text-ink-700 leading-relaxed border-t border-ink-100">
                                  {it.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-ink-950 text-white border-t border-ink-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <div className="eyebrow text-accent mb-3">не нашли ответ?</div>
              <h2 className="heading-3 text-white mb-4">
                Напишите нам — поможем разобраться
              </h2>
              <p className="text-ink-300 max-w-lg">
                Команда поддержки отвечает в рабочие дни с 10:00 до 19:00. Если
                вопрос срочный — звоните, дежурный менеджер всегда на линии.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a href="mailto:support@purrz.demo">
                <Button size="lg" fullWidth iconLeft={<Icon name="mail" size={18} />}>
                  Написать в поддержку
                </Button>
              </a>
              <Link to="/catalog">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="!bg-transparent !text-white !border-white hover:!bg-white hover:!text-ink-950"
                >
                  Открыть каталог
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
