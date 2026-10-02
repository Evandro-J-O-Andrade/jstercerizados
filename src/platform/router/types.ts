import type { ComponentType } from 'react';

export interface ModuleRoute {
  path: string;
  label: string;
  icon?: string;
  element: ComponentType | (() => Promise<{ default: ComponentType }>);
  requiredPermissions: string[];
  children?: ModuleRoute[];
  implementationStatus?:
    'implemented' | 'coming_soon' | 'beta' | 'disabled' | 'deprecated';
}

export interface ModuleRoutes {
  moduleId: string;
  routes: ModuleRoute[];
}

export interface ModuleRouteRegistry {
  [moduleId: string]: ModuleRoutes;
}
