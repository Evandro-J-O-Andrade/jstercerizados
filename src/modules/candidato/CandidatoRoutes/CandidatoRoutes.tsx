import type { ModuleRoute } from '@/platform/router/types';
import { lazy } from 'react';
import { CANDIDATO_PERMISSIONS } from '../permissions';

const CandidatoDashboard = lazy(
  () => import('@/modules/candidato/DashboardCandidato').then(m => ({ default: m.DashboardCandidato })),
);
const CandidatoVagas = lazy(() => import('@/modules/candidato/pages/Vagas'));
const CandidatoVagasRecomendadas = lazy(
  () => import('@/modules/candidato/pages/VagasRecomendadas'),
);
const CandidatoBuscarVagas = lazy(
  () => import('@/modules/candidato/pages/BuscarVagas'),
);
const CandidatoCandidaturas = lazy(
  () => import('@/modules/candidato/pages/Candidaturas'),
);
const CandidatoFavoritas = lazy(
  () => import('@/modules/candidato/pages/Favoritas'),
);
const CandidatoAlertas = lazy(
  () => import('@/modules/candidato/pages/Alertas'),
);
const CandidatoCurriculo = lazy(
  () => import('@/modules/candidato/pages/Curriculo'),
);
const CandidatoExperiencia = lazy(
  () => import('@/modules/candidato/pages/Experiencia'),
);
const CandidatoFormacao = lazy(
  () => import('@/modules/candidato/pages/Formacao'),
);
const CandidatoCursos = lazy(
  () => import('@/modules/candidato/pages/Cursos'),
);
const CandidatoHabilidades = lazy(
  () => import('@/modules/candidato/pages/Habilidades'),
);
const CandidatoIdiomas = lazy(
  () => import('@/modules/candidato/pages/Idiomas'),
);
const CandidatoDocumentos = lazy(
  () => import('@/modules/candidato/pages/Documentos'),
);
const CandidatoPreferencias = lazy(
  () => import('@/modules/candidato/pages/Preferencias'),
);
const CandidatoConta = lazy(
  () => import('@/modules/candidato/pages/Conta'),
);
const CandidatoPerfil = lazy(
  () => import('@/modules/candidato/pages/Perfil'),
);
const CandidatoEntrevistas = lazy(
  () => import('@/modules/candidato/pages/Entrevistas'),
);
const CandidatoHistorico = lazy(
  () => import('@/modules/candidato/pages/Historico'),
);
const CandidatoNotificacoes = lazy(
  () => import('@/modules/candidato/pages/Notificacoes'),
);
const CandidatoConfiguracoes = lazy(
  () => import('@/modules/candidato/pages/Configuracoes'),
);

export const CandidatoRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Área do Candidato',
    element: CandidatoDashboard,
    requiredPermissions: [],
  },
  {
    path: 'vagas',
    label: 'Vagas',
    element: CandidatoVagas,
    requiredPermissions: [CANDIDATO_PERMISSIONS.vagas],
  },
  {
    path: 'vagas/recomendadas',
    label: 'Vagas recomendadas',
    element: CandidatoVagasRecomendadas,
    requiredPermissions: [CANDIDATO_PERMISSIONS.vagasRecomendadas],
  },
  {
    path: 'buscar-vagas',
    label: 'Buscar vagas',
    element: CandidatoBuscarVagas,
    requiredPermissions: [CANDIDATO_PERMISSIONS.buscarVagas],
  },
  {
    path: 'candidaturas',
    label: 'Minhas Candidaturas',
    element: CandidatoCandidaturas,
    requiredPermissions: [CANDIDATO_PERMISSIONS.candidaturas],
  },
  {
    path: 'favoritas',
    label: 'Vagas Favoritas',
    element: CandidatoFavoritas,
    requiredPermissions: [CANDIDATO_PERMISSIONS.favoritas],
  },
  {
    path: 'alertas',
    label: 'Alertas de Vagas',
    element: CandidatoAlertas,
    requiredPermissions: [CANDIDATO_PERMISSIONS.alertas],
  },
  {
    path: 'curriculo',
    label: 'Meu Currículo',
    element: CandidatoCurriculo,
    requiredPermissions: [CANDIDATO_PERMISSIONS.curriculo],
  },
  {
    path: 'experiencia',
    label: 'Experiências',
    element: CandidatoExperiencia,
    requiredPermissions: [CANDIDATO_PERMISSIONS.experiencia],
  },
  {
    path: 'formacao',
    label: 'Formação',
    element: CandidatoFormacao,
    requiredPermissions: [CANDIDATO_PERMISSIONS.formacao],
  },
  {
    path: 'cursos',
    label: 'Cursos',
    element: CandidatoCursos,
    requiredPermissions: [CANDIDATO_PERMISSIONS.cursos],
  },
  {
    path: 'habilidades',
    label: 'Habilidades',
    element: CandidatoHabilidades,
    requiredPermissions: [CANDIDATO_PERMISSIONS.habilidades],
  },
  {
    path: 'idiomas',
    label: 'Idiomas',
    element: CandidatoIdiomas,
    requiredPermissions: [CANDIDATO_PERMISSIONS.idiomas],
  },
  {
    path: 'documentos',
    label: 'Documentos',
    element: CandidatoDocumentos,
    requiredPermissions: [CANDIDATO_PERMISSIONS.documentos],
  },
  {
    path: 'preferencias',
    label: 'Preferências',
    element: CandidatoPreferencias,
    requiredPermissions: [CANDIDATO_PERMISSIONS.preferencias],
  },
  {
    path: 'conta',
    label: 'Minha Conta',
    element: CandidatoConta,
    requiredPermissions: [CANDIDATO_PERMISSIONS.conta],
  },
  {
    path: 'perfil',
    label: 'Meu Perfil',
    element: CandidatoPerfil,
    requiredPermissions: [CANDIDATO_PERMISSIONS.perfil],
  },
  {
    path: 'entrevistas',
    label: 'Entrevistas',
    element: CandidatoEntrevistas,
    requiredPermissions: [CANDIDATO_PERMISSIONS.entrevistas],
  },
  {
    path: 'historico',
    label: 'Histórico',
    element: CandidatoHistorico,
    requiredPermissions: [CANDIDATO_PERMISSIONS.historico],
  },
  {
    path: 'notificacoes',
    label: 'Notificações',
    element: CandidatoNotificacoes,
    requiredPermissions: [CANDIDATO_PERMISSIONS.notificacoes],
  },
  {
    path: 'configuracoes',
    label: 'Configurações',
    element: CandidatoConfiguracoes,
    requiredPermissions: [CANDIDATO_PERMISSIONS.configuracoes],
  },
];