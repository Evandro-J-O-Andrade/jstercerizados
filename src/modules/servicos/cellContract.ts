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
  version: '1.0.0',
  description: 'Serviços: ordens de serviço, atendimentos e operações.',
  category: 'serviços',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/servicos',
  routes: servicosCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Serviços', icon: 'Tool' },
  permissions: Object.values(SERVICOS_PERMISSIONS),
  enabled: true,
};
