/**
 * modules-canonical - Fonte can�nica baseada em c�lulas CHECK BOULER 24H
 * Usa CellRegistry como fonte �nica. Sem depend�ncia estrutural do legado.
 */
export {
  getAvailableModulesFromCellRegistry,
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

export type { CellContract, CellRoute } from '@/core/types';
