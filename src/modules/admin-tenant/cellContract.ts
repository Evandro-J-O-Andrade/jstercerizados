import type { CellContract, CellRoute } from '@/core/types';
import { adminTenantRoutes } from './routes';
import { ADMIN_TENANT_PERMISSIONS } from './permissions';

const adminTenantCellRoutes: CellRoute[] = adminTenantRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const adminTenantCellContract: CellContract = {
  id: 'admin-tenant',
  name: 'Admin Tenant — Proprietário',
  version: '1.0.0',
  description: 'Ambiente exclusivo do proprietário: visão geral, tenants, sistemas, unidades, administradores, gestões e permissões, segurança, auditoria e configurações.',
  category: 'governança',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/admin-tenant',
  routes: adminTenantCellRoutes,
  layout: { skipLayout: true },
  navigation: { sidebar: true, label: 'Administração do Proprietário', icon: 'ShieldCheck' },
  permissions: Object.values(ADMIN_TENANT_PERMISSIONS),
  enabled: true,
};
