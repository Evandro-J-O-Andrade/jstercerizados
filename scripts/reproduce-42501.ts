import { Client } from 'pg';
import fs from 'fs';

function loadEnvFile(path: string) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim();
      if (!process.env[key.trim()]) process.env[key.trim()] = value;
    }
  } catch {}
}
loadEnvFile('.env.local');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'evandro_j.o.a@hotmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '@An29070818';
const CANDIDATE_EMAIL = process.env.CANDIDATE_EMAIL || 'candidato.diag@test.local';
const CANDIDATE_PASSWORD = process.env.CANDIDATE_PASSWORD || 'Auditoria@2026';

const SUPABASE_URL = 'https://okxqfyoqbhcmflpurfrw.supabase.co';

async function signIn(email: string, password: string): Promise<string | null> {
  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.VITE_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) {
      console.log(`  Sign-in ${email}: ${resp.status} ${resp.statusText}`);
      return null;
    }
    const data = await resp.json();
    return data.access_token || null;
  } catch (e) {
    console.log(`  Sign-in ${email}: ERRO - ${(e as Error).message}`);
    return null;
  }
}

async function restCall(jwt: string, method: string, path: string): Promise<any> {
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'apikey': process.env.VITE_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    });
    const body = await resp.text();
    return { status: resp.status, ok: resp.ok, body };
  } catch (e) {
    return { status: 0, ok: false, body: (e as Error).message };
  }
}

async function rpcCall(jwt: string, fn: string, body: any = {}): Promise<any> {
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'apikey': process.env.VITE_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    return { status: resp.status, ok: resp.ok, body: text };
  } catch (e) {
    return { status: 0, ok: false, body: (e as Error).message };
  }
}

async function main() {
  console.log('=== F06 — REPRODUÇÃO 42501 COM JWT REAL ===\n');

  // 1. Sign-in como admin (Evandro)
  console.log('--- 1. Sign-in admin ---');
  const adminJwt = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
  if (!adminJwt) {
    console.log('  Falha no sign-in admin');
  } else {
    console.log('  Admin autenticado (JWT obtido)');

    // Test is_admin_master() via RPC
    const adminRpc = await rpcCall(adminJwt, 'is_admin_master', {});
    console.log(`  is_admin_master() via RPC: ${adminRpc.status} ${adminRpc.ok ? 'OK' : 'ERRO'} - ${adminRpc.body}`);

    // Test is_admin_master(auth_uid) via RPC
    const adminRpc2 = await rpcCall(adminJwt, 'is_admin_master', { auth_uid: 'a78ddef1-5659-404f-9c7c-940c5df0abf1' });
    console.log(`  is_admin_master(evandro_uid) via RPC: ${adminRpc2.status} ${adminRpc2.ok ? 'OK' : 'ERRO'} - ${adminRpc2.body}`);

    // Query tenant_memberships
    const tmRead = await restCall(adminJwt, 'GET', 'tenant_memberships?select=*&limit=5');
    console.log(`  tenant_memberships SELECT: ${tmRead.status} ${tmRead.ok ? 'OK' : 'ERRO'} - ${tmRead.body.substring(0, 200)}`);
  }

  // 2. Sign-in como candidato
  console.log('\n--- 2. Sign-in candidato ---');
  const candJwt = await signIn(CANDIDATE_EMAIL, CANDIDATE_PASSWORD);
  if (!candJwt) {
    console.log('  Falha no sign-in candidato');
  } else {
    console.log('  Candidato autenticado (JWT obtido)');

    // Test is_admin_master() via RPC (should return false, not 42501)
    const candRpc = await rpcCall(candJwt, 'is_admin_master', {});
    console.log(`  is_admin_master() via RPC: ${candRpc.status} ${candRpc.ok ? 'OK' : 'ERRO'} - ${candRpc.body}`);

    // Query tenant_memberships (should work if user has membership)
    const tmRead = await restCall(candJwt, 'GET', 'tenant_memberships?select=*&limit=5');
    console.log(`  tenant_memberships SELECT: ${tmRead.status} ${tmRead.ok ? 'OK' : 'ERRO'} - ${tmRead.body.substring(0, 200)}`);
  }

  // 3. Sign-in como anon (sem credenciais)
  console.log('\n--- 3. Tentativa sem autenticação (anon) ---');
  const anonRead = await restCall('', 'GET', 'tenant_memberships?select=*&limit=1');
  console.log(`  tenant_memberships SELECT (sem JWT): ${anonRead.status} ${anonRead.ok ? 'OK' : 'ERRO'} - ${anonRead.body.substring(0, 200)}`);
}

main().catch((err) => {
  console.error('❌ ERRO:', err.message);
  process.exit(1);
});
