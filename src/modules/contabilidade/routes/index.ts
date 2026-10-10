import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const ContabilidadeDashboardPage = lazy(() =>
  import('@/modules/contabilidade/dashboard').then((m) => ({
    default: m.ContabilidadeDashboardPage,
  })),
);
const LancamentosPage = lazy(() =>
  import('@/modules/contabilidade/lancamentos').then((m) => ({
    default: m.LancamentosPage,
  })),
);
const PlanoContasPage = lazy(() =>
  import('@/modules/contabilidade/plano-contas').then((m) => ({
    default: m.PlanoContasPage,
  })),
);
const BalancetePage = lazy(() =>
  import('@/modules/contabilidade/balancete').then((m) => ({
    default: m.BalancetePage,
  })),
);

export const contabilidadeRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Contabilidade',
    element: ContabilidadeDashboardPage as unknown as ComponentType,
    requiredPermissions: ['accounting.dashboard.read'],
    icon: 'BookOpen',
  },
  {
    path: 'lancamentos',
    label: 'Lançamentos',
    element: LancamentosPage as unknown as ComponentType,
    requiredPermissions: ['accounting.entries.read'],
  },
  {
    path: 'plano-contas',
    label: 'Plano de Contas',
    element: PlanoContasPage as unknown as ComponentType,
    requiredPermissions: ['accounting.chart_of_accounts.read'],
  },
  {
    path: 'balancetes',
    label: 'Balancetes',
    element: BalancetePage as unknown as ComponentType,
    requiredPermissions: ['accounting.trial_balance.read'],
  },
];
