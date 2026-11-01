import type { CellContract, CellRoute } from '@/core/types';
import { integracoesRoutes } from './routes';
import { INTEGRACOES_PERMISSIONS } from './permissions';

const integracoesCellRoutes: CellRoute[] = integracoesRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const integracoesCellContract: CellContract = {
  id: 'integracoes',
  name: 'Integrações',
  version: '1.0.0',
  description: 'Integrações: conexões, webhooks e sincronizações com serviços externos.',
  category: 'integracoes',
  domain: 'global',
  scope: 'global',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/integracoes',
  routes: integracoesCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Integrações', icon: 'Plug' },
  permissions: Object.values(INTEGRACOES_PERMISSIONS),
  enabled: true,
};
