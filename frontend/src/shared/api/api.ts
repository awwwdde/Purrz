/**
 * Реальный API-клиент. Сигнатуры зеркалят старый mockApi —
 * чтобы страницы и виджеты не пришлось переписывать.
 *
 * mock-api.ts теперь просто реэкспортирует это.
 */
import type {
  Company,
  InnLookupResult,
  Lead,
  LeadStatus,
  Service,
  ServiceCategory,
  User,
} from "@/shared/types";
import { api, tokens, ApiError } from "./http";

// ── Auth ────────────────────────────────────────────────────────────────────

interface BackendTokenPair {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

async function fetchMe(): Promise<User> {
  // Бэк возвращает поля в camelCase через aliases (см. schemas.UserOut).
  // companyId — number у нас, но во фронте — string. Конвертим.
  const me = await api<{
    id: number;
    email: string;
    name: string;
    phone: string | null;
    avatar: string | null;
    role: User["role"];
    companyId: number | null;
    createdAt: string;
  }>("/auth/me");
  return {
    id: String(me.id),
    email: me.email,
    name: me.name,
    phone: me.phone ?? undefined,
    avatar: me.avatar ?? undefined,
    role: me.role,
    createdAt: me.createdAt,
    companyId: me.companyId !== null ? String(me.companyId) : undefined,
  };
}

// ── Каталог ────────────────────────────────────────────────────────────────

interface BackendCategory {
  id: number;
  slug: string;
  name: string;
  icon: string;
  description: string;
}

interface BackendService {
  id: number;
  slug: string;
  name: string;
  description: string;
  categoryId: number;
  minPrice: number;
  maxPrice: number;
}

function svcOut(s: BackendService): Service {
  return {
    id: String(s.id),
    name: s.name,
    categoryId: String(s.categoryId),
    description: s.description,
    minPrice: s.minPrice,
    maxPrice: s.maxPrice,
  };
}

function catOut(c: BackendCategory): ServiceCategory {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    description: c.description,
  };
}

// ── Компании ───────────────────────────────────────────────────────────────

interface BackendCompany {
  id: number;
  name: string;
  inn: string;
  description: string;
  logo: string | null;
  banner: string | null;
  address: string;
  contacts: { phone: string | null; email: string | null; site: string | null };
  discount: number;
  yearsOnMarket: number;
  views: number;
  rating: number;
  reviewsCount: number;
  tariff: "free" | "premium";
  verified: boolean;
  services: Array<{
    serviceId: number;
    serviceName: string | null;
    price: number;
    discount: number | null;
    description: string | null;
  }>;
  gallery: string[];
  reviews: Array<{
    id: number;
    author: string;
    rating: number;
    text: string;
    date: string;
  }>;
}

interface BackendCompanyList {
  items: BackendCompany[];
  total: number;
  page: number;
  pageSize: number;
}

function companyOut(c: BackendCompany): Company {
  return {
    id: String(c.id),
    name: c.name,
    inn: c.inn,
    description: c.description,
    logo: c.logo ?? "",
    banner: c.banner ?? "",
    rating: c.rating,
    reviewsCount: c.reviewsCount,
    discount: c.discount,
    contacts: {
      phone: c.contacts.phone ?? "",
      email: c.contacts.email ?? "",
      site: c.contacts.site ?? undefined,
    },
    address: c.address,
    services: c.services.map((s) => ({
      serviceId: String(s.serviceId),
      price: s.price,
      discount: s.discount ?? undefined,
      description: s.description ?? undefined,
    })),
    gallery: c.gallery,
    reviews: c.reviews.map((r) => ({
      id: String(r.id),
      author: r.author,
      rating: r.rating,
      text: r.text,
      date: r.date,
    })),
    views: c.views,
    yearsOnMarket: c.yearsOnMarket,
    verified: c.verified,
  };
}

// ── Лиды ───────────────────────────────────────────────────────────────────

interface BackendLead {
  id: number;
  companyId: number;
  companyName: string | null;
  serviceId: number;
  serviceName: string | null;
  userId: number | null;
  userName: string;
  userContact: string;
  comment: string;
  status: LeadStatus;
  date: string;
}

function leadOut(l: BackendLead): Lead {
  return {
    id: String(l.id),
    userId: l.userId !== null ? String(l.userId) : "guest",
    userName: l.userName,
    userContact: l.userContact,
    companyId: String(l.companyId),
    companyName: l.companyName ?? "",
    serviceId: String(l.serviceId),
    serviceName: l.serviceName ?? "",
    comment: l.comment,
    date: l.date,
    status: l.status,
  };
}

// ── Публичный mockApi-compatible ───────────────────────────────────────────

