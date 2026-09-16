# CHECKPOINT 2.5 — `recruitment_stages` + `stage_templates` (READ-ONLY)

> FASE 2 — Domínio 5 (Recrutamento) :: Checkpoint 2.5 — `recruitment_stages` ↔ `stage_templates`
> Authorização: READ-ONLY estrito. Nada alterado.

---

## 13.1 Sources of truth examined

| Source               | Type           | Path                                                                                         | Note                                                                           |
| -------------------- | -------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Prod backup (Aug‑20) | Live (pg_dump) | `.backups/js_empregos_production_backup_2026-08-20T09-01-46_schema.sql`                      | Ground truth snapshot — **recruitment pipeline tables ABSENT**                 |
| Canonical spec       | Spec           | `supabase/specs/sql/30_recruitment.sql` (158 processes, 176 stages, 194 candidate_processes) | V2.1 aspirational contract                                                     |
| Spec indexes         | Spec           | `supabase/specs/sql/45_indexes.sql`                                                          | references `recruitment_stages(recruitment_process_id)`, `(tenant_id, status)` |
| Spec RLS             | Spec           | `supabase/specs/sql/45_rls_remaining.sql`                                                    | stages read/write via `is_tenant_member`                                       |
| Stale migration      | Migration      | `20260827000000_recruitment_stages.sql`                                                      | defines `name/description/order`, no `stage_template_id`                       |
| Orphan type dump     | Legacy         | `database_new.ts:5446`                                                                       | stages canonical shape; documented orphan                                      |
| Monolith             | Legacy         | `supabase/schema.sql:707` (interviews only, process_id→recruitment_processes)                | inconsistent `user_id` model                                                   |
| Active types         | Code (tr)      | `src/types/database.ts:1268` (stages); **no** `stage_templates`                              | `recruitment_stages` is stale                                                  |
| Domain types         | Code           | `src/types/domain/recruitment-stage.ts`                                                      | stale (name/description/order)                                                 |
| Repository           | Code           | `src/repositories/recruitment-stages.repository.ts`                                          | stale payloads                                                                 |
| Page                 | Code           | `src/pages/dashboard/Etapas.tsx`                                                             | stale UI (name/order forms)                                                    |

---

## STATUS

### Schema live (canonical spec `30_recruitment.sql:176` + `database_new.ts:5446`)

```sql
create table if not exists public.recruitment_stages (
  id                      uuid PK
  tenant_id               uuid NOT NULL  → tenants(id)
  recruitment_process_id  uuid NOT NULL  → recruitment_processes(id) ON DELETE CASCADE
  stage_template_id       uuid NOT NULL  → stage_templates(id)            -- ← template link
  status                  text NOT NULL DEFAULT 'pending'
                           CHECK (status in ('pending','in_progress','completed','skipped','rejected'))
  started_at              timestamptz,
  completed_at            timestamptz,
  notes                   text,
  actor_person_id         uuid → people(id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
```

- FK: `recruitment_processes.id` (cascade), `stage_templates.id`, `people.id` (actor)
- Indexes (spec `45_indexes.sql:138-139`): `idx_recruitment_stages_process_id(recruitment_process_id)`, `idx_recruitment_stages_status(tenant_id, status)`
- RLS (`45_rls_remaining.sql:621`): read/write/update via `is_tenant_member(tenant_id)`; DELETE not allowed
- **Stage templates are linked, not duplicated** — stages are _instances_ of a tenant's template.

### Schema live — `stage_templates` (`30_recruitment.sql:142` + `supabase/specs/sql/023_stage_templates.sql`¹)

```sql
create table if not exists public.stage_templates (
  id            uuid PK
  tenant_id     uuid NOT NULL  → tenants(id)
  name          text NOT NULL
  description   text,
  order_index   integer NOT NULL,
  is_mandatory  boolean NOT NULL DEFAULT true,
  status        text NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
-- FK on recruitment_stages: stage_template_id → stage_templates(id)
-- cardinality: stage_templates(1) → recruitment_stages(*)   [per-stage-instance references one template]
```

- `stage_template_id` on stages is **NOT NULL** in the canonical spec — the FK is mandatory.
- Templates are tenant-scoped and reusable across processes.

¹ Confirmed referenced by `recruitment_stages.stage_template_id` FK in `30_recruitment.sql:180`; `stage_templates` type absent from `src/types/database.ts` (grep: 0 hits in `database.ts`).

---

## RUNTIME

### Cadeia de imports/consumo ativa (stale migration shape)

```text
Etapas.tsx
  ↓ imports
recruitment-stages.repository.ts
  ↓ extends
SupabaseRepository  (getSupabaseClient)
  ↓ also uses (only to populate dropdown)
recruitment-processes.repository.ts
```

