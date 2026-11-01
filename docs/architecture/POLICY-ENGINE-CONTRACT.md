# POLICY-ENGINE-CONTRACT

**Versão:** 1.0  
**Data:** 2026-11-01  
**Escopo:** Core de autorização unificado (CHECK BOULER 24H)  
**Status:** Proposta para aprovação (implementação bloqueada até aprovação)  
**Responsável:** Core/Segurança

## 1. Objetivo

Unificar a lógica de autorização para o caso **ROOT/global** (`admin_master`) através de um **PolicyEngine** central, sem espalhar `if (isAdminMaster) return true` em múltiplos guards. O motor deve ser o ponto único de decisão, sem substituir RLS/RPC/Edge Functions (autorização definitiva continua server-side).

## 2. Princípios

- **Deny by default**: todo acesso negado a menos que explicitamente concedido ou autorizado por regra global válida.
- **Fonte única de verdade**: dados vêm do AuthContext (identidade real), do Core (contratos) e do Supabase (RBAC real). Nunca inferir privilégios do frontend.
- **ROOT é autoridade global, não membro de tenant**: `admin_master` com `scope='global'`, `tenant_id=NULL` pode operar globalmente ou em tenant explicitamente selecionado. Nunca criar memberships artificiais para ele.
- **Separação de responsabilidades**: Structural validation (ExecutionContract) ≠ Authorization (PolicyEngine). Dispatch (DispatcherMaster) continua autoridade de roteamento/despacho.
- **Sem bypass silencioso**: `isAdminMaster` deve ser tratado por regra explícita no PolicyEngine, auditável e rastreável por `correlationId`.
- **Compatível com schema real**: `role_permissions` **não** possui coluna `granted` (existência = concessão). `AuthorizationContract.computeEffectivePermissions` permanece como fonte de permissões efetivas derivadas da cadeia real.

## 3. Tipos e Contratos

### 3.1 PolicyContext

```ts
export interface PolicyContext {
  personId: UUID | null;
  tenantId: UUID | null;
  roles: Role[]; // papéis reais atribuídos
  rolePermissions: RolePermission[]; // grants reais
  permissions: Permission[]; // catálogos
  effectivePermissions: Permission[]; // computadas por AuthorizationContract
  isAdminMaster: boolean; // true se role global admin_master
  isCandidate?: boolean;
  isEmpresa?: boolean;
  correlationId?: string;
  environment?: 'dev' | 'staging' | 'prod';
  route?: string; // rota alvo (opcional)
  action?: string; // ação solicitada (opcional)
}
```

### 3.2 PolicyResource

```ts
export type PolicyResourceType =
  | 'route'
  | 'module'
  | 'cell'
  | 'permission'
  | 'tenant'
  | 'global-dashboard'
  | 'api'
  | 'ui-element';

export interface PolicyResource {
  type: PolicyResourceType;
  id?: string; // ex: '/dashboard/global', 'admin-master'
  module?: string;
  cellId?: string;
  requiredPermissions?: string[]; // permissões necessárias
  requireTenant?: boolean; // exige tenant selecionado
  allowGlobalOnly?: boolean; // apenas global/admin_master
  tenantScoped?: boolean; // operação restrita ao tenant
}
```

### 3.3 PolicyDecision

```ts
export interface PolicyDecision {
  granted: boolean;
  reason: string; // motivo auditável
  correlationId: string;
  appliedRules: string[]; // regras aplicadas em ordem
  requiresTenantSelection?: boolean;
  redirectTo?: string; // sugestão de redirecionamento
  scope: 'global' | 'tenant' | 'denied';
  audit: {
    evaluatedAt: string; // ISO8601
    contextHash?: string;
  };
}
```

## 4. Regras de Avaliação (ordem obrigatória)

A avaliação deve seguir esta ordem exata:

| Ordem | Regra                | Descrição                                                                                                                                                                                          | Resultado                                            |
| ----- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1     | **AUTHENTICATED**    | Verifica autenticação e person link válido.                                                                                                                                                        | Se inválido → `DENY`                                 |
| 2     | **ROOT_GLOBAL**      | Se `isAdminMaster === true`: autoriza acesso a recursos `global`/`admin-master`, rotas `/dashboard/global`, módulos/células globais. Pode operar sem `tenantId` se recurso permitir escopo global. | `GRANT` (scope: global) com regra `ROOT_GLOBAL`      |
| 3     | **TENANT_ISOLATION** | Se recurso é `tenantScoped` e não é global: exige `tenantId` válido e membership ativo. `admin_master` pode acessar tenant explicitamente selecionado com autorização global.                      | Se violado → `DENY` com `TENANT_ISOLATION_VIOLATION` |
| 4     | **PERMISSION_CHECK** | Avalia `requiredPermissions` contra `effectivePermissions` (derivadas por `computeEffectivePermissions`). Modo `any`/`all` conforme guard.                                                         | `GRANT` se atendido, senão prossegue                 |
| 5     | **ROLE_CHECK**       | Regras por papel quando aplicável (fallback controlado). Não substituir permissões.                                                                                                                | Conforme regra                                       |
| 6     | **DEFAULT_DENY**     | Nenhuma regra concedeu acesso.                                                                                                                                                                     | `DENY` (scope: denied)                               |