export const realApi = {
  // ── Auth ───────────────────────────────────────────────────────────────
  async login(email: string, password: string): Promise<User> {
    const pair = await api<BackendTokenPair>("/auth/login", {
      method: "POST",
      body: { email, password },
      anonymous: true,
    });
    tokens.setPair(pair.access_token, pair.refresh_token);
    return fetchMe();
  },

  async register(name: string, email: string, password = "demo-changeme"): Promise<User> {
    const pair = await api<BackendTokenPair>("/auth/register", {
      method: "POST",
      body: { name, email, password },
      anonymous: true,
    });
    tokens.setPair(pair.access_token, pair.refresh_token);
    return fetchMe();
  },

  async getMe(): Promise<User | null> {
    if (!tokens.getAccess()) return null;
    try {
      return await fetchMe();
    } catch {
      tokens.clear();
      return null;
    }
  },

  logout() {
    tokens.clear();
  },

  // ── Каталог ────────────────────────────────────────────────────────────
  async listCategories(): Promise<ServiceCategory[]> {
    const data = await api<BackendCategory[]>("/categories", { anonymous: true });
    return data.map(catOut);
  },

  async listServices(categoryId?: string): Promise<Service[]> {
    const data = await api<BackendService[]>("/services", {
      anonymous: true,
      query: { category_id: categoryId },
    });
    return data.map(svcOut);
  },

  async getService(id: string): Promise<Service | undefined> {
    try {
      const data = await api<BackendService>(`/services/${id}`, { anonymous: true });
      return svcOut(data);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return undefined;
      throw e;
    }
  },

  // ── Компании ───────────────────────────────────────────────────────────
  async listCompanies(params?: {
    categoryId?: string;
    serviceId?: string;
    minRating?: number;
    hasDiscount?: boolean;
    sort?: "rating" | "price" | "discount" | "reviews";
    search?: string;
  }): Promise<Company[]> {
    const data = await api<BackendCompanyList>("/companies", {
      anonymous: true,
      query: {
        category_id: params?.categoryId,
        service_id: params?.serviceId,
        min_rating: params?.minRating,
        has_discount: params?.hasDiscount ? "true" : undefined,
        sort: params?.sort,
        search: params?.search,
        page: 1,
        page_size: 50,
      },
    });
    return data.items.map(companyOut);
  },

  async getCompany(id: string | undefined | null): Promise<Company | undefined> {
    // Guard: страницы CRM могут позвать с undefined пока persisted-user из
    // zustand ещё не гидрировался. Возвращаем undefined вместо HTTP-вызова.
    if (!id || id === "undefined" || id === "null") return undefined;
    try {
      const data = await api<BackendCompany>(`/companies/${id}`, { anonymous: true });
      return companyOut(data);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 422)) return undefined;
      throw e;
    }
  },

  async createCompany(payload: Omit<Company, "id" | "rating" | "reviewsCount" | "reviews" | "views">): Promise<Company> {
    const created = await api<BackendCompany>("/auth/register-company", {
      method: "POST",
      body: {
        name: payload.name,
        inn: payload.inn,
        description: payload.description,
        logo: payload.logo || null,
        banner: payload.banner || null,
        address: payload.address,
        contact_phone: payload.contacts.phone || null,
        contact_email: payload.contacts.email || null,
        contact_site: payload.contacts.site || null,
        services: payload.services.map((s) => ({
          serviceId: Number(s.serviceId),
          price: s.price,
          discount: s.discount ?? null,
          description: s.description ?? null,
        })),
      },
    });
    return companyOut(created);
  },

  async updateCompany(_id: string, patch: Partial<Company>): Promise<Company> {
    const updated = await api<BackendCompany>("/crm/profile", {
      method: "PUT",
      body: {
        name: patch.name,
        description: patch.description,
        logo: patch.logo,
        banner: patch.banner,
        address: patch.address,
        contact_phone: patch.contacts?.phone,
        contact_email: patch.contacts?.email,
        contact_site: patch.contacts?.site,
        discount: patch.discount,
        gallery: patch.gallery,
      },
    });
    return companyOut(updated);
  },

  // ── Лиды ───────────────────────────────────────────────────────────────
  async createLead(payload: {
    companyId: string;
    serviceId: string;
    userName: string;
    userContact: string;
    comment: string;
  }): Promise<Lead> {
    const lead = await api<BackendLead>("/leads", {
      method: "POST",
      body: {
        companyId: Number(payload.companyId),
        serviceId: Number(payload.serviceId),
        userName: payload.userName,
        userContact: payload.userContact,
        comment: payload.comment,
      },
    });
    return leadOut(lead);
  },

  async listLeads(params?: { companyId?: string; userId?: string }): Promise<Lead[]> {
    // Если фильтр по userId — это «мои заявки», едем в /account/leads.
    // Если по companyId — это CRM, /crm/leads.
    if (params?.userId) {
      const list = await api<BackendLead[]>("/account/leads");
      return list.map(leadOut);
    }
    if (params?.companyId) {
      const list = await api<BackendLead[]>("/crm/leads");
      return list.map(leadOut);
    }
    return [];
  },

  async updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
    const lead = await api<BackendLead>(`/crm/leads/${id}`, {
      method: "PATCH",
      body: { status },
    });
    return leadOut(lead);
  },

  // ── Прочее ─────────────────────────────────────────────────────────────
  async lookupInn(inn: string): Promise<InnLookupResult> {
    return api<InnLookupResult>(`/inn/${encodeURIComponent(inn)}`, { anonymous: true });
  },

  resetMockState() {
    // В реальном API нечего сбрасывать; оставлено для совместимости.
  },
};

