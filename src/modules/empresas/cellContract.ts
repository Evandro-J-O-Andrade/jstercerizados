import type { CellContract, CellRoute } from '@/core/types';
import { empresasRoutes } from './routes';
import { EMPRESAS_PERMISSIONS } from './permissions';

const empresasCellRoutes: CellRoute[] = empresasRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const empresasCellContract: CellContract = {
  id: 'empresas',
  name: 'Empresas',
  routes: empresasCellRoutes,
  permissions: Object.values(EMPRESAS_PERMISSIONS),
  enabled: true,
};
