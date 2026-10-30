import type { CellContract, CellRoute } from '@/core/types';
import { avaRoutes } from './routes';
import { AVA_PERMISSIONS } from './permissions';

const avaCellRoutes: CellRoute[] = avaRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const avaCellContract: CellContract = {
  id: 'ava',
  name: 'AVA',
  routes: avaCellRoutes,
  permissions: Object.values(AVA_PERMISSIONS),
  enabled: true,
};
