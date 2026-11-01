/**
 * Manifesto da célula contabilidade — Plano de contas, lançamentos e fechamento.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const contabilidadeCellManifest = {
  id: 'contabilidade',
  name: 'Contabilidade',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'contabilidade',
  description:
    'Plano de contas, lançamentos e fechamento contábil.',
  homeRoute: '/dashboard/contabilidade',
  sidebarLabel: 'Contabilidade',
  sidebarIcon: 'BookOpen',
  isGlobal: false,
  enabled: true,
} as const;
