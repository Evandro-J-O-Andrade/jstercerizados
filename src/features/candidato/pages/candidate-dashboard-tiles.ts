import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';
import type { ModuleStats } from '@/lib/module-stats';
import type { Application } from '@/types/domain/application';
import type {
  PublishedJobWithSkills,
  FavoriteJobWithJob,
  CandidateJobAlertRow,
} from '@/repositories/candidate-portal';
import type { MatchResult } from '@/types/domain/matching';
import type { Candidate } from '@/types/domain/candidate';
import type { CandidateContext } from '@/types/domain/candidate-context';

export interface CandidateDashboardInput {
  applications: Application[];
  publishedJobs: PublishedJobWithSkills[];
  favorites: FavoriteJobWithJob[];
  jobAlerts: CandidateJobAlertRow[];
  matchResults: Array<{ job: PublishedJobWithSkills; match: MatchResult }>;
  candidate: Candidate | null;
  candidateContext: CandidateContext | null;
}

const STRONG_MATCH_THRESHOLD = 70;

export function computeCandidateDashboardTiles(
  input: CandidateDashboardInput,
): { modules: ModuleDefinition[]; stats: Record<string, ModuleStats> } {
  const {
    applications,
    publishedJobs,
    favorites,
    jobAlerts,
    matchResults,
    candidateContext,
  } = input;

  const applicationsByStage = applications.reduce(
    (acc, app) => {
      const stage = app.current_stage;
      acc[stage] = (acc[stage] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const strongMatchCount = matchResults.filter(
    (m) => m.match.score >= STRONG_MATCH_THRESHOLD,
  ).length;

  const activeAlertsCount = jobAlerts.filter((a) => a.is_active).length;
  const totalAlertsCount = jobAlerts.length;

  const completionPercentage = candidateContext?.completionPercentage ?? 0;
  const profileState = candidateContext?.profileState ?? 'new';
  const profileStateLabel = getProfileStateLabel(profileState);
  const profileStateDescription = getProfileStateDescription(profileState);

  const publishedJobsCount = publishedJobs.length;
  const favoritesCount = favorites.length;
  const applicationsCount = applications.length;

  const modules: ModuleDefinition[] = [
    {
      id: 'vagas',
      title: 'Vagas',
      description: 'Encontre oportunidades alinhadas ao seu perfil',
      icon: 'briefcase',
      route: '/candidato/vagas',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'candidaturas',
      title: 'Minhas Candidaturas',
      description: 'Acompanhe o andamento das suas inscrições',
      icon: 'file-text',
      route: '/candidato/candidaturas',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'favoritas',
      title: 'Vagas Favoritas',
      description: 'Vagas salvas para referência rápida',
      icon: 'heart',
      route: '/candidato/favoritas',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'curriculo',
      title: 'Meu Currículo',
      description: 'Complete seu perfil para mais oportunidades',
      icon: 'file-signature',
      route: '/candidato/curriculo',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'alertas',
      title: 'Alertas de Vagas',
      description: 'Receba notificações de novas oportunidades',
      icon: 'bell',
      route: '/candidato/alertas',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'perfil',
      title: 'Meu Perfil',
      description: 'Dados pessoais e profissionais',
      icon: 'user-check',
      route: '/candidato/perfil',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'notificacoes',
      title: 'Notificações',
      description: 'Acesse suas notificações e atualizações',
      icon: 'mail',
      route: '/candidato/notificacoes',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'configuracoes',
      title: 'Configurações',
      description: 'Gerencie sua conta e preferências',
      icon: 'settings',
      route: '/candidato/configuracoes',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
  ];

  const stats: Record<string, ModuleStats> = {
    vagas: {
      description: `Disponíveis ${publishedJobsCount} vagas, ${favoritesCount} favoritas e ${strongMatchCount} com match forte.`,
      itemCount: publishedJobsCount + favoritesCount + strongMatchCount,
      primaryMetric: { label: 'Vagas', value: publishedJobsCount },
      secondaryMetrics: [
        { label: 'Favoritas', value: favoritesCount },
        { label: 'Match forte', value: strongMatchCount },
      ],
    },
    candidaturas: {
      description: `Você enviou ${applicationsCount} candidaturas.`,
      itemCount: applicationsCount,
      primaryMetric: { label: 'Enviadas', value: applicationsCount },
      secondaryMetrics: [
        {
          label: 'Screening',
          value: applicationsByStage['screening'] ?? 0,
        },
        {
          label: 'Entrevista',
          value:
            (applicationsByStage['interview'] ?? 0) +
            (applicationsByStage['technical_interview'] ?? 0),
        },
        {
          label: 'Oferta',
          value: applicationsByStage['offer'] ?? 0,
        },
      ],
    },
    favoritas: {
      description: `${favoritesCount} vagas salvas como favoritas.`,
      itemCount: favoritesCount,
      primaryMetric: { label: 'Favoritas', value: favoritesCount },
      secondaryMetrics: [{ label: 'Match forte', value: strongMatchCount }],
    },
    curriculo: {
      description: `Seu perfil está ${completionPercentage}% completo (${profileStateLabel}).`,
      itemCount: completionPercentage,
      primaryMetric: { label: 'Completo', value: `${completionPercentage}%` },
      secondaryMetrics: [{ label: 'Estado', value: profileStateLabel }],
    },
    alertas: {
      description: `${activeAlertsCount} alertas ativos de ${totalAlertsCount} cadastrados.`,
      itemCount: totalAlertsCount,
      primaryMetric: { label: 'Ativos', value: activeAlertsCount },
      secondaryMetrics: [{ label: 'Total', value: totalAlertsCount }],
    },
    perfil: {
      description: profileStateDescription,
      itemCount: completionPercentage,
      primaryMetric: { label: 'Status', value: profileStateLabel },
      secondaryMetrics: [
        { label: 'Completo', value: `${completionPercentage}%` },
      ],
    },
  };

  return { modules, stats };
}

function getProfileStateLabel(state: string): string {
  const labels: Record<string, string> = {
    new: 'Novo',
    incomplete_registration: 'Cadastro incompleto',
    basic_profile: 'Perfil básico',
    complete_profile: 'Perfil completo',
    complete_resume: 'Currículo completo',
    active_matching: 'Ativo no matching',
  };
  return labels[state] ?? state;
}

function getProfileStateDescription(state: string): string {
  const descriptions: Record<string, string> = {
    new: 'Candidato recém-criado, sem dados de perfil.',
    incomplete_registration: 'Candidato iniciou cadastro mas não concluiu.',
    basic_profile: 'Candidato completou dados pessoais básicos.',
    complete_profile: 'Candidato completou perfil profissional.',
    complete_resume: 'Candidato enviou currículo e documentos.',
    active_matching: 'Candidato com perfil completo e ativo para matching.',
  };
  return descriptions[state] ?? 'Status desconhecido';
}
