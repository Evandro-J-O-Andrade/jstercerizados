# FASE 2A — PROVENIÊNCIA DAS MIGRATIONS P0

**Data da auditoria:** 2026-09-16  
**Project ref Supabase:** `okxqfyoqbhcmflpurfrw`  
**Modo:** READ-ONLY (nenhuma alteração foi aplicada ou commitada)

---

## Arquivos consultados

| #   | Arquivo                                                                               | Status                              |
| --- | ------------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | `supabase/migrations/20260902100001_p0_01_schema_reconciliation_delta.sql`            | ✅ Existe                           |
| 2   | `supabase/migrations/p0_reconciliation/20260903000001_p0_01_collision_and_schema.sql` | ✅ Existe                           |
| 3   | `supabase/migrations/p0_reconciliation/20260903000002_p0_02_repair_chain.sql`         | ✅ Existe                           |
| 4   | `supabase/migrations/p0_reconciliation/20260903000003_p0_03_event_emitter.sql`        | ✅ Existe                           |
| 5   | `supabase/migrations/p0_reconciliation/20260903000004_p0_04_tenants_rls.sql`          | ✅ Existe                           |
| 6   | `supabase/PREFLIGHT-20260902.md`                                                      | ✅ Existe                           |
| 7   | `supabase/MIGRATION-AUDIT-20260901.md`                                                | ❌ AUSENTE                          |
| 8   | `supabase/ALLOWLIST.md`                                                               | ✅ Existe                           |
| 9   | `supabase/BACKEND-AUDIT-20260902.md`                                                  | ✅ Existe                           |
| 10  | `supabase/HARDENING-SPEC.md`                                                          | ✅ Existe                           |
| 11  | `supabase/P0-RECONCILIATION-SPEC.md`                                                  | ✅ Existe                           |
| 12  | `supabase/migrations/20260902000001_01_schema_reconciliation.sql`                     | ✅ Existe (supersedido por colisão) |
| 13  | `supabase/migrations/20260902000007_07_events_outbox.sql`                             | ✅ Existe (editado in-place)        |
| 14  | `supabase/migrations/20260902000002_02_identity_rbac.sql`                             | ✅ Existe (editado in-place)        |
| 15  | `supabase/migrations/20260902150001_backend_gate_final.sql`                           | ✅ Existe                           |
| 16  | `supabase/migrations/20260816000900_domain_events.sql`                                | ✅ Existe                           |
| —   | `supabase/migrations/_superseded/20260902000000_platform_hardening_v1.sql`            | ✅ Existe (supersedido)             |
| —   | `supabase/migrations/_superseded/20260902000001_reconcile_services_cms.sql`           | ✅ Existe (supersedido)             |
| —   | `supabase/migrations/20260902000006_06_rls_security.sql`                              | ✅ Existe                           |
| —   | `supabase/migrations/20260825000005_rbac_finance_fiscal_accounting.sql`               | ✅ Existe                           |
| —   | `supabase/GAP-MATRIX.md`                                                              | ✅ Existe                           |

---

## 1. P0-01 — ORIGEM E STATUS

### Arquivo em `main migrations/`

**`20260902000001_01_schema_reconciliation.sql`** (original — A NUNCA APLICADA)

- **Conteúdo:** `CREATE INDEX idx_jobs_tenant_status_published`, `ALTER TABLE blog_posts ADD COLUMN seo_title/seo_description`, `CHECK media_assets_entity_type_check`, `COMMENT ON COLUMN storage.buckets.name` (deprecated services-images).
- **Status:** NUNCA APLICADA — colisão de versão com `20260902000001_reconcile_services_cms.sql` (superseded). Registrada em `schema_migrations` como `reconcile_services_cms`, não como `01_schema_reconciliation`.

**`20260902100001_p0_01_schema_reconciliation_delta.sql`** (delta P0 — em main migrations/)

- **Conteúdo:** `CREATE INDEX idx_jobs_tenant_status_published` + `CHECK media_assets_entity_type_check`. **NÃO** inclui `blog_posts` SEO (já existe em outra migration) e **NÃO** inclui bucket comment (já aplicado).
- **Status:** APPLIED (segundo PREFLIGHT-20260902.md, linha 17 e 374).

### Arquivo em `p0_reconciliation/`

**`20260903000001_p0_01_collision_and_schema.sql`**

- **Conteúdo:** `CREATE INDEX idx_jobs_tenant_status_published` + `CHECK media_assets_entity_type_check` + `COMMENT ON COLUMN storage.buckets.name` (deprecated services-images). **NÃO** inclui `blog_posts` SEO.
- **Status:** AGUARDANDO OK EXPLÍCITO (nunca aplicada).

### Diferenças entre as versões

| Elemento                                    | Original (`01_schema_reconciliation`) | Main delta (`100001`)   | p0_reconciliation (`20260903`) |
| ------------------------------------------- | ------------------------------------- | ----------------------- | ------------------------------ |
| `idx_jobs_tenant_status_published`          | ✅                                    | ✅                      | ✅                             |
| `media_assets_entity_type_check`            | ✅                                    | ✅                      | ✅                             |
| `blog_posts.seo_title/seo_description`      | ✅                                    | ❌ (já existe)          | ❌ (já existe)                 |
| Bucket `services-images` deprecated comment | ✅                                    | ❌ (já aplicado)        | ✅                             |
| Timestamp de versão                         | `20260902000001` (colide)             | `20260902100001` (nova) | `20260903000001` (nova)        |
| Aplicada ao Supabase                        | ❌                                    | ✅ (PREFLIGHT)          | ❌ (AGUARDANDO OK)             |

