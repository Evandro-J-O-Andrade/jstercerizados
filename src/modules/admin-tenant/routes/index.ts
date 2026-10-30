/**
 * Rotas da célula admin-tenant — ambiente exclusivo do proprietário.
 *
 * Todas as rotas desta célula são protegidas e exigem perfil de proprietário.
 */

import { ADMIN_TENANT_PERMISSIONS } from '../permissions';

export const adminTenantRoutes = [
  {
    path: '',
    label: 'Dashboard do Proprietário',
    component: 'OwnerDashboardPage',
    permission: ADMIN_TENANT_PERMISSIONS.dashboardRead,
    isOwner: true,
  },
  {
    path: 'tenants',
    label: 'Tenants',
    component: 'TenantsPage',
    permission: ADMIN_TENANT_PERMISSIONS.tenantsRead,
  },
  {
    path: 'sistemas',
    label: 'Sistemas',
    component: 'SystemsPage',
    permission: ADMIN_TENANT_PERMISSIONS.systemsRead,
  },
  {
    path: 'unidades',
    label: 'Unidades',
    component: 'UnitsPage',
    permission: ADMIN_TENANT_PERMISSIONS.unitsRead,
  },
  {
    path: 'administradores',
    label: 'Administradores',
    component: 'AdministratorsPage',
    permission: ADMIN_TENANT_PERMISSIONS.administratorsRead,
  },
  {
    path: 'gestao',
    label: 'Gestões',
    component: 'ManagementPage',
    permission: ADMIN_TENANT_PERMISSIONS.managementRead,
  },
  {
    path: 'seguranca',
    label: 'Segurança',
    component: 'SecurityPage',
    permission: ADMIN_TENANT_PERMISSIONS.securityRead,
  },
  {
    path: 'auditoria',
    label: 'Auditoria',
    component: 'AuditPage',
    permission: ADMIN_TENANT_PERMISSIONS.auditRead,
  },
  {
    path: 'configuracoes',
    label: 'Configurações',
    component: 'SettingsPage',
    permission: ADMIN_TENANT_PERMISSIONS.settingsRead,
  },
] as const;
