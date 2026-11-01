import type { CellContract } from '@/core/types';

export const integracoesCellContract: CellContract = {
  id: 'integracoes',
  name: 'Integrações',
  version: '1.0.0',
  description: 'Integrações: conexões externas e sincronizações.',
  category: 'integrações',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/integracoes',
  routes: [],
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Integrações', icon: 'Link' },
  permissions: [],
  enabled: true,
};