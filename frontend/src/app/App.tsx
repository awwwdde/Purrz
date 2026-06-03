import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { MainLayout } from "@/layouts/MainLayout";
import { CrmLayout } from "@/layouts/CrmLayout";
import { AccountLayout } from "@/layouts/AccountLayout";
import { HomePage } from "@/pages/HomePage";
import { CatalogPage } from "@/pages/CatalogPage";
import { CompanyPage } from "@/pages/CompanyPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { RegisterCompanyPage } from "@/pages/RegisterCompanyPage";
import { AboutPage } from "@/pages/AboutPage";
import { ForBusinessPage } from "@/pages/ForBusinessPage";
import { HelpPage } from "@/pages/HelpPage";
import { AccountProfilePage } from "@/pages/account/AccountProfilePage";
import { AccountLeadsPage } from "@/pages/account/AccountLeadsPage";
import { CrmDashboardPage } from "@/pages/crm/CrmDashboardPage";
import { CrmLeadsPage } from "@/pages/crm/CrmLeadsPage";
import { CrmAnalyticsPage } from "@/pages/crm/CrmAnalyticsPage";
import { CrmServicesPage } from "@/pages/crm/CrmServicesPage";
import { CrmProfilePage } from "@/pages/crm/CrmProfilePage";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AdminCompaniesPage } from "@/pages/admin/AdminCompaniesPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminReviewsPage } from "@/pages/admin/AdminReviewsPage";
import { AdminCatalogPage } from "@/pages/admin/AdminCatalogPage";
import { useAuth } from "@/app/store/auth";
import { useUserCompany } from "@/shared/lib/useUserCompany";

/** Любой авторизованный пользователь */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const location = useLocation();
  if (!user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }
  return <>{children}</>;
}

/** Авторизован И имеет роль admin */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const location = useLocation();
  if (!user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/** Авторизован И владеет существующей компанией.
 *
 * Проверяем не только наличие companyId в auth-сторе (он может быть phantom
 * из persisted localStorage), но и что компания реально подгружается с бэка.
 * useUserCompany сам почистит фантомный id, мы лишь редиректим на /account,
 * если итоговый статус не "loaded".
 */
function RequireCompany({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const { status } = useUserCompany();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }
  if (status === "loading") {
    // Маленький neutral-fallback вместо мигания «пустого» CRM-каркаса.
    return (
      <div className="min-h-screen grid place-items-center bg-ink-50 text-ink-500 font-display text-sm">
        Загружаем кабинет…
      </div>
    );
  }
  if (status !== "loaded") {
    // no_company | missing | no_user — едем в ЛК. Там пользователь увидит
    // блок «Разместить компанию» / «Компания не найдена».
    return <Navigate to="/account" replace />;
  }
  return <>{children}</>;
}

export function App() {
  const location = useLocation();

  // При старте SPA валидируем сохранённый JWT и подтягиваем актуального user'а
  // с бэка. Если токен протух — auth-стор сам очистит user.
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:categorySlug" element={<CatalogPage />} />
          <Route path="/company/:id" element={<CompanyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/for-business" element={<ForBusinessPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Размещение компании требует авторизации */}
          <Route
            path="/register-company"
            element={
              <RequireAuth>
                <RegisterCompanyPage />
              </RequireAuth>
            }
          />
        </Route>

        <Route
          element={
            <RequireAuth>
              <AccountLayout />
            </RequireAuth>
          }
        >
          <Route path="/account" element={<AccountProfilePage />} />
          <Route path="/account/leads" element={<AccountLeadsPage />} />
        </Route>

        <Route
          element={
            <RequireCompany>
              <CrmLayout />
            </RequireCompany>
          }
        >
          <Route path="/crm" element={<CrmDashboardPage />} />
          <Route path="/crm/leads" element={<CrmLeadsPage />} />
          <Route path="/crm/analytics" element={<CrmAnalyticsPage />} />
          <Route path="/crm/services" element={<CrmServicesPage />} />
          <Route path="/crm/profile" element={<CrmProfilePage />} />
        </Route>

        <Route
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route path="/admin" element={<AdminCompaniesPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/catalog" element={<AdminCatalogPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
