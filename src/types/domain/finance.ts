export interface AccountPayable {
  id: string;
  tenant_id: string;
  company_id: string | null;
  description: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'open' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountPayableCreateInput {
  tenant_id: string;
  company_id?: string | null;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string | null;
  status?: 'open' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface AccountPayableUpdateInput {
  company_id?: string | null;
  description?: string;
  amount?: number;
  due_date?: string;
  paid_date?: string | null;
  status?: 'open' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
}

export interface AccountReceivable {
  id: string;
  tenant_id: string;
  company_id: string | null;
  description: string;
  amount: number;
  due_date: string;
  received_date: string | null;
  status: 'open' | 'received' | 'overdue' | 'cancelled' | 'partially_received';
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountReceivableCreateInput {
  tenant_id: string;
  company_id?: string | null;
  description: string;
  amount: number;
  due_date: string;
  received_date?: string | null;
  status?: 'open' | 'received' | 'overdue' | 'cancelled' | 'partially_received';
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface AccountReceivableUpdateInput {
  company_id?: string | null;
  description?: string;
  amount?: number;
  due_date?: string;
  received_date?: string | null;
  status?: 'open' | 'received' | 'overdue' | 'cancelled' | 'partially_received';
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
}

export interface CashFlow {
  id: string;
  tenant_id: string;
  company_id: string | null;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  reference: string | null;
  related_account_payable_id: string | null;
  related_account_receivable_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashFlowCreateInput {
  tenant_id: string;
  company_id?: string | null;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
  category?: string | null;
  subcategory?: string | null;
  description?: string | null;
  reference?: string | null;
  related_account_payable_id?: string | null;
  related_account_receivable_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface CashFlowUpdateInput {
  company_id?: string | null;
  type?: 'income' | 'expense' | 'transfer';
  amount?: number;
  date?: string;
  category?: string | null;
  subcategory?: string | null;
  description?: string | null;
  reference?: string | null;
  related_account_payable_id?: string | null;
  related_account_receivable_id?: string | null;
  notes?: string | null;
}

export interface BankAccount {
  id: string;
  tenant_id: string;
  company_id: string | null;
  bank: string;
  agency: string | null;
  account_number: string | null;
  account_type: 'checking' | 'savings' | 'investment' | null;
  current_balance: number;
  available_balance: number;
  status: 'active' | 'inactive' | 'blocked';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankAccountCreateInput {
  tenant_id: string;
  company_id?: string | null;
  bank: string;
  agency?: string | null;
  account_number?: string | null;
  account_type?: 'checking' | 'savings' | 'investment' | null;
  current_balance?: number;
  available_balance?: number;
  status?: 'active' | 'inactive' | 'blocked';
  notes?: string | null;
}

export interface BankAccountUpdateInput {
  company_id?: string | null;
  bank?: string;
  agency?: string | null;
  account_number?: string | null;
  account_type?: 'checking' | 'savings' | 'investment' | null;
  current_balance?: number;
  available_balance?: number;
  status?: 'active' | 'inactive' | 'blocked';
  notes?: string | null;
}

export interface CostCenter {
  id: string;
  tenant_id: string;
  company_id: string | null;
  name: string;
  code: string | null;
  parent_id: string | null;
  status: 'active' | 'inactive';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CostCenterCreateInput {
  tenant_id: string;
  company_id?: string | null;
  name: string;
  code?: string | null;
  parent_id?: string | null;
  status?: 'active' | 'inactive';
  notes?: string | null;
}

export interface CostCenterUpdateInput {
  company_id?: string | null;
  name?: string;
  code?: string | null;
  parent_id?: string | null;
  status?: 'active' | 'inactive';
  notes?: string | null;
}

export interface Payment {
  id: string;
  tenant_id: string;
  company_id: string | null;
  account_payable_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentCreateInput {
  tenant_id: string;
  company_id?: string | null;
  account_payable_id?: string | null;
  amount: number;
  payment_date: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface PaymentUpdateInput {
  company_id?: string | null;
  account_payable_id?: string | null;
  amount?: number;
  payment_date?: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
}

export interface Receipt {
  id: string;
  tenant_id: string;
  company_id: string | null;
  account_receivable_id: string | null;
  amount: number;
  received_date: string;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReceiptCreateInput {
  tenant_id: string;
  company_id?: string | null;
  account_receivable_id?: string | null;
  amount: number;
  received_date: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface ReceiptUpdateInput {
  company_id?: string | null;
  account_receivable_id?: string | null;
  amount?: number;
  received_date?: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
}
