import type { CellContract, CellRoute } from '@/core/types';
import { fiscalRoutes } from './routes';
import { FISCAL_PERMISSIONS } from './permissions';

const fiscalCellRoutes: CellRoute[] = fiscalRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const fiscalCellContract: CellContract = {
  id: 'fiscal',
  name: 'Fiscal',
  routes: fiscalCellRoutes,
  permissions: Object.values(FISCAL_PERMISSIONS),
  enabled: true,
};
