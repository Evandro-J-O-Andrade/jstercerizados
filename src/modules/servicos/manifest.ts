/**
 * Manifesto da célula servicos — Catálogo e ordens de serviço.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const servicosCellManifest = {
  id: 'servicos',
  name: 'Serviços',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'servicos',
  description:
    'Catálogo e ordens de serviço.',
  homeRoute: '/dashboard/servicos',
  sidebarLabel: 'Serviços',
  sidebarIcon: 'Wrench',
  isGlobal: false,
  enabled: true,
} as const;
