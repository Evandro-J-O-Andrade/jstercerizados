import type { CellContract, CellRoute } from '@/core/types';
import { suporteRoutes } from './routes';
import { SUPORTE_PERMISSIONS } from './permissions';

const suporteCellRoutes: CellRoute[] = suporteRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const suporteCellContract: CellContract = {
  id: 'suporte',
  name: 'Suporte',
  version: '1.0.0',
  description: 'Suporte: chamados, solicitações e atendimento ao cliente.',
  category: 'suporte',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/suporte',
  routes: suporteCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Suporte', icon: 'Headphones' },
  permissions: Object.values(SUPORTE_PERMISSIONS),
  enabled: true,
};
