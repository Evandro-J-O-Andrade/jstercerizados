import type { CellContract, CellRoute } from '@/core/types';
import { CandidatoRoutes } from './CandidatoRoutes';
import { CANDIDATO_PERMISSIONS } from './permissions';

const candidatoCellRoutes: CellRoute[] = CandidatoRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const candidatoCellContract: CellContract = {
  id: 'candidato',
  name: 'Candidato',
  routes: candidatoCellRoutes,
  permissions: Object.values(CANDIDATO_PERMISSIONS),
  enabled: true,
};
