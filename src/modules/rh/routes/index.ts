import type { ComponentType } from 'react';
import type { ModuleRoute } from '@/platform/router/types';
import { lazy } from 'react';

const DashboardRh = lazy(() => import('@/pages/dashboard/DashboardRh'));
const CandidatosPage = lazy(() => import('@/pages/dashboard/Candidatos'));
const CandidatoDetalhe = lazy(
  () => import('@/pages/dashboard/CandidatoDetalhe'),
);
const VagasPage = lazy(() => import('@/pages/dashboard/Vagas'));
const FuncionariosPage = lazy(() => import('@/pages/dashboard/Funcionarios'));
const FuncionarioDetalhe = lazy(
  () => import('@/pages/dashboard/FuncionarioDetalhe'),
);
const ProcessosSeletivosPage = lazy(
  () => import('@/pages/dashboard/ProcessosSeletivos'),
);
const CandidaturasPage = lazy(() => import('@/pages/dashboard/Candidaturas'));
const CandidatoHabilidades = lazy(
  () => import('@/pages/dashboard/CandidatoHabilidades'),
);
const CandidatoFormacao = lazy(
  () => import('@/pages/dashboard/CandidatoFormacao'),
);
const CandidatoExperiencias = lazy(
  () => import('@/pages/dashboard/CandidatoExperiencias'),
);
const CandidatoIdiomas = lazy(
  () => import('@/pages/dashboard/CandidatoIdiomas'),
);
const CandidatoDocumentos = lazy(
  () => import('@/pages/dashboard/CandidatoDocumentos'),
);
const CandidatoPreferencias = lazy(
  () => import('@/pages/dashboard/CandidatoPreferencias'),
);
const CandidatoVisualizacoes = lazy(
  () => import('@/pages/dashboard/CandidatoVisualizacoes'),
);
const JobMatches = lazy(() => import('@/pages/dashboard/JobMatches'));
const DocumentosRhPage = lazy(() => import('@/pages/dashboard/DocumentosRh'));
const BancoDeTalentosPage = lazy(
  () => import('@/pages/dashboard/BancoDeTalentos'),
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
    path: 'candidatos/habilidades',
    label: 'Habilidades',
    element: CandidatoHabilidades as ComponentType,
    requiredPermissions: ['candidates.read'],
  },
  {
    path: 'candidatos/formacao',
    label: 'Formação',
    element: CandidatoFormacao as ComponentType,
    requiredPermissions: ['candidates.read'],
  },
  {
    path: 'candidatos/experiencias',
    label: 'Experiências',
    element: CandidatoExperiencias as ComponentType,
    requiredPermissions: ['candidates.read'],
  },
  {
    path: 'candidatos/idiomas',
    label: 'Idiomas',
    element: CandidatoIdiomas as ComponentType,
    requiredPermissions: ['candidates.read'],
  },
  {
    path: 'candidatos/documentos',
    label: 'Documentos',
    element: CandidatoDocumentos as ComponentType,
    requiredPermissions: ['candidates.read'],
  },
  {
    path: 'candidatos/preferencias',
    label: 'Preferências',
    element: CandidatoPreferencias as ComponentType,
    requiredPermissions: ['candidates.read'],
  },
  {
    path: 'candidatos/visualizacoes',
    label: 'Visualizações',
    element: CandidatoVisualizacoes as ComponentType,
    requiredPermissions: ['candidates.read'],
  },
  {
    path: 'vagas',
    label: 'Vagas',
    element: VagasPage as ComponentType,
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
