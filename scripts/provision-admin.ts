/**
 * scripts/provision-admin.ts
 *
 * Provisiona o admin_master (Evandro) no Supabase DEV.
 *
 * Executa:
 * 1. Cria usuário no Supabase Auth (idempotente)
 * 2. Verifica/Garante pessoa no people (via trigger 002)
 * 3. Atribui role admin_master global
 * 4. Cria tenant_memberships para J&S Empregos LTDA
 *
 * 🔐 NÃO contém senha nem secret key em código.
 *   - SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
 *   - devem vir de variáveis de ambiente ou stdin
 *
 * Uso:
 *   SUPABASE_SECRET_KEY=xxxx ADMIN_EMAIL=evandro@... ADMIN_PASSWORD=xxxx npm run provision:admin
 *
 * Referência: AGENTS.md
 *   "J&S Empregos LTDA" — NÃO alterar nome da empresa
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Carrega .env.local manualmente (sem depender de dotenv)
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
    // .env.local optional
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.provision');

// Validações de ambiente
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ Missing required env vars.');
  console.error(
    '   Required: SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD',
  );
  console.error('');
  console.error('Usage:');
  console.error('  SUPABASE_URL=https://xxx.supabase.co \\');
  console.error('  SUPABASE_SECRET_KEY=sb_secret_xxx \\');
  console.error('  ADMIN_EMAIL=evandro_j.o.a@hotmail.com \\');
  console.error('  ADMIN_PASSWORD=xxxxxxx \\');
  console.error('  npm run provision:admin');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false },
});

const ADMIN_NAME = 'Evandro Andrade';
const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // J&S Empregos LTDA (match 001 seed)
const ROLE_ADMIN_MASTER = 'aaaaaaaa-0000-0000-0000-000000000001';

async function provision() {
  console.log('🚀 Starting admin_master provision...');

  // 1. Check if user already exists in Auth
  // Use listUsers with filter since getUserByEmail is not available in JS client
  const { data: usersData, error: listError } =
    await supabase.auth.admin.listUsers();

  let adminUserId: string | null = null;

  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }

  const userList = usersData?.users || usersData || [];
  const foundUser = (userList || []).find(
    (u: { email?: string }) => u.email === ADMIN_EMAIL,
  );

  if (foundUser) {
    adminUserId = foundUser.id;
    console.log('✅ User exists in Auth:', foundUser.id);
  } else {
    // Create user via Admin API
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: ADMIN_NAME,
        },
      });

    if (createError) {
      console.error('❌ Failed to create user:', createError.message);
      process.exit(1);
    }

    adminUserId = newUser.user.id;
    console.log('✅ User created in Auth:', newUser.user.id);
  }

  // 2. Ensure person exists (trigger 002 handles auth.users -> people)
  const personIdResponse = await supabase
    .from('people')
    .select('id, auth_user_id, full_name, email')
    .eq('auth_user_id', adminUserId)
    .maybeSingle();

  let personId = personIdResponse.data?.id;

  if (personIdResponse.error) {
    console.error('❌ Failed to fetch person:', personIdResponse.error.message);
    process.exit(1);
  }

  if (personIdResponse.data) {
    personId = personIdResponse.data.id;
    console.log('✅ Person record exists:', personId);
  } else {
    console.log(
      'ℹ️ Person record not found via trigger — creating manually...',
    );
    const { data: newPerson, error: createPersonError } = await supabase
      .from('people')
      .upsert(
        {
          auth_user_id: adminUserId,
          email: ADMIN_EMAIL,
          full_name: ADMIN_NAME,
        },
        {
          onConflict: 'auth_user_id',
        },
      )
      .select('id')
      .maybeSingle();

    if (createPersonError || !newPerson) {
      console.error(
        '❌ Failed to create person record:',
        createPersonError?.message || 'unknown error',
      );
      process.exit(1);
    }
    personId = newPerson.id;
    console.log('✅ Person record created manually:', personId);
  }

  if (!personId) {
    console.error('❌ Could not resolve person_id for admin user.');
    process.exit(1);
  }

  // 3. Create/verify tenant membership
  const { error: membershipError } = await supabase
    .from('tenant_memberships')
    .upsert(
      {
        person_id: personId,
        tenant_id: TENANT_ID,
        membership_role: 'owner',
        status: 'active',
        joined_at: new Date().toISOString(),
      },
      {
        onConflict: 'person_id,tenant_id',
      },
    );

  if (membershipError) {
    console.error(
      '❌ Failed to create tenant membership:',
      membershipError.message,
    );
    process.exit(1);
  }
  console.log('✅ Tenant membership verified (J&S Empregos LTDA)');

  // 5. Assign admin_master role (global — is_global = true)
  const { error: roleError } = await supabase.from('role_assignments').upsert(
    {
      person_id: personId,
      role_id: ROLE_ADMIN_MASTER,
      tenant_id: TENANT_ID,
      granted_by: personId,
      granted_at: new Date().toISOString(),
    },
    {
      onConflict: 'person_id,role_id,tenant_id',
    },
  );

  if (roleError) {
    console.error('❌ Failed to assign admin_master role:', roleError.message);
    process.exit(1);
  }
  console.log('✅ admin_master role assigned (global)');

  // Done
  console.log('');
  console.log('🎉 Provisionamento concluído:');
  console.log('   Email:     ', ADMIN_EMAIL);
  console.log('   Pessoa ID: ', personId);
  console.log('   Role:      admin_master (global)');
  console.log('   Tenant:    J&S Empregos LTDA');
  console.log('');
  console.log('🔐 Próximos passos:');
  console.log(
    '   1. Faça login em:',
    SUPABASE_URL.replace('/rest/v1', '/auth/v1/redirect'),
  );
  console.log('   2. Após login, verifique people + tenant_memberships');
  console.log(
    '   3. Acesse o admin panel do Supabase para confirmar role_assignment',
  );
}

provision().catch((err) => {
  console.error('❌ Provision failed:', err.message || err);
  process.exit(1);
});
