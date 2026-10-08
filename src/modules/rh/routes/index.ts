import type { ComponentType } from 'react';
import type { ModuleRoute } from '@/platform/router/types';
import { lazy } from 'react';

const DashboardRh = lazy(() => import('@/pages/dashboard/DashboardRh'));
const CandidatosPage = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoCandidatos'),
);
const CandidatoDetalhe = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoCandidatoDetalhe'),
);
const RecrutamentoVagasPage = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoVagas'),
);
const FuncionariosPage = lazy(() => import('@/pages/dashboard/Funcionarios'));
const FuncionarioDetalhe = lazy(
  () => import('@/pages/dashboard/FuncionarioDetalhe'),
);
const ProcessosSeletivosPage = lazy(
  () => import('@/pages/dashboard/ProcessosSeletivos'),
);
const CandidaturasPage = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoCandidaturas'),
);
const JobMatches = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoMatches'),
);
const DocumentosRhPage = lazy(() => import('@/pages/dashboard/DocumentosRh'));
const BancoDeTalentosPage = lazy(
  () => import('@/modules/recrutamento/pages/RecrutamentoTalentPool'),
);
const EtapasPage = lazy(() => import('@/pages/dashboard/Etapas'));

export const rhRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard RH',
    element: DashboardRh as ComponentType,
    requiredPermissions: ['people.read'],
  },
  {
    path: 'funcionarios',
    label: 'Funcionários',
    element: FuncionariosPage as ComponentType,
    requiredPermissions: ['people.read'],
  },
  {
    path: 'funcionarios/:id',
    label: 'Detalhe do Funcionário',
    element: FuncionarioDetalhe as ComponentType,
    requiredPermissions: ['people.read'],
  },
  {
    path: 'candidatos',
    label: 'Candidatos',
    element: CandidatosPage as ComponentType,
    requiredPermissions: ['candidates.read'],
  },
  {
    path: 'candidatos/:id',
    label: 'Detalhe do Candidato',
    element: CandidatoDetalhe as ComponentType,
    requiredPermissions: ['candidates.read'],
  },
  {
    path: 'vagas',
    label: 'Vagas',
    element: RecrutamentoVagasPage as ComponentType,
    requiredPermissions: ['jobs.read'],
  },
  {
    path: 'matches',
    label: 'Matches',
    element: JobMatches as ComponentType,
    requiredPermissions: ['jobs.read'],
  },
  {
    path: 'processos-seletivos',
    label: 'Processos Seletivos',
    element: ProcessosSeletivosPage as ComponentType,
    requiredPermissions: ['jobs.read'],
  },
  {
    path: 'processos-seletivos/:id',
    label: 'Detalhe do Processo',
    element: null as unknown as ComponentType,
    requiredPermissions: ['jobs.read'],
    implementationStatus: 'coming_soon',
  },
  {
    path: 'candidaturas',
    label: 'Candidaturas',
    element: CandidaturasPage as ComponentType,
    requiredPermissions: ['applications.read'],
  },
  {
    path: 'documentos-rh',
    label: 'Documentos',
    element: DocumentosRhPage as ComponentType,
    requiredPermissions: ['people.read'],
  },
  {
    path: 'banco-de-talentos',
    label: 'Banco de Talentos',
    element: BancoDeTalentosPage as ComponentType,
    requiredPermissions: ['candidates.read'],
  },
  {
    path: 'etapas',
    label: 'Etapas',
    element: EtapasPage as ComponentType,
    requiredPermissions: ['recruitment.stage.manage'],
  },
];
