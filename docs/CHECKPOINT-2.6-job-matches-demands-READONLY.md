# CHECKPOINT 2.6 — `job_matches` / `recruitment_demands` (READ-ONLY)

> FASE 2 — Domínio 5 (Recrutamento) :: Checkpoint 2.6 — `job_matches` ↔ `recruitment_demands`
> Autorização: READ-ONLY estrito + confirmação runtime via INFORMATION_SCHEMA no Supabase prod.
> Nada alterado. Nenhuma migration. Nenhum DML. Nenhuma escrita.

---

## STATUS

| Object                | Spec canônico    | Backup prod (20/08) | **Supabase prod (runtime — CONFIRMADO AO VIVO)** | Código ativo                      | Status                         |
| --------------------- | ---------------- | ------------------- | ------------------------------------------------ | --------------------------------- | ------------------------------ |
| `job_matches`         | ✅ 8 cols (V2.1) | ✅ 13 cols (V1)     | ✅ **12 cols (híbrido V2.1+)**                   | ⚠️ 13 cols (V1 — shape do backup) | **DIVERGENTE / INCOMPATÍVEL**  |
| `recruitment_demands` | ✅ 8 cols (V2.1) | ❌ **AUSENTE**      | ✅ **16 cols (evoluído)**                        | ❌ **AUSENTE (0 consumers)**      | **NÃO IMPLEMENTADO no código** |

**Resumo:** o prod foi migrado de V1 (backup 20/08: `job_matches` apontava para `jobs`, sem `recruitment_demands`) para um estado V2.1+ híbrido — mas **o código ainda implementa o shape V1 do backup**. A divergência é mais grave que em 2.5: aqui o código não apenas não bate com o canônico, como bate com um **shape obsoleto que já não existe mais no banco** (e o FK `demand_id NOT NULL` exigido pelo vivo não é enviado pelo código → INSERT falha).

---

## RUNTIME

Conexão direta feita ao Supabase prod (`okxqfyoqbhcmflpurfrw` — mesmo ref do `audit-master-db.md`, snap 2026‑09‑03, corroborado). Queries **SELECT exclusivamente** sobre `information_schema.columns` / `pg_constraint` / `pg_indexes` / `pg_policy`:

- **`job_matches`**: tabela PRESENTE. `RLS = true`. 3 policies (`job_matches_member_read` SELECT, `job_matches_member_write` INSERT, `job_matches_member_update` UPDATE) — via `is_tenant_member(tenant_id)` (confere com spec `45_rls_remaining.sql`). **0 linhas.**
- **`recruitment_demands`**: tabela PRESENTE. `RLS = true`. 3 policies (`recruitment_demands_member_read` SELECT, `_member_write` INSERT, `_member_update` UPDATE) — confere com spec. **0 linhas.**

> Nota de metodologia: o dump capturado em `docs/_raw_columns.txt` mostra `job_matches` com **8 colunas** (id, tenant_id, candidate_id, demand_id, score, status, created_at, updated_at) e `recruitment_demands` com **8 colunas** — isto é o **shape SPEC V2.1 puro**, NÃO o runtime atual. O runtime AO VIVO (aconselhado pelo usuário) mostra **12 e 16 colunas** respectivamente. Conclusão: `_raw_columns.txt` é um snapshot **obsoleto** (pré-evolução) e o runtime direto é a fonte de verdade. `supabase-real-schema-core.json` confirma apenas a **existência** das tabelas (lista de nomes), sem detalhar colunas.

---

## IMPLEMENTAÇÃO CANÔNICA

### `recruitment_demands` (`supabase/specs/sql/34_crm_services.sql:26`)

```sql
create table if not exists public.recruitment_demands (
  id            uuid PK            default uuid_generate_v4(),
  tenant_id     uuid NOT NULL      -> tenants(id),
  company_id    uuid NOT NULL      -> companies(id),
  position      text NOT NULL,
  quantity      integer NOT NULL   default 1,
  status        text NOT NULL      default 'open',
  created_at    timestamptz NOT NULL default now(),
  updated_at    timestamptz NOT NULL default now()
);
```

