import type { Database } from '@/types/database';

export type CompanyStatus = Database['public']['Enums']['company_status'];

export interface Company {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  document: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  city: string | null;
  state: string | null;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
  tenantName?: string;
}

export interface CompanyCreateInput {
  tenant_id: string;
  name: string;
  slug: string;
  document?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  city?: string | null;
  state?: string | null;
  status?: CompanyStatus;
}

export interface CompanyUpdateInput {
  tenant_id?: string;
  name?: string;
  slug?: string;
  document?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  city?: string | null;
  state?: string | null;
  status?: CompanyStatus;
}
