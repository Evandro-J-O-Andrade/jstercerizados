/**
 * Manifesto da célula admin — Administração de tenant.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const adminCellManifest = {
  id: 'admin',
  name: 'Administração',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'admin',
  description:
    'Gestão de tenants, roles, permissões, auditoria e configurações do sistema.',
  homeRoute: '/dashboard/admin',
  sidebarLabel: 'Administração',
  sidebarIcon: 'ShieldCheck',
  isGlobal: false,
  enabled: true,
} as const;
