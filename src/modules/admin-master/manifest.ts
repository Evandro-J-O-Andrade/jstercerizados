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
    'Visão administrativa global da plataforma: tenants, empresas, pessoas, usuários, papéis, permissões, sessões, módulos e auditoria.',
  homeRoute: '/dashboard/global',
  sidebarLabel: 'Administração Global',
  sidebarIcon: 'ShieldCheck',
  isGlobal: true,
  enabled: true,
} as const;
