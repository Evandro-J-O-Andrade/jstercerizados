import { describe, it, expect } from 'vitest';
import { computeCandidateDashboardTiles } from '@/modules/candidato/DashboardCandidato/dashboard-tiles';
import type { Application } from '@/types/domain/application';
import type { MatchResult } from '@/types/domain/matching';
import type { CandidateContext } from '@/modules/candidato/types/candidate-context';

function makeMatch(score: number): MatchResult {
  return {
    score,
    percentage: score * 0.01,
    breakdown: [],
    reasons: [],
    algorithm_version: '1.0',
  };
}

function makeApp(stage: string): Application {
  return {
    id: `app-${stage}`,
    tenant_id: 't1',
    job_id: 'j1',
    candidate_id: 'c1',
    profile_snapshot: null,
    match_score: null,
    match_details: null,
    source: null,
    current_stage: stage as Application['current_stage'],
    notes: null,
    applied_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  };
}

const emptyContext = {
  applications: [],
  publishedJobs: [],
  favorites: [],
  jobAlerts: [],
  matchResults: [],
  candidate: null,
  candidateContext: null,
};

const EXPECTED_TILE_IDS = [
  'vagas-recomendadas',
  'buscar-vagas',
  'candidaturas',
  'entrevistas',
  'historico',
  'favoritas',
  'curriculo',
  'experiencia',
  'formacao',
  'cursos',
  'habilidades',
  'idiomas',
  'documentos',
  'preferencias',
  'alertas',
  'perfil',
  'notificacoes',
  'configuracoes',
  'conta',
];

const EXPECTED_ROUTES = [
  '/candidato/vagas/recomendadas',
  '/candidato/buscar-vagas',
  '/candidato/candidaturas',
  '/candidato/entrevistas',
  '/candidato/historico',
  '/candidato/favoritas',
  '/candidato/curriculo',
  '/candidato/experiencia',
  '/candidato/formacao',
  '/candidato/cursos',
  '/candidato/habilidades',
  '/candidato/idiomas',
  '/candidato/documentos',
  '/candidato/preferencias',
  '/candidato/alertas',
  '/candidato/perfil',
  '/candidato/notificacoes',
  '/candidato/configuracoes',
  '/candidato/conta',
];

