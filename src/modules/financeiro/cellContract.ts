import type { CellContract, CellRoute } from '@/core/types';
import { financeiroRoutes } from './routes';
import { FINANCEIRO_PERMISSIONS } from './permissions';

const financeiroCellRoutes: CellRoute[] = financeiroRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const financeiroCellContract: CellContract = {
  id: 'financeiro',
  name: 'Financeiro',
  routes: financeiroCellRoutes,
  permissions: Object.values(FINANCEIRO_PERMISSIONS),
  enabled: true,
};
