import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ErrorState } from '@/components/fallback/ErrorState';

describe('ErrorState', () => {
  it('renders default title and message', () => {
    const onRetry = vi.fn();
    const { getByText } = render(<ErrorState onRetry={onRetry} />);
    expect(getByText('Não foi possível carregar os dados')).toBeTruthy();
    expect(getByText('Tentar novamente')).toBeTruthy();
  });

  it('hides retry button when onRetry is not provided', () => {
    const { queryByText } = render(<ErrorState />);
    expect(queryByText('Tentar novamente')).toBeNull();
  });

  it('shows Voltar button when onBack is provided and triggers handler', () => {
    const onBack = vi.fn();
    const { getByText } = render(<ErrorState onBack={onBack} />);
    const back = getByText('Voltar');
    back.click();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders custom retry label and message', () => {
    const onRetry = vi.fn();
    const { getByText } = render(
      <ErrorState
        title="Falha personalizada"
        message="Detalhe do erro"
        retryLabel="Refazer"
        onRetry={onRetry}
      />,
    );
    expect(getByText('Falha personalizada')).toBeTruthy();
    expect(getByText('Detalhe do erro')).toBeTruthy();
    expect(getByText('Refazer')).toBeTruthy();
  });
});
