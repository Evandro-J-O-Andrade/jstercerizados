# AUDIT REPORT — Auth Flow Contracts: Candidato vs Empresa

> **Chain:** GitHub (commit 05672b4) → Supabase Real (`okxqfyoqbhcmflpurfrw`) → Schema → Functions → Triggers → RLS → Frontend → Specs → Gaps
> **Mode:** READ-ONLY — no database or code changes
> **Data:** 2026-09-18

---

## 1. Definição Arquitetural Adotada

| Contexto  | Cadastro (único)                                | Login (único) | Identidade no Banco                         |
| --------- | ----------------------------------------------- | ------------- | ------------------------------------------- |
| Candidato | nome + email + telefone + senha + confirmação   | email + senha | `people` → `candidates` → `role`            |
| Empresa   | representante + empresa + email + phone + senha | email + senha | `people` → `companies` → `tenants` → `role` |
| Admin     | administrativo (convite)                        | email + senha | RBAC existente (`admin_master`)             |

**Regra:** Cadastro = autenticação + identidade mínima. Perfil = dados complementares.

---

## 2. Inventário de Rotas e Formulários no GitHub

### 2.1 Login flows

| Route               | Component                   | File                                | Contexto                         | Signup?     | OAuth?                |
| ------------------- | --------------------------- | ----------------------------------- | -------------------------------- | ----------- | --------------------- |
| `/login`            | `Login`                     | `src/pages/Login.tsx`               | Toggle (admin/candidato/empresa) | ✅ (inline) | ✅ (Google/Microsoft) |
| `/entrar`           | `EntrarHub` → `Login`       | `src/pages/auth/Entrar.tsx`         | null (show toggle)               | ✅          | ✅                    |
| `/entrar/admin`     | `EntrarAdmin` → `Login`     | `src/pages/auth/EntrarContexto.tsx` | `admin`                          | ❌          | ❌                    |
| `/entrar/candidato` | `EntrarCandidato` → `Login` | `src/pages/auth/EntrarContexto.tsx` | `candidato`                      | ✅          | ✅                    |
| `/entrar/empresa`   | `EntrarEmpresa` → `Login`   | `src/pages/auth/EntrarContexto.tsx` | `empresa`                        | ✅          | ✅                    |

**Finding:** `/entrar/*` routes are thin wrappers that all delegate to the same `Login.tsx` component with `requestedContext` prop. No `EntrarEmpresa.tsx` or `EntrarAdmin.tsx` files exist — they are re-exported from `EntrarContexto.tsx`.

### 2.2 Cadastro flows

| Route                 | Component           | File                              | Campos                                                                                                                     | Backend function                                                            |
| --------------------- | ------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `/cadastro`           | `Cadastro`          | `src/pages/Cadastro.tsx`          | None (landing page with 2 buttons)                                                                                         | N/A                                                                         |
| `/cadastro/candidato` | `CadastroCandidato` | `src/pages/CadastroCandidato.tsx` | full_name, email, phone, password, confirmPassword                                                                         | `AuthContext.register()` → `supabase.auth.signUp()`                         |
| `/cadastro/empresa`   | `CadastroEmpresa`   | `src/pages/CadastroEmpresa.tsx`   | full_name, company_name, email, phone, password, confirmPassword                                                           | `AuthContext.register()` → `supabase.auth.signUp()`                         |
| `/trabalhe-conosco`   | `TrabalheConosco`   | `src/pages/TrabalheConosco.tsx`   | name, cpf, rg, email, phone, city, positions, experience, courses, schedule, availability, resume, resumeFile, lgpdConsent | `submitCandidateApplication()` → direct `supabase.from()` INSERTs (NO auth) |
| `/parceiros`          | `Parceiros`         | `src/pages/Parceiros.tsx`         | company, cnpj, responsible, phone, email, area, city, state, documentation                                                 | `mockSubmitPartner()` → **localStorage mock** (no DB)                       |

### 2.3 AuthContext.register() — The single registration function

