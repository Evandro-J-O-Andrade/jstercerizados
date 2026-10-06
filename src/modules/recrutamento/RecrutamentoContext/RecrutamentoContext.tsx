import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  jobsRepository,
  candidatesRepository,
  applicationsRepository,
  jobMatchesRepository,
  recruitmentProcessRepository,
  recruitmentStageRepository,
  talentPoolRepository,
  recruitmentDemandRepository,
} from '../repositories';
import { normalizeError } from '@/lib/error-normalizer';
import type {
  Job,
  JobListItem,
  Candidate,
  CandidateListItem,
  Application,
  ApplicationListItem,
  RecruitmentProcess,
  RecruitmentProcessListItem,
  RecruitmentStage,
  TalentPoolMembership,
  RecruitmentDemand,
  JobMatch,
  RecruitmentDashboardStats,
} from '../types';

export interface RecrutamentoContextValue {
  // Raw data
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];
  processes: RecruitmentProcess[];
  stages: RecruitmentStage[];
  talentPool: TalentPoolMembership[];
  demands: RecruitmentDemand[];
  matches: JobMatch[];

  // Enriched data for views
  jobsEnriched: JobListItem[];
  candidatesEnriched: CandidateListItem[];
  applicationsEnriched: ApplicationListItem[];
  processesEnriched: RecruitmentProcessListItem[];

  // Dashboard stats
  dashboardStats: RecruitmentDashboardStats | null;

  // State
  isLoading: boolean;
  error: string | null;

  // Refetch methods
  refetch: () => Promise<void>;
  refetchJobs: () => Promise<void>;
  refetchCandidates: () => Promise<void>;
  refetchApplications: () => Promise<void>;
  refetchProcesses: () => Promise<void>;
  refetchStages: () => Promise<void>;
  refetchTalentPool: () => Promise<void>;
  refetchDemands: () => Promise<void>;
  refetchMatches: () => Promise<void>;
  refetchDashboardStats: () => Promise<void>;

  // Job actions
  createJob: (input: any) => Promise<Job | null>;
  updateJob: (input: any) => Promise<Job | null>;
  updateJobStatus: (id: string, status: Job['status']) => Promise<Job | null>;
  deleteJob: (id: string) => Promise<boolean>;

  // Candidate actions
  createCandidate: (input: any) => Promise<Candidate | null>;
  updateCandidate: (input: any) => Promise<Candidate | null>;
  deleteCandidate: (id: string) => Promise<boolean>;

  // Application actions
  createApplication: (input: any) => Promise<Application | null>;
  updateApplication: (input: any) => Promise<Application | null>;
  moveApplicationToStage: (
    applicationId: string,
    stageId: string,
    movedBy: string,
    notes?: string,
  ) => Promise<Application | null>;
  updateApplicationStatus: (
    id: string,
    status: Application['status'],
    additionalData?: any,
  ) => Promise<Application | null>;
  deleteApplication: (id: string) => Promise<boolean>;

  // Process actions
  createProcess: (input: any) => Promise<RecruitmentProcess | null>;
  updateProcess: (input: any) => Promise<RecruitmentProcess | null>;
  deleteProcess: (id: string) => Promise<boolean>;

  // Stage actions
  createStage: (input: any) => Promise<RecruitmentStage | null>;
  updateStage: (input: any) => Promise<RecruitmentStage | null>;
  deleteStage: (id: string) => Promise<boolean>;

  // Demand actions
  createDemand: (input: any) => Promise<RecruitmentDemand | null>;
  updateDemand: (input: any) => Promise<RecruitmentDemand | null>;
  deleteDemand: (id: string) => Promise<boolean>;

  // Match actions
  upsertMatch: (match: any) => Promise<JobMatch | null>;
  markMatchNotified: (id: string) => Promise<JobMatch | null>;
  invalidateMatch: (id: string, reason: string) => Promise<JobMatch | null>;
}

const RecrutamentoContext = createContext<RecrutamentoContextValue | null>(
  null,
);

