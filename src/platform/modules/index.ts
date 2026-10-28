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
