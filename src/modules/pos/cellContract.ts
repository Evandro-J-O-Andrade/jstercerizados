import type { CellContract, CellRoute } from '@/core/types';
import { posRoutes } from './routes';
import { POS_PERMISSIONS } from './permissions';

const posCellRoutes: CellRoute[] = posRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const posCellContract: CellContract = {
  id: 'pos',
  name: 'PDV',
  version: '1.0.0',
  description: 'PDV: ponto de venda, vendas e movimentações de caixa.',
  category: 'pdv',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/pos',
  routes: posCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'PDV', icon: 'ShoppingCart' },
  permissions: Object.values(POS_PERMISSIONS),
  enabled: true,
};
