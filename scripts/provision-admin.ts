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

// Validações de ambiente
const SUPABASE_URL = process.env.SUPABASE_URL;
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
const TENANT_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // J&S Empregos LTDA
const ROLE_ADMIN_MASTER = 'aaaaaaaa-0000-0000-0000-000000000001';

async function provision() {
  console.log('🚀 Starting admin_master provision...');

  // 1. Check if user already exists in Auth
  // Use listUsers with filter since getUserByEmail is not available in JS client
  const { data: users, error: listError } =
    await supabase.auth.admin.listUsers();

  let adminUserId: string | null = null;

  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }

  const foundUser = (users || []).find((u) => u.email === ADMIN_EMAIL);

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
  const { data: personData, error: personError } = await supabase
    .from('people')
    .select('id, auth_user_id, full_name, email')
    .eq('auth_user_id', adminUserId)
    .maybeSingle();

  if (personError) {
    console.error('❌ Failed to fetch person:', personError.message);
    process.exit(1);
  }

  if (personData) {
    console.log('✅ Person record exists:', personData.id);
  } else {
    console.log(
      'ℹ️ Person record not found — trigger 002 should create it. Retrying...',
    );
    // Wait then retry
    await new Promise((r) => setTimeout(r, 2000));
    const { data: retryPerson, error: retryError } = await supabase
      .from('people')
      .select('id')
      .eq('auth_user_id', adminUserId)
      .maybeSingle();

    if (retryError || !retryPerson) {
      console.error(
        '❌ Person record still not found after retry. Ensure trigger 002 is active.',
      );
      process.exit(1);
    }
    console.log('✅ Person record created via trigger:', retryPerson.id);
  }

  const personId = personData
    ? personData.id
    : (
        await supabase
          .from('people')
          .select('id')
          .eq('auth_user_id', adminUserId)
          .maybeSingle()
      ).data?.id;

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

  // 4. Get tenant_membership id for role assignment
  const { data: membershipRecord } = await supabase
    .from('tenant_memberships')
    .select('id')
    .eq('person_id', personId)
    .eq('tenant_id', TENANT_ID)
    .maybeSingle();

  // 5. Assign admin_master role (global — is_global = true)
  const { error: roleError } = await supabase.from('role_assignments').upsert(
    {
      actor_person_id: personId,
      role_id: ROLE_ADMIN_MASTER,
      tenant_membership_id: membershipRecord?.id || null,
      granted_by: personId,
      granted_at: new Date().toISOString(),
    },
    {
      onConflict: 'actor_person_id,role_id',
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
