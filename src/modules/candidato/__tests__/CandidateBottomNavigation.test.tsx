import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => null),
}));

import { useAuth } from '@/contexts/AuthContext';
import { CandidatoBottomNavigation } from '@/modules/candidato/CandidatoContainer/CandidatoBottomNavigation';
import type { NavigationItem } from '@/types/navigation';

const mockUseAuth = vi.mocked(useAuth);

const moduleItems: NavigationItem[] = [
  {
    key: 'home',
    label: 'Início',
    href: '/candidato',
    icon: 'Home',
    permission_key: null,
    sort_order: 10,
    source: 'module',
  },
  {
    key: 'jobs',
    label: 'Vagas',
    href: '/candidato/vagas',
    icon: 'Briefcase',
    permission_key: null,
    sort_order: 20,
    source: 'module',
  },
  {
    key: 'favorites',
    label: 'Favoritas',
    href: '/candidato/favoritas',
    icon: 'Heart',
    permission_key: null,
    sort_order: 30,
    source: 'module',
  },
];

const globalItems: NavigationItem[] = [
  {
    key: 'accessibility',
    label: 'Acessibilidade',
    href: '#accessibility',
    icon: 'Accessibility',
    permission_key: null,
    sort_order: 40,
    source: 'global',
    action: 'accessibility',
  },
  {
    key: 'support',
    label: 'Suporte',
    href: '#support',
    icon: 'LifeBuoy',
    permission_key: null,
    sort_order: 50,
    source: 'global',
    action: 'chat',
  },
  {
    key: 'logout',
    label: 'Sair',
    href: '#logout',
    icon: 'LogOut',
    permission_key: null,
    sort_order: 99,
    source: 'global',
    action: 'logout',
  },
];

describe('CandidatoBottomNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      person: { id: 'p1', full_name: 'Ana' } as never,
      permissions: [],
      roles: [] as never,
      isAdminMaster: false,
      isCandidate: true,
      logout: vi.fn(),
    } as never);
  });

  it('renders module items as navigation links', async () => {
    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={moduleItems} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Vagas')).toBeInTheDocument();
    expect(screen.getByText('Favoritas')).toBeInTheDocument();
  });

  it('highlights the active route with primary color', async () => {
    render(
      <MemoryRouter initialEntries={['/candidato/vagas']}>
        <CandidatoBottomNavigation items={moduleItems} />
      </MemoryRouter>,
    );

    const vagasLink = screen.getByText('Vagas').closest('a');
    expect(vagasLink).toHaveClass('text-primary');
  });

  it('does not highlight inactive routes', async () => {
    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={moduleItems} />
      </MemoryRouter>,
    );

    const vagasLink = screen.getByText('Vagas').closest('a');
    expect(vagasLink).not.toHaveClass('text-primary');
  });

  it('renders global items as buttons', async () => {
    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={globalItems} />
      </MemoryRouter>,
    );

    const accessibilityBtn = screen
      .getByText('Acessibilidade')
      .closest('button');
    expect(accessibilityBtn).toBeInTheDocument();

    const supportBtn = screen.getByText('Suporte').closest('button');
    expect(supportBtn).toBeInTheDocument();
  });

  it('dispatches app:open-accessibility CustomEvent when Acessibilidade is clicked', async () => {
    const eventSpy = vi.fn();
    window.addEventListener('app:open-accessibility', eventSpy);

    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={globalItems} />
      </MemoryRouter>,
    );

    const accessibilityBtn = screen
      .getByText('Acessibilidade')
      .closest('button');
    fireEvent.click(accessibilityBtn!);

    await waitFor(() => {
      expect(eventSpy).toHaveBeenCalledTimes(1);
    });

    window.removeEventListener('app:open-accessibility', eventSpy);
  });

  it('dispatches app:open-chat CustomEvent when Suporte (chat) is clicked', async () => {
    const eventSpy = vi.fn();
    window.addEventListener('app:open-chat', eventSpy);

    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={globalItems} />
      </MemoryRouter>,
    );

    const supportBtn = screen.getByText('Suporte').closest('button');
    fireEvent.click(supportBtn!);

    await waitFor(() => {
      expect(eventSpy).toHaveBeenCalledTimes(1);
    });

    window.removeEventListener('app:open-chat', eventSpy);
  });

  it('calls logout from useAuth when Sair is clicked', async () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      person: { id: 'p1', full_name: 'Ana' } as never,
      permissions: [],
      roles: [] as never,
      isAdminMaster: false,
      isCandidate: true,
      logout: mockLogout,
    } as never);

    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={globalItems} />
      </MemoryRouter>,
    );

    const logoutBtn = screen.getByText('Sair').closest('button');
    fireEvent.click(logoutBtn!);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('uses default items when items prop is empty', async () => {
    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Vagas')).toBeInTheDocument();
    expect(screen.getByText('Currículo')).toBeInTheDocument();
  });

  it('renders nothing when items prop is null', async () => {
    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={undefined} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Vagas')).toBeInTheDocument();
  });

  it('uses home item onClick to scroll to top', async () => {
    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={moduleItems} />
      </MemoryRouter>,
    );

    const homeLink = screen.getByText('Início').closest('a');
    fireEvent.click(homeLink!);

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });
  });
});


