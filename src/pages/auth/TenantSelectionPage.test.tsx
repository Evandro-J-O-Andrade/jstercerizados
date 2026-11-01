import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockAuth = vi.hoisted(() => ({
  person: { full_name: 'Maria Souza' },
  tenantMemberships: [
    { id: 'membership-1', tenant_id: 'tenant-1', status: 'active' },
  ],
  currentTenantId: null as string | null,
  tenants: [{ id: 'tenant-1', name: 'Organização J&S' }],
  isAdminMaster: false,
  isCandidate: false,
  switchTenant: vi.fn(),
  resolvePostLoginDestination: vi.fn(() => '/dashboard/recrutamento'),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

import TenantSelectionPage from './TenantSelectionPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/selecionar-tenant']}>
      <Routes>
        <Route path="/selecionar-tenant" element={<TenantSelectionPage />} />
        <Route
          path="/dashboard/recrutamento"
          element={<p>Destino do dispatcher</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TenantSelectionPage', () => {
  beforeEach(() => {
    mockAuth.currentTenantId = null;
    mockAuth.isAdminMaster = false;
    mockAuth.isCandidate = false;
    mockAuth.switchTenant.mockReset().mockResolvedValue(undefined);
    mockAuth.resolvePostLoginDestination
      .mockReset()
      .mockReturnValue('/dashboard/recrutamento');
  });

  it('does not preselect even a single active membership', () => {
    renderPage();

    expect(screen.getByRole('radio')).not.toBeChecked();
    expect(
      screen.getByRole('button', { name: 'Confirmar contexto' }),
    ).toBeDisabled();
  });

  it('validates the explicit choice before dispatching to a module', async () => {
    const user = userEvent.setup();
    const view = renderPage();

    await user.click(screen.getByRole('radio', { name: /Organização J&S/ }));
    await user.click(
      screen.getByRole('button', { name: 'Confirmar contexto' }),
    );

    await waitFor(() =>
      expect(mockAuth.switchTenant).toHaveBeenCalledWith('tenant-1'),
    );

    mockAuth.currentTenantId = 'tenant-1';
    view.rerender(
      <MemoryRouter initialEntries={['/selecionar-tenant']}>
        <Routes>
          <Route path="/selecionar-tenant" element={<TenantSelectionPage />} />
          <Route
            path="/dashboard/recrutamento"
            element={<p>Destino do dispatcher</p>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('Destino do dispatcher'),
    ).toBeInTheDocument();
  });

  it('requires a new choice when the selected membership was revoked', async () => {
    const user = userEvent.setup();
    mockAuth.switchTenant.mockRejectedValueOnce(
      new Error('Membership revogada.'),
    );
    renderPage();

    await user.click(screen.getByRole('radio', { name: /Organização J&S/ }));
    await user.click(
      screen.getByRole('button', { name: 'Confirmar contexto' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nao foi possivel concluir esta acao. Tente novamente.',
    );
    expect(screen.getByRole('radio')).not.toBeChecked();
  });
});
