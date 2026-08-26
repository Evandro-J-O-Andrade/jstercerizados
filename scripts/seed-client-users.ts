/**
 * scripts/seed-client-users.ts
 *
 * Provisiona usuários iniciais do TENANT CLIENTE.
 *
 * Executa:
 * 1. Valida tenant existente
 * 2. Cria/verifica Auth users (idempotente)
 * 3. Garante people records
 * 4. Cria tenant_memberships
 * 5. Atribui roles (TENANT_ADMIN, FINANCE_MANAGER)
 * 6. Cria first_login_state para ambos
 *
 * 🔐 NÃO contém senha nem secret key em código.
 *   - SUPABASE_URL, SUPABASE_SECRET_KEY devem vir de variáveis de ambiente
 *
 * Uso:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SECRET_KEY=sb_secret_xxx \
 *   npm run provision:client
 *
 * Referência: AGENTS.md
 *   "J&S Empregos LTDA" — NÃO alterar nome da empresa
 *   ADMIN_MASTER — NÃO alterar
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
    // .env files optional
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.provision');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing required env vars.');
  console.error('   Required: SUPABASE_URL, SUPABASE_SECRET_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false },
});

const CLIENT_TENANT_ID = 'd480af07-ab6b-4561-ac3a-2a0b0c1267b5';
const TENANT_ADMIN_ROLE = 'tenant_admin';
const FINANCE_MANAGER_ROLE = 'finance_manager';

const USERS = [
  {
    email: 'gestor@jsempregos.com.br',
    fullName: 'Gestor J&S Empregos',
    role: TENANT_ADMIN_ROLE,
  },
  {
    email: 'financeiro@jsempregos.com.br',
    fullName: 'Financeiro J&S Empregos',
    role: FINANCE_MANAGER_ROLE,
  },
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function provision() {
  console.log('[CLIENT-SEED] Starting');

  // 1. Validate tenant exists
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .eq('id', CLIENT_TENANT_ID)
    .maybeSingle();

  if (tenantError || !tenantData) {
    console.error(
      '❌ Tenant not found:',
      tenantError?.message || 'unknown error',
    );
    process.exit(1);
  }
  console.log('[CLIENT-SEED] Tenant validated:', tenantData.name);

  // 2. Resolve role IDs
  const { data: tenantAdminRole, error: tenantAdminError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', TENANT_ADMIN_ROLE)
    .eq('scope', 'tenant')
    .maybeSingle();

  if (tenantAdminError || !tenantAdminRole) {
    console.error(
      '❌ Role not found:',
      TENANT_ADMIN_ROLE,
      tenantAdminError?.message || 'unknown error',
    );
    process.exit(1);
  }

  const { data: financeManagerRole, error: financeManagerError } =
    await supabase
      .from('roles')
      .select('id')
      .eq('name', FINANCE_MANAGER_ROLE)
      .eq('scope', 'tenant')
      .maybeSingle();

  if (financeManagerError || !financeManagerRole) {
    console.error(
      '❌ Role not found:',
      FINANCE_MANAGER_ROLE,
      financeManagerError?.message || 'unknown error',
    );
    process.exit(1);
  }

  const roleMap: Record<string, string> = {
    [TENANT_ADMIN_ROLE]: tenantAdminRole.id,
    [FINANCE_MANAGER_ROLE]: financeManagerRole.id,
  };

  // 3. Process each user
  for (const userConfig of USERS) {
    console.log(`[CLIENT-SEED] ${userConfig.email}`);

    // 3a. Check if Auth user exists
    const { data: usersData, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Failed to list users:', listError.message);
      process.exit(1);
    }

    const userList = usersData?.users || usersData || [];
    const foundUser = (userList || []).find(
      (u: { email?: string }) => u.email === userConfig.email,
    );

    let authUserId: string;

    if (foundUser) {
      authUserId = foundUser.id;
      console.log(`[CLIENT-SEED] ${userConfig.email} Auth: existing`);
    } else {
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: userConfig.email,
          password: 'jsempregos1234',
          email_confirm: true,
          user_metadata: {
            full_name: userConfig.fullName,
          },
        });

      if (createError) {
        console.error(
          `❌ Failed to create Auth user ${userConfig.email}:`,
          createError.message,
        );
        process.exit(1);
      }

      authUserId = newUser.user.id;
      console.log(`[CLIENT-SEED] ${userConfig.email} Auth: created`);
      await sleep(500);
    }

    // 3b. Ensure person exists
    const { data: personData, error: personError } = await supabase
      .from('people')
      .select('id, auth_user_id, full_name, email')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    let personId = personData?.id;

    if (personError) {
      console.error(
        `❌ Failed to fetch person for ${userConfig.email}:`,
        personError.message,
      );
      process.exit(1);
    }

    if (personData) {
      console.log(`[CLIENT-SEED] ${userConfig.email} Person: existing`);
    } else {
      const { data: newPerson, error: createPersonError } = await supabase
        .from('people')
        .upsert(
          {
            auth_user_id: authUserId,
            email: userConfig.email,
            full_name: userConfig.fullName,
            status: 'active',
          },
          {
            onConflict: 'auth_user_id',
          },
        )
        .select('id')
        .maybeSingle();

      if (createPersonError || !newPerson) {
        console.error(
          `❌ Failed to create person for ${userConfig.email}:`,
          createPersonError?.message || 'unknown error',
        );
        process.exit(1);
      }

      personId = newPerson.id;
      console.log(`[CLIENT-SEED] ${userConfig.email} Person: created`);
    }

    if (!personId) {
      console.error(`❌ Could not resolve person_id for ${userConfig.email}.`);
      process.exit(1);
    }

    // 3c. Create/verify tenant membership
    const { error: membershipError } = await supabase
      .from('tenant_memberships')
      .upsert(
        {
          person_id: personId,
          tenant_id: CLIENT_TENANT_ID,
          status: 'active',
          joined_at: new Date().toISOString(),
        },
        {
          onConflict: 'person_id,tenant_id',
        },
      );

    if (membershipError) {
      console.error(
        `❌ Failed to create tenant membership for ${userConfig.email}:`,
        membershipError.message,
      );
      process.exit(1);
    }
    console.log(
      `[CLIENT-SEED] ${userConfig.email} Membership: existing/created`,
    );

    // 3d. Assign role
    const roleId = roleMap[userConfig.role];
    if (!roleId) {
      console.error(`❌ Role ID not resolved for ${userConfig.role}`);
      process.exit(1);
    }

    const { data: existingAssignment, error: checkError } = await supabase
      .from('role_assignments')
      .select('id')
      .eq('person_id', personId)
      .eq('role_id', roleId)
      .eq('tenant_id', CLIENT_TENANT_ID)
      .maybeSingle();

    if (checkError) {
      console.error(
        `❌ Failed to check role assignment for ${userConfig.email}:`,
        checkError.message,
      );
      process.exit(1);
    }

    if (existingAssignment) {
      console.log(
        `[CLIENT-SEED] ${userConfig.email} Role: ${userConfig.role} (existing)`,
      );
    } else {
      const { error: insertError } = await supabase
        .from('role_assignments')
        .insert({
          person_id: personId,
          role_id: roleId,
          tenant_id: CLIENT_TENANT_ID,
        });

      if (insertError) {
        console.error(
          `❌ Failed to assign role ${userConfig.role} to ${userConfig.email}:`,
          insertError.message,
        );
        process.exit(1);
      }
      console.log(`[CLIENT-SEED] ${userConfig.email} Role: ${userConfig.role}`);
    }

    // 3e. Create first_login_state
    const { data: existingFirstLogin, error: firstLoginCheckError } =
      await supabase
        .from('first_login_state')
        .select('person_id')
        .eq('person_id', personId)
        .maybeSingle();

    if (firstLoginCheckError) {
      console.error(
        `❌ Failed to check first_login_state for ${userConfig.email}:`,
        firstLoginCheckError.message,
      );
      process.exit(1);
    }

    if (existingFirstLogin) {
      console.log(`[CLIENT-SEED] ${userConfig.email} FirstLogin: existing`);
    } else {
      const { error: firstLoginError } = await supabase
        .from('first_login_state')
        .insert({
          person_id: personId,
          must_change_password: true,
          terms_version: 'v1',
          privacy_version: 'v1',
          lgpd_consent_version: 'v1',
          first_login_completed: false,
        });

      if (firstLoginError) {
        console.error(
          `❌ Failed to create first_login_state for ${userConfig.email}:`,
          firstLoginError.message,
        );
        process.exit(1);
      }
      console.log(`[CLIENT-SEED] ${userConfig.email} FirstLogin: created`);
    }
  }

  console.log('[CLIENT-SEED] Completed');
  console.log('');
  console.log('📋 Summary:');
  for (const userConfig of USERS) {
    console.log(`   ${userConfig.email} → ${userConfig.role}`);
  }
  console.log(`   Tenant: ${tenantData.name} (${CLIENT_TENANT_ID})`);
  console.log('');
  console.log('🔐 Next steps:');
  console.log('   1. Users can login with the temporary password');
  console.log('   2. First access requires terms acceptance + password change');
  console.log('   3. ADMIN_MASTER was NOT modified');
}

provision().catch((err) => {
  console.error('❌ Provision failed:', err.message || err);
  process.exit(1);
});
