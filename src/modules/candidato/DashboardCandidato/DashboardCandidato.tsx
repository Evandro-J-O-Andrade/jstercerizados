import { useAuth } from '@/contexts/AuthContext';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { LayoutDashboard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
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
    <div className="bg-background flex h-full min-h-0 flex-col">
      <div className="bg-card/95 border-border border-b px-4 py-5 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-semibold tracking-tight">
                Central de Carreira
              </h1>
              <p className="text-muted-foreground text-sm">
                Olá, {firstName}. Acompanhe sua evolução e oportunidades em um
                só lugar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/candidato/buscar-vagas">Buscar vagas</Link>
            </Button>
            <Button asChild>
              <Link to="/candidato/vagas/recomendadas">
                <Sparkles className="mr-2 h-4 w-4" />
                Vagas recomendadas
              </Link>
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
        <div className="flex min-h-0 flex-1 overflow-auto px-3 py-5 sm:px-5 lg:px-6">
          <div className="mx-auto w-full max-w-[1600px] space-y-5">
            <ProfileSummary />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
              <div className="space-y-5">
                <ProfileCompletion />
                <ExperienceTimeline />
                <EducationCard />
                <SkillsMosaic />
                <ApplicationsKanbanPreview />
                <AlertsSummary />
              </div>
              <div className="space-y-5">
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
