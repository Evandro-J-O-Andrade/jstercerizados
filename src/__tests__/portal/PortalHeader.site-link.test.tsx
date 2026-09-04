import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    person: { id: 'p1', full_name: 'Maria Souza', email: 'm@x.com' },
    roles: [{ id: 'r1', name: 'admin_master', scope: 'global' }],
    permissions: [],
    isAdminMaster: true,
    logout: vi.fn(),
  }),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: () => ({
    identity: {
      firstName: 'Maria',
      displayName: 'Maria Souza',
      email: 'm@x.com',
      personId: 'p1',
      roleName: 'admin_master',
      roleScope: 'platform',
      tenantName: '',
      contextLabel: 'Painel Administrativo',
      greeting: '',
      isAdminMaster: true,
    },
    activeRole: { id: 'r1', name: 'admin_master', scope: 'global' },
    activeTenantId: null,
    availableMemberships: [],
    switchAccount: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn(), setTheme: vi.fn() }),
}));

import { PortalHeader } from '@/components/portal/PortalHeader';

function renderHeader() {
  return render(
    <MemoryRouter>
      <PortalHeader onMenuClick={vi.fn()} moduleTitle="Visão geral" />
    </MemoryRouter>,
  );
}

describe('PortalHeader - retorno ao site público', () => {
  it('renderiza botão "Voltar para o site" para sair do portal', () => {
    renderHeader();
    const button = screen.getByRole('button', { name: /Voltar para o site/i });
    expect(button).toBeInTheDocument();
  });

  it('não renderiza a label antiga "Site público"', () => {
    renderHeader();
    expect(screen.queryByText('Site público')).not.toBeInTheDocument();
  });
});
