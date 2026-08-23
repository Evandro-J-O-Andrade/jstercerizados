import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

function createPermission(name: string) {
  return {
    id: name,
    name,
    resource: name.split('.')[0],
    action: name.split('.')[1],
    description: null,
    created_at: '2026-08-23T00:00:00.000Z',
  };
}

function createMockSupabase() {
  const mockAuthGetSession = vi.fn(() =>
    Promise.resolve({
      data: { session: null },
      error: null,
    }),
  );

  const mockAuthOnAuthStateChange = vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  }));

  const chains: Record<string, any> = {};

  const mockFrom = vi.fn((table: string) => {
    return chains[table] || createDefaultChain();
  });

  function createDefaultChain() {
    const methods: Record<string, any> = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };

    const chain = new Proxy(methods, {
      get(target, prop) {
        if (typeof prop === 'string' && prop in target) {
          return target[prop];
        }
        return () => chain;
      },
    });

    return chain;
  }

  function setChain(table: string, chain: any) {
    chains[table] = chain;
  }

  function resetChains() {
    for (const key of Object.keys(chains)) {
      delete chains[key];
    }
  }

  return {
    auth: {
      getSession: mockAuthGetSession,
      onAuthStateChange: mockAuthOnAuthStateChange,
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: mockFrom,
    setChain,
    resetChains,
    mockAuthGetSession,
    mockAuthOnAuthStateChange,
  };
}

let mockSupabase = createMockSupabase();

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => mockSupabase),
}));

