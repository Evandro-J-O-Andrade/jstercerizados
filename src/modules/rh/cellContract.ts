import type { CellContract, CellRoute } from '@/core/types';
import { rhRoutes } from './routes';

const rhCellRoutes: CellRoute[] = rhRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const rhCellContract: CellContract = {
  id: 'rh',
  name: 'RH',
  routes: rhCellRoutes,
  permissions: [
    'people.read',
    'people.create',
    'people.update',
    'people.disable',
    'people.export',
    'candidates.read',
    'jobs.read',
    'applications.read',
    'recruitment.stage.manage',
    'recruitment.read',
  ],
  enabled: true,
};
