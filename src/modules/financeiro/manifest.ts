/**
 * Manifesto da célula financeiro — Contas a pagar, receber, fluxo de caixa.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const financeiroCellManifest = {
  id: 'financeiro',
  name: 'Financeiro',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'financeiro',
  description:
    'Contas a pagar, receber, fluxo de caixa e gestão financeira.',
  homeRoute: '/dashboard/financeiro',
  sidebarLabel: 'Financeiro',
  sidebarIcon: 'DollarSign',
  isGlobal: false,
  enabled: true,
} as const;
