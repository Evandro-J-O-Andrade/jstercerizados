import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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

const mockEnabled = vi.mocked(isTurnstileEnabled);
const mockKey = vi.mocked(getTurnstileSiteKey);
const mockHook = vi.mocked(useTurnstileToken);

describe('Turnstile', () => {
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
    mockEnabled.mockReturnValue(true);
    mockKey.mockReturnValue('0xCCCCCCC');
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
    mockEnabled.mockReturnValue(true);
    mockKey.mockReturnValue('0xCCCCCCC');
    mockHook.mockReturnValue({
      token: null,
      error: 'Falha ao verificar',
      loading: false,
      reset: vi.fn(),
    });
    render(<Turnstile />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao verificar');
  });
});
