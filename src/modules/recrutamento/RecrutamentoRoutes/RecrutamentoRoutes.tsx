import type { ModuleRoute } from '@/platform/router/types';
import type { ComponentType } from 'react';
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ProcessosSeletivosPage from '@/pages/dashboard/ProcessosSeletivos';
import EtapasPage from '@/pages/dashboard/Etapas';
import { RECRUTAMENTO_PERMISSIONS } from '../permissions';
import { RecrutamentoProvider } from '../RecrutamentoContext';

const RecrutamentoDashboard = lazy(() =>
  import('@/modules/recrutamento/DashboardRecrutamento').then((m) => ({
    default: m.DashboardRecrutamento,
  })),
);
const RecrutamentoVagas = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoVagas'),
);
const RecrutamentoVagaNova = lazy(
  () => import('@/modules/recrutamento/pages/vagas/RecrutamentoVagaNovaPage'),
);
const RecrutamentoVagaDetalhe = lazy(
  () =>
    import('@/modules/recrutamento/pages/vagas/RecrutamentoVagaDetalhePage'),
);
const RecrutamentoVagaEditar = lazy(
  () => import('@/modules/recrutamento/pages/vagas/RecrutamentoVagaEditarPage'),
);
const RecrutamentoCandidatos = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoCandidatos'),
);
const RecrutamentoCandidatoDetalhe = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoCandidatoDetalhe'),
);
const RecrutamentoCandidaturas = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoCandidaturas'),
);
const RecrutamentoMatches = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoMatches'),
);
const RecrutamentoRelatorios = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoRelatorios'),
);
const RecrutamentoTalentPool = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoTalentPool'),
);
const RecrutamentoDemandas = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoDemandas'),
);

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

function legacyNovaVagaRedirect() {
  return <Navigate to="/dashboard/recrutamento/vagas/novo" replace />;
}

export const RecrutamentoRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Recrutamento',
    icon: 'LayoutDashboard',
    element: withProvider(RecrutamentoDashboard),
    requiredPermissions: [],
  },
  {
    path: 'vagas',
    label: 'Vagas',
    icon: 'BriefcaseBusiness',
    element: withProvider(RecrutamentoVagas),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.vagas],
  },
  {
    path: 'vagas/novo',
    label: 'Nova vaga',
    icon: 'SquarePlus',
    element: withProvider(RecrutamentoVagaNova),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.vagasCriar],
  },
  {
    path: 'vagas/nova',
    label: 'Nova vaga (compatibilidade)',
    icon: 'SquarePlus',
    element: legacyNovaVagaRedirect,
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.vagasCriar],
  },
  {
    path: 'vagas/:id/editar',
    label: 'Editar vaga',
    icon: 'Pencil',
    element: withProvider(RecrutamentoVagaEditar),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.vagasEditar],
  },
  {
    path: 'vagas/:id',
    label: 'Detalhes da vaga',
    icon: 'FileSearch',
    element: withProvider(RecrutamentoVagaDetalhe),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.vagas],
  },
  {
    path: 'candidatos',
    label: 'Candidatos',
    icon: 'UsersRound',
    element: withProvider(RecrutamentoCandidatos),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.candidatos],
  },
  {
    path: 'candidatos/:id',
    label: 'Detalhe do Candidato',
    icon: 'UserRound',
    element: withProvider(RecrutamentoCandidatoDetalhe),
    requiredPermissions: [
      RECRUTAMENTO_PERMISSIONS.candidatosPerfilLer,
      RECRUTAMENTO_PERMISSIONS.candidatos,
    ],
  },
  {
    path: 'processos',
    label: 'Processos Seletivos',
    icon: 'Workflow',
    element: withProvider(ProcessosSeletivosPage),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.processos],
  },
  {
    path: 'etapas',
    label: 'Etapas',
    icon: 'ListChecks',
    element: withProvider(EtapasPage),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.etapasGerenciar],
  },
  {
    path: 'candidaturas',
    label: 'Candidaturas',
    icon: 'ClipboardList',
    element: withProvider(RecrutamentoCandidaturas),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.candidaturas],
  },
  {
    path: 'matches',
    label: 'Matches',
    icon: 'Target',
    element: withProvider(RecrutamentoMatches),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.talentPoolMatch],
  },
  {
    path: 'talent-pool',
    label: 'Banco de Talentos',
    icon: 'ContactRound',
    element: withProvider(RecrutamentoTalentPool),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.talentPool],
  },
  {
    path: 'demandas',
    label: 'Demandas de Recrutamento',
    icon: 'ListTodo',
    element: withProvider(RecrutamentoDemandas),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.demandas],
  },
  {
    path: 'relatorios',
    label: 'Relatórios',
    icon: 'ChartNoAxesCombined',
    element: withProvider(RecrutamentoRelatorios),
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.relatorios],
  },
];
