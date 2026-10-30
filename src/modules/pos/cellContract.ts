import type { CellContract, CellRoute } from '@/core/types';
import { posRoutes } from './routes';
import { POS_PERMISSIONS } from './permissions';

const posCellRoutes: CellRoute[] = posRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const posCellContract: CellContract = {
  id: 'pos',
  name: 'PDV',
  routes: posCellRoutes,
  permissions: Object.values(POS_PERMISSIONS),
  enabled: true,
};
