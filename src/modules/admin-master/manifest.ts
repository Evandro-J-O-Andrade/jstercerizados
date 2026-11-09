/**
 * Manifesto da célula admin-master — ROOT global da plataforma J&S.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const adminMasterCellManifest = {
  id: 'admin-master',
  name: 'Admin Master Global',
  domain: 'global',
  scope: 'global',
  profile: 'admin_master',
  description:
    'Governança administrativa global: tenants, pessoas, permissões, sessões, módulos e auditoria. Central 24H opera em /dashboard/global.',
  homeRoute: '/dashboard/admin-master',
  sidebarLabel: 'Admin Master',
  sidebarIcon: 'ShieldCheck',
  isGlobal: true,
  enabled: true,
} as const;
