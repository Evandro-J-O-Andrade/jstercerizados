import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const ServicosDashboardPage = lazy(() =>
  import('@/modules/servicos/dashboard').then((m) => ({
    default: m.ServicosDashboardPage,
  })),
);
const ServicosCatalogoPage = lazy(() =>
  import('@/modules/servicos/pages/ServicosCatalogoPage'),
);
const ServicoDetailPage = lazy(() =>
  import('@/modules/servicos/pages/ServicoDetailPage'),
);
const ServicoFormPage = lazy(() =>
  import('@/modules/servicos/pages/ServicoFormPage'),
);
const ServicosOrdensPage = lazy(() =>
  import('@/modules/servicos/pages/ServicosOrdensPage'),
);
const ServicoOrdemDetailPage = lazy(() =>
  import('@/modules/servicos/pages/ServicoOrdemDetailPage'),
);
const ServicosExecucoesPage = lazy(() =>
  import('@/modules/servicos/pages/ServicosExecucoesPage'),
);
const ServicosAceitesPage = lazy(() =>
  import('@/modules/servicos/pages/ServicosAceitesPage'),
);
const ServicosOcorrenciasPage = lazy(() =>
  import('@/modules/servicos/pages/ServicosOcorrenciasPage'),
);
const ServicosAvaliacoesPage = lazy(() =>
  import('@/modules/servicos/pages/ServicosAvaliacoesPage'),
);

export const servicosRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard',
    element: ServicosDashboardPage as unknown as ComponentType,
    requiredPermissions: ['services.read', 'service_orders.read'],
    icon: 'LayoutDashboard',
    implementationStatus: 'implemented',
  },
  {
    path: 'catalogo',
    label: 'Catálogo de Serviços',
    element: ServicosCatalogoPage as unknown as ComponentType,
    requiredPermissions: ['services.read'],
    icon: 'Briefcase',
    implementationStatus: 'implemented',
  },
  {
    path: 'catalogo/novo',
    label: 'Novo Serviço',
    element: ServicoFormPage as unknown as ComponentType,
    requiredPermissions: ['services.create'],
    icon: 'Plus',
    implementationStatus: 'implemented',
  },
  {
    path: 'catalogo/:id/editar',
    label: 'Editar Serviço',
    element: ServicoFormPage as unknown as ComponentType,
    requiredPermissions: ['services.update'],
    icon: 'Pencil',
    implementationStatus: 'implemented',
  },
  {
    path: 'catalogo/:id',
    label: 'Detalhe do Serviço',
    element: ServicoDetailPage as unknown as ComponentType,
    requiredPermissions: ['services.read'],
    icon: 'FileText',
    implementationStatus: 'implemented',
  },
  {
    path: 'ordens',
    label: 'Ordens de Serviço',
    element: ServicosOrdensPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
    icon: 'ClipboardList',
    implementationStatus: 'implemented',
  },
  {
    path: 'ordens/nova',
    label: 'Nova Ordem de Serviço',
    element: ServicosOrdensPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.create'],
    icon: 'Plus',
    implementationStatus: 'implemented',
  },
  {
    path: 'ordens/:id',
    label: 'Detalhe da Ordem',
    element: ServicoOrdemDetailPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.read'],
    icon: 'FileText',
    implementationStatus: 'implemented',
  },
  {
    path: 'ordens/:id/editar',
    label: 'Editar Ordem',
    element: ServicosOrdensPage as unknown as ComponentType,
    requiredPermissions: ['service_orders.update'],
    icon: 'Pencil',
    implementationStatus: 'implemented',
  },
  {
    path: 'execucoes',
    label: 'Execuções',
    element: ServicosExecucoesPage as unknown as ComponentType,
    requiredPermissions: ['service_executions.read'],
    icon: 'Play',
    implementationStatus: 'implemented',
  },
  {
    path: 'aceites',
    label: 'Aceites',
    element: ServicosAceitesPage as unknown as ComponentType,
    requiredPermissions: ['service_acceptances.read'],
    icon: 'CheckCircle',
    implementationStatus: 'implemented',
  },
  {
    path: 'ocorrencias',
    label: 'Ocorrências',
    element: ServicosOcorrenciasPage as unknown as ComponentType,
    requiredPermissions: ['service_occurrences.read'],
    icon: 'AlertTriangle',
    implementationStatus: 'implemented',
  },
  {
    path: 'avaliacoes',
    label: 'Avaliações de Clientes',
    element: ServicosAvaliacoesPage as unknown as ComponentType,
    requiredPermissions: ['customer_ratings.read'],
    icon: 'Star',
    implementationStatus: 'implemented',
  },
];
