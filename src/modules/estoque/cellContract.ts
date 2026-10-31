import type { CellContract, CellRoute } from '@/core/types';
import { estoqueRoutes } from './routes';
import { ESTOQUE_PERMISSIONS } from './permissions';

const estoqueCellRoutes: CellRoute[] = estoqueRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const estoqueCellContract: CellContract = {
  id: 'estoque',
  name: 'Estoque',
  version: '1.0.0',
  description: 'Estoque: produtos, materiais, movimentações e almoxarifados.',
  category: 'estoque',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/estoque',
  routes: estoqueCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Estoque', icon: 'Package' },
  permissions: Object.values(ESTOQUE_PERMISSIONS),
  enabled: true,
};
