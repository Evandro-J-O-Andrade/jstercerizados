export const RECOVERY_PATH = '/redefinir-senha';

export type RecoveryEnv = 'development' | 'production' | 'preview' | 'unknown';

export function detectEnvironment(): RecoveryEnv {
  const envFlag = import.meta.env.VITE_APP_ENV;
  if (envFlag === 'development') return 'development';
  if (envFlag === 'production') return 'production';
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.local')
    ) {
      return 'development';
    }
    if (
      host.endsWith('.vercel.app') ||
      host.endsWith('.netlify.app') ||
      host.endsWith('.preview')
    ) {
      return 'preview';
    }
  }
  return 'unknown';
}

export interface RecoveryUrlResolution {
  url: string;
  origin: string;
  env: RecoveryEnv;
  source: 'site-url' | 'app-url' | 'origin' | 'rejected';
}

function normalizeOrigin(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    return (
      u.hostname === 'localhost' ||
      u.hostname === '127.0.0.1' ||
      u.hostname === '::1' ||
      u.hostname.endsWith('.local')
    );
  } catch {
    return false;
  }
}

export function getRecoveryRedirectUrl(): RecoveryUrlResolution {
  const env = detectEnvironment();

  const siteUrlRaw = import.meta.env.VITE_SITE_URL || '';
  const appUrlRaw = import.meta.env.VITE_APP_URL || '';
  const windowOrigin =
    typeof window !== 'undefined' ? window.location.origin : '';

  const candidates: Array<{
    origin: string;
    source: RecoveryUrlResolution['source'];
  }> = [];

  if (siteUrlRaw) {
    const norm = normalizeOrigin(siteUrlRaw);
    if (norm) candidates.push({ origin: norm, source: 'site-url' });
  }
  if (appUrlRaw) {
    const norm = normalizeOrigin(appUrlRaw);
    if (norm) candidates.push({ origin: norm, source: 'app-url' });
  }
  if (windowOrigin) {
    const norm = normalizeOrigin(windowOrigin);
    if (norm) candidates.push({ origin: norm, source: 'origin' });
  }

  for (const c of candidates) {
    if (env === 'production') {
      if (c.origin.startsWith('https://') && !isLocalhostOrigin(c.origin)) {
        return {
          url: `${c.origin}${RECOVERY_PATH}`,
          origin: c.origin,
          env,
          source: c.source,
        };
      }
    } else {
      if (isLocalhostOrigin(c.origin) || c.origin.startsWith('https://')) {
        return {
          url: `${c.origin}${RECOVERY_PATH}`,
          origin: c.origin,
          env,
          source: c.source,
        };
      }
    }
  }

  if (import.meta.env.DEV) {
    console.warn(
      `[recovery] Nenhuma origin válida encontrada (env=${env}). Configure VITE_SITE_URL.`,
    );
  }

  return { url: '', origin: '', env, source: 'rejected' };
}

export function isRecoveryUrlSafe(resolution: RecoveryUrlResolution): boolean {
  if (resolution.source === 'rejected') return false;
  if (resolution.env === 'production' && isLocalhostOrigin(resolution.origin)) {
    return false;
  }
  return true;
}
