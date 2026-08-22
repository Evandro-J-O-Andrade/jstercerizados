import type { Database } from '@/types/database';

export type LeadStatus = Database['public']['Enums']['lead_status'];
export type ServiceCategory = Database['public']['Enums']['service_category'];
export type ServiceStatus = Database['public']['Enums']['service_status'];
export type SupplierStatus = Database['public']['Enums']['supplier_status'];
export type PartnerStatus = Database['public']['Enums']['partner_status'];
export type BudgetStatus = Database['public']['Enums']['budget_status'];

export interface Lead {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string | null;
  service_id: string | null;
  status: LeadStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
  service?: Database['public']['Tables']['services']['Row'];
}

export interface LeadCreateInput {
  tenant_id: string;
  name: string;
  email: string;
  phone?: string | null;
  service_id?: string | null;
  status?: LeadStatus;
  message?: string | null;
}

export interface LeadUpdateInput {
  tenant_id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  service_id?: string | null;
  status?: LeadStatus;
  message?: string | null;
}

export interface Service {
  id: string;
  tenant_id: string | null;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  benefits: string[];
  image: string;
  gallery: string[] | null;
  icon: string;
  category: ServiceCategory;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreateInput {
  tenant_id?: string | null;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  benefits: string[];
  image: string;
  gallery?: string[] | null;
  icon: string;
  category: ServiceCategory;
  status?: ServiceStatus;
}

export interface ServiceUpdateInput {
  tenant_id?: string | null;
  slug?: string;
  title?: string;
  description?: string;
  short_description?: string;
  benefits?: string[];
  image?: string;
  gallery?: string[] | null;
  icon?: string;
  category?: ServiceCategory;
  status?: ServiceStatus;
}

export interface Supplier {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  document: string | null;
  products: string | null;
  representative: string | null;
  phone: string | null;
  email: string | null;
  catalog: string | null;
  documents: string | null;
  status: SupplierStatus;
  created_at: string;
  updated_at: string;
}

export interface SupplierCreateInput {
  tenant_id: string;
  name: string;
  slug: string;
  document?: string | null;
  products?: string | null;
  representative?: string | null;
  phone?: string | null;
  email?: string | null;
  catalog?: string | null;
  documents?: string | null;
  status?: SupplierStatus;
}

export interface SupplierUpdateInput {
  tenant_id?: string;
  name?: string;
  slug?: string;
  document?: string | null;
  products?: string | null;
  representative?: string | null;
  phone?: string | null;
  email?: string | null;
  catalog?: string | null;
  documents?: string | null;
  status?: SupplierStatus;
}

export interface Partner {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  document: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  status: PartnerStatus;
  created_at: string;
  updated_at: string;
}

export interface PartnerCreateInput {
  tenant_id: string;
  name: string;
  slug: string;
  document?: string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  status?: PartnerStatus;
}

export interface PartnerUpdateInput {
  tenant_id?: string;
  name?: string;
  slug?: string;
  document?: string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  status?: PartnerStatus;
}

export interface BudgetRequest {
  id: string;
  tenant_id: string;
  name: string;
  company: string;
  cnpj: string;
  city: string | null;
  state: string | null;
  email: string;
  phone: string;
  whatsapp: string | null;
  service_id: string | null;
  posts: number;
  message: string | null;
  status: BudgetStatus;
  created_at: string;
  updated_at: string;
  service?: Database['public']['Tables']['services']['Row'];
}

export interface BudgetRequestCreateInput {
  tenant_id: string;
  name: string;
  company: string;
  cnpj: string;
  city?: string | null;
  state?: string | null;
  email: string;
  phone: string;
  whatsapp?: string | null;
  service_id?: string | null;
  posts?: number;
  message?: string | null;
  status?: BudgetStatus;
}

export interface BudgetRequestUpdateInput {
  tenant_id?: string;
  name?: string;
  company?: string;
  cnpj?: string;
  city?: string | null;
  state?: string | null;
  email?: string;
  phone?: string;
  whatsapp?: string | null;
  service_id?: string | null;
  posts?: number;
  message?: string | null;
  status?: BudgetStatus;
}