### O que o PREFLIGHT diz sobre P0-01 (§01)

- **Linha 51:** "Status no Supabase: ⚠️ NÃO APLICADA (version collision)" — refere-se ao original `20260902000001_01_schema_reconciliation.sql`.
- **Linha 55:** A migration _superseded_ (`_superseded/20260902000001_reconcile_services_cms.sql`) foi aplicada → colunas CMS em `services` criadas ✓.
- **Linhas 58-67:** Objetos que deveriam existir mas NÃO existem: `idx_jobs_tenant_status_published` ❌, `media_assets_entity_type_check` ❌. `blog_posts.seo_title/seo_description` ✅ (já existem). Bucket comment ⚠️ (não verificado).
- **Linha 70:** Correção necessária: remover `20260902000001` de `schema_migrations` ou aplicar SQL manualmente.
- **Linha 374 (conclusão):** "Nova migration `20260902100001_p0_01_schema_reconciliation_delta` aplicada; não foi necessário remover a entrada histórica de `schema_migrations`."
- **Linha 17 (resumo):** "Nova migration `20260902100001_p0_01_schema_reconciliation_delta` aplicada; ✅ idx + CHECK existem."

### O que o P0-RECONCILIATION-SPEC diz (§P0-01)

- **Linha 11:** "O Supabase já tem registrado `20260902000001 = reconcile_services_cms` (a superseded). A nova `01_schema_reconciliation` nunca executou."
- **Linha 13:** "As 4 migrations P0 usam timestamps novos (`20260903000001`..`20260903000004`) para evitar colisão."
- **Linhas 15-19:** A migration `20260903000001` aplica o conteúdo da antiga `01_schema_reconciliation` (índice + CHECK + comment). NÃO toca em `schema_migrations`.
- **Linha 133:** "❌ NÃO recriar migrations 01..08 originais (elas já foram aplicadas com bugs)."

### CONFLITO identificado

| DOCUMENTO                       | VERSÃO/CONTEXTO            | DECISÃO                                                               | CONFLITO                                      | ESTADO ATUAL DO CÓDIGO                                                                                       |
| ------------------------------- | -------------------------- | --------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| PREFLIGHT-20260902.md           | 2026-09-02 (pós-validação) | P0-01 resolvido via main delta `20260902100001`                       | A main delta foi aprovada e aplicada          | ✅ `20260902100001_p0_01_schema_reconciliation_delta.sql` existe e é o que o PREFLIGHT registra como applied |
| P0-RECONCILIATION-SPEC.md       | 2026-09-02 (proposta)      | Propõe usar `p0_reconciliation/20260903000001` como correção canônica | Propõe uma ABORDAGEM ALTERNATIVA não aplicada | ⚠️ `p0_reconciliation/20260903000001` existe mas diz "AGUARDANDO OK EXPLÍCITO"                               |
| Harkening-SPEC.md §Procedimento | 2026-09-02                 | Aplicação via `psql -f` uma por vez                                   | Não menciona p0_reconciliation/               | O spec original 01-08 não inclui a main delta nem as p0_reconciliation                                       |

**Prioridade por data:** PREFLIGHT (09-02 pós-validação) > P0-RECONCILIATION-SPEC (09-02 proposta). A main delta (`20260902100001`) é a versão CANÔNICA aplicada. As arquivos em `p0_reconciliation/` são DUPLICATES não aplicados.

### Classificação final P0-01

**`20260902100001_p0_01_schema_reconciliation_delta.sql` — APPLIED (CANÔNICA)**

A `p0_reconciliation/20260903000001_p0_01_collision_and_schema.sql` é **DUPLICATE** (não aplicada) — contém os mesmos dois objetos (índice + CHECK), mais o bucket comment que já estava aplicado.

### Efeitos P0-01

| Objeto                                      | Tipo              | Ação                       | Estado real (Supabase)                                                         |
| ------------------------------------------- | ----------------- | -------------------------- | ------------------------------------------------------------------------------ |
| `idx_jobs_tenant_status_published`          | Índice parcial    | CREATE INDEX IF NOT EXISTS | ✅ Existe (APPLIED via main delta)                                             |
| `media_assets_entity_type_check`            | CHECK constraint  | ALTER TABLE ADD CONSTRAINT | ✅ Existe (APPLIED via main delta)                                             |
| `blog_posts.seo_title`                      | Coluna            | (já existia)               | ✅ Já existia antes                                                            |
| `blog_posts.seo_description`                | Coluna            | (já existia)               | ✅ Já existia antes                                                            |
| Bucket `services-images` deprecated comment | COMMENT ON COLUMN | Marcação como legado       | ⚠️ Não verificado no PREFLIGHT; presente na p0_reconciliation mas não aplicada |

---

## 2. P0-02 — REPAIR CHAIN

### Arquivo em `main migrations/`

**`20260902000002_02_identity_rbac.sql`** (original — editado in-place)

