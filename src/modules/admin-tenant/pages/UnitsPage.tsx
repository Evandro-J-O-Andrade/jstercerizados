/**
 * UnitsPage — Gestão de unidades para o proprietário.
 *
 * Permite visualizar e gerenciar unidades operacionais do ambiente.
 * Acesso restrito ao perfil de proprietário.
 */

import { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { EmptyState } from '@/components/fallback';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';

interface UnitRow {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  city: string;
  state: string;
}

export default function UnitsPage() {
  const { permissions, isAdminMaster } = useAuth();
  const { identity } = useAccount();

  const hasPermission = permissions.some((p: any) => p.name === 'owner.units.read',
  );

  if (!hasPermission && !isAdminMaster) {
    return (
      <div className="p-6 text-center">
        <Shield className="mx-auto h-8 w-8 text-destructive mb-2" />
        <h2 className="text-foreground text-lg font-semibold">
          Acesso não autorizado
        </h2>
        <p className="text-muted-foreground">
          Você não possui permissão para visualizar unidades.
        </p>
      </div>
    );
  }

  const units: UnitRow[] = useMemo(() => [], []);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">Unidades</h2>
          <p className="text-muted-foreground">
            Gerencie as unidades operacionais do ambiente {identity.contextLabel}.
          </p>
        </div>
      </section>

      <div className="border border-border rounded-lg bg-card p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Unidade
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Código
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Localização
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {units.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <EmptyState
                      title="Nenhuma unidade cadastrada"
                      description="Não há unidades operacionais cadastradas neste ambiente."
                    />
                  </td>
                </tr>
              ) : (
                units.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground text-sm font-medium">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {u.code}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {u.city}, {u.state}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {u.status}
                      </span>
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
