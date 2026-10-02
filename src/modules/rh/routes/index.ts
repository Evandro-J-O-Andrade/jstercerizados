import type { ComponentType } from 'react';

export interface ModuleRoute {
  path: string;
  label: string;
  element: ComponentType;
  requiredPermissions: string[];
}

export const rhRoutes: ModuleRoute[] = [
  {
    path: 'dashboard',
    label: 'Dashboard RH',
    element: (() => null) as unknown as ComponentType,
    requiredPermissions: ['people.read'],
  },
];
