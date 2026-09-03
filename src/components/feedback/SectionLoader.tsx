import { type HTMLAttributes } from 'react';
import { cn } from '@/utils';

interface SectionLoaderProps extends HTMLAttributes<HTMLDivElement> {
  message?: string;
  variant?: 'spinner' | 'skeleton';
  lines?: number;
}

export function SectionLoader({
  className,
  message = 'Carregando...',
  variant = 'spinner',
  lines = 3,
  ...rest
}: SectionLoaderProps) {
  if (variant === 'skeleton') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        data-testid="section-loader"
        {...rest}
        className={cn('flex flex-col gap-3 p-4', className)}
      >
        <span className="sr-only">{message}</span>
        {Array.from({ length: Math.max(1, lines) }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'bg-muted relative overflow-hidden rounded-md',
              index === 0 ? 'h-5 w-1/3' : 'h-4',
              index === lines - 1 ? 'w-2/3' : 'w-full',
            )}
          >
            <div className="bg-muted-foreground/10 animate-shimmer absolute inset-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="section-loader"
      {...rest}
      className={cn(
        'flex min-h-[200px] flex-col items-center justify-center gap-3',
        className,
      )}
    >
      <div className="border-border border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
