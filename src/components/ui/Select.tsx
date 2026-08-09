import { type SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
          className="text-muted-foreground mb-1 block text-sm font-medium"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={twMerge(
          clsx(
            'border-input bg-surface text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/20 read-only:bg-muted/30 read-only:text-muted-foreground w-full rounded-lg border px-4 py-2.5 transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            error &&
              'border-destructive focus:border-destructive focus:ring-destructive/20',
          ),
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="text-destructive mt-1 text-sm">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-muted-foreground mt-1 text-sm">{helperText}</p>
      )}
    </div>
  );
}
