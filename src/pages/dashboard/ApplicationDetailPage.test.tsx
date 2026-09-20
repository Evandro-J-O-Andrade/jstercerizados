import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { applicationsRepository } from '@/repositories/applications.repository';
import ApplicationDetailPage from '@/pages/dashboard/ApplicationDetailPage';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/repositories/applications.repository', () => ({
  applicationsRepository: {
    findById: vi.fn(),
  },
}));

vi.mock('@/components/portal/ModuleWorkspace', () => ({
  ModuleWorkspace: ({ children, actions }: any) => (
    <div data-testid="module-workspace">
      {actions}
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children }: any) => <button>{children}</button>,
}));

const mockUseAuth = useAuth as any;
const mockFindById = applicationsRepository.findById as any;

describe('ApplicationDetailPage — IDOR Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses applicationsRepository.findById with tenant-scoped query', async () => {
    mockUseAuth.mockReturnValue({ currentTenantId: 'tenant-A' });
    mockFindById.mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/dashboard/candidaturas/app-1']}>
        <Routes>
          <Route
            path="/dashboard/candidaturas/:id"
            element={<ApplicationDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockFindById).toHaveBeenCalledWith('app-1', 'tenant-A');
    });
    expect(mockFindById).toHaveBeenCalledTimes(1);
  });

  it('BLOCKED: does not query when currentTenantId is null', async () => {
    mockUseAuth.mockReturnValue({ currentTenantId: null });

    render(
      <MemoryRouter initialEntries={['/dashboard/candidaturas/app-1']}>
        <Routes>
          <Route
            path="/dashboard/candidaturas/:id"
            element={<ApplicationDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(mockFindById).not.toHaveBeenCalled();
  });

  it('BLOCKED: does not query when id param is missing', async () => {
    mockUseAuth.mockReturnValue({ currentTenantId: 'tenant-A' });

    render(
      <MemoryRouter initialEntries={['/dashboard/candidaturas/']}>
        <Routes>
          <Route
            path="/dashboard/candidaturas/:id"
            element={<ApplicationDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(mockFindById).not.toHaveBeenCalled();
  });

  it('BLOCKED: passes tenantId from useAuth context, not from URL', async () => {
    mockUseAuth.mockReturnValue({ currentTenantId: 'tenant-A' });
    mockFindById.mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/dashboard/candidaturas/app-1']}>
        <Routes>
          <Route
            path="/dashboard/candidaturas/:id"
            element={<ApplicationDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockFindById).toHaveBeenCalledWith('app-1', 'tenant-A');
    });

    expect(mockFindById).toHaveBeenCalledWith('app-1', 'tenant-A');
  });

  it('BLOCKED: does not use direct getSupabaseClient query', async () => {
    const supabaseModule = await import('@/lib/supabase');
    const getSupabaseClientSpy = vi.spyOn(supabaseModule, 'getSupabaseClient');

    mockUseAuth.mockReturnValue({ currentTenantId: 'tenant-A' });
    mockFindById.mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/dashboard/candidaturas/app-1']}>
        <Routes>
          <Route
            path="/dashboard/candidaturas/:id"
            element={<ApplicationDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockFindById).toHaveBeenCalledWith('app-1', 'tenant-A');
    });

    expect(getSupabaseClientSpy).not.toHaveBeenCalled();
  });
});
