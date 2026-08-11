export const onRequestPost = async (
  req: Request,
  env: { N8N_WEBHOOK_URL: string },
) => {
  const n8nWebhook = env.N8N_WEBHOOK_URL;
  if (!n8nWebhook) {
    return new Response(
      JSON.stringify({ ok: false, error: 'N8N webhook not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    const response = await fetch(n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        sentAt: new Date().toISOString(),
        source: 'website',
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          ok: false,
          error: `n8n responded with ${response.status}`,
          detail: (data as { error?: string })?.error,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: err }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
