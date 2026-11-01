export const CRM_PERMISSIONS = { read: 'companies.read', manage: 'companies.read' } as const;
export type CrmPermissionKey = (typeof CRM_PERMISSIONS)[keyof typeof CRM_PERMISSIONS];
