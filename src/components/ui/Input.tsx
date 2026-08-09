import { type InputHTMLAttributes } from 'react';
import { cn } from '@/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export function Input({
  className,
  error,
  label,
  helperText,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-muted-foreground mb-1 block text-sm font-medium"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'border-input bg-surface text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/20 read-only:bg-muted/30 read-only:text-muted-foreground w-full rounded-lg border px-4 py-2.5 transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error &&
            'border-destructive focus:border-destructive focus:ring-destructive/20',
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-destructive mt-1 text-sm">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-muted-foreground mt-1 text-sm">{helperText}</p>
      )}
    </div>
  );
}
