import { LoadingOverlay } from './LoadingSpinner';

export function PageLoader() {
  return <LoadingOverlay fullScreen={false} className="min-h-[60dvh]" />;
}
