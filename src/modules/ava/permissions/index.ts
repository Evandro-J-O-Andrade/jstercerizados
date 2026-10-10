export const AVA_PERMISSIONS = {
  read: 'ava.read',
  manage: 'ava.manage',
} as const;

export type AvaPermissionKey =
  (typeof AVA_PERMISSIONS)[keyof typeof AVA_PERMISSIONS];
