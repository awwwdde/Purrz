import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { useAuth } from "@/app/store/auth";
import { mockApi } from "@/shared/api/mock-api";
import type { Company } from "@/shared/types";

const navItems = [
  { to: "/crm", end: true, label: "Дашборд", icon: "dashboard" as const },
  { to: "/crm/leads", label: "Лиды", icon: "leads" as const },
  { to: "/crm/analytics", label: "Аналитика", icon: "analytics" as const },
  { to: "/crm/services", label: "Услуги", icon: "bolt" as const },
  { to: "/crm/profile", label: "Профиль", icon: "settings" as const },
];

export function CrmLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user?.companyId) {
      mockApi.getCompany(user.companyId).then((c) => setCompany(c ?? null));
    }
  }, [user?.companyId]);

  return (
    <div className="min-h-screen bg-ink-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-ink-950 text-white sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-6 py-5 border-b border-ink-800">
          <div className="w-9 h-9 rounded-lg bg-accent text-ink-950 grid place-items-center font-display font-bold text-lg">
            P
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold">Purrz</span>
            <span className="text-[10px] uppercase tracking-widest text-ink-500 font-display">
              CRM Console
            </span>
          </div>
        </Link>

        <div className="px-4 py-4 border-b border-ink-800">
          <div className="flex items-center gap-3">
            {company ? (
              <img
                src={company.logo}
                alt=""
                className="w-10 h-10 rounded-lg border border-accent"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-ink-800 animate-pulse" />
            )}
            <div className="min-w-0">
              <div className="font-display font-semibold truncate text-sm">
                {company?.name ?? "Загрузка..."}
              </div>
              <div className="text-[11px] text-ink-400 truncate">
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-display text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-accent text-ink-950"
                    : "text-ink-300 hover:bg-ink-800 hover:text-white",
                )
              }
            >
              <Icon name={it.icon} size={18} />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-ink-800 space-y-1">
          <Link
            to="/account"
            className="flex items-center gap-3 px-3 py-2 rounded-lg font-display text-sm text-ink-400 hover:text-white hover:bg-ink-800"
          >
            <Icon name="user" size={16} />
            Личный кабинет
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg font-display text-sm text-ink-400 hover:text-white hover:bg-ink-800"
          >
            <Icon name="external" size={16} />
            На сайт
          </Link>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-display text-sm text-ink-400 hover:text-white hover:bg-signal-red"
          >
            <Icon name="logout" size={16} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-ink-950 text-white border-b border-ink-800 flex items-center justify-between px-4 h-14">
        <Link to="/crm" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-ink-950 grid place-items-center font-display font-bold">
            P
          </div>
          <span className="font-display font-bold">CRM</span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="w-10 h-10 grid place-items-center rounded-lg border border-ink-700"
        >
          <Icon name={mobileOpen ? "x" : "menu"} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 230 }}
              className="w-72 h-full bg-ink-950 text-white flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-ink-800">
                <div className="font-display font-semibold">{company?.name}</div>
                <div className="text-xs text-ink-400">{user?.email}</div>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {navItems.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg font-display text-sm font-semibold",
                        isActive
                          ? "bg-accent text-ink-950"
                          : "text-ink-300 hover:bg-ink-800",
                      )
                    }
                  >
                    <Icon name={it.icon} size={18} />
                    {it.label}
                  </NavLink>
                ))}
              </nav>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="m-3 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-300 hover:text-white hover:bg-signal-red"
              >
                <Icon name="logout" size={16} />
                Выйти
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 lg:p-10"
        >
          <Outlet context={{ company, setCompany }} />
        </motion.div>
      </main>
    </div>
  );
}
