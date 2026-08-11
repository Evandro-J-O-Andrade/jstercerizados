export async function sendToN8n(payload: Record<string, unknown>) {
  try {
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

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        (data as { error?: string })?.error ??
          `Server responded with ${response.status}`,
      );
    }

    return { ok: true };
  } catch (error) {
    console.error('Error sending to n8n:', error);
    return { ok: false, reason: 'network_error' as const };
  }
}
