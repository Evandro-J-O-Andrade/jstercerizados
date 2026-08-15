'use client';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TimeoutStateProps {
  onRetry?: () => void;
}

export function TimeoutState({ onRetry }: TimeoutStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Clock className="text-muted-foreground mb-4 h-12 w-12" />
      <p className="text-muted-foreground mb-4">
        A operação está demorando mais que o esperado.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
