/**
 * TenantsPage — Gestão de tenants para o proprietário.
 *
 * Lista e permite gerenciar os tenants cadastrados no ambiente J&S.
 * Acesso restrito ao perfil de proprietário.
 */

import { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { EmptyState } from '@/components/fallback';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';

interface TenantRow {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  personCount: number;
}

export default function TenantsPage() {
  const { permissions, isAdminMaster } = useAuth();
  const { identity } = useAccount();

  const hasPermission = permissions.some((p: any) => p.name === 'owner.tenants.read',
  );

  if (!hasPermission && !isAdminMaster) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
        <h2 className="text-foreground text-lg font-semibold">
          Acesso não autorizado
        </h2>
        <p className="text-muted-foreground">
          Você não possui permissão para visualizar tenants.
        </p>
      </div>
    );
  }

  const mockTenants: TenantRow[] = useMemo(() => [], []);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">Tenants</h2>
          <p className="text-muted-foreground">
            Gerencie os tenants do ambiente {identity.contextLabel}.
          </p>
        </div>
      </section>

      <div className="border border-border rounded-lg bg-card p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Tenant
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Criado em
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Pessoas
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <EmptyState
                      title="Nenhum tenant cadastrado"
                      description="Não há tenants cadastrados neste ambiente."
                    />
                  </td>
                </tr>
              ) : (
                mockTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground text-sm font-medium">
                      {t.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          t.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : t.status === 'inactive'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {t.personCount}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button className="text-primary hover:text-primary/80 transition-colors">
                        Detalhes
                      </button>
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
