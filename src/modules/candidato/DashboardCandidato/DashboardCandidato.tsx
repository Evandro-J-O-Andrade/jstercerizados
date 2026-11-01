import { useAuth } from '@/contexts/AuthContext';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { LayoutDashboard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  ProfileSummary,
  ProfileCompletion,
  RecommendedJobs,
  AlertsSummary,
  QuickActions,
  ExperienceTimeline,
  EducationCard,
  SkillsMosaic,
  ApplicationsKanbanPreview,
  DocumentsSummary,
  CandidateAgendaMini,
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
    <div className="flex h-full min-h-0 flex-col bg-slate-50/60">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                Central de Carreira
              </h1>
              <p className="text-sm text-slate-500">
                Olá, {firstName}. Acompanhe sua evolução e oportunidades em um só
                lugar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href="/candidato/buscar-vagas">Buscar vagas</a>
            </Button>
            <Button asChild>
              <a href="/candidato/vagas/recomendadas">
                <Sparkles className="mr-2 h-4 w-4" />
                Vagas recomendadas
              </a>
            </Button>
          </div>
        </div>
      </div>

      <ContentBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        homeRoute={CANDIDATO_HOME}
        emptyTitle="Perfil não encontrado"
        emptyDescription="Complete seu cadastro para acessar sua Central de Carreira."
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px] space-y-6">
            <ProfileSummary />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
              <div className="space-y-6">
                <ProfileCompletion />
                <ExperienceTimeline />
                <EducationCard />
                <SkillsMosaic />
                <ApplicationsKanbanPreview />
                <AlertsSummary />
              </div>
              <div className="space-y-6">
                <RecommendedJobs />
                <CandidateAgendaMini />
                <DocumentsSummary />
                <QuickActions />
              </div>
            </div>
          </div>
        </div>
      </ContentBoundary>
    </div>
  );
}
