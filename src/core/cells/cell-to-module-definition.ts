/**
 * cell-to-module-definition.ts — Ponte entre CellRegistry (canônico) e
 * ModuleRouter/ModuleContext (legado).
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
} from '@/components/legacy/portal/ModuleRegistry';
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
    icon: 'briefcase',
    route: featureRoute,
    requiredPermissions: route.requiredPermissions,
    implementationStatus: 'implemented',
  };
}

/**
 * Converte um CellContract em ModuleDefinition.
 *
 * Módulos que não são "candidato" recebem o prefixo "/dashboard/" para
 * compatibilidade com o PORTAL_MODULES legado, que usa rotas como
 * "/dashboard/recrutamento", "/dashboard/rh", etc.
 */
export function cellContractToModuleDefinition(
  cell: CellContract,
): ModuleDefinition {
  const isCandidate = cell.id === 'candidato';
  const baseRoute = isCandidate ? '/candidato' : `/dashboard/${cell.id}`;

  const features = cell.routes.map((route) =>
    cellRouteToModuleFeature(route, cell.id, baseRoute),
  );

  return {
    id: cell.id,
    title: cell.name,
    description: `${cell.name} - Módulo operacional`,
    icon: 'briefcase',
    route: baseRoute,
    category: 'negocio' as ModuleCategory,
    requiredPermissions: cell.permissions.length > 0 ? cell.permissions : [],
    features,
    scope: 'tenant',
  };
}

/**
 * Retorna todos os módulos disponíveis, priorizando o CellRegistry (canônico)
 *
 * Este é o replacement direto para getAvailableModules() do ModuleRegistry
 * legado, garantindo que todas as células registradas no CellRegistry
 * estejam disponíveis para resolução de rotas.
 */
export function getAvailableModulesFromCellRegistry(
  effectiveScopes: string | ('global' | 'tenant')[] = 'tenant',
): ModuleDefinition[] {
  const scopes = Array.isArray(effectiveScopes)
    ? effectiveScopes
    : [effectiveScopes];

  // Módulos do CellRegistry (fonte canônica)
  return cellRegistry
    .getEnabled()
    .map((entry) => cellContractToModuleDefinition(entry.cell))
    .filter((module) => scopes.includes(module.scope));
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
 * 2. CellRegistry (canônico) tem prioridade sobre PORTAL_MODULES para o
 *    mesmo ID de módulo
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