### Queries efetivamente executadas pelo código ativo

- `.select('*').eq('tenant_id', tenantId).order('order', {ascending:true})` — `order` column
- `.eq('recruitment_process_id', processId)` — filter by process
- `.eq('status', status)` — filter by status
- `insert({ tenant_id, recruitment_process_id, name, description, status, order })`
- `update({...})` building payload from `recruitment_process_id/name/description/status/order`

### Campos realmente utilizados pelo código ativo

- `name` ✅, `description` ✅, `order` ✅, `status` ✅ (`active/inactive/completed/skipped`)
- `recruitment_process_id` ✅ (FK to processes — the only canonical field the stale code gets right)

### Campos do DB canônico que o código ATIVO NÃO toca (e nunca usou)

- `stage_template_id` ❌ (canonical NOT NULL FK — absent from code/repo/page entirely)
- `status` enum canônico (`pending/in_progress/completed/skipped/rejected`) ❌ — code uses `active/inactive/completed/skipped`
- `started_at`, `completed_at`, `notes`, `actor_person_id` ❌

### `name` / `order` — utilização real? ✅ SIM, mas na forma STALE

> Regra: "não classificar `name`/`order` como ghost apenas porque aparecem em um arquivo histórico."
> A classificação abaixo é baseada em **live DB + código ativo + migração de origem**:

- `name`/`order` **SÃO usados pelo código ativo** — mas pelo código ativo que implementa a **migração stalata** `20260827000000_recruitment_stages.sql` (que define `name`, `description`, `order`).
- `name`/`order` são campos do **template** na spec canônica (`stage_templates`), NÃO da instância (`recruitment_stages`). O código ativo os colocou no estágio (instância), **conflitando com o modelo canônico** onde esses campos pertencem a `stage_templates` e o estágio só apontaria para `stage_template_id`.

### Payloads de escrita (read/write)

CREATE payload: `{tenant_id, recruitment_process_id, name, description, status:'active', order}`
UPDATE payload: parcial de `{recruitment_process_id, name, description, status, order}`
→ Nenhum payload referencia `stage_template_id`, `started_at`, `completed_at`, `notes`, `actor_person_id`.

---

## IMPLEMENTAÇÃO CANÔNICA (o "deveria ser")

`30_recruitment.sql` + `45_rls_remaining.sql` + `45_indexes.sql` definem:

- stage_templates como blueprint reutilizável (tenant-scoped, `name`/`order_index`/`is_mandatory`/`status`)
- recruitment_stages como instância (aponta `stage_template_id` NOT NULL, status `pending/...` canônico, `started_at`/`completed_at`/`notes`/`actor_person_id`)
- RLS via `is_tenant_member(tenant_id)`; DELETE bloqueado.

### Relação `recruitment_stages ↔ stage_templates`

| Atributo                          | Canônico                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| FK                                | `recruitment_stages.stage_template_id → stage_templates(id)`                                                      |
| Cardinalidade                     | stage_templates (1) → recruitment_stages (*)                                                                      |
| Obrigatório?                      | ✅ `stage_template_id` NOT NULL no canônico                                                                       |
| Onde template é criado/consultado | canônico: `stage_templates` (CRUD tenant) — mas **código ativo não tem tipo nem consumer para `stage_templates`** |
| Onde selecionado                  | implícito: ao criar um stage, aponta `stage_template_id`                                                          |

---

## SEGUNDA IMPLEMENTAÇÃO (código ativo atual — stalatado)

Baseado exclusivamente na migração `20260827000000_recruitment_stages.sql`:

- `recruitment_stages` = `{id, tenant_id, recruitment_process_id, name, description, status(active/inactive/completed/skipped), order, created_at, updated_at}`
- NÃO tem `stage_template_id`, `started_at`, `completed_at`, `notes`, `actor_person_id`.
- `stage_templates` é **totalmente ausente** do código ativo (nenhum tipo, nenhum repository, nenhuma página, nenhum hook).

### Divergências — `recruitment_stages` (active code vs canônico)

| Campo                         | Canônico (live/DB)                             | Código ativo (`database.ts`+repo+Etapas) | Drift                           |
| ----------------------------- | ---------------------------------------------- | ---------------------------------------- | ------------------------------- |
| `name`                        | belongs on `stage_templates`, NOT stages       | on stages, usado em forms/tabela         | ❌ campo no local errado        |
| `description`                 | on `stage_templates`                           | on stages                                | ❌                              |
| `order`                       | `order_index` on `stage_templates`             | `order` on stages                        | ❌                              |
| `status` enum                 | pending/in_progress/completed/skipped/rejected | active/inactive/completed/skipped        | ❌ enum drift                   |
| `stage_template_id`           | NOT NULL FK → stage_templates                  | **ausente**                              | ❌ FK canônica não implementada |
| `started_at` / `completed_at` | timestamptz                                    | **ausente**                              | ❌                              |
| `notes` / `actor_person_id`   | existentes                                     | **ausentes**                             | ❌                              |

