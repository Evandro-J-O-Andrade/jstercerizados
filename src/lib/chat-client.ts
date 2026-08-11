interface ChatResponse {
  ok: boolean;
  reply?: string;
  error?: string;
}

export async function sendChatRequest(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  page = window.location.pathname,
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.slice(-20), page }),
    });

    const data = (await response.json().catch(() => null)) as ChatResponse | null;
    if (!response.ok || !data) {
      console.error('Chat API error:', response.status, data?.error);
      return { ok: false, error: data?.error ?? 'api_error' };
    }

    return data.reply ? { ok: true, reply: data.reply } : { ok: false, error: 'empty_reply' };
  } catch (error) {
    console.error('Error sending chat request:', error);
    return { ok: false, error: 'network_error' };
  }
}
