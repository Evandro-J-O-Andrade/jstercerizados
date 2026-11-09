import type { ComponentType } from 'react';
import type { ModuleRoute } from '@/platform/router/types';
import { lazy } from 'react';

/**
 * Rotas RH — domínio proprietário /dashboard/rh.
 * Não reutiliza páginas operacionais de Recrutamento/Candidato; consultas cruzadas
 * usam páginas RH próprias e links para rotas proprietárias quando aplicável.
 */
const RHDashboardPage = lazy(() => import('@/modules/rh/dashboard/RHDashboardPage').then((m) => ({ default: m.RHDashboardPage })));
const RHColaboradoresListPage = lazy(() => import('@/modules/rh/pages/RHColaboradoresListPage'));
const RHColaboradorNovoPage = lazy(() => import('@/modules/rh/pages/RHColaboradorNovoPage'));
const RHColaboradorDetalhePage = lazy(() => import('@/modules/rh/pages/RHColaboradorDetalhePage'));
const RHColaboradorEditarPage = lazy(() => import('@/modules/rh/pages/RHColaboradorEditarPage'));
const RHCandidatosConsultaPage = lazy(() => import('@/modules/rh/pages/RHCandidatosConsultaPage'));
const RHVagasConsultaPage = lazy(() => import('@/modules/rh/pages/RHVagasConsultaPage'));

export const rhRoutes: ModuleRoute[] = [
  { path: '', label: 'Painel RH', icon: 'LayoutDashboard', element: RHDashboardPage as ComponentType, requiredPermissions: ['people.read'], implementationStatus: 'implemented' },
  { path: 'colaboradores', label: 'Colaboradores', icon: 'Users', element: RHColaboradoresListPage as ComponentType, requiredPermissions: ['people.read'], implementationStatus: 'implemented' },
  { path: 'colaboradores/novo', label: 'Novo colaborador', icon: 'UserPlus', element: RHColaboradorNovoPage as ComponentType, requiredPermissions: ['people.create'], implementationStatus: 'implemented' },
  { path: 'colaboradores/:id/editar', label: 'Editar colaborador', icon: 'Pencil', element: RHColaboradorEditarPage as ComponentType, requiredPermissions: ['people.update'], implementationStatus: 'implemented' },
  { path: 'colaboradores/:id', label: 'Detalhe do colaborador', icon: 'User', element: RHColaboradorDetalhePage as ComponentType, requiredPermissions: ['people.read'], implementationStatus: 'implemented' },
  { path: 'candidatos', label: 'Consulta de candidatos', icon: 'UserRoundSearch', element: RHCandidatosConsultaPage as ComponentType, requiredPermissions: ['candidates.read'], implementationStatus: 'implemented' },
  { path: 'vagas', label: 'Consulta de vagas', icon: 'BriefcaseBusiness', element: RHVagasConsultaPage as ComponentType, requiredPermissions: ['jobs.read'], implementationStatus: 'implemented' },
];
