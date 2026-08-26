import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Building2, Plus } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Tenant {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export default function TenantsPage() {
  const { isAdminMaster, tenantMemberships } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchTenants = async () => {
      try {
        if (isAdminMaster) {
          const { data } = await supabase
            .from('tenants')
            .select('id, name, status, created_at')
            .order('created_at', { ascending: false });
          setTenants(data || []);
        } else {
          const tenantIds = tenantMemberships.map((m) => m.tenant_id);
          if (tenantIds.length === 0) {
            setTenants([]);
            return;
          }
          const { data } = await supabase
            .from('tenants')
            .select('id, name, status, created_at')
            .in('id', tenantIds)
            .order('created_at', { ascending: false });
          setTenants(data || []);
        }
      } catch (error) {
        console.error('[TENANTS] Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [isAdminMaster, tenantMemberships]);

  return (
    <ModuleWorkspace
      title="Tenants"
      description="Empresas e tenants da plataforma."
      icon={Building2}
      breadcrumbItems={[{ label: 'Tenants', href: '/dashboard/tenants' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Novo tenant
          </Button>
        ) : undefined
      }
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando tenants...
        </div>
      ) : tenants.length === 0 ? (
        <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
          <p className="text-muted-foreground text-sm">
            Nenhum tenant encontrado.
          </p>
        </div>
      ) : (
        <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
          <table className="divide-border min-w-full divide-y">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Nome
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Criado em
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {tenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="text-foreground px-4 py-3 text-sm font-medium">
                    {tenant.name}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                      {tenant.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModuleWorkspace>
  );
}
