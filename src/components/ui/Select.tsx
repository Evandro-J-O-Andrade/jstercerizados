import { type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  helperText?: string;
  children: React.ReactNode;
}

export function Select({
  className,
  error,
  label,
  helperText,
  children,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-muted-foreground mb-1.5 block text-sm font-medium"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'border-input bg-surface text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/20 read-only:bg-muted/30 read-only:text-muted-foreground w-full rounded-lg border px-4 py-2.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error &&
            'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="text-destructive mt-1.5 text-sm">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-muted-foreground mt-1.5 text-sm">{helperText}</p>
      )}
    </div>
  );
}
