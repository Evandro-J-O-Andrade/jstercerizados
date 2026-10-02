import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCandidate } from '@/contexts/CandidateContext';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import {
  MetroTileGrid,
  computePuzzleLayout,
} from '@/components/portal/MetroTiles';
import { LayoutDashboard } from 'lucide-react';
import { computeCandidateDashboardTiles } from './candidate-dashboard-tiles';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';
import type { ModuleStats } from '@/lib/module-stats';

export default function CandidateMetroDashboard() {
  const { person } = useAuth();
  const {
    candidate,
    applications,
    publishedJobs,
    favorites,
    jobAlerts,
    matchResults,
    candidateContext,
    isLoading,
    error,
  } = useCandidate();

  const firstName = person?.full_name?.split(' ')[0] || 'Candidato';

  const { modules, stats } = computeCandidateDashboardTiles({
    applications,
    publishedJobs,
    favorites,
    jobAlerts,
    matchResults,
    candidate,
    candidateContext,
  });

  const [tileLayout] = useState<
    Record<string, { x: number; y: number; w: number; h: number }>
  >(() => computePuzzleLayout(modules));

  const [orderedModules, setOrderedModules] =
    useState<ModuleDefinition[]>(modules);
  const [orderedStats] = useState<Record<string, ModuleStats>>(stats);

  const handleReorder = useCallback((newModules: ModuleDefinition[]) => {
    const newLayout = computePuzzleLayout(newModules);
    setOrderedModules(newModules);
    void newLayout;
  }, []);

  if (isLoading) {
    return (
      <ModuleWorkspace
        title="Área do Candidato"
        description="Carregando seus módulos..."
        icon={LayoutDashboard}
        breadcrumbItems={[]}
      >
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-12 text-center">
          <LayoutDashboard className="text-muted-foreground/50 h-12 w-12 animate-pulse" />
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              Carregando...
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Preparando seu portal
            </p>
          </div>
        </div>
      </ModuleWorkspace>
    );
  }

  if (error) {
    return (
      <ModuleWorkspace
        title="Área do Candidato"
        description={error}
        icon={LayoutDashboard}
        breadcrumbItems={[]}
      >
        <div className="border-border flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-12 text-center">
          <LayoutDashboard className="text-muted-foreground/50 h-12 w-12" />
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              Erro ao carregar dados
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">{error}</p>
          </div>
        </div>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title="Área do Candidato"
      description={`Olá, ${firstName}. Acesse suas ferramentas abaixo.`}
      icon={LayoutDashboard}
      breadcrumbItems={[]}
      className="flex h-full flex-col"
    >
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        data-test-wrapper="true"
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          <MetroTileGrid
            modules={orderedModules}
            onReorder={handleReorder}
            tileLayout={tileLayout}
            moduleStats={orderedStats}
            userId={person?.id || ''}
            tenantId={null}
          />
        </div>
      </div>
    </ModuleWorkspace>
  );
}
