import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/AccountContext', () => ({
  AccountProvider: ({ children }: { children: React.ReactNode }) => children,
  useAccount: () => ({
    identity: { personId: 'person-1', isAdminMaster: true },
    activeTenantId: null,
    activePermissions: [{ name: 'tenants.read' }],
    availableModules: [],
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    resolvePostLoginDestination: () => '/dashboard/admin-master',
  }),
}));

vi.mock('@/contexts/ModuleContext', () => ({
  ModuleProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('./AdminSidebar', () => ({
  AdminSidebar: () => <aside data-testid="admin-sidebar" />,
}));

vi.mock('./AdminHeader', () => ({
  AdminHeader: () => <header data-testid="admin-header" />,
}));

import { AdminShell } from './AdminShell';

describe('AdminShell mobile navigation', () => {
  it('monta a barra inferior do sistema e reserva espaço para ela', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/global']}>
        <AdminShell>
          <p>Conteúdo administrativo</p>
        </AdminShell>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('navigation', { name: /Navegação inferior do sistema/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Conteúdo administrativo').closest('div')).toHaveClass(
      'pb-24',
    );
    expect(screen.getByText(/Sistema de Administração/i)).toBeInTheDocument();
  });
});
