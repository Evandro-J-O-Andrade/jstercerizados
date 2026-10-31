import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const EmpresasDashboardPage = lazy(() =>
  import('@/modules/empresas/dashboard').then((m) => ({
    default: m.EmpresasDashboardPage,
  })),
);
const EmpresasListPage = lazy(
  () => import('@/modules/empresas/pages/EmpresasListPage'),
);
const EmpresaFormPage = lazy(
  () => import('@/modules/empresas/pages/EmpresaFormPage'),
);
const EmpresaDetailPage = lazy(
  () => import('@/modules/empresas/pages/EmpresaDetailPage'),
);

export const empresasRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard',
    element: EmpresasDashboardPage as unknown as ComponentType,
    requiredPermissions: ['companies.read'],
    icon: 'LayoutDashboard',
  },
  {
    path: 'lista',
    label: 'Empresas',
    element: EmpresasListPage as unknown as ComponentType,
    requiredPermissions: ['companies.read'],
    icon: 'Building2',
  },
  {
    path: 'nova',
    label: 'Nova Empresa',
    element: EmpresaFormPage as unknown as ComponentType,
    requiredPermissions: ['companies.create'],
  },
  {
    path: ':id',
    label: 'Detalhe da Empresa',
    element: EmpresaDetailPage as unknown as ComponentType,
    requiredPermissions: ['companies.read'],
  },
  {
    path: ':id/editar',
    label: 'Editar Empresa',
    element: EmpresaFormPage as unknown as ComponentType,
    requiredPermissions: ['companies.update'],
  },
];