```ts
// AuthContext.tsx:1089
const register = async (
  email,
  password,
  profileData: {
    full_name: string;
    email: string;
    phone?: string;
    tenantId?: string;
    roleId?: string; // declared but NEVER used
    turnstileToken?: string;
    emailRedirectTo?: string;
  },
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: profileData.full_name,
        phone: profileData.phone ?? '',
      },
      emailRedirectTo: `${origin}${profileData.emailRedirectTo || '/entrar/candidato'}`,
    },
  });
  // ...
};
```

**Finding:** `register()` is a **single generic function** that:

- Calls `supabase.auth.signUp()` with `full_name` + `phone` in `user_metadata`
- Does NOT pass `signup_origin`, `tenantId`, or `roleId` to Supabase
- The only context differentiation is `emailRedirectTo` (client-side redirect URL)
- `tenantId` and `roleId` are in the interface but **never used**

### 2.4 AuthContext.login() — The single login function

```ts
// AuthContext.tsx:591
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

**Finding:** `login()` is **context-agnostic** — it always calls `signInWithPassword()`. The post-login context resolution happens in `resolvePostLoginDestination()`:

```ts
// AuthContext.tsx:1035
// Checks: recoveryMode → /redefinir-senha
//         no tenantMemberships → /onboarding
//         must_change_password → /primeiro-acesso/senha
//         no terms → /auth/terms
//         else → /auth/welcome
```

**No distinction between candidato vs empresa login** — the system determines context from `roleAssignments`/`roles` AFTER login.

---

## 3. Backend Real: Triggers on auth.users

### 3.1 What the MIGRATIONS say should exist

| Migration                                              | Function                               | Purpose                                                |
| ------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------ |
| `20260816000200_identity_people_auth.sql`              | `handle_new_auth_user()`               | Creates `people` on auth.users INSERT                  |
| `20260826000001_candidate_bootstrap.sql`               | `bootstrap_candidate_identity()`       | Full candidate provisioning (6-param)                  |
| `20260828000001_fix_bootstrap_identity.sql`            | `bootstrap_candidate_identity()`       | Full candidate provisioning (5-param, p_phone removed) |
| `20260909000001_fix_bootstrap_candidate_role_name.sql` | `bootstrap_candidate_from_auth_user()` | Trigger function: people + tenant + candidates + role  |
| `20260910000002_unify_first_login_state.sql`           | `bootstrap_candidate_from_auth_user()` | Same trigger, adds `signup_origin` support             |

### 3.2 What the REAL DATABASE ACTUALLY has (verified via direct query)

**Triggers on `auth.users`:**

| Trigger Name                             | Function                               | Event  | Creates                                                                                   |
| ---------------------------------------- | -------------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| `on_auth_user_created`                   | `handle_new_auth_user()`               | INSERT | `people` ONLY (no tenant_membership, no candidates, no role_assignments)                  |
| `on_auth_user_updated`                   | `handle_auth_user_updated()`           | UPDATE | Updates `people.email`                                                                    |
| `on_auth_user_deleted`                   | `handle_auth_user_deleted()`           | DELETE | NULLs `people.auth_user_id`                                                               |
| `trg_bootstrap_candidate_from_auth_user` | `bootstrap_candidate_from_auth_user()` | INSERT | `people` → `tenant_memberships` → `first_login_state` → `candidates` → `role_assignments` |

**Both triggers fire on the same `auth.users INSERT` event.** `handle_new_auth_user` provides basic `people` sync (idempotent), while `bootstrap_candidate_from_auth_user` provisions the full candidate chain.

**Real DB `bootstrap_candidate_from_auth_user()` definition:**

```sql
-- Creates: people → tenant_memberships → first_login_state → candidates → role_assignments (role = 'candidato')
-- WHERE r.name = 'candidato'  (corrected from 'candidate' by migration 20260909000001)
-- Uses signup_origin, must_change_password from first_login_state
```

**Real DB `handle_new_auth_user()` definition (lines 3991-3992):**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_meta jsonb;
  v_full_name text;
  v_email text;
BEGIN
  -- Creates/synchronizes people only — no tenant, no candidate, no role
  INSERT INTO public.people (id, auth_user_id, full_name, email, status)
  VALUES (gen_random_uuid(), new.id, v_full_name, v_email, 'active');
END;
$$;
```

