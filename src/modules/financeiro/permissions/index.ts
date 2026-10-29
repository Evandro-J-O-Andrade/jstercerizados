export const FINANCEIRO_PERMISSIONS = {
  dashboardRead: 'finance.dashboard.read',
  accountsReceivableRead: 'finance.accounts_receivable.read',
  accountsReceivableCreate: 'finance.accounts_receivable.create',
  accountsPayableRead: 'finance.accounts_payable.read',
  accountsPayableCreate: 'finance.accounts_payable.create',
  cashFlowRead: 'finance.cashflow.read',
  invoicesRead: 'finance.billing.read',
  invoicesCreate: 'finance.billing.create',
  reconciliationRead: 'finance.reports.read',
  accountingRead: 'finance.reports.read',
} as const;
