/**
 * Compatibilidade de imports legados do Portal.
 *
 * O registro canônico pertence à plataforma de células. Componentes de
 * navegação podem consumir esse registro, mas não definem a existência nem
 * controlam a entrada das células.
 */
export {
  CELL_REGISTRY,
  PORTAL_MODULES,
  MODULE_PERMISSION_MAP,
  CATEGORY_META,
  hasModulePermission,
  getAvailableModules,
  getAvailableFeatures,
  getAvailableModuleFeatures,
  getModuleActions,
  groupModulesByCategory,
  getModuleById,
} from '@/platform/cells/CellRegistry';

export type {
  ModuleDefinition,
  ModuleFeature,
  ModuleAction,
  ModuleCategory,
} from '@/platform/cells/CellRegistry';
