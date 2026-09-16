import type { LucideIcon } from 'lucide-react';
import type { Permission } from '@/types/auth';

export type DashboardMetricTone =
  'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export type DashboardMetricFormat = 'number' | 'currency';

export interface DashboardMetric {
  id: string;
  label: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  tone?: DashboardMetricTone;
  href?: string;
  permission?: string;
  format?: DashboardMetricFormat;
  testId?: string;
}

export function formatDashboardMetricValue(
  metric: Pick<DashboardMetric, 'value' | 'format'>,
): string {
  if (typeof metric.value !== 'number') {
    return metric.value;
  }

  if (metric.format === 'currency') {
    return metric.value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return metric.value.toLocaleString('pt-BR');
}

export function filterDashboardMetrics(
  metrics: DashboardMetric[],
  permissions: Permission[],
  isAdminMaster: boolean,
): DashboardMetric[] {
  if (isAdminMaster) {
    return metrics;
  }

  return metrics.filter((metric) => {
    if (!metric.permission) {
      return true;
    }

    return permissions.some(
      (permission) =>
        `${permission.resource}.${permission.action}` === metric.permission,
    );
  });
}
