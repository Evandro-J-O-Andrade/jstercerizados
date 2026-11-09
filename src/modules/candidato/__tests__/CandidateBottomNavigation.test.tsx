import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: mocks.useAuth }));

import { CandidatoBottomNavigation } from '@/modules/candidato/CandidatoContainer/CandidatoBottomNavigation';

describe('CandidatoBottomNavigation', () => {
  beforeEach(() => {
    mocks.useAuth.mockReturnValue({
      permissions: [
        { name: 'jobs.read' },
        { name: 'candidates.self.read' },
      ],
    });
  });

  it('compõe Home, Vagas, Perfil, Site e Mais com destinos distintos', () => {
    const onMore = vi.fn();
    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={[]} onMore={onMore} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/candidato');
    expect(screen.getByRole('link', { name: 'Vagas' })).toHaveAttribute('href', '/candidato/vagas');
    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/candidato/perfil');
    expect(screen.getByRole('link', { name: 'Site' })).toHaveAttribute('href', '/');

    const destinations = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(new Set(destinations).size).toBe(destinations.length);

    fireEvent.click(screen.getByRole('button', { name: /Mais/i }));
    expect(onMore).toHaveBeenCalledTimes(1);
  });

  it('não mostra Vagas nem Perfil sem as permissões correspondentes', () => {
    mocks.useAuth.mockReturnValue({ permissions: [] });
    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation items={[]} onMore={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Site' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Vagas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Perfil' })).not.toBeInTheDocument();
  });

  it('destaca somente a rota ativa do candidato', () => {
    render(
      <MemoryRouter initialEntries={['/candidato/perfil']}>
        <CandidatoBottomNavigation items={[]} onMore={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveClass('text-primary');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass('text-primary');
  });

  it('reaproveita o ícone configurado para a mesma rota sem mudar sua autorização', () => {
    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <CandidatoBottomNavigation
          onMore={vi.fn()}
          items={[
            {
              key: 'jobs',
              label: 'Oportunidades',
              href: '/candidato/vagas',
              icon: 'Search',
              permission_key: 'jobs.read',
              sort_order: 20,
              source: 'module',
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Vagas' }).querySelector('.lucide-search'),
    ).toBeInTheDocument();
  });
});
