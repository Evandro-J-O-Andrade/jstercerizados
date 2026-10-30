/**
 * AuditPage — Página de auditoria para o proprietário.
 *
 * Permite visualizar logs de auditoria do ambiente.
 * Acesso restrito ao perfil de proprietário.
 */

import { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { EmptyState } from '@/components/fallback';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  actor: string;
  createdAt: string;
}

export default function AuditPage() {
  const { permissions, isAdminMaster } = useAuth();
  const { identity } = useAccount();

  const hasPermission = permissions.some((p: any) => p.name === 'owner.audit.read',
  );

  if (!hasPermission && !isAdminMaster) {
    return (
      <div className="p-6 text-center">
        <Shield className="mx-auto h-8 w-8 text-destructive mb-2" />
        <h2 className="text-foreground text-lg font-semibold">
          Acesso não autorizado
        </h2>
        <p className="text-muted-foreground">
          Você não possui permissão para visualizar auditoria.
        </p>
      </div>
    );
  }

  const logs: AuditLog[] = useMemo(() => [], []);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">Auditoria</h2>
          <p className="text-muted-foreground">
            Registros de operações no ambiente {identity.contextLabel}.
          </p>
        </div>
      </section>

      <div className="border border-border rounded-lg bg-card p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Ação
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Recurso
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Usuário
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Data/Hora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">
                    <EmptyState
                      title="Nenhum registro de auditoria"
                      description="Não há registros de auditoria neste ambiente."
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground text-sm font-medium">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {log.resource}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {log.actor}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
