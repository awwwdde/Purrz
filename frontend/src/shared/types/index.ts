export type Role = "user" | "company_manager" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Role;
  createdAt: string;
  companyId?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  minPrice: number;
  maxPrice: number;
}

export interface CompanyService {
  serviceId: string;
  price: number;
  discount?: number;
  description?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Company {
  id: string;
  name: string;
  inn: string;
  description: string;
  logo: string;
  banner: string;
  rating: number;
  reviewsCount: number;
  discount: number;
  contacts: {
    phone: string;
    email: string;
    site?: string;
  };
  address: string;
  services: CompanyService[];
  gallery: string[];
  reviews: Review[];
  views: number;
  yearsOnMarket: number;
  verified: boolean;
}

export type LeadStatus = "new" | "in_progress" | "done" | "rejected";

export interface Lead {
  id: string;
  userId: string;
  userName: string;
  userContact: string;
  companyId: string;
  companyName: string;
  serviceId: string;
  serviceName: string;
  comment: string;
  date: string;
  status: LeadStatus;
}

export interface InnLookupResult {
  name: string;
  inn: string;
  address: string;
  ogrn: string;
  director: string;
  registeredAt: string;
}
