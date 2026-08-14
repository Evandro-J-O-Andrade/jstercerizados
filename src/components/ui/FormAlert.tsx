import { type ReactNode } from 'react';
import { cn } from '@/utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type FormAlertVariant = 'error' | 'success' | 'info';

interface FormAlertProps {
  variant?: FormAlertVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<FormAlertVariant, string> = {
  error: 'border-destructive/30 bg-destructive/5 text-destructive',
  success: 'border-success/30 bg-success/5 text-success',
  info: 'border-primary/30 bg-primary/5 text-primary',
};

const VARIANT_ICONS: Record<
  FormAlertVariant,
  React.ComponentType<{ className?: string }>
> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function FormAlert({
  variant = 'info',
  title,
  description,
  action,
  className,
}: FormAlertProps) {
  const Icon = VARIANT_ICONS[variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex gap-3 rounded-xl border p-4',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