describe('computeCandidateDashboardTiles', () => {
  it('returns 19 tiles with correct IDs and routes', () => {
    const { modules } = computeCandidateDashboardTiles(emptyContext);

    expect(modules).toHaveLength(19);
    expect(modules.map((m) => m.id)).toEqual(EXPECTED_TILE_IDS);
    expect(modules.map((m) => m.route)).toEqual(EXPECTED_ROUTES);
  });

  it('returns tiles with category inicio and scope tenant', () => {
    const { modules } = computeCandidateDashboardTiles(emptyContext);

    modules.forEach((m) => {
      expect(m.category).toBe('inicio');
      expect(m.scope).toBe('tenant');
      expect(m.requiredPermissions).toEqual([]);
    });
  });

  it('computes vagas-recomendadas stats from matchResults and favorites', () => {
    const input = {
      ...emptyContext,
      favorites: [{ id: 'f1', job_id: 'j1' }] as never,
      matchResults: [
        { job: { id: 'j1', title: 'Dev' }, match: makeMatch(85) } as never,
        { job: { id: 'j2', title: 'Designer' }, match: makeMatch(50) } as never,
      ],
    };

    const { stats } = computeCandidateDashboardTiles(input);

    expect(stats['vagas-recomendadas'].itemCount).toBe(2);
    expect(stats['vagas-recomendadas'].primaryMetric).toEqual({
      label: 'Recomendações',
      value: 2,
    });
    expect(stats['vagas-recomendadas'].secondaryMetrics).toEqual([
      { label: 'Match forte', value: 1 },
      { label: 'Favoritas', value: 1 },
    ]);
    expect(stats['vagas-recomendadas'].description).toContain('2 recomendação');
  });

  it('computes buscar-vagas stats from publishedJobs', () => {
    const input = {
      ...emptyContext,
      publishedJobs: [{ id: 'j1' }, { id: 'j2' }] as never,
      favorites: [{ id: 'f1', job_id: 'j1' }] as never,
      matchResults: [
        { job: { id: 'j1' }, match: makeMatch(85) } as never,
        { job: { id: 'j2' }, match: makeMatch(50) } as never,
      ],
    };

    const { stats } = computeCandidateDashboardTiles(input);

    expect(stats['buscar-vagas'].itemCount).toBe(2);
    expect(stats['buscar-vagas'].primaryMetric).toEqual({
      label: 'Disponíveis',
      value: 2,
    });
    expect(stats['buscar-vagas'].secondaryMetrics).toEqual([
      { label: 'Favoritas', value: 1 },
      { label: 'Match forte', value: 1 },
    ]);
  });

  it('computes candidaturas stats with application count and stage breakdown', () => {
    const input = {
      ...emptyContext,
      applications: [
        makeApp('submitted'),
        makeApp('screening'),
        makeApp('interview'),
        makeApp('technical_interview'),
        makeApp('offer'),
        makeApp('hired'),
        makeApp('rejected'),
      ],
    };

    const { stats } = computeCandidateDashboardTiles(input);

    expect(stats.candidaturas.itemCount).toBe(7);
    expect(stats.candidaturas.primaryMetric).toEqual({
      label: 'Enviadas',
      value: 7,
    });
    expect(stats.candidaturas.secondaryMetrics).toEqual([
      { label: 'Screening', value: 1 },
      { label: 'Entrevista', value: 2 },
      { label: 'Oferta', value: 1 },
    ]);
  });

  it('computes entrevistas stats with active interview stages', () => {
    const input = {
      ...emptyContext,
      applications: [
        makeApp('interview'),
        makeApp('technical_interview'),
        makeApp('offer'),
        makeApp('hired'),
      ],
    };

    const { stats } = computeCandidateDashboardTiles(input);

    expect(stats.entrevistas.itemCount).toBe(3);
    expect(stats.entrevistas.primaryMetric).toEqual({
      label: 'Andamento',
      value: 3,
    });
    expect(stats.entrevistas.secondaryMetrics).toEqual([
      { label: 'Entrevista', value: 1 },
      { label: 'Técnica', value: 1 },
      { label: 'Oferta', value: 1 },
    ]);
  });

  it('computes historico stats with terminal stages', () => {
    const input = {
      ...emptyContext,
      applications: [
        makeApp('hired'),
        makeApp('rejected'),
        makeApp('withdrawn'),
        makeApp('interview'),
      ],
    };

    const { stats } = computeCandidateDashboardTiles(input);

    expect(stats.historico.itemCount).toBe(3);
    expect(stats.historico.primaryMetric).toEqual({
      label: 'Finalizadas',
      value: 3,
    });
    expect(stats.historico.secondaryMetrics).toEqual([
      { label: 'Contratado', value: 1 },
      { label: 'Rejeitado', value: 1 },
      { label: 'Arquivado', value: 1 },
    ]);
  });

  it('handles zero applications gracefully', () => {
    const { stats } = computeCandidateDashboardTiles(emptyContext);

    expect(stats.candidaturas.itemCount).toBe(0);
    expect(stats.candidaturas.primaryMetric?.value).toBe(0);
    expect(stats.candidaturas.secondaryMetrics).toEqual([
      { label: 'Screening', value: 0 },
      { label: 'Entrevista', value: 0 },
      { label: 'Oferta', value: 0 },
    ]);
  });

  it('computes favoritas stats with strong match count', () => {
    const input = {
      ...emptyContext,
      favorites: [
        { id: 'f1', job_id: 'j1' },
        { id: 'f2', job_id: 'j2' },
      ] as never,
      matchResults: [
        { job: { id: 'j1' }, match: makeMatch(75) } as never,
        { job: { id: 'j2' }, match: makeMatch(45) } as never,
        { job: { id: 'j3' }, match: makeMatch(90) } as never,
      ],
    };

    const { stats } = computeCandidateDashboardTiles(input);

    expect(stats.favoritas.itemCount).toBe(2);
    expect(stats.favoritas.primaryMetric).toEqual({
      label: 'Favoritas',
      value: 2,
    });
    expect(stats.favoritas.secondaryMetrics).toEqual([
      { label: 'Match forte', value: 2 },
    ]);
  });

  it('computes curriculo stats from candidateContext completionPercentage and profileState', () => {
    const candidateContext: CandidateContext = {
      candidateId: 'c1',
      personId: 'p1',
      tenantId: 't1',
      profileState: 'complete_resume',
      completionPercentage: 95,
      featureAccess: {} as never,
      jobAccessTier: 'early_access',
      isActive: true,
      hasResume: true,
      hasDocuments: true,
      hasPreferences: true,
      isEligibleForMatching: false,
      canBeContactedByRecruiters: true,
    };

    const input = {
      ...emptyContext,
      candidateContext,
    };

    const { stats } = computeCandidateDashboardTiles(input);

    expect(stats.curriculo.primaryMetric).toEqual({
      label: 'Completo',
      value: '95%',
    });
    expect(stats.curriculo.secondaryMetrics).toEqual([
      { label: 'Estado', value: 'Currículo completo' },
    ]);
    expect(stats.curriculo.description).toContain('95%');
    expect(stats.curriculo.description).toContain('Currículo completo');
  });

  it('computes alertas stats with active and total alerts', () => {
    const input = {
      ...emptyContext,
      jobAlerts: [
        { id: 'a1', is_active: true } as never,
        { id: 'a2', is_active: true } as never,
        { id: 'a3', is_active: false } as never,
      ],
    };

    const { stats } = computeCandidateDashboardTiles(input);

    expect(stats.alertas.itemCount).toBe(3);
    expect(stats.alertas.primaryMetric).toEqual({ label: 'Ativos', value: 2 });
    expect(stats.alertas.secondaryMetrics).toEqual([
      { label: 'Total', value: 3 },
    ]);
  });

  it('computes perfil stats from candidateContext', () => {
    const candidateContext: CandidateContext = {
      candidateId: 'c1',
      personId: 'p1',
      tenantId: 't1',
      profileState: 'active_matching',
      completionPercentage: 100,
      featureAccess: {} as never,
      jobAccessTier: 'early_access',
      isActive: true,
      hasResume: true,
      hasDocuments: true,
      hasPreferences: true,
      isEligibleForMatching: true,
      canBeContactedByRecruiters: true,
    };

    const input = {
      ...emptyContext,
      candidateContext,
    };

    const { stats } = computeCandidateDashboardTiles(input);

    expect(stats.perfil.primaryMetric).toEqual({
      label: 'Status',
      value: 'Ativo no matching',
    });
    expect(stats.perfil.secondaryMetrics).toEqual([
      { label: 'Completo', value: '100%' },
    ]);
  });

  it('handles null candidateContext with defaults', () => {
    const { stats } = computeCandidateDashboardTiles(emptyContext);

    expect(stats.curriculo.primaryMetric?.value).toBe('0%');
    expect(stats.curriculo.secondaryMetrics?.[0].value).toBe('Novo');
    expect(stats.perfil.primaryMetric?.value).toBe('Novo');
  });

  it('does not return stats for tiles without real data', () => {
    const { stats } = computeCandidateDashboardTiles(emptyContext);

    expect(stats.notificacoes).toBeUndefined();
    expect(stats.configuracoes).toBeUndefined();
  });

  it('uses strong match threshold of 70', () => {
    const input = {
      ...emptyContext,
      matchResults: [
        { job: { id: 'j1' }, match: makeMatch(70) } as never,
        { job: { id: 'j2' }, match: makeMatch(69) } as never,
        { job: { id: 'j3' }, match: makeMatch(100) } as never,
      ],
    };

    const { stats } = computeCandidateDashboardTiles(input);

    expect(stats['vagas-recomendadas'].secondaryMetrics).toContainEqual({
      label: 'Match forte',
      value: 2,
    });
  });
});

