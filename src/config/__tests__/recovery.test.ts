import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  detectEnvironment,
  getRecoveryRedirectUrl,
  isRecoveryUrlSafe,
  RECOVERY_PATH,
} from '@/config/recovery';

const originalWindow = globalThis.window;
const originalEnv = { ...import.meta.env };

function setViteEnv(values: Record<string, string>) {
  for (const k of Object.keys(values)) {
    (import.meta.env as Record<string, string>)[k] = values[k];
  }
}

function clearViteEnv(keys: string[]) {
  for (const k of keys) {
    delete (import.meta.env as Record<string, string | undefined>)[k];
  }
}

function mockWindow(opts: { origin?: string; host?: string } = {}) {
  const host = opts.host ?? 'localhost:3000';
  const origin = opts.origin ?? `http://${host}`;
  (globalThis as unknown as { window: unknown }).window = {
    location: { host, origin, hostname: host.split(':')[0] },
  };
}

function restoreWindow() {
  (globalThis as unknown as { window: unknown }).window = originalWindow;
}

describe('detectEnvironment', () => {
  afterEach(() => {
    restoreWindow();
    clearViteEnv(['VITE_APP_ENV']);
  });

  it('returns development when VITE_APP_ENV=development', () => {
    setViteEnv({ VITE_APP_ENV: 'development' });
    expect(detectEnvironment()).toBe('development');
  });

  it('returns production when VITE_APP_ENV=production', () => {
    setViteEnv({ VITE_APP_ENV: 'production' });
    expect(detectEnvironment()).toBe('production');
  });

  it('returns development for localhost even without env flag', () => {
    mockWindow({ host: 'localhost:3000' });
    expect(detectEnvironment()).toBe('development');
  });

  it('returns preview for vercel.app', () => {
    mockWindow({ host: 'app-git-main.vercel.app' });
    expect(detectEnvironment()).toBe('preview');
  });

  it('returns unknown for unrelated production host', () => {
    mockWindow({ host: 'app.example.com' });
    expect(detectEnvironment()).toBe('unknown');
  });
});

describe('getRecoveryRedirectUrl', () => {
  beforeEach(() => {
    mockWindow();
  });
  afterEach(() => {
    restoreWindow();
    clearViteEnv(['VITE_SITE_URL', 'VITE_APP_URL', 'VITE_APP_ENV']);
  });

  it('uses VITE_SITE_URL in production (HTTPS)', () => {
    setViteEnv({
      VITE_SITE_URL: 'https://jsterceirizados.com.br',
      VITE_APP_ENV: 'production',
    });
    const r = getRecoveryRedirectUrl();
    expect(r.url).toBe(`https://jsterceirizados.com.br${RECOVERY_PATH}`);
    expect(r.env).toBe('production');
    expect(r.source).toBe('site-url');
    expect(isRecoveryUrlSafe(r)).toBe(true);
  });

  it('rejects localhost in production', () => {
    setViteEnv({
      VITE_SITE_URL: 'http://localhost:3000',
      VITE_APP_ENV: 'production',
    });
    const r = getRecoveryRedirectUrl();
    expect(r.url).toBe('');
    expect(isRecoveryUrlSafe(r)).toBe(false);
  });

  it('uses VITE_APP_URL in development when no VITE_SITE_URL', () => {
    setViteEnv({
      VITE_APP_URL: 'http://localhost:5173',
      VITE_APP_ENV: 'development',
    });
    const r = getRecoveryRedirectUrl();
    expect(r.url).toBe(`http://localhost:5173${RECOVERY_PATH}`);
    expect(r.env).toBe('development');
    expect(r.source).toBe('app-url');
  });

  it('falls back to window.location.origin in development', () => {
    mockWindow({ origin: 'http://localhost:4173', host: 'localhost:4173' });
    setViteEnv({ VITE_APP_ENV: 'development' });
    const r = getRecoveryRedirectUrl();
    expect(r.url).toBe(`http://localhost:4173${RECOVERY_PATH}`);
    expect(r.source).toBe('origin');
  });

  it('rejects when no candidates and no window (server-side)', () => {
    restoreWindow();
    (globalThis as unknown as { window: unknown }).window = undefined;
    setViteEnv({ VITE_APP_ENV: 'production' });
    const r = getRecoveryRedirectUrl();
    expect(r.url).toBe('');
    expect(isRecoveryUrlSafe(r)).toBe(false);
  });

  it('ignores invalid URL in VITE_SITE_URL', () => {
    setViteEnv({
      VITE_SITE_URL: 'not-a-url',
      VITE_APP_URL: 'http://localhost:3000',
      VITE_APP_ENV: 'development',
    });
    const r = getRecoveryRedirectUrl();
    expect(r.source).toBe('app-url');
    expect(r.url).toBe(`http://localhost:3000${RECOVERY_PATH}`);
  });
});

describe('isRecoveryUrlSafe', () => {
  it('rejects when source is rejected', () => {
    expect(
      isRecoveryUrlSafe({
        url: '',
        origin: '',
        env: 'production',
        source: 'rejected',
      }),
    ).toBe(false);
  });

  it('rejects localhost in production even if set', () => {
    expect(
      isRecoveryUrlSafe({
        url: 'http://localhost:3000/x',
        origin: 'http://localhost:3000',
        env: 'production',
        source: 'site-url',
      }),
    ).toBe(false);
  });

  it('accepts https in production', () => {
    expect(
      isRecoveryUrlSafe({
        url: 'https://app.com/x',
        origin: 'https://app.com',
        env: 'production',
        source: 'site-url',
      }),
    ).toBe(true);
  });

  it('accepts localhost in development', () => {
    expect(
      isRecoveryUrlSafe({
        url: 'http://localhost:3000/x',
        origin: 'http://localhost:3000',
        env: 'development',
        source: 'site-url',
      }),
    ).toBe(true);
  });
});
