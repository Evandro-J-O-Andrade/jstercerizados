/**
 * Manifesto da célula recrutamento — Vagas, candidatos e processos seletivos.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const recrutamentoCellManifest = {
  id: 'recrutamento',
  name: 'Recrutamento',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'recrutamento',
  description:
    'Vagas, candidatos e processos seletivos.',
  homeRoute: '/dashboard/recrutamento',
  sidebarLabel: 'Recrutamento',
  sidebarIcon: 'Briefcase',
  isGlobal: false,
  enabled: true,
} as const;