export type RealApi = typeof realApi;


// ── Admin API ────────────────────────────────────────────────────────────────
// Используется только в /admin (роль admin). Все вызовы под Bearer-токеном.

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "user" | "company_manager" | "admin";
  phone: string | null;
  avatar: string | null;
  companyId: number | null;
  createdAt: string;
  isActive?: boolean;
}

interface BackendAdminUser {
  id: number;
  email: string;
  name: string;
  role: "user" | "company_manager" | "admin";
  phone: string | null;
  avatar: string | null;
  companyId: number | null;
  createdAt: string;
  is_active?: boolean;
}

export const adminApi = {
  // ── Пользователи ───────────────────────────────────────────────────────
  async listUsers(): Promise<AdminUser[]> {
    const list = await api<BackendAdminUser[]>("/admin/users");
    return list.map((u) => ({ ...u, isActive: u.is_active ?? true }));
  },

  async banUser(userId: number, active: boolean): Promise<void> {
    await api(`/admin/users/${userId}/ban`, {
      method: "PATCH",
      body: { is_active: active },
    });
  },

  // ── Компании ───────────────────────────────────────────────────────────
  async listAllCompanies(params?: { search?: string; page?: number }): Promise<{ items: Company[]; total: number }> {
    // Используем публичный /companies — для admin он отдаёт всё, включая
    // непроверенные (бэк фильтрует только is_active=true; забаненных не покажет).
    const list = await api<BackendCompanyList>(`/companies`, {
      query: {
        page: params?.page ?? 1,
        page_size: 100,
        search: params?.search,
        sort: "newest",
      },
      anonymous: true,
    });
    return { items: list.items.map(companyOut), total: list.total };
  },

  async verifyCompany(companyId: number, verified: boolean): Promise<void> {
    await api(`/admin/companies/${companyId}/verify`, {
      method: "PATCH",
      body: { verified },
    });
  },

  async banCompany(companyId: number, active: boolean): Promise<void> {
    await api(`/admin/companies/${companyId}/ban`, {
      method: "PATCH",
      body: { is_active: active },
    });
  },

  async deleteCompany(companyId: number): Promise<void> {
    await api(`/admin/companies/${companyId}`, { method: "DELETE" });
  },

  // ── Отзывы ─────────────────────────────────────────────────────────────
  async deleteReview(reviewId: number): Promise<void> {
    await api(`/admin/reviews/${reviewId}`, { method: "DELETE" });
  },

  // ── Категории ──────────────────────────────────────────────────────────
  async createCategory(payload: {
    slug: string; name: string; icon: string; description: string; sort_order?: number;
  }): Promise<void> {
    await api(`/admin/categories`, { method: "POST", body: payload });
  },

  async updateCategory(id: number, payload: {
    slug: string; name: string; icon: string; description: string; sort_order?: number;
  }): Promise<void> {
    await api(`/admin/categories/${id}`, { method: "PUT", body: payload });
  },

  async deleteCategory(id: number): Promise<void> {
    await api(`/admin/categories/${id}`, { method: "DELETE" });
  },

  // ── Услуги ─────────────────────────────────────────────────────────────
  async createService(payload: {
    slug: string; name: string; description: string;
    categoryId: number; minPrice: number; maxPrice: number;
  }): Promise<void> {
    await api(`/admin/services`, { method: "POST", body: payload });
  },

  async updateService(id: number, payload: {
    slug: string; name: string; description: string;
    categoryId: number; minPrice: number; maxPrice: number;
  }): Promise<void> {
    await api(`/admin/services/${id}`, { method: "PUT", body: payload });
  },

  async deleteService(id: number): Promise<void> {
    await api(`/admin/services/${id}`, { method: "DELETE" });
  },
};

export type AdminApi = typeof adminApi;
