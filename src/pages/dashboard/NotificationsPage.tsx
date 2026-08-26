import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Bell, Plus } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  tenant_id: string;
  recipient_person_id: string;
  notification_type: string;
  title: string;
  body: string | null;
  status: string;
  category: string;
  priority: string;
  created_at: string;
}

export default function NotificationsPage() {
  const { person, isAdminMaster, tenantMemberships, currentTenantId } =
    useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !person) return;

    const fetchNotifications = async () => {
      try {
        let query = supabase
          .from('notifications')
          .select(
            'id, tenant_id, recipient_person_id, notification_type, title, body, status, category, priority, created_at',
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
        setNotifications(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar notificações',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAdminMaster, currentTenantId, tenantMemberships, person]);

  return (
    <ModuleWorkspace
      title="Notificações"
      description="Notificações do sistema e do tenant."
      icon={Bell}
      breadcrumbItems={[{ label: 'Notificações' }]}
      actions={
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Nova notificação
        </Button>
      }
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando notificações...
        </div>
      ) : error ? (
        <div className="text-destructive text-sm">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
          <p className="text-muted-foreground text-sm">
            Nenhuma notificação encontrada.
          </p>
        </div>
      ) : (
        <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
          <table className="divide-border min-w-full divide-y">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Título
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Tipo
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Prioridade
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Criado em
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-muted/30">
                  <td className="text-foreground px-4 py-3 text-sm font-medium">
                    {notification.title}
                  </td>
                  <td className="text-foreground px-4 py-3 text-sm">
                    {notification.notification_type}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                      {notification.status}
                    </span>
                  </td>
                  <td className="text-foreground px-4 py-3 text-sm">
                    {notification.priority}
                  </td>
                  <td className="text-foreground px-4 py-3 text-sm">
                    {new Date(notification.created_at).toLocaleDateString(
                      'pt-BR',
                    )}
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
