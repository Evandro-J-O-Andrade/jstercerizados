import { describe, it, expect, vi } from 'vitest';
import React from 'react';
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
    availableModules: [],
    switchAccount: vi.fn(),
  }),
}));

vi.mock('@/repositories/navigation.repository', () => ({
  navigationRepository: {
    listAll: vi.fn().mockResolvedValue({ modules: [], globals: [] }),
  },
}));

vi.mock('@/components/layout/GlobalNavActions', () => ({
  GlobalNavActions: () => null,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <div {...(props as Record<string, unknown>)}>{children}</div>
    ),
    aside: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <aside {...(props as Record<string, unknown>)}>{children}</aside>
    ),
    span: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <span {...(props as Record<string, unknown>)}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

import { PortalSidebar } from '@/components/portal/PortalSidebar';

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <PortalSidebar isOpen onClose={vi.fn()} onNavigate={vi.fn()} />
    </MemoryRouter>,
  );
}

describe('PortalSidebar - retorno ao site público', () => {
  it.skip('renderiza botão "Voltar para o site" na base da sidebar', () => {
    renderSidebar();
    const button = screen.getByRole('button', { name: /Voltar para o site/i });
    expect(button).toBeInTheDocument();
  });

  it.skip('não renderiza a label antiga "Site público"', () => {
    renderSidebar();
    expect(screen.queryByText('Site público')).not.toBeInTheDocument();
  });
});
