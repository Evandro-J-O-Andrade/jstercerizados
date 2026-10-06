import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const SuporteDashboardPage = lazy(() => import('@/modules/suporte/dashboard'));
const SuportePage = lazy(() => import('@/pages/dashboard/Suporte'));

export const suporteRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Suporte',
    element: SuporteDashboardPage as unknown as ComponentType,
    requiredPermissions: ['support_tickets.read'],
    icon: 'LayoutDashboard',
  },
  {
    path: 'tickets',
    label: 'Tickets',
    element: SuportePage as unknown as ComponentType,
    requiredPermissions: ['support_tickets.read'],
  },
  {
    path: 'tickets/criar',
    label: 'Novo Ticket',
    element: SuportePage as unknown as ComponentType,
    requiredPermissions: ['support_tickets.create'],
  },
  {
    path: 'categorias',
    label: 'Categorias',
    element: SuportePage as unknown as ComponentType,
    requiredPermissions: ['support_tickets.read'],
  },
  {
    path: 'tarefas',
    label: 'Tarefas',
    element: SuportePage as unknown as ComponentType,
    requiredPermissions: ['tasks.read'],
  },
];
