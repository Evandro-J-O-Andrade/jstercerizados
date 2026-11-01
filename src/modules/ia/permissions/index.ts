export const IA_PERMISSIONS = { read: 'ava.read', manage: 'ava.read' } as const;
export type IaPermissionKey = (typeof IA_PERMISSIONS)[keyof typeof IA_PERMISSIONS];
