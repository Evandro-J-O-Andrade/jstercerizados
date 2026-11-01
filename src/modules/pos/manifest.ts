/**
 * Manifesto da célula pos — Ponto de venda, caixas e terminais.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const posCellManifest = {
  id: 'pos',
  name: 'POS — Ponto de Venda',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'pos',
  description:
    'Ponto de venda, caixas e terminais.',
  homeRoute: '/dashboard/pos',
  sidebarLabel: 'POS',
  sidebarIcon: 'CreditCard',
  isGlobal: false,
  enabled: true,
} as const;
