import type { CellContract, CellRoute } from '@/core/types';
import { adminRoutes } from './routes';
import { ADMIN_PERMISSIONS } from './permissions';

const adminCellRoutes: CellRoute[] = adminRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const adminCellContract: CellContract = {
  id: 'admin',
  name: 'Administração',
  version: '1.0.0',
  description: 'Administração do ambiente: usuários, permissões, papéis e configurações.',
  category: 'administração',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/admin',
  routes: adminCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Administração', icon: 'Settings' },
  permissions: Object.values(ADMIN_PERMISSIONS),
  enabled: true,
};
