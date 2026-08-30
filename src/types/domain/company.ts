export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Company {
  id: string;
  name: string;
  trading_name: string | null;
  cnpj: string | null;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
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
