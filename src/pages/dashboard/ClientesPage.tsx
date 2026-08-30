import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Building2, Plus } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Company } from '@/types/domain/company';

type CrmTab = 'companies' | 'contacts' | 'opportunities';

export default function ClientesPage() {
  const { isAdminMaster, tenantMemberships, currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<CrmTab>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchCompanies = async () => {
      try {
        let query = supabase
          .from('companies')
          .select('id, name, trading_name, cnpj, status, created_at')
          .order('created_at', { ascending: false });

        if (!isAdminMaster) {
          const activeTenantId =
            currentTenantId || tenantMemberships[0]?.tenant_id;
          if (activeTenantId) {
            query = query.eq('tenant_id', activeTenantId);
          }
        }

        const { data } = await query;
        setCompanies((data || []) as unknown as Company[]);
      } catch (error) {
        console.error('[CLIENTES] Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [isAdminMaster, currentTenantId, tenantMemberships]);

  return (
    <ModuleWorkspace
      title="Clientes"
      description="Leads, prospects e carteira de clientes."
      icon={Building2}
      breadcrumbItems={[{ label: 'Clientes', href: '/dashboard/clientes' }]}
      actions={
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      }
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando dados do CRM...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border-border flex gap-2 overflow-x-auto border-b">
            {[
              { key: 'companies', label: 'Empresas' },
              { key: 'contacts', label: 'Contatos' },
              { key: 'opportunities', label: 'Oportunidades' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as CrmTab)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary border-b-2'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'companies' && (
            <div>
              {companies.length === 0 ? (
                <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
                  <p className="text-muted-foreground text-sm">
                    Nenhuma empresa encontrada.
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
                          Tipo
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
                      {companies.map((company) => (
                        <tr
                          key={company.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="text-foreground px-4 py-3 text-sm font-medium">
                            {company.trading_name || company.name || 'Sem nome'}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            {company.cnpj ? 'Cliente' : '—'}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                              {company.status}
                            </span>
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            {new Date(company.created_at).toLocaleDateString(
                              'pt-BR',
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
              <p className="text-muted-foreground text-sm">
                Contatos vinculados às empresas aparecerão aqui.
              </p>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
              <p className="text-muted-foreground text-sm">
                Oportunidades e funis de CRM aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      )}
    </ModuleWorkspace>
  );
}
