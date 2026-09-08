import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import type { RefObject } from 'react';

vi.mock('@/utils/turnstile-config', () => ({
  isTurnstileEnabled: vi.fn(),
  getTurnstileSiteKey: vi.fn(),
}));

vi.mock('@/hooks/useTurnstileToken', () => ({
  useTurnstileToken: vi.fn(),
}));

import {
  isTurnstileEnabled,
  getTurnstileSiteKey,
} from '@/utils/turnstile-config';
import { useTurnstileToken } from '@/hooks/useTurnstileToken';
import { Turnstile } from '@/components/auth/Turnstile';
import type { TurnstileHandle } from '@/components/auth/Turnstile';

const mockEnabled = vi.mocked(isTurnstileEnabled);
const mockKey = vi.mocked(getTurnstileSiteKey);
const mockHook = vi.mocked(useTurnstileToken);

const makeRef = <T,>(node: T): RefObject<T> => ({ current: node });

describe('Turnstile', () => {
  beforeEach(() => {
    mockEnabled.mockReturnValue(true);
    mockKey.mockReturnValue('0xCCCCCCC');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('modo dev: mostra aviso quando VITE_TURNSTILE_SITE_KEY nao configurada', () => {
    mockEnabled.mockReturnValue(false);
    mockKey.mockReturnValue(null);
    mockHook.mockReturnValue({
      token: null,
      error: null,
      loading: false,
      reset: vi.fn(),
    });
    render(<Turnstile />);
    expect(screen.getByText(/CAPTCHA desativado/i)).toBeInTheDocument();
  });

  it('modo managed: renderiza container com sitekey', () => {
    mockHook.mockReturnValue({
      token: 'mock-token',
      error: null,
      loading: false,
      reset: vi.fn(),
    });
    const { container } = render(<Turnstile />);
    const widget = container.querySelector('[data-turnstile-mode="managed"]');
    expect(widget).not.toBeNull();
    expect(widget?.getAttribute('data-turnstile-site-key')).toBe('0xCCCCCCC');
    expect(widget?.getAttribute('data-turnstile-has-token')).toBe('true');
  });

  it('modo managed: mostra erro quando hook retorna error', () => {
    mockHook.mockReturnValue({
      token: null,
      error: 'Falha ao verificar',
      loading: false,
      reset: vi.fn(),
    });
    render(<Turnstile />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao verificar');
  });

  it('chama onTokenChange com null quando token for resetado (ciclo de negacao)', () => {
    const onTokenChange = vi.fn();
    mockHook
      .mockReturnValueOnce({
        token: null,
        error: null,
        loading: false,
        reset: vi.fn(),
      })
      .mockReturnValueOnce({
        token: 'token-rejeitado',
        error: null,
        loading: false,
        reset: vi.fn(),
      })
      .mockReturnValueOnce({
        token: null,
        error: 'Verificacao de CAPTCHA invalida',
        loading: false,
        reset: vi.fn(),
      });

    const { rerender } = render(<Turnstile onTokenChange={onTokenChange} />);
    expect(onTokenChange).toHaveBeenNthCalledWith(1, null);

    rerender(<Turnstile onTokenChange={onTokenChange} />);
    expect(onTokenChange).toHaveBeenNthCalledWith(2, 'token-rejeitado');

    rerender(<Turnstile onTokenChange={onTokenChange} />);
    expect(onTokenChange).toHaveBeenNthCalledWith(3, null);
  });

  it('expose reset via ref para permitir reset sem re-render do pai', () => {
    const resetMock = vi.fn();
    mockHook.mockReturnValue({
      token: null,
      error: null,
      loading: false,
      reset: resetMock,
    });

    const ref = makeRef<TurnstileHandle>(null as never);
    render(<Turnstile ref={ref} />);
    act(() => {
      ref.current?.reset();
    });
    expect(resetMock).toHaveBeenCalledTimes(1);
  });
});