- FK: `company_id`→`companies(id)`, `tenant_id`→`tenants(id)`.
- RLS (`45_rls_remaining.sql:790-829`): `_member_read` SELECT, `_member_write` INSERT, `_member_update` UPDATE, todas via `is_tenant_member(tenant_id)`. Sem DELETE (policy de delete ausente no spec).
- Índices: não definidos no spec `34` (o runtime adicionou `idx_recruitment_demands_urgency` e `_service_id`, parciais).

### `job_matches` (`supabase/specs/sql/35_recruitment_talent_pool.sql:15`)

```sql
create table if not exists public.job_matches (
  id            uuid PK            default uuid_generate_v4(),
  tenant_id     uuid NOT NULL      -> tenants(id),
  candidate_id  uuid NOT NULL      -> people(id),
  demand_id     uuid NOT NULL      -> recruitment_demands(id),
  score         numeric,
  status        text NOT NULL      default 'pending',
  created_at    timestamptz NOT NULL default now(),
  updated_at    timestamptz NOT NULL default now(),
  constraint uq_job_matches unique (candidate_id, demand_id)
);
```

- FK: `demand_id`→`recruitment_demands(id)`, `candidate_id`→`people(id)`, `tenant_id`→`tenants(id)`.
- Unique: `uq_job_matches (candidate_id, demand_id)`.
- RLS (`45_rls_remaining.sql:925-949`): `_member_read` SELECT, `_member_write` INSERT, `_member_update` UPDATE via `is_tenant_member(tenant_id)`.
- Função/visão associada: `public.recruitment_kpis` (view) e `public.match_candidates_to_demand(p_demand_id)` (RPC, `security definer`, checa `is_tenant_member` + `recruitment.read`).

---

## CONTRATO LIVE **(runtime — CONFIRMADO AO VIVO)**

### `job_matches` — 12 colunas

| coluna        | tipo        | nullable? | default            | observação                                    |
| ------------- | ----------- | --------- | ------------------ | --------------------------------------------- |
| id            | uuid        | NO        | uuid_generate_v4() | PK (`job_matches_pkey`)                       |
| tenant_id     | uuid        | NO        | —                  | FK → tenants(id)                              |
| candidate_id  | uuid        | NO        | —                  | FK → people(id)                               |
| demand_id     | uuid        | NO        | —                  | FK → recruitment_demands(id) — **chave V2.1** |
| score         | numeric     | YES       | —                  |                                               |
| status        | text        | NO        | 'pending'::text    | enum textual (pending/…)                      |
| created_at    | timestamptz | NO        | now()              |                                               |
| updated_at    | timestamptz | NO        | now()              |                                               |
| job_id        | uuid        | **YES**   | —                  | **nullable** (herdado V1; parcial idx)        |
| match_details | jsonb       | NO        | '{}'::jsonb        | **evoluído** — não está no spec 35            |
| notified_at   | timestamptz | YES       | —                  | **evoluído**                                  |
| applied_at    | timestamptz | YES       | —                  | **evoluído**                                  |

- FKs: `candidate_id→people`, `demand_id→recruitment_demands`, `tenant_id→tenants` (3 FKs).
- Unique: `uq_job_matches (candidate_id, demand_id)` (mudou em relação ao backup `uk_job_matches_candidate_job (candidate_id, job_id)`).
- Índices: `idx_job_matches_job_id` (parcial: `WHERE job_id IS NOT NULL`), `job_matches_pkey` (id), `uq_job_matches` (candidate_id, demand_id).
- Check constraints: **nenhum** (status é texto solto, sem CHECK/ENUM).
- RLS: habilitado. Triggers: não verificados live (spec V2.1 não define; backup V1 tinha `job_match_found_event` + `update_job_matches_updated_at`).

### `recruitment_demands` — 16 colunas

| coluna                | tipo        | nullable? | default            | observação                                          |
| --------------------- | ----------- | --------- | ------------------ | --------------------------------------------------- |
| id                    | uuid        | NO        | uuid_generate_v4() | PK                                                  |
| tenant_id             | uuid        | NO        | —                  | FK → tenants(id)                                    |
| company_id            | uuid        | NO        | —                  | FK → companies(id)                                  |
| position              | text        | NO        | —                  |                                                     |
| quantity              | integer     | NO        | 1                  |                                                     |
| status                | text        | NO        | 'open'::text       |                                                     |
| created_at            | timestamptz | NO        | now()              |                                                     |
| updated_at            | timestamptz | NO        | now()              |                                                     |
| contact_name          | text        | YES       | —                  | **evoluído — não no spec 34**                       |
| contact_email         | text        | YES       | —                  | **evoluído**                                        |
| contact_phone         | text        | YES       | —                  | **evoluído**                                        |
| description           | text        | YES       | —                  | **evoluído**                                        |
| urgency               | text        | YES       | —                  | **evoluído**                                        |
| service_type          | text        | YES       | —                  | **evoluído**                                        |
| responsible_person_id | uuid        | YES       | —                  | **evoluído**                                        |
| service_id            | uuid        | YES       | —                  | FK → services(id) ON DELETE SET NULL (**evoluído**) |

