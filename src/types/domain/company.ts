export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Company {
  id: string;
  name: string;
  legal_name: string | null;
  document: string | null;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreateInput {
  name: string;
  legal_name?: string | null;
  document?: string | null;
  status?: CompanyStatus;
}

export interface CompanyUpdateInput {
  name?: string;
  legal_name?: string | null;
  document?: string | null;
  status?: CompanyStatus;
}
