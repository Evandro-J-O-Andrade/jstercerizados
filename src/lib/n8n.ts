const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL ?? '';

export async function sendToN8n(payload: Record<string, unknown>) {
  if (!N8N_WEBHOOK_URL) {
    console.warn('VITE_N8N_WEBHOOK_URL is not configured');
    return { ok: false, reason: 'missing_url' as const };
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
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

    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }

    return { ok: true };
  } catch (error) {
    console.error('Error sending to n8n:', error);
    return { ok: false, reason: 'network_error' as const };
  }
}
