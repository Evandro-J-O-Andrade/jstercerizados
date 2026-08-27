export interface FiscalDocument {
  id: string;
  tenant_id: string;
  company_id: string | null;
  type: 'nfe' | 'nfce' | 'nfse' | 'cte' | 'mdfe' | 'nfs';
  number: string;
  series: string;
  issue_date: string;
  status: 'draft' | 'issued' | 'cancelled' | 'voided';
  amount: number;
  tax_amount: number;
  xml_url: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FiscalDocumentCreateInput {
  tenant_id: string;
  company_id?: string | null;
  type: 'nfe' | 'nfce' | 'nfse' | 'cte' | 'mdfe' | 'nfs';
  number: string;
  series: string;
  issue_date: string;
  amount: number;
  tax_amount: number;
  xml_url?: string | null;
  pdf_url?: string | null;
}

export interface FiscalConfiguration {
  id: string;
  tenant_id: string;
  company_id: string | null;
  fiscal_regime: string;
  state_registration: string;
  municipal_registration: string;
  cnae: string;
  certificate_url: string | null;
  certificate_password: string | null;
  environment: 'production' | 'homologation';
  created_at: string;
  updated_at: string;
}

export interface FiscalConfigurationCreateInput {
  tenant_id: string;
  company_id?: string | null;
  fiscal_regime: string;
  state_registration: string;
  municipal_registration: string;
  cnae: string;
  certificate_url?: string | null;
  certificate_password?: string | null;
  environment?: 'production' | 'homologation';
}
