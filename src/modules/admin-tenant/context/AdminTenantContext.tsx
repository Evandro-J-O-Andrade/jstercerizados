/**
 * AdminTenantContext — contexto da célula Admin Tenant (proprietário).
 *
 * Gerencia estado dos dados de governança do tenant/contexto atual,
 * consumindo dados reais do Supabase (tabelas tenants, people, roles,
 * tenant_memberships, domain_events).
 *
 * Cada célula inicializa o próprio contexto. Nenhuma célula depende da
 * implementação interna de outra — apenas de contratos públicos.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { getSupabaseClient } from '@/lib/supabase';

interface AdminTenantStats {
  totalTenants: number;
  totalSystems: number;
  totalUnits: number;
  totalAdministrators: number;
  totalManagement: number;
  totalSecurity: number;
  totalAudit: number;
  totalSettings: number;
}

export interface AdminTenantContextType {
  stats: AdminTenantStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isOwner: boolean;
}

const AdminTenantContext = createContext<AdminTenantContextType | undefined>(
  undefined,
);

export function AdminTenantProvider({
  children,
}: { children: ReactNode }) {
  const [stats, setStats] = useState<AdminTenantStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase não configurado');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [
        tenantsResult,
        peopleResult,
        rolesResult,
        membershipsResult,
        eventsResult,
      ] = await Promise.all([
        supabase.from('tenants').select('id', { count: 'exact', head: true }),
        supabase.from('people').select('id', { count: 'exact', head: true }),
        supabase.from('roles').select('id', { count: 'exact', head: true }),
        supabase
          .from('tenant_memberships')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('domain_events')
          .select('id, event_type, aggregate_type, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (tenantsResult.error) throw tenantsResult.error;
      if (peopleResult.error) throw peopleResult.error;
      if (rolesResult.error) throw rolesResult.error;
      if (membershipsResult.error) throw membershipsResult.error;
      if (eventsResult.error) throw eventsResult.error;

      setStats({
        totalTenants: tenantsResult.count ?? 0,
        totalSystems: rolesResult.count ?? 0,
        totalUnits: membershipsResult.count ?? 0,
        totalAdministrators: peopleResult.count ?? 0,
        totalManagement: 0,
        totalSecurity: 0,
        totalAudit: eventsResult.data?.length ?? 0,
        totalSettings: 0,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao carregar administração do proprietário';
      setError(msg);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AdminTenantContext.Provider
      value={{ stats, isLoading, error, refresh, isOwner: true }}
    >
      {children}
    </AdminTenantContext.Provider>
  );
}

export function useAdminTenant(): AdminTenantContextType {
  const ctx = useContext(AdminTenantContext);
  if (!ctx) {
    throw new Error('useAdminTenant must be used within AdminTenantProvider');
  }
  return ctx;
}
