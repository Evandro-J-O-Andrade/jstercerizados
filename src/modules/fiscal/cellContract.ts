import type { CellContract, CellRoute } from '@/core/types';
import { fiscalRoutes } from './routes';
import { FISCAL_PERMISSIONS } from './permissions';

const fiscalCellRoutes: CellRoute[] = fiscalRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const fiscalCellContract: CellContract = {
  id: 'fiscal',
  name: 'Fiscal',
  version: '1.0.0',
  description: 'Fiscal: apuração, obrigações e relatórios fiscais.',
  category: 'fiscal',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/fiscal',
  routes: fiscalCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Fiscal', icon: 'FileText' },
  permissions: Object.values(FISCAL_PERMISSIONS),
  enabled: true,
};
