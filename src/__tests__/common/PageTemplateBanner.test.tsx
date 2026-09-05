import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/repositories/page-template.repository', () => ({
  pageTemplateRepository: {
    resolve: vi.fn(),
  },
}));

import { useAuth } from '@/contexts/AuthContext';
import { pageTemplateRepository } from '@/repositories/page-template.repository';
import { PageTemplateBanner } from '@/components/common/PageTemplateBanner';

const mockUseAuth = vi.mocked(useAuth);
const mockResolve = vi.mocked(pageTemplateRepository.resolve);

describe('PageTemplateBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra estado de loading inicialmente', () => {
    mockUseAuth.mockReturnValue({
      person: null,
      currentTenantId: null,
      isAdminMaster: false,
    } as never);
    mockResolve.mockReturnValue(new Promise(() => {}));
    render(<PageTemplateBanner templateKey="sobre_greeting" />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('renderiza template resolvido quando encontrado', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1' } as never,
      currentTenantId: 't1',
      isAdminMaster: false,
    } as never);
    mockResolve.mockResolvedValue({
      found: true,
      key: 'sobre_greeting',
      title: 'Saudacao',
      raw: 'Ola %person.full_name%!',
      resolved: 'Ola Joao Silva!',
      vars: { person: { full_name: 'Joao Silva' } },
      missing: [],
    });

    render(<PageTemplateBanner templateKey="sobre_greeting" />);

    await waitFor(() => {
      expect(screen.getByText('Ola Joao Silva!')).toBeInTheDocument();
    });
    const el = screen.getByText('Ola Joao Silva!');
    expect(el.getAttribute('data-template-key')).toBe('sobre_greeting');
    expect(el.getAttribute('data-missing')).toBe('');
  });

  it('renderiza fallback quando template nao encontrado', async () => {
    mockUseAuth.mockReturnValue({
      person: null,
      currentTenantId: null,
      isAdminMaster: false,
    } as never);
    mockResolve.mockResolvedValue({
      found: false,
      key: 'nao_existe',
      raw: null,
      resolved: null,
      vars: {},
      missing: [],
    });

    render(
      <PageTemplateBanner
        templateKey="nao_existe"
        fallback="Saudacao padrao"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Saudacao padrao')).toBeInTheDocument();
    });
    expect(
      screen
        .getByText('Saudacao padrao')
        .getAttribute('data-template-fallback'),
    ).toBe('true');
  });

  it('nao renderiza nada quando nao encontrado e sem fallback', async () => {
    mockUseAuth.mockReturnValue({
      person: null,
      currentTenantId: null,
      isAdminMaster: false,
    } as never);
    mockResolve.mockResolvedValue({
      found: false,
      key: 'nao_existe',
      raw: null,
      resolved: null,
      vars: {},
      missing: [],
    });

    const { container } = render(
      <PageTemplateBanner templateKey="nao_existe" />,
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('marca tokens faltantes no data-missing', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1' } as never,
      currentTenantId: null,
      isAdminMaster: false,
    } as never);
    mockResolve.mockResolvedValue({
      found: true,
      key: 'sobre_greeting',
      raw: 'Ola %person.full_name% - %tenant.name%',
      resolved: 'Ola Joao - ',
      vars: { person: { full_name: 'Joao' } },
      missing: ['tenant.name'],
    });

    render(<PageTemplateBanner templateKey="sobre_greeting" />);

    await waitFor(() => {
      expect(screen.getByText(/Ola Joao -/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Ola Joao -/).getAttribute('data-missing')).toBe(
      'tenant.name',
    );
  });
});
