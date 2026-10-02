import { getSupabaseClient } from '@/lib/supabase';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';

export interface ModuleStats {
  primaryMetric?: { label: string; value: string | number };
  secondaryMetrics?: Array<{ label: string; value: string | number }>;
  description: string;
  itemCount?: number;
}

const MODULE_STATS_QUERIES: Record<
  string,
  (tenantId: string, supabase: any) => Promise<ModuleStats>
> = {
  financeiro: async (tenantId, supabase) => {
    const [payable, receivable, transactions] = await Promise.all([
      supabase
        .from('accounts_payable')
        .select('id, amount, status', { count: 'exact' })
        .eq('tenant_id', tenantId),
      supabase
        .from('accounts_receivable')
        .select('id, amount, status', { count: 'exact' })
        .eq('tenant_id', tenantId),
      supabase
        .from('financial_transactions')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId),
    ]);

    const payableCount = payable.count || 0;
    const receivableCount = receivable.count || 0;
    const transactionCount = transactions.count || 0;

    return {
      itemCount: payableCount + receivableCount + transactionCount,
      primaryMetric: { label: 'Contas a Pagar', value: payableCount },
      secondaryMetrics: [
        { label: 'Contas a Receber', value: receivableCount },
        { label: 'Transações', value: transactionCount },
      ],
      description: `Gerencie ${payableCount} contas a pagar, ${receivableCount} a receber e ${transactionCount} transações financeiras.`,
    };
  },

  recrutamento: async (tenantId, supabase) => {
    const [jobs, candidates, applications] = await Promise.all([
      supabase
        .from('jobs')
        .select('id, status', { count: 'exact' })
        .eq('tenant_id', tenantId),
      supabase
        .from('candidates')
        .select('id, status', { count: 'exact' })
        .eq('tenant_id', tenantId),
      supabase
        .from('applications')
        .select('id, status', { count: 'exact' })
        .eq('tenant_id', tenantId),
    ]);

    const jobsCount = jobs.count || 0;
    const candidatesCount = candidates.count || 0;
    const appsCount = applications.count || 0;
    const publishedJobs =
      jobs.data?.filter((j: any) => j.status === 'published').length || 0;

    return {
      itemCount: jobsCount + candidatesCount + appsCount,
      primaryMetric: { label: 'Vagas', value: jobsCount },
      secondaryMetrics: [
        { label: 'Publicadas', value: publishedJobs },
        { label: 'Candidatos', value: candidatesCount },
        { label: 'Candidaturas', value: appsCount },
      ],
      description: `Gerencie ${jobsCount} vagas (${publishedJobs} publicadas), ${candidatesCount} candidatos e ${appsCount} candidaturas.`,
    };
  },

  rh: async (tenantId, supabase) => {
    const { data: employees, count: empCount } = await supabase
      .from('employees')
      .select('id, status', { count: 'exact' })
      .eq('tenant_id', tenantId);

    const employeeCount = empCount || 0;
    const activeEmployees =
      employees?.filter((e: any) => e.status === 'active').length || 0;

    return {
      itemCount: employeeCount,
      primaryMetric: { label: 'Funcionários', value: employeeCount },
      secondaryMetrics: [{ label: 'Ativos', value: activeEmployees }],
      description: `Administre ${employeeCount} funcionários (${activeEmployees} ativos).`,
    };
  },

  crm: async (tenantId, supabase) => {
    const [companies, leads] = await Promise.all([
      supabase
        .from('companies')
        .select('id, status', { count: 'exact' })
        .eq('tenant_id', tenantId),
      supabase
        .from('leads')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId),
    ]);

    const companiesCount = companies.count || 0;
    const leadsCount = leads.count || 0;

    return {
      itemCount: companiesCount + leadsCount,
      primaryMetric: { label: 'Empresas', value: companiesCount },
      secondaryMetrics: [{ label: 'Leads', value: leadsCount }],
      description: `Relacione-se com ${companiesCount} empresas e ${leadsCount} leads.`,
    };
  },

  tenants: async (_tenantId, supabase) => {
    const { count } = await supabase
      .from('tenants')
      .select('id', { count: 'exact', head: true });
    const tenantsCount = count || 0;

    return {
      itemCount: tenantsCount,
      primaryMetric: { label: 'Tenants', value: tenantsCount },
      secondaryMetrics: [],
      description: `Gerencie ${tenantsCount} tenants da plataforma.`,
    };
  },

  'gestao-saas': async (_tenantId, supabase) => {
    const { count } = await supabase
      .from('tenants')
      .select('id', { count: 'exact', head: true });
    const tenantsCount = count || 0;

    return {
      itemCount: tenantsCount,
      primaryMetric: { label: 'Tenants', value: tenantsCount },
      secondaryMetrics: [],
      description: `Monitore ${tenantsCount} tenants da plataforma SaaS.`,
    };
  },

  'roles-permissoes': async (_tenantId, supabase) => {
    const [roles, permissions] = await Promise.all([
      supabase.from('roles').select('id', { count: 'exact' }),
      supabase.from('permissions').select('id', { count: 'exact' }),
    ]);

    const rolesCount = roles.count || 0;
    const permsCount = permissions.count || 0;

    return {
      itemCount: rolesCount + permsCount,
      primaryMetric: { label: 'Roles', value: rolesCount },
      secondaryMetrics: [{ label: 'Permissões', value: permsCount }],
      description: `Configure ${rolesCount} roles e ${permsCount} permissões do sistema.`,
    };
  },
};

export async function fetchModuleStats(
  module: ModuleDefinition,
  tenantId: string,
): Promise<ModuleStats> {
  const queryFn = MODULE_STATS_QUERIES[module.id];

  if (!queryFn) {
    return {
      description: module.description,
      itemCount: 0,
    };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        description: module.description,
        itemCount: 0,
      };
    }

    const stats = await queryFn(tenantId, supabase);
    return stats;
  } catch (error) {
    console.warn(`Failed to fetch stats for module ${module.id}:`, error);
    return {
      description: module.description,
      itemCount: 0,
    };
  }
}

export async function fetchAllModuleStats(
  modules: ModuleDefinition[],
  tenantId: string,
): Promise<Record<string, ModuleStats>> {
  const results: Record<string, ModuleStats> = {};

  await Promise.all(
    modules.map(async (module) => {
      results[module.id] = await fetchModuleStats(module, tenantId);
    }),
  );

  return results;
}
