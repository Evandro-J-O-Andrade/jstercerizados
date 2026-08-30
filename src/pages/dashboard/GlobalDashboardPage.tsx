import { useEffect, useState } from 'react';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { type GlobalDashboardStats } from './global-dashboard-model';

interface DashboardStats extends GlobalDashboardStats {
  notifications: number;
  recentEvents: Array<{
    id: string;
    event_name: string;
    aggregate_type: string;
    created_at: string;
  }>;
  loading: boolean;
  error: string | null;
}

export default function GlobalDashboardPage() {
  const { currentTenantId, tenantMemberships, isAdminMaster } = useAuth();
  const { identity } = useAccount();
  const [stats, setStats] = useState<DashboardStats>({
    tenants: 0,
    companies: 0,
    people: 0,
    candidates: 0,
    jobs: 0,
    applications: 0,
    serviceOrders: 0,
    supportTickets: 0,
    notifications: 0,
    recentEvents: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: 'Supabase não está configurado.',
        }));
        return;
      }

      try {
        const activeTenantId =
          currentTenantId || tenantMemberships[0]?.tenant_id;
        const globalScope = isAdminMaster;

        const countTable = async (table: string) => {
          let query = supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          if (!globalScope && activeTenantId)
            query = query.eq('tenant_id', activeTenantId);
          const { count, error } = await query;
          if (error) throw error;
          return count ?? 0;
        };

        const [
          tenants,
          companies,
          people,
          candidates,
          jobs,
          applications,
          serviceOrders,
          supportTickets,
        ] = await Promise.all([
          globalScope ? countTable('tenants') : Promise.resolve(0),
          countTable('companies'),
          countTable('people'),
          countTable('candidates'),
          countTable('jobs'),
          countTable('applications'),
          countTable('service_orders'),
          countTable('support_tickets'),
        ]);

        let eventsQuery = supabase
          .from('domain_events')
          .select('id, event_name, aggregate_type, created_at')
          .order('created_at', { ascending: false })
          .limit(8);
        if (!globalScope && activeTenantId) {
          eventsQuery = eventsQuery.eq('tenant_id', activeTenantId);
        }
        const { data: events, error: eventsError } = await eventsQuery;
        if (eventsError) throw eventsError;

        if (cancelled) return;
        setStats({
          tenants,
          companies,
          people,
          candidates,
          jobs,
          applications,
          serviceOrders,
          supportTickets,
          notifications: 0,
          recentEvents: events ?? [],
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os indicadores.';
        console.error('[DASHBOARD:GLOBAL] Failed to load stats:', error);
        setStats((prev) => ({ ...prev, loading: false, error: message }));
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [currentTenantId, isAdminMaster, tenantMemberships]);

  return (
    <ModuleWorkspace
      title="Dashboard Global"
      description="Visão consolidada da plataforma e de todos os domínios autorizados."
      icon={LayoutDashboard}
      breadcrumbItems={[]}
    >
      <div className="space-y-6">
        <section className="from-primary/10 via-card to-card border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm">
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                <ShieldCheck className="h-4 w-4" />
                Admin Master · Gestão Global
              </div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {identity.greeting}, {identity.firstName}.
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
                Controle central da plataforma: tenants, empresas, pessoas, RH,
                operação, suporte e demais domínios disponíveis para sua conta.
              </p>
            </div>
            <div className="text-muted-foreground text-sm lg:text-right">
              <p className="text-foreground font-medium">
                {identity.contextLabel}
              </p>
              <p>
                {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
              </p>
            </div>
          </div>
        </section>

        {stats.error && (
          <section className="border-warning/30 bg-warning/10 text-warning rounded-xl border p-4 text-sm">
            Não foi possível carregar todos os indicadores. O painel continua
            exibindo os dados disponíveis.
            <span className="sr-only"> {stats.error}</span>
          </section>
        )}
      </div>
    </ModuleWorkspace>
  );
}
