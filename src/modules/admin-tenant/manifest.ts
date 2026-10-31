/**
 * Manifesto da célula admin-tenant — ambiente exclusivo do proprietário.
 *
 * Esta célula é de propriedade exclusiva do dono do ambiente J&S, acima
 * do admin-master e subordinada apenas à identidade do proprietário.
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const adminTenantCellManifest = {
  id: 'admin-tenant',
  name: 'Admin Tenant — Proprietário',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'owner',
  description:
    'Ambiente exclusivo do proprietário: visão geral, tenants, sistemas, unidades, administradores, gestões e permissões, segurança, auditoria e configurações.',
  homeRoute: '/dashboard/admin-tenant',
  sidebarLabel: 'Administração do Proprietário',
  sidebarIcon: 'ShieldCheck',
  isGlobal: false,
  enabled: true,
} as const;
