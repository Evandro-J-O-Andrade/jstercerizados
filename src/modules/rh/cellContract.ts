import type { CellContract, CellRoute } from '@/core/types';
import { rhRoutes } from './routes';
import { RH_PERMISSIONS } from './permissions';

const rhCellRoutes: CellRoute[] = rhRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const rhCellContract: CellContract = {
  id: 'rh',
  name: 'RH',
  version: '1.0.0',
  description: 'Gestão de pessoas, funcionários, documentos e relatórios de RH.',
  category: 'rh',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/rh',
  routes: rhCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'RH', icon: 'Users' },
  permissions: Object.values(RH_PERMISSIONS),
  enabled: true,
};
