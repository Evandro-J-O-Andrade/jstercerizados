import type { CellContract, CellRoute } from '@/core/types';
import { suporteRoutes } from './routes';
import { SUPORTE_PERMISSIONS } from './permissions';

const suporteCellRoutes: CellRoute[] = suporteRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const suporteCellContract: CellContract = {
  id: 'suporte',
  name: 'Suporte',
  routes: suporteCellRoutes,
  permissions: Object.values(SUPORTE_PERMISSIONS),
  enabled: true,
};