**Finding (corrected):** `bootstrap_candidate_from_auth_user()` **DOES exist** in the real DB and is attached as `trg_bootstrap_candidate_from_auth_user`. The earlier audit's claim of its absence was incorrect.

The real trigger chain for `auth.users` INSERT is:

1. `handle_new_auth_user` — creates/synchronizes `people` (idempotent)
2. `bootstrap_candidate_from_auth_user` — creates `people` (idempotent), `tenant_memberships`, `first_login_state`, `candidates`, `role_assignments`

Both are correct for the **Candidato** flow — it creates `people` → `tenant_memberships` → `first_login_state` → `candidates` → `role_assignments` with `role = 'candidato'`.

### 3.3 RPC bootstrap_candidate_identity — exists but unused

| Overload             | Signature in Real DB                                                                                                                           | Status                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| v1 (5-param)         | `(p_auth_user_id uuid, p_full_name text, p_email text, p_tenant_id uuid DEFAULT NULL, p_role_id uuid DEFAULT NULL)`                            | 🟢 Exists in DB                          |
| v2 (6-param, legacy) | `(p_auth_user_id uuid, p_full_name text, p_email text, p_phone text DEFAULT NULL, p_tenant_id uuid DEFAULT NULL, p_role_id uuid DEFAULT NULL)` | 🟡 Orphaned — has `p_phone`, stale GRANT |

**Neither overload is called by any frontend code.** Zero references to `bootstrap_candidate_identity` in `src/`.

---

## 3e. STATE: Candidato backend is structurally correct

The real DB has two triggers on `auth.users` INSERT:

1. `handle_new_auth_user` — creates/synchronizes `people` (idempotent, basic sync)
2. `trg_bootstrap_candidate_from_auth_user` — provisions full candidate chain

The candidate flow is structurally correct in the real DB:

```text
auth.users INSERT
  → handle_new_auth_user() → people (create/sync)
  → bootstrap_candidate_from_auth_user() → people → tenant_memberships → first_login_state → candidates → role_assignments (role = 'candidato')
```

**Candidato backend: 🟢 CORRECT**

## 3f. STATE: Empresa backend does NOT exist

No equivalent trigger exists for empresa:

- No `bootstrap_company_from_auth_user()`
- No `bootstrap_empresa_from_auth_user()`
- No `bootstrap_company_identity()` RPC

**Any signup that calls `register()` → `supabase.auth.signUp()` provisions a CANDIDATO, not an empresa.**

**Empresa backend: 🔴 NOT IMPLEMENTED**

## 3g. STATE: Legado functions coexisting (orphaned)

| Function                                 | Signature                                                                 | Used by trigger? | Used by frontend?            |
| ---------------------------------------- | ------------------------------------------------------------------------- | ---------------- | ---------------------------- |
| `bootstrap_candidate_identity` (5-param) | `(p_auth_user_id, p_full_name, p_email, p_tenant_id, p_role_id)`          | ❌ No            | ❌ Zero references in `src/` |
| `bootstrap_candidate_identity` (6-param) | `(p_auth_user_id, p_full_name, p_email, p_phone, p_tenant_id, p_role_id)` | ❌ No            | ❌ Zero references in `src/` |
| `bootstrap_candidate_from_auth_user`     | () (trigger function)                                                     | ✅ Yes           | N/A (trigger, not RPC)       |
| `repair_candidate_chain`                 | `(p_person_id, p_tenant_id, p_role_code)`                                 | ❌ No            | ❌ Zero references in `src/` |

---

## 4. Supabase Real: Schema Tables (verified)

### Core identity chain (used by `bootstrap_candidate_from_auth_user`)