- FKs (3): `company_id→companies`, `service_id→services (ON DELETE SET NULL)`, `tenant_id→tenants`.
- Índices: `idx_recruitment_demands_urgency` (parcial: `WHERE urgency IS NOT NULL`), `idx_recruitment_demands_service_id` (parcial: `WHERE service_id IS NOT NULL`), `recruitment_demands_pkey` (id).
- Check constraints: **nenhum** (status texto solto, default 'open').
- RLS: habilitado; policies `_member_read/_write/_update` via `is_tenant_member(tenant_id)` (confere spec `45`).

---

## CONTRATO SPEC

- `recruitment_demands` ≅ spec `34_crm_services.sql:26` (8 cols). Live tem **8 colunas a mais** (contact_*, description, urgency, service_type, responsible_person_id, service_id).
- `job_matches` ≅ spec `35_recruitment_talent_pool.sql:15` (8 cols). Live tem **4 colunas a mais** (job_id, match_details, notified_at, applied_at) e a unique mudou de (candidate_id, demand_id) — idem spec — mas `job_id` passou de NOT NULL (backup) para nullable.

---

## SEGUNDA IMPLEMENTAÇÃO (código ativo — shape V1 do backup)

`src/types/database.ts:671` + `src/types/domain/candidate.ts:261` + `src/repositories/job-matches.repository.ts` + `src/pages/dashboard/JobMatches.tsx`:

- `JobMatch` / tipo `database.ts`: `{id, candidate_id, job_id, tenant_id, score, reasons(jsonb), algorithm_version?, is_eligible, sent_notification, invalidated_at?, invalidated_reason?}` — **shape idêntico ao backup de 20/08 (V1)**, não ao live.
- Repository (`job-matches.repository.ts`):
  - `.select('*').eq('tenant_id', tenantId).order('score', {ascending:false})`
  - `.eq('candidate_id', candidateId)`
  - `insert({ candidate_id, job_id, tenant_id, score })` (+ opcionais reasons/algorithm_version/is_eligible/sent_notification)
  - `update({ score, reasons, algorithm_version, is_eligible, sent_notification, invalidated_at, invalidated_reason })`
  - `delete().eq('id', id).eq('tenant_id', tenantId)`
- Página `JobMatches.tsx`: formulário com campos `candidate_id`, `job_id`, `score`, `algorithm_version='1.0'`, `is_eligible✅`, `sent_notification✅`; tabela exibe `candidate_id.name`, `job_id` (como "Vaga"), `score`, `is_eligible`. Rota registrada em `App.tsx:131/204/536`.
- **Nenhum código referencia `demand_id`, `status`, `match_details`, `notified_at`, `applied_at` de `job_matches`** (grep `src` por `demand_id` → 0 matches).

### `recruitment_demands`

- **Nenhum consumer no código ativo**: 0 matches para `recruitment_demands` / `RecruitmentDemand` em `src/` (tipo, repository, hook, página, rota). `grep src → "No files found"`.

---

## DUPLICAÇÃO

- `job_matches` possui **3 versões incompatíveis de shape**:
  1. Backup 20/08 (V1, 13 cols): `job_id NOT NULL` + `reasons/is_eligible/sent_notification/invalidated_*`.
  2. Spec V2.1 (8 cols): `demand_id` + `status`.
  3. Runtime live (12 cols): híbrido — mantém `job_id` (agora nullable) + adiciona `match_details/notified_at/applied_at` + `demand_id/status`.
