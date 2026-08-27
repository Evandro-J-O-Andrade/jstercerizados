'use client';
import { FileX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NotFoundStateProps {
  title?: string;
  message?: string;
  backLabel?: string;
  onBack?: () => void;
}

export function NotFoundState({
  title = 'Registro não encontrado',
  message = 'O registro solicitado não existe ou não está disponível para este ambiente.',
  backLabel = 'Voltar',
  onBack,
}: NotFoundStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FileX className="text-muted-foreground mb-4 h-12 w-12" />
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