**Notas:**

- Regra 2 tem precedência para `admin_master` em recursos globais.
- `admin_master` **NUNCA** recebe privilégios implícitos por nome fora da regra ROOT_GLOBAL; permissões efetivas continuam sendo derivadas, mas o PolicyEngine pode conceder acesso a rotas/módulos globais mesmo se permissão específica não estiver listada.
- DispatcherMaster continua sendo a autoridade de despacho/roteamento pós-login. PolicyEngine é o ponto único de decisão para guards/UI.

## 5. Pontos de Integração

| Componente                              | Uso                                 | Observação                                                                              |
| --------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------- |
| `PermissionGuard`                       | Verificação de permissão/rota       | Deve consultar PolicyEngine. `admin_master` deve passar via regra ROOT_GLOBAL.          |
| `ProtectedRoute`                        | Guarda de rota com roles/permissões | Unificar bypass de `isAdminMaster`. Remover lógica duplicada.                           |
| `ModuleRouter`                          | Roteamento por módulo/célula        | Consumir decisão do PolicyEngine.                                                       |
| `DispatcherMaster.resolveDestination()` | Roteamento pós-login                | Já reconhece `isAdminMaster` (mantém). Pode delegar decisão a PolicyEngine futuramente. |
| `AuthContext`                           | Fonte de `PolicyContext`            | Fornecer `isAdminMaster`, `roles`, `effectivePermissions`, `tenantId`, etc.             |
| `Sidebar/Portal`                        | Renderização condicional            | Usar decisão do PolicyEngine para evitar renderização indevida.                         |

## 6. Requisitos de Implementação (futuro)

- **Localização:** `src/core/policy/PolicyEngine.ts` (singleton) com `evaluate(context, resource): PolicyDecision`
- **Sem side-effects:** Função pura sempre que possível. Audit via `correlationId`.
- **Testabilidade:** Unit tests para `admin_master` global, `admin_master` em tenant selecionado, tenant member, candidato, sem membership.
- **Compatibilidade:** Não quebrar `AuthorizationContract`, `DispatcherMaster`, `IdentityContract`, `ExecutionContract` existentes.
- **Auditoria:** `appliedRules` deve listar regras na ordem; logs estruturados com `correlationId`.
- **Performance:** Decisão síncrona, sem chamadas Supabase.

## 7. Critérios de Aceite

- [ ] Documento aprovado por Governança/Segurança
- [ ] `PermissionGuard` não contém `if (isAdminMaster) return true` espalhado manualmente (usa PolicyEngine)
- [ ] `ProtectedRoute` trata `admin_master` via PolicyEngine
- [ ] Rotas globais (`/dashboard/global`) acessíveis apenas por `admin_master` ou com regra explícita
- [ ] `admin_master` sem tenant selecionado pode acessar rotas globais; rotas tenant-scoped exigem tenant ou regra global
- [ ] Sem criação de memberships artificiais para `admin_master`
- [ ] RLS continua autoritativo (PolicyEngine é guard/UI, não substitui server-side)
- [ ] Testes cobrem casos críticos

## 8. Bloqueios

- **Implementação bloqueada** até aprovação deste contrato.
- Não modificar guards/contratos antes da aprovação.
- Não alterar RLS/migrations/funções/triggers/Edge Functions.
- Não fazer commit/push/deploy.

## 9. Referências

- `docs/architecture/02C.3-AUTORIZACAO-CONTRATO.md`
- `docs/02C.2.3-permission-contract-reconciliation.md`
- `docs/RBAC-ADMIN-MASTER-INVENTORY.md`
- `src/core/dispatcher/DispatcherMaster.ts`
- `src/core/authorization/AuthorizationContract.ts`
- `src/core/identity/IdentityContract.ts`
- `src/core/execution/ExecutionContract.ts`
- `src/components/auth/PermissionGuard.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/contexts/AuthContext.tsx`
