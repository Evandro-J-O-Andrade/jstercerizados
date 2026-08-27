export interface Invoice {
  id: string;
  tenant_id: string;
  company_id: string | null;
  number: string;
  series: string;
  issue_date: string;
  due_date: string;
  amount: number;
  tax_amount: number;
  status: 'draft' | 'issued' | 'paid' | 'cancelled' | 'voided';
  created_at: string;
  updated_at: string;
}

export interface InvoiceCreateInput {
  tenant_id: string;
  company_id?: string | null;
  number: string;
  series: string;
  issue_date: string;
  due_date: string;
  amount: number;
  tax_amount: number;
  status?: 'draft' | 'issued' | 'paid' | 'cancelled' | 'voided';
}

export interface Sale {
  id: string;
  tenant_id: string;
  company_id: string | null;
  description: string;
  amount: number;
  sale_date: string;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleCreateInput {
  tenant_id: string;
  company_id?: string | null;
  description: string;
  amount: number;
  sale_date: string;
  payment_method?: string | null;
}

export interface Quote {
  id: string;
  tenant_id: string;
  company_id: string | null;
  number: string;
  description: string;
  amount: number;
  valid_until: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface QuoteCreateInput {
  tenant_id: string;
  company_id?: string | null;
  number: string;
  description: string;
  amount: number;
  valid_until: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected';
}
