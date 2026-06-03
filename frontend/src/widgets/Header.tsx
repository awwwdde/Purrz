import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Container, Icon } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { useAuth } from "@/app/store/auth";
import { useUserCompany } from "@/shared/lib/useUserCompany";

const links = [
  { to: "/", label: "Главная", end: true },
  { to: "/catalog", label: "Каталог" },
  { to: "/for-business", label: "Для компаний" },
  { to: "/about", label: "О сервисе" },
  { to: "/help", label: "Помощь" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  // Показ кнопки «Кабинет компании» — только если компания реально
  // подгрузилась с бэка. Иначе у persisted-phantom companyId кнопка вела
  // бы в /crm, который потом редиректит обратно — мерцание UI.
  const { status: companyStatus } = useUserCompany();

  return (
    <header className="sticky top-0 z-40 bg-ink-50/90 backdrop-blur-md border-b border-ink-200">
      <Container className="flex items-center justify-between h-[68px]">
        {/* Лого */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-ink-950 text-white grid place-items-center font-display font-extrabold text-lg group-hover:bg-accent transition-colors">
            P
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight text-ink-950">
            Purrz
          </span>
        </Link>

        {/* Навигация */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-[10px] font-display text-[15px] font-semibold transition-colors",
                  isActive
                    ? "bg-white text-ink-950 shadow-brutal-sm"
                    : "text-ink-600 hover:text-ink-950 hover:bg-white/60",
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          {!user && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden sm:inline-flex"
              >
                Войти
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  navigate(
                    `/login?next=${encodeURIComponent("/register-company")}`,
                  )
                }
                iconRight={<Icon name="arrow-right" size={16} />}
              >
                <span className="hidden sm:inline">Разместить компанию</span>
                <span className="sm:hidden">Компания</span>
              </Button>
            </>
          )}
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/account")}>
                Мой кабинет
              </Button>
              {user.role === "admin" ? (
                <Button variant="danger" size="sm" onClick={() => navigate("/admin")}>
                  Админ-панель
                </Button>
              ) : companyStatus === "loaded" ? (
                <Button variant="primary" size="sm" onClick={() => navigate("/crm")}>
                  Кабинет компании
                </Button>
              ) : null}
              <button
                onClick={logout}
                title="Выйти"
                className="w-9 h-9 grid place-items-center rounded-[10px] border border-ink-200 text-ink-600 hover:text-ink-950 hover:border-ink-950 transition-colors"
              >
                <Icon name="logout" size={16} />
              </button>
            </div>
          )}
          <button
            className="lg:hidden w-10 h-10 grid place-items-center rounded-[10px] border border-ink-200 text-ink-700"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-ink-200 bg-white"
          >
            <Container className="py-4 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2.5 rounded-[10px] font-display font-semibold",
                      isActive
                        ? "bg-ink-950 text-white"
                        : "text-ink-700 hover:bg-ink-100",
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="border-t border-ink-200 my-3" />
              {!user ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      navigate("/login");
                    }}
                  >
                    Войти
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setOpen(false);
                      navigate(
                        `/login?next=${encodeURIComponent("/register-company")}`,
                      );
                    }}
                  >
                    Разместить компанию
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      navigate("/account");
                    }}
                  >
                    Личный кабинет
                  </Button>
                  {user.role === "admin" ? (
                    <Button
                      variant="danger"
                      onClick={() => {
                        setOpen(false);
                        navigate("/admin");
                      }}
                    >
                      Админ-панель
                    </Button>
                  ) : companyStatus === "loaded" ? (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setOpen(false);
                        navigate("/crm");
                      }}
                    >
                      Кабинет компании
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    Выйти
                  </Button>
                </>
              )}
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
