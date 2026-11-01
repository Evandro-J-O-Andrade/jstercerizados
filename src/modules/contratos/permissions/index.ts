export const CONTRATOS_PERMISSIONS = {
  read: 'contracts.read',
  manage: 'contracts.manage',
} as const;

export type ContratosPermissionKey =
  (typeof CONTRATOS_PERMISSIONS)[keyof typeof CONTRATOS_PERMISSIONS];
