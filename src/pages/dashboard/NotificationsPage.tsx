import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationRepository } from '@/repositories/notification.repository';
import type { Notification } from '@/types/domain/notification';

export default function NotificationsPage() {
  const { currentTenantId, isAdminMaster, tenantMemberships } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchNotifications = async () => {
      try {
        const tenantId =
          currentTenantId || tenantMemberships[0]?.tenant_id || '';
        if (!tenantId && !isAdminMaster) {
          setLoading(false);
          return;
        }

        const data = await notificationRepository.findAll(
          isAdminMaster ? '' : tenantId,
        );

        if (!cancelled) {
          setNotifications(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar notificações',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, [currentTenantId, isAdminMaster, tenantMemberships]);

  return (
    <ModuleWorkspace
      title="Notificações"
      description="Notificações do sistema e do tenant."
      icon={Bell}
      breadcrumbItems={[{ label: 'Notificações' }]}
    >
      {loading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando notificações...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Nenhuma notificação encontrada.
          </p>
        </Card>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
          <table className="divide-border min-w-full divide-y">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Canal
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Assunto
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
              {notifications.map((notification) => (
                <tr
                  key={notification.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="text-foreground px-4 py-3 text-sm font-medium">
                    {notification.channel}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {notification.subject || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                      {notification.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {new Date(notification.created_at).toLocaleDateString(
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
        </div>
      )}
    </ModuleWorkspace>
  );
}