- O código ativo implementa a versão **(1)** — obsoleta — e o banco está na **(3)**. A **(2)** (spec) nem é a atual.
- `match_details` e `applied_at` existem **tanto em `job_matches` (live) quanto em `applications` (código + live)** — duplicação colunar entre tabelas. No código, `match_details`/`applied_at` são consumados **apenas por `applications`** (`src/types/domain/application.ts`, `applications.repository.ts`, `ApplicationDetailPage`, `Candidaturas`, `DashboardCandidato`) — nunca por `job_matches`.

---

## CADEIA DE DADOS

```text
recruitment_demands (16 cols, live)
        ↑ demand_id (NOT NULL, FK)
job_matches (12 cols, live)
        ├── candidate_id (FK) → people
        ├── job_id (nullable, FK) → jobs        ← herança V1, agora opcional
        └── tenant_id (FK) → tenants

Consumidores no código:
  - JobMatchesRepository ↔ JobMatches.tsx   [shape V1 — quebrado vs live]
  - recruitment_demands                     [NENHUM consumer]
  - BancoDeTalentos.tsx: declara `jobMatches?: JobMatch[]` no tipo do candidato,
    mas NÃO chama jobMatchesRepository (usa candidatesRepository + talentPoolRepository)
    → uso de tipo órfão/dead.
```

---

## CONTRATO LIVE (resumo dos fatos verificados ao vivo)

- **tabelas:** `job_matches` ✅ / `recruitment_demands` ✅ (ambas PRESENTES em `information_schema.tables`).
- **colunas:** job_matches = 12 (id, tenant_id, candidate_id, demand_id, score, status, created_at, updated_at, job_id, match_details, notified_at, applied_at); recruitment_demands = 16 (acima).
- **tipos:** uuid / numeric / text / jsonb / timestamptz (pg_catalog conforme tabela).
- **nullability:** job_matches NOT NULL em id/tenant_id/candidate_id/demand_id/status/created_at/updated_at/match_details; NULL em score/job_id/notified_at/applied_at. recruitment_demands NOT NULL em id/tenant_id/company_id/position/quantity/status/created_at/updated_at; NULL no resto.
- **defaults:** id `uuid_generate_v4()`; timestamps `now()`; status `'pending'` (job_matches) / `'open'` (recruitment_demands); quantity `1`; match_details `'{}'::jsonb`.
- **FKs:** job_matches→3 (`candidate_id→people`, `demand_id→recruitment_demands`, `tenant_id→tenants`); recruitment_demands→3 (`company_id→companies`, `service_id→services ON DELETE SET NULL`, `tenant_id→tenants`).
- **unique/indexes:** job_matches→`job_matches_pkey(id)`, `uq_job_matches(candidate_id,demand_id)`, `idx_job_matches_job_id` (parcial); recruitment_demands→`recruitment_demands_pkey(id)`, `idx_recruitment_demands_urgency` (parcial), `idx_recruitment_demands_service_id` (parcial). `uk_job_matches_candidate_job (candidate_id,job_id)` do backup foi **substituída** por `uq_job_matches (candidate_id, demand_id)`.
- **RLS:** ambas com `relrowsecurity=true`; policies read/select, write/insert, update via `is_tenant_member(tenant_id)` (3 por tabela = 6 policies). Confere spec `45_rls_remaining.sql`.

---

## DIVERGÊNCIAS