### `stage_templates` — classificação

| Critério                          | Resultado                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Existe no canônico?               | ✅ Sim (`30_recruitment.sql:142`, spec `023_stage_templates.sql`)                                                                                            |
| Existe no prod backup (Aug‑20)?   | ❌ Não (tabela ausente do dump real)                                                                                                                         |
| Existe no tipo `database_new.ts`? | Não verificado diretamente, mas `recruitment_stages` nele referencia `stage_template_id` → `stage_templates`, então o dump canônico que o originou o possuía |
| Consumer ativo em `src/`?         | ❌ **Nenhum** — 0 matches para `stage_templates`/`StageTemplate`                                                                                             |
| Tipo em `database.ts`?            | ❌ **Ausente**                                                                                                                                               |
| Repository/hook/página?           | ❌ **Nenhum** — não implementado no código ativo                                                                                                             |

→ `stage_templates` é, hoje, **persistência canônica sem consumer ativo**. Perigo de ser classificado como órfão por ausência de consumer: está ausente do prod backup (Aug‑20), o que indica que **pode nem existir no prod atual** — ou foi adicionado depois. Classificação: `CANÔNICO / NÃO IMPLEMENTADO no código ativo`.

---

## DUPLICAÇÃO

- `recruitment_stages` possui duas definições incompatíveis: migração stalata (`name`/`order`/`status active-inactive`) × canônico (`stage_template_id`/`status pending...`). O código ativo implementa a STALATA. Não há consumer de `stage_templates` — portanto **não há duplicação de código**, há **não-implementação canônica**.

---

## CADEIA DE DADOS

```text
recruitment_processes (id ...)
        ↑  recruitment_process_id (FK, cascade)
recruitment_stages (instances)
        → stage_template_id  ──► stage_templates (templates)
        → status(pending/...) started_at completed_at notes actor_person_id
```

Na prática (código ativo), a ligação `recruitment_processes` → `recruitment_stages` existe (via `recruitment_process_id`), mas a divisão template/instance (`stage_templates`) **não existe no código** e **não consta no prod backup de Aug‑20**.

---

## CONTRATO LIVE

### O que é de fato "live"? — CONFLITO DE PROVENIÊNCIA (documentar, não decidir silenciosamente)

| Fonte                               | Afirma que `recruitment_stages`/`stage_templates` existem?  | Proveniência                                                                   |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Backup prod (2026‑08‑20, `pg_dump`) | ❌ **NÃO** — `findstr` zero matches para tables da pipeline | Real snapshot, mais recente live disponível                                    |
| `database_new.ts` (legacy/orphan)   | ✅ Sim (shape canônico)                                     | Artefato não importado, não autoridade                                         |
| Spec `30_recruitment.sql`           | ✅ Sim (CREATE TABLE IF NOT EXISTS)                         | Spec canônico V2.1 (aspiração)                                                 |
| Migração `20260827000000`           | ✅ Sim (cria `recruitment_stages`)                          | Migration — mas cria STALE shape, e prod backup não reflete migration aplicada |

> **DOCUMENTO / VERSÃO / CONTEXTO / DECISÃO / CONFLITO / ESTADO ATUAL**
>
> - **DOCUMENTO:** Backup prod (Aug‑20) vs Spec `30_recruitment.sql` + `database_new.ts` vs migração `20260827000000`.
> - **VERSÃO/CONTEXTO:** O backup de Aug‑20 é o live snapshot mais recente e não contém as tabelas de pipeline de recrutamento. As specs/migrations/`database_new.ts` as descrevem com shape canônico.
> - **DECISÃO (read-only):** Não se inclui `recruitment_stages`/`stage_templates` como "live confirmado" baseado apenas no spec/orphan. A evidência mais forte (prod backup real) os mostra AUSENTES. A hipótese alternativa (criados após 20‑08) não pode ser descartada sem acesso ao DB runtime.
> - **CONFLITO:** `applications` (presente no backup, shape canônico = `current_stage`) VS `recruitment_processes/stages/templates` (ausentes do backup, presentes no spec/orphan).
> - **ESTADO ATUAL DO CÓDIGO:** O código ativo implementa `recruitment_stages` com o shape STALE da migration `20260827000000` (name/description/order/active-inactive), não o canônico. `stage_templates` não existe no código ativo.

