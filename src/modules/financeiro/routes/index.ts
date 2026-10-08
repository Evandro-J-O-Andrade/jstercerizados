import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const FinanceiroDashboardPage = lazy(() =>
  import('@/modules/financeiro/dashboard').then((m) => ({
    default: m.FinanceiroDashboardPage,
  })),
);
const ContasPagarPage = lazy(() =>
  import('@/modules/financeiro/contas-pagar').then((m) => ({
    default: m.ContasPagarPage,
  })),
);
const ContasReceberPage = lazy(() =>
  import('@/modules/financeiro/contas-receber').then((m) => ({
    default: m.ContasReceberPage,
  })),
);
const FluxoDeCaixaPage = lazy(() =>
  import('@/modules/financeiro/fluxo-caixa').then((m) => ({
    default: m.FluxoDeCaixaPage,
  })),
);
const FaturamentoPage = lazy(() =>
  import('@/modules/financeiro/faturamento').then((m) => ({
    default: m.FaturamentoPage,
  })),
);
const BancosPage = lazy(() =>
  import('@/modules/financeiro/bancos').then((m) => ({
    default: m.BancosPage,
  })),
);
const CentroCustosPage = lazy(() =>
  import('@/modules/financeiro/centros-custo').then((m) => ({
    default: m.CentroCustosPage,
  })),
);
const ConciliacaoPage = lazy(() =>
  import('@/modules/financeiro/conciliacao').then((m) => ({
    default: m.ConciliacaoPage,
  })),
);
const CategoriasPage = lazy(() =>
  import('@/modules/financeiro/categorias').then((m) => ({
    default: m.CategoriasPage,
  })),
);
const ParcelamentosPage = lazy(() =>
  import('@/modules/financeiro/parcelamentos').then((m) => ({
    default: m.ParcelamentosPage,
  })),
);
const TransacoesPage = lazy(() =>
  import('@/modules/financeiro/transacoes').then((m) => ({
    default: m.TransacoesPage,
  })),
);

export const financeiroRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Financeiro',
    element: FinanceiroDashboardPage as unknown as ComponentType,
    requiredPermissions: ['finance.dashboard.read'],
    icon: 'LayoutDashboard',
  },
  {
    path: 'contas-pagar',
    label: 'Contas a Pagar',
    element: ContasPagarPage as unknown as ComponentType,
    requiredPermissions: ['finance.accounts_payable.read'],
  },
  {
    path: 'contas-receber',
    label: 'Contas a Receber',
    element: ContasReceberPage as unknown as ComponentType,
    requiredPermissions: ['finance.accounts_receivable.read'],
  },
  {
    path: 'fluxo-caixa',
    label: 'Fluxo de Caixa',
    element: FluxoDeCaixaPage as unknown as ComponentType,
    requiredPermissions: ['finance.cashflow.read'],
  },
  {
    path: 'faturamento',
    label: 'Faturamento',
    element: FaturamentoPage as unknown as ComponentType,
    requiredPermissions: ['finance.billing.read'],
  },
  {
    path: 'bancos',
    label: 'Contas Bancárias',
    element: BancosPage as unknown as ComponentType,
    requiredPermissions: ['finance.read'],
  },
  {
    path: 'centros-custo',
    label: 'Centros de Custo',
    element: CentroCustosPage as unknown as ComponentType,
    requiredPermissions: ['finance.read'],
  },
  {
    path: 'conciliacao',
    label: 'Conciliação Bancária',
    element: ConciliacaoPage as unknown as ComponentType,
    requiredPermissions: ['finance.cashflow.read'],
    icon: 'Banknote',
  },
  {
    path: 'categorias',
    label: 'Categorias Financeiras',
    element: CategoriasPage as unknown as ComponentType,
    requiredPermissions: ['finance.read'],
  },
  {
    path: 'parcelamentos',
    label: 'Parcelamentos',
    element: ParcelamentosPage as unknown as ComponentType,
    requiredPermissions: ['finance.read'],
  },
  {
    path: 'transacoes',
    label: 'Transações Financeiras',
    element: TransacoesPage as unknown as ComponentType,
    requiredPermissions: ['finance.read'],
  },
];