| Table                | Columns                                                                                                                                | Created by trigger?                                              | Read by frontend?                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| `people`             | `id`, `auth_user_id`, `full_name`, `email`, `phone`, `status`, `metadata`, `created_at`, `updated_at` (9 cols)                         | ✅ `handle_new_auth_user` + `bootstrap_candidate_from_auth_user` | ✅ `AuthContext.loadAuthData()`, `updateProfile()` |
| `tenants`            | `id`, `name`, `slug`, `status`, `created_at`, `updated_at` (6 cols)                                                                    | ❌                                                               | ✅ `currentTenantId`, `tenantIds`                  |
| `tenant_memberships` | `id`, `person_id`, `tenant_id`, `status`, `joined_at`, `created_at`, `updated_at`, `membership_role` (8 cols)                          | ✅ by `bootstrap_candidate_from_auth_user`                       | ✅ role resolution                                 |
| `first_login_state`  | (table exists)                                                                                                                         | ✅ by `bootstrap_candidate_from_auth_user`                       | ✅ `resolvePostLoginDestination`                   |
| `candidates`         | (table exists)                                                                                                                         | ✅ by `bootstrap_candidate_from_auth_user`                       | ✅ `/features/candidato/`                          |
| `roles`              | `id`, `name`, `description`, `scope`, `created_at`, `updated_at`, `status`, `slug`, `level`, `sector`, `replacement_role_id` (11 cols) | ❌ (seeded)                                                      | ✅ `isCandidate`, `isAdminMaster`                  |
| `role_assignments`   | `id`, `person_id`, `role_id`, `tenant_id`, `assigned_at`, `created_at`, `updated_at` (7 cols)                                          | ✅ by `bootstrap_candidate_from_auth_user`                       | ✅ permissions, `isCandidate`                      |

### Empresa tables (exist in DB, NOT connected to auth)

| Table                   | Key Columns                                                                                                                                                                                                                                                                                             | Provisioned by any trigger? | Used by frontend for auth? |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------- |
| `companies`             | `id`, `legal_name`, `trading_name`, `cnpj`, `cnpj_root`, `state_registration`, `municipal_registration`, `company_type_id`, `industry`, `phone`, `email`, `website`, `linkedin_url`, `logo_url`, `address` (jsonb), `size`, `status`, `is_active`, `metadata`, `created_at`, `updated_at`, `created_by` | ❌ None                     | ❌ Not connected to auth   |
| `company_relationships` | `id`, `company_id`, `tenant_id`, `relationship_type_id`, `status`, `started_at`, `ended_at`, `metadata`, `created_by`, `created_at`, `updated_at`                                                                                                                                                       | ❌ None                     | ❌ Not connected to auth   |
| `company_contacts`      | `id`, `company_id`, `person_id`, `tenant_id`, `role`, `is_primary`, `created_at`, `updated_at`                                                                                                                                                                                                          | ❌ None                     | ❌ Not connected to auth   |

### Roles in real DB

| Role Name                          | Scope  | Used by trigger?                           | Used by frontend?  |
| ---------------------------------- | ------ | ------------------------------------------ | ------------------ |
| `admin_master`                     | global | ❌                                         | ✅ `isAdminMaster` |
| `candidato`                        | tenant | ✅ by `bootstrap_candidate_from_auth_user` | ✅ `isCandidate`   |
| `tenant_admin`                     | tenant | ❌ (seeded)                                | ✅ post-login      |
| `recruiter`                        | tenant | ❌ (seeded)                                | ✅ post-login      |
| `rh_manager`                       | tenant | ❌ (seeded)                                | ✅                 |
| `finance`                          | tenant | ❌ (seeded)                                | ✅                 |
| `support`                          | tenant | ❌ (seeded)                                | ✅                 |
| `commercial`                       | tenant | ❌ (seeded)                                | ✅                 |
| `facilities_manager`               | tenant | ❌ (seeded)                                | ✅                 |
| `operator`                         | tenant | ❌ (seeded)                                | ✅                 |
| ... (15+ more tenant-scoped roles) |        |                                            |                    |
| **company_representative**         | tenant | ❌ **Does NOT exist**                      | ❌                 | **NO empresa role exists in DB** |

---

## 5. SPEC vs REAL Database Conflicts

### 5.1 `bootstrap_candidate_identity`

