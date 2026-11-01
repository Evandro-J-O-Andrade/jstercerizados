export const INTEGRACOES_PERMISSIONS = {
  read: 'integrations.manage',
  manage: 'integrations.manage',
} as const;

export type IntegracoesPermissionKey =
  (typeof INTEGRACOES_PERMISSIONS)[keyof typeof INTEGRACOES_PERMISSIONS];
