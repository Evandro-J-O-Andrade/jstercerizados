export {
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
} from '@/components/portal/ModuleRegistry';
export type {
  ModuleDefinition,
  ModuleFeature,
  ModuleAction,
  ModuleCategory,
} from '@/components/portal/ModuleRegistry';
