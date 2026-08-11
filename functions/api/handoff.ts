interface HandoffRequest {
  conversationId?: string;
  intent?: string;
  page?: string;
  messages?: Array<{ role: string; content: string }>;
  visitor?: { name?: string; phone?: string; email?: string };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export const onRequestPost = async (
  req: Request,
  env: { N8N_WEBHOOK_URL?: string },
) => {
  try {
    const body = (await req.json()) as HandoffRequest;
    const payload = {
      type: 'human_handoff',
      source: 'website_chat',
      conversationId: body.conversationId ?? null,
      intent: body.intent ?? 'human_support',
      page: body.page ?? '/',
      visitor: body.visitor ?? {},
      messages: Array.isArray(body.messages) ? body.messages.slice(-30) : [],
      createdAt: new Date().toISOString(),
    };

    if (!env.N8N_WEBHOOK_URL) {
      return json({ ok: true, queued: false });
    }

    const response = await fetch(env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('n8n handoff failed:', response.status);
      return json({ ok: true, queued: false });
    }

    return json({ ok: true, queued: true });
  } catch (error) {
    console.error('Handoff error:', error);
    return json({ ok: true, queued: false });
  }
};
