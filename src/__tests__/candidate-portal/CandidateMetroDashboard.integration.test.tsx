import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import type { Candidate } from '@/types/domain/candidate';
import type { Application } from '@/types/domain/application';
import type { CandidateContext } from '@/types/domain/candidate-context';
import type { MatchResult } from '@/types/domain/matching';
import type {
  PublishedJobWithSkills,
  CandidateJobAlertRow,
  FavoriteJobWithJob,
} from '@/repositories/candidate-portal';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: vi.fn(),
}));

vi.mock('@/contexts/CandidateContext', () => ({
  CandidateProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useCandidate: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => null),
}));

vi.mock('@/services/candidate-context', () => ({
  calculateCandidateContext: vi.fn(),
  getProfileStateInfo: vi.fn(),
  CANDIDATE_PROFILE_STATES: {
    COMPLETE: 'complete',
    INCOMPLETE: 'incomplete',
    NEEDS_REVIEW: 'needs_review',
  },
}));

vi.mock('@/services/matching', () => ({
  matchJobToCandidate: vi.fn(
    () =>
      ({
        score: 85,
        percentage: 0.85,
        breakdown: [],
        reasons: [],
        algorithm_version: '1.0',
      }) as MatchResult,
  ),
  matchJobsToCandidate: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useCandidate } from '@/contexts/CandidateContext';
import CandidateMetroDashboard from '@/features/candidato/pages/CandidateMetroDashboard';

const mockUseAuth = vi.mocked(useAuth);
const mockUseAccount = vi.mocked(useAccount);
const mockUseCandidate = vi.mocked(useCandidate);

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    value: 5000,
  });
  global.IntersectionObserver = class IntersectionObserver {
    root: Element | null = null;
    rootMargin = '';
    thresholds: ReadonlyArray<number> = [];
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
  };
});

afterAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    value: 0,
  });
});

function makeCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: 'c1',
    person_id: 'p1',
    tenant_id: 't1',
    headline: 'Desenvolvedor',
    salary_expectation_min: null,
    salary_expectation_max: null,
    salary_type: null,
    availability: null,
    source: 'web',
    status: 'active',
    metadata: {},
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skills: [],
    experiences: [],
    education: [],
    courses: [],
    languages: [],
    documents: [],
    profileViews: [],
    ...overrides,
  };
}

function makeApplication(
  stage: Application['current_stage'] = 'submitted',
): Application {
  return {
    id: `app-${stage}`,
    tenant_id: 't1',
    job_id: 'j1',
    candidate_id: 'c1',
    profile_snapshot: null,
    match_score: null,
    match_details: null,
    source: null,
    current_stage: stage,
    notes: null,
    applied_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  };
}

function makeCandidateContext(
  overrides: Partial<CandidateContext> = {},
): CandidateContext {
  return {
    candidateId: 'c1',
    personId: 'p1',
    tenantId: 't1',
    profileState: 'complete_resume',
    completionPercentage: 95,
    featureAccess: {
      canViewPublishedJobs: true,
      canViewInternalJobs: false,
      canViewEarlyAccessJobs: false,
      canApplyToJobs: true,
      canSaveFavorites: true,
      canReceiveRecommendations: true,
      canReceiveAlerts: true,
      canAccessAdvancedMatching: false,
      canViewUnpublishedOpportunities: false,
      canAccessCourses: false,
      canAccessCareerGuidance: false,
      canViewPersonalizedContent: true,
    },
    jobAccessTier: 'public',
    isActive: true,
    hasResume: true,
    hasDocuments: true,
    hasPreferences: true,
    isEligibleForMatching: false,
    canBeContactedByRecruiters: true,
    ...overrides,
  };
}

function findTileByExactHref(href: string): HTMLElement {
  const links = screen.getAllByRole('link');
  const found = links.find((a) => a.getAttribute('href') === href);
  if (!found) throw new Error(`Tile with href ${href} not found`);
  return found as HTMLElement;
}

function LocationDisplay() {
  const { pathname } = useLocation();
  return <div data-testid="location">{pathname}</div>;
}

const authBase = {
  isAuthenticated: true,
  isLoading: false,
  person: { id: 'p1', full_name: 'Candidato Teste', email: 'c@t.com' } as never,
  permissions: [] as never,
  roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as never],
  isAdminMaster: false,
  isCandidate: true,
  isEmpresa: false,
  tenantMemberships: [],
  currentTenantId: 't1',
  tenants: [{ id: 't1', name: 'J&S' }],
  roleAssignments: [],
  firstLoginState: null,
  legalAcceptances: [],
  user: null,
  tenantIds: [],
  login: vi.fn(),
  loginWithProvider: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  acceptTerms: vi.fn(),
  switchTenant: vi.fn(),
};

