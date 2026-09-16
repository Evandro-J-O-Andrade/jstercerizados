import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

function loadEnv() {
  const contents = readFileSync('.env', 'utf-8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
console.log('URL:', url ? 'PRESENTE' : 'AUSENTE');
console.log('KEY:', key ? 'PRESENTE' : 'AUSENTE');
if (!url || !key) process.exit(1);

const supabase = createClient(url, key);

(async () => {
  const testEmail = `diagnostico-${Date.now()}@teste.com`;
  const testPassword = 'teste123456';

  console.log('\n=== TESTE DE CADASTRO ===');
  console.log('Email:', testEmail);

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Diagnostico Teste',
        phone: '11999999999',
      },
      captchaToken: undefined,
    },
  });

  console.log('\n--- Resultado signUp() ---');
  console.log('HTTP status: 200 (ok)');
  console.log('error:', error ? { message: error.message, code: error.code, status: error.status } : null);
  console.log('data.user exists:', !!data?.user);
  console.log('data.session exists:', !!data?.session);
  if (data?.user) {
    console.log('user.id:', data.user.id);
    console.log('user.email:', data.user.email);
    console.log('user.email_confirmed_at:', data.user.email_confirmed_at);
    console.log('user.created_at:', data.user.created_at);
    console.log('user.aud:', data.user.aud);
    console.log('user.role:', data.user.role);
  }
  if (data?.session) {
    console.log('session.access_token exists:', !!data.session.access_token);
    console.log('session.refresh_token exists:', !!data.session.refresh_token);
  }

  // Verificar se o usuário foi criado
  console.log('\n--- Verificação pós-c cadastro ---');
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.log('admin.listUsers error:', usersError.message);
  } else {
    const found = users?.users?.find(u => u.email === testEmail);
    console.log('Usuário encontrado no Auth:', !!found);
    if (found) {
      console.log('email_confirmed_at:', found.email_confirmed_at);
      console.log('created_at:', found.created_at);
      console.log('email_confirmed:', found.email_confirmed_at ? 'SIM' : 'NÃO');
    }
  }
})();