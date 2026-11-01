/**
 * Manifesto da célula rh — Gestão de pessoas, funcionários e processos internos.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const rhCellManifest = {
  id: 'rh',
  name: 'Recursos Humanos',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'rh',
  description:
    'Gestão de pessoas, funcionários e processos internos.',
  homeRoute: '/dashboard/rh',
  sidebarLabel: 'RH',
  sidebarIcon: 'Users',
  isGlobal: false,
  enabled: true,
} as const;
