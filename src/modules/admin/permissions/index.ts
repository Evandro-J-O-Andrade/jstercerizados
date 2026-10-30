export const ADMIN_PERMISSIONS = {
  dashboardRead: 'admin.read',
  dashboardWrite: 'admin.write',
  tenantRead: 'admin.tenants.read',
  tenantWrite: 'admin.tenants.manage',
  roleRead: 'admin.roles.read',
  roleWrite: 'admin.roles.manage',
  permissionRead: 'admin.permissions.read',
  permissionWrite: 'admin.permissions.manage',
  userRead: 'admin.users.read',
  userWrite: 'admin.users.manage',
  auditRead: 'admin.audit.read',
  securityRead: 'admin.security.read',
  sessionRead: 'admin.sessions.read',
  subscriptionRead: 'admin.subscriptions.read',
  subscriptionWrite: 'admin.subscriptions.manage',
  integrationRead: 'admin.integrations.read',
  integrationWrite: 'admin.integrations.manage',
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];
