import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: vi.fn(),
    permissions: [],
    roles: [],
    isAdminMaster: false,
  }),
}));

vi.mock('@/repositories/navigation.repository', () => ({
  navigationRepository: { listAll: vi.fn() },
}));

import { navigationRepository } from '@/repositories/navigation.repository';
import { GlobalNavActions } from '@/components/layout/GlobalNavActions';
import type {
  CandidatePortalModule,
  GlobalNavigationLink,
} from '@/types/navigation';

const mockListAll = vi.mocked(navigationRepository.listAll);

const globals: GlobalNavigationLink[] = [
  {
    id: 'g1',
    key: 'accessibility',
    label: 'Acessibilidade',
    href: '#a11y',
    icon: 'Accessibility',
    action: 'accessibility',
    permission_key: null,
    show_in_sidebar: true,
    show_in_bottom_nav: false,
    show_in_footer: true,
    sort_order: 40,
    is_active: true,
    target_audience: [],
  },
  {
    id: 'g2',
    key: 'support',
    label: 'Suporte',
    href: '/suporte',
    icon: 'LifeBuoy',
    action: 'link',
    permission_key: null,
    show_in_sidebar: true,
    show_in_bottom_nav: true,
    show_in_footer: true,
    sort_order: 20,
    is_active: true,
    target_audience: [],
  },
  {
    id: 'g3',
    key: 'help',
    label: 'Precisa de ajuda?',
    href: '/contato',
    icon: 'MessageCircle',
    action: 'chat',
    permission_key: null,
    show_in_sidebar: true,
    show_in_bottom_nav: false,
    show_in_footer: true,
    sort_order: 30,
    is_active: true,
    target_audience: [],
  },
];

function renderWith(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <GlobalNavActions />
    </MemoryRouter>,
  );
}

describe('GlobalNavActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListAll.mockResolvedValue({
      modules: [] as CandidatePortalModule[],
      globals,
    });
  });

  it('renderiza apenas itens globais (não renderiza módulos)', async () => {
    renderWith('/');
    await waitFor(() => {
      expect(screen.getByText('Acessibilidade')).toBeInTheDocument();
    });
    expect(screen.getByText('Suporte')).toBeInTheDocument();
    expect(screen.getByText('Precisa de ajuda?')).toBeInTheDocument();
  });

  it('botão de acessibilidade dispara CustomEvent app:open-accessibility', async () => {
    const handler = vi.fn();
    window.addEventListener('app:open-accessibility', handler);
    renderWith('/');
    await waitFor(() => {
      expect(screen.getByText('Acessibilidade')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Acessibilidade'));
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('app:open-accessibility', handler);
  });

  it('botão de chat dispara CustomEvent app:open-chat', async () => {
    const handler = vi.fn();
    window.addEventListener('app:open-chat', handler);
    renderWith('/');
    await waitFor(() => {
      expect(screen.getByText('Precisa de ajuda?')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Precisa de ajuda?'));
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('app:open-chat', handler);
  });
});
