import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useNavigation: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: mocks.useAuth }));
vi.mock('@/hooks/useNavigation', () => ({
  useNavigation: mocks.useNavigation,
}));

import { CandidatoContainer } from '@/modules/candidato/CandidatoContainer/CandidatoContainer';

const moduleItem = {
  key: 'jobs',
  label: 'Vagas',
  href: '/candidato/vagas',
  icon: 'Briefcase',
  permission_key: 'jobs.read',
  sort_order: 20,
  source: 'module' as const,
};

describe('CandidatoContainer navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      person: { id: 'person-1', full_name: 'Ana Silva' },
      logout: vi.fn(),
    });
    mocks.useNavigation.mockReturnValue({
      sidebarItems: [moduleItem],
      bottomNavItems: [moduleItem],
      loading: false,
    });
  });

  it('renders the database-backed candidate route in both navigation rails', () => {
    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoContainer>
          <span>Conteúdo</span>
        </CandidatoContainer>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('navigation', { name: 'Portal do Candidato' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Vagas' })).toHaveLength(2);
  });
});
