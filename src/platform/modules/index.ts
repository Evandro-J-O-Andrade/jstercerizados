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
} from '@/core/contracts/module-contract';
export { CATEGORY_META } from '@/core/contracts/module-contract';
export {
  hasModulePermission,
  getAvailableFeatures,
  getAvailableModuleFeatures,
  getModuleActions,
  groupModulesByCategory,
} from '@/core/contracts/module-contract';
export { MODULE_PERMISSION_MAP } from '@/core/permissions/modulePermissionMap';
