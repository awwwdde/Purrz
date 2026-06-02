/**
 * Тонкая обёртка fetch + хранение JWT в localStorage + авто-refresh на 401.
 *
 * Используется всеми high-level API-методами (см. ./api.ts).
 */

const ACCESS_KEY = "purrz:access";
const REFRESH_KEY = "purrz:refresh";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export const tokens = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setPair(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  anonymous?: boolean;
}

interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
}

let refreshInflight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshInflight) return refreshInflight;
  refreshInflight = (async () => {
    const refresh = tokens.getRefresh();
    if (!refresh) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) {
        tokens.clear();
        return false;
      }
      const data = (await res.json()) as TokenPairResponse;
      tokens.setPair(data.access_token, data.refresh_token);
      return true;
    } catch {
      tokens.clear();
      return false;
    } finally {
      refreshInflight = null;
    }
  })();
  return refreshInflight;
}

async function rawRequest<T>(path: string, opts: RequestOptions): Promise<T> {
  const { method = "GET", body, query, anonymous } = opts;
  const url = new URL(API_BASE + path, window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!anonymous) {
    const access = tokens.getAccess();
    if (access) headers["Authorization"] = `Bearer ${access}`;
  }
  return fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await res.json().catch(() => null) : await res.text();
    if (!res.ok) {
      const detail =
        (payload && typeof payload === "object" && "detail" in payload
          ? String(payload.detail)
          : typeof payload === "string"
          ? payload
          : res.statusText) || "Ошибка запроса";
      throw new ApiError(res.status, detail);
    }
    return payload as T;
  });
}

/**
 * Высокоуровневый запрос: автоматически пробует refresh при первом 401.
 */
export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, opts);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !opts.anonymous) {
      const ok = await refreshTokens();
      if (ok) {
        return await rawRequest<T>(path, opts);
      }
      // refresh не удался — чистим токены, пусть фронт перенаправит на /login
      tokens.clear();
    }
    throw err;
  }
}
