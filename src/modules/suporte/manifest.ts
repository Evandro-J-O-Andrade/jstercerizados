/**
 * Manifesto da célula suporte — Chamados, FAQ e atendimento.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const suporteCellManifest = {
  id: 'suporte',
  name: 'Suporte',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'suporte',
  description:
    'Chamados, FAQ e atendimento.',
  homeRoute: '/dashboard/suporte',
  sidebarLabel: 'Suporte',
  sidebarIcon: 'Headphones',
  isGlobal: false,
  enabled: true,
} as const;
