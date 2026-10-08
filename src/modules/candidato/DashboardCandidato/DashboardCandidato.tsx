import { useAuth } from '@/contexts/AuthContext';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { LayoutDashboard } from 'lucide-react';
import {
  ProfileSummary,
  ProfileCompletion,
  RecommendedJobs,
  ApplicationsSummary,
  UpcomingInterviews,
  AlertsSummary,
  QuickActions,
} from './components';

const CANDIDATO_HOME = '/candidato';

export default function DashboardCandidato() {
  const { person } = useAuth();
  const { isLoading, error, refetch, candidate } = useCandidato();

  const firstName = person?.full_name?.split(' ')[0] || 'Candidato';

  const status = isLoading
    ? 'loading'
    : error
      ? 'error'
      : !candidate
        ? 'empty'
        : 'success';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border bg-background/50 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-semibold">
                Área do Candidato
              </h1>
              <p className="text-muted-foreground text-sm">
                Olá, {firstName}. Acesse suas ferramentas abaixo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ContentBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        homeRoute={CANDIDATO_HOME}
        emptyTitle="Perfil não encontrado"
        emptyDescription="Complete seu cadastro para acessar o painel do candidato."
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <ProfileSummary />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <RecommendedJobs />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ApplicationsSummary />
                  <UpcomingInterviews />
                </div>
                <AlertsSummary />
              </div>
              <div className="space-y-6">
                <ProfileCompletion />
                <QuickActions />
              </div>
            </div>
          </div>
        </div>
      </ContentBoundary>
    </div>
  );
}
