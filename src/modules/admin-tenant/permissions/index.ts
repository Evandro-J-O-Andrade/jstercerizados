/**
 * Permissões da célula admin-tenant — proprietário.
 *
 * Essas permissões são consultadas no banco via AuthContext e RLS.
 * O frontend nunca contorna a verificação de permissão.
 */

export const ADMIN_TENANT_PERMISSIONS = {
  dashboardRead: 'owner.dashboard.read',
  tenantsRead: 'owner.tenants.read',
  tenantsWrite: 'owner.tenants.manage',
  systemsRead: 'owner.systems.read',
  systemsWrite: 'owner.systems.manage',
  unitsRead: 'owner.units.read',
  unitsWrite: 'owner.units.manage',
  administratorsRead: 'owner.administrators.read',
  administratorsWrite: 'owner.administrators.manage',
  managementRead: 'owner.management.read',
  managementWrite: 'owner.management.manage',
  permissionsRead: 'owner.permissions.read',
  permissionsWrite: 'owner.permissions.manage',
  securityRead: 'owner.security.read',
  securityWrite: 'owner.security.manage',
  auditRead: 'owner.audit.read',
  settingsRead: 'owner.settings.read',
  settingsWrite: 'owner.settings.manage',
} as const;

export type AdminTenantPermission =
  (typeof ADMIN_TENANT_PERMISSIONS)[keyof typeof ADMIN_TENANT_PERMISSIONS];
