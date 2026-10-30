import type { CellContract, CellRoute } from '@/core/types';
import { RecrutamentoRoutes } from './RecrutamentoRoutes';
import { RECRUTAMENTO_PERMISSIONS } from './permissions';

const recrutamentoCellRoutes: CellRoute[] = RecrutamentoRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const recrutamentoCellContract: CellContract = {
  id: 'recrutamento',
  name: 'Recrutamento',
  routes: recrutamentoCellRoutes,
  permissions: Object.values(RECRUTAMENTO_PERMISSIONS),
  enabled: true,
};
