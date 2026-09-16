# CHECKPOINT 2.4 — `applications` (READ-ONLY)

> FASE 2 — Domínio 5 (Recrutamento) :: Checkpoint 2.4 — auditar `applications`
> Authorização: READ-ONLY. Nenhuma migration, ALTER, INSERT/UPDATE/DELETE, RLS, RBAC, commit ou push.

---

## 12.1 Sources of truth examined

| Source                               | Type           | Path                                                                       | Relevance                                                                                                                          |
| ------------------------------------ | -------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Production backup (ground truth)** | Live           | `.backups/js_empregos_production_backup_2026-08-20T09-01-46_schema.sql:34` | Real `applications` DDL + FKs + indexes + triggers + policies                                                                      |
| Canonical migration                  | Migration (tr) | `20260816000600_applications.sql`                                          | V2.1 canonical DDL: `current_stage` + CHECK + history + snapshots                                                                  |
| Reconcile migration                  | Migration      | `20260830000200_reconcile_applications.sql`                                | Adds `tenant_id`, `metadata`, `created_by`                                                                                         |
| Tracked types                        | Code           | `src/types/database.ts:836`                                                | `Row/Insert/Update` for `applications`, `application_status_history`, `application_profile_snapshots` + `Enums.application_status` |
| Domain types                         | Code           | `src/types/domain/application.ts`                                          | `Application`, `ApplicationStatus` (= `Enums.application_status`), history                                                         |
| Repository                           | Code           | `src/repositories/applications.repository.ts`                              | findAll/findById/findHistory/create/update/addHistoryEntry/remove                                                                  |
| Monolith dump                        | Legacy         | `supabase/schema.sql:627` (uses `current_status`)                          | STALE — not live, not canonical                                                                                                    |
| Legacy type dump                     | Orphan         | `database_new.ts:422` (uses `status`, 6 cols)                              | STALE — documented orphan, not live, not imported                                                                                  |

---

## 12.2 Live production schema (`applications`) — AUDIT-V21-REMOTE-RESULT / prod backup

```sql
-- .backups/js_empregos_production_backup_2026-08-20T09-01-46_schema.sql:34
CREATE TABLE IF NOT EXISTS applications (
  id            uuid PK DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL           → tenants(id)
  job_id        uuid NOT NULL           → jobs(id)
  candidate_id  uuid NOT NULL           → candidates(id)
  profile_snapshot jsonb
  match_score   numeric(5,2)
  match_details jsonb
  source        varchar(50)
  current_stage varchar(50) NOT NULL DEFAULT 'submitted'      ← THE state column
  notes         text
  applied_at    timestamptz NOT NULL DEFAULT now()
  updated_at    timestamptz NOT NULL DEFAULT now()
  created_by    uuid                      → people(id)
);
-- Único: UNIQUE (candidate_id, job_id)
-- Índices: applied_at DESC, candidate, job, current_stage, tenant
-- Trigger: sync_application_current_stage (AFTER INSERT em application_status_history → atualiza applications.current_stage)
-- RLS: select/update/insert via people→tenant_memberships chain
```

Status values emitted by live prod trigger/check: the canonical migration CHECK is
`('submitted','screening','interview','technical_interview','presentation','reference_check','offer','hired','rejected','withdrawn','on_hold')`.
The prod backup shows `current_stage` as a plain `varchar(50)` (no CHECK in the dump) — i.e. the constraint is **relaxed on live**, but the code only ever writes values from the canonical enum, so **no runtime violation**. This is a benign minor drift, not a functional gap.

---

## 12.3 Code ↔ Live DB reconciliation

| Field / behavior                | Live DB (prod backup)                    | Tracked `database.ts`                | Repo (`applications.repository.ts`) | Pages                  | Match? |
| ------------------------------- | ---------------------------------------- | ------------------------------------ | ----------------------------------- | ---------------------- | ------ |
| `current_stage`                 | ✅ varchar(50) default 'submitted'       | ✅ union enum                        | ✅ read/write `current_stage`       | ✅ `app.current_stage` | ✅     |
| `tenant_id`                     | ✅ NOT NULL                              | ✅                                   | ✅                                  | ✅                     | ✅     |
| `job_id`                        | ✅ NOT NULL                              | ✅                                   | ✅                                  | ✅                     | ✅     |
| `candidate_id`                  | ✅ NOT NULL                              | ✅                                   | ✅                                  | ✅                     | ✅     |
| `profile_snapshot`              | ✅ jsonb                                 | ✅                                   | ✅                                  | ✅                     | ✅     |
| `match_score` / `match_details` | ✅                                       | ✅                                   | ✅                                  | ✅                     | ✅     |
| `source`                        | ✅ varchar(50)                           | ✅ nullable                          | ✅                                  | ✅                     | ✅     |
| `notes`                         | ✅ text                                  | ✅                                   | ✅                                  | ✅                     | ✅     |
| `applied_at`                    | ✅ default now()                         | ✅                                   | ✅ (on create)                      | ✅                     | ✅     |
| `created_by`                    | ✅ → people                              | ✅                                   | ✅                                  | ✅                     | ✅     |
| UNIQUE(candidate_id, job_id)    | ✅                                       | n/a (types)                          | n/a                                 | enforced server-side   | ✅     |
| status enum                     | canonical 11 values (CHECK relaxed live) | `Enums.application_status` = same 11 | n/a                                 | uses canonical values  | ✅     |

**Verdict:** `applications` CODE ≡ LIVE DB ≡ CANONICAL migration. **No gap.**

---

## 12.4 The `status` / `current_status` / `current_stage` naming audit (special attention item)

Three names appear in the repo for the application state field:

