/**
 * scripts/seed-homologation.ts
 *
 * Seed completo de homologação.
 * Cria usuários de teste para cada role + dados realistas do domínio J&S.
 * Idempotente: pode ser executado múltiplas vezes sem duplicar.
 *
 * Uso:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SECRET_KEY=sb_secret_xxx \
 *   npx tsx scripts/seed-homologation.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnvFile(path: string) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('='))
        continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  } catch {
    // ignore
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.provision');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Missing required env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false },
});

const TENANT_ID = 'd480af07-ab6b-4561-ac3a-2a0b0c1267b5';
const TENANT_NAME = 'J&S Empregos LTDA';
const TENANT_SLUG = 'js-empregos';

const TEST_USERS = [
  {
    email: 'teste.adminmaster@jsempregos.com.br',
    name: 'Admin Master Teste',
    role: 'admin_master',
    scope: 'system',
  },
  {
    email: 'teste.tenantadmin@jsempregos.com.br',
    name: 'Tenant Admin Teste',
    role: 'tenant_admin',
    scope: 'tenant',
  },
  {
    email: 'teste.rh@jsempregos.com.br',
    name: 'RH Teste',
    role: 'rh_manager',
    scope: 'tenant',
  },
  {
    email: 'teste.financeiro@jsempregos.com.br',
    name: 'Financeiro Teste',
    role: 'finance_manager',
    scope: 'tenant',
  },
  {
    email: 'teste.fiscal@jsempregos.com.br',
    name: 'Fiscal Teste',
    role: 'fiscal_manager',
    scope: 'tenant',
  },
  {
    email: 'teste.contador@jsempregos.com.br',
    name: 'Contador Teste',
    role: 'accountant',
    scope: 'tenant',
  },
  {
    email: 'teste.operacional@jsempregos.com.br',
    name: 'Operacional Teste',
    role: 'operations_manager',
    scope: 'tenant',
  },
  {
    email: 'teste.recrutador@jsempregos.com.br',
    name: 'Recrutador Teste',
    role: 'recruiter',
    scope: 'tenant',
  },
  {
    email: 'teste.suporte@jsempregos.com.br',
    name: 'Suporte Teste',
    role: 'support',
    scope: 'tenant',
  },
  {
    email: 'teste.viewer@jsempregos.com.br',
    name: 'Viewer Teste',
    role: 'viewer',
    scope: 'tenant',
  },
];

const DEFAULT_PASSWORD = 'saas@123456';

async function ensureTenant() {
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', TENANT_ID)
    .maybeSingle();

  if (existing) {
    console.log('[HOMOLOGATION] Tenant exists');
    return;
  }

  const { error } = await supabase.from('tenants').insert({
    id: TENANT_ID,
    name: TENANT_NAME,
    slug: TENANT_SLUG,
    plan: 'enterprise',
    status: 'active',
    settings: {
      primary_color: '#2563eb',
      whatsapp: '11999999999',
      phone: '(11) 99999-9999',
    },
  });

  if (error) {
    console.error('Failed to create tenant:', error.message);
    process.exit(1);
  }
  console.log('[HOMOLOGATION] Tenant created');
}

async function ensureRole(roleName: string, scope: string) {
  const { data: existing } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .eq('scope', scope)
    .maybeSingle();

  if (existing) {
    console.log(`[HOMOLOGATION] Role exists: ${roleName}`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('roles')
    .insert({
      name: roleName,
      scope,
      description: `Test role: ${roleName}`,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error(`Failed to create role ${roleName}:`, error?.message);
    return null;
  }
  console.log(`[HOMOLOGATION] Role created: ${roleName}`);
  return data.id;
}

async function ensurePerson(
  authUserId: string,
  email: string,
  fullName: string,
) {
  const { data: existing } = await supabase
    .from('people')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('people')
      .update({
        auth_user_id: authUserId,
        full_name: fullName,
        status: 'active',
      })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('people')
    .insert({
      auth_user_id: authUserId,
      email,
      full_name: fullName,
      status: 'active',
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error(`Failed to create person ${email}:`, error?.message);
    return null;
  }
  console.log(`[HOMOLOGATION] Person created: ${email}`);
  return data.id;
}

async function ensureAuthUser(email: string, password: string) {
  let authUserId: string | null = null;

  const { data: existingUser } = await supabase.auth.admin.listUsers();
  const user = existingUser?.users?.find((u) => u.email === email);

  if (user) {
    authUserId = user.id;
    await supabase.auth.admin.updateUserById(user.id, { password });
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !newUser.user) {
      console.error(`Failed to create auth user ${email}:`, error?.message);
      return null;
    }
    authUserId = newUser.user.id;
    console.log(`[HOMOLOGATION] Auth user created: ${email}`);
  }

  return authUserId;
}

async function ensureMembership(personId: string, tenantId: string) {
  const { data: existing } = await supabase
    .from('tenant_memberships')
    .select('id')
    .eq('person_id', personId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('tenant_memberships')
      .update({ status: 'active' })
      .eq('id', existing.id);
    return;
  }

  const { error } = await supabase.from('tenant_memberships').insert({
    person_id: personId,
    tenant_id: tenantId,
    status: 'active',
  });

  if (error) {
    console.error(`Failed to create membership:`, error.message);
  } else {
    console.log(`[HOMOLOGATION] Membership created`);
  }
}

async function ensureRoleAssignment(
  personId: string,
  roleId: string,
  tenantId: string | null,
) {
  const { data: existing } = await supabase
    .from('role_assignments')
    .select('id')
    .eq('person_id', personId)
    .eq('role_id', roleId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from('role_assignments').insert({
    person_id: personId,
    role_id: roleId,
    tenant_id: tenantId,
  });

  if (error) {
    console.error(`Failed to create role assignment:`, error.message);
  } else {
    console.log(`[HOMOLOGATION] Role assignment created`);
  }
}

async function ensureFirstLoginState(personId: string) {
  const { data: existing } = await supabase
    .from('first_login_state')
    .select('person_id')
    .eq('person_id', personId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('first_login_state')
      .update({
        must_change_password: true,
        first_login_completed: false,
        terms_version: 'v1',
      })
      .eq('person_id', personId);
    return;
  }

  const { error } = await supabase.from('first_login_state').insert({
    person_id: personId,
    must_change_password: true,
    first_login_completed: false,
    terms_version: 'v1',
  });

  if (error) {
    console.error(`Failed to create first_login_state:`, error.message);
  } else {
    console.log(`[HOMOLOGATION] First login state created`);
  }
}

async function createTestUser(user: {
  email: string;
  name: string;
  role: string;
  scope: string;
}) {
  console.log(`\n[HOMOLOGATION] Creating test user: ${user.email}`);

  const authUserId = await ensureAuthUser(user.email, DEFAULT_PASSWORD);
  if (!authUserId) return;

  const personId = await ensurePerson(authUserId, user.email, user.name);
  if (!personId) return;

  await ensureMembership(personId, TENANT_ID);

  const roleId = await ensureRole(user.role, user.scope);
  if (!roleId) return;

  const tenantId = user.scope === 'tenant' ? TENANT_ID : null;
  await ensureRoleAssignment(personId, roleId, tenantId);
  await ensureFirstLoginState(personId);

  console.log(`[HOMOLOGATION] ✓ ${user.email} → ${user.role}`);
}

async function main() {
  console.log('[HOMOLOGATION] Starting complete seed...\n');

  await ensureTenant();

  for (const user of TEST_USERS) {
    await createTestUser(user);
  }

  console.log('\n[HOMOLOGATION] Test users created');
  console.log('[HOMOLOGATION] Next: run business domain seed');
}

main().catch((err) => {
  console.error('❌ Homologation seed failed:', err.message || err);
  process.exit(1);
});
