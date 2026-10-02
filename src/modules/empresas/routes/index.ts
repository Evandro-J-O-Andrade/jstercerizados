import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const EmpresasPage = lazy(() => import('@/pages/dashboard/Empresas'));
const ClientesPage = lazy(() => import('@/pages/dashboard/ClientesPage'));
const ContratosPage = lazy(() => import('@/pages/dashboard/ContratosPage'));

export const empresasRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Empresas',
    element: EmpresasPage as unknown as ComponentType,
    requiredPermissions: ['companies.read'],
    icon: 'LayoutDashboard',
  },
  {
    path: 'empresas',
    label: 'Empresas',
    element: EmpresasPage as unknown as ComponentType,
    requiredPermissions: ['companies.read'],
  },
  {
    path: 'clientes',
    label: 'Clientes',
    element: ClientesPage as unknown as ComponentType,
    requiredPermissions: ['customers.read'],
  },
  {
    path: 'leads',
    label: 'Leads',
    element: EmpresasPage as unknown as ComponentType,
    requiredPermissions: ['leads.read'],
  },
  {
    path: 'contratos',
    label: 'Contratos',
    element: ContratosPage as unknown as ComponentType,
    requiredPermissions: ['contracts.read'],
  },
  {
    path: 'quotes',
    label: 'Orçamentos',
    element: EmpresasPage as unknown as ComponentType,
    requiredPermissions: ['quotes.read'],
  },
  {
    path: 'vendas',
    label: 'Vendas',
    element: EmpresasPage as unknown as ComponentType,
    requiredPermissions: ['sales.read'],
  },
  {
    path: 'relacionamentos',
    label: 'Relacionamentos',
    element: EmpresasPage as unknown as ComponentType,
    requiredPermissions: ['company_relationships.read'],
  },
];
