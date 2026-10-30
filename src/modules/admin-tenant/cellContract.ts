import type { CellContract, CellRoute } from '@/core/types';
import { adminTenantRoutes } from './routes';
import { ADMIN_TENANT_PERMISSIONS } from './permissions';

const adminTenantCellRoutes: CellRoute[] = adminTenantRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.permission ? [route.permission] : [],
  icon: (route as any).isOwner ? 'ShieldCheck' : undefined,
  children: undefined,
  implementationStatus: 'implemented',
}));

export const adminTenantCellContract: CellContract = {
  id: 'admin-tenant',
  name: 'Admin Tenant — Proprietário',
  routes: adminTenantCellRoutes,
  permissions: Object.values(ADMIN_TENANT_PERMISSIONS),
  enabled: true,
};
