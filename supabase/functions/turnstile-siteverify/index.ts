import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'missing_token' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const secret = Deno.env.get('TURNSTILE_SECRET');
    if (!secret) {
      console.error('[turnstile-siteverify] TURNSTILE_SECRET not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'server_misconfigured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
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
      return new Response(
        JSON.stringify({ success: false, error: 'siteverify_failed' }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const result = await response.json();

    const success = Boolean(result.success);
    const action = typeof result.action === 'string' ? result.action : null;
    const hostname =
      typeof result.hostname === 'string' ? result.hostname : null;

    return new Response(JSON.stringify({ success, action, hostname }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[turnstile-siteverify] exception', error);
    return new Response(
      JSON.stringify({ success: false, error: 'invalid_request' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
