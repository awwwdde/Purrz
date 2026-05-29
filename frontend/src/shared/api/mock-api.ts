import type {
  Company,
  InnLookupResult,
  Lead,
  LeadStatus,
  Service,
  ServiceCategory,
  User,
} from "@/shared/types";
import {
  categories as seedCategories,
  companies as seedCompanies,
  demoManager,
  demoUser,
  leads as seedLeads,
  services as seedServices,
} from "./mock-data";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const STORAGE_KEY = "purrz:mock-state:v1";

interface MockState {
  categories: ServiceCategory[];
  services: Service[];
  companies: Company[];
  leads: Lead[];
}

function loadState(): MockState {
  if (typeof window === "undefined") {
    return {
      categories: seedCategories,
      services: seedServices,
      companies: seedCompanies,
      leads: seedLeads,
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockState;
  } catch {
    /* ignore */
  }
  const initial: MockState = {
    categories: seedCategories,
    services: seedServices,
    companies: seedCompanies,
    leads: seedLeads,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveState(state: MockState) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

let state = loadState();

function commit() {
  saveState(state);
}

export const mockApi = {
  async listCategories(): Promise<ServiceCategory[]> {
    await delay(120);
    return state.categories;
  },

  async listServices(categoryId?: string): Promise<Service[]> {
    await delay(150);
    return categoryId
      ? state.services.filter((s) => s.categoryId === categoryId)
      : state.services;
  },

  async getService(id: string): Promise<Service | undefined> {
    await delay(100);
    return state.services.find((s) => s.id === id);
  },

  async listCompanies(params?: {
    categoryId?: string;
    serviceId?: string;
    minRating?: number;
    hasDiscount?: boolean;
    sort?: "rating" | "price" | "discount" | "reviews";
    search?: string;
  }): Promise<Company[]> {
    await delay(200);
    let result = [...state.companies];

    if (params?.categoryId) {
      const svcIds = state.services
        .filter((s) => s.categoryId === params.categoryId)
        .map((s) => s.id);
      result = result.filter((c) => c.services.some((cs) => svcIds.includes(cs.serviceId)));
    }
    if (params?.serviceId) {
      result = result.filter((c) =>
        c.services.some((cs) => cs.serviceId === params.serviceId),
      );
    }
    if (params?.minRating) {
      result = result.filter((c) => c.rating >= params.minRating!);
    }
    if (params?.hasDiscount) {
      result = result.filter((c) => c.discount > 0);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    switch (params?.sort) {
      case "price":
        result.sort((a, b) => {
          const ap = Math.min(...a.services.map((s) => s.price));
          const bp = Math.min(...b.services.map((s) => s.price));
          return ap - bp;
        });
        break;
      case "discount":
        result.sort((a, b) => b.discount - a.discount);
        break;
      case "reviews":
        result.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case "rating":
      default:
        result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  },

  async getCompany(id: string): Promise<Company | undefined> {
    await delay(120);
    return state.companies.find((c) => c.id === id);
  },

  async createCompany(payload: Omit<Company, "id" | "rating" | "reviewsCount" | "reviews" | "views">): Promise<Company> {
    await delay(400);
    const newCo: Company = {
      ...payload,
      id: `co-${Math.random().toString(36).slice(2, 8)}`,
      rating: 0,
      reviewsCount: 0,
      reviews: [],
      views: 0,
    };
    state = { ...state, companies: [...state.companies, newCo] };
    commit();
    return newCo;
  },

  async updateCompany(id: string, patch: Partial<Company>): Promise<Company> {
    await delay(300);
    const idx = state.companies.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Company not found");
    const updated = { ...state.companies[idx], ...patch };
    const next = [...state.companies];
    next[idx] = updated;
    state = { ...state, companies: next };
    commit();
    return updated;
  },

  async createLead(payload: {
    companyId: string;
    serviceId: string;
    userName: string;
    userContact: string;
    comment: string;
  }): Promise<Lead> {
    await delay(400);
    const co = state.companies.find((c) => c.id === payload.companyId);
    const sv = state.services.find((s) => s.id === payload.serviceId);
    if (!co || !sv) throw new Error("Bad reference");
    const newLead: Lead = {
      id: `l-${Math.random().toString(36).slice(2, 8)}`,
      userId: "u-demo",
      userName: payload.userName,
      userContact: payload.userContact,
      companyId: co.id,
      companyName: co.name,
      serviceId: sv.id,
      serviceName: sv.name,
      comment: payload.comment,
      date: new Date().toISOString(),
      status: "new",
    };
    state = { ...state, leads: [newLead, ...state.leads] };
    commit();
    return newLead;
  },

  async listLeads(params?: { companyId?: string; userId?: string }): Promise<Lead[]> {
    await delay(150);
    let result = state.leads;
    if (params?.companyId) result = result.filter((l) => l.companyId === params.companyId);
    if (params?.userId) result = result.filter((l) => l.userId === params.userId);
    return result;
  },

  async updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
    await delay(200);
    const idx = state.leads.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Lead not found");
    const updated = { ...state.leads[idx], status };
    const next = [...state.leads];
    next[idx] = updated;
    state = { ...state, leads: next };
    commit();
    return updated;
  },

  async lookupInn(inn: string): Promise<InnLookupResult> {
    await delay(800);
    const cleaned = inn.replace(/\D/g, "");
    if (cleaned.length < 10) throw new Error("ИНН должен содержать 10 или 12 цифр");
    const seed = parseInt(cleaned.slice(-4), 10) || 1;
    const names = [
      "ООО «Стройинвест»",
      "ООО «Технологии комфорта»",
      "ООО «АльфаСервис»",
      "ООО «Прогресс-М»",
      "ООО «Городские решения»",
      "ООО «МосСтройГрупп»",
    ];
    const streets = ["Ленинский", "Кутузовский", "Мира", "Большая Якиманка", "Профсоюзная"];
    const directors = ["Иванов И.И.", "Петров П.С.", "Сидоров А.В.", "Кузнецова Е.М."];
    return {
      name: names[seed % names.length],
      inn: cleaned,
      address: `Москва, пр-т ${streets[seed % streets.length]}, д. ${(seed % 200) + 1}`,
      ogrn: `1${cleaned}${(seed % 1000).toString().padStart(3, "0")}`,
      director: directors[seed % directors.length],
      registeredAt: new Date(Date.now() - (1000 + (seed % 4000)) * 86400_000).toISOString(),
    };
  },

  async login(email: string, _password: string): Promise<User> {
    await delay(400);
    // Демо-учётка владельца компании «Арктика-Сервис»
    if (email.trim().toLowerCase() === demoManager.email) return demoManager;
    return { ...demoUser, email };
  },

  async register(name: string, email: string): Promise<User> {
    await delay(400);
    return {
      id: `u-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      role: "user",
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=D6FF3D&textColor=0A0A0B`,
      createdAt: new Date().toISOString(),
    };
  },

  resetMockState() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      state = loadState();
    }
  },
};

export type MockApi = typeof mockApi;
