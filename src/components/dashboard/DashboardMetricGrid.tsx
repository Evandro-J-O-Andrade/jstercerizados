import type { ReactNode } from 'react';
import { cn } from '@/utils';

export interface DashboardMetricGridProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

export function DashboardMetricGrid({
  children,
  className,
  testId = 'dashboard-metric-grid',
}: DashboardMetricGridProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
