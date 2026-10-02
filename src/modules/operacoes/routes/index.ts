import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const WorkOrdersPage = lazy(() => import('@/pages/dashboard/GestaoPage'));

export const operacoesRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Operações',
    element: WorkOrdersPage as unknown as ComponentType,
    requiredPermissions: ['work_orders.read'],
    icon: 'LayoutDashboard',
  },
  {
    path: 'ordens',
    label: 'Ordens de Trabalho',
    element: WorkOrdersPage as unknown as ComponentType,
    requiredPermissions: ['work_orders.read'],
  },
  {
    path: 'ordens/criar',
    label: 'Nova Ordem',
    element: WorkOrdersPage as unknown as ComponentType,
    requiredPermissions: ['work_orders.create'],
  },
  {
    path: 'checklists',
    label: 'Checklists',
    element: WorkOrdersPage as unknown as ComponentType,
    requiredPermissions: ['work_order_checklists.read'],
  },
  {
    path: 'materiais',
    label: 'Materiais em Trânsito',
    element: WorkOrdersPage as unknown as ComponentType,
    requiredPermissions: ['work_order_materials.read'],
  },
  {
    path: 'ocorrencias',
    label: 'Ocorrências',
    element: WorkOrdersPage as unknown as ComponentType,
    requiredPermissions: ['work_order_occurrences.read'],
  },
  {
    path: 'aceites',
    label: 'Aceites',
    element: WorkOrdersPage as unknown as ComponentType,
    requiredPermissions: ['work_order_acceptances.read'],
  },
];
