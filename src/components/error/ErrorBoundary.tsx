import { Component, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeError } from '@/lib/error-normalizer';
import { ErrorState } from '@/components/fallback/ErrorState';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onBack?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryContentProps {
  error: Error | null;
  onRetry: () => void;
  onBack?: () => void;
}

function ErrorBoundaryContent({
  error,
  onRetry,
  onBack,
}: ErrorBoundaryContentProps) {
  const navigate = useNavigate();
  const normalized = error ? normalizeError(error) : null;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-background flex min-h-[60dvh] items-center justify-center p-4">
      <ErrorState
        title="Algo deu errado"
        message={
          normalized?.userMessage ??
          'Não foi possível renderizar esta área da aplicação.'
        }
        onRetry={onRetry}
        onBack={handleBack}
        supportText="Se o problema persistir, entre em contato com o suporte."
      />
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    const normalized = normalizeError(error);
    console.error(
      '[ErrorBoundary]',
      normalized.technicalDetail,
      errorInfo.componentStack,
    );
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorBoundaryContent
          error={this.state.error}
          onRetry={this.handleReset}
          onBack={this.props.onBack}
        />
      );
    }

    return this.props.children;
  }
}
