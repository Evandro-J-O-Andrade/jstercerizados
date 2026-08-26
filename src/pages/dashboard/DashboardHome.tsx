import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Activity,
  FileText,
} from 'lucide-react';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { getSupabaseClient } from '@/lib/supabase';

interface DashboardStats {
  people: number;
  companies: number;
  jobs: number;
  candidates: number;
  applications: number;
  tenants: number;
  notifications: number;
  recentEvents: Array<{
    id: string;
    event_type: string;
    description: string;
    created_at: string;
  }>;
  loading: boolean;
}

export default function DashboardHome() {
  const { roles, currentTenantId, tenantMemberships, isAdminMaster } =
    useAuth();
  const { availableModules, activePermissions, identity } = useAccount();
  const [stats, setStats] = useState<DashboardStats>({
    people: 0,
    companies: 0,
    jobs: 0,
    candidates: 0,
    applications: 0,
    tenants: 0,
    notifications: 0,
    recentEvents: [],
    loading: true,
  });

  const displayName = identity.displayName;
  const roleName = identity.roleName;
  const contextLabel = identity.contextLabel;

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchStats = async () => {
      try {
        const tenantIds = tenantMemberships.map((m) => m.tenant_id);
        const isPlatform = isAdminMaster;
        let peopleCount = 0;
        let companiesCount = 0;
        let jobsCount = 0;
        let candidatesCount = 0;
        let applicationsCount = 0;
        let tenantsCount = 0;
        const notificationsCount = 0;
        let recentEvents: DashboardStats['recentEvents'] = [];

        if (isPlatform) {
          const [
            { count: pCount },
            { count: jCount },
            { count: candCount },
            { count: appCount },
            { count: tenantCount },
          ] = await Promise.all([
            supabase.from('people').select('*', { count: 'exact', head: true }),
            supabase
              .from('companies')
              .select('*', { count: 'exact', head: true }),
            supabase.from('jobs').select('*', { count: 'exact', head: true }),
            supabase
              .from('candidates')
              .select('*', { count: 'exact', head: true }),
            supabase
              .from('applications')
              .select('*', { count: 'exact', head: true }),
            supabase
              .from('tenants')
              .select('*', { count: 'exact', head: true }),
          ]);

          peopleCount = pCount || 0;
          jobsCount = jCount || 0;
          candidatesCount = candCount || 0;
          applicationsCount = appCount || 0;
          tenantsCount = tenantCount || 0;

          const companiesResult = await supabase
            .from('companies')
            .select('id', { count: 'exact', head: true });
          companiesCount = companiesResult.count || 0;

          const { data: events } = await supabase
            .from('domain_events')
            .select('id, event_type, description, created_at')
            .order('created_at', { ascending: false })
            .limit(8);
          recentEvents = events || [];
        } else {
          const activeTenantId = currentTenantId || tenantIds[0];
          if (activeTenantId) {
            const [
              { count: pCount },
              { count: jCount },
              { count: candCount },
              { count: appCount },
            ] = await Promise.all([
              supabase
                .from('people')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', activeTenantId),
              supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', activeTenantId),
              supabase
                .from('candidates')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', activeTenantId),
              supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', activeTenantId),
            ]);
            peopleCount = pCount || 0;
            jobsCount = jCount || 0;
            candidatesCount = candCount || 0;
            applicationsCount = appCount || 0;

            const companiesResult = await supabase
              .from('companies')
              .select('id', { count: 'exact', head: true })
              .eq('tenant_id', activeTenantId);
            companiesCount = companiesResult.count || 0;

            const { data: events } = await supabase
              .from('domain_events')
              .select('id, event_type, description, created_at')
              .eq('tenant_id', activeTenantId)
              .order('created_at', { ascending: false })
              .limit(8);
            recentEvents = events || [];
          }
        }

        setStats({
          people: peopleCount,
          companies: companiesCount,
          jobs: jobsCount,
          candidates: candidatesCount,
          applications: applicationsCount,
          tenants: tenantsCount,
          notifications: notificationsCount,
          recentEvents,
          loading: false,
        });
      } catch (error) {
        console.error('[DASHBOARD] Failed to load stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [isAdminMaster, currentTenantId, tenantMemberships]);

  const kpis = useMemo(() => {
    if (isAdminMaster) {
      return [
        {
          label: 'Usuários',
          value: stats.people,
          icon: Users,
          permission: 'people.read',
        },
        {
          label: 'Tenants',
          value: stats.tenants,
          icon: Building2,
          permission: 'tenants.read',
        },
        {
          label: 'Empresas',
          value: stats.companies,
          icon: Building2,
          permission: 'companies.read',
        },
        {
          label: 'Vagas',
          value: stats.jobs,
          icon: Briefcase,
          permission: 'jobs.read',
        },
        {
          label: 'Candidatos',
          value: stats.candidates,
          icon: Users,
          permission: 'candidates.read',
        },
        {
          label: 'Candidaturas',
          value: stats.applications,
          icon: Briefcase,
          permission: 'applications.read',
        },
      ];
    }

    const role = roles[0]?.name;
    if (role === 'rh') {
      return [
        {
          label: 'Funcionários',
          value: stats.people,
          icon: Users,
          permission: 'people.read',
        },
        {
          label: 'Candidatos',
          value: stats.candidates,
          icon: Users,
          permission: 'candidates.read',
        },
        {
          label: 'Vagas',
          value: stats.jobs,
          icon: Briefcase,
          permission: 'jobs.read',
        },
        {
          label: 'Candidaturas',
          value: stats.applications,
          icon: Briefcase,
          permission: 'applications.read',
        },
        {
          label: 'Empresas',
          value: stats.companies,
          icon: Building2,
          permission: 'companies.read',
        },
      ];
    }

    if (role === 'financeiro') {
      return [
        {
          label: 'Contas a pagar',
          value: stats.jobs,
          icon: FileText,
          permission: 'finance.accounts_payable.read',
        },
        {
          label: 'Contas a receber',
          value: stats.applications,
          icon: FileText,
          permission: 'finance.accounts_receivable.read',
        },
        {
          label: 'Vagas',
          value: stats.jobs,
          icon: Briefcase,
          permission: 'jobs.read',
        },
        {
          label: 'Candidaturas',
          value: stats.applications,
          icon: Briefcase,
          permission: 'applications.read',
        },
      ];
    }

    if (role === 'candidato') {
      return [
        {
          label: 'Minhas candidaturas',
          value: stats.applications,
          icon: Briefcase,
          permission: 'applications.read',
        },
        {
          label: 'Vagas disponíveis',
          value: stats.jobs,
          icon: Briefcase,
          permission: 'jobs.read',
        },
      ];
    }

    return [
      {
        label: 'Colaboradores',
        value: stats.people,
        icon: Users,
        permission: 'people.read',
      },
      {
        label: 'Empresas',
        value: stats.companies,
        icon: Building2,
        permission: 'companies.read',
      },
      {
        label: 'Vagas',
        value: stats.jobs,
        icon: Briefcase,
        permission: 'jobs.read',
      },
      {
        label: 'Candidatos',
        value: stats.candidates,
        icon: Users,
        permission: 'candidates.read',
      },
      {
        label: 'Candidaturas',
        value: stats.applications,
        icon: Briefcase,
        permission: 'applications.read',
      },
    ];
  }, [stats, isAdminMaster, roles]);

  const visibleKpis = useMemo(() => {
    return kpis.filter((kpi) =>
      activePermissions.some(
        (p) => `${p.resource}.${p.action}` === kpi.permission,
      ),
    );
  }, [kpis, activePermissions]);

  const quickAccessModules = useMemo(() => {
    const priorityIds = isAdminMaster
      ? [
          'tenants',
          'usuarios',
          'roles-permissoes',
          'auditoria',
          'clientes',
          'vagas',
          'candidatos',
          'financeiro',
        ]
      : roles[0]?.name === 'rh'
        ? [
            'rh',
            'vagas',
            'candidatos',
            'recrutamento',
            'processos-seletivos',
            'documentos',
            'relatorios',
          ]
        : roles[0]?.name === 'financeiro'
          ? [
              'financeiro',
              'fiscal',
              'contabilidade',
              'relatorios',
              'documentos',
              'suporte',
            ]
          : roles[0]?.name === 'candidato'
            ? ['inicio', 'candidatos', 'vagas', 'documentos', 'suporte']
            : [
                'clientes',
                'vagas',
                'candidatos',
                'servicos',
                'financeiro',
                'estoque',
                'suporte',
                'relatorios',
              ];

    return availableModules
      .filter((m) => priorityIds.includes(m.id))
      .slice(0, 8);
  }, [availableModules, isAdminMaster, roles]);

  const isEmpty = availableModules.length === 0;

  return (
    <ModuleWorkspace
      title="Visão Geral"
      description="Painel de gestão"
      icon={LayoutDashboard}
      breadcrumbItems={[]}
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-foreground mb-1 text-xl font-semibold">
            Seja bem-vindo, {displayName}
          </h2>
          <p className="text-muted-foreground text-sm">
            {roleName} · {contextLabel} · {dateStr} · {timeStr}
          </p>
        </section>

        <section>
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Indicadores
          </h3>
          {stats.loading ? (
            <div className="text-muted-foreground text-sm">
              Carregando indicadores...
            </div>
          ) : visibleKpis.length === 0 ? (
            <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
              <p className="text-muted-foreground text-sm">
                Nenhum indicador disponível para o seu perfil.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleKpis.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card border-border rounded-xl border p-4 shadow-sm"
                  >
                    <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                      {item.label}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-2xl font-semibold">
                        {item.value.toLocaleString('pt-BR')}
                      </span>
                      <Icon className="text-primary h-5 w-5" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {stats.recentEvents.length > 0 && (
          <section>
            <h3 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5" />
              Atividade recente
            </h3>
            <div className="bg-card border-border rounded-xl border shadow-sm">
              <div className="divide-border divide-y">
                {stats.recentEvents.slice(0, 8).map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {event.description || event.event_type}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {event.event_type}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {new Date(event.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {isEmpty ? (
          <section>
            <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                Nenhum módulo disponível
              </h3>
              <p className="text-muted-foreground text-sm">
                Você ainda não tem permissões atribuídas para acessar módulos.
                Se precisar, solicite acesso ao administrador da plataforma.
              </p>
            </div>
          </section>
        ) : (
          <section>
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              Acessos rápidos
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickAccessModules.map((mod, index) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ModuleCard module={mod} permissions={activePermissions} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </ModuleWorkspace>
  );
}
