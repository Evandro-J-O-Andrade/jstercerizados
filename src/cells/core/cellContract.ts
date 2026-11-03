import type { CellContract } from '@/core/types';

export const coreCellContract: CellContract = {
  id: 'core',
  name: 'Core',
  version: '1.0.0',
  description: 'Núcleo do sistema: infraestrutura compartilhada e governança.',
  category: 'core',
  domain: 'global',
  scope: 'global',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard',
  routes: [
    { path: '/dashboard', label: 'Dashboard' },
  ],
  layout: { skipLayout: false },
  navigation: { sidebar: false, label: 'Core', icon: 'LayoutDashboard' },
  permissions: [],
  enabled: true,
};