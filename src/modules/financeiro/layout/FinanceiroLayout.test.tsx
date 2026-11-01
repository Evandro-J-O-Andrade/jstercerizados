import { useState, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: mocks.useAuth }));
vi.mock('@/shell/ModuleLayout', () => ({
  ModuleLayout: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { FinanceiroLayout } from './FinanceiroLayout';

describe('FinanceiroLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render tenant-scoped pages until an organization is selected', () => {
    mocks.useAuth.mockReturnValue({ currentTenantId: null });

    render(
      <FinanceiroLayout>
        <div data-testid="tenant-page">Dados financeiros</div>
      </FinanceiroLayout>,
    );

    expect(screen.getByText('Selecione uma organização')).toBeInTheDocument();
    expect(screen.queryByTestId('tenant-page')).not.toBeInTheDocument();
  });

  it('remounts the tenant page after switching organizations', () => {
    function StatefulPage() {
      const [count, setCount] = useState(0);
      return (
        <button onClick={() => setCount((value) => value + 1)}>
          Contador: {count}
        </button>
      );
    }

    mocks.useAuth.mockReturnValue({ currentTenantId: 'tenant-1' });
    const view = render(
      <FinanceiroLayout>
        <StatefulPage />
      </FinanceiroLayout>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Contador: 0' }));
    expect(screen.getByRole('button', { name: 'Contador: 1' })).toBeVisible();

    mocks.useAuth.mockReturnValue({ currentTenantId: 'tenant-2' });
    view.rerender(
      <FinanceiroLayout>
        <StatefulPage />
      </FinanceiroLayout>,
    );

    expect(screen.getByRole('button', { name: 'Contador: 0' })).toBeVisible();
  });
});
