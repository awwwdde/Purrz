import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockApi } from "@/shared/api/mock-api";
import type { User } from "@/shared/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
  /** Привязывает компанию к текущему пользователю и поднимает роль до владельца */
  attachCompany: (companyId: string) => void;
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
          const user = await mockApi.login(email, password);
          set({ user, loading: false });
          return user;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          throw e;
        }
      },
      async register(name, email, _password) {
        set({ loading: true, error: null });
        try {
          const user = await mockApi.register(name, email);
          set({ user, loading: false });
          return user;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          throw e;
        }
      },
      logout() {
        set({ user: null });
      },
      setUser(user) {
        set({ user });
      },
      attachCompany(companyId) {
        const u = get().user;
        if (!u) return;
        set({
          user: { ...u, companyId, role: "company_manager" },
        });
      },
    }),
    {
      name: "purrz:auth",
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
