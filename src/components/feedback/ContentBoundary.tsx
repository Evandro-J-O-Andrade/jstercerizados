import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { ErrorState } from '@/components/fallback/ErrorState';
import { EmptyState } from '@/components/fallback/EmptyState';
import { NotFoundState } from '@/components/fallback/NotFoundState';
import { UnauthorizedState } from '@/components/fallback/UnauthorizedState';

export type ContentBoundaryStatus =
  'loading' | 'error' | 'empty' | 'not_found' | 'unauthorized' | 'success';

export interface ContentBoundaryProps {
  status: ContentBoundaryStatus;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  onEmptyAction?: () => void;
  homeRoute?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  className?: string;
  children: ReactNode;
}

/**
 * ContentBoundary — Nível 2 do contrato de feedback.
 *
 * Delimita apenas a área de conteúdo do módulo. Header, Sidebar e Footer
 * ficam FORA deste componente e não são desmontados durante uma operação.
 *
 * O loading usa RouteLoadingFallback (componente protegido pelo
 * src/components/ui/loading-contract.ts), que já implementa o degrade
 * progressivo: spinner primeiro, logo J&S + mensagem apenas após o limiar
 * de 2s.
 *
 * O botão "Voltar" respeita o histórico real do navegador: usa window.history
 * apenas quando existe entrada anterior dentro do app, senão cai no
 * homeRoute do contexto (ex.: /candidato, nunca /dashboard dentro do portal
 * do candidato).
 */
export function ContentBoundary({
  status,
  error,
  isEmpty = false,
  onRetry,
  onEmptyAction,
  homeRoute,
  emptyTitle = 'Nada por aqui ainda',
  emptyDescription,
  emptyActionLabel,
  className,
  children,
}: ContentBoundaryProps) {
  const navigate = useNavigate();

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (homeRoute) {
      navigate(homeRoute);
    }
  };

  if (status === 'loading') {
    return <RouteLoadingFallback />;
  }

  if (status === 'error') {
    return (
      <ErrorState
        message={error ?? undefined}
        onRetry={onRetry}
        onBack={goBack}
      />
    );
  }

  if (status === 'not_found') {
    return <NotFoundState onBack={goBack} />;
  }

  if (status === 'unauthorized') {
    return <UnauthorizedState onBack={goBack} />;
  }

  if (status === 'empty' || isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return <div className={className}>{children}</div>;
}
