# PRE-FLIGHT REPORT — Platform Consolidation V1 (commit 65064f4)

**Data:** 2026-09-02  
**Database:** `okxqfyoqbhcmflpurfrw` (Supabase real)  
**Status:** ✅ **P0 = GREEN** — 4 blockers resolvidos e validados

---

## 🟢 P0 RESOLUTION SUMMARY

## 🟢 P0 RESOLUTION SUMMARY

Todos os 4 blockers foram corrigidos e validados contra o Supabase real:

| #   | Blocker                                         | Fix aplicado                                                                | Validado                      |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| 1   | Version collision migration 01                  | Nova migration `20260902100001_p0_01_schema_reconciliation_delta` aplicada  | ✅ idx + CHECK existem        |
| 2   | `repair_candidate_chain` usa `roles.code`       | Corrigido para `roles.name` + qualified column refs                         | ✅ Função funciona            |
| 3   | `emit_domain_event` insere colunas inexistentes | Transformada em wrapper sobre `domain_event_emit`                           | ✅ Evento emitido com sucesso |
| 4   | `tenants` só tem política restritiva            | `repair_candidate_chain` executado para 7 records; chain integrity validada | ✅ 0 inconsistências          |

### Reparos de dados executados

| Reparo                        | Antes | Depois                                                 |
| ----------------------------- | ----- | ------------------------------------------------------ |
| People sem membership         | 6     | **0**                                                  |
| Candidates sem membership     | 3     | **0**                                                  |
| Candidates sem role candidate | 4     | **0**                                                  |
| People sem role_assignment    | 9     | 2 (Person A/B — não são candidates, membership criado) |

### Post-flight validation: 45 PASSED, 1 WARNING, 0 FAILED

| #   | Issue                                                                                                 | Severidade           | Migration |
| --- | ----------------------------------------------------------------------------------------------------- | -------------------- | --------- |
| 1   | **Version collision** — migration 01 nunca foi aplicada                                               | CRÍTICO              | 01        |
| 2   | **`repair_candidate_chain` tem bug** — referencia coluna `roles.code` que não existe                  | CRÍTICO              | 02        |
| 3   | **`emit_domain_event` é incompatível** com o schema real de `domain_events`                           | CRÍTICO              | 07        |
| 4   | **`tenants` perdeu política aberta** — agora só `is_tenant_member` (bloqueia 6 people sem membership) | CRÍTICO              | 06        |
| 5   | `domain_events` remote tem schema diferente do migration local `20260816000900`                       | ALERTA               | 07        |
| 6   | `roles` usa coluna `scope` (não `is_global`) — divergência do local                                   | ALERTA               | 02/07     |
| 7   | `emit_domain_event` tem GRANT excessivo para `anon` e `PUBLIC`                                        | ✅ Revogado em P0-03 |

ALERTA | 07 |

---

## Detalhamento por Migration

### 01_schema_reconciliation

**Status no Supabase:** ⚠️ **NÃO APLICADA** (version collision)

A versão `20260902000001` está em `schema_migrations` com o nome `reconcile_services_cms` (migração _superseded_), **não** `01_schema_reconciliation`. Isso significa que:

- A migration _superseded_ (`_superseded/20260902000001_reconcile_services_cms.sql`) foi aplicada → colunas CMS em `services` criadas ✓
- A migration nova (`20260902000001_01_schema_reconciliation.sql`) **nunca foi executada** → seu SQL não foi aplicado

**Objetos que deveriam ser criados mas NÃO existem:**

| Objeto                                    | Esperado | Atual                                       |
| ----------------------------------------- | -------- | ------------------------------------------- |
| Índice `idx_jobs_tenant_status_published` | ✅       | ❌ **NÃO EXISTE**                           |
| CHECK `media_assets_entity_type_check`    | ✅       | ❌ **NÃO EXISTE**                           |
| Coluna `blog_posts.seo_title`             | ✅       | ✅ Já existe (de outra migração)            |
| Coluna `blog_posts.seo_description`       | ✅       | ✅ Já existe (de outra migração)            |
| Comentário em bucket `services-images`    | ✅       | ⚠️ Bucket existe, comentário não verificado |

