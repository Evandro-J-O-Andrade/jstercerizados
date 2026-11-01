export const RELATORIOS_PERMISSIONS = { read: 'reports.read', manage: 'reports.read' } as const;
export type RelatoriosPermissionKey = (typeof RELATORIOS_PERMISSIONS)[keyof typeof RELATORIOS_PERMISSIONS];
