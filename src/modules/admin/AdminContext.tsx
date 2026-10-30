/**
 * AdminContext — contexto da célula de Administração.
 * Gerencia estado dos dados administrativos do tenant/contexto atual,
 * consumindo dados reais do Supabase (tabelas tenants, people, roles,
 * tenant_memberships, domain_events).
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

interface AdminStats {
  totalTenants: number;
  totalUsers: number;
  totalRoles: number;
  activeSessions: number;
  recentActivity: Array<{
    id: string;
    action: string;
    actor: string;
    at: string;
  }>;
}

interface AdminContextType {
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
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
      // Busca contagens reais de cada tabela
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

      // Busca nomes dos atores para a atividade recente
      const recentEvents = (eventsResult.data || []).map((event: any) => ({
        id: event.id,
        action: event.event_type || 'Evento',
        actor: event.aggregate_type || 'Sistema',
        at: event.created_at || new Date().toISOString(),
      }));

      setStats({
        totalTenants: tenantsResult.count ?? 0,
        totalUsers: peopleResult.count ?? 0,
        totalRoles: rolesResult.count ?? 0,
        activeSessions: membershipsResult.count ?? 0,
        recentActivity: recentEvents,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar administração';
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
    <AdminContext.Provider
      value={{ stats, isLoading, error, refresh }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return ctx;
}
