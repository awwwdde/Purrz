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
import { useAuth } from "@/app/store/auth";

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

/** Авторизован И владеет компанией */
function RequireCompany({ children }: { children: React.ReactNode }) {
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
  if (!user.companyId) {
    // У пользователя нет привязанной компании — отправляем в ЛК
    return <Navigate to="/account" replace />;
  }
  return <>{children}</>;
}

export function App() {
  const location = useLocation();
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
