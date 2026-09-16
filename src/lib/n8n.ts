import { normalizeError } from './error-normalizer';
import { getSupabaseClient } from './supabase';

export async function sendToN8n(payload: Record<string, unknown>) {
  try {
    if (import.meta.env.DEV) {
      const response = await fetch('/api/handoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          sentAt: new Date().toISOString(),
          source: 'website',
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const normalized = normalizeError({
          status: response.status,
          error: (data as { error?: string })?.error,
        });
        return { ok: false, reason: normalized.userMessage };
      }

      return { ok: true };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { ok: false, reason: 'Supabase não configurado.' };
    }

    const { error } = await supabase.functions.invoke('handoff', {
      body: {
        ...payload,
        sentAt: new Date().toISOString(),
        source: 'website',
      },
      method: 'POST',
    });

    if (error) {
      const normalized = normalizeError(error);
      return { ok: false, reason: normalized.userMessage };
    }

    return { ok: true };
  } catch (error) {
    const normalized = normalizeError(error);
    return { ok: false, reason: normalized.userMessage };
  }
}
