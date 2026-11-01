/**
 * Manifesto da célula estoque — Produtos, materiais e movimentações.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const estoqueCellManifest = {
  id: 'estoque',
  name: 'Estoque',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'estoque',
  description:
    'Produtos, materiais e movimentações.',
  homeRoute: '/dashboard/estoque',
  sidebarLabel: 'Estoque',
  sidebarIcon: 'Package',
  isGlobal: false,
  enabled: true,
} as const;