- **Conteúdo atual (editado):** `CREATE OR REPLACE FUNCTION public.repair_candidate_chain(uuid, uuid, text)` com `WHERE name = p_role_code` (linha 75) e `SET search_path = public, pg_temp` (linha 30). Column references qualificadas com `public.` (linhas 63-64, 76-80, 96-97, 100-101, 113-115).
- **Bug original (corrigido):** A versão original usava `WHERE code = p_role_code` (coluna `code` não existe em `roles`).
- **Status:** APPLIED (PREFLIGHT diz que a função foi corrigida e validada como funcional — linha 375).

### Arquivo em `p0_reconciliation/`

**`20260903000002_p0_02_repair_chain.sql`**

- **Conteúdo:** `CREATE OR REPLACE FUNCTION public.repair_candidate_chain(uuid, uuid, text)` com `WHERE name = p_role_code` (linha 89), `SET search_path = public, pg_temp` (linha 43), column references qualificadas.
- **Diferença do original editado:** O p0_reconciliation adiciona um `COMMENT` mais detalhado (linhas 128-129) mencionando "CORRIGIDA em P0-02: usa roles.name (não code)" e "NÃO é executada automaticamente."
- **Status:** AGUARDANDO OK EXPLÍCITO (nunca aplicada).

### O que o PREFLIGHT diz (§02)

- **Linha 76:** "Status no Supabase: ✅ APLICADA (função existe)."
- **Linhas 78-86:** A função `repair_candidate_chain` existe no banco MAS tinha bug crítico: `WHERE code = p_role_code`.
- **Linhas 88-94:** O banco real tem `roles(id, name, description, scope, created_at, updated_at)`. NÃO existe `code`. Existe `name` e `scope`.
- **Linha 96:** "A função `repair_candidate_chain` FALHARÁ quando chamada, porque `column 'code' does not exist`."
- **Linha 104:** Correção necessária: `WHERE code = p_role_code` → `WHERE name = p_role_code`.
- **Linha 375:** "Migration 02 — `repair_candidate_chain` corrigida para usar `roles.name` e column references qualificadas."

### O que o BACKEND-AUDIT diz (§repair_candidate_chain search_path)

- **Linhas 70-74:** "A função `repair_candidate_chain` não tem `search_path` explícito." (Bug adicional.)
- **Linha 75:** Fix: adicionar `SET search_path = public, pg_temp`.
- **Linha 137:** GAP-04: "Adicionar `SET search_path = public, pg_temp`."
- **Linha 149:** "Migration `20260902150001_backend_gate_final.sql` aplicada e validada." — esta migration contém `ALTER FUNCTION public.repair_candidate_chain(uuid, uuid, text) SET search_path = public, pg_temp;` (linhas 23-24 do arquivo).
- **Linha 155:** GAP-01 fechado: "`repair_candidate_chain` search_path → `SET search_path = public, pg_temp`."
- **Linha 171:** "Post-flight: 16 PASSED, 0 WARNINGS, 0 FAILED."

### O que o ALLOWLIST diz

- **Linhas 62-65:** Documenta as 4 inconsistências de dados (6 people sem membership, 9 sem role_assignment, 3 candidates sem membership, 4 candidates sem role `candidate`).
- **Linhas 67-71:** Cadeia canônica: `auth.users → people → tenant_memberships → role_assignments → candidate`.
- **Linha 144:** "Migration 02 usa `roles.code` que não existe em nenhuma versão. **Bug.**" (Cross-Cutting Issues)

### Relação com `_superseded/20260902000000_platform_hardening_v1.sql`

O arquivo monolithic `20260902000000_platform_hardening_v1.sql` (linha 108) contém a VERSÃO ORIGINAL COM BUG: `WHERE code = p_role_code`. Confirmando que o bug existia no monolithic original e foi propagado para a migration 02 quando foi dividido.

### Classificação final P0-02

**`20260902000002_02_identity_rbac.sql` — APPLIED (EDITADO IN-PLACE + BUG FIX)**  
A função existe no Supabase com `WHERE name = p_role_code` e `search_path` definido (via `ALTER FUNCTION` da backend gate).

`p0_reconciliation/20260903000002_p0_02_repair_chain.sql` é **DUPLICATE** (não aplicada) — faz `CREATE OR REPLACE FUNCTION` com a mesma correção já aplicada. Seria um no-op se aplicada.

### Efeitos P0-02

| Objeto                                     | Tipo                        | Ação                                 | Estado real (Supabase)                                  |
| ------------------------------------------ | --------------------------- | ------------------------------------ | ------------------------------------------------------- |
| `repair_candidate_chain(uuid, uuid, text)` | Function (SECURITY DEFINER) | CREATE OR REPLACE                    | ✅ Existe com `WHERE name = p_role_code`                |
| `SET search_path`                          | Configuração função         | ALTER FUNCTION                       | ✅ Aplicado via `20260902150001_backend_gate_final.sql` |
| `REVOKE ALL FROM PUBLIC`                   | GRANT                       | Revoga acesso público                | ✅ Aplicado                                             |
| `GRANT EXECUTE TO service_role`            | GRANT                       | Permissão restrita                   | ✅ Aplicado                                             |
| Column references `public.`                | Qualificação                | Qualificação de colunas              | ✅ Aplicado                                             |
| `roles.code` → `roles.name`                | Correção bug                | ALTER FUNCTION via CREATE OR REPLACE | ✅ Corrigido                                            |

