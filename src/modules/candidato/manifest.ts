/**
 * Manifesto da célula candidato — Portal do candidato.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const candidatoCellManifest = {
  id: 'candidato',
  name: 'Área do Candidato',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'candidato',
  description:
    'Vagas, candidaturas, currículo e configurações do portal candidato.',
  homeRoute: '/candidato',
  sidebarLabel: 'Área do Candidato',
  sidebarIcon: 'Briefcase',
  isGlobal: false,
  enabled: true,
} as const;
