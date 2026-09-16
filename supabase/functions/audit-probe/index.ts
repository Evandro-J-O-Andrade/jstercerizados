import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export default async function handler(req: Request) {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const result: Record<string, unknown> = {};

  // 1. user_has_permission definition
  const { data: uhp, error: uhpErr } = await supabase
    .from('pg_proc')
    .select('proname, prosrc')
    .eq('proname', 'user_has_permission')
    .limit(5);
  result.user_has_permission = {
    rows: uhp ?? [],
    error: uhpErr?.message ?? null,
    has_expires_at: (uhp ?? []).some((p: any) =>
      /expires_at/i.test(p.prosrc ?? ''),
    ),
  };

  // 2. bootstrap_candidate_from_auth_user definition
  const { data: bcfa, error: bcfaErr } = await supabase
    .from('pg_proc')
    .select('proname, prosrc')
    .eq('proname', 'bootstrap_candidate_from_auth_user')
    .limit(5);
  result.bootstrap_candidate_from_auth_user = {
    rows: bcfa ?? [],
    error: bcfaErr?.message ?? null,
    has_candidate: (bcfa ?? []).some((p: any) =>
      /where r.name = 'candidate'/i.test(p.prosrc ?? ''),
    ),
    has_candidato: (bcfa ?? []).some((p: any) =>
      /where r.name = 'candidato'/i.test(p.prosrc ?? ''),
    ),
    has_signup_origin: (bcfa ?? []).some((p: any) =>
      /signup_origin/i.test(p.prosrc ?? ''),
    ),
  };

  // 3. bootstrap_candidate_identity definition
  const { data: bci, error: bciErr } = await supabase
    .from('pg_proc')
    .select('proname, proargnames, prosrc')
    .eq('proname', 'bootstrap_candidate_identity')
    .limit(5);
  result.bootstrap_candidate_identity = {
    rows: bci ?? [],
    error: bciErr?.message ?? null,
    signatures: (bci ?? []).map((p: any) => ({
      args: p.proargnames,
      has_signup_origin: /signup_origin/i.test(p.prosrc ?? ''),
      has_must_change: /must_change_password/i.test(p.prosrc ?? ''),
    })),
  };

  // 4. first_login_state columns
  const { data: flsCols, error: flsErr } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, column_default, is_nullable')
    .eq('table_schema', 'public')
    .eq('table_name', 'first_login_state')
    .order('ordinal_position');
  result.first_login_state_columns = {
    columns: flsCols ?? [],
    error: flsErr?.message ?? null,
    has_signup_origin: (flsCols ?? []).some(
      (c: any) => c.column_name === 'signup_origin',
    ),
  };

  // 5. first_login_state constraints
  const { data: flsCons, error: flsConsErr } = await supabase
    .from('pg_constraint')
    .select('conname, contype, consrc')
    .eq('conname', 'first_login_state_signup_origin_check')
    .limit(5);
  result.first_login_state_constraints = {
    constraints: flsCons ?? [],
    error: flsConsErr?.message ?? null,
  };

  // 6. role_assignments columns
  const { data: raCols, error: raErr } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_schema', 'public')
    .eq('table_name', 'role_assignments')
    .order('ordinal_position');
  result.role_assignments_columns = {
    columns: raCols ?? [],
    error: raErr?.message ?? null,
    has_expires_at: (raCols ?? []).some(
      (c: any) => c.column_name === 'expires_at',
    ),
  };

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
