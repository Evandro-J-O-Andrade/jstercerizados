import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

vi.mock('@/utils/turnstile-config', () => ({
  isTurnstileEnabled: vi.fn(),
  getTurnstileSiteKey: vi.fn(),
  getTurnstileScriptUrl: vi.fn(
    () => 'https://challenges.cloudflare.com/turnstile/v0/api.js',
  ),
}));

import { isTurnstileEnabled } from '@/utils/turnstile-config';

const mockIsTurnstileEnabled = vi.mocked(isTurnstileEnabled);

const mockAuthGetSession = vi.fn(() =>
  Promise.resolve({
    data: { session: null },
    error: null,
  }),
);

const mockAuthOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

const mockQuery = () => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  order: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
});

const mockFrom = vi.fn(() => mockQuery());

const mockSupabase = {
  auth: {
    getSession: mockAuthGetSession,
    onAuthStateChange: mockAuthOnAuthStateChange,
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
  },
  from: mockFrom,
};

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => mockSupabase),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AUTH-03: Turnstile bypass prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthGetSession.mockReturnValue(
      Promise.resolve({
        data: { session: null },
        error: null,
      }),
    );
    mockIsTurnstileEnabled.mockReturnValue(true);
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Signup failed' },
    });
  });

  it('bloqueia login quando Turnstile habilitado e token ausente', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.login('user@example.com', 'password123');
    });

    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('bloqueia cadastro quando Turnstile habilitado e token ausente', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.register('user@example.com', 'password123', {
        full_name: 'Test User',
        email: 'user@example.com',
      });
    });

    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('permite login quando Turnstile desabilitado e token ausente', async () => {
    mockIsTurnstileEnabled.mockReturnValue(false);
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.login('user@example.com', 'password123');
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledTimes(1);
  });

  it('permite cadastro quando Turnstile desabilitado e token ausente', async () => {
    mockIsTurnstileEnabled.mockReturnValue(false);
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Signup failed' },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.register('user@example.com', 'password123', {
        full_name: 'Test User',
        email: 'user@example.com',
      });
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledTimes(1);
  });
});
