export {
  getAvailableModulesFromCellRegistry as getAvailableModules,
  getModuleDefinitionById as getModuleById,
  getModuleDefinitionById,
  resolveModuleFromPathname,
  cellContractToModuleDefinition,
} from '@/core/cells/cell-to-module-definition';
export type {
  ModuleDefinition,
  ModuleFeature,
  ModuleAction,
  ModuleCategory,
} from '@/components/legacy/portal/ModuleRegistry';
export { CATEGORY_META } from '@/components/legacy/portal/ModuleRegistry';
export {
  hasModulePermission,
  getAvailableFeatures,
  getAvailableModuleFeatures,
  getModuleActions,
  groupModulesByCategory,
} from '@/components/legacy/portal/ModuleRegistry';
export { PORTAL_MODULES } from '@/components/legacy/portal/ModuleRegistry';
export { MODULE_PERMISSION_MAP } from '@/components/legacy/portal/ModuleRegistry';
