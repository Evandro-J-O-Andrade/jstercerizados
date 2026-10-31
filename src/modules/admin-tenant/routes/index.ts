/**
 * Rotas da célula admin-tenant — ambiente exclusivo do proprietário.
 *
 * Todas as rotas desta célula são protegidas e exigem perfil de proprietário.
 */

import type { ModuleRoute } from '@/platform/router/types';
import { lazy } from 'react';
import { ADMIN_TENANT_PERMISSIONS } from '../permissions';

const OwnerDashboardPage = lazy(() => import('../pages/OwnerDashboardPage'));
const TenantsPage = lazy(() => import('../pages/TenantsPage'));
const SystemsPage = lazy(() => import('../pages/SystemsPage'));
const UnitsPage = lazy(() => import('../pages/UnitsPage'));
const AdministratorsPage = lazy(() => import('../pages/AdministratorsPage'));
const ManagementPage = lazy(() => import('../pages/ManagementPage'));
const SecurityPage = lazy(() => import('../pages/SecurityPage'));
const AuditPage = lazy(() => import('../pages/AuditPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

export const adminTenantRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard do Proprietário',
    element: OwnerDashboardPage as unknown as ModuleRoute['element'],
    requiredPermissions: [ADMIN_TENANT_PERMISSIONS.dashboardRead],
    icon: 'ShieldCheck',
  },
  {
    path: 'tenants',
    label: 'Tenants',
    element: TenantsPage as unknown as ModuleRoute['element'],
    requiredPermissions: [ADMIN_TENANT_PERMISSIONS.tenantsRead],
    icon: 'Building2',
  },
  {
    path: 'sistemas',
    label: 'Sistemas',
    element: SystemsPage as unknown as ModuleRoute['element'],
    requiredPermissions: [ADMIN_TENANT_PERMISSIONS.systemsRead],
    icon: 'BriefcaseBusiness',
  },
  {
    path: 'unidades',
    label: 'Unidades',
    element: UnitsPage as unknown as ModuleRoute['element'],
    requiredPermissions: [ADMIN_TENANT_PERMISSIONS.unitsRead],
    icon: 'Users',
  },
  {
    path: 'administradores',
    label: 'Administradores',
    element: AdministratorsPage as unknown as ModuleRoute['element'],
    requiredPermissions: [ADMIN_TENANT_PERMISSIONS.administratorsRead],
    icon: 'UserPlus',
  },
  {
    path: 'gestao',
    label: 'Gestões',
    element: ManagementPage as unknown as ModuleRoute['element'],
    requiredPermissions: [ADMIN_TENANT_PERMISSIONS.managementRead],
    icon: 'Wrench',
  },
  {
    path: 'seguranca',
    label: 'Segurança',
    element: SecurityPage as unknown as ModuleRoute['element'],
    requiredPermissions: [ADMIN_TENANT_PERMISSIONS.securityRead],
    icon: 'Lock',
  },
  {
    path: 'auditoria',
    label: 'Auditoria',
    element: AuditPage as unknown as ModuleRoute['element'],
    requiredPermissions: [ADMIN_TENANT_PERMISSIONS.auditRead],
    icon: 'Activity',
  },
  {
    path: 'configuracoes',
    label: 'Configurações',
    element: SettingsPage as unknown as ModuleRoute['element'],
    requiredPermissions: [ADMIN_TENANT_PERMISSIONS.settingsRead],
    icon: 'Settings',
  },
];
