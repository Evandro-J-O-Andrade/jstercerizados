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
  version: '1.0.0',
  description: 'Operações: gestão de operações do dia a dia.',
  category: 'operações',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/operacoes',
  routes: operacoesCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Operações', icon: 'Layout' },
  permissions: Object.values(OPERACOES_PERMISSIONS),
  enabled: true,
};
