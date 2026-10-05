import { useAuth } from '@/contexts/AuthContext';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import {
  MetroTileGrid,
  computePuzzleLayout,
} from '@/components/portal/MetroTiles';
import { LayoutDashboard } from 'lucide-react';
import { useMemo, useCallback } from 'react';
import { computeCandidateDashboardTiles } from './dashboard-tiles';

const CANDIDATO_HOME = '/candidato';

export default function DashboardCandidato() {
  const { person } = useAuth();
  const {
    applications,
    publishedJobs,
    favorites,
    jobAlerts,
    matchResults,
    candidate,
    candidateContext,
    isLoading,
    error,
    refetch,
  } = useCandidato();

  const firstName = person?.full_name?.split(' ')[0] || 'Candidato';

  const { modules, stats } = useMemo(
    () =>
      computeCandidateDashboardTiles({
        applications,
        publishedJobs,
        favorites,
        jobAlerts,
        matchResults,
        candidate,
        candidateContext,
      }),
    [
      applications,
      publishedJobs,
      favorites,
      jobAlerts,
      matchResults,
      candidate,
      candidateContext,
    ],
  );

  const tileLayout = useMemo(() => computePuzzleLayout(modules), [modules]);

  const handleReorder = useCallback(() => {
    // MetroTileGrid já persiste a ordem em localStorage. Não há estado
    // externo a sincronizar aqui.
  }, []);

  const status = isLoading
    ? 'loading'
    : error
      ? 'error'
      : modules.length === 0
        ? 'empty'
        : 'success';

  return (
    <ModuleWorkspace
      title="Área do Candidato"
      description={`Olá, ${firstName}. Acesse suas ferramentas abaixo.`}
      icon={LayoutDashboard}
      breadcrumbItems={[]}
      homeRoute={CANDIDATO_HOME}
      className="flex h-full min-h-0 flex-col"
    >
      <ContentBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        homeRoute={CANDIDATO_HOME}
        emptyTitle="Nenhuma ferramenta disponível"
        emptyDescription="Seu perfil ainda não possui módulos liberados."
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          <MetroTileGrid
            modules={modules}
            onReorder={handleReorder}
            tileLayout={tileLayout}
            moduleStats={stats}
            userId={person?.id || ''}
            tenantId={null}
          />
        </div>
      </ContentBoundary>
    </ModuleWorkspace>
  );
}