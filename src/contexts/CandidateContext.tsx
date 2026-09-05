import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { applicationsRepository } from '@/repositories/applications.repository';
import { candidatePreferencesRepository } from '@/repositories/candidate-preferences.repository';
import {
  favoriteJobsRepository,
  publicJobsRepository,
  candidateJobAlertsRepository,
  type FavoriteJobWithJob,
  type PublishedJobWithSkills,
  type CandidateJobAlertRow,
  type CandidateJobAlertInput,
} from '@/repositories/candidate-portal';
import type { Candidate } from '@/types/domain/candidate';
import type { CandidatePreference } from '@/types/domain/candidate';
import type { Application } from '@/types/domain/application';
import { normalizeError } from '@/lib/error-normalizer';
import { calculateCandidateContext } from '@/services/candidate-context';
import {
  type MatchResult,
  type JobWithSkills,
  type MatchingCandidate,
  toMatchingCandidate,
} from '@/types/domain/matching';
import { matchJobToCandidate } from '@/services/matching';

interface CandidateContextValue {
  candidate: Candidate | null;
  applications: Application[];
  publishedJobs: PublishedJobWithSkills[];
  favorites: FavoriteJobWithJob[];
  favoriteIds: Set<string>;
  preferences: CandidatePreference | null;
  jobAlerts: CandidateJobAlertRow[];
  candidateContext: ReturnType<typeof calculateCandidateContext> | null;
  matchResults: Array<{ job: PublishedJobWithSkills; match: MatchResult }>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleFavorite: (jobId: string) => Promise<{ error?: string }>;
  refetchFavorites: () => Promise<void>;
  refetchAlerts: () => Promise<void>;
  createAlert: (input: Omit<CandidateJobAlertInput, 'tenant_id' | 'person_id'>) => Promise<{ error?: string }>;
  updateAlert: (id: string, input: Partial<CandidateJobAlertInput>) => Promise<{ error?: string }>;
  deleteAlert: (id: string) => Promise<{ error?: string }>;
}

const CandidateContext = createContext<CandidateContextValue | null>(null);

const LEGACY_TABLE_PATTERNS =
  /relation .* does not exist|table.*not found|schema cache|PGRST/i;

function isLegacyTableError(error: unknown): boolean {
  if (!error) return false;
  const msg =
    typeof error === 'object' && error !== null
      ? JSON.stringify(error)
      : String(error);
  return LEGACY_TABLE_PATTERNS.test(msg);
}

