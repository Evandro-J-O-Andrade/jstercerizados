import type { CellContract, CellRoute } from '@/core/types';
import { adminMasterRoutes } from './routes';
import { ADMIN_MASTER_PERMISSIONS } from './permissions';

const adminMasterCellRoutes: CellRoute[] = adminMasterRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.permission ? [route.permission] : [],
  icon: 'isGlobal' in route && route.isGlobal ? 'ShieldCheck' : undefined,
  children: undefined,
  implementationStatus: 'implemented',
}));

export const adminMasterCellContract: CellContract = {
  id: 'admin-master',
  name: 'Admin Master Global',
  version: '1.0.0',
  description:
    'Governança Admin Master: administração ROOT da plataforma, tenants globais e configurações. Central 24H (/dashboard/global) observa células com evidência; Admin Master (/dashboard/admin-master) governa.',
  category: 'administração',
  domain: 'global',
  scope: 'global',
  lifecycle: { status: 'active', health: 'unknown' },
  homeRoute: '/dashboard/admin-master',
  routes: adminMasterCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Admin Master', icon: 'ShieldCheck' },
  permissions: Object.values(ADMIN_MASTER_PERMISSIONS),
  enabled: true,
};
