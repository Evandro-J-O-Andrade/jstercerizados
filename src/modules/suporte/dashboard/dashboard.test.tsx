import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  findTickets: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: mocks.useAuth }));
vi.mock('@/repositories/support.repository', () => ({
  supportRepository: { findTickets: mocks.findTickets },
}));

import { SuporteDashboardPage } from './index';

describe('SuporteDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({ currentTenantId: 'tenant-1' });
    mocks.findTickets.mockResolvedValue([
      {
        id: 'ticket-1',
        tenant_id: 'tenant-1',
        category_id: 'category-1',
        title: 'Conexão instável',
        description: 'Intermitência registrada na unidade.',
        status: 'open',
        priority: 'high',
        assignee_person_id: null,
        sla_due_at: '2024-05-27T10:00:00.000Z',
        created_at: '2024-05-27T08:00:00.000Z',
        updated_at: '2024-05-27T08:00:00.000Z',
      },
    ]);
  });

  it('shows ticket counts and recent tickets from the selected tenant', async () => {
    render(
      <MemoryRouter>
        <SuporteDashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Conexão instável')).toBeInTheDocument();
    expect(mocks.findTickets).toHaveBeenCalledWith('tenant-1');
    expect(screen.getByTestId('support-metric-open')).toHaveTextContent('1');
    expect(screen.getByTestId('support-metric-overdue')).toHaveTextContent('1');
    expect(screen.getByRole('link', { name: 'Ver todos' })).toHaveAttribute(
      'href',
      '/dashboard/suporte/tickets',
    );
  });
});
