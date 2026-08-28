import type { Database } from '@/types/database';

export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type CompanySize = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

export interface Company {
  id: string;
  legal_name: string;
  trading_name: string | null;
  cnpj: string | null;
  cnpj_root: string | null;
  state_registration: string | null;
  municipal_registration: string | null;
  company_type_id: string | null;
  industry: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  linkedin_url: string | null;
  logo_url: string | null;
  address: Database['public']['Tables']['companies']['Row']['address'];
  size: CompanySize | null;
  status: CompanyStatus;
  is_active: boolean;
  metadata: Database['public']['Tables']['companies']['Row']['metadata'];
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CompanyPublic {
  id: string;
  legal_name: string;
  status: CompanyStatus;
}

export interface CustomerPublic {
  id: string;
  name: string;
  legal_name: string | null;
  document: string | null;
  status: string;
}

export interface CompanyCreateInput {
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
  address?: Database['public']['Tables']['companies']['Row']['address'];
  size?: CompanySize | null;
  status?: CompanyStatus;
  is_active?: boolean;
  metadata?: Database['public']['Tables']['companies']['Row']['metadata'];
  created_by?: string | null;
}

export interface CompanyUpdateInput {
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
  address?: Database['public']['Tables']['companies']['Row']['address'];
  size?: CompanySize | null;
  status?: CompanyStatus;
  is_active?: boolean;
  metadata?: Database['public']['Tables']['companies']['Row']['metadata'];
  created_by?: string | null;
}
