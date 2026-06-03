import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Container, Icon } from "@/shared/ui";
import { Header } from "@/widgets/Header";
import { Footer } from "@/widgets/Footer";
import { useAuth } from "@/app/store/auth";
import { cn } from "@/shared/lib/cn";

const items = [
  { to: "/admin", end: true, label: "Компании", icon: "building" as const },
  { to: "/admin/reviews", label: "Отзывы", icon: "user" as const },
  { to: "/admin/users", label: "Пользователи", icon: "user" as const },
  { to: "/admin/catalog", label: "Каталог", icon: "tag" as const },
];

export function AdminLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Header />
      <main className="flex-1 py-10">
        <Container className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside>
            <div className="border border-ink-200 rounded-card bg-white p-5 shadow-brutal-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full border border-ink-200 bg-signal-red text-white grid place-items-center font-display font-bold">
                  M
                </div>
                <div className="min-w-0">
                  <div className="font-display font-semibold truncate">Модератор</div>
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

                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-display text-sm font-semibold text-ink-700 hover:bg-signal-red hover:text-white mt-3"
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
