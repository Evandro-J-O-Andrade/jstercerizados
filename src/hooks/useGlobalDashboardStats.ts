import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { GlobalDashboardStats } from '@/pages/dashboard/global-dashboard-model';
import type { DomainEvent } from '@/types/domain/security';

export interface GlobalDashboardData extends GlobalDashboardStats {
  recentEvents: DomainEvent[];
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
  const { currentTenantId, tenantMemberships, isAdminMaster } = useAuth();
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

      const activeTenantId = currentTenantId || tenantMemberships[0]?.tenant_id;
      if (!activeTenantId && !isAdminMaster) {
        if (!cancelled) {
          setData((previous) => ({ ...previous, loading: false }));
        }
        return;
      }

      if (!cancelled) {
        setData((previous) => ({ ...previous, loading: true, error: null }));
      }

      try {
        const globalScope = isAdminMaster;
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
          .select('id, event_type, aggregate_type, created_at, tenant_id')
          .order('created_at', { ascending: false })
          .limit(8);
        if (!globalScope && activeTenantId) {
          eventsQuery = eventsQuery.eq('tenant_id', activeTenantId);
        }
        const { data: events, error: eventsError } = await eventsQuery;
        if (eventsError) throw eventsError;

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
            recentEvents: (events ?? []) as DomainEvent[],
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
  }, [currentTenantId, isAdminMaster, tenantMemberships]);

  return data;
}
