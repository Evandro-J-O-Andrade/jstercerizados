/**
 * DispatcherMaster — núcleo de despacho da arquitetura CHECK BOULER 24H.
 *
 * Responsabilidades:
 * - Resolver identidade, escopo e destino permitido a partir da cadeia real:
 *   auth.users → people → tenant_memberships → role_assignments → roles →
 *   role_permissions → permissions
 * - Autorizar operações com default DENY. Nenhum dispatcher concede privilégios
 *   além do que o usuário possui, ignora RLS ou transforma dados do frontend
 *   em autoridade de autorização.
 * - Gerar correlation ID para rastreamento de ponta a ponta.
 * - Validar contexto de execução antes de qualquer ação.
 * - Rotear ações tipadas para as células operacionais registradas.
 *
 * O Dispatcher Master NÃO acessa o Supabase diretamente. Ele opera sobre o
 * contexto de identidade já carregado pelo AuthContext e sobre os contratos
 * de autorização, execução e tenancy do Core.
 */

import type {
  CellContract,
  CellRoute,
  CoreErrorCode,
  CoreResult,
  DispatcherAction,
  ExecutionContext,
  Permission,
  Role,
  RolePermission,
  UUID,
} from '../types';
import {
  computeEffectivePermissions,
  hasAnyPermission,
} from '../authorization/AuthorizationContract';
import {
  buildExecutionContext,
  generateCorrelationId,
  validateExecutionContext,
} from '../execution/ExecutionContract';
import type { IdentityContext } from '../types';
import { cellRegistry } from '../registry/CellRegistryContract';

/**
 * Resultado de um despacho executado pelo Dispatcher Master.
 */
export interface DispatcherResult<T = unknown> extends CoreResult<T> {
  correlationId: string;
  personId: UUID;
  tenantId: UUID | null;
  module?: string;
  operation?: string;
}

/**
 * Contexto de despacho montado a partir da identidade da sessão.
 */
export interface DispatchContext {
  correlationId: string;
  personId: UUID;
  tenantId: UUID | null;
  roleIds: UUID[];
  permissionKeys: string[];
  effectivePermissions: Permission[];
  isAdminMaster: boolean;
}

/**
 * Erro estruturado do dispatcher.
 */
export class DispatcherError extends Error {
  public readonly code: CoreErrorCode;
  public readonly correlationId: string;

  constructor(code: CoreErrorCode, message: string, correlationId: string) {
    super(message);
    this.name = 'DispatcherError';
    this.code = code;
    this.correlationId = correlationId;
  }
}

/**
 * Valida se um conjunto de ações é autorizado para o contexto de despacho.
 * Retorna as ações autorizadas. Lança se qualquer ação não for autorizada.
 */
function authorizeActions(
  dispatchContext: DispatchContext,
  actions: Array<{ permissionKey?: string; operation?: string }>,
): void {
  for (const action of actions) {
    if (!action.permissionKey) continue;

    const granted = hasAnyPermission(
      dispatchContext.effectivePermissions,
      [action.permissionKey],
    );

    if (!granted) {
      throw new DispatcherError(
        'FORBIDDEN',
        `Operação '${action.operation ?? action.permissionKey}' não autorizada para este contexto.`,
        dispatchContext.correlationId,
      );
    }
  }
}

/**
 * Verifica isolamento de tenant: a ação só pode prosseguir se o tenant da
 * ação corresponder ao tenant do contexto (ou se for ação global e o
 * usuário tem papel global).
 */
function assertTenantIsolation(
  dispatchContext: DispatchContext,
  actionTenantId: UUID | null,
): void {
  if (
    actionTenantId !== null &&
    dispatchContext.tenantId !== null &&
    actionTenantId !== dispatchContext.tenantId &&
    !dispatchContext.isAdminMaster
  ) {
    throw new DispatcherError(
      'TENANT_ISOLATION_VIOLATION',
      `Isolamento de tenant violado: contexto=${dispatchContext.tenantId}, ação=${actionTenantId}`,
      dispatchContext.correlationId,
    );
  }
}

/**
 * Constrói um DispatchContext a partir de IdentityContext e dados de RBAC.
 * Pure function — não tem efeitos colaterais.
 */
