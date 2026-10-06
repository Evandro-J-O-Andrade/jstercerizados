import { type HTMLAttributes } from 'react';
import { cn } from '@/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="inline-loader"
      {...rest}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <LoadingSpinner size={size} />
      <span className="text-muted-foreground text-xs">{message}</span>
    </span>
  );
}
