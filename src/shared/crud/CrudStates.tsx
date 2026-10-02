import { Button } from '@/components/ui/Button';
import { Plus, Eye, Loader2, AlertTriangle } from 'lucide-react';

export function CrudLoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
    </div>
  );
}

interface CrudErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function CrudErrorState({ message, onRetry }: CrudErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-red-600">
      <AlertTriangle className="h-8 w-8" />
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

interface CrudEmptyStateProps {
  message: string;
  canCreate: boolean;
  onCreate: () => void;
}

export function CrudEmptyState({
  message,
  canCreate,
  onCreate,
}: CrudEmptyStateProps) {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12">
      <Eye className="h-8 w-8" />
      <p>{message}</p>
      {canCreate && (
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Criar primeiro registro
        </Button>
      )}
    </div>
  );
}

export function CrudCreateButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick}>
      <Plus className="h-4 w-4" />
      <span className="hidden sm:inline">Novo</span>
    </Button>
  );
}
