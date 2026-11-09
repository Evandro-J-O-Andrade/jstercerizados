import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ useAccount: vi.fn(), useAuth: vi.fn() }));

vi.mock('@/contexts/AccountContext', () => ({ useAccount: mocks.useAccount }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: mocks.useAuth }));

import { PortalBottomNavigation } from './PortalBottomNavigation';

const centralModule = {
  id: 'central', title: 'Central 24H', icon: 'Radar', route: '/dashboard/global',
  requiredPermissions: ['tenants.read'],
};
const recruitmentModule = {
  id: 'recrutamento', title: 'Recrutamento', icon: 'BriefcaseBusiness',
  route: '/dashboard/recrutamento', requiredPermissions: ['recruitment.read'],
};
const supportModule = {
  id: 'suporte', title: 'Chamados', icon: 'Headset', route: '/dashboard/suporte',
  requiredPermissions: ['support_tickets.read'],
};

const tenantsModule = {
  id: 'tenants', title: 'Tenants', icon: 'Building2', route: '/dashboard/tenants',
  requiredPermissions: ['tenants.read'],
};

describe('PortalBottomNavigation', () => {
  beforeEach(() => {
    mocks.useAuth.mockReturnValue({
      resolvePostLoginDestination: vi.fn(() => '/dashboard/admin-master'),
    });
    mocks.useAccount.mockReturnValue({
      identity: { personId: 'person-1', isAdminMaster: true },
      activeTenantId: null,
      activePermissions: [
        { name: 'tenants.read' },
        { name: 'recruitment.read' },
      ],
      availableModules: [centralModule, recruitmentModule, supportModule],
    });
  });

  it('usa o destino canônico da sessão no primeiro botão Home', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/global']}>
        <PortalBottomNavigation onMore={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('link')[0]).toHaveAccessibleName('Home');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href', '/dashboard/admin-master',
    );
  });

  it('separa Home, CORE 24H e Tenants no Admin Master sem atalhos de candidatos ou suporte', () => {
    mocks.useAccount.mockReturnValue({
      identity: { personId: 'person-1', isAdminMaster: true },
      activeTenantId: null,
      activePermissions: [{ name: 'tenants.read' }],
      availableModules: [centralModule, tenantsModule, recruitmentModule, supportModule],
    });
    render(
      <MemoryRouter initialEntries={['/dashboard/global']}>
        <PortalBottomNavigation onMore={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /CORE 24H/i })).toHaveAttribute(
      'href', '/dashboard/global',
    );
    expect(screen.getByRole('link', { name: /Tenants/i })).toHaveAttribute(
      'href', '/dashboard/tenants',
    );
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'href', '/dashboard/global',
    );
    expect(screen.queryByRole('link', { name: /Recrutamento/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Chamados/i })).not.toBeInTheDocument();
  });

  it('oculta Tenants do Admin Master sem tenants.read', () => {
    mocks.useAccount.mockReturnValue({
      identity: { personId: 'person-1', isAdminMaster: true },
      activeTenantId: null,
      activePermissions: [],
      availableModules: [centralModule, tenantsModule],
    });
    render(
      <MemoryRouter initialEntries={['/dashboard/admin-master']}>
        <PortalBottomNavigation onMore={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link', { name: /Tenants/i })).not.toBeInTheDocument();
  });

  it('inclui Chamados quando a célula está disponível e autorizada', () => {
    mocks.useAccount.mockReturnValue({
      identity: { personId: 'person-1', isAdminMaster: false },
      activeTenantId: 'tenant-1',
      activePermissions: [{ name: 'support_tickets.read' }],
      availableModules: [supportModule],
    });
    mocks.useAuth.mockReturnValue({
      resolvePostLoginDestination: vi.fn(() => '/dashboard/admin-tenant'),
    });
    render(
      <MemoryRouter initialEntries={['/dashboard/suporte']}>
        <PortalBottomNavigation onMore={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /Chamados/i })).toHaveAttribute(
      'href', '/dashboard/suporte',
    );
  });

  it('oferece Minha Conta e abre a sidebar existente em Mais', () => {
    const onMore = vi.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard/global']}>
        <PortalBottomNavigation onMore={onMore} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /Conta/i })).toHaveAttribute(
      'href', '/minha-conta',
    );
    fireEvent.click(screen.getByRole('button', { name: /Mais/i }));
    expect(onMore).toHaveBeenCalledTimes(1);
  });

  it('não reutiliza links de outro tenant quando o contexto tenant é inválido', () => {
    mocks.useAccount.mockReturnValue({
      identity: { personId: 'person-1', isAdminMaster: false },
      activeTenantId: null,
      activePermissions: [{ name: 'recruitment.read' }],
      availableModules: [recruitmentModule],
    });
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard/recrutamento']}>
        <PortalBottomNavigation onMore={vi.fn()} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('recalcula os atalhos quando o tenant e as permissões mudam', () => {
    mocks.useAccount.mockReturnValue({
      identity: { personId: 'person-1', isAdminMaster: false },
      activeTenantId: 'tenant-1',
      activePermissions: [{ name: 'recruitment.read' }],
      availableModules: [recruitmentModule],
    });
    mocks.useAuth.mockReturnValue({
      resolvePostLoginDestination: vi.fn(() => '/dashboard/admin-tenant'),
    });

    const view = render(
      <MemoryRouter initialEntries={['/dashboard/admin-tenant']}>
        <PortalBottomNavigation onMore={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /Recrutamento/i })).toBeInTheDocument();

    mocks.useAccount.mockReturnValue({
      identity: { personId: 'person-1', isAdminMaster: false },
      activeTenantId: 'tenant-2',
      activePermissions: [{ name: 'support_tickets.read' }],
      availableModules: [supportModule],
    });
    view.rerender(
      <MemoryRouter initialEntries={['/dashboard/admin-tenant']}>
        <PortalBottomNavigation onMore={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link', { name: /Recrutamento/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Chamados/i })).toBeInTheDocument();
  });
});
