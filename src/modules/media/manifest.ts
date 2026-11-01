/**
 * Manifesto da célula media — Gestão de mídia e assets.
 *
 * Cada célula declara seu domínio, rotas, permissões e contratos.
 * O CellRegistry utiliza este manifesto para registrar a célula
 * sem conceder privilégios automaticamente.
 */

export const mediaCellManifest = {
  id: 'media',
  name: 'Mídia',
  domain: 'tenant',
  scope: 'tenant',
  profile: 'media',
  description:
    'Gestão de assets de mídia, upload e galeria.',
  homeRoute: '/dashboard/media',
  sidebarLabel: 'Mídia',
  sidebarIcon: 'Image',
  isGlobal: false,
  enabled: true,
} as const;