---

## 3. P0-03 — EVENT EMITTER

### Arquivo em `main migrations/`

**`20260902000007_07_events_outbox.sql`** (original — editado in-place)

- **Conteúdo atual (editado):** `emit_domain_event` é um **wrapper** sobre `domain_event_emit` (linhas 52-59): delega a chamada para `public.domain_event_emit(p_tenant_id, p_event_name, p_aggregate_type, p_aggregate_id, p_payload, p_idempotency_key)`. GRANTs: apenas `service_role` e `authenticated` (linhas 65-70). `REVOKE` de `anon` e `PUBLIC` (linhas 72-78). Índice em `event_outbox` (linhas 86-101).
- **Bug original (corrigido):** A versão original tentava inserir diretamente em `event_name, event_version, occurred_at` — colunas inexistentes no schema real.
- **Status:** APPLIED (PREFLIGHT linha 376).

### Arquivo em `p0_reconciliation/`

**`20260903000003_p0_03_event_emitter.sql`**

- **Conteúdo:** `emit_domain_event` como **INSERT DIRETO** usando o schema real: `INSERT INTO public.domain_events (event_type, aggregate_type, aggregate_id, tenant_id, payload, idempotency_key)` (linhas 42-48). GRANTs: apenas `service_role` e `authenticated`. `REVOKE` de `anon` e `PUBLIC`.
- **Diferença principal do original editado:** Em vez de ser um WRAPPER sobre `domain_event_emit`, esta versão faz INSERT DIRETO usando `event_type` (não `event_name`). A abordagem é diferente, não apenas uma replicação.
- **Status:** AGUARDANDO OK EXPLÍCITO (nunca aplicada).

### O que o PREFLIGHT diz (§07)

- **Linha 223:** "Status no Supabase: ⚠️ APLICADA, MAS FUNÇÃO ESTÁ QUEBRADA."
- **Linhas 225-226:** A função `emit_domain_event` existe, mas é incompatível com o schema real de `domain_events`.
- **Linhas 227-241:** Schema real de `domain_events`: `event_type` (text), `idempotency_key` (text), sem `event_version`, sem `occurred_at`, existe `created_at`.
- **Linhas 243-254:** Schema esperado pela migration local `20260816000900`: `event_name` (varchar), `event_version` (varchar(20)), `occurred_at` (timestamptz), `idempotency_key` (uuid), `published_at`, `delivery_attempts`, `last_error`, `metadata`.
- **Linhas 256-272:** A função original tentava inserir em `event_name`, `event_version`, `occurred_at` — colunas inexistentes.
- **Linha 276:** `idempotency_key` → remoto é `text`, função passa `text` → compatível.
- **Linha 279:** Função alternativa que FUNCIONA: `domain_event_emit` — usa `event_type`, tem `ON CONFLICT` para idempotência, usa `current_setting` para contexto.
- **Linhas 281-288:** GRANTs excessivos: `authenticated` ✅, `service_role` ✅, `anon` ⚠️, `PUBLIC` ⚠️.
- **Linhas 292-296:** `event_outbox` existe com schema completo ✅, índice `idx_event_outbox_processed_created` já existe ✅, trigger `trg_domain_event_to_outbox` na tabela `domain_events` ✅.
- **Linha 376:** "Migration 07 — `emit_domain_event` transformada em wrapper sobre `domain_event_emit`; grants de `anon`/`PUBLIC` revogados."

### Relação com `20260902000007_07_events_outbox.sql` e `20260816000900_domain_events.sql`

**CONFLITO — Schema do `domain_events` table:**

| DOCUMENTO/FUNÇÃO                                     | VERSÃO/CONTEXTO        | COLUNAS                                                                                                                                                                     | CONFLITO                     |
| ---------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `20260816000900_domain_events.sql` (canonical local) | 2026-08-16             | `event_name` (varchar), `event_version` (varchar(20)), `occurred_at` (timestamptz), `idempotency_key` (uuid), `published_at`, `delivery_attempts`, `last_error`, `metadata` | Schema LOCAL — mais rico     |
| Schema real (Supabase remoto)                        | 2026-09-02 (PREFLIGHT) | `event_type` (text), `idempotency_key` (text), `created_at` (timestamptz), sem `event_version/occurred_at/published_at/delivery_attempts/last_error/metadata`               | Schema REMOTO — mais simples |

A função `domain_event_emit` (remota, funciona) usa `event_type` e é compatível com o schema remoto. A função `emit_domain_event` original (migration 07) foi escrita para o schema LOCAL e quebrava. A correção via PREFLIGHT a transformou em wrapper sobre `domain_event_emit`. A p0_reconciliation propõe INSERT DIRETO usando `event_type`.

**Conflito de assinatura de função:** A `20260816000900` define `emit_domain_event(p_tenant_id uuid, p_event_name varchar, p_aggregate_type varchar, p_aggregate_id uuid, p_payload jsonb, p_actor_person_id uuid)` — 6 params diferentes. A versão editada (`07_events_outbox.sql`) e a p0_reconciliation usam `emit_domain_event(p_event_name text, p_aggregate_type text, p_aggregate_id uuid, p_tenant_id uuid, p_payload jsonb, p_idempotency_key text)` — assinatura diferente. O Supabase remoto tem `domain_event_emit` com assinatura distinta.

