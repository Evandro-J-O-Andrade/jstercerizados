import type { CellContract, CellRoute } from '@/core/types';
import { empresasRoutes } from './routes';
import { EMPRESAS_PERMISSIONS } from './permissions';

const empresasCellRoutes: CellRoute[] = empresasRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const empresasCellContract: CellContract = {
  id: 'empresas',
  name: 'Empresas',
  version: '1.0.0',
  description: 'Cadastro e gestão de empresas clientes e parceiros.',
  category: 'comercial',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/empresas',
  routes: empresasCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Empresas', icon: 'Building' },
  permissions: Object.values(EMPRESAS_PERMISSIONS),
  enabled: true,
};
