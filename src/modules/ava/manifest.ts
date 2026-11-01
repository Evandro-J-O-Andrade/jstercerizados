/**
 * Manifesto da célula ava — Assistente Virtual de Aprendizado.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const avaCellManifest = {
  id: 'ava',
  name: 'AVA — Assistente Virtual de Aprendizado',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'ava',
  description:
    'Tutoriais em vídeo e guias passo a passo por módulo.',
  homeRoute: '/dashboard/ava',
  sidebarLabel: 'AVA',
  sidebarIcon: 'GraduationCap',
  isGlobal: false,
  enabled: true,
} as const;