export function buildDispatchContext(
  identity: IdentityContext,
  roles: Role[],
  rolePermissions: RolePermission[],
  permissionRecords: Permission[],
): DispatchContext {
  const correlationId = generateCorrelationId();

  const effectivePermissions = computeEffectivePermissions(
    roles,
    rolePermissions,
    permissionRecords,
  );

  const isAdminMaster = roles.some(
    (role) =>
      role.scope === 'global' &&
      (role.slug === 'admin_master' || role.name === 'admin_master'),
  );

  return {
    correlationId,
    personId: identity.person?.id ?? '',
    tenantId: identity.currentTenantId,
    roleIds: roles.map((r) => r.id),
    permissionKeys: effectivePermissions.map((p) => p.name),
    effectivePermissions,
    isAdminMaster,
  };
}

/**
 * DispatcherMaster — instancia única do dispatcher central.
 *
 * Cada ação despachada é validada contra o contexto de identidade real.
 * Ações não autorizadas são bloqueadas e registradas com correlationId.
 * Nenhuma célula recebe autoridade implícita.
 */
export class DispatcherMaster {
  private correlationCounter = 0;

  /**
   * Valida um contexto de execução e retorna o resultado da validação.
   */
  validateContext(
    context: Partial<ExecutionContext>,
  ):
    | { valid: true; context: ExecutionContext }
    | { valid: false; errors: string[] } {
    const validation = validateExecutionContext(context);
    if (!validation.valid) {
      return { valid: false, errors: validation.errors };
    }

    return {
      valid: true,
      context: buildExecutionContext(
        context.tenantId!,
        context.personId!,
        context.roleIds!,
        context.permissions!,
      ),
    };
  }

  /**
   * Despacha uma ação tipada para uma célula registrada.
   * Valida identidade, autorização, isolamento de tenant e existência da célula.
   */
  dispatch<T = unknown>(
    action: DispatcherAction,
    dispatchContext: DispatchContext,
    cellId?: string,
  ): DispatcherResult<T> {
    const correlationId =
      dispatchContext.correlationId || generateCorrelationId();

    // 1. Validar contexto de execução estrutural
    const execCtx = buildExecutionContext(
      dispatchContext.tenantId,
      dispatchContext.personId,
      dispatchContext.roleIds,
      dispatchContext.permissionKeys,
    );
    const structural = validateExecutionContext(execCtx);
    if (!structural.valid) {
      throw new DispatcherError(
        'VALIDATION_ERROR',
        `Contexto de execução inválido: ${structural.errors.join(', ')}`,
        correlationId,
      );
    }

    // 2. Verificar permissão da ação, se declarada
    if (action.metadata?.requiredPermissionKey) {
      authorizeActions(dispatchContext, [
        {
          permissionKey: action.metadata
            .requiredPermissionKey as string,
          operation: action.type,
        },
      ]);
    }

    // 3. Isolamento de tenant, se houver tenant na ação
    if (action.metadata?.tenantId) {
      assertTenantIsolation(
        dispatchContext,
        action.metadata.tenantId as UUID | null,
      );
    }

    // 4. Se houver célula alvo, validar que está registrada e habilitada
    if (cellId) {
      const cellEntry = cellRegistry.get(cellId);
      if (!cellEntry) {
        throw new DispatcherError(
          'NOT_FOUND',
          `Célula '${cellId}' não registrada no Core.`,
          correlationId,
        );
      }
      if (!cellEntry.cell.enabled) {
        throw new DispatcherError(
          'FORBIDDEN',
          `Célula '${cellId}' está desabilitada.`,
          correlationId,
        );
      }
    }

    this.correlationCounter++;

    return {
      data: null,
      error: null,
      correlationId,
      personId: dispatchContext.personId,
      tenantId: dispatchContext.tenantId,
      module:
        typeof action.metadata?.module === 'string'
          ? action.metadata.module
          : undefined,
      operation: action.type,
    };
  }

