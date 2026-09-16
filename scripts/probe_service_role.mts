import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

function loadEnv() {
  const contents = readFileSync('.env.local', 'utf-8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;
console.log('URL:', url ? 'PRESENTE' : 'AUSENTE');
console.log('KEY:', key ? 'PRESENTE' : 'AUSENTE');
if (!url || !key) process.exit(1);

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  console.log('\n=== pg_proc: user_has_permission definition ===');
  const { data: proc1, error: err1 } = await supabase
    .from('pg_proc')
    .select('proname, prosrc')
    .eq('proname', 'user_has_permission')
    .limit(5);
  if (err1) {
    console.log('ERROR:', err1.message);
  } else {
    console.log('Rows:', (proc1 ?? []).length);
    (proc1 ?? []).forEach((p) => {
      const src = (p.prosrc ?? '').toString();
      const hasExpiresAt = /expires_at/i.test(src);
      console.log(`  proname=${p.proname}  has_expires_at=${hasExpiresAt}`);
      console.log(`  prosrc preview: ${src.substring(0, 300)}`);
    });
  }

  console.log('\n=== pg_proc: bootstrap_candidate_from_auth_user definition ===');
  const { data: proc2, error: err2 } = await supabase
    .from('pg_proc')
    .select('proname, prosrc')
    .eq('proname', 'bootstrap_candidate_from_auth_user')
    .limit(5);
  if (err2) {
    console.log('ERROR:', err2.message);
  } else {
    console.log('Rows:', (proc2 ?? []).length);
    (proc2 ?? []).forEach((p) => {
      const src = (p.prosrc ?? '').toString();
      const hasCandidate = /where r.name = 'candidate'/i.test(src);
      const hasCandidato = /where r.name = 'candidato'/i.test(src);
      const hasSignupOrigin = /signup_origin/i.test(src);
      console.log(`  proname=${p.proname}  has_candidate=${hasCandidate}  has_candidato=${hasCandidato}  has_signup_origin=${hasSignupOrigin}`);
    });
  }

  console.log('\n=== pg_proc: bootstrap_candidate_identity definition ===');
  const { data: proc3, error: err3 } = await supabase
    .from('pg_proc')
    .select('proname, proargnames, prosrc')
    .eq('proname', 'bootstrap_candidate_identity')
    .limit(5);
  if (err3) {
    console.log('ERROR:', err3.message);
  } else {
    console.log('Rows:', (proc3 ?? []).length);
    (proc3 ?? []).forEach((p) => {
      const src = (p.prosrc ?? '').toString();
      const hasSignupOrigin = /signup_origin/i.test(src);
      const hasMustChange = /must_change_password/i.test(src);
      console.log(`  proname=${p.proname}  args=${JSON.stringify(p.proargnames)}  has_signup_origin=${hasSignupOrigin}  has_must_change=${hasMustChange}`);
    });
  }

  console.log('\n=== information_schema: first_login_state columns ===');
  const { data: flsCols, error: flsErr } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, column_default, is_nullable')
    .eq('table_schema', 'public')
    .eq('table_name', 'first_login_state')
    .order('ordinal_position');
  if (flsErr) {
    console.log('ERROR:', flsErr.message);
  } else {
    console.log('Columns:', (flsCols ?? []).map((c) => `${c.column_name} (${c.data_type}, default=${c.column_default ?? 'none'}, nullable=${c.is_nullable})`).join('\n'));
  }

  console.log('\n=== pg_constraint: first_login_state constraints ===');
  const { data: flsCons, error: flsConsErr } = await supabase
    .from('pg_constraint')
    .select('conname, contype, consrc')
    .eq('conname', 'first_login_state_signup_origin_check')
    .limit(5);
  if (flsConsErr) {
    console.log('ERROR:', flsConsErr.message);
  } else {
    console.log('Constraints:', (flsCons ?? []).map((c) => `${c.conname} (type=${c.contype}) src=${c.consrc ?? 'none'}`).join('\n'));
  }

  console.log('\n=== information_schema: role_assignments columns ===');
  const { data: raCols, error: raErr } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_schema', 'public')
    .eq('table_name', 'role_assignments')
    .order('ordinal_position');
  if (raErr) {
    console.log('ERROR:', raErr.message);
  } else {
    console.log('Columns:', (raCols ?? []).map((c) => `${c.column_name} (${c.data_type})`).join(', '));
  }

  console.log('\n=== DONE ===');
})();