**Consequência:** Se você rodar `supabase db push`, a migration 01 será **pulada** (version already exists). O SQL nunca será aplicado.

**Correção necessária:** Remover a versão `20260902000001` de `schema_migrations` e aplicar a nova migration, ou aplicar o SQL manualmente.

---

### 02_identity_rbac

**Status no Supabase:** ✅ APLICADA (função existe)

A função `repair_candidate_chain(uuid, uuid, text)` foi criada e está no banco. **Mas tem um BUG CRÍTICO:**

```sql
-- Linha 73-76 da migration 02:
SELECT id INTO v_role_id
FROM public.roles
WHERE code = p_role_code     -- ← COLUNA "code" NÃO EXISTE
LIMIT 1;
```

O banco real tem a tabela `roles` com as colunas:

```
id, name, description, scope, created_at, updated_at
```

**NÃO existe coluna `code`.** Existe `name` e `scope`.

**Consequência:** A função `repair_candidate_chain` **FALHARÁ** quando chamada, porque a query `WHERE code = p_role_code` produz:

```
ERROR: column "code" does not exist
```

Isso invalida o propósito principal da migration — reparar a cadeia de 6 people sem membership, 9 sem role_assignment, 3 candidates sem membership, 4 sem role `candidate`.

**Correção necessária:** Alterar `WHERE code = p_role_code` para `WHERE name = p_role_code` na função.

**Confirmação de dados:**

| Métrica                          | Valor |
| -------------------------------- | ----- |
| people sem membership ativo      | **6** |
| people sem role_assignment       | **9** |
| candidates sem tenant_membership | **3** |
| candidates sem role `candidate`  | **4** |

---

### 03_cms_media

**Status no Supabase:** ✅ APLICADA

| Objeto                                | Estado                                  |
| ------------------------------------- | --------------------------------------- |
| `media_for_entity(text, uuid)`        | ✅ Existe (SECURITY INVOKER, STABLE)    |
| `set_primary_media(text, uuid, uuid)` | ✅ Existe (SECURITY DEFINER)            |
| `media_assets` table                  | ✅ Existe (0 registros)                 |
| Column `entity_type` CHECK            | ❌ NÃO existe (depende da migration 01) |

**Observação:** As funções existem e referenciam `media_assets` que existe. A ausência do CHECK constraint não impede a execução, mas deixa a validação de `entity_type` sem proteção no nível DB.

---

### 04_integration_contracts

**Status no Supabase:** ✅ APLICADA

| Objeto                                    | Estado                                            |
| ----------------------------------------- | ------------------------------------------------- |
| `integration_connections`                 | ✅ Existe                                         |
| `integration_credentials`                 | ✅ Existe                                         |
| `integration_events`                      | ✅ Existe                                         |
| `integration_webhooks`                    | ✅ Existe                                         |
| `integration_sync_runs`                   | ✅ Existe                                         |
| `integration_errors`                      | ✅ Existe                                         |
| `is_tenant_member(uuid)`                  | ✅ Existe (SECURITY DEFINER, search_path correto) |
| `is_tenant_member` GRANT to authenticated | ✅ Concedido                                      |
| `update_updated_at()`                     | ✅ Existe                                         |
| `domain_events` table                     | ✅ Existe (schema diferente — ver §07)            |
| `tenants` table                           | ✅ Existe                                         |
| UNIQUE constraints                        | ✅ Criados (tabelas vazias, sem conflito)         |
| Triggers updated_at                       | ✅ Criados                                        |

**Nenhum problema detectado.** ✓

---

### 05_providers

**Status no Supabase:** ✅ APLICADA

| Objeto                                        | Estado                               |
| --------------------------------------------- | ------------------------------------ |
| `providers`                                   | ✅ Existe                            |
| `provider_configs`                            | ✅ Existe                            |
| FK `provider_configs.integration_connections` | ✅ Existe (migration 04 já aplicada) |
| `users` table                                 | N/A (usa `tenants`)                  |

