import { Link } from "react-router-dom";
import { Container, Icon } from "@/shared/ui";

export function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-300 mt-24">
      <Container className="py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
            <div className="w-10 h-10 rounded-xl bg-accent text-white grid place-items-center font-display font-extrabold text-lg group-hover:rotate-3 transition-transform">
              P
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight text-white">
              Purrz
            </span>
          </Link>
          <p className="text-sm text-ink-400 leading-relaxed max-w-xs">
            Платформа, где заказчики находят проверенных подрядчиков
            напрямую — без посредников и комиссий за лиды.
          </p>
        </div>

        <div>
          <h4 className="font-display font-bold text-white mb-4 text-sm uppercase tracking-wider">
            Сервис
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/catalog" className="hover:text-accent transition-colors">Каталог услуг</Link></li>
            <li><Link to="/about" className="hover:text-accent transition-colors">О сервисе</Link></li>
            <li><Link to="/help" className="hover:text-accent transition-colors">Помощь</Link></li>
            <li><Link to="/login" className="hover:text-accent transition-colors">Войти</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-white mb-4 text-sm uppercase tracking-wider">
            Для компаний
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/for-business" className="hover:text-accent transition-colors">Возможности и тарифы</Link></li>
            <li><Link to="/register-company" className="hover:text-accent transition-colors">Разместить компанию</Link></li>
            <li><a href="mailto:business@purrz.demo" className="hover:text-accent transition-colors">business@purrz.demo</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-white mb-4 text-sm uppercase tracking-wider">
            Контакты
          </h4>
          <ul className="space-y-2.5 text-sm text-ink-400">
            <li className="flex items-center gap-2">
              <Icon name="mail" size={14} /> hello@purrz.demo
            </li>
            <li className="flex items-center gap-2">
              <Icon name="phone" size={14} /> +7 (495) 000-00-00
            </li>
            <li className="flex items-center gap-2">
              <Icon name="map-pin" size={14} /> Москва, Россия
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-ink-800">
        <Container className="py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-ink-500">
          <span>© {new Date().getFullYear()} Purrz. Все права защищены.</span>
          <span className="font-mono text-ink-600">v0.1.0 · DEMO</span>
        </Container>
      </div>
    </footer>
  );
}
