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

export interface FinancialCategory {
  id: string;
  tenant_id: string;
  name: string;
  type: 'revenue' | 'expense' | 'transfer';
  parent_id: string | null;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface FinancialCategoryCreateInput {
  tenant_id: string;
  name: string;
  type: 'revenue' | 'expense' | 'transfer';
  parent_id?: string | null;
  description?: string | null;
  status?: 'active' | 'inactive';
}

export interface FinancialCategoryUpdateInput {
  name?: string;
  type?: 'revenue' | 'expense' | 'transfer';
  parent_id?: string | null;
  description?: string | null;
  status?: 'active' | 'inactive';
}

export interface CostCenter {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CostCenterCreateInput {
  tenant_id: string;
  name: string;
  code: string;
  description?: string | null;
  status?: 'active' | 'inactive';
}

export interface CostCenterUpdateInput {
  name?: string;
  code?: string;
  description?: string | null;
  status?: 'active' | 'inactive';
}

export interface Invoice {
  id: string;
  tenant_id: string;
  number: string;
  company_id: string | null;
  customer_id: string | null;
  issue_date: string;
  due_date: string;
  amount: number;
  status: 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface InvoiceCreateInput {
  tenant_id: string;
  number: string;
  company_id?: string | null;
  customer_id?: string | null;
  issue_date: string;
  due_date: string;
  amount: number;
  status?: 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue';
}

export interface InvoiceUpdateInput {
  number?: string;
  company_id?: string | null;
  customer_id?: string | null;
  issue_date?: string;
  due_date?: string;
  amount?: number;
  status?: 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue';
}

export interface InvoiceItem {
  id: string;
  tenant_id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItemCreateInput {
  tenant_id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceItemUpdateInput {
  description?: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
}

export interface FinancialTransaction {
  id: string;
  tenant_id: string;
  cost_center_id: string;
  category_id: string | null;
  type: 'debit' | 'credit' | 'transfer';
  amount: number;
  competence_date: string;
  payment_date: string | null;
  bank_account: string | null;
  description: string;
  reference: string | null;
  origin_document_type: string | null;
  origin_document_id: string | null;
  actor_person_id: string | null;
  correlation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransactionCreateInput {
  tenant_id: string;
  cost_center_id: string;
  category_id?: string | null;
  type: 'debit' | 'credit' | 'transfer';
  amount: number;
  competence_date: string;
  payment_date?: string | null;
  bank_account?: string | null;
  description: string;
  reference?: string | null;
  origin_document_type?: string | null;
  origin_document_id?: string | null;
  actor_person_id?: string | null;
  correlation_id?: string | null;
}

export interface FinancialTransactionUpdateInput {
  cost_center_id?: string;
  category_id?: string | null;
  type?: 'debit' | 'credit' | 'transfer';
  amount?: number;
  competence_date?: string;
  payment_date?: string | null;
  bank_account?: string | null;
  description?: string;
  reference?: string | null;
  origin_document_type?: string | null;
  origin_document_id?: string | null;
}

export interface BankReconciliation {
  id: string;
  tenant_id: string;
  bank_account: string;
  statement_date: string;
  statement_balance: number;
  reconciled_balance: number;
  difference: number;
  status: 'pending' | 'completed' | 'discrepancy';
  notes: string | null;
  actor_person_id: string | null;
  correlation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankReconciliationCreateInput {
  tenant_id: string;
  bank_account: string;
  statement_date: string;
  statement_balance: number;
  reconciled_balance: number;
  difference: number;
  status?: 'pending' | 'completed' | 'discrepancy';
  notes?: string | null;
  actor_person_id?: string | null;
  correlation_id?: string | null;
}

export interface BankReconciliationUpdateInput {
  bank_account?: string;
  statement_date?: string;
  statement_balance?: number;
  reconciled_balance?: number;
  difference?: number;
  status?: 'pending' | 'completed' | 'discrepancy';
  notes?: string | null;
}

export interface FinancialInstallment {
  id: string;
  tenant_id: string;
  account_receivable_id: string | null;
  account_payable_id: string | null;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: 'open' | 'paid' | 'cancelled' | 'overdue';
  actor_person_id: string | null;
  correlation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialInstallmentCreateInput {
  tenant_id: string;
  account_receivable_id?: string | null;
  account_payable_id?: string | null;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  status?: 'open' | 'paid' | 'cancelled' | 'overdue';
  actor_person_id?: string | null;
  correlation_id?: string | null;
}

export interface FinancialInstallmentUpdateInput {
  installment_number?: number;
  total_installments?: number;
  amount?: number;
  due_date?: string;
  paid_at?: string | null;
  status?: 'open' | 'paid' | 'cancelled' | 'overdue';
}

export interface FinancialAccount {
  id: string;
  tenant_id: string;
  name: string;
  bank: string | null;
  agency: string | null;
  account_number: string | null;
  account_type: 'checking' | 'savings' | 'investment';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface FinancialAccountCreateInput {
  tenant_id: string;
  name: string;
  bank?: string | null;
  agency?: string | null;
  account_number?: string | null;
  account_type?: 'checking' | 'savings' | 'investment';
  status?: 'active' | 'inactive';
}

export interface FinancialAccountUpdateInput {
  name?: string;
  bank?: string | null;
  agency?: string | null;
  account_number?: string | null;
  account_type?: 'checking' | 'savings' | 'investment';
  status?: 'active' | 'inactive';
}
