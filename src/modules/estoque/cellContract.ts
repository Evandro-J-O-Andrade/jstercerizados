import type { CellContract, CellRoute } from '@/core/types';
import { estoqueRoutes } from './routes';
import { ESTOQUE_PERMISSIONS } from './permissions';

const estoqueCellRoutes: CellRoute[] = estoqueRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const estoqueCellContract: CellContract = {
  id: 'estoque',
  name: 'Estoque',
  routes: estoqueCellRoutes,
  permissions: Object.values(ESTOQUE_PERMISSIONS),
  enabled: true,
};
