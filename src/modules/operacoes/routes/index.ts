import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const WorkOrdersPage = lazy(() => import('@/modules/operacoes/pages/WorkOrdersPage'));
const WorkOrderAssignmentsPage = lazy(() => import('@/modules/operacoes/pages/WorkOrderAssignmentsPage'));
const WorkOrderChecklistsPage = lazy(() => import('@/modules/operacoes/pages/WorkOrderChecklistsPage'));
const WorkOrderMaterialsPage = lazy(() => import('@/modules/operacoes/pages/WorkOrderMaterialsPage'));
const WorkOrderOccurrencesPage = lazy(() => import('@/modules/operacoes/pages/WorkOrderOccurrencesPage'));
const WorkOrderAcceptancesPage = lazy(() => import('@/modules/operacoes/pages/WorkOrderAcceptancesPage'));
const OperacoesDashboardPage = lazy(() => import('@/modules/operacoes/dashboard/OperacoesDashboardPage'));

export const operacoesRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Operações',
    element: OperacoesDashboardPage as unknown as ComponentType,
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
    path: 'atribuicoes',
    label: 'Atribuições',
    element: WorkOrderAssignmentsPage as unknown as ComponentType,
    requiredPermissions: ['work_order_assignments.manage'],
  },
  {
    path: 'checklists',
    label: 'Checklists',
    element: WorkOrderChecklistsPage as unknown as ComponentType,
    requiredPermissions: ['work_order_checklists.read'],
  },
  {
    path: 'materiais',
    label: 'Materiais em Trânsito',
    element: WorkOrderMaterialsPage as unknown as ComponentType,
    requiredPermissions: ['work_order_materials.read'],
  },
  {
    path: 'ocorrencias',
    label: 'Ocorrências',
    element: WorkOrderOccurrencesPage as unknown as ComponentType,
    requiredPermissions: ['work_order_occurrences.read'],
  },
  {
    path: 'aceites',
    label: 'Aceites',
    element: WorkOrderAcceptancesPage as unknown as ComponentType,
    requiredPermissions: ['work_order_acceptances.read'],
  },
];
