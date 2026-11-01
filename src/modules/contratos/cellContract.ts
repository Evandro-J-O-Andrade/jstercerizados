import type { CellContract, CellRoute } from '@/core/types';
import { contratosRoutes } from './routes';
import { CONTRATOS_PERMISSIONS } from './permissions';

const contratosCellRoutes: CellRoute[] = contratosRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const contratosCellContract: CellContract = {
  id: 'contratos',
  name: 'Contratos',
  version: '1.0.0',
  description: 'Contratos: gestão e histórico de status.',
  category: 'contratos',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/contratos',
  routes: contratosCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Contratos', icon: 'FileText' },
  permissions: Object.values(CONTRATOS_PERMISSIONS),
  enabled: true,
};
