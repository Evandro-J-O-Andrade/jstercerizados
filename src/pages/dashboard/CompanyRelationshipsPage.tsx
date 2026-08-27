import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Handshake, Plus } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyRelationship {
  id: string;
  company_id: string;
  tenant_id: string;
  relationship_type_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  companies: any;
  company_relationship_types: any;
}

export default function CompanyRelationshipsPage() {
  const { isAdminMaster, tenantMemberships, currentTenantId } = useAuth();
  const [items, setItems] = useState<CompanyRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchRelationships = async () => {
      try {
        let query = supabase
          .from('company_relationships')
          .select(
            `
            id,
            company_id,
            tenant_id,
            relationship_type_id,
            status,
            started_at,
            ended_at,
            created_at,
            companies (
              id,
              legal_name,
              trading_name,
              cnpj,
              status
            ),
            company_relationship_types (
              id,
              code,
              name
            )
          `,
          )
          .order('created_at', { ascending: false });

        if (!isAdminMaster) {
          const activeTenantId =
            currentTenantId || tenantMemberships[0]?.tenant_id;
          if (activeTenantId) {
            query = query.eq('tenant_id', activeTenantId);
          }
        }

        const { data, error } = await query;
        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar relacionamentos',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();
  }, [isAdminMaster, currentTenantId, tenantMemberships]);

  return (
    <ModuleWorkspace
      title="Relacionamentos comerciais"
      description="Gerencie clientes, parceiros e fornecedores."
      icon={Handshake}
      breadcrumbItems={[{ label: 'Relacionamentos' }]}
      actions={
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Novo relacionamento
        </Button>
      }
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando relacionamentos...
        </div>
      ) : error ? (
        <div className="text-destructive text-sm">{error}</div>
      ) : items.length === 0 ? (
        <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
          <p className="text-muted-foreground text-sm">
            Nenhum relacionamento cadastrado no momento.
          </p>
        </div>
      ) : (
        <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
          <table className="divide-border min-w-full divide-y">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Empresa
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Tipo
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Início
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Fim
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {items.map((item) => {
                const company = Array.isArray(item.companies)
                  ? item.companies[0]
                  : item.companies;
                const type = Array.isArray(item.company_relationship_types)
                  ? item.company_relationship_types[0]
                  : item.company_relationship_types;
                return (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm">
                      <div className="text-foreground font-medium">
                        {company?.trading_name ||
                          company?.legal_name ||
                          'Sem nome'}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {company?.cnpj}
                      </div>
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm">
                      {type?.name || item.relationship_type_id}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                        {item.status}
                      </span>
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm">
                      {item.started_at
                        ? new Date(item.started_at).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm">
                      {item.ended_at
                        ? new Date(item.ended_at).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ModuleWorkspace>
  );
}

