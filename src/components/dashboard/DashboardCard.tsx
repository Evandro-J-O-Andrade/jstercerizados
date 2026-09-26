import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils';
import {
  formatDashboardMetricValue,
  type DashboardMetric,
  type DashboardMetricTone,
} from '@/components/dashboard/dashboard-model';

const toneClasses: Record<DashboardMetricTone, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-destructive/10 text-destructive border-destructive/20',
  neutral: 'bg-muted text-muted-foreground border-border',
};

export interface DashboardCardProps {
  metric: DashboardMetric;
  loading?: boolean;
  className?: string;
}

export function DashboardCard({
  metric,
  loading = false,
  className,
}: DashboardCardProps) {
  const Icon = metric.icon ?? LayoutDashboard;
  const testId = metric.testId ?? `dashboard-card-${metric.id}`;
  const value = formatDashboardMetricValue(metric);

  const card = (
    <Card
      variant="interactive"
      hover
      padding="md"
      data-testid={loading ? `dashboard-card-skeleton-${metric.id}` : testId}
      aria-busy={loading || undefined}
      className={cn(className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {metric.label}
          </p>
          {loading ? (
            <div className="bg-muted mt-3 h-8 w-24 animate-pulse rounded-md" />
          ) : (
            <p className="text-foreground mt-2 text-2xl leading-tight font-bold">
              {value}
            </p>
          )}
          {metric.description && !loading && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {metric.description}
            </p>
          )}
        </div>
        <div
          data-testid={loading ? undefined : `dashboard-icon-${metric.id}`}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
            toneClasses[metric.tone ?? 'neutral'],
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return card;
  }

  if (metric.href) {
    return (
      <Link
        to={metric.href}
        aria-label={`${metric.label}: ${value}`}
        className="focus-visible:ring-primary focus-visible:ring-offset-background block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {card}
      </Link>
    );
  }

  return card;
}
