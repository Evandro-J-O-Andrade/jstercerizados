import { ErrorState } from '@/components/fallback';

export interface DashboardErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function DashboardErrorState({
  message,
  onRetry,
}: DashboardErrorStateProps) {
  return (
    <ErrorState
      message={message}
      onRetry={onRetry}
      retryLabel="Tentar novamente"
    />
  );
}
