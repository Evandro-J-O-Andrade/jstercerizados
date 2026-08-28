import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import type { ReactNode } from 'react';

const mockAuthGetSession = vi.fn(() =>
  Promise.resolve({
    data: { session: null },
    error: null,
  }),
);

const mockAuthOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

const mockFrom = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
}));

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
});

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AUTH-01: AuthContext', () => {
  it('starts with loading state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await act(async () => {
      await Promise.resolve();
    });
  });

  it('provides resolvePostLoginDestination', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });
    expect(typeof result.current.resolvePostLoginDestination).toBe('function');
  });

  it('returns /onboarding when not authenticated and without tenant/role', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.resolvePostLoginDestination()).toBe('/onboarding');
  });

  it('exposes hasPermission helpers', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });
    expect(typeof result.current.hasPermission).toBe('function');
    expect(typeof result.current.hasAnyPermission).toBe('function');
    expect(typeof result.current.hasAllPermissions).toBe('function');
  });
});

describe('AUTH-02: AuthContext race condition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not call loadAuthData twice on consecutive SIGNED_IN events', async () => {
    const fromCalls: string[][] = [];
    const mockQuery = () => ({
      select: vi.fn(function (this: { _sel: string }, sel: string) {
        this._sel = sel;
        return this;
      }),
      eq: vi.fn(function (
        this: { _eq: [string, string] },
        col: string,
        val: string,
      ) {
        this._eq = [col, val];
        return this;
      }),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 'person-1',
          auth_user_id: 'user-1',
          full_name: 'Test User',
          email: 'test@example.com',
          status: 'active',
        },
        error: null,
      }),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const trackedFrom = vi.fn((table: string) => {
      fromCalls.push([table]);
      return mockQuery();
    });

    let capturedCallback: (
      event: string,
      session: { user?: { id: string } } | null,
    ) => void = () => {};

    const trackedOnAuthStateChange = vi.fn((callback: any) => {
      capturedCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });

    const trackedSupabase = {
      auth: {
        getSession: vi.fn(() =>
          Promise.resolve({ data: { session: null }, error: null }),
        ),
        onAuthStateChange: trackedOnAuthStateChange,
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
      from: trackedFrom,
    };

    vi.mocked(getSupabaseClient).mockReturnValue(trackedSupabase as any);

    renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(trackedOnAuthStateChange).toHaveBeenCalledTimes(1);

    const session = { user: { id: 'user-1' } };

    await act(async () => {
      capturedCallback('SIGNED_IN', session as any);
    });

    await act(async () => {
      capturedCallback('SIGNED_IN', session as any);
    });

    await act(async () => {
      await Promise.resolve();
    });

    const peopleCalls = fromCalls.filter((c) => c[0] === 'people').length;
    expect(peopleCalls).toBe(1);
  });
});
