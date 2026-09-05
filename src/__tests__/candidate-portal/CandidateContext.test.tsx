import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CandidateProvider, useCandidate } from '@/contexts/CandidateContext';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { applicationsRepository } from '@/repositories/applications.repository';
import {
  favoriteJobsRepository,
  publicJobsRepository,
  candidateJobAlertsRepository,
} from '@/repositories/candidate-portal';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/repositories/candidates.repository', () => ({
  candidatesRepository: {
    findByPersonId: vi.fn(),
  },
}));

vi.mock('@/repositories/applications.repository', () => ({
  applicationsRepository: {
    findAll: vi.fn(),
  },
}));

vi.mock('@/repositories/candidate-preferences.repository', () => ({
  candidatePreferencesRepository: {
    findByCandidate: vi.fn(),
  },
}));

vi.mock('@/repositories/candidate-portal', () => ({
  favoriteJobsRepository: {
    listForCurrentPerson: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
  },
  publicJobsRepository: {
    findPublished: vi.fn(),
    findPublishedWithSkills: vi.fn(),
  },
  candidateJobAlertsRepository: {
    listForCurrentPerson: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockFindByPersonId = vi.mocked(candidatesRepository.findByPersonId);
const mockFindAllApps = vi.mocked(applicationsRepository.findAll);
const mockListFav = vi.mocked(favoriteJobsRepository.listForCurrentPerson);
const mockFindPublishedWithSkills = vi.mocked(
  publicJobsRepository.findPublishedWithSkills,
);
const mockListAlerts = vi.mocked(
  candidateJobAlertsRepository.listForCurrentPerson,
);
const mockAddFav = vi.mocked(favoriteJobsRepository.add);
const mockRemoveFav = vi.mocked(favoriteJobsRepository.remove);

function wrapper({ children }: { children: ReactNode }) {
  return <CandidateProvider>{children}</CandidateProvider>;
}

describe('CandidateContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindByPersonId.mockResolvedValue(null);
    mockFindAllApps.mockResolvedValue([]);
    mockListFav.mockResolvedValue([]);
    mockFindPublishedWithSkills.mockResolvedValue([]);
  });

  it('does not fetch when user is not a candidate', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'A', email: 'a@x.com' } as never,
      currentTenantId: 't1',
      isCandidate: false,
    } as never);

    const { result } = renderHook(() => useCandidate(), { wrapper });

    expect(result.current.candidate).toBeNull();
    expect(result.current.applications).toEqual([]);
    expect(mockFindByPersonId).not.toHaveBeenCalled();
  });

  it('fetches self + applications + published jobs + favorites on mount', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'A', email: 'a@x.com' } as never,
      currentTenantId: 't1',
      isCandidate: true,
    } as never);

    mockFindByPersonId.mockReset();
    mockFindByPersonId.mockResolvedValue({
      id: 'c1',
      person_id: 'p1',
      tenant_id: 't1',
    } as never);
    mockFindAllApps.mockReset();
    mockFindAllApps.mockResolvedValue([
      {
        id: 'a1',
        candidate: { person_id: 'p1' },
        current_stage: 'submitted',
      },
      {
        id: 'a2',
        candidate: { person_id: 'other' },
        current_stage: 'submitted',
      },
    ] as never);
    mockListFav.mockReset();
    mockListFav.mockResolvedValue([{ id: 'f1', job_id: 'j1' } as never]);
    mockFindPublishedWithSkills.mockReset();
    mockFindPublishedWithSkills.mockResolvedValue([
      { id: 'j1', title: 'Dev' } as never,
    ]);
    mockListAlerts.mockReset();
    mockListAlerts.mockResolvedValue([]);

    const { result } = renderHook(() => useCandidate(), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(mockFindByPersonId).toHaveBeenCalled();
    expect(result.current.candidate?.id).toBe('c1');
    expect(result.current.applications).toHaveLength(1);
    expect(result.current.applications[0]?.id).toBe('a1');
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favoriteIds.has('j1')).toBe(true);
    expect(result.current.publishedJobs).toHaveLength(1);
  });

  it('toggleFavorite adds when not present', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1' } as never,
      currentTenantId: 't1',
      isCandidate: true,
    } as never);

    mockListFav.mockResolvedValue([]);

    const { result } = renderHook(() => useCandidate(), { wrapper });

    await waitFor(() => expect(mockListFav).toHaveBeenCalled());

    await act(async () => {
      const out = await result.current.toggleFavorite('j1');
      expect(out).toEqual({});
    });

    expect(mockAddFav).toHaveBeenCalledWith('p1', 'j1', 't1');
  });

  it('toggleFavorite removes when present', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1' } as never,
      currentTenantId: 't1',
      isCandidate: true,
    } as never);

    mockListFav.mockResolvedValue([{ id: 'f1', job_id: 'j1' } as never]);

    const { result } = renderHook(() => useCandidate(), { wrapper });

    await waitFor(() =>
      expect(result.current.favoriteIds.has('j1')).toBe(true),
    );

    await act(async () => {
      const out = await result.current.toggleFavorite('j1');
      expect(out).toEqual({});
    });

    expect(mockRemoveFav).toHaveBeenCalledWith('j1');
  });

  it('returns error message when fetching fails', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1' } as never,
      currentTenantId: 't1',
      isCandidate: true,
    } as never);

    mockFindByPersonId.mockRejectedValue(new Error('DB down'));

    const { result } = renderHook(() => useCandidate(), { wrapper });

    await waitFor(() => expect(result.current.error).toBeTruthy());

    expect(result.current.error).toBeTruthy();
  });
});
