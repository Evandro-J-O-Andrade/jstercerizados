import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const ServicosDashboardPage = lazy(() =>
  import('@/modules/servicos/dashboard').then((m) => ({
    default: m.ServicosDashboardPage,
  })),
);
const ServicosPage = lazy(
  () => import('@/modules/servicos/pages/ServicosListPage'),
);

export const servicosRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard',
    element: ServicosDashboardPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
    icon: 'LayoutDashboard',
  },
  {
    path: 'catalogo',
    label: 'Catálogo de Serviços',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
    icon: 'Briefcase',
  },
  {
    path: 'ordens',
    label: 'Ordens de Serviço',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
    icon: 'ClipboardList',
  },
  {
    path: 'ordens/criar',
    label: 'Nova Ordem de Serviço',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.create'],
  },
  {
    path: 'execucoes',
    label: 'Execuções',
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
    label: 'Ocorrências',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['service_occurrences.read'],
  },
  {
    path: 'avaliacoes',
    label: 'Avaliações de Clientes',
    element: ServicosPage as unknown as ComponentType,
    requiredPermissions: ['customer_ratings.read'],
  },
];
