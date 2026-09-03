import { type HTMLAttributes } from 'react';
import { cn } from '@/utils';

interface InlineLoaderProps extends HTMLAttributes<HTMLDivElement> {
  message?: string;
  size?: 'sm' | 'md';
}

export function InlineLoader({
  className,
  message = 'Carregando',
  size = 'sm',
  ...rest
}: InlineLoaderProps) {
  const spinnerSize = size === 'md' ? 'h-5 w-5 border-2' : 'h-4 w-4 border-2';

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="inline-loader"
      {...rest}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <span
        className={cn(
          'border-border border-t-primary inline-block animate-spin rounded-full',
          spinnerSize,
        )}
      />
      <span className="text-muted-foreground text-xs">{message}</span>
    </span>
  );
}