| Artifact                                       | State                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| Migration `20260826000001` (6-param)           | Applied to DB ✅, orphaned ⚸️                                         |
| Migration `20260828000001` (5-param)           | Applied to DB ✅                                                     |
| Migration `20260910000002` (unified 5-param)   | Applied to DB ✅                                                     |
| **Spec SQL file** (`supabase/specs/sql/*.sql`) | **❌ NOT found** — function is migration-only, no canonical spec     |
| Frontend usage                                 | **❌ Zero references** in `src/`                                     |
| Trigger attachment                             | **❌ NOT attached** to `auth.users`                                  |
| Stale GRANT                                    | `20260903000000_rbac_fixes.sql:79` grants on 6-param (never revoked) |

### 5.2 `bootstrap_candidate_from_auth_user`

| Artifact                        | State                                                           |
| ------------------------------- | --------------------------------------------------------------- |
| Migration `20260909000001`      | Claims applied ✅, but function **NOT in real DB**              |
| Migration `20260910000002`      | Claims applied ✅, but function **NOT in real DB**              |
| Real DB trigger on `auth.users` | Uses `handle_new_auth_user` (different function, minimal logic) |

### 5.3 `user_has_permission`

| Spec (`21_functions_triggers.sql:737`)                                                       | Real DB (`20260909000000` migration) | Conflict                                             |
| -------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------- |
| 4 params, `p_tenant_id` required (no DEFAULT)                                                | `p_tenant_id uuid default null`      | 🟠 Spec calls with 2 args will FAIL against spec def |
| Spec `27_finance.sql:299`: `user_has_permission(v_actor, 'financial_transactions.update')`   | DB: requires 2-arg variant           | 🟠 Mismatch                                          |
| Spec `35_recruitment_talent_pool.sql:62`: `user_has_permission(v_actor, 'recruitment.read')` | DB: requires 2-arg variant           | 🟠 Mismatch                                          |

### 5.4 `is_admin_master`

| Spec (`22_rls.sql:22`)                                                                 | Real DB                                                     | Conflict                                 |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| `ra.person_id = auth.uid()` (incorrect — auth.uid() is auth.users UUID, not people.id) | Joins through `people` table: `p.auth_user_id = auth.uid()` | 🟠 Spec has auth.uid() bug, DB corrected |
| Only 0-param version                                                                   | DB has 0-param AND 1-param (`auth_uid uuid`) overload       | ⚫ Orphaned overload in DB               |

---

## 6. The Core Problem: Two Signup Contracts, One Generic Handler

### What the frontend does

**Candidato signup** (`CadastroCandidato.tsx` + `Login.tsx` candidato mode):

```ts
registerUser(data.email, data.password, {
  email: data.email,
  full_name: data.full_name,
  phone: data.phone,         // ← phone IS sent for candidato
  emailRedirectTo: '/entrar/candidato',
  turnstileToken: ...,
});
```

**Empresa signup** (`CadastroEmpresa.tsx` + `Login.tsx` empresa mode):

```ts
registerUser(data.email, data.password, {
  email: data.email,
  full_name: data.full_name,
  phone: data.phone,         // ← phone IS sent for empresa
  emailRedirectTo: '/entrar/empresa',
  turnstileToken: ...,
});
// Note: company_name is collected but NEVER passed to backend!
```

Both call the **exact same `register()`** → `supabase.auth.signUp()`.

### What the backend does (real DB — CORRECTED)

**Both contexts** call `register()` → `supabase.auth.signUp()` → `auth.users` INSERT, which fires BOTH triggers:

```text
auth.users INSERT
  → handle_new_auth_user() → people (idempotent create/sync)
  → bootstrap_candidate_from_auth_user() → people → tenant_memberships → first_login_state → candidates → role_assignments (role = 'candidato')
```

**Result for Candidato:** ✅ Structurally correct — full chain provisioned with `role = 'candidato'`.
**Result for Empresa:** 🔴 WRONG — Empresa signup also creates a CANDIDATO record (`role = 'candidato'`), NOT an empresa/tenant. The `company_name` field is never transmitted to the backend.

**Candidato backend is structurally correct.** The problem is **not** that the trigger is missing — it's that it's the wrong trigger for Empresa context.

### What the `company_name` field does

`CadastroEmpresa.tsx` collects `company_name` but it is **NEVER sent to `register()`**. The `register()` function does not accept a `company_name` parameter. It is simply dropped.

### TrabalheConosco — A third, completely separate flow

