import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission as userHasPermission } from '@/utils/rbac';
import type { GlobalDashboardStats } from '@/pages/dashboard/global-dashboard-model';
import type { DomainEventSummary } from '@/types/domain/security';

export interface GlobalDashboardData extends GlobalDashboardStats {
  recentEvents: DomainEventSummary[];
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
        const countTable = async (table: string, permission: string) => {
          if (!userHasPermission(permissions, permission)) return 0;

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
          if (!userHasPermission(permissions, 'people.read')) return 0;
          if (globalScope) return countTable('people', 'people.read');
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
          globalScope
            ? countTable('tenants', 'tenants.read')
            : Promise.resolve(0),
          countTable('companies', 'companies.read'),
          countPeople(),
          countTable('candidates', 'candidates.read'),
          countTable('jobs', 'jobs.read'),
          countTable('applications', 'applications.read'),
          countTable('service_orders', 'service_orders.read'),
          countTable('support_tickets', 'support_tickets.read'),
        ]);

        let recentEvents: DomainEventSummary[] = [];
        if (userHasPermission(permissions, 'domain_events.read')) {
          let eventsQuery = supabase
            .from('domain_events')
            .select('id, event_type, aggregate_type, created_at, tenant_id')
            .order('created_at', { ascending: false })
            .limit(8);
          if (!globalScope && activeTenantId) {
            eventsQuery = eventsQuery.eq('tenant_id', activeTenantId);
          }

          const { data: events, error: eventsError } = await eventsQuery;
          if (eventsError) throw eventsError;
          recentEvents = (events ?? []) as DomainEventSummary[];
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
