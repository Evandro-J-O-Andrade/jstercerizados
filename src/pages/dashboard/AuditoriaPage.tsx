import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { auditLogRepository } from '@/repositories/audit.repository';
import { securityEventRepository } from '@/repositories/security.repository';
import type { AuditLog } from '@/types/domain/security';
import type { SecurityEvent } from '@/types/domain/security';

export default function AuditoriaPage() {
  const { isAdminMaster, tenantMemberships, currentTenantId } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const tenantId =
          currentTenantId || tenantMemberships[0]?.tenant_id || '';

        if (isAdminMaster && tenantId) {
          const [logs, events] = await Promise.all([
            auditLogRepository.findAll(tenantId),
            securityEventRepository.findAll(tenantId),
          ]);

          if (!cancelled) {
            setAuditLogs(logs);
            setSecurityEvents(events);
          }
        } else if (tenantId) {
          const logs = await auditLogRepository.findAll(tenantId);
          if (!cancelled) {
            setAuditLogs(logs);
          }
        }
      } catch (error) {
        console.error('[AUDITORIA] Failed to load:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
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
          Carregando auditoria...
        </div>
      ) : (
        <div className="space-y-6">
          {isAdminMaster && securityEvents.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-border border-b px-4 py-3">
                <h3 className="text-foreground text-sm font-semibold">
                  Eventos de segurança
                </h3>
              </div>
              <table className="divide-border min-w-full divide-y">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Evento
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      IP
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {securityEvents.slice(0, 50).map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-foreground px-4 py-3 text-sm font-medium">
                        {event.event_type}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {event.ip || '—'}
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

          <Card className="overflow-hidden">
            <div className="border-border border-b px-4 py-3">
              <h3 className="text-foreground text-sm font-semibold">
                Logs de auditoria
              </h3>
            </div>
            {auditLogs.length === 0 ? (
              <div className="p-6">
                <p className="text-muted-foreground text-sm">
                  Nenhum log de auditoria encontrado.
                </p>
              </div>
            ) : (
              <table className="divide-border min-w-full divide-y">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Ação
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Recurso
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Escopo
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {auditLogs.slice(0, 50).map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-foreground px-4 py-3 text-sm font-medium">
                        {log.action}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {log.entity_type}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {log.scope}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {new Date(log.created_at).toLocaleDateString('pt-BR', {
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
            )}
          </Card>
        </div>
      )}
    </ModuleWorkspace>
  );
}
