/**
 * Manifesto da célula operacoes — Ordens de trabalho, checklists e materiais.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const operacoesCellManifest = {
  id: 'operacoes',
  name: 'Operações',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'operacoes',
  description:
    'Ordens de trabalho, checklists e materiais.',
  homeRoute: '/dashboard/operacoes',
  sidebarLabel: 'Operações',
  sidebarIcon: 'LayoutDashboard',
  isGlobal: false,
  enabled: true,
} as const;
