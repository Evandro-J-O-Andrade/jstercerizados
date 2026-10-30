import type { CellContract, CellRoute } from '@/core/types';
import { contabilidadeRoutes } from './routes';
import { CONTABILIDADE_PERMISSIONS } from './permissions';

const contabilidadeCellRoutes: CellRoute[] = contabilidadeRoutes.map(
  (route) => ({
    path: route.path,
    label: route.label,
    requiredPermissions: route.requiredPermissions,
    icon: route.icon,
    children: route.children,
    implementationStatus: route.implementationStatus,
  }),
);

export const contabilidadeCellContract: CellContract = {
  id: 'contabilidade',
  name: 'Contabilidade',
  routes: contabilidadeCellRoutes,
  permissions: Object.values(CONTABILIDADE_PERMISSIONS),
  enabled: true,
};
