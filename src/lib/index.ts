// Future: Supabase client, n8n webhook helpers, etc.
export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '+5511999999999',
  smtpHost: import.meta.env.VITE_SMTP_HOST ?? '',
  smtpPort: Number(import.meta.env.VITE_SMTP_PORT ?? 587),
  gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID ?? '',
} as const;

export { normalizeError, type NormalizedError } from './error-normalizer';
export { log, debug, info, warn, error, setLogLevel } from './logger';
