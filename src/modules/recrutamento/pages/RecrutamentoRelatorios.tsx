import { ModuleWorkspace } from '@/components/legacy/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BarChart2, FileCheck } from 'lucide-react';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';

export default function RecrutamentoRelatorios() {
  const {
    dashboardStats,
    applicationsEnriched,
    isLoading,
    error,
    refetch,
  } = useRecrutamento();

  return (
    <ModuleWorkspace
      title="Relatórios"
      description="Relatórios do módulo de recrutamento"
      icon={BarChart2}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Relatórios' }]}
    >
      {isLoading ? (
        <div
          className="flex h-64 items-center justify-center"
          role="status"
          aria-busy="true"
        >
          <LoadingSpinner size="sm" />
          <span className="sr-only">Carregando relatórios…</span>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={() => void refetch()}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : dashboardStats ? (
        <div className="space-y-6">
          <section
            aria-label="Indicadores de recrutamento"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <Card className="p-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Vagas publicadas
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {dashboardStats.jobs.published}
              </p>
              <p className="text-muted-foreground text-xs">
                {dashboardStats.jobs.total} vagas no total
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Candidatos ativos
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {dashboardStats.candidates.active}
              </p>
              <p className="text-muted-foreground text-xs">
                {dashboardStats.candidates.new_this_month} novos neste mês
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Candidaturas recebidas
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {dashboardStats.applications.total}
              </p>
              <p className="text-muted-foreground text-xs">
                {dashboardStats.applications.new_today} recebidas hoje
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Processos abertos
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {dashboardStats.processes.open +
                  dashboardStats.processes.in_progress}
              </p>
              <p className="text-muted-foreground text-xs">
                {dashboardStats.processes.total} processos no total
              </p>
            </Card>
          </section>

          <section aria-label="Candidaturas recentes">
            <h2 className="mb-3 text-lg font-semibold">Candidaturas recentes</h2>
            {applicationsEnriched.length === 0 ? (
              <Card className="py-10 text-center">
                <FileCheck className="text-muted-foreground/50 mx-auto h-10 w-10" />
                <p className="mt-3 font-medium">Nenhuma candidatura registrada</p>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Candidato</th>
                      <th className="px-4 py-3 font-medium">Vaga</th>
                      <th className="px-4 py-3 font-medium">Etapa</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Recebida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {applicationsEnriched.slice(0, 20).map((application) => (
                      <tr key={application.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">
                            {application.candidate_name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {application.candidate_email}
                          </p>
                        </td>
                        <td className="px-4 py-3">{application.job_title}</td>
                        <td className="text-muted-foreground px-4 py-3">
                          {application.stage_name || '—'}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {application.status.replace(/_/g, ' ')}
                        </td>
                        <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                          {new Date(application.applied_at).toLocaleDateString(
                            'pt-BR',
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : (
        <Card className="py-12 text-center">
          <BarChart2 className="text-muted-foreground/50 mx-auto h-12 w-12" />
          <h2 className="mt-4 text-lg font-medium">
            Indicadores indisponíveis
          </h2>
          <p className="text-muted-foreground mt-2">
            Não há dados de recrutamento para este tenant.
          </p>
        </Card>
      )}
    </ModuleWorkspace>
  );
}
