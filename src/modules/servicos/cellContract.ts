import type { CellContract, CellRoute } from '@/core/types';
import { servicosRoutes } from './routes';
import { SERVICOS_PERMISSIONS } from './permissions';

const servicosCellRoutes: CellRoute[] = servicosRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const servicosCellContract: CellContract = {
  id: 'servicos',
  name: 'Serviços',
  routes: servicosCellRoutes,
  permissions: Object.values(SERVICOS_PERMISSIONS),
  enabled: true,
};
