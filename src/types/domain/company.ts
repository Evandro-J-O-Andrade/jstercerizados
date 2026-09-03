export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Company {
  id: string;
  tenant_id: string;
  name: string;
  legal_name: string | null;
  document: string | null;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
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
  address: Record<string, unknown> | null;
  size: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  description: string | null;
  short_description: string | null;
  company_segment: string | null;
  socials?: CompanySocials | null;
}

export interface CompanySocials {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}

export interface CompanyCreateInput {
  name: string;
  trading_name?: string | null;
  cnpj?: string | null;
  status?: CompanyStatus;
}

export interface CompanyUpdateInput {
  name?: string;
  trading_name?: string | null;
  cnpj?: string | null;
  status?: CompanyStatus;
}
