/**
 * cell-to-module-definition.ts — Adaptador entre CellRegistry e o contrato
 * canônico de navegação modular.
 *
 * Converte CellContract (registro canônico de células) em ModuleDefinition
 * (formato esperado pelo roteador legado), permitindo que o ModuleRouter e
 * o ModuleContext usem o CellRegistry como fonte de verdade para resolução
 * de módulos, sem quebrar compatibilidade com rotas existentes.
 *
 * O CellRegistry é a fonte canônica. Não utilizar PORTAL_MODULES como fallback.
 */

import type { CellContract, CellRoute } from '@/core/types';
import type {
  ModuleCategory,
  ModuleDefinition,
  ModuleFeature,
} from '@/core/contracts/module-contract';
import { getPermissionKey } from '@/utils/rbac-normalize';
import type { Permission } from '@/types/auth';
import { cellRegistry } from '@/core/registry/CellRegistryContract';

/**
 * Converte um CellRoute em ModuleFeature (compatível com ModuleRouter).
 */
function cellRouteToModuleFeature(
  route: CellRoute,
  moduleId: string,
  baseRoute: string,
): ModuleFeature {
  const featureRoute = route.path ? `${baseRoute}/${route.path}` : baseRoute;

  return {
    id: `${moduleId}-${route.path.replace(/[/:]/g, '-') || 'root'}`,
    title: route.label,
    description: route.label,
    icon: route.icon ?? 'LayoutDashboard',
    route: featureRoute,
    requiredPermissions: route.requiredPermissions,
    implementationStatus: 'implemented',
  };
}

function normalizeScope(
  scope: unknown,
): 'global' | 'tenant' {
  return scope === 'global' ? 'global' : 'tenant';
}

/**
 * Converte um CellContract em ModuleDefinition.
 *
 * Módulos que não são "candidato" recebem o prefixo "/dashboard/" para
 * consistência com as rotas autenticadas existentes, como
 * "/dashboard/recrutamento" e "/dashboard/rh".
 */
export function cellContractToModuleDefinition(
  cell: CellContract,
): ModuleDefinition {
  const isCandidate = cell.id === 'candidato';
  const baseRoute =
    cell.homeRoute ?? (isCandidate ? '/candidato' : `/dashboard/${cell.id}`);
  const scope = normalizeScope(cell.scope ?? cell.domain);

  const features = cell.routes.map((route) =>
    cellRouteToModuleFeature(route, cell.id, baseRoute),
  );

  return {
    id: cell.id,
    title: cell.name,
    description: `${cell.name} - Módulo operacional`,
    icon: cell.navigation?.icon ?? 'LayoutDashboard',
    route: baseRoute,
    category: 'negocio' as ModuleCategory,
    requiredPermissions: cell.permissions.length > 0 ? cell.permissions : [],
    features,
    scope,
  };
}

type Scope = 'global' | 'tenant';

/** Mantém compatibilidade: alguns consumidores passam scopes; outros (legado/teste) passam permissões + scope. */
export function getAvailableModulesFromCellRegistry(
  scopesOrPermissions: Scope | Scope[] | Array<string | Permission | null | undefined> = 'tenant',
  scope?: Scope,
): ModuleDefinition[] {
  let scopes: Scope[];
  let permissions: Array<string | Permission | null | undefined> | null = null;

  if (scope !== undefined) {
    scopes = [scope];
    permissions = Array.isArray(scopesOrPermissions)
      ? scopesOrPermissions
      : [scopesOrPermissions];
  } else if (Array.isArray(scopesOrPermissions)) {
    const values = scopesOrPermissions;
    const isScopes = values.length > 0 && values.every((v) => v === 'global' || v === 'tenant');
    if (isScopes) {
      scopes = values as Scope[];
    } else {
      scopes = ['tenant'];
      permissions = values;
    }
  } else if (scopesOrPermissions === 'global' || scopesOrPermissions === 'tenant') {
    scopes = [scopesOrPermissions];
  } else {
    scopes = ['tenant'];
    permissions = [scopesOrPermissions];
  }

  const permissionKeys = permissions
    ? new Set(
        permissions
          .map((permission) => getPermissionKey(permission as never))
          .filter(Boolean),
      )
    : null;

  return cellRegistry
    .getEnabled()
    .map((entry) => cellContractToModuleDefinition(entry.cell))
    .filter((module) => scopes.includes(module.scope))
    .filter((module) => {
      if (!permissionKeys) return true;
      const required = module.requiredPermissions ?? [];
      if (required.length === 0) return true;
      return required.some((permission) => permissionKeys.has(permission));
    });
}

/**
 * Resolve um ModuleDefinition por ID, priorizando o CellRegistry.
 */
export function getModuleDefinitionById(
  moduleId: string,
): ModuleDefinition | undefined {
  const cellEntry = cellRegistry.get(moduleId);
  if (cellEntry) {
    return cellContractToModuleDefinition(cellEntry.cell);
  }
  return undefined;
}

/**
 * Resolve o módulo atual baseado no pathname da URL.
 * Usado pelo ModuleContext para identificar currentModule/currentFeature.
 *
 * Prioridade:
 * 1. Match de rota mais específica (mais longa) primeiro - seja de módulo,
 *    feature ou legacyRoute
 * 2. CellRegistry é a fonte canônica
 * 3. null (launcher)
 */
export function resolveModuleFromPathname(pathname: string): {
  module: ModuleDefinition | null;
  feature: ModuleFeature | null;
} {
  // Normaliza pathname
  const normalized = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  // /dashboard (raiz) é lançador de módulo — não resolve para um módulo
  // específico, apenas exibe o seletor de módulos.
  if (normalized === '/dashboard') {
    return { module: null, feature: null };
  }

  // Coletar todos os candidatos com suas rotas, ordenados por comprimento
  // decrescente para que rotas mais específicas sejam verificadas primeiro.
  type Candidate = {
    module: ModuleDefinition;
    feature: ModuleFeature | null;
    route: string;
  };

  const candidates: Candidate[] = [];

  // Candidatos do CellRegistry (fonte canônica)
  for (const entry of cellRegistry.getAll()) {
    if (!entry.cell.enabled) continue;
    const moduleDef = cellContractToModuleDefinition(entry.cell);

    // Módulo raiz
    candidates.push({
      module: moduleDef,
      feature: null,
      route: moduleDef.route,
    });

    // Features
    for (const feature of moduleDef.features ?? []) {
      candidates.push({
        module: moduleDef,
        feature,
        route: feature.route,
      });
    }
  }

  // Ordenar por comprimento de rota decrescente (mais específica primeiro)
  candidates.sort((a, b) => b.route.length - a.route.length);

  // Verificar cada candidato
  for (const candidate of candidates) {
    if (
      normalized === candidate.route ||
      normalized.startsWith(`${candidate.route}/`)
    ) {
      return {
        module: candidate.module,
        feature: candidate.feature,
      };
    }
  }

  // Sem correspondência
  return { module: null, feature: null };
}
