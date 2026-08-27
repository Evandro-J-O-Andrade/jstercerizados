export interface AccountingEntry {
  id: string;
  tenant_id: string;
  company_id: string | null;
  chart_account_id: string | null;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface AccountingEntryCreateInput {
  tenant_id: string;
  company_id?: string | null;
  chart_account_id?: string | null;
  date: string;
  description: string;
  debit: number;
  credit: number;
}

export interface ChartOfAccount {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ChartOfAccountCreateInput {
  tenant_id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: string | null;
  status?: 'active' | 'inactive';
}