export function CandidateProvider({ children }: { children: ReactNode }) {
  const { person, currentTenantId, isCandidate } = useAuth();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [publishedJobs, setPublishedJobs] = useState<PublishedJobWithSkills[]>(
    [],
  );
  const [favorites, setFavorites] = useState<FavoriteJobWithJob[]>([]);
  const [jobAlerts, setJobAlerts] = useState<CandidateJobAlertRow[]>([]);
  const [preferences, setPreferences] = useState<CandidatePreference | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tenantId = currentTenantId;
  const personId = person?.id ?? null;

  const candidateContext = useMemo(() => {
    if (!candidate || !personId || !tenantId) {
      return null;
    }

    const hasPreferences = !!preferences;

    const profileCompletion = {
      personalData: Boolean(person?.full_name && person?.email),
      contactData: Boolean(person?.phone),
      professionalSummary: Boolean(
        candidate.headline && candidate.headline.trim().length > 0,
      ),
      skills: Boolean(candidate.skills && candidate.skills.length > 0),
      experiences: Boolean(
        candidate.experiences && candidate.experiences.length > 0,
      ),
      education: Boolean(candidate.education && candidate.education.length > 0),
      languages: Boolean(candidate.languages && candidate.languages.length > 0),
      documents: Boolean(candidate.documents && candidate.documents.length > 0),
      preferences: hasPreferences,
    };

    return calculateCandidateContext({
      candidate: {
        id: candidate.id,
        person_id: candidate.person_id,
        tenant_id: candidate.tenant_id,
        status: candidate.status,
        headline: candidate.headline,
        availability: candidate.availability,
        metadata: candidate.metadata,
      },
      profileCompletion,
      hasResume: (candidate.documents?.length ?? 0) > 0,
      hasDocuments: (candidate.documents?.length ?? 0) > 0,
      hasPreferences,
      applicationCount: applications.length,
    });
  }, [candidate, person, personId, tenantId, applications, preferences]);

  const matchResults = useMemo(() => {
    if (!candidate || publishedJobs.length === 0) return [];

    const matchingCandidate: MatchingCandidate = {
      ...toMatchingCandidate(candidate),
      locations: preferences?.desired_locations ?? null,
      contract_types: preferences?.contract_types ?? null,
      work_modes: preferences?.work_modes ?? null,
      salary_min: preferences?.salary_min ?? null,
      salary_max: preferences?.salary_max ?? null,
      available_from: preferences?.available_from ?? null,
    };

    return publishedJobs
      .map((job) => ({
        job: job as unknown as JobWithSkills,
        match: matchJobToCandidate(
          matchingCandidate,
          job as unknown as JobWithSkills,
        ),
      }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [candidate, publishedJobs, preferences]);

  const refetch = useCallback(async () => {
    if (!tenantId || !personId) {
      setCandidate(null);
      setApplications([]);
      setPublishedJobs([]);
      setFavorites([]);
      setJobAlerts([]);
      setPreferences(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [selfCandidate, allApps, jobs, favs, alerts] = await Promise.all([
        candidatesRepository.findByPersonId(tenantId, personId),
        applicationsRepository.findAll(tenantId, {}),
        publicJobsRepository.findPublishedWithSkills(tenantId),
        favoriteJobsRepository.listForCurrentPerson(tenantId),
        candidateJobAlertsRepository.listForCurrentPerson(tenantId),
      ]);

      setCandidate(selfCandidate);
      setApplications(
        (allApps || []).filter((a) => a.candidate?.person_id === personId),
      );
      setPublishedJobs(jobs || []);
      setFavorites(favs || []);
      setJobAlerts(alerts || []);

      if (selfCandidate) {
        try {
          const prefs = await candidatePreferencesRepository.findByCandidate(
            selfCandidate.id,
          );
          setPreferences(prefs);
        } catch (prefError) {
          if (import.meta.env.DEV) {
            console.warn(
              '[CandidateContext] preferences query failed (table may not exist yet)',
              prefError,
            );
          }
          if (!isLegacyTableError(prefError)) {
            throw prefError;
          }
          setPreferences(null);
        }
      } else {
        setPreferences(null);
      }
    } catch (e) {
      const msg = normalizeError(e).userMessage;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, personId]);

  const refetchFavorites = useCallback(async () => {
    if (!tenantId) return;
    try {
      const favs = await favoriteJobsRepository.listForCurrentPerson(tenantId);
      setFavorites(favs || []);
    } catch (e) {
      setError(normalizeError(e).userMessage);
    }
  }, [tenantId]);

  const refetchAlerts = useCallback(async () => {
    if (!tenantId) return;
    try {
      const alerts = await candidateJobAlertsRepository.listForCurrentPerson(
        tenantId,
      );
      setJobAlerts(alerts || []);
    } catch (e) {
      if (!isLegacyTableError(e)) {
        setError(normalizeError(e).userMessage);
      }
    }
  }, [tenantId]);

  const toggleFavorite = async (jobId: string) => {
    if (!tenantId || !personId) {
      return { error: 'Sessão inválida. Faça login novamente.' };
    }
    const isFav = favorites.some((f) => f.job_id === jobId);
    try {
      if (isFav) {
        await favoriteJobsRepository.remove(jobId);
      } else {
        await favoriteJobsRepository.add(personId, jobId, tenantId);
      }
      await refetchFavorites();
      return {};
    } catch (e) {
      return { error: normalizeError(e).userMessage };
    }
  };

  const createAlert = async (
    input: Omit<CandidateJobAlertInput, 'tenant_id' | 'person_id'>,
  ) => {
    if (!tenantId || !personId) {
      return { error: 'Sessão inválida. Faça login novamente.' };
    }
    try {
      await candidateJobAlertsRepository.create({
        ...input,
        tenant_id: tenantId,
        person_id: personId,
      });
      await refetchAlerts();
      return {};
    } catch (e) {
      return { error: normalizeError(e).userMessage };
    }
  };

  const updateAlert = async (
    id: string,
    input: Partial<CandidateJobAlertInput>,
  ) => {
    try {
      await candidateJobAlertsRepository.update(id, input);
      await refetchAlerts();
      return {};
    } catch (e) {
      return { error: normalizeError(e).userMessage };
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await candidateJobAlertsRepository.remove(id);
      await refetchAlerts();
      return {};
    } catch (e) {
      return { error: normalizeError(e).userMessage };
    }
  };

  useEffect(() => {
    if (!isCandidate) {
      setCandidate(null);
      setApplications([]);
      setPublishedJobs([]);
      setFavorites([]);
      setJobAlerts([]);
      setPreferences(null);
      return;
    }
    void refetch();
  }, [isCandidate, tenantId, personId, refetch]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.job_id)),
    [favorites],
  );

  const value: CandidateContextValue = {
    candidate,
    applications,
    publishedJobs,
    favorites,
    favoriteIds,
    preferences,
    jobAlerts,
    candidateContext,
    matchResults,
    isLoading,
    error,
    refetch,
    toggleFavorite,
    refetchFavorites,
    refetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
  };

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidate(): CandidateContextValue {
  const ctx = useContext(CandidateContext);
  if (!ctx) {
    throw new Error('useCandidate must be used within <CandidateProvider>');
  }
  return ctx;
}
