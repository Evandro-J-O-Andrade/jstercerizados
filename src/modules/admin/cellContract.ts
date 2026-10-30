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
  routes: adminCellRoutes,
  permissions: Object.values(ADMIN_PERMISSIONS),
  enabled: true,
};
