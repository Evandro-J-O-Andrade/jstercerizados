import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

/** Entrada operacional alinhada ao dashboard em /dashboard/ava (App). */
const AvaHome = lazy(() =>
  import('@/modules/ava/dashboard/AvaDashboardPage').then((m) => ({
    default: m.AvaDashboardPage,
  })),
);
const AvaTutorial = lazy(() => import('@/modules/ava/pages/AvaTutorialPage'));

export const avaRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Central de Aprendizado',
    element: AvaHome,
    requiredPermissions: ['ava.read'],
  },
  {
    path: ':slug',
    label: 'Tutorial',
    element: AvaTutorial,
    requiredPermissions: ['ava.read'],
  },
];
