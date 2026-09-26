import { type HTMLAttributes } from 'react';
import { cn } from '@/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  children: React.ReactNode;
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-muted text-muted-foreground border-border': variant === 'default',
          'bg-primary/10 text-primary border-primary/20':
            variant === 'secondary',
          'bg-success/10 text-success border-success/20': variant === 'success',
          'bg-warning/10 text-warning border-warning/20': variant === 'warning',
          'bg-destructive/10 text-destructive border-destructive/20':
            variant === 'danger',
          'text-muted-foreground border-border bg-transparent':
            variant === 'outline',
        },
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
