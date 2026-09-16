# CHECKPOINT 2.3 — `recruitment_processes` (READ-ONLY)

> FASE 2 — Domínio 5 (Recrutamento) :: Checkpoint 2.3 — reconciliar `recruitment_processes`
> Authorização: READ-ONLY (nada alterado). Nenhuma migration, ALTER, INSERT/UPDATE/DELETE, RLS, RBAC, commit ou push.

---

## 12.1 Sources of truth examined (ordered by authority)

| Source           | Type      | Path                                                                                                                                            | Relevance                                                                            |
| ---------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Live DB dump     | Live      | `database_new.ts:5408`                                                                                                                          | Real columns — flagged orphaned/legacy¹, but corroborated                            |
| Canonical spec   | Spec      | `supabase/specs/sql/30_recruitment.sql:158`                                                                                                     | V2.1 canonical CREATE TABLE + stages                                                 |
| RLS policies     | Spec      | `supabase/specs/sql/45_rls_remaining.sql:608`                                                                                                   | `is_tenant_member(tenant_id)` policies                                               |
| Indexes          | Spec      | `supabase/specs/sql/45_indexes.sql:134`                                                                                                         | confirms `candidate_id` index exists                                                 |
| FK inventory     | Audit     | `audit-master-db.md:860-866`                                                                                                                    | FKs: actor_person_id→people, candidate_id→candidates, job_id→jobs, tenant_id→tenants |
| RLS state        | Audit     | `V21-POST-FIX-RLS-SECURITY-AUDIT.md:162`                                                                                                        | RLS=SIM, read/write=SIM, delete=NÃO                                                  |
| C22 matrix       | Design    | `docs/C22-RH-MATRIX.md:181`                                                                                                                     | Full canonical column table                                                          |
| Monolith dump    | Legacy    | `supabase/schema.sql:574`                                                                                                                       | STALE — uses nonexistent `tenant_memberships.user_id`, different column set          |
| Migration        | Migration | `20260827000000_recruitment_stages.sql`                                                                                                         | STALE — stages with name/description/order                                           |
| Application code | Code      | `src/types/database.ts:1236`, `recruitment-processes.repository.ts`, `ProcessosSeletivos.tsx`, `Etapas.tsx`, `recruitment-stages.repository.ts` | STALE — matches neither live DB nor canonical spec                                   |

¹ `database_new.ts` is documented as orphaned/legacy (`AUDITORIA_WORKTREE_BANCO.md:71,511`), BUT its `recruitment_processes` shape is independently corroborated by the canonical spec + FK inventory audit + RLS-state audit + C22 matrix. Provenance reliable for this table.

---

## 12.2 Checklist results

### 1. Repository — `src/repositories/recruitment-processes.repository.ts`

- Operates on: `tenant_id`, `job_id`, `title`, `description`, `status` (default `'draft'`).
- Ghost columns: `title`, `description`. Invalid default status: `'draft'`. → STALE

### 2. Page — `src/pages/dashboard/ProcessosSeletivos.tsx`

- Form + table bind to: `job_id ?? null`, `title`, `description`, `status: 'open'/'closed'/'draft'`.
- Status options mismatch live DB. → STALE (broken vs live DB)

### 3. Page — `src/pages/dashboard/Etapas.tsx`

- Renders `process.title` (ghost). Stages form uses `name`/`description`/`order` (ghosts). → STALE (broken vs live DB)

### 4. Tipos/interfaces

- `src/types/database.ts:1236` → `{id, tenant_id, job_id:string|null, title, description:string|null, status:'open'|'closed'|'draft', created_at, updated_at}`.
  - Missing: `candidate_id`, `opened_at`, `closed_at`, `actor_person_id`, UNIQUE.
  - Ghost: `title`, `description`.
  - Wrong: `job_id` nullable; `status` enum.
  - `recruitment-process.ts` derives status from this → inherits drift.
  - `mappers.ts:156` spreads `{...row, job}` → silently drops live fields.
- Same problem on `recruitment_stages`: live = `{stage_template_id, started_at, completed_at, notes, actor_person_id}`; code uses `{name, description, order}`.

### 5. Queries `.from('recruitment_processes')`

- Only in `recruitment-processes.repository.ts` (select/insert/update/delete). Indirection via `Etapas.tsx` (findAll).
- No hooks, no RPC, no edge-function consumer. Fully enumerated.

### 6. `status` field

