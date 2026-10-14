# POC vs Core Contracts Comparison

**Date:** 2026-10-14  
**Baseline:** `5759a0b` (POC) vs `c8ce3ee` (Core Contracts extracted to `src/core/`)

---

## Summary

The POC (`src/platform/cells/poc/`) and Core Contracts (`src/core/`) serve **different purposes**:

| Aspect           | POC (`5759a0b`)                 | Core Contracts (`src/core/`)                          |
| ---------------- | ------------------------------- | ----------------------------------------------------- |
| **Purpose**      | Experimental React-based demo   | Production-ready pure TypeScript contracts            |
| **Architecture** | React Context + Components      | Pure functions + Classes (no React)                   |
| **Scope**        | Route resolution + demo cell    | Identity, Authorization, Execution, Registry, Tenancy |
| **Testing**      | 2 test files (security + basic) | 40 isolated unit tests passing                        |
| **Dependencies** | React, Supabase client          | Zero external deps (only shared types)                |

---

## File-by-File Comparison

### 1. Types (`types.ts`)

**POC** - Minimal cell-centric types:

- `CellId`, `CellContext`, `CellDefinition`, `CellRegistryEntry`, `RouteResolution`, `ExecutionContextValue`

**Core** - Comprehensive domain types (130 lines):

- `UUID`, `Permission`, `Role`, `RolePermission`, `TenantMembership`, `Person`, `AuthUser`
- `CellRoute`, `CellContract`, `DispatcherAction`, `ExecutionContext`
- `AuditLogEntry`, `IdentityContext`, `CoreErrorCode`, `CoreResult<T>`

**Key Difference:** Core types model the **actual Supabase schema** (roles with `is_global`, permissions with `module`, tenant memberships with `status`), while POC types are simplified for demo.

---

### 2. CellRegistry vs CellRegistryContract

**POC** (`CellRegistry.ts` - 35 lines):

- Functions operating on a module-level `Map`
- `registerCell`, `getCellById`, `getAllCells`, `getCellsByModule`, `clearRegistry`
- Works with `CellDefinition` (includes React component)

**Core** (`CellRegistryContract.ts` - 118 lines):

- `CellRegistry` class with private state
- `register`, `unregister`, `get`, `getEnabled`, `getAll`, `getByModule`, `has`, `stats`, `clear`
- Works with `CellContract` (no React component, includes `enabled` flag)
- Singleton instance `cellRegistry` exported
- Statistics tracking (total/enabled/disabled/byModule)

**Key Difference:** Core is a proper class with encapsulation, statistics, and enabled/disabled state management.

---

### 3. Dispatcher vs AuthorizationContract

**POC** (`Dispatcher.ts` - 69 lines):

- `resolveRoute(currentRoute, moduleId)` — route matching by prefix
- `buildContext(tenantId, userId, routeId, moduleId, action, resourceId)` — builds `CellContext`
- `validateContext(context)` — structural validation
- **Purpose:** Route → Cell resolution

**Core** (`AuthorizationContract.ts` - 155 lines):

- `computeEffectivePermissions(roles, rolePermissions, permissionRecords)` — role chain resolution
- `decidePermission(effectivePermissions, permissionName, ...)` — default-deny decision
- `hasAnyPermission`, `hasAllPermission` — route-level checks
- `getPermissionScope` — global vs tenant scope
- **Purpose:** Permission-based authorization decisions

**Key Difference:** **Completely different responsibilities.** POC Dispatcher resolves routes; Core AuthorizationContract decides permissions. They are complementary, not replacements.

---

### 4. ExecutionContext vs ExecutionContract

**POC** (`ExecutionContext.tsx` - 49 lines):

- React Context Provider (`ExecutionContextProvider`)
- Hook `useExecutionContext()`
- Holds: `tenantId`, `userId`, `currentRoute`, `currentModule`, `currentAction`, `isReady`
- **Purpose:** React component tree context propagation

**Core** (`ExecutionContract.ts` - 63 lines):

- `validateExecutionContext(context)` — structural validation (personId, roleIds, permissions required)
- `generateCorrelationId()` — tracing
- `buildExecutionContext(tenantId, personId, roleIds, permissions)` — builds `ExecutionContext` type
- `assertValidContext(context)` — throws on invalid
- **Purpose:** Structural validation + correlation IDs for service layer

**Key Difference:** POC is React-specific context; Core is pure validation for service/Edge Function layer.

---

### 5. DemoCell vs IdentityContract

**POC** (`DemoCell.tsx` - 87 lines):

- React component fetching `candidate_portal_modules` from Supabase
- Uses `useExecutionContext` hook
- **Purpose:** Demo UI cell

**Core** (`IdentityContract.ts` - 104 lines):

- `validatePersonLink(authUser, person)` — auth ↔ person linkage
- `resolveActiveTenant(memberships, requestedTenantId)` — tenant resolution
- `buildIdentityContext(authUser, person, memberships, currentTenantId)` — builds `IdentityContext`
- `canExecuteBusinessOperation(identity)` — business operation guard
- **Purpose:** Pure identity/tenant validation logic

**Key Difference:** POC is a demo UI component; Core is reusable identity validation logic.

---

### 6. TenantContract (Core only)

**Core** (`TenantContract.ts` - 72 lines):

