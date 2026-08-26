import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Building2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { tenantRepository } from '@/repositories/tenant.repository';
import type { Tenant } from '@/types/domain/tenant';

export default function TenantsPage() {
  const { isAdminMaster, tenantMemberships } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchTenants = async () => {
      try {
        let data: Tenant[] = [];

        if (isAdminMaster) {
          data = await tenantRepository.findAll('');
        } else if (tenantMemberships.length > 0) {
          const promises = tenantMemberships.map((m) =>
            tenantRepository.findById(m.tenant_id, m.tenant_id),
          );
          const results = await Promise.all(promises);
          data = results.filter((t): t is Tenant => t !== null);
        }

        if (!cancelled) {
          setTenants(
            data.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            ),
          );
        }
      } catch (error) {
        console.error('[TENANTS] Failed to load:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTenants();

    return () => {
      cancelled = true;
    };
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
