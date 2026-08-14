import { type ReactNode } from 'react';
import { cn } from '@/utils';
import { Label } from '@/components/ui/Label';

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  helperText,
  required,
  className,
  children,
}: FormFieldProps) {
  const fieldId =
    (children as any)?.props?.id ?? (children as any)?.props?.name;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label htmlFor={fieldId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p
          id={typeof fieldId === 'string' ? `${fieldId}-error` : undefined}
          className="text-destructive mt-1.5 text-sm"
          role="alert"
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