| Scope                                     | Values                                            |
| ----------------------------------------- | ------------------------------------------------- |
| Canonical spec (`30_recruitment.sql:163`) | `open, in_progress, closed, cancelled`            |
| Live DB (`database_new.ts:5414`)          | `open, in_progress, paused, completed, cancelled` |
| Code (`database.ts:1243`)                 | `open, closed, draft`                             |

- `draft` violates CHECK on both; `closed` fails on live DB. → DRIFT (runtime failure)

### 7. `job_id`

- Canonical/Live: `uuid NOT NULL → jobs(id)`
- Code: `string | null`, repo sends `job_id ?? null` → NOT NULL violated on create.

### 8. `candidate_id`

- Canonical/Live: `uuid NOT NULL → candidates(id)`
- Code: entirely absent from types/repo/pages. → CANONICAL FIELD UNIMPLEMENTED

### 9. `title` / `description`

- Live DB / canonical spec: NO `title`, NO `description` (spec has `stages_config jsonb`): ghost columns.
- Code reads + writes them. → PostgREST 400 on create/update.

### 10. Relationship with `recruitment_stages`

- Live stages: `{id, tenant_id, recruitment_process_id, stage_template_id→stage_templates, status(pending/in_progress/completed/skipped/rejected), started_at, completed_at, notes, actor_person_id, …}`.
- Migration `20260827000000`: `{name, description, order, status(active/inactive/completed/skipped)}` → stale.
- `recruitment-stages.repository.ts` + `Etapas.tsx` use `name`/`order` → ghost columns.

### 11. Indirect dependency on `applications`/`candidate_processes`

- `applications` has NO `recruitment_process_id` (confirmed `20260816000600_applications.sql`). Not joined.
- `candidate_processes` (canonical junction `30_recruitment.sql:194`): no src consumer (grep 0 matches). DB-level only.
- `interviews` (`schema.sql:707`) → `recruitment_processes.id` via `process_id`: DB FK only, no src consumer.
- → Isolated to the two repositories + two pages.

### 12. FKs / UNIQUE / RLS (live DB)

- FKs (`audit-master-db.md:860-863`): tenant_id→tenants, job_id→jobs, candidate_id→candidates, actor_person_id→people. ✅
- UNIQUE: `uq_recruitment_process_job_candidate (job_id, candidate_id)` (`30_recruitment.sql:169`; index `45_indexes.sql:134-137`). ✅
- RLS: 3 policies (`is_tenant_member`), no DELETE → DELETE blocked (`V21-POST-FIX-RLS-SECURITY-AUDIT.md:162`). ✅
- Indexes: tenant_id, job_id, candidate_id, (tenant_id, status). ✅

---

## 12.3 Verdict

| Question                                            | Answer                                                                                                                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is the prod DB correct for `recruitment_processes`? | YES — matches canonical spec (`30_recruitment.sql`), plus minor status drift (`paused`/`completed` vs spec `closed`). RLS/FKs/UNIQUE/indexes confirmed.                                           |
| Is the application code correct?                    | NO — `database.ts` + repositories + pages target a legacy/stale shape (ghost `title`/`description`/`draft`, nullable `job_id`, missing `candidate_id`/`opened_at`/`closed_at`/`actor_person_id`). |
| Origin of the divergence                            | Code/types generated against the old `schema.sql` monolith, never reconciled to V2.1 canonical spec (`30_recruitment.sql`). Same for `recruitment_stages`.                                        |
| What breaks at runtime?                             | create/update insert ghost cols (`title`,`description`) → 400; `status='draft'` → CHECK violation; `job_id=NULL` → NOT NULL violation; live fields silently discarded by typed layer.             |

---

## 12.4 Recommended correction order (NOT executed)

1. Reconcile `src/types/database.ts` for `recruitment_processes` + `recruitment_stages` to canonical columns (no ghost columns; add candidate_id/opened_at/closed_at/actor_person_id; NOT NULL job_id; correct status enum).
2. Reconcile `recruitment-processes.repository.ts` — read/write real fields.
3. Reconcile `recruitment-stages.repository.ts` — swap name/order for stage_template_id/started_at/completed_at/notes.
4. Reconcile `ProcessosSeletivos.tsx` + `Etapas.tsx` — rebind forms.
5. Add missing `CREATE TABLE recruitment_processes (...)` migration (canonical `30_recruitment.sql`) so fresh deploys reproduce prod — **pending authorization** (migration).

No changes made. DB, migrations, RBAC/RLS, code, and footer remain untouched. Awaiting authorization to begin item 1 (type reconciliation only — no migration/RBAC change).
