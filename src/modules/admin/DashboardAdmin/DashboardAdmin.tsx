/**
 * DashboardAdmin — dashboard próprio da célula de Administração (CHECK BOULER 24H).
 *
 * Cada célula tem seu próprio dashboard, navegação e contexto. Este não é um
 * portal genérico "/dashboard". É a entrada canônica da célula de Administração.
 *
 * Segue o mesmo padrão de DashboardCandidato e DashboardMidia:
 * - ContentBoundary para estados de loading/error/success
 * - Cabeçalho com nome do usuário e ícone
 * - homeRoute apontando para a rota própria do perfil (/admin)
 * - Métricas baseadas em dados reais do contexto
 */

import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { LayoutDashboard, Shield, Users, Building2, Activity } from 'lucide-react';
import { useAdmin } from '@/modules/admin/AdminContext';

const ADMIN_HOME = '/dashboard/admin';

export default function DashboardAdmin() {
  const { stats, isLoading, error, refresh } = useAdmin();

  const status = isLoading ? 'loading' : error ? 'error' : 'success';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border bg-background/50 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-semibold">
                Administração
              </h1>
              <p className="text-muted-foreground text-sm">
                Gestão de tenants, usuários, papéis e módulos da plataforma.
              </p>
            </div>
          </div>
          <button
            onClick={() => void refresh()}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Atualizar administração"
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ContentBoundary
        status={status}
        error={error}
        onRetry={() => void refresh()}
        homeRoute={ADMIN_HOME}
        emptyTitle="Administração indisponível"
        emptyDescription="Não há dados administrativos para este contexto."
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Indicadores */}
            {stats && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-card border-border rounded-xl p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Tenants</p>
                      <p className="text-foreground mt-1 text-2xl font-semibold">
                        {stats?.totalTenants ?? 0}
                      </p>
                    </div>
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div className="bg-card border-border rounded-xl p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Usuários</p>
                      <p className="text-foreground mt-1 text-2xl font-semibold">
                        {stats?.totalUsers ?? 0}
                      </p>
                    </div>
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div className="bg-card border-border rounded-xl p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Papéis</p>
                      <p className="text-foreground mt-1 text-2xl font-semibold">
                        {stats?.totalRoles ?? 0}
                      </p>
                    </div>
                    <Shield className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div className="bg-card border-border rounded-xl p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Sessões ativas</p>
                      <p className="text-foreground mt-1 text-2xl font-semibold">
                        {stats?.activeSessions ?? 0}
                      </p>
                    </div>
                    <Activity className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </div>
            )}

            {/* Atividade recente */}
            <section className="bg-card border-border rounded-xl p-5 border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground text-lg font-semibold">
                  Atividade recente
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                        Ação
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                        Responsável
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                        Data/Hora
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                      {stats?.recentActivity?.length === 0 ? (
                        <tr>
                          <td className="px-4 py-8 text-center text-muted-foreground text-sm">
                            Nenhuma atividade registrada.
                          </td>
                        </tr>
                      ) : (
                        stats?.recentActivity?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <p className="text-foreground text-sm font-medium">
                                {item.action}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-foreground text-sm">{item.actor}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-muted-foreground text-sm">
                                {item.at}
                              </p>
                            </td>
                          </tr>
                        ))
                      )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </ContentBoundary>
    </div>
  );
}
