/**
 * Единый источник правды о компании текущего пользователя.
 *
 * Зачем: `user.companyId` из auth-стора — это просто число, оно может быть
 * "фантомным" (например, persist в localStorage пережил удаление компании
 * или смену аккаунта, до того как `/auth/me` всё перетёр). Если пускать
 * в /crm на одном лишь companyId, страницы получают `getCompany(id) → 404`
 * и показывают пустой UI «только email пользователя» — это и есть симптом
 * «в CRM ничего не отображается».
 *
 * Хук грузит компанию по companyId и:
 *   • при успехе — отдаёт её через `company` и status="loaded";
 *   • при отсутствии (фантом) — само чистит companyId+роль в auth-сторе,
 *     status="missing". `RequireCompany` после этого редиректит в /account.
 *
 * Используется в RequireCompany, AccountLayout/Header (показ кнопок CRM)
 * и при желании в любой странице CRM, где нужна компания.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/app/store/auth";
import { realApi } from "@/shared/api/api";
import type { Company } from "@/shared/types";

export type CompanyStatus =
  | "no_user"      // не залогинен
  | "no_company"   // залогинен, компании нет (нормальный обычный user)
  | "loading"      // companyId есть, тянем с бэка
  | "loaded"       // company подтверждена и есть в state
  | "missing";     // companyId был, но company не нашлась (phantom — почищено)

// Простой module-level кэш inflight-промисов. Чтобы при использовании
// хука одновременно из Header + AccountLayout + RequireCompany мы не
// плодили N одинаковых GET /companies/{id}. Ключ — companyId как строка.
// undefined в значении кэша = «было запрошено и пришло пусто (phantom)».
const _inflight = new Map<string, Promise<Company | undefined>>();

function _getCompanyCached(id: string): Promise<Company | undefined> {
  const cached = _inflight.get(id);
  if (cached) return cached;
  const p = realApi.getCompany(id).finally(() => {
    // Снимаем через тик — повторные mounts в этом же раунде успеют поймать
    // resolved-промис, но следующие переходы по странице получат свежий fetch.
    setTimeout(() => _inflight.delete(id), 0);
  });
  _inflight.set(id, p);
  return p;
}

export function useUserCompany() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const [company, setCompany] = useState<Company | null>(null);
  const [status, setStatus] = useState<CompanyStatus>(() => {
    if (!user) return "no_user";
    if (!user.companyId) return "no_company";
    return "loading";
  });

  useEffect(() => {
    if (!user) {
      setStatus("no_user");
      setCompany(null);
      return;
    }
    if (!user.companyId) {
      setStatus("no_company");
      setCompany(null);
      return;
    }

    let alive = true;
    setStatus("loading");

    _getCompanyCached(user.companyId)
      .then((c) => {
        if (!alive) return;
        if (c) {
          setCompany(c);
          setStatus("loaded");
        } else {
          // Phantom companyId. Чистим в auth-сторе, чтобы RequireCompany
          // повторно не пустил в /crm и сайдбары перестали показывать кнопку.
          setCompany(null);
          setStatus("missing");
          setUser({
            ...user,
            companyId: undefined,
            role: user.role === "company_manager" ? "user" : user.role,
          });
        }
      })
      .catch(() => {
        if (!alive) return;
        // Сеть/500 — НЕ чистим companyId (это может быть временный сбой).
        // Просто показываем missing, чтобы не вешать пользователя на пустом UI.
        setCompany(null);
        setStatus("missing");
      });

    return () => {
      alive = false;
    };
    // setUser стабильный из zustand; пересоздавать эффект из-за него не нужно.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.companyId]);

  return { company, status };
}
