import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: useAuthMock,
}));

import { AdminMasterSidebar } from './AdminMasterSidebar';

describe('AdminMasterSidebar permission filtering', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({
      isAdminMaster: true,
      permissions: [
        {
          id: 'permission-tenants-read',
          resource: 'tenants',
          action: 'read',
          description: null,
          created_at: '2026-11-01T00:00:00.000Z',
        },
      ],
    });
  });

  it('shows links matching database resource/action permissions', () => {
    render(
      <MemoryRouter>
        <AdminMasterSidebar />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Admin Master' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Central 24H' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tenants' })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Auditoria' }),
    ).not.toBeInTheDocument();
  });

  it('shows global security events only with the matching database grant', () => {
    useAuthMock.mockReturnValueOnce({
      isAdminMaster: true,
      permissions: [
        {
          id: 'permission-security-events-read',
          resource: 'security_events',
          action: 'read',
          description: null,
          created_at: '2026-11-01T00:00:00.000Z',
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminMasterSidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Segurança' })).toHaveAttribute(
      'href',
      '/dashboard/seguranca',
    );
  });
});
