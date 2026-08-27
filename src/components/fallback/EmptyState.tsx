'use client';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}: EmptyStateProps) {
  const DefaultIcon = Icon ?? Inbox;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <DefaultIcon className="text-muted-foreground mb-4 h-12 w-12" />
      <p className="text-foreground mb-2 font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md text-sm">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
