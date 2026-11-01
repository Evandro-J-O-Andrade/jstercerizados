import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockIdentityRef = {
  current: { displayName: 'Maria Souza', roleLabel: 'Administrador Master' },
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    person: { id: 'p1', full_name: 'Maria Souza', email: 'm@x.com' },
    roles: [],
    permissions: [],
    logout: vi.fn(),
    hasPermission: vi.fn(() => false),
    hasAnyPermission: vi.fn(() => false),
    hasAllPermissions: vi.fn(() => false),
  }),
}));
vi.mock('@/contexts/AccountContext', () => ({
  useAccount: () => ({
    get identity() {
      return mockIdentityRef.current;
    },
    get activeRole() {
      return { id: 'r1', name: 'admin_master', is_global: true };
    },
    get activeTenantId() {
      return 'tenant-1';
    },
    get availableMemberships() {
      return [];
    },
    get switchAccount() {
      return vi.fn();
    },
    get effectiveScopes() {
      return ['global', 'tenant'];
    },
    get permissions() {
      return [];
    },
  }),
}));
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ resolvedTheme: 'light', toggleTheme: vi.fn() }),
}));
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    aside: ({ children, ...props }: any) => (
      <aside {...props}>{children}</aside>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { AdminSidebar } from '@/shell/AdminSidebar';

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AdminSidebar isOpen onClose={vi.fn()} onNavigate={vi.fn()} />
    </MemoryRouter>,
  );
}

describe('AdminSidebar footer compacto', () => {
  beforeEach(() => {
    mockIdentityRef.current = {
      displayName: 'Maria Souza',
      roleLabel: 'Administrador Master',
    };
    vi.clearAllMocks();
  });
  it('exibe nome e papel', () => {
    renderSidebar();
    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
    expect(screen.getByText('Administrador Master')).toBeInTheDocument();
  });
  it('não exibe data/hora', () => {
    renderSidebar();
    expect(screen.queryByText(/•/)).not.toBeInTheDocument();
  });
  it('não exibe Voltar para o site', () => {
    renderSidebar();
    expect(screen.queryByText('Voltar para o site')).not.toBeInTheDocument();
  });
  it('não exibe tema', () => {
    renderSidebar();
    expect(screen.queryByText(/Tema (claro|escuro)/)).not.toBeInTheDocument();
  });
  it('recolhe para ícones e permite expandir novamente', async () => {
    const user = userEvent.setup();
    renderSidebar();

    expect(screen.getByRole('complementary')).toHaveClass('w-64');
    await user.click(screen.getByRole('button', { name: 'Recolher menu' }));
    expect(screen.getByRole('complementary')).toHaveClass('w-16');

    await user.click(screen.getByRole('button', { name: 'Expandir menu' }));
    expect(screen.getByRole('complementary')).toHaveClass('w-64');
  });
  it('encaminha os eventos de navegação e fechamento para a sidebar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onNavigate = vi.fn();

    render(
      <MemoryRouter>
        <AdminSidebar isOpen onClose={onClose} onNavigate={onNavigate} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Meu Usuário' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledOnce();
  });
});