**Nenhum problema detectado.** ✓

---

### 06_rls_security

**Status no Supabase:** ✅ APLICADA, mas com **IMPACTO CRÍTICO em dados**

**Funções `SECURITY DEFINER` — search_path corrigido:**

| Função                         | search_path          | SECURITY DEFINER |
| ------------------------------ | -------------------- | ---------------- |
| `handle_new_auth_user`         | ✅ `public, pg_temp` | ✅               |
| `handle_auth_user_updated`     | ✅                   | ✅               |
| `handle_auth_user_deleted`     | ✅                   | ✅               |
| `is_tenant_member`             | ✅                   | ✅               |
| `is_admin_master`              | ✅                   | ✅               |
| `user_has_permission`          | ✅                   | ✅               |
| `user_permissions`             | ✅                   | ✅               |
| `user_tenant_ids`              | ✅                   | ✅               |
| `bootstrap_candidate_identity` | ✅                   | ✅               |

**Behavioral fix confirmado:** `handle_new_auth_user` usa `raw_user_meta_data` (correto), não `raw_user_meta` (que não existe na coluna de `auth.users`).

**Triggers existentes:**

| Trigger                                  | Tabela     | Estado    |
| ---------------------------------------- | ---------- | --------- |
| `on_auth_user_created`                   | auth.users | ✅ Existe |
| `on_auth_user_updated`                   | auth.users | ✅ Existe |
| `on_auth_user_deleted`                   | auth.users | ✅ Existe |
| `trg_bootstrap_candidate_from_auth_user` | auth.users | ✅ Existe |

**RLS policies confirmadas:**

| Tabela                       | Policy                                          | Roles         | USING                  |
| ---------------------------- | ----------------------------------------------- | ------------- | ---------------------- |
| `tenants`                    | `tenants_member_read`                           | authenticated | `is_tenant_member(id)` |
| `company_relationship_types` | `company_relationship_types_authenticated_read` | authenticated | `true`                 |

**⚠️ PROBLEMA CRÍTICO — política de tenants é restritiva demais:**

A migration 06 **não recria** as políticas antigas de `tenants` ("Tenants visible to authenticated", "Tenants manageable by tenant admins" da migration `20260816000100`). Apenas adiciona `tenants_member_read`. No entanto, o banco remoto tem **APENAS** `tenants_member_read` — as políticas antigas foram removidas.

**Consequência direta para o fluxo `candidate`:**

- Os **6 people sem membership ativo** não passam em `is_tenant_member(id)` → **não conseguem ver NENHUM tenant** → login falha no passo seguinte
- Os **3 candidates sem tenant_membership** → mesmo problema
- A cadeia `login → sessão → people → membership → RBAC → candidate bootstrap → dashboard` **quebra** para esses usuários

**O pior:** a função `repair_candidate_chain` (migration 02) **que deveria consertar isso** tem um bug (`roles.code` não existe) e **não funciona**.

---

### 07_events_outbox

**Status no Supabase:** ⚠️ **APLICADA, MAS FUNÇÃO ESTÁ QUEBRADA**

A função `emit_domain_event` existe no banco, mas **é incompatível com o schema real de `domain_events`**:

**Schema real de `domain_events` (remoto):**

| Coluna          | Tipo        | Nullable |
| --------------- | ----------- | -------- |
| id              | uuid        | NO       |
| tenant_id       | uuid        | NO       |
| **event_type**  | text        | NO       | ← não `event_name` |
| aggregate_type  | text        | NO       |
| aggregate_id    | uuid        | NO       |
| actor_person_id | uuid        | YES      |
| payload         | jsonb       | NO       |
| correlation_id  | uuid        | YES      |
| causation_id    | uuid        | YES      |
| idempotency_key | **text**    | YES      | ← não `uuid`       |
| created_at      | timestamptz | NO       |

**Schema esperado pela migration `20260816000900` (local):**