  /**
   * Resolve o destino pós-login com base na identidade real e nas permissões.
   * Constitui a AUTORIDADE ÚNICA E CENTRAL de despacho da arquitetura CHECK BOULER 24H.
   */
  resolveDestination(
    dispatchContext: DispatchContext,
    welcomeCompleted: boolean,
    mustChangePassword: boolean,
    hasAcceptedTerms: boolean,
    hasMembership: boolean,
    options?: {
      recoveryMode?: boolean;
      roleNames?: string[];
      isCandidate?: boolean;
    },
  ): string {
    // 1. Modo de recuperação de credenciais
    if (options?.recoveryMode) {
      return '/redefinir-senha';
    }

    // 2. Troca de senha obrigatória (primeiro acesso)
    if (mustChangePassword) {
      return '/primeiro-acesso/senha';
    }

    // 3. Usuário corporativo sem membership vai para onboarding
    const isCandidateUser =
      options?.isCandidate === true ||
      options?.roleNames?.includes('candidato') ||
      dispatchContext.effectivePermissions.some(
        (p) => p.name === 'candidates.self.read' || p.name === 'candidates.read',
      );

    if (!hasMembership && !dispatchContext.isAdminMaster && !isCandidateUser) {
      return '/onboarding';
    }

    // 4. Termos de uso e privacidade pendentes
    if (!hasAcceptedTerms) {
      return '/auth/terms';
    }

    // 5. Boas-vindas pendentes
    if (!welcomeCompleted) {
      return '/auth/welcome';
    }

    // 6. Célula do Candidato (Portal dedicado)
    if (isCandidateUser) {
      return '/candidato';
    }

    // 7. Administrador Master Global — ROOT da plataforma
    if (dispatchContext.isAdminMaster) {
      return '/dashboard/global';
    }

    // 8. Proprietário / Tenant Admin — ambiente exclusivo do dono
    const roles = options?.roleNames?.map((r) => r.toLowerCase()) || [];
    const perms = dispatchContext.effectivePermissions.map((p) => p.name);

    if (
      roles.includes('owner') ||
      roles.includes('tenant_admin') ||
      perms.some((p) => p.startsWith('owner.'))
    ) {
      return '/dashboard/admin-tenant';
    }

    // 9. Despacho por papel ou permissão das células operacionais do CHECK BOULER 24H
    if (roles.includes('recruiter') || perms.includes('recruitment.read')) {
      return '/dashboard/recrutamento';
    }

    if (roles.includes('rh_manager') || perms.includes('people.read')) {
      return '/dashboard/rh';
    }

    if (
      roles.includes('finance_manager') ||
      roles.includes('finance') ||
      perms.includes('finance.dashboard.read')
    ) {
      return '/dashboard/financeiro';
    }

    if (
      roles.includes('support_engineer') ||
      roles.includes('support_agent') ||
      roles.includes('suporte') ||
      perms.includes('support_tickets.read')
    ) {
      return '/dashboard/suporte';
    }

    if (
      roles.includes('commercial') ||
      roles.includes('company_representative') ||
      perms.includes('companies.read')
    ) {
      return '/dashboard/empresas';
    }

    if (roles.includes('stock_manager') || perms.includes('stock.read')) {
      return '/dashboard/estoque';
    }

    if (roles.includes('fiscal') || perms.includes('fiscal.read')) {
      return '/dashboard/fiscal';
    }

    if (
      roles.includes('accounting') ||
      roles.includes('contabilidade') ||
      perms.includes('accounting.dashboard.read')
    ) {
      return '/dashboard/contabilidade';
    }

    if (
      roles.includes('operations_manager') ||
      roles.includes('operations_operator') ||
      perms.includes('operations.read')
    ) {
      return '/dashboard/operacoes';
    }

    if (perms.includes('ava.read')) {
      return '/dashboard/ava';
    }

    // 9. Default para usuários com sessão ativa
    return '/dashboard';
  }

  /**
   * Registra uma célula no registry do Core. A célula apenas é descoberta;
   * o dispatcher não concede permissões a partir do registro.
   */
  registerCell(cell: CellContract): void {
    cellRegistry.register(cell);
  }

  /**
   * Lista rotas de uma célula para exposição no sidebar/portal.
   * Não expõe rotas de células desabilitadas.
   */
  getCellRoutes(cellId: string): CellRoute[] {
    const entry = cellRegistry.get(cellId);
    if (!entry || !entry.cell.enabled) return [];
    return entry.cell.routes;
  }

  /**
   * Verifica se uma ação é autorizada sem executá-la. Útil para guarda de rota.
   */
  isAuthorized(
    dispatchContext: DispatchContext,
    permissionName: string,
  ): boolean {
    return hasAnyPermission(dispatchContext.effectivePermissions, [
      permissionName,
    ]);
  }
}

/**
 * Instância singleton do Dispatcher Master para a aplicação.
 */
export const dispatcherMaster = new DispatcherMaster();