| #   | Divergência                                                                                                                                                                                                                                    | Evidência                                                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | **Código `job_matches` = shape V1 do backup** (`job_id, reasons, algorithm_version, is_eligible, sent_notification, invalidated_at/invalidated_reason`).                                                                                       | `database.ts:671`, `domain/candidate.ts:261`, `job-matches.repository.ts:56-101`, `JobMatches.tsx:26-34/114-122` × **runtime live (12 cols V2.1+)**          |
| D2  | Código **nunca envia `demand_id`** (NOT NULL no live) → `INSERT` no código **falha** no Prod (`column "demand_id" of relation "job_matches" violates not-null constraint`).                                                                    | runtime: `demand_id uuid NOT NULL` + repository.create não inclui `demand_id`                                                                                |
| D3  | Código envia colunas **inexistentes no live** (`reasons, algorithm_version, is_eligible, sent_notification, invalidated_at, invalidated_reason`) → `INSERT` no código **falha** (`column "reasons" of relation "job_matches" does not exist`). | runtime: colunas acima AUSENTES live                                                                                                                         |
| D4  | Backup 20/08 `job_matches` (13 cols, `job_id NOT NULL`, uk `candidate_id,job_id`) ≠ live (12 cols, `job_id` nullable, uk `candidate_id,demand_id`).                                                                                            | backup `..._schema.sql:325-348` × runtime                                                                                                                    |
| D5  | `recruitment_demands` **AUSENTE do backup 20/08** mas PRESENTE no live (16 cols) e no spec.                                                                                                                                                    | grep backup `recruitment_demands` → "No files found"; runtime ✅; spec `34` ✅                                                                               |
| D6  | Live `recruitment_demands` tem **8 colunas a mais** que o spec `34` (contact_*, description, urgency, service_type, responsible_person_id, service_id).                                                                                        | runtime(16) × spec `34_crm_services.sql:26-34`(8)                                                                                                            |
| D7  | Live `job_matches` tem **4 colunas a mais** que o spec `35` (job_id, match_details, notified_at, applied_at) e a unique é `(candidate_id, demand_id)` (confere spec) mas `job_id` virou nullable.                                              | runtime(12) × spec `35_recruitment_talent_pool.sql:15-25`(8)                                                                                                 |
| D8  | `match_details`/`applied_at` duplicados entre `job_matches`(live) e `applications`(live+code); código consome apenas em `applications`.                                                                                                        | runtime + `application.ts:13/17`, `applications.repository.ts:44/58-59/132`, `ApplicationDetailPage:15/47/181`, `Candidaturas:116`, `DashboardCandidato:372` |
| D9  | Captura `docs/_raw_columns.txt` (8 cols / 8 cols) é **obsoleta** vs live (12 / 16).                                                                                                                                                            | `_raw_columns.txt:946-953` × runtime ao vivo                                                                                                                 |

---

## CLASSIFICAÇÃO

| Object                | Spec        | Backup 20/08 | Runtime (live)        | Código ativo          | Classificação final                                                                                         |
| --------------------- | ----------- | ------------ | --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `job_matches`         | ✅ V2.1 (8) | ✅ V1 (13)   | ✅ V2.1+ híbrido (12) | ⚠️ V1 (13 — = backup) | **DIVERGENTE — código implementa shape OBSOLETO e é INCOMPATÍVEL com o prod (INSERT update SELECT falham)** |
| `recruitment_demands` | ✅ V2.1 (8) | ❌ ausente   | ✅ evoluído (16)      | ❌ nenhum consumer    | **NÃO IMPLEMENTADO no código (persistência real + 0 consumidores)**                                         |

> O `audit-master-matrix.md:82` já classificava `job_matches` como **🔴 (tela quebrada)** no snapshot de 2026‑09‑03 — a divergência acima **é a causa raiz** dessa classificação: o código está em V1 enquanto o DB evoluiu.

---

## EVIDÊNCIAS

- **Runtime (ao vivo, esta auditoria)** — via Node `pg` contra `db.okxqfyoqbhcmflpurfrw.supabase.co` (credenciais do `.env`, conexão read-only por INFORMATION_SCHEMA/pg_catalog):
  - `job_matches` → 12 colunas; FKs candidate_id→people, demand_id→recruitment_demands, tenant_id→tenants; unique `uq_job_matches(candidate_id, demand_id)`; idx `idx_job_matches_job_id` parcial; sem check constraints; RLS on.
  - `recruitment_demands` → 16 colunas; FKs company_id→companies, service_id→services(ON DELETE SET NULL), tenant_id→tenants; idx parciais urgency/service_id; RLS on.
  - row counts: `job_matches=0`, `recruitment_demands=0`.
- **Backup (20/08)** `.backups/js_empregos_production_backup_2026-08-20T09-01-46_schema.sql`:
  - job_matches definido em `325-339` (13 cols, `job_id NOT NULL`, `reasons jsonb`, `is_eligible`, `sent_notification`, `invalidated_*`).
  - índices/triggers/policies V1 em `1659-1665` (triggers `job_match_found_event`, `update_job_matches_updated_at`) e `2069-2088` (policies V1: INSERT service_role, SELECT tenant members — diferente do live `is_tenant_member`).
  - `recruitment_demands` **inexistente** no backup (grep `recruitment_demands` em `.backups/*.sql` → "No files found").
