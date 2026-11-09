/**
 * Rotas da célula admin-master — ROOT global.
 *
 * Todas as rotas desta célula são protegidas e exigem perfil admin_master.
 */

import { ADMIN_MASTER_PERMISSIONS } from '../permissions';

export const adminMasterRoutes = [
  {
    path: '/dashboard/admin-master',
    label: 'Governança Admin Master',
    component: 'AdminMasterDashboardPage',
    permission: ADMIN_MASTER_PERMISSIONS.tenants,
    isGlobal: true,
  },
  {
    path: '/dashboard/global',
    label: 'Central 24H',
    component: 'GlobalCommandPage',
    permission: ADMIN_MASTER_PERMISSIONS.tenants,
  },
  {
    path: '/dashboard/tenants',
    label: 'Tenants',
    component: 'TenantsPage',
    permission: ADMIN_MASTER_PERMISSIONS.tenants,
  },
  {
    path: '/dashboard/empresas',
    label: 'Empresas',
    component: 'EmpresasPage',
    permission: ADMIN_MASTER_PERMISSIONS.companies,
  },
  {
    path: '/dashboard/usuarios',
    label: 'Usuários',
    component: 'UsuariosPage',
    permission: ADMIN_MASTER_PERMISSIONS.people,
  },
  {
    path: '/dashboard/recrutamento/candidatos',
    label: 'Gestão de Candidatos',
    component: 'RecrutamentoCandidatos',
    permission: ADMIN_MASTER_PERMISSIONS.candidates,
  },
  {
    path: '/dashboard/vagas',
    label: 'Vagas',
    component: 'VagasPage',
    permission: ADMIN_MASTER_PERMISSIONS.jobs,
  },
  {
    path: '/dashboard/candidaturas',
    label: 'Candidaturas',
    component: 'CandidaturasPage',
    permission: ADMIN_MASTER_PERMISSIONS.applications,
  },
  {
    path: '/dashboard/servicos',
    label: 'Ordens de Serviço',
    component: 'ServicosPage',
    permission: ADMIN_MASTER_PERMISSIONS.serviceOrders,
  },
  {
    path: '/dashboard/suporte',
    label: 'Suporte',
    component: 'SuportePage',
    permission: ADMIN_MASTER_PERMISSIONS.supportTickets,
  },
  {
    path: '/dashboard/pessoas',
    label: 'Pessoas',
    component: 'PessoasPage',
    permission: ADMIN_MASTER_PERMISSIONS.people,
  },
  {
    path: '/dashboard/seguranca',
    label: 'Segurança',
    component: 'SegurancaPage',
    permission: ADMIN_MASTER_PERMISSIONS.securityEvents,
  },
] as const;
