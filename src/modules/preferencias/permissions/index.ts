export const PREFERENCIAS_PERMISSIONS = { read: 'tenant.manage', manage: 'tenant.manage' } as const;
export type PreferenciasPermissionKey = (typeof PREFERENCIAS_PERMISSIONS)[keyof typeof PREFERENCIAS_PERMISSIONS];
