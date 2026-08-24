import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

const mockAuthGetSession = vi.fn<
  () => Promise<{
    data: { session: { user: { id: string } } | null };
    error: null;
  }>
>(() =>
  Promise.resolve({
    data: { session: null },
    error: null,
  }),
);

const mockAuthOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

const createChain = () => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
});

const mockFrom = vi.fn(() => createChain());

const mockSupabase = {
  auth: {
    getSession: mockAuthGetSession,
    onAuthStateChange: mockAuthOnAuthStateChange,
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
  from: mockFrom,
};

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => mockSupabase),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthGetSession.mockReturnValue(
    Promise.resolve({
      data: { session: null },
      error: null,
    }),
  );
  mockFrom.mockClear();
});

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function createPermission(name: string) {
  return {
    id: name,
    name,
    resource: name.split('.')[0],
    action: name.split('.')[1],
    description: null,
    created_at: new Date().toISOString(),
  };
}

describe('AUTH-HANDOFF: AuthContext post-login state machine', () => {
  it('starts in loading state without session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await act(async () => {
      await Promise.resolve();
    });
  });

  it('moves to authenticated dashboard when admin_master has session', async () => {
    const adminRole = {
      id: 'role-admin-master',
      name: 'admin_master',
      scope: 'system',
      description: 'Administrador global do sistema',
    };

    mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    });

    const mockPeopleChain = createChain();
    mockPeopleChain.maybeSingle.mockResolvedValue({
      data: {
        id: 'person-1',
        auth_user_id: 'user-1',
        full_name: 'Evandro',
        email: 'evandro@example.com',
        status: 'active',
      },
      error: null,
    });

    const mockMembershipChain = createChain();
    mockMembershipChain.order.mockResolvedValue({
      data: [
        { id: 'membership-1', tenant_id: 'tenant-1', person_id: 'person-1' },
      ],
      error: null,
    });

    const mockRoleAssignmentChain = createChain();
    mockRoleAssignmentChain.eq.mockResolvedValue({
      data: [{ id: 'ra-1', role_id: adminRole.id, person_id: 'person-1' }],
      error: null,
    });

    const mockRolesChain = createChain();
    mockRolesChain.in.mockResolvedValue({
      data: [adminRole],
      error: null,
    });

    const mockRolePermsChain = createChain();
    mockRolePermsChain.in.mockResolvedValue({
      data: [{ permission_id: 'perm-1' }],
      error: null,
    });

    const mockPermsChain = createChain();
    mockPermsChain.in.mockResolvedValue({
      data: [createPermission('jobs.read')],
      error: null,
    });

    mockFrom
      .mockReturnValueOnce(mockPeopleChain)
      .mockReturnValueOnce(mockMembershipChain)
      .mockReturnValueOnce(mockRoleAssignmentChain)
      .mockReturnValueOnce(mockRolesChain)
      .mockReturnValueOnce(mockRolePermsChain)
      .mockReturnValueOnce(mockPermsChain);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.person?.full_name).toBe('Evandro');
    expect(result.current.tenantMemberships).toHaveLength(1);
    expect(result.current.roles).toHaveLength(1);
    expect(result.current.isAdminMaster).toBe(true);
    expect(result.current.resolvePostLoginDestination()).toBe('/dashboard');
  });

  it('falls back to onboarding when authenticated but without RBAC data', async () => {
    mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-2' } } },
      error: null,
    });

    const mockPeopleChain = createChain();
    mockPeopleChain.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    mockFrom.mockReturnValueOnce(mockPeopleChain);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.person).toBeNull();
    expect(result.current.tenantMemberships).toHaveLength(0);
    expect(result.current.roles).toHaveLength(0);
    expect(result.current.permissions).toHaveLength(0);
    expect(result.current.resolvePostLoginDestination()).toBe('/onboarding');
  });
});
