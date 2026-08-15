'use client';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

const ALERT_STYLES: Record<AlertType, string> = {
  error: 'border-destructive/20 bg-destructive/10',
  success: 'border-success/20 bg-success/10',
  warning: 'border-yellow-500/20 bg-yellow-500/10',
  info: 'border-primary/20 bg-primary/10',
};

const ALERT_ICONS: Record<AlertType, typeof AlertCircle> = {
  error: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

interface AlertProps {
  type: AlertType;
  message: string;
  className?: string;
}

export function Alert({ type, message, className }: AlertProps) {
  const Icon = ALERT_ICONS[type];
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 ${ALERT_STYLES[type]} ${className ?? ''}`}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-foreground text-sm">{message}</p>
    </div>
  );
}