const accountBase = {
  identity: {
    firstName: 'Candidato',
    displayName: 'Candidato Teste',
    email: 'c@t.com',
    personId: 'p1',
    roleName: 'candidato',
    roleScope: 'tenant' as const,
    tenantName: 'J&S',
    contextLabel: 'J&S',
    greeting: 'Olá',
    isAdminMaster: false,
  },
  userIdentity: {
    id: 'p1',
    authUserId: 'p1',
    email: 'c@t.com',
    firstName: 'Candidato',
    displayName: 'Candidato Teste',
    role: { id: 'r1', name: 'candidato', scope: 'tenant' },
    roleLabel: 'Candidato',
    tenant: { id: 't1', name: 'J&S' },
    tenantLabel: 'J&S',
    memberships: [],
    permissions: [] as never,
    effectiveScopes: ['tenant'],
    isAdminMaster: false,
    isCandidate: true,
    isEmpresa: false,
    firstLoginState: null,
    legalAcceptances: [],
    contextLabel: 'J&S',
    greeting: 'Olá',
    dateTime: new Date().toLocaleString('pt-BR'),
  },
  activeRole: { id: 'r1', name: 'candidato', scope: 'tenant' },
  activePermissions: [],
  availableModules: [],
  availableFeatures: [],
  modulesByCategory: {
    inicio: [],
    plataforma: [],
    negocio: [],
    ia: [],
    seguranca: [],
    documentos: [],
    conta: [],
  },
  categoryMeta: {} as never,
  activeTenantId: 't1',
  effectiveScopes: ['tenant'],
  availableMemberships: [],
  switchAccount: vi.fn(),
};

function renderDashboard(
  overrides: {
    candidate?: Candidate | null;
    applications?: Application[];
    publishedJobs?: PublishedJobWithSkills[];
    favorites?: FavoriteJobWithJob[];
    jobAlerts?: CandidateJobAlertRow[];
    matchResults?: Array<{ job: PublishedJobWithSkills; match: MatchResult }>;
    candidateContext?: CandidateContext | null;
    isLoading?: boolean;
    error?: string | null;
  } = {},
) {
  mockUseAuth.mockReturnValue(authBase as never);
  mockUseAccount.mockReturnValue(accountBase as never);
  mockUseCandidate.mockReturnValue({
    candidate: overrides.candidate ?? makeCandidate(),
    applications: overrides.applications ?? [makeApplication('submitted')],
    publishedJobs: overrides.publishedJobs ?? [],
    favorites: overrides.favorites ?? [],
    favoriteIds: new Set(overrides.favorites?.map((f) => f.job_id) ?? []),
    preferences: null,
    jobAlerts: overrides.jobAlerts ?? [],
    candidateContext: overrides.candidateContext ?? makeCandidateContext(),
    matchResults: overrides.matchResults ?? [],
    isLoading: overrides.isLoading ?? false,
    error: overrides.error ?? null,
    refetch: vi.fn(),
    toggleFavorite: vi.fn(),
    refetchFavorites: vi.fn(),
    refetchAlerts: vi.fn(),
    createAlert: vi.fn(),
    updateAlert: vi.fn(),
    deleteAlert: vi.fn(),
  } as never);

  return render(
    <MemoryRouter initialEntries={['/candidato']}>
      <Routes>
        <Route path="/candidato" element={<CandidateMetroDashboard />} />
        <Route
          path="/candidato/vagas"
          element={<div data-testid="vagas-page">Vagas</div>}
        />
        <Route
          path="/candidato/candidaturas"
          element={<div data-testid="candidaturas-page">Candidaturas</div>}
        />
        <Route
          path="/candidato/favoritas"
          element={<div data-testid="favoritas-page">Favoritas</div>}
        />
        <Route
          path="/candidato/curriculo"
          element={<div data-testid="curriculo-page">Curriculo</div>}
        />
        <Route
          path="/candidato/alertas"
          element={<div data-testid="alertas-page">Alertas</div>}
        />
        <Route
          path="/candidato/perfil"
          element={<div data-testid="perfil-page">Perfil</div>}
        />
        <Route
          path="/candidato/notificacoes"
          element={<div data-testid="notificacoes-page">Notificacoes</div>}
        />
        <Route
          path="/candidato/configuracoes"
          element={<div data-testid="configuracoes-page">Config</div>}
        />
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  );
}

const tileLinks = [
  { id: 'vagas', label: 'Vagas', href: '/candidato/vagas' },
  {
    id: 'candidaturas',
    label: 'Minhas Candidaturas',
    href: '/candidato/candidaturas',
  },
  { id: 'favoritas', label: 'Vagas Favoritas', href: '/candidato/favoritas' },
  { id: 'curriculo', label: 'Meu Currículo', href: '/candidato/curriculo' },
  { id: 'alertas', label: 'Alertas de Vagas', href: '/candidato/alertas' },
  { id: 'perfil', label: 'Meu Perfil', href: '/candidato/perfil' },
  {
    id: 'notificacoes',
    label: 'Notificações',
    href: '/candidato/notificacoes',
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    href: '/candidato/configuracoes',
  },
];

