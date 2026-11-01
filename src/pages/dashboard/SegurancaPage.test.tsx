import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const { authState, findAllGlobalMock, findAllMock, fromMock } = vi.hoisted(
  () => ({
    authState: { current: null as null | Record<string, unknown> },
    findAllGlobalMock: vi.fn(),
    findAllMock: vi.fn(),
    fromMock: vi.fn(),
  }),
);

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState.current,
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: fromMock }),
}));

vi.mock('@/repositories/security.repository', () => ({
  securityEventRepository: {
    findAll: findAllMock,
    findAllGlobal: findAllGlobalMock,
  },
}));

vi.mock('@/components/legacy/portal/ModuleWorkspace', () => ({
  ModuleWorkspace: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));

import SegurancaPage from './SegurancaPage';

describe('SegurancaPage global context', () => {
  beforeEach(() => {
    const rolesQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ id: 'role-1', name: 'admin_master', scope: 'global' }],
        error: null,
      }),
    };

    authState.current = {
      currentTenantId: null,
      isAdminMaster: true,
      permissions: [
        { resource: 'roles', action: 'read' },
        { resource: 'security_events', action: 'read' },
      ],
    };
    fromMock.mockReset().mockReturnValue(rolesQuery);
    findAllMock.mockReset();
    findAllGlobalMock.mockReset().mockResolvedValue([
      {
        id: 'event-1',
        event_type: 'login',
        tenant_id: 'tenant-1',
        person_id: 'person-1',
        ip: '192.0.2.1',
        user_agent: null,
        metadata: {},
        created_at: '2026-11-01T00:00:00.000Z',
      },
    ]);
  });

  it('loads global security events without requiring a selected tenant', async () => {
    render(<SegurancaPage />);

    await waitFor(() => {
      expect(findAllGlobalMock).toHaveBeenCalledOnce();
    });

    expect(findAllMock).not.toHaveBeenCalled();
    expect(await screen.findByText('login')).toBeInTheDocument();
  });

  it('does not query or display security events without the database grant', async () => {
    authState.current = {
      currentTenantId: null,
      isAdminMaster: true,
      permissions: [{ resource: 'roles', action: 'read' }],
    };

    render(<SegurancaPage />);

    await waitFor(() => {
      expect(screen.queryByText('Carregando dados de segurança...')).toBeNull();
    });

    expect(findAllGlobalMock).not.toHaveBeenCalled();
    expect(screen.queryByText('Eventos de segurança')).not.toBeInTheDocument();
  });

  it('uses the explicitly selected tenant instead of a global fallback', async () => {
    authState.current = {
      currentTenantId: 'tenant-1',
      isAdminMaster: true,
      permissions: [
        { resource: 'roles', action: 'read' },
        { resource: 'security_events', action: 'read' },
      ],
    };
    findAllMock.mockResolvedValue([]);

    render(<SegurancaPage />);

    await waitFor(() => {
      expect(findAllMock).toHaveBeenCalledWith('tenant-1');
    });

    expect(findAllGlobalMock).not.toHaveBeenCalled();
  });
});
