import { normalizeError } from './error-normalizer';
import { getSupabaseClient } from './supabase';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'developer';
  content: string;
}

interface ChatResponse {
  ok: boolean;
  reply?: string;
  error?: string;
}

export async function sendChatRequest(
  messages: Array<{ role: string; content: string }>,
): Promise<ChatResponse> {
  try {
    if (import.meta.env.DEV) {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages as ChatMessage[],
        }),
      });

      const data = (await response.json()) as ChatResponse;

      if (!response.ok) {
        const normalized = normalizeError({
          status: response.status,
          error: data.error,
        });
        return { ok: false, error: normalized.userMessage };
      }

      if (!data.reply) {
        return { ok: false, error: 'empty_reply' };
      }

      return { ok: true, reply: data.reply };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { ok: false, error: 'Supabase não configurado.' };
    }

    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        messages: messages as ChatMessage[],
      },
      method: 'POST',
    });

    if (error) {
      const normalized = normalizeError(error);
      return { ok: false, error: normalized.userMessage };
    }

    if (!data || typeof data !== 'object') {
      return { ok: false, error: 'Resposta inválida do servidor.' };
    }

    const responseData = data as ChatResponse;

    if (!responseData.ok) {
      return {
        ok: false,
        error: responseData.error ?? 'Erro na resposta do chat.',
      };
    }

    if (!responseData.reply) {
      return { ok: false, error: 'empty_reply' };
    }

    return { ok: true, reply: responseData.reply };
  } catch (error) {
    const normalized = normalizeError(error);
    return { ok: false, error: normalized.userMessage };
  }
}
