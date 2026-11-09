import type { CellContract, CellRoute } from '@/core/types';
import { CandidatoRoutes } from './CandidatoRoutes';
import { CANDIDATO_PERMISSIONS } from './permissions';

const candidatoCellRoutes: CellRoute[] = CandidatoRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const candidatoCellContract: CellContract = {
  id: 'candidato',
  name: 'Candidato',
  version: '1.0.0',
  description:
    'Portal do candidato: cadastro, currículos, candidaturas e acompanhamento de processos seletivos.',
  category: 'portal',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  // Portal self-service do candidato vive em /candidato/* (App.tsx).
  // /dashboard/candidato (singular) redireciona para gestão canônica em
  // /dashboard/recrutamento/candidatos; nunca expor /dashboard/candidatos (plural).
  homeRoute: '/candidato',

  routes: candidatoCellRoutes,
  layout: { skipLayout: true },
  navigation: { sidebar: true, label: 'Candidato', icon: 'User' },
  permissions: Object.values(CANDIDATO_PERMISSIONS),
  enabled: true,
};