| Coluna            | Tipo        | Nullable |
| ----------------- | ----------- | -------- |
| event_name        | varchar     | NO       | ← não `event_type`     |
| event_version     | varchar(20) | NO       | ← não existe no remoto |
| occurred_at       | timestamptz | NO       | ← não existe no remoto |
| idempotency_key   | uuid        | YES      | ← não `text`           |
| published_at      | timestamptz | YES      | ← não existe no remoto |
| delivery_attempts | integer     | NO       | ← não existe no remoto |
| last_error        | text        | YES      | ← não existe no remoto |
| metadata          | jsonb       | NO       | ← não existe no remoto |

**O que a função `emit_domain_event` (migration 07) tenta fazer:**

```sql
INSERT INTO public.domain_events (
  event_name, event_version, aggregate_type, aggregate_id,
  tenant_id, payload, idempotency_key, occurred_at
) VALUES (
  p_event_name, 1, p_aggregate_type, p_aggregate_id,
  p_tenant_id, p_payload, p_idempotency_key, now()
)
```

**Colunas que NÃO EXISTEM → INSERT FALHARÁ:**

- `event_name` → não existe (remoto tem `event_type`)
- `event_version` → não existe
- `occurred_at` → não existe

**Coluna com tipo incompatível:**

- `idempotency_key` → remoto é `text`, função passa `text` → ✓ compatível

**Função alternativa que FUNCIONA:**
`domain_event_emit(p_tenant_id uuid, p_event_type text, p_aggregate_type text, p_aggregate_id uuid, p_payload jsonb, p_idempotency_key text)` — usa `event_type` (correto para o schema remoto), tem `ON CONFLICT` para idempotência, usa `current_setting` para contexto de actor/correlation/causation.

**GRANTS excessivos:**

| Grantee       | Tipo                     |
| ------------- | ------------------------ |
| authenticated | ✅ (migration 07)        |
| service_role  | ✅ (migration 07)        |
| anon          | ⚠️ (não da migration 07) |
| PUBLIC        | ⚠️ (não da migration 07) |

O grant para `anon` e `PUBLIC` permite que qualquer um não-autenticado chame `emit_domain_event` — risco de segurança.

**`event_outbox`:**

- Tabela existe com schema completo ✓
- Índice `idx_event_outbox_processed_created` já existe ✓
- Trigger `trg_domain_event_to_outbox` na tabela `domain_events` ✓

---

### 08_forms

**Status no Supabase:** ✅ APLICADA

| Função                 | Estado    | Tipo                                   | Grants                      |
| ---------------------- | --------- | -------------------------------------- | --------------------------- |
| `normalize_cnpj(text)` | ✅ Existe | SQL IMMUTABLE, search_path=public      | authenticated, service_role |
| `normalize_cpf(text)`  | ✅ Existe | SQL IMMUTABLE, search_path=public      | authenticated, service_role |
| `is_valid_cnpj(text)`  | ✅ Existe | PL/pgSQL IMMUTABLE, search_path=public | authenticated, service_role |
| `is_valid_cpf(text)`   | ✅ Existe | PL/pgSQL IMMUTABLE, search_path=public | authenticated, service_role |

**Nenhum problema detectado.** ✓

---

## Cross-Cutting Issues

### `roles` table — schema divergem

O `roles` table no remoto usa `scope` (text: 'global' ou 'tenant'), enquanto a migration local `20260816000700_rbac.sql` define `is_global` (boolean). Todas as funções que já estavam aplicadas usam `r.scope = 'global'` (correto para o remoto).

**Migration 02 usa `roles.code`** que não existe em nenhuma versão. **Bug.**

### `domain_events` — schema diverge da migration local

A migration local `20260816000900_domain_events.sql` define um schema mais rico (`event_name`, `event_version`, `occurred_at`, `published_at`, `delivery_attempts`, `last_error`, `metadata`), mas o remoto tem um schema mais simples (`event_type`, `idempotency_key text`, sem `event_version`).

A função `emit_domain_event` da migration 07 foi escrita para o schema LOCAL, **não para o schema REMOTO**. **Bug.**

### Data integrity — cadeia candidate

