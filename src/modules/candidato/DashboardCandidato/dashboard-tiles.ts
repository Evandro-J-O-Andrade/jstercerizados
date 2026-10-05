import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';
import type { ModuleStats } from '@/lib/module-stats';
import type { Application } from '@/types/domain/application';
import type {
  PublishedJobWithSkills,
  FavoriteJobWithJob,
  CandidateJobAlertRow,
} from '@/modules/candidato/repositories/candidate-portal';
import type { MatchResult } from '@/types/domain/matching';
import type { Candidate } from '@/modules/candidato/types/candidate';
import type { CandidateContext } from '@/modules/candidato/types/candidate-context';

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

const INTERVIEW_STAGES = ['interview', 'technical_interview', 'presentation', 'offer'];
const TERMINAL_STAGES = ['hired', 'rejected', 'withdrawn'];

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

export function computeCandidateDashboardTiles(
  input: CandidateDashboardInput,
): { modules: ModuleDefinition[]; stats: Record<string, ModuleStats> } {
  const {
    applications,
    publishedJobs,
    favorites,
    jobAlerts,
    matchResults,
    candidate,
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
  const interviewCount = INTERVIEW_STAGES.reduce(
    (sum, s) => sum + (applicationsByStage[s] ?? 0),
    0,
  );
  const historyCount = TERMINAL_STAGES.reduce(
    (sum, s) => sum + (applicationsByStage[s] ?? 0),
    0,
  );
  const matchCount = matchResults.length;

  const experiencesCount = candidate?.experiences?.length ?? 0;
  const educationCount = candidate?.education?.length ?? 0;
  const coursesCount = candidate?.courses?.length ?? 0;
  const skillsCount = candidate?.skills?.length ?? 0;
  const languagesCount = candidate?.languages?.length ?? 0;
  const documentsCount = candidate?.documents?.length ?? 0;

  const modules: ModuleDefinition[] = [
    {
      id: 'vagas-recomendadas',
      title: 'Vagas Recomendadas',
      description: `Baseado no seu perfil, ${matchCount} oportunidades foram encontradas`,
      icon: 'sparkles',
      route: '/candidato/vagas/recomendadas',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'buscar-vagas',
      title: 'Buscar Vagas',
      description: 'Pesquise oportunidades por cargo, empresa ou localização',
      icon: 'search',
      route: '/candidato/buscar-vagas',
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
      id: 'entrevistas',
      title: 'Entrevistas',
      description: `${interviewCount} processo(s) em andamento exigem sua atenção`,
      icon: 'clock',
      route: '/candidato/entrevistas',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'historico',
      title: 'Histórico de Candidaturas',
      description: `${historyCount} candidatura(s) finalizada(s)`,
      icon: 'history',
      route: '/candidato/historico',
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
      id: 'experiencia',
      title: 'Experiências',
      description: `${experiencesCount} experiência(s) profissional(is) cadastrada(s)`,
      icon: 'briefcase',
      route: '/candidato/experiencia',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'formacao',
      title: 'Formação',
      description: `${educationCount} formação(ões) acadêmica(s)`,
      icon: 'graduation-cap',
      route: '/candidato/formacao',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'cursos',
      title: 'Cursos',
      description: `${coursesCount} curso(s) e capacitação(ões)`,
      icon: 'award',
      route: '/candidato/cursos',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'habilidades',
      title: 'Habilidades',
      description: `${skillsCount} competência(s) técnica(s)`,
      icon: 'sparkles',
      route: '/candidato/habilidades',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'idiomas',
      title: 'Idiomas',
      description: `${languagesCount} idioma(s) cadastrado(s)`,
      icon: 'languages',
      route: '/candidato/idiomas',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'documentos',
      title: 'Documentos',
      description: `${documentsCount} documento(s) enviado(s)`,
      icon: 'file-text',
      route: '/candidato/documentos',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
    {
      id: 'preferencias',
      title: 'Preferências',
      description: 'Configurações para receber vagas compatíveis',
      icon: 'target',
      route: '/candidato/preferencias',
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
    {
      id: 'conta',
      title: 'Minha Conta',
      description: 'Informações pessoais e dados da sua conta',
      icon: 'user-check',
      route: '/candidato/conta',
      category: 'inicio',
      requiredPermissions: [],
      scope: 'tenant',
    },
  ];

  const stats: Record<string, ModuleStats> = {
    'vagas-recomendadas': {
      description: `${matchCount} recomendação(ões), ${strongMatchCount} com match forte.`,
      itemCount: matchCount,
      primaryMetric: { label: 'Recomendações', value: matchCount },
      secondaryMetrics: [
        { label: 'Match forte', value: strongMatchCount },
        { label: 'Favoritas', value: favoritesCount },
      ],
    },
    'buscar-vagas': {
      description: `${publishedJobsCount} vagas disponíveis para busca.`,
      itemCount: publishedJobsCount,
      primaryMetric: { label: 'Disponíveis', value: publishedJobsCount },
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
    entrevistas: {
      description: `${interviewCount} processo(s) em andamento.`,
      itemCount: interviewCount,
      primaryMetric: { label: 'Andamento', value: interviewCount },
      secondaryMetrics: [
        { label: 'Entrevista', value: applicationsByStage['interview'] ?? 0 },
        {
          label: 'Técnica',
          value: applicationsByStage['technical_interview'] ?? 0,
        },
        { label: 'Oferta', value: applicationsByStage['offer'] ?? 0 },
      ],
    },
    historico: {
      description: `${historyCount} candidatura(s) finalizada(s).`,
      itemCount: historyCount,
      primaryMetric: { label: 'Finalizadas', value: historyCount },
      secondaryMetrics: [
        { label: 'Contratado', value: applicationsByStage['hired'] ?? 0 },
        { label: 'Rejeitado', value: applicationsByStage['rejected'] ?? 0 },
        { label: 'Arquivado', value: applicationsByStage['withdrawn'] ?? 0 },
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
    experiencia: {
      description: `${experiencesCount} experiência(s) profissional(is).`,
      itemCount: experiencesCount,
      primaryMetric: { label: 'Total', value: experiencesCount },
      secondaryMetrics: [],
    },
    formacao: {
      description: `${educationCount} formação(ões) acadêmica(s).`,
      itemCount: educationCount,
      primaryMetric: { label: 'Total', value: educationCount },
      secondaryMetrics: [],
    },
    cursos: {
      description: `${coursesCount} curso(s) e capacitação(ões).`,
      itemCount: coursesCount,
      primaryMetric: { label: 'Total', value: coursesCount },
      secondaryMetrics: [],
    },
    habilidades: {
      description: `${skillsCount} competência(s) técnica(s).`,
      itemCount: skillsCount,
      primaryMetric: { label: 'Total', value: skillsCount },
      secondaryMetrics: [],
    },
    idiomas: {
      description: `${languagesCount} idioma(s) cadastrado(s).`,
      itemCount: languagesCount,
      primaryMetric: { label: 'Total', value: languagesCount },
      secondaryMetrics: [],
    },
    documentos: {
      description: `${documentsCount} documento(s) enviado(s).`,
      itemCount: documentsCount,
      primaryMetric: { label: 'Total', value: documentsCount },
      secondaryMetrics: [],
    },
    preferencias: {
      description: 'Configurações de vaga e matching.',
      itemCount: 1,
      primaryMetric: { label: 'Configuradas', value: candidateContext?.hasPreferences ? 'Sim' : 'Não' },
      secondaryMetrics: [],
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
    conta: {
      description: 'Informações pessoais e dados da sua conta.',
      itemCount: 1,
      primaryMetric: { label: 'Status', value: candidate?.status ?? '—' },
      secondaryMetrics: [],
    },
  };

  return { modules, stats };
}


