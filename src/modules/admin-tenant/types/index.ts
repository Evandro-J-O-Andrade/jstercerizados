/**
 * Tipos da célula admin-tenant — ambiente do proprietário.
 */

export interface AdminTenantCellContext {
  cellId: 'admin-tenant';
  scope: 'tenant';
  profile: 'owner';
  isOwner: boolean;
}

export interface AdminTenantDashboardMetric {
  id: string;
  label: string;
  value: number | string;
  description: string;
  href?: string;
  permission?: string;
}
