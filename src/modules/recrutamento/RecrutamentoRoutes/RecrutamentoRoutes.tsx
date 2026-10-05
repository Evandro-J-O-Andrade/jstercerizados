import type { ModuleRoute } from '@/platform/router/types';
import type { ComponentType } from 'react';
import { lazy } from 'react';
import { RECRUTAMENTO_PERMISSIONS } from '../permissions';
import { RecrutamentoProvider } from '../RecrutamentoContext';

const RecrutamentoDashboard = lazy(
  () => import('@/modules/recrutamento/DashboardRecrutamento').then(m => ({ default: m.DashboardRecrutamento })),
);
const RecrutamentoVagas = lazy(() => import('@/modules/recrutamento/pages/RecrutamentoVagas'));
const RecrutamentoCandidatos = lazy(() => import('@/modules/recrutamento/pages/RecrutamentoCandidatos'));
const RecrutamentoCandidatoDetalhe = lazy(() => import('@/modules/recrutamento/pages/RecrutamentoCandidatoDetalhe'));
const RecrutamentoProcessos = lazy(() => import('@/modules/recrutamento/pages/RecrutamentoProcessos'));
const RecrutamentoEtapas = lazy(() => import('@/modules/recrutamento/pages/RecrutamentoEtapas'));
const RecrutamentoCandidaturas = lazy(() => import('@/modules/recrutamento/pages/RecrutamentoCandidaturas'));
const RecrutamentoMatches = lazy(() => import('@/modules/recrutamento/pages/RecrutamentoMatches'));
const RecrutamentoRelatorios = lazy(() => import('@/modules/recrutamento/pages/RecrutamentoRelatorios'));
const RecrutamentoTalentPool = lazy(() => import('@/modules/recrutamento/pages/RecrutamentoTalentPool'));
const RecrutamentoDemandas = lazy(() => import('@/modules/recrutamento/pages/RecrutamentoDemandas'));

/**
 * Envolve cada elemento da célula no `RecrutamentoProvider`.
 *
 * Sem isto o provider fica montado em lugar nenhum e qualquer página que
 * chamar `useRecrutamento()` — como `DashboardRecrutamento` — lança em runtime.
 * O layout do módulo (ModuleLayout + ModuleSidebar) continua sendo montado pelo
 * `ModuleRouter`; por isso não se monta o `RecrutamentoContainer` aqui, para não
 * duplicar o shell.
 */
function withProvider(Component: ComponentType): ComponentType {
  function Wrapped() {
    return (
      <RecrutamentoProvider>
        <Component />
      </RecrutamentoProvider>
    );
  }
  Wrapped.displayName = `WithRecrutamentoProvider(${
    Component.displayName || Component.name || 'Component'
  })`;
  return Wrapped;
}

export const RecrutamentoRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Recrutamento',
    element: withProvider(RecrutamentoDashboard),
    requiredPermissions: [],
  },
  {
    path: 'vagas',
    label: 'Vagas',
    element: withProvider(RecrutamentoVagas),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.vagas],
  },
  {
    path: 'candidatos',
    label: 'Candidatos',
    element: withProvider(RecrutamentoCandidatos),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.candidatos],
  },
  {
    path: 'candidatos/:id',
    label: 'Detalhe do Candidato',
    element: withProvider(RecrutamentoCandidatoDetalhe),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.candidatosPerfilLer],
  },
  {
    path: 'processos',
    label: 'Processos Seletivos',
    element: withProvider(RecrutamentoProcessos),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.processos],
  },
  {
    path: 'etapas',
    label: 'Etapas',
    element: withProvider(RecrutamentoEtapas),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.etapasGerenciar],
  },
  {
    path: 'candidaturas',
    label: 'Candidaturas',
    element: withProvider(RecrutamentoCandidaturas),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.candidaturas],
  },
  {
    path: 'matches',
    label: 'Matches',
    element: withProvider(RecrutamentoMatches),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.talentPoolMatch],
  },
  {
    path: 'talent-pool',
    label: 'Banco de Talentos',
    element: withProvider(RecrutamentoTalentPool),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.talentPool],
  },
  {
    path: 'demandas',
    label: 'Demandas de Recrutamento',
    element: withProvider(RecrutamentoDemandas),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.demandas],
  },
  {
    path: 'relatorios',
    label: 'Relatórios',
    element: withProvider(RecrutamentoRelatorios),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.relatorios],
  },
];