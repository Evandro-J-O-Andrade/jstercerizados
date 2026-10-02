import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const FinanceiroPage = lazy(() => import('@/pages/dashboard/FinanceiroPage'));
const ContasReceberPage = lazy(
  () => import('@/pages/dashboard/ContasReceberPage'),
);
const FluxoDeCaixaPage = lazy(
  () => import('@/pages/dashboard/FluxoDeCaixaPage'),
);
const FaturamentoPage = lazy(() => import('@/pages/dashboard/FaturamentoPage'));
const ContabilidadePage = lazy(
  () => import('@/pages/dashboard/ContabilidadePage'),
);

export const financeiroRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Financeiro',
    element: FinanceiroPage as unknown as ComponentType,
    requiredPermissions: ['finance.read'],
    icon: 'LayoutDashboard',
  },
  {
    path: 'contas-receber',
    label: 'Contas a Receber',
    element: ContasReceberPage as unknown as ComponentType,
    requiredPermissions: ['accounts_receivable.read'],
  },
  {
    path: 'contas-pagar',
    label: 'Contas a Pagar',
    element: FinanceiroPage as unknown as ComponentType,
    requiredPermissions: ['accounts_payable.read'],
  },
  {
    path: 'fluxo-de-caixa',
    label: 'Fluxo de Caixa',
    element: FluxoDeCaixaPage as unknown as ComponentType,
    requiredPermissions: ['cash_flows.read'],
  },
  {
    path: 'faturamento',
    label: 'Faturamento',
    element: FaturamentoPage as unknown as ComponentType,
    requiredPermissions: ['invoices.read'],
  },
  {
    path: 'contabilidade',
    label: 'Contabilidade',
    element: ContabilidadePage as unknown as ComponentType,
    requiredPermissions: ['accounting.read'],
  },
  {
    path: 'conciliacao',
    label: 'Conciliação Bancária',
    element: FinanceiroPage as unknown as ComponentType,
    requiredPermissions: ['bank_reconciliations.read'],
  },
];
