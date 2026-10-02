export const POS_PERMISSIONS = {
  dashboardRead: 'pos_sales.read',
  saleCreate: 'pos_sales.create',
  saleCancel: 'pos_cancellations.create',
  cashierManage: 'pos_cashiers.manage',
  terminalManage: 'pos_terminals.manage',
  closeCashier: 'pos_daily_closures.create',
} as const;
