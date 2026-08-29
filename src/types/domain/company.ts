export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Company {
  id: string;
  legal_name: string;
  trading_name: string | null;
  cnpj: string | null;
  cnpj_root?: string | null;
  state_registration?: string | null;
  municipal_registration?: string | null;
  company_type_id?: string | null;
  industry?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  logo_url?: string | null;
  address?: Record<string, unknown> | null;
  size?: string | null;
  status: CompanyStatus;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface CompanyCreateInput {
  tenant_id: string;
  relationship_type_id?: string;
  legal_name: string;
  trading_name?: string | null;
  cnpj?: string | null;
  cnpj_root?: string | null;
  state_registration?: string | null;
  municipal_registration?: string | null;
  company_type_id?: string | null;
  industry?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  logo_url?: string | null;
  address?: Record<string, unknown> | null;
  size?: string | null;
  status?: CompanyStatus;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
  created_by?: string | null;
}

export interface CompanyUpdateInput {
  tenant_id?: string;
  relationship_type_id?: string;
  legal_name?: string;
  trading_name?: string | null;
  cnpj?: string | null;
  cnpj_root?: string | null;
  state_registration?: string | null;
  municipal_registration?: string | null;
  company_type_id?: string | null;
  industry?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  logo_url?: string | null;
  address?: Record<string, unknown> | null;
  size?: string | null;
  status?: CompanyStatus;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}
