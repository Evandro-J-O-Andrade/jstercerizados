import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('@/utils/turnstile-config', () => ({
  getTurnstileSiteKey: vi.fn(),
  getTurnstileScriptUrl: vi.fn(
    () => 'https://challenges.cloudflare.com/turnstile/v0/api.js',
  ),
}));

import { getTurnstileSiteKey } from '@/utils/turnstile-config';
import { useTurnstileToken } from '@/hooks/useTurnstileToken';

const mockGetKey = vi.mocked(getTurnstileSiteKey);

describe('useTurnstileToken', () => {
  it('quando siteKey nao configurada, nao tenta renderizar e retorna token null', () => {
    mockGetKey.mockReturnValue(null);
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useTurnstileToken(ref, { enabled: true }),
    );
    expect(result.current.token).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('quando enabled=false, nao renderiza mesmo com siteKey', () => {
    mockGetKey.mockReturnValue('0xABC');
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useTurnstileToken(ref, { enabled: false }),
    );
    expect(result.current.token).toBeNull();
  });

  it('reset() nao quebra quando widget nao foi renderizado', () => {
    mockGetKey.mockReturnValue(null);
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useTurnstileToken(ref));
    expect(() => result.current.reset()).not.toThrow();
  });
});
