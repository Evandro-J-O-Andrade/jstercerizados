export const CONFIGURACOES_SAAS_PERMISSIONS = { read: 'tenant.manage', manage: 'tenant.manage' } as const;
export type ConfiguracoesSaasPermissionKey = (typeof CONFIGURACOES_SAAS_PERMISSIONS)[keyof typeof CONFIGURACOES_SAAS_PERMISSIONS];
