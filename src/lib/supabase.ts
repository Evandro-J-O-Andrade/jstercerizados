import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
let diagnosticLogged = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!diagnosticLogged) {
    console.log('[AUTH:DIAGNOSTIC] Supabase configuration', {
      hasSupabaseClient: false,
      hasUrl: Boolean(url),
      hasKey: Boolean(key),
      urlOrigin: url ? new URL(url).origin : null,
    });
    diagnosticLogged = true;
  }

  if (!url || !key) {
    console.error('[AUTH:DIAGNOSTIC] Supabase client NOT created', {
      hasUrl: Boolean(url),
      hasKey: Boolean(key),
    });
    return null;
  }

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  console.log('[AUTH:DIAGNOSTIC] Supabase client CREATED', {
    hasSupabaseClient: true,
    urlOrigin: new URL(url).origin,
  });

  return client;
}