`TrabalheConosco.tsx` does NOT call `register()`. It calls `submitCandidateApplication()` which:

1. Uploads resume to `curriculos/` storage bucket
2. Queries `people` by `auth_user_id` (requires EXISTING auth!)
3. INSERTs into `candidates` table
4. INSERTs into `candidate_documents`
5. INSERTs into `consents`

**Finding:** `TrabalheConosco.tsx` assumes the user is **already authenticated** — it queries `supabase.auth.getUser()` and reads `people.id`. But the form is on a **public route** (`/trabalhe-conosco` has no auth guard). If a non-authenticated user submits, the `people` query returns null → error "Usuário não identificado."

This is a **separate candidate submission flow** disconnected from the auth system — it neither creates an `auth.users` record nor a `people` record nor a login capability.

### Parceiros — Mock-only, no DB

`Parceiros.tsx` calls `mockSubmitPartner()` which writes to `localStorage`. No Supabase interaction. This is a **completely disconnected mock flow**.

---

## 7. Conflict Classification Matrix

| #   | Flow                 | Tela                             | Auth Context     | Backend Trigger        | Tables Created     | Role Assigned       | Status                    |
| --- | -------------------- | -------------------------------- | ---------------- | ---------------------- | ------------------ | ------------------- | ------------------------- |
| 1   | Candidato signup     | `/cadastro/candidato`            | Candidato        | `handle_new_auth_user` | `people` ONLY      | None                | 🔴 BROKEN                 |
| 2   | Candidato signup     | `/entrar/candidato` (Login mode) | Candidato        | `handle_new_auth_user` | `people` ONLY      | None                | 🔴 BROKEN                 |
| 3   | Empresa signup       | `/cadastro/empresa`              | Empresa          | `handle_new_auth_user` | `people` ONLY      | None (candidato?)   | 🔴 BROKEN + WRONG ROLE    |
| 4   | Empresa signup       | `/entrar/empresa` (Login mode)   | Empresa          | `handle_new_auth_user` | `people` ONLY      | None (candidato?)   | 🔴 BROKEN + WRONG ROLE    |
| 5   | Candidato submission | `/trabalhe-conosco`              | Nenhum (público) | None (direct INSERT)   | `candidates` only  | None                | 🔴 DISCONNECTED           |
| 6   | Parceiro submission  | `/parceiros`                     | Nenhum (público) | None (mock)            | localStorage only  | None                | 🟡 MOCK                   |
| 7   | Login all contexts   | `/entrar/*`, `/login`            | All              | `signInWithPassword`   | auth.users session | Resolved post-login | 🔴 Fails (no tenant/role) |

---

## 8. Root Cause Analysis (CORRECTED)

### Primary root cause

**No differentiation between Candidato and Empresa signup at the backend level.** Both `/cadastro/candidato` and `/cadastro/empresa` call the same `register()` → `supabase.auth.signUp()`, which fires the same `bootstrap_candidate_from_auth_user` trigger, creating a **candidate** record regardless of context. The `company_name` from `CadastroEmpresa.tsx` is collected but never passed to the backend.

### Secondary root cause

`register()` is a single undifferentiated function that does not accept `signup_origin`, `company_name`, or any context parameter. The `emailRedirectTo` URL is the only differentiator, and it is **purely client-side** — it does not affect backend provisioning.

### Tertiary root cause

`bootstrap_candidate_identity` RPC exists in two overloads (5-param + 6-param orphan) but **neither is consumed by any code**. It is a migration-only artifact with no spec contract.

### Quaternary root cause

The old spec docs (`docs/SITE-JS-TERCEIRIZADOS/08-SUPABASE.md`, `.ai/context/forms.md`) describe a mock/localStorage architecture with `/candidatos/login`, `/empresas/login` routes and flat tables (`candidatos`, `candidaturas`). These specs are **OBSOLETE** — the project evolved to RBAC (`people`, `candidates`, `tenants`, `roles`, `role_assignments`) but the old spec docs were never updated.

---

## 9. Definitive Conflict Matrix

