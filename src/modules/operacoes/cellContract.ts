import type { CellContract, CellRoute } from '@/core/types';
import { operacoesRoutes } from './routes';
import { OPERACOES_PERMISSIONS } from './permissions';

const operacoesCellRoutes: CellRoute[] = operacoesRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const operacoesCellContract: CellContract = {
  id: 'operacoes',
  name: 'Operações',
  routes: operacoesCellRoutes,
  permissions: Object.values(OPERACOES_PERMISSIONS),
  enabled: true,
};
