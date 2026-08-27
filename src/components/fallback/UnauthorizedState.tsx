'use client';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UnauthorizedStateProps {
  title?: string;
  message?: string;
  backLabel?: string;
  onBack?: () => void;
}

export function UnauthorizedState({
  title = 'Acesso não autorizado',
  message = 'Você não possui permissão para acessar este recurso.',
  backLabel = 'Voltar',
  onBack,
}: UnauthorizedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Lock className="text-muted-foreground mb-4 h-12 w-12" />
      <p className="text-foreground mb-2 font-medium">{title}</p>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">{message}</p>
      {onBack && (
        <Button onClick={onBack} variant="outline" size="sm">
          {backLabel}
        </Button>
      )}
    </div>
  );
}