- `validateTenantContext(person, memberships, requestedTenantId)` — client tenantId verified against server memberships
- `assertTenantMatch(contextTenantId, requestedTenantId)` — defense in depth for service layer
- **Purpose:** Tenant isolation enforcement

**POC:** No equivalent — tenant validation was implicit in `buildContext`.

---

## Architecture Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                        POC (5759a0b)                            │
├─────────────────────────────────────────────────────────────────┤
│  types.ts           → CellContext, CellDefinition, RouteResolution
│  CellRegistry.ts    → Module-level Map functions
│  Dispatcher.ts      → resolveRoute, buildContext, validateContext
│  ExecutionContext.tsx → React Context Provider + Hook
│  DemoCell.tsx       → React Component (Supabase query)
│  poc-entry.tsx      → POC App Entry Point
│  poc.test.ts        → Registry + Dispatcher tests
│  poc-security.test.ts → Security boundary tests
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ EVOLUTION (not direct migration)
┌─────────────────────────────────────────────────────────────────┐
│                      Core Contracts (c8ce3ee)                   │
├─────────────────────────────────────────────────────────────────┤
│  types.ts                    → Domain types (Permission, Role, Person, etc.)
│  registry/CellRegistryContract.ts → Class-based registry with stats
│  authorization/AuthorizationContract.ts → Default-deny permission decisions
│  execution/ExecutionContract.ts → Structural validation + correlation IDs
│  identity/IdentityContract.ts → Auth↔Person linkage + tenant resolution
│  tenancy/TenantContract.ts    → Client tenantId verification
│  __tests__/contracts.test.ts  → 40 isolated unit tests (ALL PASS)
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Points with Current Architecture

### What Exists in Production (Already Working)

| Component       | Location                                  | Status                                           |
| --------------- | ----------------------------------------- | ------------------------------------------------ |
| ModuleRouter    | `src/platform/router/ModuleRouter.tsx`    | ✅ Routes modules by permissions                 |
| ModuleRegistry  | `src/components/portal/ModuleRegistry.ts` | ✅ 28 modules registered                         |
| AuthContext     | `src/contexts/AuthContext.tsx`            | ✅ Tenant-isolated role loading (STAGE2 applied) |
| PermissionGuard | `src/components/auth/PermissionGuard.tsx` | ✅ Route protection                              |
| Public Routes   | 28 routes with `PublicLayout`             | ✅ Immutable per governance                      |

### What Core Contracts Provide (Ready for Integration)

| Contract                | Can Replace / Enhance                                            |
| ----------------------- | ---------------------------------------------------------------- |
| `AuthorizationContract` | PermissionGuard logic, ModuleRouter permission checks            |
| `IdentityContract`      | AuthContext identity validation, AccountContext tenant switching |
| `ExecutionContract`     | Service layer validation, Edge Function context building         |
| `CellRegistryContract`  | ModuleRegistry enhancement (stats, enabled/disabled)             |
| `TenantContract`        | switchTenant validation, cross-tenant request verification       |

---

## Divergences to Resolve (Passagem D)

From `levantamento_estrutural_chat.md` §12, the critical divergences are **data schema** issues, not contract issues:

1. **`applications` table** — Recrutamento expects different columns than DB has
2. **`candidate_preferences`** — Table doesn't exist (221 tables in prod)
3. **`candidate_courses`** — Column mismatch (`hours`/`completed_at` vs `completion_date`/`expiration_date`)
4. **Chat schema** — Code uses `visitor_id`, `subject`, `role`; DB has `tenant_id`, `type`, `title`, `sender_type`, `sender_person_id`
5. **n8n `handoff` function** — Not deployed (only `noop-doc-check`, `turnstile-siteverify` exist)

**These are schema/contract mismatches between frontend expectations and Supabase reality** — not issues with the core contracts themselves.

---

## Recommendation

### Phase 3 Complete: Comparison Done

The core contracts in `src/core/` are **production-ready**, **well-tested** (40 tests), and **architecturally sound** (pure functions, default-deny, tenant isolation). They are **not** a direct evolution of the POC — they are a proper extraction from the `c8ce3ee` baseline that modeled the real Supabase schema.

### Next: Passagem C — Matriz Banco ↔ Código ↔ Célula

**Action Required:** Build the complete matrix mapping:

- Each Supabase table → Responsible module (cell)
- Each table → Frontend screens (CRUD pages)
- Each table → Repositories/Services
- Each table → Permissions required
- Each table → RLS policies
- Each table → Tests needed

This matrix already exists historically (dated 2026-10-08 per `levantamento_estrutural_chat.md` §84) but needs to be reconstructed with current state including:

- Local working tree changes (34 modified files)
- AuthContext tenant isolation (STAGE2 diff applied)
- Core contracts extracted
- Financeiro module restoration (commit `a69d00b`)

---

## Files Created/Modified in This Session

- `governance/checkpoint-20261014` branch created
- `docs/architecture/poc-vs-core-contracts-comparison.md` (this file)
- Committed: `GOVERNANCE-RULES.md`, `levantamento_estrutural_chat.md`, `p0_audit_readonly.md.fixed2`, `STAGE2_DIFF.md`

---

**Status:** Ready for Passagem C (Matrix reconstruction) with explicit authorization.