- **Spec canônico:**
  - `34_crm_services.sql:26` (recruitment_demands, 8 cols).
  - `35_recruitment_talent_pool.sql:15` (job_matches, 8 cols, demand_id, status, uq `(candidate_id, demand_id)`).
  - `45_rls_remaining.sql:790-829` (recruitment_demands policies) e `:925-949` (job_matches policies) — via `is_tenant_member(tenant_id)`.
- **Código ativo:**
  - `src/types/database.ts:671-712` (job_matches → V1, 13 cols).
  - `src/types/domain/candidate.ts:261-296` (JobMatch/JobMatchCreateInput/JobMatchUpdateInput → V1).
  - `src/repositories/job-matches.repository.ts` (`.select('*').order('score',...)`, insert/update com job_id/reasons/is_eligible/sent_notification — NÃO envia demand_id).
  - `src/pages/dashboard/JobMatches.tsx` (formulário V1) + rota `src/App.tsx:131/204/536`.
  - `src/pages/dashboard/BancoDeTalentos.tsx:14,27` (importa JobMatch; campo `jobMatches?: JobMatch[]` tipado mas sem chamada ao repository — uso dead).
  - grep `src` por `demand_id` → 0 matches; grep `src` por `recruitment_demands|RecruitmentDemand` → 0 matches (consumidor zero).
- **Capturas obsoletas (contraponto):**
  - `docs/_raw_columns.txt:946-953` (job_matches 8 cols) e `:1412-1419` (recruitment_demands 8 cols) — refletem o SPEC V2.1, não o runtime atual.
  - `audit-master-db.md:3` (snap 2026-09-03, ref `okxqfyoqbhcmflpurfrw`), `:131` job_matches ✅RLS✅✅3 políticas 0 linhas, `:180` recruitment_demands ✅RLS✅✅3 políticas 0 linhas — consistente com runtime para RLS/FK/counts, mas NÃO reflete as colunas evoluídas (12/16).
  - `audit-master-matrix.md:82` job_matches 🔴 ("tela quebrada") — causa raiz = D1/D2/D3.
  - `.backups/structural_comparison_report.md:141` (`job_matches | 13 | canonical`) — refere‑se ao backup V1 de 20/08.

---

## CONCLUSÃO

- **`job_matches`:** a persistência prod (live, 12 cols, V2.1 híbrido) **não corresponde ao código ativo (V1, 13 cols do backup).** O código envia colunas que não existem mais (`reasons`, `algorithm_version`, `is_eligible`, `sent_notification`, `invalidated_at`, `invalidated_reason`) e omite `demand_id` (NOT NULL) e `status`. Qualquer `INSERT`/`UPDATE` via `JobMatchesRepository`/`JobMatches.tsx` **falhará em prod**. Esta é a causa raiz do 🔴 já registrado em `audit-master-matrix.md:82`.
- **`recruitment_demands`:** tabela REAL no prod (16 cols, RLS, 3 policies, FK-alvo de `job_matches.demand_id`) mas **totalmente ausente do código** — sem tipo, repository, hook ou página. É o "gap de feature" já assinalado em `AUDITORIA-ARQUITETURA-DOMINIOS.md:517` (persistência real, sem consumer frontend).

### Recomendação (NÃO executada — depende de autorização)

Antes de qualquer correção: decidir o shape-canônico alvo (spec V2.1 puro de 8×8 colunas vs. o híbrido evoluído de 12×16 do prod). Reconciliar exigirá (a) migrar o código de `job_matches` para o shape live (demand_id/status, drop reasons/is_eligible/…, migração de dados V1→V2.1) — **DROP de colunas e reescrita de repository/page**; (b) decidir se as 8 colunas evoluídas de `recruitment_demands` (contact_*, urgency, service_id, …) entram no spec ou são rolling back; (c) implementar consumer de `recruitment_demands`. Nada será alterado até autorização explícita.

---

## VERIFICAÇÕES CRUZADAS

- **typecheck/build/tests:** não executados (nada alterado). O código type-checka internamente (V1 consistente consigo mesmo) mas **não valida contra o DB live** — apenas runtime revela a incompatibilidade.
- **Confiabilidade do runtime:** a conexão usou o mesmo `project ref` (`okxqfyoqbhcmflpurfrw`) do `audit-master-db.md:3`, retornou 0 linhas (confere `:131/:180`), e RLS/policies conferem com spec `45` → conexão ao prod correto confirmada.
