export function getTurnstileSiteKey(): string | null {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (!key || typeof key !== 'string' || key.trim() === '') return null;
  return key.trim();
}

export function isTurnstileEnabled(): boolean {
  return getTurnstileSiteKey() !== null;
}

export function getTurnstileScriptUrl(): string {
  return 'https://challenges.cloudflare.com/turnstile/v0/api.js';
}
