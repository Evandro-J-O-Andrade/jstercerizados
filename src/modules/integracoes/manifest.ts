/**
 * Manifesto da célula integracoes — Integrações.
 */
export const integracoesCellManifest = {
  id: 'integracoes',
  name: 'Integrações',
  domain: 'global',
  scope: 'global',
  profile: 'integracoes',
  description: 'Conexões, webhooks e sincronizações com serviços externos.',
  homeRoute: '/dashboard/integracoes',
  sidebarLabel: 'Integrações',
  sidebarIcon: 'Plug',
  isGlobal: true,
  enabled: true,
} as const;