export function RecrutamentoProvider({ children }: { children: ReactNode }) {
  const { currentTenantId } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [processes, setProcesses] = useState<RecruitmentProcess[]>([]);
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [talentPool, setTalentPool] = useState<TalentPoolMembership[]>([]);
  const [demands, setDemands] = useState<RecruitmentDemand[]>([]);
  const [matches, setMatches] = useState<JobMatch[]>([]);

  const [jobsEnriched, setJobsEnriched] = useState<JobListItem[]>([]);
  const [candidatesEnriched, setCandidatesEnriched] = useState<
    CandidateListItem[]
  >([]);
  const [applicationsEnriched, setApplicationsEnriched] = useState<
    ApplicationListItem[]
  >([]);
  const [processesEnriched, setProcessesEnriched] = useState<
    RecruitmentProcessListItem[]
  >([]);

  const [dashboardStats, setDashboardStats] =
    useState<RecruitmentDashboardStats | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRequestsRef = useRef(0);

  const tenantId = currentTenantId;

  const beginRequest = useCallback(() => {
    activeRequestsRef.current += 1;
    setIsLoading(true);
  }, []);

  const finishRequest = useCallback(() => {
    activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1);
    setIsLoading(activeRequestsRef.current > 0);
  }, []);

  const refetchJobs = useCallback(async () => {
    if (!tenantId) return;
    beginRequest();
    setError(null);
    try {
      const [listResult, enrichedResult] = await Promise.all([
        jobsRepository.list({ tenant_id: tenantId }),
        jobsRepository.list({
          tenant_id: tenantId,
          sort_by: 'created_at',
          sort_order: 'desc',
          limit: 50,
        }),
      ]);
      if (listResult.error) throw listResult.error;
      if (enrichedResult.error) throw enrichedResult.error;
      setJobs(listResult.data || []);
      setJobsEnriched(enrichedResult.data || []);
    } catch (e) {
      setError(normalizeError(e).userMessage);
    } finally {
      finishRequest();
    }
  }, [tenantId, beginRequest, finishRequest]);

  const refetchCandidates = useCallback(async () => {
    if (!tenantId) return;
    beginRequest();
    setError(null);
    try {
      const [listResult, enrichedResult] = await Promise.all([
        candidatesRepository.list({ tenant_id: tenantId }),
        candidatesRepository.list({
          tenant_id: tenantId,
          sort_by: 'created_at',
          sort_order: 'desc',
          limit: 50,
        }),
      ]);
      if (listResult.error) throw listResult.error;
      if (enrichedResult.error) throw enrichedResult.error;
      setCandidates(listResult.data || []);
      setCandidatesEnriched(enrichedResult.data || []);
    } catch (e) {
      setError(normalizeError(e).userMessage);
    } finally {
      finishRequest();
    }
  }, [tenantId, beginRequest, finishRequest]);

  const refetchApplications = useCallback(async () => {
    if (!tenantId) return;
    beginRequest();
    setError(null);
    try {
      const [listResult, enrichedResult] = await Promise.all([
        applicationsRepository.list({ tenant_id: tenantId }),
        applicationsRepository.list({
          tenant_id: tenantId,
          sort_by: 'applied_at',
          sort_order: 'desc',
          limit: 50,
        }),
      ]);
      if (listResult.error) throw listResult.error;
      if (enrichedResult.error) throw enrichedResult.error;
      setApplications(listResult.data || []);
      setApplicationsEnriched(enrichedResult.data || []);
    } catch (e) {
      setError(normalizeError(e).userMessage);
    } finally {
      finishRequest();
    }
  }, [tenantId, beginRequest, finishRequest]);

  const refetchProcesses = useCallback(async () => {
    if (!tenantId) return;
    beginRequest();
    setError(null);
    try {
      const [listData, enrichedData] = await Promise.all([
        recruitmentProcessRepository.findAll(tenantId),
        recruitmentProcessRepository.findAll(tenantId),
      ]);
      setProcesses(listData as unknown as RecruitmentProcess[]);
      setProcessesEnriched(
        enrichedData as unknown as RecruitmentProcessListItem[],
      );
    } catch (e) {
      setError(normalizeError(e).userMessage);
    } finally {
      finishRequest();
    }
  }, [tenantId, beginRequest, finishRequest]);

  const refetchStages = useCallback(async () => {
    if (!tenantId) return;
    beginRequest();
    setError(null);
    try {
      const data = await recruitmentStageRepository.findAll(tenantId);
      setStages(data as unknown as RecruitmentStage[]);
    } catch (e) {
      setError(normalizeError(e).userMessage);
    } finally {
      finishRequest();
    }
  }, [tenantId, beginRequest, finishRequest]);

  const refetchTalentPool = useCallback(async () => {
    if (!tenantId) return;
    beginRequest();
    setError(null);
    try {
      const data = await talentPoolRepository.findAll(tenantId);
      setTalentPool(data as unknown as TalentPoolMembership[]);
    } catch (e) {
      setError(normalizeError(e).userMessage);
    } finally {
      finishRequest();
    }
  }, [tenantId, beginRequest, finishRequest]);

  const refetchDemands = useCallback(async () => {
    if (!tenantId) return;
    beginRequest();
    setError(null);
    try {
      const data = await recruitmentDemandRepository.findAll(tenantId);
      setDemands(data as unknown as RecruitmentDemand[]);
    } catch (e) {
      setError(normalizeError(e).userMessage);
    } finally {
      finishRequest();
    }
  }, [tenantId, beginRequest, finishRequest]);

  const refetchMatches = useCallback(async () => {
    if (!tenantId) return;
    beginRequest();
    setError(null);
    try {
      const result = await jobMatchesRepository.list({
        tenant_id: tenantId,
        sort_by: 'score',
        sort_order: 'desc',
        limit: 100,
      });
      if (result.error) throw result.error;
      setMatches(result.data || []);
    } catch (e) {
      setError(normalizeError(e).userMessage);
    } finally {
      finishRequest();
    }
  }, [tenantId, beginRequest, finishRequest]);

  const refetchDashboardStats = useCallback(async () => {
    if (!tenantId) return;
    beginRequest();
    try {
      const [jobsStats, candidatesStats, applicationsStats, matchesStats] =
        await Promise.all([
          jobsRepository.getStats(tenantId),
          candidatesRepository.getStats(tenantId),
          applicationsRepository.getStats(tenantId),
          jobMatchesRepository.getStats(tenantId),
        ]);

      // Get process stats (old repository returns data directly)
      const processesData =
        await recruitmentProcessRepository.findAll(tenantId);

      // Get demands stats - old repository may not have getStats, so use findAll
      const demandsData = await recruitmentDemandRepository.findAll(tenantId);

      setDashboardStats({
        jobs: {
          total: jobsStats.data?.total || 0,
          draft: jobsStats.data?.draft || 0,
          published: jobsStats.data?.published || 0,
          paused: jobsStats.data?.paused || 0,
          closed: jobsStats.data?.closed || 0,
          filled: jobsStats.data?.filled || 0,
        },
        candidates: {
          total: candidatesStats.data?.total || 0,
          active: candidatesStats.data?.active || 0,
          inactive: candidatesStats.data?.inactive || 0,
          archived: candidatesStats.data?.archived || 0,
          blacklisted: candidatesStats.data?.blacklisted || 0,
          new_this_month: candidatesStats.data?.new_this_month || 0,
        },
        applications: {
          total: applicationsStats.data?.total || 0,
          applied: applicationsStats.data?.applied || 0,
          screening: applicationsStats.data?.screening || 0,
          interview: applicationsStats.data?.interview || 0,
          offer: applicationsStats.data?.offer || 0,
          hired: applicationsStats.data?.hired || 0,
          rejected: applicationsStats.data?.rejected || 0,
          new_today: applicationsStats.data?.new_today || 0,
        },
        processes: {
          total: processesData.length,
          planning: processesData.filter((p: any) => p.status === 'planning')
            .length,
          open: processesData.filter((p: any) => p.status === 'open').length,
          in_progress: processesData.filter(
            (p: any) => p.status === 'in_progress',
          ).length,
          completed: processesData.filter((p: any) => p.status === 'completed')
            .length,
        },
        demands: {
          total: demandsData.length,
          open: demandsData.filter((d: any) => d.status === 'open').length,
          in_progress: demandsData.filter(
            (d: any) => d.status === 'in_progress',
          ).length,
          fulfilled: demandsData.filter((d: any) => d.status === 'fulfilled')
            .length,
        },
        matches: {
          total: matchesStats.data?.total || 0,
          high_score: matchesStats.data?.high_score || 0,
          eligible_not_notified: matchesStats.data?.eligible_not_notified || 0,
        },
      });
    } catch (e) {
      setError(normalizeError(e).userMessage);
    } finally {
      finishRequest();
    }
  }, [tenantId, beginRequest, finishRequest]);

  const refetch = useCallback(async () => {
    await Promise.all([
      refetchJobs(),
      refetchCandidates(),
      refetchApplications(),
      refetchProcesses(),
      refetchStages(),
      refetchTalentPool(),
      refetchDemands(),
      refetchMatches(),
      refetchDashboardStats(),
    ]);
  }, [
    refetchJobs,
    refetchCandidates,
    refetchApplications,
    refetchProcesses,
    refetchStages,
    refetchTalentPool,
    refetchDemands,
    refetchMatches,
    refetchDashboardStats,
  ]);

  // Job actions
  const createJob = useCallback(
    async (input: any) => {
      if (!tenantId) return null;
      try {
        const result = await jobsRepository.create({
          ...input,
          tenant_id: tenantId,
        });
        if (result.error) throw result.error;
        await refetchJobs();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [tenantId, refetchJobs],
  );

  const updateJob = useCallback(
    async (input: any) => {
      try {
        const result = await jobsRepository.update(input);
        if (result.error) throw result.error;
        await refetchJobs();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [refetchJobs],
  );

  const updateJobStatus = useCallback(
    async (id: string, status: Job['status']) => {
      try {
        const result = await jobsRepository.updateStatus(id, status);
        if (result.error) throw result.error;
        await refetchJobs();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [refetchJobs],
  );

  const deleteJob = useCallback(
    async (id: string) => {
      try {
        const result = await jobsRepository.delete(id);
        if (result.error) throw result.error;
        await refetchJobs();
        return true;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return false;
      }
    },
    [refetchJobs],
  );

  // Candidate actions
  const createCandidate = useCallback(
    async (input: any) => {
      if (!tenantId) return null;
      try {
        const result = await candidatesRepository.create({
          ...input,
          tenant_id: tenantId,
        });
        if (result.error) throw result.error;
        await refetchCandidates();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [tenantId, refetchCandidates],
  );

  const updateCandidate = useCallback(
    async (input: any) => {
      if (!tenantId) return null;
      try {
        const result = await candidatesRepository.update({
          ...input,
          tenant_id: tenantId,
        });
        if (result.error) throw result.error;
        await refetchCandidates();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [tenantId, refetchCandidates],
  );

  const deleteCandidate = useCallback(
    async (id: string) => {
      if (!tenantId) return false;
      try {
        const result = await candidatesRepository.delete(id, tenantId);
        if (result.error) throw result.error;
        await refetchCandidates();
        return true;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return false;
      }
    },
    [tenantId, refetchCandidates],
  );

  // Application actions
  const createApplication = useCallback(
    async (input: any) => {
      if (!tenantId) return null;
      try {
        const result = await applicationsRepository.create({
          ...input,
          tenant_id: tenantId,
        });
        if (result.error) throw result.error;
        await refetchApplications();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [tenantId, refetchApplications],
  );

  const updateApplication = useCallback(
    async (input: any) => {
      try {
        const result = await applicationsRepository.update(input);
        if (result.error) throw result.error;
        await refetchApplications();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [refetchApplications],
  );

  const moveApplicationToStage = useCallback(
    async (
      applicationId: string,
      stageId: string,
      movedBy: string,
      notes?: string,
    ) => {
      try {
        const result = await applicationsRepository.moveToStage(
          applicationId,
          stageId,
          movedBy,
          notes,
        );
        if (result.error) throw result.error;
        await refetchApplications();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [refetchApplications],
  );

  const updateApplicationStatus = useCallback(
    async (
      id: string,
      status: Application['status'],
      additionalData: any = {},
    ) => {
      try {
        const result = await applicationsRepository.updateStatus(
          id,
          status,
          additionalData,
        );
        if (result.error) throw result.error;
        await refetchApplications();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [refetchApplications],
  );

  const deleteApplication = useCallback(
    async (id: string) => {
      try {
        const result = await applicationsRepository.delete(id);
        if (result.error) throw result.error;
        await refetchApplications();
        return true;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return false;
      }
    },
    [refetchApplications],
  );

  // Process actions
  const createProcess = useCallback(
    async (input: any) => {
      if (!tenantId) return null;
      try {
        const data = await recruitmentProcessRepository.create({
          ...input,
          tenant_id: tenantId,
        });
        await refetchProcesses();
        return data as unknown as RecruitmentProcess;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [tenantId, refetchProcesses],
  );

  const updateProcess = useCallback(
    async (input: any) => {
      try {
        const { id, ...updates } = input;
        const data = await recruitmentProcessRepository.update(id, updates);
        await refetchProcesses();
        return data as unknown as RecruitmentProcess;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [refetchProcesses],
  );

  const deleteProcess = useCallback(
    async (id: string) => {
      try {
        await recruitmentProcessRepository.delete(id);
        await refetchProcesses();
        return true;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return false;
      }
    },
    [refetchProcesses],
  );

  // Stage actions
  const createStage = useCallback(
    async (input: any) => {
      if (!tenantId) return null;
      try {
        const data = await recruitmentStageRepository.create({
          ...input,
          tenant_id: tenantId,
        });
        await refetchStages();
        return data as unknown as RecruitmentStage;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [tenantId, refetchStages],
  );

  const updateStage = useCallback(
    async (input: any) => {
      try {
        const { id, ...updates } = input;
        const data = await recruitmentStageRepository.update(id, updates);
        await refetchStages();
        return data as unknown as RecruitmentStage;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [refetchStages],
  );

  const deleteStage = useCallback(
    async (id: string) => {
      try {
        await recruitmentStageRepository.delete(id);
        await refetchStages();
        return true;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return false;
      }
    },
    [refetchStages],
  );

  // Demand actions
  const createDemand = useCallback(
    async (input: any) => {
      if (!tenantId) return null;
      try {
        const data = await recruitmentDemandRepository.create({
          ...input,
          tenant_id: tenantId,
        });
        await refetchDemands();
        return data as unknown as RecruitmentDemand;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [tenantId, refetchDemands],
  );

  const updateDemand = useCallback(
    async (input: any) => {
      try {
        const { id, ...updates } = input;
        const data = await recruitmentDemandRepository.update(id, updates);
        await refetchDemands();
        return data as unknown as RecruitmentDemand;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [refetchDemands],
  );

  const deleteDemand = useCallback(
    async (id: string) => {
      try {
        await recruitmentDemandRepository.delete(id);
        await refetchDemands();
        return true;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return false;
      }
    },
    [refetchDemands],
  );

  // Match actions
  const upsertMatch = useCallback(
    async (match: any) => {
      if (!tenantId) return null;
      try {
        const result = await jobMatchesRepository.upsert({
          ...match,
          tenant_id: tenantId,
        });
        if (result.error) throw result.error;
        await refetchMatches();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [tenantId, refetchMatches],
  );

  const markMatchNotified = useCallback(
    async (id: string) => {
      try {
        const result = await jobMatchesRepository.markNotified(id);
        if (result.error) throw result.error;
        await refetchMatches();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [refetchMatches],
  );

  const invalidateMatch = useCallback(
    async (id: string, reason: string) => {
      try {
        const result = await jobMatchesRepository.invalidate(id, reason);
        if (result.error) throw result.error;
        await refetchMatches();
        return result.data;
      } catch (e) {
        setError(normalizeError(e).userMessage);
        return null;
      }
    },
    [refetchMatches],
  );

  useEffect(() => {
    if (!tenantId) {
      setJobs([]);
      setCandidates([]);
      setApplications([]);
      setProcesses([]);
      setStages([]);
      setTalentPool([]);
      setDemands([]);
      setMatches([]);
      setJobsEnriched([]);
      setCandidatesEnriched([]);
      setApplicationsEnriched([]);
      setProcessesEnriched([]);
      setDashboardStats(null);
      setIsLoading(false);
      return;
    }
    void refetch();
  }, [tenantId, refetch]);

  const value: RecrutamentoContextValue = {
    jobs,
    candidates,
    applications,
    processes,
    stages,
    talentPool,
    demands,
    matches,
    jobsEnriched,
    candidatesEnriched,
    applicationsEnriched,
    processesEnriched,
    dashboardStats,
    isLoading,
    error,
    refetch,
    refetchJobs,
    refetchCandidates,
    refetchApplications,
    refetchProcesses,
    refetchStages,
    refetchTalentPool,
    refetchDemands,
    refetchMatches,
    refetchDashboardStats,
    createJob,
    updateJob,
    updateJobStatus,
    deleteJob,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    createApplication,
    updateApplication,
    moveApplicationToStage,
    updateApplicationStatus,
    deleteApplication,
    createProcess,
    updateProcess,
    deleteProcess,
    createStage,
    updateStage,
    deleteStage,
    createDemand,
    updateDemand,
    deleteDemand,
    upsertMatch,
    markMatchNotified,
    invalidateMatch,
  };

  return (
    <RecrutamentoContext.Provider value={value}>
      {children}
    </RecrutamentoContext.Provider>
  );
}

export function useRecrutamento(): RecrutamentoContextValue {
  const ctx = useContext(RecrutamentoContext);
  if (!ctx) {
    throw new Error(
      'useRecrutamento must be used within <RecrutamentoProvider>',
    );
  }
  return ctx;
}
