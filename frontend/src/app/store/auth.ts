import { create } from "zustand";
import { persist } from "zustand/middleware";
import { realApi } from "@/shared/api/api";
import { tokens } from "@/shared/api/http";
import type { User } from "@/shared/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
  /** Привязывает компанию к текущему пользователю и поднимает роль до владельца. */
  attachCompany: (companyId: string) => void;
  /** Перечитать /me с сервера — например, после рестарта SPA. */
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      async login(email, password) {
        set({ loading: true, error: null });
        try {
          const user = await realApi.login(email, password);
          set({ user, loading: false });
          return user;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          throw e;
        }
      },

      async register(name, email, password) {
        set({ loading: true, error: null });
        try {
          const user = await realApi.register(name, email, password);
          set({ user, loading: false });
          return user;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          throw e;
        }
      },

      logout() {
        realApi.logout();
        set({ user: null });
      },

      setUser(user) {
        set({ user });
      },

      attachCompany(companyId) {
        const u = get().user;
        if (!u) return;
        set({ user: { ...u, companyId, role: "company_manager" } });
      },

      async hydrate() {
        if (!tokens.getAccess()) {
          // Токенов нет — почистим возможный «фантомный» user из persist.
          if (get().user) set({ user: null });
          return;
        }
        try {
          const me = await realApi.getMe();
          set({ user: me });
        } catch {
          set({ user: null });
        }
      },
    }),
    {
      name: "purrz:auth",
      // Сохраняем user для быстрого первого рендера. Реальную правду берём из
      // /me в hydrate() при старте — токен может быть протух.
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
