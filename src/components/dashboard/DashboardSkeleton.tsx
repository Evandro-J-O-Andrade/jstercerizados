import type { LucideIcon } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardMetricGrid } from '@/components/dashboard/DashboardMetricGrid';
import type { DashboardMetric } from '@/components/dashboard/dashboard-model';

export interface DashboardSkeletonProps {
  count?: number;
  icon?: LucideIcon;
  label?: string;
}

export function DashboardSkeleton({
  count = 4,
  icon,
  label = 'Carregando indicadores',
}: DashboardSkeletonProps) {
  const metrics: DashboardMetric[] = Array.from(
    { length: count },
    (_, index) => ({
      id: `skeleton-${index}`,
      label: label,
      value: 0,
      icon,
    }),
  );

  return (
    <DashboardMetricGrid testId="dashboard-skeleton-grid">
      {metrics.map((metric) => (
        <DashboardCard key={metric.id} metric={metric} loading />
      ))}
    </DashboardMetricGrid>
  );
}
