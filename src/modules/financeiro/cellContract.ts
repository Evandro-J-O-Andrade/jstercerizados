import type { CellContract, CellRoute } from '@/core/types';
import { financeiroRoutes } from './routes';
import { FINANCEIRO_PERMISSIONS } from './permissions';

const financeiroCellRoutes: CellRoute[] = financeiroRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const financeiroCellContract: CellContract = {
  id: 'financeiro',
  name: 'Financeiro',
  version: '1.0.0',
  description: 'Gestão financeira: movimentações, contas a pagar e receber.',
  category: 'financeiro',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/financeiro',
  routes: financeiroCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Financeiro', icon: 'CreditCard' },
  permissions: Object.values(FINANCEIRO_PERMISSIONS),
  enabled: true,
};