### Classificação final P0-03

**`20260902000007_07_events_outbox.sql` — APPLIED (EDITADO IN-PLACE como WRAPPER)**  
A função `emit_domain_event` foi corrigida para delegar a `domain_event_emit` (wrapper), GRANTs de `anon`/`PUBLIC` revogados.

`p0_reconciliation/20260903000003_p0_03_event_emitter.sql` é **NÃO APLICADA** — propõe uma abordagem ALTERNATIVA (INSERT DIRETO vs wrapper). Se aplicada, substituiria a implementação wrapper atual por uma implementação direct-insert. **CONFLITO DE IMPLEMENTAÇÃO** se aplicada após a versão já aplicada.

### Efeitos P0-03

| Objeto                                | Tipo                        | Ação                                                  | Estado real (Supabase)      |
| ------------------------------------- | --------------------------- | ----------------------------------------------------- | --------------------------- |
| `emit_domain_event(...)`              | Function (SECURITY DEFINER) | CREATE OR REPLACE (wrapper sobre `domain_event_emit`) | ✅ Existe como wrapper      |
| GRANT `anon` / `PUBLIC`               | GRANT                       | REVOKE ALL FROM PUBLIC, anon                          | ✅ Revogado (PREFLIGHT §07) |
| GRANT `authenticated`, `service_role` | GRANT                       | Concedido                                             | ✅ Concedido                |
| `idx_event_outbox_processed_created`  | Índice parcial              | CREATE INDEX IF NOT EXISTS                            | ✅ Existe                   |
| `trg_domain_event_to_outbox`          | Trigger                     | (existente)                                           | ✅ Existe                   |

---

## 4. P0-04 — TENANTS RLS

### Arquivo em `main migrations/`

**`20260902000006_06_rls_security.sql`** (original — NÃO editado para P0-04)

- **Conteúdo:** `tenants_member_read` policy com `USING (public.is_tenant_member(id))` — política RESTRICTIVA (linhas 19-24). NÃO inclui política aberta `tenants_authenticated_read`.
- **Status:** APPLIED — mas apenas a política restritiva foi aplicada. A policy aberta NÃO foi adicionada pela PREFLIGHT approach.

### Arquivo em `p0_reconciliation/`

**`20260903000004_p0_04_tenants_rls.sql`**

- **Conteúdo:** `DROP POLICY IF EXISTS tenants_authenticated_read` + `CREATE POLICY tenants_authenticated_read ON public.tenants FOR SELECT TO authenticated USING (true)` (linhas 28-33). COMMENT detalhado (linhas 35-36).
- **Status:** AGUARDANDO OK EXPLÍCITO (nunca aplicada).

### O que o PREFLIGHT diz (§06)

- **Linha 173:** "Status no Supabase: ✅ APLICADA, mas com IMPACTO CRÍTICO em dados."
- **Linhas 200-204:** RLS policies confirmadas: `tenants` → `tenants_member_read` (authenticated, `is_tenant_member(id)`). `company_relationship_types` → `company_relationship_types_authenticated_read` (authenticated, `true`).
- **Linhas 207-217:** "⚠️ PROBLEMA CRÍTICO — política de tenants é restritiva demais: A migration 06 não recria as políticas antigas de `tenants`... Apenas adiciona `tenants_member_read`. No entanto, o banco remoto tem APENAS `tenants_member_read` — as políticas antigas foram removidas."
- **Linhas 211-216:** 6 people sem membership ativo → não conseguem ver NENHUM tenant → login/dashboard quebra.
- **Linha 217:** "A função `repair_candidate_chain` (migration 02) que deveria consertar isso tem um bug (`roles.code` não existe) e não funciona."
- **Linha 377:** "Migration 06 — `repair_candidate_chain` executada para 7 records (4 candidates + 3 test candidates); memberships criados para 2 non-candidate people; cadeia integrity validada (0 inconsistências)."

### Resolução do PREFLIGHT vs P0-RECONCILIATION-SPEC

**CONFLITO — Abordagem de resolução de P0-04:**

| DOCUMENTO                               | APPROACH           | DESCRIÇÃO                                                                                                                                             | STATUS                               |
| --------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| PREFLIGHT-20260902.md                   | DATA REPAIR        | Executa `repair_candidate_chain` manualmente para 7 records, criando memberships faltantes. Resolve o problema criando dados, não mudando a política. | ✅ APPLIED (PREFLIGHT §conclusão)    |
| P0-RECONCILIATION-SPEC.md §P0-04        | POLICY ADD         | Adiciona `tenants_authenticated_read` com `USING (true)` como policy aberta complementar. Combina via OR com `tenants_member_read`.                   | ❌ AGUARDANDO OK (nunca aplicada)    |
| `20260902150001_backend_gate_final.sql` | (não toca tenants) | Não adiciona nenhuma policy de tenants.                                                                                                               |
| `20260902000006_06_rls_security.sql`    | RESTRICTIVE ONLY   | Cria apenas `tenants_member_read` (restritiva).                                                                                                       | ✅ APPLIED (policy restritiva no DB) |

