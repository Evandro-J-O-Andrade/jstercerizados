/**
 * SettingsPage — Configurações para o proprietário.
 *
 * Permite visualizar e gerenciar configurações do ambiente.
 * Acesso restrito ao perfil de proprietário.
 */

import { useMemo } from 'react';
import { Shield, Globe, Mail } from 'lucide-react';
import { EmptyState } from '@/components/fallback';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';

interface SettingItem {
  id: string;
  name: string;
  description: string;
  category: 'geral' | 'seguranca' | 'integracao';
  icon: React.ReactNode;
}

export default function SettingsPage() {
  const { permissions, isAdminMaster } = useAuth();
  const { identity } = useAccount();

  const hasPermission = permissions.some((p: any) => p.name === 'owner.settings.read',
  );

  if (!hasPermission && !isAdminMaster) {
    return (
      <div className="p-6 text-center">
        <Shield className="mx-auto h-8 w-8 text-destructive mb-2" />
        <h2 className="text-foreground text-lg font-semibold">
          Acesso não autorizado
        </h2>
        <p className="text-muted-foreground">
          Você não possui permissão para visualizar configurações.
        </p>
      </div>
    );
  }

  const settings: SettingItem[] = useMemo(
    () => [
      {
        id: 'geral',
        name: 'Configurações Gerais',
        description: 'Nome, região e fuso horário do ambiente',
        category: 'geral',
        icon: <Globe className="h-4 w-4" />,
      },
      {
        id: 'seguranca',
        name: 'Segurança',
        description: 'Políticas de acesso e autenticação',
        category: 'seguranca',
        icon: <Shield className="h-4 w-4" />,
      },
      {
        id: 'integracao',
        name: 'Integrações',
        description: 'Webhooks, APIs e serviços externos',
        category: 'integracao',
        icon: <Mail className="h-4 w-4" />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie configurações do ambiente {identity.contextLabel}.
          </p>
        </div>
      </section>

      <div className="border border-border rounded-lg bg-card p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Configuração
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Descrição
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Categoria
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {settings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">
                    <EmptyState
                      title="Nenhuma configuração disponível"
                      description="Não há configurações cadastradas neste ambiente."
                    />
                  </td>
                </tr>
              ) : (
                settings.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground text-sm font-medium">
                      {s.icon} {s.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {s.description}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {s.category}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <button className="text-primary hover:text-primary/80 transition-colors">
                        Editar
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
