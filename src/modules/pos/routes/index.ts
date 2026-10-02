import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const PosPage = lazy(() => import('@/pages/dashboard/FaturamentoPage'));

export const posRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard POS',
    element: PosPage as unknown as ComponentType,
    requiredPermissions: ['pos_sales.read'],
    icon: 'LayoutDashboard',
  },
  {
    path: 'vendas',
    label: 'Vendas POS',
    element: PosPage as unknown as ComponentType,
    requiredPermissions: ['pos_sales.read'],
  },
  {
    path: 'caixas',
    label: 'Caixas',
    element: PosPage as unknown as ComponentType,
    requiredPermissions: ['pos_cashiers.read'],
  },
  {
    path: 'terminais',
    label: 'Terminais',
    element: PosPage as unknown as ComponentType,
    requiredPermissions: ['pos_terminals.read'],
  },
  {
    path: 'cancelamentos',
    label: 'Cancelamentos',
    element: PosPage as unknown as ComponentType,
    requiredPermissions: ['pos_cancellations.read'],
  },
  {
    path: 'fechamento',
    label: 'Fechamento de Caixa',
    element: PosPage as unknown as ComponentType,
    requiredPermissions: ['pos_daily_closures.read'],
  },
];