| #   | Context     | Tela                              | Auth Function                    | Backend Trigger                      | Tables Created                                                | Role Assigned          | Status                                   |
| --- | ----------- | --------------------------------- | -------------------------------- | ------------------------------------ | ------------------------------------------------------------- | ---------------------- | ---------------------------------------- |
| 1   | Candidato   | `/cadastro/candidato`             | `signUp()` via `register()`      | `bootstrap_candidate_from_auth_user` | `people` → `tenant_memb` → `first_login_state` → `candidates` | `candidato`            | 🟢 CORRECT                               |
| 2   | Candidato   | `/entrar/candidato` (signup mode) | `signUp()` via `register()`      | `bootstrap_candidate_from_auth_user` | Same as #1                                                    | `candidato`            | 🟢 CORRECT                               |
| 3   | Empresa     | `/cadastro/empresa`               | `signUp()` via `register()`      | `bootstrap_candidate_from_auth_user` | `people` → `tenant_memb` → `first_login_state` → `candidates` | `candidato` (WRONG)    | 🔴 CRITICAL                              |
| 4   | Empresa     | `/entrar/empresa` (signup mode)   | `signUp()` via `register()`      | `bootstrap_candidate_from_auth_user` | Same as #3                                                    | `candidato` (WRONG)    | 🔴 CRITICAL                              |
| 5   | Candidato   | `/trabalhe-conosco`               | Direct `supabase.from()` INSERTs | None                                 | `candidates` only                                             | None                   | 🔴 DISCONNECTED                          |
| 6   | Parceiro    | `/parceiros`                      | `mockSubmitPartner()`            | None                                 | localStorage only                                             | None                   | 🟡 MOCK                                  |
| 7   | Login (all) | `/entrar/*`, `/login`             | `signInWithPassword()`           | N/A                                  | auth.users session                                            | Resolved post-login    | ⚠️ Depends on signup correctness         |
| 8   | OAuth       | `/login` (Google/Microsoft)       | `signInWithOAuth()`              | N/A                                  | auth.users session                                            | Provisioned by trigger | ⚠️ Uses wrong trigger if empresa context |

---

## 10. Action Plan — ordered by priority (no implementation yet — awaiting authorization)

### Lote 1 — Candidato (preserve existing ✅)

- **Do NOT modify** `bootstrap_candidate_from_auth_user()` — it is structurally correct for Candidato
- **Do NOT modify** `handle_new_auth_user()` — it provides idempotent `people` sync
- Consolidate the 2 candidato signup forms (`/cadastro/candidato` + `/entrar/candidato`) into one if desired, but backend contract is ✅
- Reconcile `/trabalhe-conosco` — decide: lead capture (no auth) vs auth signup (align with candidato)

### Lote 2 — Empresa (new provisioning)

- **Create** `bootstrap_company_from_auth_user()` trigger function — parallel to `bootstrap_candidate_from_auth_user()`
  - Creates `people` → `companies` → `tenants` → `tenant_memberships` → `role_assignments`
  - Role: `company_representative` (NEW — does not exist in DB, must be seeded)
  - Does NOT create `candidates` record
- **Modify** `AuthContext.register()` to accept `signup_origin` and `company_name`
- **Route** Empresa signup through new trigger based on `signup_origin` in `user_metadata`

### Lote 3 — AuthContext consolidation

- Single `register()` function with `signup_origin: 'candidate' | 'company'` discriminator
- `CadastroEmpresa.tsx` passes `company_name`, `cnpj`, `signup_origin: 'company'`
- `CadastroCandidato.tsx` passes `signup_origin: 'candidate'`

### Lote 4 — OAuth

- Google/Microsoft OAuth must also pass `signup_origin` in `user_metadata`
- Both triggers (`candidate` + `company`) must handle OAuth users

### Lote 5 — Legado cleanup (post-verification)

- `DROP FUNCTION` the orphaned 6-param `bootstrap_candidate_identity(p_auth_user_id, p_full_name, p_email, p_phone, p_tenant_id, p_role_id)`
- Revoke stale GRANTs from `20260903000000_rbac_fixes.sql:79`
- Create canonical spec SQL for `bootstrap_candidate_from_auth_user` trigger
- Document `signup_origin` field usage in `first_login_state`
