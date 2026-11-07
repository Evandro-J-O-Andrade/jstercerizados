import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission as userHasPermission } from '@/utils/rbac';
import type { GlobalDashboardStats } from '@/pages/dashboard/global-dashboard-model';
import type { DomainEventSummary } from '@/types/domain/security';

/**
 * Carrega indicadores globais/tenant a partir de fontes reais autorizadas (RLS/RBAC).
 * Nunca inventa valores: falha isolada por KPI é registrada em kpiErrors e o valor permanece 0
 * (interpretar como indisponível quando houver erro para aquela chave).
 */
export type GlobalDashboardKpiKey = keyof GlobalDashboardStats | 'recentEvents';

export interface GlobalDashboardData extends GlobalDashboardStats {
  recentEvents: DomainEventSummary[];
  kpiErrors: Partial<Record<GlobalDashboardKpiKey, string>>;
  loading: boolean;
  error: string | null;
}

const emptyStats: GlobalDashboardStats = {
  tenants: 0,
  companies: 0,
  people: 0,
  candidates: 0,
  jobs: 0,
  applications: 0,
  serviceOrders: 0,
  supportTickets: 0,
};

export function useGlobalDashboardStats(): GlobalDashboardData {
  const { currentTenantId, isAdminMaster, permissions } = useAuth();
  const [data, setData] = useState<GlobalDashboardData>({
    ...emptyStats,
    recentEvents: [],
    kpiErrors: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!cancelled) {
          setData((previous) => ({
            ...previous,
            loading: false,
            error: 'Supabase não está configurado.',
            kpiErrors: {},
          }));
        }
        return;
      }

      const activeTenantId = currentTenantId;
      if (!activeTenantId && !isAdminMaster) {
        if (!cancelled) {
          setData({
            ...emptyStats,
            recentEvents: [],
            kpiErrors: {},
            loading: false,
            error: null,
          });
        }
        return;
      }

      if (!cancelled) {
        setData((previous) => ({ ...previous, loading: true, error: null }));
      }

      try {
        const globalScope = isAdminMaster;
        const kpiErrors: Partial<Record<GlobalDashboardKpiKey, string>> = {};

        const safeCount = async (
          key: keyof GlobalDashboardStats,
          permission: string,
          fn: () => Promise<number>,
        ): Promise<number> => {
          if (!isAdminMaster && !userHasPermission(permissions, permission))
            return 0;
          try {
            return await fn();
          } catch (e) {
            kpiErrors[key] =
              e instanceof Error ? e.message : 'erro ao consultar';
            return 0;
          }
        };

        const countTable = async (table: string) => {
          let query = supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          if (!globalScope && activeTenantId) {
            query = query.eq('tenant_id', activeTenantId);
          }
          const { count, error } = await query;
          if (error) throw error;
          return count ?? 0;
        };

        const countPeople = async () => {
          if (globalScope) return countTable('people');
          const { count, error } = await supabase
            .from('tenant_memberships')
            .select('person_id', { count: 'exact', head: true })
            .eq('tenant_id', activeTenantId)
            .eq('status', 'active');
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
          safeCount('tenants', 'tenants.read', async () =>
            globalScope ? countTable('tenants') : 0,
          ),
          safeCount('companies', 'companies.read', () =>
            countTable('companies'),
          ),
          safeCount('people', 'people.read', countPeople),
          safeCount('candidates', 'candidates.read', () =>
            countTable('candidates'),
          ),
          safeCount('jobs', 'jobs.read', () => countTable('jobs')),
          safeCount('applications', 'applications.read', () =>
            countTable('applications'),
          ),
          safeCount('serviceOrders', 'service_orders.read', () =>
            countTable('service_orders'),
          ),
          safeCount('supportTickets', 'support_tickets.read', () =>
            countTable('support_tickets'),
          ),
        ]);

        let recentEvents: DomainEventSummary[] = [];
        if (userHasPermission(permissions, 'domain_events.read')) {
          try {
            let eventsQuery = supabase
              .from('domain_events')
              .select('id, event_type, aggregate_type, created_at, tenant_id')
              .order('created_at', { ascending: false })
              .limit(10);
            if (!globalScope && activeTenantId) {
              eventsQuery = eventsQuery.eq('tenant_id', activeTenantId);
            }
            const { data: events, error: eventsError } = await eventsQuery;
            if (eventsError) throw eventsError;
            recentEvents = (events ?? []) as DomainEventSummary[];
          } catch (e) {
            kpiErrors.recentEvents =
              e instanceof Error ? e.message : 'erro ao consultar eventos';
          }
        }

        if (!cancelled) {
          setData({
            tenants,
            companies,
            people,
            candidates,
            jobs,
            applications,
            serviceOrders,
            supportTickets,
            recentEvents,
            kpiErrors,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os indicadores.';
        setData((previous) => ({
          ...previous,
          loading: false,
          error: message,
        }));
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentTenantId, isAdminMaster, permissions]);

  return data;
}
