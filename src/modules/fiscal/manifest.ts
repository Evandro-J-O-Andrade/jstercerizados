/**
 * Manifesto da célula fiscal — Notas fiscais, emissão e conformidade tributária.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const fiscalCellManifest = {
  id: 'fiscal',
  name: 'Fiscal',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'fiscal',
  description:
    'Notas fiscais, emissão e conformidade tributária.',
  homeRoute: '/dashboard/fiscal',
  sidebarLabel: 'Fiscal',
  sidebarIcon: 'FileText',
  isGlobal: false,
  enabled: true,
} as const;
