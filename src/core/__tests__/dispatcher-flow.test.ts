import { describe, it, expect } from 'vitest';
import { dispatcherMaster } from '../dispatcher/DispatcherMaster';
import type { DispatchContext } from '../dispatcher/DispatcherMaster';
import type { Permission } from '../types';

function createMockContext(overrides: Partial<DispatchContext> = {}): DispatchContext {
  return {
    correlationId: 'test-corr-1',
    personId: 'person-123',
    tenantId: 'tenant-456',
    roleIds: ['role-1'],
    permissionKeys: [],
    effectivePermissions: [],
    isAdminMaster: false,
    ...overrides,
  };
}

function createPermission(name: string): Permission {
  return {
    id: name,
    name,
    module: name.split('.')[0] || 'core',
    description: null,
    created_at: new Date().toISOString(),
  };
}

describe('CHECK BOULER 24H — DispatcherMaster Flow & State Machine', () => {
  it('1. Direciona para /redefinir-senha quando está em recoveryMode', () => {
    const ctx = createMockContext();
    const dest = dispatcherMaster.resolveDestination(
      ctx,
      false, // welcomeCompleted
      false, // mustChangePassword
      false, // hasAcceptedTerms
      false, // hasMembership
      { recoveryMode: true },
    );
    expect(dest).toBe('/redefinir-senha');
  });

  it('2. Direciona para /primeiro-acesso/senha no primeiro acesso com senha temporária', () => {
    const ctx = createMockContext();
    const dest = dispatcherMaster.resolveDestination(
      ctx,
      false, // welcomeCompleted
      true,  // mustChangePassword
      false, // hasAcceptedTerms
      true,  // hasMembership
    );
    expect(dest).toBe('/primeiro-acesso/senha');
  });

  it('3. Direciona para /auth/terms quando termos de uso estão pendentes', () => {
    const ctx = createMockContext();
    const dest = dispatcherMaster.resolveDestination(
      ctx,
      false, // welcomeCompleted
      false, // mustChangePassword
      false, // hasAcceptedTerms
      true,  // hasMembership
    );
    expect(dest).toBe('/auth/terms');
  });

  it('4. Direciona para /auth/welcome quando boas-vindas não foram concluídas', () => {
    const ctx = createMockContext();
    const dest = dispatcherMaster.resolveDestination(
      ctx,
      false, // welcomeCompleted
      false, // mustChangePassword
      true,  // hasAcceptedTerms
      true,  // hasMembership
    );
    expect(dest).toBe('/auth/welcome');
  });

  it('5. Direciona Candidato para /candidato mesmo sem membership de tenant', () => {
    const ctx = createMockContext({
      effectivePermissions: [createPermission('candidates.self.read')],
    });
    const dest = dispatcherMaster.resolveDestination(
      ctx,
      true,  // welcomeCompleted
      false, // mustChangePassword
      true,  // hasAcceptedTerms
      false, // hasMembership (candidato não tem tenant membership)
      { isCandidate: true, roleNames: ['candidato'] },
    );
    expect(dest).toBe('/candidato');
  });

  it('6. Direciona Administrador Master para /dashboard/global', () => {
    const ctx = createMockContext({
      isAdminMaster: true,
      roleIds: ['role-admin-master'],
    });
    const dest = dispatcherMaster.resolveDestination(
      ctx,
      true,  // welcomeCompleted
      false, // mustChangePassword
      true,  // hasAcceptedTerms
      true,  // hasMembership
      { roleNames: ['admin_master'] },
    );
    expect(dest).toBe('/dashboard/global');
  });

  it('7. Direciona Recrutador para /dashboard/recrutamento', () => {
    const ctx = createMockContext({
      effectivePermissions: [createPermission('recruitment.read')],
    });
    const dest = dispatcherMaster.resolveDestination(
      ctx,
      true,  // welcomeCompleted
      false, // mustChangePassword
      true,  // hasAcceptedTerms
      true,  // hasMembership
      { roleNames: ['recruiter'] },
    );
    expect(dest).toBe('/dashboard/recrutamento');
  });

  it('8. Direciona Gestor Financeiro para /dashboard/financeiro', () => {
    const ctx = createMockContext({
      effectivePermissions: [createPermission('finance.dashboard.read')],
    });
    const dest = dispatcherMaster.resolveDestination(
      ctx,
      true,  // welcomeCompleted
      false, // mustChangePassword
      true,  // hasAcceptedTerms
      true,  // hasMembership
      { roleNames: ['finance_manager'] },
    );
    expect(dest).toBe('/dashboard/financeiro');
  });

  it('9. Direciona Suporte para /dashboard/suporte', () => {
    const ctx = createMockContext({
      effectivePermissions: [createPermission('support_tickets.read')],
    });
    const dest = dispatcherMaster.resolveDestination(
      ctx,
      true,  // welcomeCompleted
      false, // mustChangePassword
      true,  // hasAcceptedTerms
      true,  // hasMembership
      { roleNames: ['support_agent'] },
    );
    expect(dest).toBe('/dashboard/suporte');
  });

  it('10. Direciona para /onboarding quando usuário corporativo não possui membership', () => {
    const ctx = createMockContext({
      isAdminMaster: false,
    });
    const dest = dispatcherMaster.resolveDestination(
      ctx,
      true,  // welcomeCompleted
      false, // mustChangePassword
      true,  // hasAcceptedTerms
      false, // hasMembership = false
      { isCandidate: false, roleNames: ['colaborador'] },
    );
    expect(dest).toBe('/onboarding');
  });

  it('11. Retorno após concluir boas-vindas: com welcomeCompleted=true, avança para a célula', () => {
    const ctx = createMockContext({
      effectivePermissions: [createPermission('recruitment.read')],
    });

    // Antes de concluir boas-vindas:
    const pendingDest = dispatcherMaster.resolveDestination(
      ctx,
      false, // welcomeCompleted = false
      false,
      true,
      true,
      { roleNames: ['recruiter'] },
    );
    expect(pendingDest).toBe('/auth/welcome');

    // Ao clicar em continuar (welcomeCompleted = true):
    const completedDest = dispatcherMaster.resolveDestination(
      ctx,
      true, // welcomeCompleted = true
      false,
      true,
      true,
      { roleNames: ['recruiter'] },
    );
    expect(completedDest).toBe('/dashboard/recrutamento');
  });
});

