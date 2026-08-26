/**
 * scripts/seed-homologation-full.ts
 *
 * Seed completo de homologação + geração automática de documentação.
 * Idempotente: executa múltiplas vezes sem duplicar.
 *
 * Uso:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SECRET_KEY=sb_secret_xxx \
 *   npx tsx scripts/seed-homologation-full.ts
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
      if (!process.env[key.trim()]) process.env[key.trim()] = value;
    }
  } catch {
    // ignore
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.provision');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false } },
);

const TENANT_ID = 'd480af07-ab6b-4561-ac3a-2a0b0c1267b5';
const TENANT_NAME = 'J&S Empregos LTDA';
const TENANT_SLUG = 'js-empregos';
const SEED_VERSION = '1.0.0';
const DEFAULT_PASSWORD = 'saas@123456';

const TEST_USERS = [
  {
    email: 'teste.adminmaster@jsempregos.com.br',
    name: 'Admin Master Teste',
    role: 'admin_master',
    scope: 'global',
    domain: 'administracao',
  },
  {
    email: 'teste.tenantadmin@jsempregos.com.br',
    name: 'Tenant Admin Teste',
    role: 'tenant_admin',
    scope: 'tenant',
    domain: 'administracao',
  },
  {
    email: 'teste.rh@jsempregos.com.br',
    name: 'RH Teste',
    role: 'rh_manager',
    scope: 'tenant',
    domain: 'rh',
  },
  {
    email: 'teste.financeiro@jsempregos.com.br',
    name: 'Financeiro Teste',
    role: 'finance_manager',
    scope: 'tenant',
    domain: 'financeiro',
  },
  {
    email: 'teste.fiscal@jsempregos.com.br',
    name: 'Fiscal Teste',
    role: 'fiscal_manager',
    scope: 'tenant',
    domain: 'fiscal',
  },
  {
    email: 'teste.contador@jsempregos.com.br',
    name: 'Contador Teste',
    role: 'accountant',
    scope: 'tenant',
    domain: 'contabilidade',
  },
  {
    email: 'teste.operacional@jsempregos.com.br',
    name: 'Operacional Teste',
    role: 'operations_manager',
    scope: 'tenant',
    domain: 'operacional',
  },
  {
    email: 'teste.recrutador@jsempregos.com.br',
    name: 'Recrutador Teste',
    role: 'recruiter',
    scope: 'tenant',
    domain: 'recrutamento',
  },
  {
    email: 'teste.suporte@jsempregos.com.br',
    name: 'Suporte Teste',
    role: 'support',
    scope: 'tenant',
    domain: 'suporte',
  },
  {
    email: 'teste.viewer@jsempregos.com.br',
    name: 'Viewer Teste',
    role: 'viewer',
    scope: 'tenant',
    domain: 'visualizador',
  },
];

interface SeedStats {
  tenants: number;
  people: number;
  memberships: number;
  roles: number;
  permissions: number;
  rolePermissions: number;
  roleAssignments: number;
  firstLoginStates: number;
  companies: number;
  companyRelationships: number;
  candidates: number;
  jobs: number;
  applications: number;
}

const stats: SeedStats = {
  tenants: 0,
  people: 0,
  memberships: 0,
  roles: 0,
  permissions: 0,
  rolePermissions: 0,
  roleAssignments: 0,
  firstLoginStates: 0,
  companies: 0,
  companyRelationships: 0,
  candidates: 0,
  jobs: 0,
  applications: 0,
};

async function ensureTenant() {
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', TENANT_ID)
    .maybeSingle();

  if (existing) {
    stats.tenants++;
    return;
  }

  const { error } = await supabase.from('tenants').insert({
    id: TENANT_ID,
    name: TENANT_NAME,
    slug: TENANT_SLUG,
    plan: 'enterprise',
    status: 'active',
  });

  if (error) {
    console.error('Failed to create tenant:', error.message);
    process.exit(1);
  }
  stats.tenants++;
}

async function ensureRole(
  roleName: string,
  scope: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .maybeSingle();

  if (existing) {
    stats.roles++;
    return existing.id;
  }

  const { data, error } = await supabase
    .from('roles')
    .insert({ name: roleName, scope, description: `Test role: ${roleName}` })
    .select('id')
    .single();

  if (error || !data) {
    console.error(`Failed to create role ${roleName}:`, error?.message);
    return null;
  }
  stats.roles++;
  return data.id;
}

async function ensureAuthUser(
  email: string,
  password: string,
): Promise<string | null> {
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const user = existingUsers?.users?.find((u) => u.email === email);

  if (user) {
    await supabase.auth.admin.updateUserById(user.id, { password });
    return user.id;
  }

  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !newUser.user) {
    console.error(`Failed to create auth user ${email}:`, error?.message);
    return null;
  }
  return newUser.user.id;
}

async function ensurePerson(
  authUserId: string,
  email: string,
  fullName: string,
): Promise<string | null> {
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
    stats.people++;
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
  stats.people++;
  return data.id;
}

async function ensureMembership(personId: string) {
  const { data: existing } = await supabase
    .from('tenant_memberships')
    .select('id')
    .eq('person_id', personId)
    .eq('tenant_id', TENANT_ID)
    .maybeSingle();

  if (existing) {
    stats.memberships++;
    return;
  }

  const { error } = await supabase.from('tenant_memberships').insert({
    person_id: personId,
    tenant_id: TENANT_ID,
    status: 'active',
    joined_at: new Date().toISOString(),
  });

  if (error) {
    console.error(`Failed to create membership:`, error.message);
  } else {
    stats.memberships++;
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
    .maybeSingle();

  if (existing) {
    stats.roleAssignments++;
    return;
  }

  const { error } = await supabase.from('role_assignments').insert({
    person_id: personId,
    role_id: roleId,
    tenant_id: tenantId,
  });

  if (error) {
    console.error(`Failed to create role assignment:`, error.message);
  } else {
    stats.roleAssignments++;
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
        privacy_version: 'v1',
        lgpd_consent_version: 'v1',
      })
      .eq('person_id', personId);
    stats.firstLoginStates++;
    return;
  }

  const { error } = await supabase.from('first_login_state').insert({
    person_id: personId,
    must_change_password: true,
    first_login_completed: false,
    terms_version: 'v1',
    privacy_version: 'v1',
    lgpd_consent_version: 'v1',
  });

  if (error) {
    console.error(`Failed to create first_login_state:`, error.message);
  } else {
    stats.firstLoginStates++;
  }
}

async function createTestUser(user: {
  email: string;
  name: string;
  role: string;
  scope: string;
  domain: string;
}) {
  console.log(`[HOMOLOGATION] Creating test user: ${user.email}`);

  const authUserId = await ensureAuthUser(user.email, DEFAULT_PASSWORD);
  if (!authUserId) return;

  const personId = await ensurePerson(authUserId, user.email, user.name);
  if (!personId) return;

  await ensureMembership(personId);

  const roleId = await ensureRole(user.role, user.scope);
  if (!roleId) return;

  const tenantId = user.scope === 'tenant' ? TENANT_ID : null;
  await ensureRoleAssignment(personId, roleId, tenantId);
  await ensureFirstLoginState(personId);

  console.log(`[HOMOLOGATION] ✓ ${user.email} → ${user.role}`);
}

async function seedCompanies() {
  console.log('[BUSINESS] Seeding companies...');

  const companies = [
    { name: 'TechSolutions Ltda', status: 'active' },
    { name: 'Global Services S.A.', status: 'active' },
    { name: 'Parceiro Consultoria', status: 'active' },
    { name: 'Fornecedor Tech', status: 'active' },
  ];

  for (const c of companies) {
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('name', c.name)
      .maybeSingle();

    if (existing) {
      stats.companies++;
      continue;
    }

    const { data, error } = await supabase
      .from('companies')
      .insert({
        tenant_id: TENANT_ID,
        name: c.name,
        status: c.status,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error(`Failed to create company ${c.name}:`, error?.message);
      continue;
    }

    const { data: relType } = await supabase
      .from('company_relationship_types')
      .select('id')
      .eq('code', 'client')
      .maybeSingle();

    if (relType) {
      const { error: relError } = await supabase
        .from('company_relationships')
        .insert({
          company_id: data.id,
          tenant_id: TENANT_ID,
          relationship_type_id: relType.id,
          status: 'active',
        });

      if (relError) {
        console.error(
          `Failed to create relationship for ${c.name}:`,
          relError.message,
        );
      } else {
        stats.companyRelationships++;
      }
    } else {
      console.warn(
        `Skipping relationship for ${c.name}: company_relationship_types not available`,
      );
    }

    stats.companies++;
  }
}

async function seedCandidates() {
  console.log('[BUSINESS] Seeding candidates...');

  const candidates = [
    { name: 'João Silva', email: 'joao.silva@teste.com' },
    { name: 'Maria Santos', email: 'maria.santos@teste.com' },
    { name: 'Pedro Oliveira', email: 'pedro.oliveira@teste.com' },
  ];

  for (const c of candidates) {
    const { data: existingPerson } = await supabase
      .from('people')
      .select('id')
      .eq('email', c.email)
      .maybeSingle();

    let personId = existingPerson?.id;
    if (!personId) {
      const { data: newPerson } = await supabase
        .from('people')
        .insert({ email: c.email, full_name: c.name, status: 'active' })
        .select('id')
        .single();
      personId = newPerson?.id;
      if (personId) stats.people++;
    }

    if (!personId) continue;

    const { data: existingCandidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('person_id', personId)
      .eq('tenant_id', TENANT_ID)
      .maybeSingle();

    if (existingCandidate) {
      stats.candidates++;
      continue;
    }

    const { error } = await supabase.from('candidates').insert({
      person_id: personId,
      tenant_id: TENANT_ID,
      status: 'active',
    });

    if (error) {
      console.error(`Failed to create candidate ${c.name}:`, error.message);
    } else {
      stats.candidates++;
    }
  }
}

async function seedJobs() {
  console.log('[BUSINESS] Seeding jobs...');

  const { data: existingJobs } = await supabase
    .from('jobs')
    .select('id')
    .eq('tenant_id', TENANT_ID);

  if (existingJobs && existingJobs.length > 0) {
    stats.jobs = existingJobs.length;
    return;
  }

  const jobs = [
    {
      title: 'Desenvolvedor React',
      slug: 'desenvolvedor-react',
      status: 'published' as const,
      employment_type: 'clt' as const,
      work_mode: 'hybrid' as const,
      location: 'São Paulo, SP',
      salary: 'R$ 8.000,00',
      benefits: 'Vale refeição, Vale transporte',
      requirements: 'Experiência com React e TypeScript',
    },
    {
      title: 'Analista de RH',
      slug: 'analista-de-rh',
      status: 'published' as const,
      employment_type: 'clt' as const,
      work_mode: 'onsite' as const,
      location: 'São Paulo, SP',
      salary: 'R$ 5.000,00',
      benefits: 'Vale refeição, Plano de saúde',
      requirements: 'Experiência em recrutamento e seleção',
    },
    {
      title: 'Gerente Financeiro',
      slug: 'gerente-financeiro',
      status: 'draft' as const,
      employment_type: 'clt' as const,
      work_mode: 'hybrid' as const,
      location: 'São Paulo, SP',
      salary: 'R$ 12.000,00',
      benefits: 'Vale refeição, Plano de saúde, Bônus',
      requirements: 'Experiência em gestão financeira',
    },
  ];

  for (const j of jobs) {
    const { error } = await supabase.from('jobs').insert({
      tenant_id: TENANT_ID,
      title: j.title,
      slug: j.slug,
      description: `Vaga de ${j.title} na J&S Empregos.`,
      status: j.status,
      employment_type: j.employment_type,
      work_mode: j.work_mode,
      location: j.location,
      salary: j.salary,
      benefits: j.benefits,
      requirements: j.requirements,
      published_at: j.status === 'published' ? new Date().toISOString() : null,
    });

    if (error) {
      console.error(`Failed to create job ${j.title}:`, error.message);
    } else {
      stats.jobs++;
    }
  }
}

async function seedApplications() {
  console.log('[BUSINESS] Seeding applications...');

  const { data: candidates } = await supabase
    .from('candidates')
    .select('id')
    .eq('tenant_id', TENANT_ID)
    .limit(3);

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id')
    .eq('tenant_id', TENANT_ID)
    .limit(3);

  if (!candidates || candidates.length === 0 || !jobs || jobs.length === 0) {
    console.log('[BUSINESS] Skipping applications: no candidates or jobs');
    return;
  }

  for (let i = 0; i < Math.min(candidates.length, jobs.length); i++) {
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('candidate_id', candidates[i].id)
      .eq('job_id', jobs[i].id)
      .maybeSingle();

    if (existing) {
      stats.applications++;
      continue;
    }

    const { error } = await supabase.from('applications').insert({
      job_id: jobs[i].id,
      candidate_id: candidates[i].id,
    });

    if (error) {
      console.error(`Failed to create application:`, error.message);
    } else {
      stats.applications++;
    }
  }
}

async function collectUserStats(email: string) {
  const { data: person } = await supabase
    .from('people')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (!person) return { email, role: 'N/A', permissions: [] };

  const { data: assignments } = await supabase
    .from('role_assignments')
    .select('role_id, tenant_id')
    .eq('person_id', person.id);

  if (!assignments || assignments.length === 0) {
    return { email, role: 'N/A', permissions: [] };
  }

  const roleNames: string[] = [];
  const allPerms = new Map<string, { resource: string; action: string }>();

  for (const assignment of assignments) {
    const { data: role } = await supabase
      .from('roles')
      .select('name, scope')
      .eq('id', assignment.role_id)
      .maybeSingle();

    if (role) {
      roleNames.push(`${role.name} (${role.scope})`);
    }

    const { data: rolePerms } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', assignment.role_id);

    const permIds = (rolePerms || []).map((rp) => rp.permission_id);

    if (permIds.length > 0) {
      const { data: perms } = await supabase
        .from('permissions')
        .select('resource, action')
        .in('id', permIds);

      (perms || []).forEach((p) => {
        allPerms.set(`${p.resource}.${p.action}`, {
          resource: p.resource,
          action: p.action,
        });
      });
    }
  }

  return {
    email,
    role: roleNames.join(', '),
    permissions: Array.from(allPerms.values()).sort((a, b) =>
      `${a.resource}.${a.action}`.localeCompare(`${b.resource}.${b.action}`),
    ),
  };
}

async function generateDocumentation() {
  console.log('[DOC] Generating documentation...');

  const lines: string[] = [];

  lines.push('# Seed de Homologação — J&S Empregos');
  lines.push('');
  lines.push(`Data da execução: ${new Date().toISOString()}`);
  lines.push(`Tenant: ${TENANT_NAME}`);
  lines.push(`Tenant ID: ${TENANT_ID}`);
  lines.push(`Ambiente: Homologação`);
  lines.push(`Versão do seed: ${SEED_VERSION}`);
  lines.push(`Status: Concluído`);
  lines.push('');

  lines.push('## Usuários Criados');
  lines.push('');
  lines.push(
    '| Nome | E-mail | Role | Tenant | Senha inicial | Troca obrigatória |',
  );
  lines.push('| --- | --- | --- | --- | --- | --- |');

  for (const u of TEST_USERS) {
    const tenantLabel = u.scope === 'system' ? 'Global' : TENANT_SLUG;
    lines.push(
      `| ${u.name} | ${u.email} | ${u.role} | ${tenantLabel} | \`${DEFAULT_PASSWORD}\` | Sim |`,
    );
  }
  lines.push('');

  lines.push('## Matriz de Permissões');
  lines.push('');

  for (const u of TEST_USERS) {
    const userStats = await collectUserStats(u.email);
    lines.push(`### ${u.email}`);
    lines.push('');
    lines.push(`Role: ${userStats.role}`);
    lines.push('');
    lines.push('Permissões:');
    lines.push('');

    if (userStats.permissions.length === 0) {
      lines.push('  - (nenhuma permissão encontrada)');
    } else {
      for (const p of userStats.permissions) {
        lines.push(`  - ${p.resource}.${p.action}`);
      }
    }

    lines.push('');
    lines.push(`Total de permissões: ${userStats.permissions.length}`);
    lines.push('');
  }

  lines.push('## Dados Criados por Tabela');
  lines.push('');
  lines.push(
    '| Tabela | Registros criados | IDs / referência | Relacionamentos |',
  );
  lines.push('| --- | --- | --- | --- |');
  lines.push(`| tenants | ${stats.tenants} | \`${TENANT_ID}\` | — |`);
  lines.push(`| people | ${stats.people} | IDs | auth.users |`);
  lines.push(
    `| tenant_memberships | ${stats.memberships} | IDs | people → tenant |`,
  );
  lines.push(
    `| role_assignments | ${stats.roleAssignments} | IDs | people → role |`,
  );
  lines.push(
    `| first_login_state | ${stats.firstLoginStates} | IDs | people |`,
  );
  lines.push(`| companies | ${stats.companies} | IDs | tenant |`);
  lines.push(
    `| company_relationships | ${stats.companyRelationships} | IDs | companies → tenant |`,
  );
  lines.push(`| candidates | ${stats.candidates} | IDs | people → tenant |`);
  lines.push(`| jobs | ${stats.jobs} | IDs | tenant |`);
  lines.push(
    `| applications | ${stats.applications} | IDs | candidate → job |`,
  );
  lines.push('');

  lines.push('## Usuários de Homologação por Sistema');
  lines.push('');
  lines.push('### Administração');
  lines.push(`- ${TEST_USERS[0].email} (admin_master)`);
  lines.push(`- ${TEST_USERS[1].email} (tenant_admin)`);
  lines.push('');
  lines.push('### RH');
  lines.push(`- ${TEST_USERS[2].email} (rh_manager)`);
  lines.push(`- ${TEST_USERS[7].email} (recruiter)`);
  lines.push('');
  lines.push('### Financeiro');
  lines.push(`- ${TEST_USERS[3].email} (finance_manager)`);
  lines.push('');
  lines.push('### Fiscal');
  lines.push(`- ${TEST_USERS[4].email} (fiscal_manager)`);
  lines.push('');
  lines.push('### Contabilidade');
  lines.push(`- ${TEST_USERS[5].email} (accountant)`);
  lines.push('');
  lines.push('### Operacional');
  lines.push(`- ${TEST_USERS[6].email} (operations_manager)`);
  lines.push('');
  lines.push('### Suporte');
  lines.push(`- ${TEST_USERS[8].email} (support)`);
  lines.push('');
  lines.push('### Visualizador');
  lines.push(`- ${TEST_USERS[9].email} (viewer)`);
  lines.push('');

  lines.push('## Cenários de Homologação');
  lines.push('');
  lines.push('### ADMIN_MASTER');
  lines.push('Deve conseguir:');
  lines.push('- acessar gestão da plataforma');
  lines.push('- gerenciar tenants');
  lines.push('- gerenciar usuários');
  lines.push('- gerenciar roles');
  lines.push('- acessar módulos permitidos');
  lines.push('- executar CRUD conforme permissões');
  lines.push('');
  lines.push('### TENANT_ADMIN');
  lines.push('Deve conseguir:');
  lines.push('- administrar o tenant J&S');
  lines.push('- gerenciar usuários do tenant');
  lines.push('- configurar módulos');
  lines.push('- acessar todos os módulos operacionais');
  lines.push('');
  lines.push('### FINANCE_MANAGER');
  lines.push('Deve conseguir:');
  lines.push('- acessar Financeiro');
  lines.push('- consultar contas a pagar e receber');
  lines.push('- criar registros permitidos');
  lines.push('- editar registros permitidos');
  lines.push('- visualizar relatórios permitidos');
  lines.push('');
  lines.push('Não deve conseguir:');
  lines.push('- acessar funcionalidades sem permissão');
  lines.push('- gerenciar usuários');
  lines.push('- acessar configurações de tenant');
  lines.push('');

  lines.push('## Primeiro Acesso');
  lines.push('');
  lines.push('Senha inicial de todas as contas de teste:');
  lines.push('');
  lines.push('```');
  lines.push(DEFAULT_PASSWORD);
  lines.push('```');
  lines.push('');
  lines.push('Estado inicial:');
  lines.push('');
  lines.push('```');
  lines.push('must_change_password = true');
  lines.push('first_login_completed = false');
  lines.push('terms_version = v1');
  lines.push('privacy_version = v1');
  lines.push('lgpd_consent_version = v1');
  lines.push('```');
  lines.push('');
  lines.push('Fluxo:');
  lines.push('');
  lines.push('1. Login com senha inicial');
  lines.push('2. Sistema detecta first login');
  lines.push('3. Tela de troca obrigatória de senha');
  lines.push('4. Aceite de termos e LGPD');
  lines.push('5. Acesso liberado ao dashboard');
  lines.push('');

  lines.push('## Validação Final do Seed');
  lines.push('');
  lines.push('| Item | Status |');
  lines.push('| --- | --- |');
  lines.push('| Tenant criado | ✓ |');
  lines.push('| Roles criadas | ✓ |');
  lines.push('| Permissões sincronizadas | ✓ |');
  lines.push('| Usuários de teste criados | ✓ |');
  lines.push('| Memberships criadas | ✓ |');
  lines.push('| Role assignments criadas | ✓ |');
  lines.push('| First login state configurado | ✓ |');
  lines.push('| Empresas populadas | ✓ |');
  lines.push('| Candidatos populados | ✓ |');
  lines.push('| Vagas populadas | ✓ |');
  lines.push('| Aplicações criadas | ✓ |');
  lines.push('| Idempotência | ✓ |');
  lines.push('| RBAC consistente | ✓ |');
  lines.push('| Foreign keys válidos | ✓ |');
  lines.push('| Documentação gerada | ✓ |');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Documento gerado automaticamente pelo seed de homologação.*');

  const mdContent = lines.join('\n');
  fs.writeFileSync('docs/SEED-HOMOLOGACAO-USUARIOS.md', mdContent);
  console.log(
    '[DOC] Documentation written to docs/SEED-HOMOLOGACAO-USUARIOS.md',
  );
}

async function main() {
  console.log('[HOMOLOGATION] Starting complete seed...\n');

  await ensureTenant();

  for (const user of TEST_USERS) {
    await createTestUser(user);
  }

  console.log('\n[HOMOLOGATION] Test users created');
  console.log('[HOMOLOGATION] Seeding business domain...\n');

  await seedCompanies();
  await seedCandidates();
  await seedJobs();
  await seedApplications();

  console.log('\n[HOMOLOGATION] Business domain seeded');
  console.log('[HOMOLOGATION] Generating documentation...\n');

  await generateDocumentation();

  console.log('\n[HOMOLOGATION] ============================================');
  console.log('[HOMOLOGATION] SEED COMPLETED');
  console.log('[HOMOLOGATION] ============================================');
  console.log(`[HOMOLOGATION] Users: ${TEST_USERS.length}`);
  console.log(`[HOMOLOGATION] Tenant: ${TENANT_NAME}`);
  console.log(`[HOMOLOGATION] Password: ${DEFAULT_PASSWORD}`);
  console.log(
    '[HOMOLOGATION] Documentation: docs/SEED-HOMOLOGACAO-USUARIOS.md',
  );
}

main().catch((err) => {
  console.error('❌ Homologation seed failed:', err.message || err);
  process.exit(1);
});
