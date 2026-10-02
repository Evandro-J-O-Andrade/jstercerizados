import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const FiscalPage = lazy(() => import('@/pages/dashboard/FiscalPage'));

export const fiscalRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Fiscal',
    element: FiscalPage as unknown as ComponentType,
    requiredPermissions: ['fiscal.read'],
    icon: 'LayoutDashboard',
  },
  {
    path: 'documentos',
    label: 'Documentos Fiscais',
    element: FiscalPage as unknown as ComponentType,
    requiredPermissions: ['fiscal.read'],
  },
  {
    path: 'documentos/criar',
    label: 'Novo Documento',
    element: FiscalPage as unknown as ComponentType,
    requiredPermissions: ['fiscal.documents.create'],
  },
  {
    path: 'configuracoes',
    label: 'Configurações Fiscais',
    element: FiscalPage as unknown as ComponentType,
    requiredPermissions: ['fiscal.config.read'],
  },
  {
    path: 'tributos',
    label: 'Tributos e Alíquotas',
    element: FiscalPage as unknown as ComponentType,
    requiredPermissions: ['fiscal.read'],
  },
  {
    path: 'eventos',
    label: 'Eventos e Integrações',
    element: FiscalPage as unknown as ComponentType,
    requiredPermissions: ['fiscal.read'],
  },
];
