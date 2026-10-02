import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const ServicosPage = lazy(() => import('@/pages/dashboard/Servicos'));

export const servicosRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Catálogo de Serviços',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
  },
  {
    path: 'ordens',
    label: 'Ordens de Serviço',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
  },
];
