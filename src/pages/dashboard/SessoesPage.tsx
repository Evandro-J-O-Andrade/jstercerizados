import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Monitor, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

interface Session {
  id: string;
  tenant_id: string;
  person_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export default function SessoesPage() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchSessions = async () => {
      try {
        const tenantId = currentTenantId;
        if (!tenantId && !isAdminMaster) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error('[SESSOES] Failed to load sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [currentTenantId, isAdminMaster]);

  const handleRevoke = async (sessionId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error('[SESSOES] Failed to revoke session:', error);
    }
  };

  return (
    <ModuleWorkspace
      title="Sessões"
      description="Gerencie sessões ativas do tenant."
      icon={Monitor}
      breadcrumbItems={[{ label: 'Sessões', href: '/dashboard/sessoes' }]}
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando sessões...
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-border border-b px-4 py-3">
            <h3 className="text-foreground text-sm font-semibold">
              Sessões ativas
            </h3>
          </div>
          <table className="divide-border min-w-full divide-y">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Token
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Expiração
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Criada em
                </th>
                <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-muted-foreground px-4 py-6 text-center text-sm"
                  >
                    Nenhuma sessão encontrada.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {session.token}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {new Date(session.expires_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {new Date(session.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRevoke(session.id)}
                        className="text-destructive hover:text-destructive/80 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Encerrar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </ModuleWorkspace>
  );
}
