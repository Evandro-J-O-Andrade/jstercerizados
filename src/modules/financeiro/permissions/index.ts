export const FINANCEIRO_PERMISSIONS = {
  dashboardRead: 'finance.read',
  accountsReceivableRead: 'accounts_receivable.read',
  accountsReceivableCreate: 'accounts_receivable.create',
  accountsPayableRead: 'accounts_payable.read',
  accountsPayableCreate: 'accounts_payable.create',
  cashFlowRead: 'cash_flows.read',
  invoicesRead: 'invoices.read',
  invoicesCreate: 'invoices.create',
  reconciliationRead: 'bank_reconciliations.read',
  accountingRead: 'accounting.read',
} as const;
