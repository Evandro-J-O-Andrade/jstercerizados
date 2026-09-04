import { describe, it, expect, beforeEach, vi } from 'vitest';

const ORIGINAL_ENV = import.meta.env;

describe('turnstile-config', () => {
  beforeEach(() => {
    Object.assign(import.meta.env, ORIGINAL_ENV);
  });

  it('getTurnstileSiteKey retorna null quando env nao definida', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
    const { getTurnstileSiteKey } = await import('@/utils/turnstile-config');
    expect(getTurnstileSiteKey()).toBeNull();
  });

  it('getTurnstileSiteKey retorna null quando env e whitespace', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '   ');
    const { getTurnstileSiteKey } = await import('@/utils/turnstile-config');
    expect(getTurnstileSiteKey()).toBeNull();
  });

  it('getTurnstileSiteKey retorna a chave quando definida', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '0xAAAAAAA');
    const { getTurnstileSiteKey } = await import('@/utils/turnstile-config');
    expect(getTurnstileSiteKey()).toBe('0xAAAAAAA');
  });

  it('isTurnstileEnabled reflete o env', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
    const { isTurnstileEnabled } = await import('@/utils/turnstile-config');
    expect(isTurnstileEnabled()).toBe(false);

    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '0xBBBBBBB');
    const reloaded = await import('@/utils/turnstile-config?reload');
    expect(reloaded.isTurnstileEnabled()).toBe(true);
  });

  it('getTurnstileScriptUrl retorna a URL oficial do Turnstile', async () => {
    const { getTurnstileScriptUrl } = await import('@/utils/turnstile-config');
    expect(getTurnstileScriptUrl()).toBe(
      'https://challenges.cloudflare.com/turnstile/v0/api.js',
    );
  });
});