describe('AUTH-HANDOFF: AuthContext post-login state machine', () => {
  beforeEach(() => {
    mockSupabase = createMockSupabase();
    mockSupabase.resetChains();
  });

  function wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  function createPermissionLocal(name: string) {
    return createPermission(name);
  }

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

    mockSupabase.mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    } as any);

    const mockPeopleChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 'person-1',
          auth_user_id: 'user-1',
          full_name: 'Evandro',
          email: 'evandro@example.com',
          status: 'active',
        },
        error: null,
      }),
    };
    const mockMembershipChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 'membership-1', tenant_id: 'tenant-1', person_id: 'person-1' },
        ],
        error: null,
      }),
    };
    const mockRoleAssignmentChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ id: 'ra-1', role_id: adminRole.id, person_id: 'person-1' }],
        error: null,
      }),
    };
    const mockRolesChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [adminRole],
        error: null,
      }),
    };
    const mockRolePermsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ permission_id: 'perm-1' }],
        error: null,
      }),
    };
    const mockPermsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [createPermissionLocal('jobs.read')],
        error: null,
      }),
    };

    mockSupabase.setChain('people', mockPeopleChain);
    mockSupabase.setChain('tenant_memberships', mockMembershipChain);
    mockSupabase.setChain('role_assignments', mockRoleAssignmentChain);
    mockSupabase.setChain('roles', mockRolesChain);
    mockSupabase.setChain('role_permissions', mockRolePermsChain);
    mockSupabase.setChain('permissions', mockPermsChain);

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
    mockSupabase.mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-2' } } },
      error: null,
    });

    const mockPeopleChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    mockSupabase.setChain('people', mockPeopleChain);

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

  it('stays in loading state while RBAC data is being fetched', async () => {
    mockSupabase.mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-3' } } },
      error: null,
    });

    const mockPeopleChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                id: 'person-3',
                auth_user_id: 'user-3',
                full_name: 'Test',
                status: 'active',
              },
              error: null,
            });
          }, 500);
        });
      }),
    };
    const mockMembershipChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
    const mockRoleAssignmentChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
    const mockRolesChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabase.setChain('people', mockPeopleChain);
    mockSupabase.setChain('tenant_memberships', mockMembershipChain);
    mockSupabase.setChain('role_assignments', mockRoleAssignmentChain);
    mockSupabase.setChain('roles', mockRolesChain);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.permissions).toHaveLength(0);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 600));
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false), {
      timeout: 2000,
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.person?.full_name).toBe('Test');
  });

  it('does not treat empty permissions as forbidden during loading', async () => {
    mockSupabase.mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-4' } } },
      error: null,
    });

    const mockPeopleChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                id: 'person-4',
                auth_user_id: 'user-4',
                full_name: 'User 4',
                status: 'active',
              },
              error: null,
            });
          }, 200);
        });
      }),
    };
    const mockMembershipChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
    const mockRoleAssignmentChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
    const mockRolesChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabase.setChain('people', mockPeopleChain);
    mockSupabase.setChain('tenant_memberships', mockMembershipChain);
    mockSupabase.setChain('role_assignments', mockRoleAssignmentChain);
    mockSupabase.setChain('roles', mockRolesChain);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.permissions).toHaveLength(0);
    expect(result.current.roles).toHaveLength(0);

    const destination = result.current.resolvePostLoginDestination();
    expect(destination).toBe('/onboarding');

    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.resolvePostLoginDestination()).toBe('/onboarding');
  });

  it('redirects to dashboard when authenticated with membership and roles', async () => {
    const recruiterRole = {
      id: 'role-recruiter',
      name: 'recruiter',
      scope: 'tenant',
      description: 'Recrutador',
    };

    mockSupabase.mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-5' } } },
      error: null,
    });

    const mockPeopleChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 'person-5',
          auth_user_id: 'user-5',
          full_name: 'Recruiter',
          status: 'active',
        },
        error: null,
      }),
    };
    const mockMembershipChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 'membership-5', tenant_id: 'tenant-5', person_id: 'person-5' },
        ],
        error: null,
      }),
    };
    const mockRoleAssignmentChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { id: 'ra-5', role_id: recruiterRole.id, person_id: 'person-5' },
        ],
        error: null,
      }),
    };
    const mockRolesChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [recruiterRole],
        error: null,
      }),
    };
    const mockRolePermsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ permission_id: 'perm-jobs-read' }],
        error: null,
      }),
    };
    const mockPermsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [createPermissionLocal('jobs.read')],
        error: null,
      }),
    };

    mockSupabase.setChain('people', mockPeopleChain);
    mockSupabase.setChain('tenant_memberships', mockMembershipChain);
    mockSupabase.setChain('role_assignments', mockRoleAssignmentChain);
    mockSupabase.setChain('roles', mockRolesChain);
    mockSupabase.setChain('role_permissions', mockRolePermsChain);
    mockSupabase.setChain('permissions', mockPermsChain);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.person?.full_name).toBe('Recruiter');
    expect(result.current.tenantMemberships).toHaveLength(1);
    expect(result.current.roles).toHaveLength(1);
    expect(result.current.isAdminMaster).toBe(false);
    expect(result.current.resolvePostLoginDestination()).toBe('/dashboard');
  });

  it('falls back to onboarding when authenticated but without membership', async () => {
    const roleWithoutMembership = {
      id: 'role-orphan',
      name: 'candidate',
      scope: 'tenant',
      description: 'Candidato',
    };

    mockSupabase.mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-6' } } },
      error: null,
    });

    const mockPeopleChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 'person-6',
          auth_user_id: 'user-6',
          full_name: 'Orphan',
          status: 'active',
        },
        error: null,
      }),
    };
    const mockMembershipChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
    const mockRoleAssignmentChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'ra-6',
            role_id: roleWithoutMembership.id,
            person_id: 'person-6',
          },
        ],
        error: null,
      }),
    };
    const mockRolesChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [roleWithoutMembership],
        error: null,
      }),
    };
    const mockRolePermsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabase.setChain('people', mockPeopleChain);
    mockSupabase.setChain('tenant_memberships', mockMembershipChain);
    mockSupabase.setChain('role_assignments', mockRoleAssignmentChain);
    mockSupabase.setChain('roles', mockRolesChain);
    mockSupabase.setChain('role_permissions', mockRolePermsChain);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.person?.full_name).toBe('Orphan');
    expect(result.current.tenantMemberships).toHaveLength(0);
    expect(result.current.roles).toHaveLength(1);
    expect(result.current.resolvePostLoginDestination()).toBe('/onboarding');
  });

  it('returns true for hasAnyPermission when at least one permission matches', async () => {
    const recruiterRole = {
      id: 'role-recruiter',
      name: 'recruiter',
      scope: 'tenant',
      description: 'Recrutador',
    };
    const permissions = [
      createPermissionLocal('jobs.read'),
      createPermissionLocal('candidates.read'),
    ];

    mockSupabase.mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-7' } } },
      error: null,
    });

    const mockPeopleChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 'person-7',
          auth_user_id: 'user-7',
          full_name: 'Permission User',
          status: 'active',
        },
        error: null,
      }),
    };
    const mockMembershipChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 'membership-7', tenant_id: 'tenant-7', person_id: 'person-7' },
        ],
        error: null,
      }),
    };
    const mockRoleAssignmentChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { id: 'ra-7', role_id: recruiterRole.id, person_id: 'person-7' },
        ],
        error: null,
      }),
    };
    const mockRolesChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [recruiterRole],
        error: null,
      }),
    };
    const mockRolePermsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          { permission_id: 'perm-jobs-read' },
          { permission_id: 'perm-candidates-read' },
        ],
        error: null,
      }),
    };
    const mockPermsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: permissions,
        error: null,
      }),
    };

    mockSupabase.setChain('people', mockPeopleChain);
    mockSupabase.setChain('tenant_memberships', mockMembershipChain);
    mockSupabase.setChain('role_assignments', mockRoleAssignmentChain);
    mockSupabase.setChain('roles', mockRolesChain);
    mockSupabase.setChain('role_permissions', mockRolePermsChain);
    mockSupabase.setChain('permissions', mockPermsChain);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.permissions).toEqual(permissions);
    expect(result.current.hasAnyPermission(['jobs.read'])).toBe(true);
    expect(result.current.hasAnyPermission(['candidates.read'])).toBe(true);
    expect(result.current.hasAnyPermission(['companies.read'])).toBe(false);
    expect(
      result.current.hasAnyPermission(['jobs.read', 'companies.read']),
    ).toBe(true);
  });

  it('returns false for hasAnyPermission when no permissions match', async () => {
    const permissions = [createPermissionLocal('jobs.read')];

    mockSupabase.mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-8' } } },
      error: null,
    });

    const mockPeopleChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 'person-8',
          auth_user_id: 'user-8',
          full_name: 'Limited User',
          status: 'active',
        },
        error: null,
      }),
    };
    const mockMembershipChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 'membership-8', tenant_id: 'tenant-8', person_id: 'person-8' },
        ],
        error: null,
      }),
    };
    const mockRoleAssignmentChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ id: 'ra-8', role_id: 'role-limited', person_id: 'person-8' }],
        error: null,
      }),
    };
    const mockRolesChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'role-limited',
            name: 'limited',
            scope: 'tenant',
            description: 'Limitado',
          },
        ],
        error: null,
      }),
    };
    const mockRolePermsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ permission_id: 'perm-jobs-read' }],
        error: null,
      }),
    };
    const mockPermsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [createPermissionLocal('jobs.read')],
        error: null,
      }),
    };

    mockSupabase.setChain('people', mockPeopleChain);
    mockSupabase.setChain('tenant_memberships', mockMembershipChain);
    mockSupabase.setChain('role_assignments', mockRoleAssignmentChain);
    mockSupabase.setChain('roles', mockRolesChain);
    mockSupabase.setChain('role_permissions', mockRolePermsChain);
    mockSupabase.setChain('permissions', mockPermsChain);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.permissions).toEqual(permissions);
    expect(result.current.hasAnyPermission(['companies.read'])).toBe(false);
    expect(result.current.hasAnyPermission([])).toBe(false);
  });

  it('exposes safe handoff state without leaking secrets', async () => {
    mockSupabase.mockAuthGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-9' } } },
      error: null,
    });

    const mockPeopleChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 'person-9',
          auth_user_id: 'user-9',
          full_name: 'Safe User',
          status: 'active',
        },
        error: null,
      }),
    };
    const mockMembershipChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 'membership-9', tenant_id: 'tenant-9', person_id: 'person-9' },
        ],
        error: null,
      }),
    };
    const mockRoleAssignmentChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
    const mockRolesChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabase.setChain('people', mockPeopleChain);
    mockSupabase.setChain('tenant_memberships', mockMembershipChain);
    mockSupabase.setChain('role_assignments', mockRoleAssignmentChain);
    mockSupabase.setChain('roles', mockRolesChain);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    const context = result.current;
    expect(context.isAuthenticated).toBe(true);
    expect(context.isLoading).toBe(false);
    expect(context.person?.full_name).toBe('Safe User');
    expect(context.tenantMemberships).toHaveLength(1);
    expect(context.roles).toHaveLength(0);
    expect(context.permissions).toHaveLength(0);
    expect(context.authError).toBeNull();
    expect(context.resolvePostLoginDestination()).toBe('/dashboard');

    expect(context).not.toHaveProperty('password');
    expect(context).not.toHaveProperty('access_token');
    expect(context).not.toHaveProperty('refresh_token');
    expect(context).not.toHaveProperty('jwt');
    expect(context).not.toHaveProperty('cookie');
  });
});