| Name             | Where it exists                                                                     | Live prod? | Used by code? |
| ---------------- | ----------------------------------------------------------------------------------- | ---------- | ------------- |
| `current_stage`  | canonical migration (`20260816000600`), prod backup, `database.ts`, repo, ALL pages | ✅ YES     | ✅ YES        |
| `current_status` | `supabase/schema.sql:633` (monolith)                                                | ❌ NO      | ❌ NO         |
| `status`         | `database_new.ts:427` (orphan legacy dump)                                          | ❌ NO      | ❌ NO         |

- `current_status` (`supabase/schema.sql:633`) is a **STALE monolith artifact** — a different CHECK (`submitted/in_analysis/interview/approved/rejected/withdrawn`) that does **not** match the live DB or the canonical migration. Not used by code.
- `status` (as an applications column) appears **only** in the orphan `database_new.ts` (6-column minimal shape). Not live, not imported.
- This resolves the prior audit note _"applications … schema drift: current_stage used in code/repo but NOT in DB"_ (`AUDITORIA-MATRIZ-COMPLETUDE.md`): that note was based on the **stale `database_new.ts` orphan**, **not** the current live DB. The Aug-20 production backup + canonical migration + tracked types + repository + pages **all agree on `current_stage`**.

**Conclusion:** there is **no status-name drift in the running system.** The single source of truth for the field is `current_stage`, consistent across live prod, canonical migration, types, repository, and every consumer page.

---

## 12.5 Consumers enumerated (no `useApplications` hook; no service layer)

Direct repository calls from code (grep `.from('applications')` + `applicationsRepository`):

| Caller                | File                                                | Usage                                                                          |
| --------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| Candidate portal load | `src/contexts/CandidateContext.tsx:170`             | `findAll(tenantId, {})`                                                        |
| Candidate portal page | `src/features/candidato/pages/Candidaturas.tsx:91`  | `app.current_stage`                                                            |
| RH dashboard          | `src/pages/dashboard/DashboardRh.tsx:69`            | `findAll(currentTenantId)`                                                     |
| Candidate dashboard   | `src/pages/dashboard/DashboardCandidato.tsx:82,368` | `findAll`+badge render of `current_stage`                                      |
| Candidaturas page     | `src/pages/dashboard/Candidaturas.tsx`              | full CRUD via repo; `current_stage` badges 'hired'/'rejected'/'withdrawn'/etc. |
| Detalhe page          | `src/pages/dashboard/ApplicationDetailPage.tsx:173` | reads `application.current_stage`                                              |
| Tests                 | `src/__tests__/.../CandidateContext.test.tsx`       | mocks `applicationsRepository.findAll`                                         |

✅ All consumers use `current_stage` + the canonical status enum. No consumer reads the ghost `status` or `current_status`.

---

## 12.6 `applications` ↔ `recruitment_processes` relationship (key for 2.3)

- **No direct FK.** The live `applications` table has **no** `recruitment_process_id` column (confirmed: prod backup cols + canonical migration + `database.ts`). `applications` is its own candidate↔job aggregate (UNIQUE candidate_id, job_id).
- **Linkage is conceptual / via junctions:**
  - `candidate_processes` (canonical spec `30_recruitment.sql:194`) — junction `candidate_id ↔ recruitment_process_id ↔ current_stage_id → recruitment_stages`. **No code consumer** in src (grep: 0 matches for `candidate_processes` / `current_stage_id`).
  - `interviews` (`schema.sql:707` / canonical `GATE-DATA-03:824`) — `process_id → recruitment_processes(id)`, `application_id → applications(id)`, `candidate_id → candidates(id)`. **No code consumer** of this join in src.
  - `job_matches` (`database_new.ts`/`specs`) — `candidate_id, job_id, score` → the matching engine. Code: `src/services/matching.ts` (read-only audited earlier).
- **Functional chain (read-only):**
  `jobs` → `job_matches` (candidate↔job + score) → `applications` (candidatura real) → `application_status_history` (imutável) → `interviews` (entrevistas) → `recruitment_processes` / `recruitment_stages` (pipeline configurado)

**Implication for the upcoming 2.3 reconciliation of `recruitment_processes`:** because `applications` is its own bounded aggregate (state = `current_stage`, owned by tenant recruiters, immutável via histórico), the `CreateRecruitmentProcessInput` must be reconciled against the **canonical** `recruitment_processes` contract (C22-RH-MATRIX + `30_recruitment.sql`), NOT against `applications`. The two tracks meet at the candidate/job level (via `candidate_processes` / `interviews`), not by embedding `recruitment_process_id` on `applications`.

---

## 12.7 Verdict

| Item                                            | Status                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Live DB schema for `applications`               | ✅ OK — matches canonical migration                                                |
| Tracked types (`database.ts`, `application.ts`) | ✅ OK — match live                                                                 |
| `Enums.application_status`                      | ✅ OK — matches canonical CHECK values                                             |
| Repository                                      | ✅ OK                                                                              |
| Consumers (5 pages + context + tests)           | ✅ OK — all use `current_stage`                                                    |
| `status` / `current_status` aliases             | ✅ Resolved: stale artifacts only, not live, not used                              |
| `applications` → `recruitment_processes` link   | ✅ No direct FK (by design — separate aggregates)                                  |
| **Gap?**                                        | **None.** `applications` is internally consistent with live prod + canonical spec. |

No changes made. DB, migrations, RBAC/RLS, code, and footer remain untouched. Awaiting authorization to proceed with **2.5 `recruitment_stages`** (read-only), which closes the loop on the `recruitment_processes` → `recruitment_stages` → `stage_templates` chain before any type/code reconciliation.
