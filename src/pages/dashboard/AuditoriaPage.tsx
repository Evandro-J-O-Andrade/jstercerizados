import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { FileText } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DomainEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
}

export default function AuditoriaPage() {
  const { isAdminMaster, tenantMemberships, currentTenantId } = useAuth();
  const [events, setEvents] = useState<DomainEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchEvents = async () => {
      try {
        let query = supabase
          .from('domain_events')
          .select('id, event_type, description, created_at')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!isAdminMaster) {
          const activeTenantId =
            currentTenantId || tenantMemberships[0]?.tenant_id;
          if (activeTenantId) {
            query = query.eq('tenant_id', activeTenantId);
          }
        }

        const { data } = await query;
        setEvents(data || []);
      } catch (error) {
        console.error('[AUDITORIA] Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isAdminMaster, currentTenantId, tenantMemberships]);

  return (
    <ModuleWorkspace
      title="Auditoria"
      description="Logs e eventos do sistema."
      icon={FileText}
      breadcrumbItems={[{ label: 'Auditoria', href: '/dashboard/auditoria' }]}
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando eventos...
        </div>
      ) : events.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">
            Nenhum evento de auditoria encontrado.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="divide-border min-w-full divide-y">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Tipo
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Descrição
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="text-foreground px-4 py-3 text-sm font-medium">
                    {event.event_type}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {event.description || '—'}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {new Date(event.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </ModuleWorkspace>
  );
}
