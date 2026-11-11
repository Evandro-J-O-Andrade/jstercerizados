import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const CrmDashboardPage = lazy(() =>
  import('../dashboard/CrmDashboardPage').then((m) => ({ default: m.CrmDashboardPage })),
);
const CrmListPage = lazy(() => import('../pages/CrmListPage'));
const CrmDetailPage = lazy(() => import('../pages/CrmDetailPage'));
const CrmEditPage = lazy(() => import('../pages/CrmEditPage'));

export const crmRoutes: ModuleRoute[] = [
  { path: '', label: 'Painel CRM', icon: 'LayoutDashboard', element: CrmDashboardPage as ComponentType, requiredPermissions: ['crm.read'], implementationStatus: 'implemented' },
  { path: 'oportunidades', label: 'Oportunidades', icon: 'Users', element: CrmListPage as ComponentType, requiredPermissions: ['crm.read'], implementationStatus: 'implemented' },
  { path: 'oportunidades/:id/editar', label: 'Editar oportunidade', icon: 'Pencil', element: CrmEditPage as ComponentType, requiredPermissions: ['crm.update'], implementationStatus: 'implemented' },
  { path: 'oportunidades/:id', label: 'Detalhe da oportunidade', icon: 'FileText', element: CrmDetailPage as ComponentType, requiredPermissions: ['crm.read'], implementationStatus: 'implemented' },
];
