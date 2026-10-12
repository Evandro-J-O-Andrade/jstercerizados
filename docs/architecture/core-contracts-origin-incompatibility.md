# Core Contracts — Origin & Incompatibility Report

## Source
All 6 files extracted from commit **`c8ce3ee`** (agent baseline checkpoint, never merged to `main`):
- `src/core/types.ts`
- `src/core/authorization/AuthorizationContract.ts`
- `src/core/tenancy/TenantContract.ts`
- `src/core/execution/ExecutionContract.ts`
- `src/core/identity/IdentityContract.ts`
- `src/core/registry/CellRegistryContract.ts`

Commit `c8ce3ee` exists locally and contains the complete `src/core/` directory structure.

---

## Contract Summary

| Contract | Purpose | Key Guarantee |
|----------|---------|---------------|
| **AuthorizationContract** | Default-DENY permission decisions | No implicit grants; derived exclusively from `role_permissions` rows (no `granted` column in real DB) |
| **TenantContract** | Server-side tenant validation | Client `tenantId` NEVER trusted; verified against active `TenantMembership` |
| **ExecutionContract** | Structural context validation | Separates structural validation from authorization; generates correlation IDs |
| **IdentityContract** | Auth ↔ Person linkage | Distinguishes authentication (session) from authorization (domain identity + tenant) |
| **CellRegistryContract** | Typed cell discovery | Registry discovers cells; does NOT grant permissions |

---

## Incompatibilities with Current Codebase

### 1. `role_permissions` schema mismatch
**Contract assumption:** `RolePermission` interface includes optional `granted?: boolean` field for test fixtures.

**Real DB schema (`public.role_permissions`):**
```sql
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY,
  role_id uuid REFERENCES roles(id),
  permission_id uuid REFERENCES permissions(id),
  created_at timestamptz DEFAULT now()
  -- NO `granted` column — existence of row IS the grant
);
```

**Impact:** 
- `computeEffectivePermissions` correctly ignores `rp.granted` (commented in code)
- Test fixtures using `granted: false` will behave differently than real DB
- Must ensure integration layer filters by row existence only

### 2. `admin_master` handling
**Contract assumption:** `admin_master` is NOT special-cased; receives only permissions explicitly in `role_permissions`.

**Current codebase:** Multiple RLS policies and frontend checks use `is_admin_master()` zero-arg function which returns `true` for `admin_master` role.

**Impact:**
- Contract's `_isAdminMaster` parameter kept for API compatibility but unused
- Integration with `PermissionGuard`/`usePermissions` must reconcile: contract says "check effective permissions only", current code says "if admin_master then grant all"
- This is a **policy decision** not a code bug — requires architectural alignment

### 3. `IdentityContext` vs current `AuthContext`
**Contract:** `buildIdentityContext` is a pure function returning `IdentityContext` with:
- `authUser: AuthUser | null`
- `person: Person | null`  
- `memberships: TenantMembership[]`
- `currentTenantId: UUID | null`
- `availableTenants: { id, name }[]`
- `isAuthenticated: boolean`
- `isLoading: boolean`

**Current `AuthContext` (`src/contexts/AuthContext.tsx`):**
- Mixes React state, side effects, Supabase `onAuthStateChange` listeners
- No explicit `Person` linkage validation
- Tenant switching logic embedded in context
- `canAccessModule` uses `is_admin_master()` shortcut

**Impact:** Integration requires either:
- Adapting contract to work with existing `AuthContext` shape
- Or replacing `AuthContext` with contract-based identity resolution (breaking change)

### 4. `TenantContract` vs current tenant resolution
**Contract:** `validateTenantContext(person, memberships, requestedTenantId)` — pure function, server-side validation.

**Current codebase:** Tenant resolution happens in:
- `AuthContext` (client-side, trusts localStorage/sessionStorage)
- `AccountContext` (server calls but mixed with UI state)
- RLS policies (server-side but only via `is_admin_master()` / `current_tenant_id()`)

**Impact:** Contract provides defense-in-depth; integration must ensure server-side validation happens **before** any data access.

### 5. `CellRegistry` vs `ModuleRegistry` / `ModuleRouter`
**Contract:** `CellRegistry` — in-memory typed registry for `CellContract` with routes, permissions, dependencies.

**Current codebase:**
- `ModuleRegistry` (`src/core/ModuleRegistry.ts`) — similar but different interface
- `ModuleRouter` (`src/routes/ModuleRouter.tsx`) — React component with ErrorBoundary (removed in stash@{4})
- `cells/poc/` (8 POC files from `5759a0b`) — never integrated

**Impact:** Two competing registry systems. Contract's `CellRegistry` is simpler and typed; `ModuleRegistry` has lifecycle hooks. Need consolidation decision.

### 6. `ExecutionContext` not used anywhere
**Contract:** `ExecutionContext` with `correlationId`, `tenantId`, `userId`, `routeId`, `moduleId`, `action`, `resourceId`.

**Current codebase:** No equivalent structured execution context. Services/repositories pass params ad-hoc.

**Impact:** Adoption requires instrumenting service layer — significant but enables observability.

---

## Integration Blockers (Require Explicit Authorization)

| Integration Point | Blocker | Decision Needed |
|-------------------|---------|-----------------|
| `PermissionGuard` → `AuthorizationContract` | `admin_master` shortcut vs default-DENY | Policy: remove shortcut or keep both? |
| `AccountContext` → `TenantContract` | Client-trusted tenantId vs server validation | Architecture: where does validation live? |
| `AuthContext` → `IdentityContract` | React context vs pure functions | Refactor scope: incremental or replace? |
| `ModuleRouter` → `CellRegistry` | Two registry systems | Consolidate or deprecate one? |
| Service layer → `ExecutionContract` | No correlation IDs today | Instrument all services or opt-in? |

---

## Test Coverage
40 isolated unit tests in `src/core/__tests__/contracts.test.ts` — all passing.
Tests verify:
- Authorization: default-DENY, effective permissions, any/all checks
- Tenancy: active membership validation, mismatch rejection
- Execution: structural validation, correlation ID generation
- Identity: person linkage, tenant resolution, business operation gating
- Registry: register/unregister, filtering, stats, singleton

---

## Next Steps (Require Authorization)
1. **Integrate `AuthorizationContract` into `PermissionGuard`** — reconcile `admin_master` handling
2. **Integrate `TenantContract` into `AccountContext`** — add server-side validation layer
3. **Decide on registry consolidation** — `CellRegistry` vs `ModuleRegistry`
4. **Instrument service layer with `ExecutionContract`** — add correlation IDs

---

## Files Created (Phase 2A Complete)
```
src/core/
├── types.ts
├── authorization/
│   └── AuthorizationContract.ts
├── tenancy/
│   └── TenantContract.ts
├── execution/
│   └── ExecutionContract.ts
├── identity/
│   └── IdentityContract.ts
├── registry/
│   └── CellRegistryContract.ts
└── __tests__/
    └── contracts.test.ts
```

**No commits made.** All files are uncommitted and un-integrated per Phase 2A scope.