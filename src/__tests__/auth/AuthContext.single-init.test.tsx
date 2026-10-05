import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

type QueryResult = { data: unknown; error: unknown };

const peopleQuery = vi.fn();
const getSession = vi.fn();
const signOut = vi.fn();
let authStateHandler: ((event: string, session: unknown) => void) | null = null;
const unsubscribe = vi.fn();

function thenable(value: QueryResult) {
  const promise: any = Promise.resolve(value);
  promise.select = vi.fn(() => promise);
  promise.eq = vi.fn(() => promise);
  promise.maybeSingle = vi.fn(() => Promise.resolve(value));
  promise.order = vi.fn(() => promise);
  promise.limit = vi.fn(() => promise);
  promise.in = vi.fn(() => promise);
  promise.then = promise.then.bind(promise);
  return promise;
}

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: (table: string) => {
      if (table === 'people') return peopleQuery();
      return thenable({ data: null, error: null });
    },
    auth: {
      getSession,
      signOut,
      onAuthStateChange: (cb: any) => {
        authStateHandler = cb;
        return { data: { subscription: { unsubscribe } } };
      },
    },
  }),
}));

import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

function Probe() {
  const { isLoading, person } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="person">{person?.id ?? 'none'}</span>
    </div>
  );
}

describe('AuthContext — inicialização única por sessão', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateHandler = null;
    peopleQuery.mockImplementation(() =>
      thenable({ data: { id: 'p1', full_name: 'Candidato' }, error: null }),
    );
    getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('não dispara loadAuthData concorrente quando SIGNED_IN chega durante a carga inicial', async () => {
    // A consulta de `people` precisa durar mais que os 50 ms que o handler
    // SIGNED_IN espera, senão a carga inicial termina antes do disparo e a
    // corrida não acontece.
    peopleQuery.mockImplementation(() => {
      const promise: any = thenable({
        data: { id: 'p1', full_name: 'Candidato' },
        error: null,
      });
      promise.maybeSingle = vi.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ data: { id: 'p1', full_name: 'Candidato' }, error: null }),
              150,
            ),
          ),
      );
      return promise;
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    // SIGNED_IN chega enquanto initAuth ainda está dentro de loadAuthData.
    await waitFor(() => expect(authStateHandler).not.toBeNull());
    authStateHandler?.('SIGNED_IN', { user: { id: 'u1' } });

    await waitFor(() => {
      expect(loadingText()).toBe('false');
    });
    expect(probePerson()).toBe('p1');
    expect(peopleQuery).toHaveBeenCalledTimes(1);
  });
});

function loadingText() {
  return document.querySelector('[data-testid="loading"]')?.textContent;
}

function probePerson() {
  return (
    document.querySelector('[data-testid="person"]')?.textContent ?? 'none'
  );
}