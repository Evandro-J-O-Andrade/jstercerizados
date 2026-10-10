import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const AvaHome = lazy(() => import('@/modules/ava/pages/AvaPage'));
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
