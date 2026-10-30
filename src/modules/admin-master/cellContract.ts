import type { CellContract, CellRoute } from '@/core/types';
import { adminMasterRoutes } from './routes';
import { ADMIN_MASTER_PERMISSIONS } from './permissions';

const adminMasterCellRoutes: CellRoute[] = adminMasterRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.permission ? [route.permission] : [],
  icon: 'isGlobal' in route && route.isGlobal ? 'ShieldCheck' : undefined,
  children: undefined,
  implementationStatus: 'implemented',
}));

export const adminMasterCellContract: CellContract = {
  id: 'admin-master',
  name: 'Admin Master Global',
  routes: adminMasterCellRoutes,
  permissions: Object.values(ADMIN_MASTER_PERMISSIONS),
  enabled: true,
};
