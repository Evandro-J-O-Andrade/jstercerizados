import { type ReactNode } from 'react';
import { SectionLoader } from '@/components/feedback/SectionLoader';
import { InlineLoader } from '@/components/feedback/InlineLoader';
import { ErrorState } from '@/components/fallback/ErrorState';
import { TimeoutState } from '@/components/fallback/TimeoutState';
import { EmptyState } from '@/components/fallback/EmptyState';
import { NotFoundState } from '@/components/fallback/NotFoundState';
import { UnauthorizedState } from '@/components/fallback/UnauthorizedState';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export type AsyncStatus =
  | 'idle'
  | 'loading'
  | 'warning'
  | 'timed_out'
  | 'error'
  | 'empty'
  | 'not_found'
  | 'unauthorized'
  | 'success';

export interface AsyncData<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
}

export interface DataStateProps<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  loader?: 'page' | 'section' | 'inline' | false;
  loaderMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRetry?: () => void;
  onBack?: () => void;
  retryMessage?: string;
  backMessage?: string;
  children: (data: NonNullable<T>) => ReactNode;
  loaderClassName?: string;
  contentClassName?: string;
}

export function DataState<T>({
  status,
  data,
  error,
  loader = 'section',
  loaderMessage,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  onRetry,
  onBack,
  retryMessage,
  backMessage,
  children,
  loaderClassName,
  contentClassName,
}: DataStateProps<T>) {
  const renderLoader = () => {
    if (loader === false) return null;
    if (loader === 'page')
      return (
        <SectionLoader message={loaderMessage} className={loaderClassName} />
      );
    if (loader === 'inline')
      return (
        <InlineLoader message={loaderMessage} className={loaderClassName} />
      );
    return (
      <SectionLoader message={loaderMessage} className={loaderClassName} />
    );
  };

  switch (status) {
    case 'idle':
    case 'loading':
      return renderLoader();

    case 'warning':
      return (
        <SectionLoader
          message="Ainda estamos buscando as informações..."
          className={loaderClassName}
        />
      );

    case 'timed_out':
      return <TimeoutState onRetry={onRetry} />;

    case 'error': {
      const message = retryMessage ?? error?.message;
      return (
        <ErrorState
          message={message}
          onRetry={onRetry}
          supportText="Se o problema persistir, entre em contato com o suporte."
        />
      );
    }

    case 'empty':
      return (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      );

    case 'not_found':
      return (
        <NotFoundState
          title={backMessage ? undefined : 'Registro não encontrado'}
          message={backMessage ?? 'O registro solicitado não foi localizado.'}
          onBack={onBack}
        />
      );

    case 'unauthorized':
      return (
        <UnauthorizedState
          title={backMessage ? undefined : 'Acesso não autorizado'}
          message={
            backMessage ??
            'Você não possui permissão para acessar este recurso.'
          }
          onBack={onBack}
        />
      );

    case 'success':
    default: {
      if (!data) {
        return (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        );
      }
      const content = children(data);
      if (contentClassName) {
        return <div className={contentClassName}>{content}</div>;
      }
      return <>{content}</>;
    }
  }
}

export { ErrorBoundary } from '@/components/error/ErrorBoundary';

export function withDataBoundary<T>(
  errorFallback?: (error: Error | null, reset: () => void) => ReactNode,
) {
  return (
    props: Omit<DataStateProps<T>, 'children'> & {
      children: (data: NonNullable<T>) => ReactNode;
    },
  ) => (
    <ErrorBoundary fallback={errorFallback?.(null, () => {})}>
      <DataState<T> {...props} />
    </ErrorBoundary>
  );
}
