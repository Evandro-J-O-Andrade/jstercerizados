import { type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export function Textarea({
  className,
  error,
  label,
  helperText,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-muted-foreground mb-1.5 block text-sm font-medium"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'border-input bg-surface text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/20 read-only:bg-muted/30 read-only:text-muted-foreground w-full resize-y rounded-lg border px-4 py-2.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error &&
            'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${textareaId}-error`}
          className="text-destructive mt-1.5 text-sm"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-muted-foreground mt-1.5 text-sm">{helperText}</p>
      )}
    </div>
  );
}
