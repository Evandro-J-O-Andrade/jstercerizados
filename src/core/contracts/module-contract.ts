import type { Permission } from '@/types/auth';
import { getPermissionKey } from '@/utils/rbac-normalize';

export type ModuleCategory =
  | 'inicio'
  | 'plataforma'
  | 'negocio'
  | 'ia'
  | 'seguranca'
  | 'documentos'
  | 'conta';

export interface ModuleAction {
  id: string;
  title: string;
  description: string;
  permission: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ModuleFeature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  route: string;
  legacyRoutes?: string[];
  requiredPermissions?: string[];
  actions?: ModuleAction[];
  features?: ModuleFeature[];
  implementationStatus?:
    | 'implemented'
    | 'coming_soon'
    | 'beta'
    | 'disabled'
    | 'deprecated';
}

export interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  category: ModuleCategory;
  requiredPermissions?: string[];
  features?: ModuleFeature[];
  scope: 'global' | 'tenant';
}

export const CATEGORY_META: Record<
  ModuleCategory,
  { label: string; order: number }
> = {
  inicio: { label: 'INÍCIO', order: 0 },
  plataforma: { label: 'PLATAFORMA', order: 1 },
  negocio: { label: 'OPERAÇÃO', order: 2 },
  ia: { label: 'IA & AUTOMAÇÃO', order: 3 },
  seguranca: { label: 'SEGURANÇA', order: 4 },
  documentos: { label: 'DOCUMENTOS', order: 5 },
  conta: { label: 'CONTA', order: 6 },
};

export function hasModulePermission(
  permissions: Permission[],
  requiredPermissions: string[] = [],
): boolean {
  if (requiredPermissions.length === 0) return false;
  return requiredPermissions.some((required) =>
    permissions.some((permission) => getPermissionKey(permission) === required),
  );
}

function isConcreteNavRoute(route: string): boolean {
  return Boolean(route) && !/\/:[^/]+/.test(route) && !route.endsWith('/*') && !route.includes('*');
}

export function getAvailableFeatures(
  permissions: Permission[],
  module: ModuleDefinition,
  scope: 'global' | 'tenant' | Array<'global' | 'tenant'> = 'tenant',
): ModuleFeature[] {
  const scopes = Array.isArray(scope) ? scope : [scope];
  if (!module.features || !scopes.includes(module.scope)) return [];
  return module.features.filter(
    (feature) =>
      hasModulePermission(permissions, feature.requiredPermissions) &&
      feature.route !== module.route &&
      isConcreteNavRoute(feature.route),
  );
}

export function getAvailableModuleFeatures(
  permissions: Permission[],
  module: ModuleDefinition,
  scope: 'global' | 'tenant' | Array<'global' | 'tenant'> = 'tenant',
): ModuleFeature[] {
  const scopes = Array.isArray(scope) ? scope : [scope];
  if (!module.features || !scopes.includes(module.scope)) return [];
  return module.features.filter(
    (feature) =>
      hasModulePermission(permissions, feature.requiredPermissions) &&
      isConcreteNavRoute(feature.route),
  );
}

export function getModuleActions(
  permissions: Permission[],
  module: ModuleDefinition,
): ModuleAction[] {
  return (module.features ?? []).flatMap((feature) =>
    (feature.actions ?? []).filter((action) =>
      hasModulePermission(permissions, [action.permission]),
    ),
  );
}

export function groupModulesByCategory(
  modules: ModuleDefinition[],
): Record<ModuleCategory, ModuleDefinition[]> {
  const grouped: Record<ModuleCategory, ModuleDefinition[]> = {
    inicio: [],
    plataforma: [],
    negocio: [],
    ia: [],
    seguranca: [],
    documentos: [],
    conta: [],
  };

  for (const module of modules) grouped[module.category].push(module);
  return grouped;
}
