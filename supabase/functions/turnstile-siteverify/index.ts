import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const ALLOWED_ORIGINS = [
  'https://jsempregos.com.br',
  'https://www.jsempregos.com.br',
  'http://localhost:3000',
  'http://localhost',
];

const EXPECTED_ACTIONS = [
  'login',
  'signup',
  'cadastro',
  'contato',
  'candidatura',
];

function parseAllowedHostnames(): string[] {
  const raw = Deno.env.get('TURNSTILE_HOSTNAMES');
  if (!raw) return [];
  return raw
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

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
    return json({ error: 'Method not allowed' }, 405, req);
  }

  try {
    const body = await req.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return json({ success: false, error: 'missing_token' }, 400, req);
    }

    const secret = Deno.env.get('TURNSTILE_SECRET');
    if (!secret) {
      console.error('[turnstile-siteverify] TURNSTILE_SECRET not configured');
      return json({ success: false, error: 'server_misconfigured' }, 500, req);
    }

    const form = new FormData();
    form.append('secret', secret);
    form.append('response', token);
    form.append('remoteip', req.headers.get('x-forwarded-for') ?? '');

    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      console.error('[turnstile-siteverify] siteverify failed', {
        status: response.status,
      });
      return json({ success: false, error: 'siteverify_failed' }, 502, req);
    }

    const result = await response.json();

    const success = Boolean(result.success);
    const action = typeof result.action === 'string' ? result.action : null;
    const hostname =
      typeof result.hostname === 'string' ? result.hostname : null;

    if (!success) {
      return json({ success: false, error: 'verification_failed' }, 400, req);
    }

    if (action && !EXPECTED_ACTIONS.includes(action)) {
      console.warn('[turnstile-siteverify] unexpected action', { action });
      return json({ success: false, error: 'verification_failed' }, 400, req);
    }

    const allowedHostnames = parseAllowedHostnames();
    if (allowedHostnames.length > 0 && hostname) {
      if (!allowedHostnames.includes(hostname.toLowerCase())) {
        console.warn('[turnstile-siteverify] unexpected hostname', {
          hostname,
        });
        return json({ success: false, error: 'verification_failed' }, 400, req);
      }
    }

    return json({ success: true, action, hostname }, 200, req);
  } catch (error) {
    console.error('[turnstile-siteverify] exception', error);
    return json({ success: false, error: 'invalid_request' }, 400, req);
  }
});
