export const FATURAMENTO_PERMISSIONS = { read: 'finance.billing.read', manage: 'finance.billing.read' } as const;
export type FaturamentoPermissionKey = (typeof FATURAMENTO_PERMISSIONS)[keyof typeof FATURAMENTO_PERMISSIONS];