**Decisão baseada em data de criação:** O PREFLIGHT-20260902.md (09-02) e a execução de data repair resolvem P0-04. O P0-RECONCILIATION-SPEC.md (09-02) e o arquivo p0_reconciliation (09-03) propõem uma abordagem alternativa não aplicada. A data do PREFLIGHT (09-02, pós-validação) e da data repair (mencionada no PREFLIGHT) precedem a criação da p0_reconciliation (09-03). **A data repair foi a resposta aplicada.**

### Relação com `20260825000005_rbac_finance_fiscal_accounting.sql`

**CONFLITO — Schema da tabela `roles`:**

| DOCUMENTO                                                  | VERSÃO/CONTEXTO                        | `roles` schema                                                                                                                              | CONFLITO      |
| ---------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `20260825000005_rbac_finance_fiscal_accounting.sql`        | 2026-08-25 (canonical local)           | `roles(name, is_global boolean, description)` — usa `is_global` (linhas 127-131: `INSERT INTO public.roles (name, is_global, description)`) | Schema LOCAL  |
| Schema real (Supabase remoto)                              | 2026-09-02 (PREFLIGHT + BACKEND-AUDIT) | `roles(id, name, description, scope text 'global'/'tenant', created_at, updated_at)` — usa `scope` (não `is_global`)                        | Schema REMOTO |
| `_superseded/20260902000000_platform_hardening_v1.sql` §01 | 2026-09-02 (monolithic original)       | `WHERE code = p_role_code` — usa `code` (coluna que não existe em NENHUMA versão)                                                           | Bug original  |

A `20260825000005` usa `is_global` (boolean) e `ON CONFLICT (is_global, name)`. Se aplicada ao banco remoto (que tem `scope`, não `is_global`), a migration FALHARIA. O BACKEND-AUDIT linha 319 confirma este conflito: "O `roles` table no remoto usa `scope` (text), enquanto a migration local `20260816000700_rbac.sql` define `is_global` (boolean)."

Relação com P0-04: A `20260825000005` cria roles `finance_manager`, `fiscal`, `accountant` scoped ao tenant (via `is_global = FALSE`). Esses usuários precisam de tenant membership para acessar dados via `tenants_member_read`. A data repair do PREFLIGHT resolveu isso para 7 records específicos, mas não para usuários financeiros/fiscais futuros que não tenham membership. A policy aberta (`tenants_authenticated_read`) da p0_reconciliation resolveria de forma mais abrangente, mas NÃO foi aplicada.

### Classificação final P0-04

**`20260902000006_06_rls_security.sql` — APPLIED (policy restritiva `tenants_member_read`)** + **DATA REPAIR APPLIED (via `repair_candidate_chain`)**  
A policy aberta `tenants_authenticated_read` NÃO foi adicionada ao Supabase. O problema foi resolvido criando memberships faltantes via reparo manual.

`p0_reconciliation/20260903000004_p0_04_tenants_rls.sql` é **NÃO APLICADA** — propõe adicionar a policy aberta como camada complementar.

### Efeitos P0-04

| Objeto                                   | Tipo          | Ação                               | Estado real (Supabase)                         |
| ---------------------------------------- | ------------- | ---------------------------------- | ---------------------------------------------- |
| `tenants_member_read`                    | Policy SELECT | CREATE POLICY                      | ✅ Existe (restritiva)                         |
| `tenants_authenticated_read`             | Policy SELECT | CREATE POLICY USING (true)         | ❌ NÃO EXISTE (p0_reconciliation não aplicada) |
| Dados: 6 people sem membership           | Data repair   | `repair_candidate_chain` executado | ✅ Corrigido (0 inconsistências)               |
| Dados: 3 candidates sem membership       | Data repair   | `repair_candidate_chain` executado | ✅ Corrigido                                   |
| Dados: 4 candidates sem role `candidate` | Data repair   | `repair_candidate_chain` executado | ✅ Corrigido                                   |

---

## 5. CRUZAMENTO FINAL

