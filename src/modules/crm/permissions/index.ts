export const CRM_PERMISSIONS = {
  crmRead: 'crm.read',
  crmCreate: 'crm.create',
  crmUpdate: 'crm.update',
  crmDelete: 'crm.delete',
  crmExport: 'crm.export',
} as const;

export type CrmPermission = (typeof CRM_PERMISSIONS)[keyof typeof CRM_PERMISSIONS];
