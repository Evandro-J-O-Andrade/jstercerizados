import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const ServicosPage = lazy(
  () => import('@/modules/servicos/pages/ServicosListPage'),
);

export const servicosRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
  },
  {
    path: 'catalogo',
    label: 'Catalogo de Servicos',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
  },
  {
    path: 'ordens',
    label: 'Ordens de Servico',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
  },
  {
    path: 'ordens/criar',
    label: 'Nova Ordem de Servico',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.create'],
  },
  {
    path: 'execucoes',
    label: 'Execucoes',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
  },
  {
    path: 'aceites',
    label: 'Aceites',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_acceptances.read'],
  },
  {
    path: 'ocorrencias',
    label: 'Ocorrencias',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_occurrences.read'],
  },
  {
    path: 'avaliacoes',
    label: 'Avaliacoes de Clientes',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['customer_ratings.read'],
  },
];
