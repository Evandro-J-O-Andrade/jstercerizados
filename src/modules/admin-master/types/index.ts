/**
 * Tipos da célula admin-master — ROOT global.
 */

export interface AdminMasterCellContext {
  cellId: 'admin-master';
  scope: 'global';
  profile: 'admin_master';
  isGlobal: boolean;
}

export interface AdminMasterDashboardMetric {
  id: string;
  label: string;
  value: number | string;
  description: string;
  href?: string;
  permission?: string;
}
