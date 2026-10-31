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
  version: '1.0.0',
  description: 'Contabilidade: plano de contas, lançamentos e relatórios contábeis.',
  category: 'contabilidade',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/contabilidade',
  routes: contabilidadeCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Contabilidade', icon: 'Book' },
  permissions: Object.values(CONTABILIDADE_PERMISSIONS),
  enabled: true,
};
