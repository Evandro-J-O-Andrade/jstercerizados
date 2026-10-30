import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';
import { RECRUTAMENTO_PERMISSIONS } from './permissions';
const DashboardRecrutamento = lazy(() =>
  import('@/pages/dashboard/DashboardRecrutamento').then((m) => ({
    default: m.default,
  })),
);

const VagasPage = lazy(() => import('@/pages/dashboard/Vagas').then((m) => ({
  default: m.default,
})));

const ProcessosSeletivosPage = lazy(() =>
  import('@/pages/dashboard/ProcessosSeletivos').then((m) => ({
    default: m.default,
  })),
);

const CandidaturasPage = lazy(() =>
  import('@/modules/candidato/pages/CandidaturasKanban').then((m) => ({
    default: m.default,
  })),
);

const CandidatosPage = lazy(() => import('@/pages/dashboard/Candidatos'));

const EtapasPage = lazy(() => import('@/pages/dashboard/Etapas'));

export const RecrutamentoRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Recrutamento',
    element: DashboardRecrutamento as unknown as ComponentType,
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.vagas],
    icon: 'Briefcase',
  },
  {
    path: 'vagas',
    label: 'Vagas',
    element: VagasPage as unknown as ComponentType,
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.vagas],
    icon: 'BriefcaseBusiness',
  },
  {
    path: 'processos-seletivos',
    label: 'Processos Seletivos',
    element: ProcessosSeletivosPage as unknown as ComponentType,
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.processos],
    icon: 'ClipboardList',
  },
  {
    path: 'candidaturas',
    label: 'Candidaturas',
    element: CandidaturasPage as unknown as ComponentType,
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.candidaturas],
    icon: 'FileText',
  },
  {
    path: 'candidatos',
    label: 'Candidatos',
    element: CandidatosPage as unknown as ComponentType,
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.candidatos],
    icon: 'User',
  },
  {
    path: 'etapas',
    label: 'Etapas',
    element: EtapasPage as unknown as ComponentType,
    requiredPermissions: [RECRUTAMENTO_PERMISSIONS.etapasGerenciar],
    icon: 'CheckCircle',
  },
];
