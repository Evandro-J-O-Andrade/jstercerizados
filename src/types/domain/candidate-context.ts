export type CandidateProfileState =
  | 'new'
  | 'incomplete_registration'
  | 'basic_profile'
  | 'complete_profile'
  | 'complete_resume'
  | 'active_matching';

export interface CandidateProfileStateInfo {
  state: CandidateProfileState;
  label: string;
  description: string;
  requiredCompletion: number;
}

export const CANDIDATE_PROFILE_STATES: Record<
  CandidateProfileState,
  CandidateProfileStateInfo
> = {
  new: {
    state: 'new',
    label: 'Novo',
    description: 'Candidato recém-criado, sem dados de perfil.',
    requiredCompletion: 0,
  },
  incomplete_registration: {
    state: 'incomplete_registration',
    label: 'Cadastro incompleto',
    description: 'Candidato iniciou cadastro mas não concluiu.',
    requiredCompletion: 25,
  },
  basic_profile: {
    state: 'basic_profile',
    label: 'Perfil básico',
    description: 'Candidato completou dados pessoais básicos.',
    requiredCompletion: 50,
  },
  complete_profile: {
    state: 'complete_profile',
    label: 'Perfil completo',
    description: 'Candidato completou perfil profissional.',
    requiredCompletion: 75,
  },
  complete_resume: {
    state: 'complete_resume',
    label: 'Currículo completo',
    description: 'Candidato enviou currículo e documentos.',
    requiredCompletion: 90,
  },
  active_matching: {
    state: 'active_matching',
    label: 'Ativo no matching',
    description: 'Candidato com perfil completo e ativo para matching.',
    requiredCompletion: 100,
  },
};

export type JobAccessTier = 'public' | 'internal' | 'early_access';

export interface JobAccessTierInfo {
  tier: JobAccessTier;
  label: string;
  description: string;
  requiresProfileState: CandidateProfileState;
}

export const JOB_ACCESS_TIERS: Record<JobAccessTier, JobAccessTierInfo> = {
  public: {
    tier: 'public',
    label: 'Vaga pública',
    description: 'Visível para todos os candidatos e visitantes.',
    requiresProfileState: 'new',
  },
  internal: {
    tier: 'internal',
    label: 'Vaga interna',
    description: 'Visível apenas para usuários autenticados do sistema.',
    requiresProfileState: 'incomplete_registration',
  },
  early_access: {
    tier: 'early_access',
    label: 'Acesso antecipado',
    description: 'Visível apenas para candidatos elegíveis antes da publicação geral.',
    requiresProfileState: 'complete_resume',
  },
};

export interface FeatureAccess {
  canViewPublishedJobs: boolean;
  canViewInternalJobs: boolean;
  canViewEarlyAccessJobs: boolean;
  canApplyToJobs: boolean;
  canSaveFavorites: boolean;
  canReceiveRecommendations: boolean;
  canReceiveAlerts: boolean;
  canAccessAdvancedMatching: boolean;
  canViewUnpublishedOpportunities: boolean;
  canAccessCourses: boolean;
  canAccessCareerGuidance: boolean;
  canViewPersonalizedContent: boolean;
}

export interface CandidateContext {
  candidateId: string;
  personId: string;
  tenantId: string;
  profileState: CandidateProfileState;
  completionPercentage: number;
  featureAccess: FeatureAccess;
  jobAccessTier: JobAccessTier;
  isActive: boolean;
  hasResume: boolean;
  hasDocuments: boolean;
  hasPreferences: boolean;
  isEligibleForMatching: boolean;
  canBeContactedByRecruiters: boolean;
}

export interface CandidateContextInput {
  candidate: {
    id: string;
    person_id: string;
    tenant_id: string;
    status: string;
    headline?: string | null;
    availability?: unknown;
    metadata?: Record<string, unknown>;
  } | null;
  profileCompletion: {
    personalData: boolean;
    contactData: boolean;
    professionalSummary: boolean;
    skills: boolean;
    experiences: boolean;
    education: boolean;
    languages: boolean;
    documents: boolean;
    preferences: boolean;
  };
  hasResume: boolean;
  hasDocuments: boolean;
  hasPreferences: boolean;
  applicationCount: number;
  lastActivityAt?: string | null;
}
