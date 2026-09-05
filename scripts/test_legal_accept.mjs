import { config } from 'dotenv';
config({ path: '.env' });
import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const userClient = createClient(url, anon, { auth: { persistSession: false } });
const { data: signin, error: signinErr } = await userClient.auth.signInWithPassword({
  email: 'candidato.diag@test.local',
  password: 'Auditoria@2026',
});
console.log('signin:', signin?.user?.id, 'err:', signinErr?.message);
if (signinErr || !signin?.session) process.exit(1);

const { data: people } = await admin.from('people').select('id').eq('auth_user_id', signin.user.id);
console.log('person:', people);
const tenantId = 'd480af07-ab6b-4561-ac3a-2a0b0c1267b5';

const { data, error } = await userClient.from('legal_acceptances').insert({
  person_id: people[0].id,
  tenant_id: tenantId,
  document_type: 'terms',
  document_version: 'v1.0',
  ip: null,
  user_agent: 'test',
  metadata: {},
}).select().single();
console.log('insert:', data, 'err:', error);

const { error: updateErr } = await userClient.from('first_login_state').update({
  terms_version: 'v1.0',
  updated_at: new Date().toISOString(),
}).eq('person_id', people[0].id);
console.log('update err:', updateErr);
