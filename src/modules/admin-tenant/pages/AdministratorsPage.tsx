/**
 * AdministratorsPage — Gestão de administradores para o proprietário.
 *
 * Permite visualizar e gerenciar administradores do ambiente.
 * Acesso restrito ao perfil de proprietário.
 */

import { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { EmptyState } from '@/components/fallback';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinedAt: string;
}

export default function AdministratorsPage() {
  const { permissions, isAdminMaster } = useAuth();
  const { identity } = useAccount();

  const hasPermission = permissions.some((p: any) => p.name === 'owner.administrators.read',
  );

  if (!hasPermission && !isAdminMaster) {
    return (
      <div className="p-6 text-center">
        <Shield className="mx-auto h-8 w-8 text-destructive mb-2" />
        <h2 className="text-foreground text-lg font-semibold">
          Acesso não autorizado
        </h2>
        <p className="text-muted-foreground">
          Você não possui permissão para visualizar administradores.
        </p>
      </div>
    );
  }

  const admins: AdminRow[] = useMemo(() => [], []);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">Administradores</h2>
          <p className="text-muted-foreground">
            Gerencie os administradores do ambiente {identity.contextLabel}.
          </p>
        </div>
      </section>

      <div className="border border-border rounded-lg bg-card p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Nome
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  E-mail
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Cargo
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Desde
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <EmptyState
                      title="Nenhum administrador cadastrado"
                      description="Não há administradores cadastrados neste ambiente."
                    />
                  </td>
                </tr>
              ) : (
                admins.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground text-sm font-medium">
                      {a.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {a.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {a.role}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          a.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {new Date(a.joinedAt).toLocaleDateString('pt-BR')}
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
