import type { CellContract } from '@/core/types';

export const coreCellContract: CellContract = {
  id: 'core',
  name: 'Core',
  version: '1.0.0',
  description: 'Núcleo do sistema: dashboard de entrada e infraestrutura compartilhada.',
  category: 'core',
  domain: 'global',
  scope: 'global',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard',
  routes: [
    { path: '/dashboard', label: 'Dashboard' },
  ],
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Core', icon: 'LayoutDashboard' },
  permissions: [],
  enabled: true,
};