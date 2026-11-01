import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { normalizePermission } from '@/utils/rbac-normalize';

const { authState, fromMock } = vi.hoisted(() => ({
  authState: { current: null as null | Record<string, unknown> },
  fromMock: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState.current,
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: fromMock }),
}));

import { useGlobalDashboardStats } from './useGlobalDashboardStats';

describe('useGlobalDashboardStats permission filtering', () => {
  beforeEach(() => {
    fromMock.mockReset();
    fromMock.mockImplementation(() => ({
      select: vi.fn(() => Promise.resolve({ count: 3, error: null })),
    }));

    authState.current = {
      currentTenantId: null,
      isAdminMaster: true,
      permissions: [
        ['tenants', 'read'],
        ['companies', 'read'],
        ['people', 'read'],
        ['candidates', 'read'],
        ['jobs', 'read'],
        ['applications', 'read'],
        ['service_orders', 'read'],
        ['support_tickets', 'read'],
      ].map(([resource, action], index) =>
        normalizePermission({
          id: `permission-${index}`,
          resource,
          action,
        }),
      ),
    };
  });

  it('does not query domain events when the database did not grant domain_events.read', async () => {
    const { result } = renderHook(() => useGlobalDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(fromMock.mock.calls.map(([table]) => table)).not.toContain(
      'domain_events',
    );
    expect(result.current.recentEvents).toEqual([]);
  });
});
