import { config } from 'dotenv';
config({ path: '.env' });
import { Client } from 'pg';
const c = new Client({ connectionString: 'postgresql://postgres:' + encodeURIComponent('@An2907081831') + '@db.okxqfyoqbhcmflpurfrw.supabase.co:5432/postgres' });
await c.connect();
const r = await c.query(`
  SELECT p.id AS person_id, p.full_name, p.email, p.auth_user_id,
         c.id AS candidate_id, c.tenant_id, c.status,
         ra.role_id, r.name AS role_name, tm.status AS membership_status
  FROM public.people p
  LEFT JOIN public.candidates c ON c.person_id = p.id
  LEFT JOIN public.role_assignments ra ON ra.person_id = p.id
  LEFT JOIN public.roles r ON r.id = ra.role_id
  LEFT JOIN public.tenant_memberships tm ON tm.person_id = p.id
  WHERE p.email = 'candidato.diag@test.local'
  ORDER BY r.name
`);
console.log(JSON.stringify(r.rows, null, 2));
await c.end();
