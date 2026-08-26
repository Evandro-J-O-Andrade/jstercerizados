import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Acceptance {
  id: string;
  document_type: string;
  document_version: string;
  accepted_at: string;
}

export default function TermosPage() {
  const { isAdminMaster, tenantMemberships, currentTenantId } = useAuth();
  const [acceptances, setAcceptances] = useState<Acceptance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchAcceptances = async () => {
      try {
        let query = supabase
          .from('legal_acceptances')
          .select('id, document_type, document_version, accepted_at')
          .order('accepted_at', { ascending: false })
          .limit(50);

        if (!isAdminMaster) {
          const activeTenantId =
            currentTenantId || tenantMemberships[0]?.tenant_id;
          if (activeTenantId) {
            query = query.eq('tenant_id', activeTenantId);
          }
        }

        const { data } = await query;
        setAcceptances(data || []);
      } catch (error) {
        console.error('[TERMOS] Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptances();
  }, [isAdminMaster, currentTenantId, tenantMemberships]);

  const termsCount = acceptances.filter(
    (a) => a.document_type === 'terms',
  ).length;
  const privacyCount = acceptances.filter(
    (a) => a.document_type === 'privacy',
  ).length;

  return (
    <ModuleWorkspace
      title="Termos"
      description="Termos de uso e políticas."
      icon={FileText}
      breadcrumbItems={[{ label: 'Termos', href: '/dashboard/termos' }]}
      actions={<button className="text-sm">Editar termos</button>}
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando termos...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Aceites de termos
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-2xl font-semibold">
                  {termsCount}
                </span>
                <CheckCircle className="text-primary h-5 w-5" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Aceites de privacidade
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-2xl font-semibold">
                  {privacyCount}
                </span>
                <CheckCircle className="text-primary h-5 w-5" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Total de aceites
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-2xl font-semibold">
                  {acceptances.length}
                </span>
                <Clock className="text-primary h-5 w-5" />
              </div>
            </Card>
          </div>

          {acceptances.length > 0 && (
            <Card className="overflow-hidden">
              <table className="divide-border min-w-full divide-y">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Tipo
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Versão
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Aceito em
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {acceptances.slice(0, 10).map((acceptance) => (
                    <tr
                      key={acceptance.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-foreground px-4 py-3 text-sm font-medium">
                        {acceptance.document_type === 'terms'
                          ? 'Termos de uso'
                          : acceptance.document_type === 'privacy'
                            ? 'Privacidade'
                            : acceptance.document_type}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {acceptance.document_version}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {new Date(acceptance.accepted_at).toLocaleDateString(
                          'pt-BR',
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}
    </ModuleWorkspace>
  );
}