**Implicação segura (não depende do conflito):** o código ativo **não corresponde ao contrato canônico** de stages em dois pontos estruturais: (1) mistura campos de template (`name`/`order`) na instância; (2) ignora `stage_template_id`, `started_at`, `completed_at`, `notes`, `actor_person_id`.

---

## DIVERGÊNCIAS (resumo)

1. **Shape de `recruitment_stages` ativo ≠ canônico** — veja tabela acima.
2. **`stage_templates` não implementado** — sem tipo, repository, hook, página; ausente do prod backup (Aug‑20).
3. **Migração `20260827000000` está desatualizada** vs canônico e (provavelmente) não refletida no prod backup de Aug‑20.
4. **Proveniência conflitante** entre backup prod (ausência) e spec/orphan (presença) — ver §13.5.
5. (De 2.3) `recruitment_processes` ativo também stalatado — mantido em análise separada, nada alterado aqui.

---

## CLASSIFICAÇÃO

| Object                  | Canônico | Live (backup)                                       | Código ativo          | Classificação                                              |
| ----------------------- | -------- | --------------------------------------------------- | --------------------- | ---------------------------------------------------------- |
| `recruitment_stages`    | ✅ spec  | ❌ (ausente backup)                                 | ⚠️ shape stale        | **DIVULGÊNCIA — não alinhado ao canônico**                 |
| `stage_templates`       | ✅ spec  | ❌ (ausente backup)                                 | ❌ (não implementado) | **CANÔNICO NÃO IMPLEMENTADO / possível órfão condicional** |
| `recruitment_processes` | ✅ spec  | ⚠️ (presente em database_new.ts, ausente no backup) | ⚠️ stale              | ver 2.3                                                    |

---

## EVIDÊNCIAS

- `supabase/specs/sql/30_recruitment.sql:142` — cria `stage_templates` (name, description, order_index, is_mandatory, status).
- `supabase/specs/sql/30_recruitment.sql:176` — cria `recruitment_stages` (stage_template_id NOT NULL → stage_templates; status pending/...).
- `supabase/specs/sql/45_indexes.sql:138-139` — índices de recruitment_stages.
- `supabase/specs/sql/45_rls_remaining.sql:621-632` — políticas stages (sem DELETE).
- `supabase/migrations/20260827000000_recruitment_stages.sql` — shape STALE (name/description/order/active-inactive); usa `tenant_memberships.person_id` (RLS people-based) — mas **não contém `stage_template_id`**.
- `database_new.ts:5446` — stages canônico (stage_template_id, started_at, completed_at, notes, actor_person_id; sem name/order).
- `src/types/database.ts:1268` — stages STALE (name/description/order/active-inactive); **sem `stage_templates` type**.
- `src/types/domain/recruitment-stage.ts` — domínio STALE (name/description/order).
- `src/repositories/recruitment-stages.repository.ts` — insert/update usam name/description/order.
- `src/pages/dashboard/Etapas.tsx` — forms e tabela unem name/description/order/status.
- `.backups/js_empregos_production_backup_2026-08-20T09-01-46_schema.sql` — `findstr` confirma ausência de `recruitment_stages`/`stage_templates`/`recruitment_processes`/`candidate_processes`/`interviews`.
- `src/` (`src` root) — `grep -S "stage_templates|StageTemplate"` → **0 matches** (nenhum consumer ativo).

---

## VERIFICAÇÕES CRUZADAS

- **typecheck:** não executado (não há alteração). O código ativo type-checka porque `database.ts`/repo/pages são internamente consistentes entre si (todos stalos juntos). Não valida contra o live DB.
- **build/tests:** não alterados.

---

## Conclusão do checkpoint (read-only)

- `recruitment_stages`: o código ativo é **internamente consistente com a migration `20260827000000`** (name/description/order), mas **incompatível com o canônico** (stage_template_id, pending-status, started_at/completed_at/notes) — e o prod backup (Aug‑20) indica a tabela nem existiria no prod atual, o que exigiria confirmação runtime.
- `stage_templates`: **não implementado no código ativo** (0 consumers); existe apenas na spec canônica e é ausente do prod backup.

## Recomendação (não executada)

Antes de reconciliar tipos, confirmar via runtime Supabase (`SELECT column_name ... FROM information_schema.columns WHERE table_name IN ('recruitment_stages','stage_templates','recruitment_processes')`) quais dessas tabelas/colunas existem de fato no prod atual — para validar ou refutar a hipótese do backup de Aug‑20. Nada será alterado até autorização.
