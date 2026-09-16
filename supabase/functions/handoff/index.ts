import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ALLOWED_ORIGINS = [
  'https://jsempregos.com.br',
  'https://www.jsempregos.com.br',
  'http://localhost:3000',
  'http://localhost',
];

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status: number, req: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(req),
    },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405, req);
  }

  const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
  if (!webhookUrl) {
    console.error('[handoff] N8N_WEBHOOK_URL not configured');
    return json({ ok: false, error: 'server_misconfigured' }, 500, req);
  }

  try {
    const body = await req.json();

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        sentAt: new Date().toISOString(),
        source: 'website',
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }

    return json({ ok: true }, 200, req);
  } catch (error) {
    console.error('[handoff] exception', error);
    const err = error instanceof Error ? error.message : 'Unknown error';
    return json({ ok: false, error: err }, 500, req);
  }
});
