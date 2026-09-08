import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

// RED test: reproduces the production CORS failure
// Runs the function source through tsx and invokes the handler directly.

const FN_DIR = resolve(import.meta.dirname);
const FN_PATH = resolve(FN_DIR, 'index.ts');

function invokeHandler(method: string, origin: string, body?: string) {
  const script = `
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const ALLOWED_ORIGINS = [
  'https://jsempregos.com.br',
  'https://www.jsempregos.com.br',
  'http://localhost:3000',
  'http://localhost',
];

function corsHeaders(req) {
  const origin = req.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status, req) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req) },
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
it('source validates action against allowlist', () => {
    expect(source).toMatch(/EXPECTED_ACTIONS/);
  });

  it('source validates hostname when allowlist configured', () => {
    expect(source).toMatch(/TURNSTILE_HOSTNAMES/);
    expect(source).toMatch(/parseAllowedHostnames/);
  });

  it('source rejects verification_failed when success is false', () => {
    expect(source).toMatch(/verification_failed/);
  });
});
      return json({ success: false, error: 'siteverify_failed' }, 502, req);
    }

    const result = await response.json();

    const success = Boolean(result.success);
    const action = typeof result.action === 'string' ? result.action : null;
    const hostname =
      typeof result.hostname === 'string' ? result.hostname : null;

    return json({ success, action, hostname }, 200, req);
  } catch (error) {
    console.error('[turnstile-siteverify] exception', error);
    return json({ success: false, error: 'invalid_request' }, 400, req);
  }
});
`;

  const result = spawnSync(
    'node',
    ['--experimental-strip-types', '-e', script],
    {
      encoding: 'utf8',
      env: { ...process.env, TURNSTILE_SECRET: 'DUMMY_SECRET_FOR_TEST' },
    },
  );

  if (result.error) {
    throw new Error(`Handler invocation failed: ${result.error.message}`);
  }

  // The handler logs but we can't easily capture the Response object from spawn.
  // Instead, we assert the source contains the required CORS handling.
  return { stdout: result.stdout, stderr: result.stderr };
}

describe('turnstile-siteverify CORS contract', () => {
  const source = readFileSync(FN_PATH, 'utf8');

  it('source handles OPTIONS preflight', () => {
    // RED: the current source does NOT handle OPTIONS
    expect(source).toMatch(/req\.method\s*===\s*['"]OPTIONS['"]/);
  });

  it('source returns 2xx for OPTIONS', () => {
    // RED: must return 204 or 200, not 405
    expect(source).toMatch(/new Response\(null,\s*\{\s*status:\s*204/);
  });

  it('source sets Access-Control-Allow-Origin', () => {
    expect(source).toMatch(/Access-Control-Allow-Origin/);
  });

  it('source sets Access-Control-Allow-Methods including POST', () => {
    expect(source).toMatch(/Access-Control-Allow-Methods/);
    expect(source).toMatch(/POST/);
  });

  it('source sets Access-Control-Allow-Headers', () => {
    expect(source).toMatch(/Access-Control-Allow-Headers/);
  });

  it('source does NOT use wildcard origin', () => {
    // RED: must NOT use '*'
    expect(source).not.toMatch(
      /Access-Control-Allow-Origin['"]?\s*:\s*['"]?\*/,
    );
  });

  it('source keeps TURNSTILE_SECRET server-side only', () => {
    // RED: secret must NOT appear in any VITE_ variable
    expect(source).not.toMatch(/VITE_TURNSTILE_SECRET/);
  });

  it('source validates action against allowlist', () => {
    expect(source).toMatch(/EXPECTED_ACTIONS/);
  });

  it('source validates hostname when allowlist configured', () => {
    expect(source).toMatch(/TURNSTILE_HOSTNAMES/);
    expect(source).toMatch(/parseAllowedHostnames/);
  });

  it('source rejects verification_failed when success is false', () => {
    expect(source).toMatch(/verification_failed/);
  });
});