describe('CandidateMetroDashboard — component integration', () => {
  it('renders dashboard title and greeting from useAuth person', () => {
    renderDashboard();

    expect(
      screen.getByRole('heading', { name: /Área do Candidato/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Olá, Candidato\. Acesse suas ferramentas abaixo\./i),
    ).toBeInTheDocument();
  });

  it('renders 8 metro tiles from useCandidate data via computeCandidateDashboardTiles', () => {
    renderDashboard();

    const allLinks = screen.getAllByRole('link');
    const tileLinks = allLinks.filter((a) =>
      a.getAttribute('href')?.startsWith('/candidato/'),
    );
    expect(tileLinks).toHaveLength(8);
  });

  it('renders tiles with correct titles', () => {
    renderDashboard();

    tileLinks.forEach(({ label }) => {
      expect(screen.getByRole('heading', { name: label })).toBeInTheDocument();
    });
  });

  it('displays application count on candidaturas tile', () => {
    renderDashboard({
      applications: [
        makeApplication('submitted'),
        makeApplication('screening'),
        makeApplication('interview'),
      ],
    });

    const candidaturasTile = findTileByExactHref('/candidato/candidaturas');
    expect(within(candidaturasTile).getByText('3')).toBeInTheDocument();
  });

  it('shows "Carregando..." state when useCandidate isLoading is true', () => {
    renderDashboard({ isLoading: true });
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('shows error message when useCandidate error is set', () => {
    const errorMsg = 'Erro ao buscar dados do Supabase';
    renderDashboard({ error: errorMsg });

    const errorBox = screen
      .getByRole('heading', { name: /Erro ao carregar dados/i })
      .closest('[class*="border-dashed"]') as HTMLElement;
    expect(errorBox).toBeInTheDocument();
    expect(within(errorBox).getByText(errorMsg)).toBeInTheDocument();
  });

  it('tiles navigate to correct routes when clicked', () => {
    renderDashboard();

    const vagasTile = findTileByExactHref('/candidato/vagas');
    fireEvent.click(vagasTile);

    expect(screen.getByTestId('vagas-page')).toBeInTheDocument();
  });

  it('candidaturas tile navigates to /candidato/candidaturas', () => {
    renderDashboard();

    const candidaturasTile = findTileByExactHref('/candidato/candidaturas');
    fireEvent.click(candidaturasTile);

    expect(screen.getByTestId('candidaturas-page')).toBeInTheDocument();
  });

  it('perfil tile navigates to /candidato/perfil', () => {
    renderDashboard();

    const perfilTile = findTileByExactHref('/candidato/perfil');
    fireEvent.click(perfilTile);

    expect(screen.getByTestId('perfil-page')).toBeInTheDocument();
  });

  it('configuracoes tile navigates to /candidato/configuracoes', () => {
    renderDashboard();

    const configTile = findTileByExactHref('/candidato/configuracoes');
    fireEvent.click(configTile);

    expect(screen.getByTestId('configuracoes-page')).toBeInTheDocument();
  });

  it('renders with zero data without crashing', () => {
    renderDashboard({
      candidate: null,
      applications: [],
      publishedJobs: [],
      favorites: [],
      jobAlerts: [],
      matchResults: [],
      candidateContext: null,
    });

    expect(
      screen.getByRole('heading', { name: /Área do Candidato/i }),
    ).toBeInTheDocument();
    const allLinks = screen.getAllByRole('link');
    const tiles = allLinks.filter((a) =>
      a.getAttribute('href')?.startsWith('/candidato/'),
    );
    expect(tiles).toHaveLength(8);
  });

  it('shows correct stats description for vagas tile from publishedJobs, favorites and matchResults', () => {
    renderDashboard({
      publishedJobs: [{ id: 'j1' }, { id: 'j2' }] as PublishedJobWithSkills[],
      favorites: [{ id: 'f1', job_id: 'j1' }] as FavoriteJobWithJob[],
      matchResults: [
        {
          job: { id: 'j1' } as PublishedJobWithSkills,
          match: {
            score: 75,
            percentage: 0.75,
            breakdown: [],
            reasons: [],
            algorithm_version: '1.0',
          },
        },
      ],
    });

    const vagasTile = findTileByExactHref('/candidato/vagas');
    expect(
      within(vagasTile).getByText(/Disponíveis 2 vagas/i),
    ).toBeInTheDocument();
  });
});
