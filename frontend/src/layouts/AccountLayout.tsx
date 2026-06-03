import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Header } from "@/widgets/Header";
import { Footer } from "@/widgets/Footer";
import { Container, Icon } from "@/shared/ui";
import { useAuth } from "@/app/store/auth";
import { useUserCompany } from "@/shared/lib/useUserCompany";
import { cn } from "@/shared/lib/cn";

const items = [
  { to: "/account", end: true, label: "Профиль", icon: "user" as const },
  { to: "/account/leads", label: "Мои заявки", icon: "leads" as const },
];

export function AccountLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  // Состояние компании пользователя — определяет, какая CTA показывается
  // снизу sidebar'а: «Кабинет компании» (если компания реальна и загружена),
  // «Подгружаем…» (пока проверяем) или «Разместить компанию» (нет / phantom).
  const { company, status } = useUserCompany();
  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Header />
      <main className="flex-1 py-10">
        <Container className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside>
            <div className="border border-ink-200 rounded-card bg-white p-5 shadow-brutal-sm">
              <div className="flex items-center gap-3 mb-5">
                <img
                  src={user?.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full border border-ink-200"
                />
                <div className="min-w-0">
                  <div className="font-display font-semibold truncate">{user?.name}</div>
                  <div className="text-xs text-ink-500 truncate">{user?.email}</div>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg font-display text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-ink-950 text-accent"
                          : "text-ink-700 hover:bg-ink-100",
                      )
                    }
                  >
                    <Icon name={it.icon} size={18} />
                    {it.label}
                  </NavLink>
                ))}

                {/* Раздел про компанию.
                    • loaded   — реальная компания подтверждена, ведём в /crm
                    • loading  — companyId есть, ещё тянем — disabled-кнопка
                    • остальное (no_company / missing) — CTA на размещение */}
                {status === "loaded" && company ? (
                  <button
                    onClick={() => navigate("/crm")}
                    className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg font-display text-sm font-semibold text-ink-950 bg-accent border border-ink-200 hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
                  >
                    <Icon name="dashboard" size={18} />
                    <span className="truncate text-left flex-1">
                      Кабинет {company.name}
                    </span>
                    <Icon name="arrow-up-right" size={14} className="shrink-0" />
                  </button>
                ) : status === "loading" ? (
                  <div
                    className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg font-display text-sm font-semibold text-ink-400 border border-ink-200 bg-ink-50 cursor-wait"
                    aria-disabled
                  >
                    <Icon name="dashboard" size={18} />
                    Проверяем компанию…
                  </div>
                ) : (
                  <button
                    onClick={() => navigate("/register-company")}
                    className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg font-display text-sm font-semibold text-ink-700 border-2 border-dashed border-ink-300 hover:border-ink-950 hover:text-ink-950 transition-colors"
                  >
                    <Icon name="plus" size={18} />
                    Разместить компанию
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-display text-sm font-semibold text-ink-700 hover:bg-signal-red hover:text-white mt-2"
                >
                  <Icon name="logout" size={18} />
                  Выйти
                </button>
              </nav>
            </div>
          </aside>
          <section>
            <Outlet />
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
