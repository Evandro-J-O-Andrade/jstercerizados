import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockAuth = vi.hoisted(() => ({
  isAuthenticated: true,
  isLoading: false,
  person: { id: 'person-1' },
  firstLoginState: {
    must_change_password: false,
    welcome_completed_at: 'done',
  },
  legalAcceptances: [{ document_type: 'terms' }],
  recoveryMode: false,
  tenantMemberships: [
    { id: 'membership-1', tenant_id: 'tenant-1', status: 'active' },
  ],
  currentTenantId: null as string | null,
  isAdminMaster: false,
  isCandidate: false,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

import { AuthRoute } from './AuthRoute';

function renderRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/dashboard/*"
          element={
            <AuthRoute>
              <p>Conteúdo tenant-scoped</p>
            </AuthRoute>
          }
        />
        <Route path="/selecionar-tenant" element={<p>Seleção de tenant</p>} />
        <Route
          path="/dashboard/global"
          element={
            <AuthRoute>
              <p>Administração global</p>
            </AuthRoute>
          }
        />
        <Route
          path="/dashboard/seguranca"
          element={
            <AuthRoute>
              <p>Segurança global</p>
            </AuthRoute>
          }
        />
        <Route path="/onboarding" element={<p>Onboarding</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuthRoute tenant context', () => {
  beforeEach(() => {
    mockAuth.isAuthenticated = true;
    mockAuth.isLoading = false;
    mockAuth.currentTenantId = null;
    mockAuth.isAdminMaster = false;
    mockAuth.isCandidate = false;
    mockAuth.tenantMemberships = [
      { id: 'membership-1', tenant_id: 'tenant-1', status: 'active' },
    ];
  });

  it('requires explicit selection for an active membership', () => {
    renderRoute('/dashboard/recrutamento');

    expect(screen.getByText('Seleção de tenant')).toBeInTheDocument();
    expect(
      screen.queryByText('Conteúdo tenant-scoped'),
    ).not.toBeInTheDocument();
  });

  it('allows the explicitly validated tenant context', () => {
    mockAuth.currentTenantId = 'tenant-1';
    renderRoute('/dashboard/recrutamento');

    expect(screen.getByText('Conteúdo tenant-scoped')).toBeInTheDocument();
  });

  it('keeps global Admin Master access independent of tenant context', () => {
    mockAuth.isAdminMaster = true;
    renderRoute('/dashboard/global');

    expect(screen.getByText('Administração global')).toBeInTheDocument();
  });

  it('keeps the global security route available without a tenant selection', () => {
    mockAuth.isAdminMaster = true;
    renderRoute('/dashboard/seguranca');

    expect(screen.getByText('Segurança global')).toBeInTheDocument();
  });
});
