import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { BarChart3, Activity } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

interface DomainEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
}

export default function GestaoSaaSPage() {
  const [events, setEvents] = useState<DomainEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchEvents = async () => {
      try {
        const { data } = await supabase
          .from('domain_events')
          .select('id, event_type, description, created_at')
          .order('created_at', { ascending: false })
          .limit(20);
        setEvents(data || []);
      } catch (error) {
        console.error('[GESTAO_SAAS] Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <ModuleWorkspace
      title="Gestão SaaS"
      description="Métricas, crescimento e saúde da plataforma."
      icon={BarChart3}
      breadcrumbItems={[
        { label: 'Gestão SaaS', href: '/dashboard/gestao-saas' },
      ]}
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando métricas...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Eventos recentes
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-2xl font-semibold">
                  {events.length}
                </span>
                <Activity className="text-primary h-5 w-5" />
              </div>
            </Card>
          </div>

          {events.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-border border-b px-4 py-3">
                <h3 className="text-foreground text-sm font-semibold">
                  Eventos recentes da plataforma
                </h3>
              </div>
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
                  {events.slice(0, 10).map((event) => (
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
                        {new Date(event.created_at).toLocaleDateString(
                          'pt-BR',
                          {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
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
