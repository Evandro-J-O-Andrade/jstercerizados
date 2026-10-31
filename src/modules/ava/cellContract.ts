import type { CellContract, CellRoute } from '@/core/types';
import { avaRoutes } from './routes';
import { AVA_PERMISSIONS } from './permissions';

const avaCellRoutes: CellRoute[] = avaRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const avaCellContract: CellContract = {
  id: 'ava',
  name: 'AVA',
  version: '1.0.0',
  description: 'AVA: ambientes virtuais de aprendizado, tutoriais e cursos.',
  category: 'ava',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/ava',
  routes: avaCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'AVA', icon: 'GraduationCap' },
  permissions: Object.values(AVA_PERMISSIONS),
  enabled: true,
};
