import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('render exploded');
  return <span>ok</span>;
}

const withRouter = (ui: React.ReactNode) => (
  <MemoryRouter initialEntries={['/']}>{ui}</MemoryRouter>
);

describe('ErrorBoundary', () => {
  it('renders children when no error is thrown', () => {
    const { getByText } = render(
      withRouter(
        <ErrorBoundary>
          <Boom shouldThrow={false} />
        </ErrorBoundary>,
      ),
    );
    expect(getByText('ok')).toBeTruthy();
  });

  it('catches render errors and shows ErrorState fallback', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText, queryByText } = render(
      withRouter(
        <ErrorBoundary>
          <Boom shouldThrow />
        </ErrorBoundary>,
      ),
    );

    expect(getByText('Algo deu errado')).toBeTruthy();
    expect(getByText('Tentar novamente')).toBeTruthy();
    expect(getByText('Voltar')).toBeTruthy();
    expect(queryByText('ok')).toBeNull();
    consoleSpy.mockRestore();
  });

  it('uses custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText, queryByText } = render(
      withRouter(
        <ErrorBoundary fallback={<span>custom</span>}>
          <Boom shouldThrow />
        </ErrorBoundary>,
      ),
    );

    expect(getByText('custom')).toBeTruthy();
    expect(queryByText('Algo deu errado')).toBeNull();
    consoleSpy.mockRestore();
  });
});
