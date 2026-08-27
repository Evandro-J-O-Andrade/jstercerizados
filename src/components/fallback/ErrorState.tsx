'use client';
import { RefreshCw, Server } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  supportText?: string;
}

export function ErrorState({
  title = 'Não foi possível carregar os dados',
  message = 'Ocorreu um problema ao consultar as informações. Tente novamente em alguns instantes.',
  onRetry,
  supportText = 'Se o problema persistir, entre em contato com o suporte.',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Server className="text-muted-foreground mb-4 h-12 w-12" />
      <p className="text-foreground mb-2 font-medium">{title}</p>
      <p className="text-muted-foreground mb-2 max-w-md text-sm">{message}</p>
      {supportText && (
        <p className="text-muted-foreground mb-6 max-w-md text-xs">
          {supportText}
        </p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
