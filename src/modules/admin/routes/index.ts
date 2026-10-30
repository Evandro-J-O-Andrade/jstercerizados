import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';
import { ADMIN_PERMISSIONS } from '../permissions';

const DashboardAdmin = lazy(() =>
  import('../DashboardAdmin').then((m) => ({ default: m.DashboardAdmin })),
);

const TenantsPage = lazy(() => import('@/pages/dashboard/TenantsPage'));
const RolesPermissoesPage = lazy(() =>
  import('@/pages/dashboard/RolesPermissoesPage'),
);
const UsuariosPage = lazy(() => import('@/pages/dashboard/Usuarios'));
const AuditoriaPage = lazy(() => import('@/pages/dashboard/AuditoriaPage'));
const SegurancaPage = lazy(() => import('@/pages/dashboard/SegurancaPage'));
const SessoesPage = lazy(() => import('@/pages/dashboard/SessoesPage'));
const AssinaturasPage = lazy(() => import('@/pages/dashboard/AssinaturasPage'));
const GestaoSaaSPage = lazy(() => import('@/pages/dashboard/GestaoSaaSPage'));
const IntegracoesPage = lazy(() => import('@/pages/dashboard/IntegracoesPage'));
const RbacAuditPage = lazy(() => import('@/pages/dashboard/RbacAuditPage'));
const CompanyRelationshipsPage = lazy(() =>
  import('@/pages/dashboard/CompanyRelationshipsPage'),
);
const NotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage'));

export const adminRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Admin',
    element: DashboardAdmin as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.dashboardRead],
    icon: 'Shield',
  },
  {
    path: 'tenants',
    label: 'Tenants',
    element: TenantsPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.tenantRead],
    icon: 'Building2',
  },
  {
    path: 'roles-permissoes',
    label: 'Roles e Permissões',
    element: RolesPermissoesPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.roleRead, ADMIN_PERMISSIONS.permissionRead],
    icon: 'ShieldCheck',
  },
  {
    path: 'usuarios',
    label: 'Usuários',
    element: UsuariosPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.userRead],
    icon: 'Users',
  },
  {
    path: 'auditoria',
    label: 'Auditoria',
    element: AuditoriaPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.auditRead],
    icon: 'Activity',
  },
  {
    path: 'seguranca',
    label: 'Segurança',
    element: SegurancaPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.securityRead],
    icon: 'Lock',
  },
  {
    path: 'sessoes',
    label: 'Sessões',
    element: SessoesPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.sessionRead],
    icon: 'Monitor',
  },
  {
    path: 'assinaturas',
    label: 'Assinaturas',
    element: AssinaturasPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.subscriptionRead],
    icon: 'CreditCard',
  },
  {
    path: 'gestao-saas',
    label: 'Gestão SaaS',
    element: GestaoSaaSPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.subscriptionWrite],
    icon: 'Settings',
  },
  {
    path: 'integracoes',
    label: 'Integrações',
    element: IntegracoesPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.integrationRead],
    icon: 'PlugZap',
  },
  {
    path: 'rbac-auditoria',
    label: 'Auditoria RBAC',
    element: RbacAuditPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.auditRead],
    icon: 'ShieldAlert',
  },
  {
    path: 'relacionamentos',
    label: 'Relacionamentos',
    element: CompanyRelationshipsPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.tenantRead],
    icon: 'Share2',
  },
  {
    path: 'notificacoes',
    label: 'Notificações',
    element: NotificationsPage as unknown as ComponentType,
    requiredPermissions: [ADMIN_PERMISSIONS.securityRead],
    icon: 'Bell',
  },
];
