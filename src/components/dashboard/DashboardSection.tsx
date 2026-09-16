import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils';

export interface DashboardSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  testId?: string;
}

export function DashboardSection({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  testId,
}: DashboardSectionProps) {
  return (
    <Card
      data-testid={testId ?? 'dashboard-section'}
      className={cn('border-border bg-card p-5 shadow-sm sm:p-6', className)}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="border-border bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
              <Icon
                aria-hidden="true"
                className="text-muted-foreground h-4 w-4"
              />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-foreground text-base font-semibold">{title}</h2>
            {description && (
              <p className="text-muted-foreground mt-0.5 text-sm">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </Card>
  );
}
