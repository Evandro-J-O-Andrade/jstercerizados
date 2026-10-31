import type { CellContract, CellRoute } from '@/core/types';
import { RecrutamentoRoutes } from './RecrutamentoRoutes';
import { RECRUTAMENTO_PERMISSIONS } from './permissions';

const recrutamentoCellRoutes: CellRoute[] = RecrutamentoRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const recrutamentoCellContract: CellContract = {
  id: 'recrutamento',
  name: 'Recrutamento',
  version: '1.0.0',
  description: 'Gestão de vagas, processos seletivos, candidaturas e etapas.',
  category: 'recrutamento',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/recrutamento',
  routes: recrutamentoCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Recrutamento', icon: 'Briefcase' },
  permissions: Object.values(RECRUTAMENTO_PERMISSIONS),
  enabled: true,
};
