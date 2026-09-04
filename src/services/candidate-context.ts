import type {
  CandidateContext,
  CandidateContextInput,
  CandidateProfileState,
  FeatureAccess,
  JobAccessTier,
} from '@/types/domain/candidate-context';
import {
  CANDIDATE_PROFILE_STATES,
  JOB_ACCESS_TIERS,
} from '@/types/domain/candidate-context';

function computeCompletionPercentage(
  profile: CandidateContextInput['profileCompletion'],
): number {
  const fields = [
    profile.personalData,
    profile.contactData,
    profile.professionalSummary,
    profile.skills,
    profile.experiences,
    profile.education,
    profile.languages,
    profile.documents,
    profile.preferences,
  ] as const;

  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function deriveProfileState(
  completion: number,
  input: CandidateContextInput,
): CandidateProfileState {
  if (completion >= 100) {
    return 'active_matching';
  }
  if (completion >= 90) {
    return 'complete_resume';
  }
  if (completion >= 75) {
    return 'complete_profile';
  }
  if (completion >= 50) {
    return 'basic_profile';
  }
  if (completion >= 25 || input.candidate !== null) {
    return 'incomplete_registration';
  }
  return 'new';
}

function deriveJobAccessTier(
  profileState: CandidateProfileState,
): JobAccessTier {
  if (
    profileState === 'active_matching' ||
    profileState === 'complete_resume'
  ) {
    return 'early_access';
  }
  if (
    profileState === 'complete_profile' ||
    profileState === 'basic_profile'
  ) {
    return 'internal';
  }
  return 'public';
}

function deriveFeatureAccess(profileState: CandidateProfileState): FeatureAccess {
  const isAtLeastBasic =
    profileState === 'basic_profile' ||
    profileState === 'complete_profile' ||
    profileState === 'complete_resume' ||
    profileState === 'active_matching';

  const isAtLeastComplete =
    profileState === 'complete_profile' ||
    profileState === 'complete_resume' ||
    profileState === 'active_matching';

  const isAtLeastResume =
    profileState === 'complete_resume' ||
    profileState === 'active_matching';

  const isActiveMatching = profileState === 'active_matching';

  return {
    canViewPublishedJobs: true,
    canViewInternalJobs: isAtLeastBasic,
    canViewEarlyAccessJobs: isAtLeastResume,
    canApplyToJobs: isAtLeastBasic,
    canSaveFavorites: isAtLeastBasic,
    canReceiveRecommendations: isAtLeastComplete,
    canReceiveAlerts: isAtLeastComplete,
    canAccessAdvancedMatching: isAtLeastResume,
    canViewUnpublishedOpportunities: isAtLeastResume,
    canAccessCourses: isAtLeastResume,
    canAccessCareerGuidance: isActiveMatching,
    canViewPersonalizedContent: isAtLeastComplete,
  };
}

export function calculateCandidateContext(
  input: CandidateContextInput,
): CandidateContext {
  const candidate = input.candidate;
  const completionPercentage = computeCompletionPercentage(input.profileCompletion);
  const profileState = deriveProfileState(completionPercentage, input);
  const jobAccessTier = deriveJobAccessTier(profileState);
  const featureAccess = deriveFeatureAccess(profileState);

  return {
    candidateId: candidate?.id ?? '',
    personId: candidate?.person_id ?? '',
    tenantId: candidate?.tenant_id ?? '',
    profileState,
    completionPercentage,
    featureAccess,
    jobAccessTier,
    isActive: candidate?.status === 'active',
    hasResume: input.hasResume,
    hasDocuments: input.hasDocuments,
    hasPreferences: input.hasPreferences,
    isEligibleForMatching:
      profileState === 'active_matching' && input.applicationCount === 0,
    canBeContactedByRecruiters:
      profileState === 'complete_resume' || profileState === 'active_matching',
  };
}

export function getProfileStateInfo(
  state: CandidateProfileState,
): { label: string; description: string } {
  const info = CANDIDATE_PROFILE_STATES[state];
  return {
    label: info.label,
    description: info.description,
  };
}

export function getJobAccessTierInfo(
  tier: JobAccessTier,
): { label: string; description: string } {
  const info = JOB_ACCESS_TIERS[tier];
  return {
    label: info.label,
    description: info.description,
  };
}
