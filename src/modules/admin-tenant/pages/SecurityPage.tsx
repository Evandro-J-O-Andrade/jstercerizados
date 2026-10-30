/**
 * SecurityPage — Gestão de segurança para o proprietário.
 *
 * Permite visualizar configurações de segurança do ambiente.
 * Acesso restrito ao perfil de proprietário.
 */

import { useMemo } from 'react';
import { Shield, Lock, Monitor, Activity } from 'lucide-react';
import { EmptyState } from '@/components/fallback';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityItem {
  id: string;
  name: string;
  description: string;
  status: 'ok' | 'warning' | 'error';
  icon: React.ReactNode;
}

export default function SecurityPage() {
  const { permissions, isAdminMaster } = useAuth();
  const { identity } = useAccount();

  const hasPermission = permissions.some((p: any) => p.name === 'owner.security.read',
  );

  if (!hasPermission && !isAdminMaster) {
    return (
      <div className="p-6 text-center">
        <Shield className="mx-auto h-8 w-8 text-destructive mb-2" />
        <h2 className="text-foreground text-lg font-semibold">
          Acesso não autorizado
        </h2>
        <p className="text-muted-foreground">
          Você não possui permissão para visualizar segurança.
        </p>
      </div>
    );
  }

  const items: SecurityItem[] = useMemo(
    () => [
      {
        id: 'rls',
        name: 'Row Level Security',
        description: 'Políticas de isolamento por tenant ativas',
        status: 'ok',
        icon: <Shield className="h-4 w-4" />,
      },
      {
        id: 'sessions',
        name: 'Sessões ativas',
        description: 'Monitoramento de sessões de usuários',
        status: 'ok',
        icon: <Monitor className="h-4 w-4" />,
      },
      {
        id: 'audit',
        name: 'Log de auditoria',
        description: 'Registro de operações administrativas',
        status: 'ok',
        icon: <Activity className="h-4 w-4" />,
      },
      {
        id: 'encryption',
        name: 'Criptografia',
        description: 'Dados em repouso e em trânsito',
        status: 'ok',
        icon: <Lock className="h-4 w-4" />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">Segurança</h2>
          <p className="text-muted-foreground">
            Gerencie configurações de segurança do ambiente {identity.contextLabel}.
          </p>
        </div>
      </section>

      <div className="border border-border rounded-lg bg-card p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Item
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Descrição
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center">
                    <EmptyState
                      title="Nenhum item de segurança"
                      description="Não há itens de segurança configurados."
                    />
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground text-sm font-medium">
                      {item.icon} {item.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          item.status === 'ok'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.status === 'warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.status}
                      </span>
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