| P0  | Arquivo (diretório)                                               | Classificação               | Aplicada?                          | Canônica?                                               | Reaplicar?                                                                                      |
| --- | ----------------------------------------------------------------- | --------------------------- | ---------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 01  | `20260902100001_p0_01_schema_reconciliation_delta.sql` (main)     | APPLIED                     | ✅ Sim (PREFLIGHT)                 | ✅ Sim — canônica aplicada                              | ❌ NÃO — já aplicada, idempotent via IF NOT EXISTS                                              |
| 01  | `p0_reconciliation/20260903000001_p0_01_collision_and_schema.sql` | DUPLICATE (não aplicada)    | ❌ Não (AGUARDANDO OK)             | ❌ Não — duplicada da canonical                         | ❌ NÃO — conflita com canonical aplicada; contém bucket comment redundante                      |
| 02  | `20260902000002_02_identity_rbac.sql` (main, editado)             | APPLIED (editado in-place)  | ✅ Sim (PREFLIGHT + BACKEND-AUDIT) | ✅ Sim — canônica editada e aplicada                    | ❌ NÃO — CREATE OR REPLACE já aplicado; p0_reconciliation é no-op                               |
| 02  | `p0_reconciliation/20260903000002_p0_02_repair_chain.sql`         | DUPLICATE (não aplicada)    | ❌ Não (AGUARDANDO OK)             | ❌ Não — duplicada da canonical editada                 | ❌ NÃO — seria no-op (CREATE OR REPLACE com mesmo conteúdo)                                     |
| 03  | `20260902000007_07_events_outbox.sql` (main, editado)             | APPLIED (wrapper)           | ✅ Sim (PREFLIGHT)                 | ✅ Sim — canônica como wrapper                          | ❌ NÃO — já aplicada                                                                            |
| 03  | `p0_reconciliation/20260903000003_p0_03_event_emitter.sql`        | ALTERNATIVA (não aplicada)  | ❌ Não (AGUARDANDO OK)             | ❌ Não — abordagem diferente (direct insert vs wrapper) | ⚠️ CONFLITO — se aplicada, SUBSTITUI o wrapper por direct-insert. NÃO reaplicar sem avaliação   |
| 04  | `20260902000006_06_rls_security.sql` (main)                       | APPLIED (policy restritiva) | ✅ Sim (policy)                    | ✅ Sim — policy restritiva aplicada                     | ❌ NÃO — já aplicada                                                                            |
| 04  | DATA REPAIR via `repair_candidate_chain`                          | APPLIED (data)              | ✅ Sim (PREFLIGHT)                 | ✅ Sim — reparo de dados                                | N/A — data repair já executado                                                                  |
| 04  | `p0_reconciliation/20260903000004_p0_04_tenants_rls.sql`          | ALTERNATIVA (não aplicada)  | ❌ Não (AGUARDANDO OK)             | ❌ Não — propõe policy aberta adicional                 | ⚠️ AVALIAÇÃO NECESSÁRIA — não conflita com canonical, mas é redundante se data repair funcionou |

---

## 6. CONCLUSÃO

### Estado da migration history real

| Migration version (`schema_migrations`) | Nome registrado                     | Status               | Conteúdo efetivo                                                                                                |
| --------------------------------------- | ----------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `20260902000001`                        | `reconcile_services_cms`            | ✅ APPLIED           | Colunas CMS em `services` (do `_superseded/20260902000001`)                                                     |
| `20260902000002`                        | (migration 02)                      | ✅ APPLIED (editada) | `repair_candidate_chain` com `roles.name` (bug fix aplicado via edit in-place + ALTER FUNCTION da backend gate) |
| `20260902000003`                        | (migration 03)                      | ✅ APPLIED           | `media_for_entity`, `set_primary_media` (não P0)                                                                |
| `20260902000004`                        | (migration 04)                      | ✅ APPLIED           | `integration_connections` etc. (não P0)                                                                         |
| `20260902000005`                        | (migration 05)                      | ✅ APPLIED           | `providers`, `provider_configs` (não P0)                                                                        |
| `20260902000006`                        | (migration 06)                      | ✅ APPLIED           | `tenants_member_read` restritiva + search_path fixes                                                            |
| `20260902000007`                        | (migration 07)                      | ✅ APPLIED (editada) | `emit_domain_event` como WRAPPER sobre `domain_event_emit`                                                      |
| `20260902000008`                        | (migration 08)                      | ✅ APPLIED           | `normalize_cnpj/cpf`, `is_valid_cnpj/cpf` (não P0)                                                              |
| `20260902100001`                        | `p0_01_schema_reconciliation_delta` | ✅ APPLIED           | Índice `idx_jobs_tenant_status_published` + CHECK `media_assets_entity_type_check`                              |
| `20260902150001`                        | `backend_gate_final`                | ✅ APPLIED           | search_path em `repair_candidate_chain` + GAPs fechados                                                         |
| `20260903000001`–`000004`               | (p0_reconciliation)                 | ❌ NÃO APLICADA      | AGUARDANDO OK EXPLÍCITO — arquivos em `p0_reconciliation/` nunca aplicados                                      |

**P0 = GREEN** segundo PREFLIGHT-20260902.md (45 PASSED, 1 WARNING, 0 FAILED) e BACKEND-AUDIT-20260902.md (16 PASSED, 0 WARNINGS, 0 FAILED).

### Conflitos documentados