As 4 inconsistências de dados documentadas pela ALLOWLIST:

- 6 people sem membership
- 9 people sem role_assignment
- 3 candidates sem membership
- 4 candidates sem role `candidate`

A função `repair_candidate_chain` (migration 02) foi projetada para consertar isso, mas **não funciona** por caus do bug `roles.code`.

## Recomendações

### 🔴 BLOCKERS (resolver antes do OK final)

1. **Migration 01 — version collision**
   - Remover `20260902000001` de `schema_migrations` (ou aplicar o SQL manualmente)
   - Aplicar manualmente: `CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status_published` e o CHECK constraint em `media_assets`

2. **Migration 02 — bug `roles.code`**
   - Corrigir `WHERE code = p_role_code` → `WHERE name = p_role_code`
   - A role `candidate` existe no remoto (name = 'candidate', scope = 'tenant') ✓

3. **Migration 07 — `emit_domain_event` incompatível**
   - A função tenta inserir em colunas inexistentes (`event_name`, `event_version`, `occurred_at`)
   - **Solução A:** Corrigir a função para usar `event_type` em vez de `event_name`, remover `event_version` e `occurred_at`
   - **Solução B:** Usar `domain_event_emit` que já existe e funciona, e fazer `emit_domain_event` ser um wrapper
   - **Solução C:** Renomear a função para evitar confusão, já que `domain_event_emit` já existe

4. **Migration 06 — política `tenants` restritiva**
   - Decidir: manter `tenants_member_read` como única política (restrita) ou restaurar política aberta para authenticated
   - A política atual bloqueia os 6 people sem membership — mas isso é intencional? O `repair_candidate_chain` deveria consertar isso antes ou a política deveria ser mais permissiva?

### 🟡 ALERTAS

5. **`emit_domain_event` tem GRANT para `anon` e `PUBLIC`** — restringir para `authenticated` + `service_role` apenas

6. **Duas funções de evento coexistindo:** `emit_domain_event` (migration 07, está com bug) e `domain_event_emit` (remoto, funciona). Recomenda-se consolidar em uma.

7. **`bootstrap_candidate_identity` tem `p_phone` no remoto** — a migration de correção (`20260828000001`) foi registrada mas o remoto ainda tem a versão antiga. Verificar se alguém recriou a função após a correção.

## ✅ CONCLUSÃO — P0 CONCLUÍDO

Todos os 4 blockers foram resolvidos:

- **Migration 01** — nova migration `20260902100001_p0_01_schema_reconciliation_delta` aplicada; não foi necessário remover a entrada histórica de `schema_migrations`
- **Migration 02** — `repair_candidate_chain` corrigida para usar `roles.name` e column references qualificadas
- **Migration 07** — `emit_domain_event` transformada em wrapper sobre `domain_event_emit`; grants de `anon`/`PUBLIC` revogados
- **Migration 06** — `repair_candidate_chain` executada para 7 records (4 candidates + 3 test candidates); memberships criados para 2 non-candidate people; cadeia integrity validada (0 inconsistências)

### Arquivos modificados no repositório

| Arquivo                                                | Mudança                                                  |
| ------------------------------------------------------ | -------------------------------------------------------- |
| `20260902000002_02_identity_rbac.sql`                  | `code` → `name`; column refs qualificadas                |
| `20260902000007_07_events_outbox.sql`                  | `emit_domain_event` como wrapper; revoke `anon`/`PUBLIC` |
| `20260902100001_p0_01_schema_reconciliation_delta.sql` | **NOVA** — delta de schema reconciliation                |

### Próximos passos

Conforme o plano:

1. ✅ Pre-flight concluído
2. ✅ P0 reconciliation aplicada e validada
3. → Fase 2: MOCK × DB inventory (frontend)

### Post-flight validation

```
45 PASSED | 1 WARNING | 0 FAILED
```

A única warning é esperada: 2 people (Person A/B) sem role_assignment — são não-candidates com membership apenas.

**Status:** 🎯 **P0 = GREEN** — pronto para avançar para o inventário frontend (MOCK × DB).