| #   | Conflito                      | DOCUMENTO                                                                         | VERSÃO/CONTEXTO                                                                          | RESOLUÇÃO POR DATA                                                                                               |
| --- | ----------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | P0-01: Quem foi aplicado?     | PREFLIGHT (09-02) vs P0-RECONCILIATION-SPEC (09-02) vs p0_reconciliation/ (09-03) | Main delta (`20260902100001`) vs p0_reconciliation (`20260903000001`)                    | PREFLIGHT precede p0_reconciliation. **Main delta é canônica aplicada.**                                         |
| 2   | P0-02: Como foi corrigido?    | PREFLIGHT (09-02) vs P0-RECONCILIATION-SPEC (09-02)                               | Edit in-place (`20260902000002`) vs CREATE OR REPLACE (`20260903000002`)                 | PREFLIGHT precede p0_reconciliation. **Edit in-place foi aplicado.**                                             |
| 3   | P0-03: Qual implementação?    | PREFLIGHT (09-02) vs P0-RECONCILIATION-SPEC (09-02)                               | Wrapper sobre `domain_event_emit` vs INSERT DIRETO com `event_type`                      | PREFLIGHT precede p0_reconciliation. **Wrapper é canônico aplicado.**                                            |
| 4   | P0-04: Como resolver?         | PREFLIGHT (09-02) vs P0-RECONCILIATION-SPEC (09-02)                               | Data repair (7 records) vs Policy aberta (`USING (true)`)                                | PREFLIGHT precede p0_reconciliation. **Data repair foi aplicada.** Policy aberta NÃO aplicada.                   |
| 5   | Schema `roles`                | `20260825000005` vs BACKEND-AUDIT (09-02)                                         | `is_global` (boolean) vs `scope` (text)                                                  | BACKEND-AUDIT é mais recente. **`scope` é o schema real.** `20260825000005` NÃO foi aplicada (ou foi revertida). |
| 6   | Schema `domain_events`        | `20260816000900` vs PREFLIGHT (09-02)                                             | `event_name/event_version/occurred_at` vs `event_type/created_at`                        | PREFLIGHT é mais recente. **Schema remoto (`event_type`) é canônico.**                                           |
| 7   | `emit_domain_event` signature | `20260816000900` vs `20260902000007`                                              | `(uuid, varchar, varchar, uuid, jsonb, uuid)` vs `(text, text, uuid, uuid, jsonb, text)` | Ambas divergem. Versão canônica remota é `domain_event_emit`.                                                    |

### Observação de compliance — AGENTS.md

- **`ALLOWLIST.md` linha 1:** `# Migration Allowlist — J&S Terceirizados` — **VIOLAÇÃO** da regra de naming (deve ser `J&S Empregos LTDA`). Arquivo não modificado (modo READ-ONLY).
- **`20260825000005_rbac_finance_fiscal_accounting.sql` linha 4:** `-- Empresa: J&S Empregos LTDA` — ✅ correto.
- **`_superseded/20260902000000_platform_hardening_v1.sql` linha 5:** `-- Projeto: J&S Empregos (js-empregos)` — ✅ correto.

### Arquivo AUSENTE

- **`supabase/MIGRATION-AUDIT-20260901.md`** — NÃO EXISTE no disco. Classificado como AUSENTE. A auditoria de migration do dia 01-09-2026 não está disponível. As informações que seriam esperadas deste arquivo foram encontradas distribuídas entre `PREFLIGHT-20260902.md`, `BACKEND-AUDIT-20260902.md`, `P0-RECONCILIATION-SPEC.md` e `HARDENING-SPEC.md`.

### Recomendações para versionamento Git (sem aplicar)

1. **Não aplicar arquivos de `p0_reconciliation/`.** Eles são DUPLICATES ou ABORDAGENS ALTERNATIVAS de correções já aplicadas via edit-in-place. Aplicá-los corre iria:
   - P0-01 (p0_reconciliation): no-op no índice/CHECK + bucket comment redundante
   - P0-02 (p0_reconciliation): no-op (CREATE OR REPLACE idêntico)
   - P0-03 (p0_reconciliation): **CONFLITO** — substitui wrapper por direct-insert. Avaliar antes de aplicar.
   - P0-04 (p0_reconciliation): policy aberta complementar. Não conflita, mas é redundante se a data repair funcionou.

2. **Arquivar `p0_reconciliation/` como referência histórica.** Os 4 arquivos documentam o raciocínio alternativo, mas não devem entrar na migration track canônica.

3. **Git commit message para clean-up (quando autorizado):**

   ```
   chore(supabase): archive p0_reconciliation/ as superseded alternative approach

   The P0 fixes were already applied via edit-in-place on migrations 02, 07
   and the main delta 20260902100001 (validated by PREFLIGHT-20260902.md).
   The p0_reconciliation/ directory proposes alternative approaches that
   conflict with the canonical applied versions — do NOT apply.
   ```

4. **Resolver CONFLITO do schema `roles`:** A migration `20260825000005_rbac_finance_fiscal_accounting.sql` usa `is_global` (boolean) mas o schema real usa `scope` (text). Esta migration está na ALLOWLIST como "base consolidada" mas o BACKEND-AUDIT confirma o conflito. Investigar se foi aplicada ou se está em estado órfão.

5. **Resolver CONFLITO do schema `domain_events`:** A migration `20260816000900_domain_events.sql` define `event_name/event_version/occurred_at` mas o schema real usa `event_type/created_at`. A função `domain_event_emit` (real) é a canônica. Considerar mover `20260816000900` para `_superseded/` e registrar o schema real como canônico.

6. **Criar `MIGRATION-AUDIT-20260901.md`** (arquivo AUSENTE) retroativamente a partir do conteúdo distribuído entre os arquivos de auditoria existentes, para fechar o buraco documental.

7. **NÃO tocar em `schema_migrations`** — conforme P0-RECONCILIATION-SPEC linha 19 e linha 135: "❌ NÃO mexer em `schema_migrations`". A entrada `20260902000001 = reconcile_services_cms` deve permanecer.

8. **Priorizar abertura da policy `tenants_authenticated_read`** se houver novos usuários sem membership entrando no sistema — a data repair só resolveu os 7 records específicos, não o problema estrutural.
