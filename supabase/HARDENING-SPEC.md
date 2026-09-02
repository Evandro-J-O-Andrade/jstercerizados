# Platform Hardening + CMS + Media + Identity v1 — SPEC

**Data:** 2026-09-02
**Status:** AGUARDANDO OK EXPLÍCITO do usuário antes de gerar SQL
**Migration proposta:** `20260902xxxxxx_platform_hardening_v1.sql`

---

## Objetivo

Consolidar o Supabase `okxqfyoqbhcmflpurfrw` (projeto `js-empregos`) em um
**único arquivo transacional e idempotente**, sem recriar nada, sem apagar
dados, sem renomear colunas. Resolve as 8 pendências da SUPABASE GATE.

---

## Regra de aprovação

Antes de aplicar no banco:

1. Este SPEC é aprovado pelo usuário com "OK, pode fazer".
2. O SQL completo é gerado em arquivo único.
3. Há um teste de DRY-RUN (cada `ALTER`/`CREATE` envolvido em `EXISTS` check).
4. Há `BEGIN … COMMIT` único (transação atômica).
5. Há `ROLLBACK PLAN` por seção, documentado no próprio arquivo.

---

## Seções

### §01 — Identity/RBAC (reparar cadeia quebrada)

**Problema:** 6 `people` sem membership ativo, 9 sem role assignment,
3 `candidates` sem membership, 4 `candidates` sem role `candidate`.

**Ações:**

- Diagnóstico: query que lista exatamente os IDs quebrados (somente leitura, em comentário).
- **NÃO** criar memberships fantasmas. Apenas gerar **relatório** + **fornecer
  função utilitária** `repair_candidate_chain(person_id uuid)` que:
  - Localiza `person`, `tenant_membership`, `role_assignment`, `candidate` em sequência.
  - Cria o que falta respeitando unicidades.
  - Retorna `TABLE(person_id, tenant_membership_id, role_assignment_id, candidate_id, created boolean)`.
  - É `SECURITY DEFINER` com `search_path = public` e `REVOKE EXECUTE FROM PUBLIC`.
- **Decisão explícita:** repairs **manuais** via SQL Editor. Nada automático.

**Critério de pronto:** função criada, idempotente, testada em 1 registro dummy.

**Rollback:** `DROP FUNCTION IF EXISTS public.repair_candidate_chain(uuid);`

---

### §02 — CMS (fechar publicação/SEO/ordenação)

**Ações por tabela (somente onde faltar):**

| Tabela         | Adicionar (se faltar)                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| `services`     | nada (já completo após `20260902000001`)                                                     |
| `jobs`         | índice em `(status, published_at desc) WHERE status='published'`                             |
| `companies`    | nada (CNPJ + dados OK)                                                                       |
| `blog_posts`   | `seo_title varchar(70)`, `seo_description varchar(160)`, `cover_media_id uuid` (FK opcional) |
| `media_assets` | nada (já completo)                                                                           |

**Critério de pronto:** `pg_indexes WHERE tablename IN (...)` mostra todos os esperados.

**Rollback:** `DROP INDEX IF EXISTS …;` por linha.

---

### §03 — Media (padronização de contrato)

**Ações:**

- Criar **domínio controlado** de `entity_type` (CHECK constraint se ainda não houver):
  `service`, `company`, `job`, `blog_post`, `page`, `avatar`, `document`,
  `candidate_document`, `employee_document`.
- Garantir índice único em `(bucket_id, storage_path)` se ainda não houver.
- Padronizar `public-media` (10 MB, image/*) como destino de imagens públicas.
- `services-images` (legado) marcado como **deprecated** via `COMMENT`.

**Critério de pronto:** constraint criada, índices OK, comentário em `services-images`.

**Rollback:** `ALTER TABLE … DROP CONSTRAINT IF EXISTS …; DROP INDEX IF EXISTS …;`

---

### §04 — Forms (contratos canônicos de domínio)

**Não cria tabelas.** Cria:

- Domínio `phone_br` (regex `^\+?55?\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4}$`) via `DOMAIN` ou CHECKs reusáveis.
- Domínio `cnpj` (regex `^\d{14}$` ou formatado `^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$`).
- Domínio `cpf` (regex `^\d{11}$` ou formatado).
- Função `is_valid_cnpj(text) → boolean` (algoritmo completo dos DV).
- Função `is_valid_cpf(text) → boolean`.
- Função `normalize_cnpj(text) → text` (só dígitos).
- Função `normalize_cpf(text) → text`.

**Não aplica retroativamente em colunas existentes** (não é intrusivo).

**Critério de pronto:** funções existentes, testadas com 3 casos cada (válido, inválido, vazio).

**Rollback:** `DROP FUNCTION IF EXISTS …;`

---

### §05 — FKs (revisão por domínio)

**Não cria FKs novas** (a GATE mostrou que as essenciais já estão).

**Ações:**

- **Listar** (em comentário) todas as FKs existentes que apontam para:
  `tenants`, `companies`, `people`, `candidates`, `jobs`, `services`,
  `company_relationships`.
- **Identificar** (em comentário) FKs opcionais que talvez devessem ser obrigatórias
  (`NOT NULL` + `ON DELETE RESTRICT` em casos selecionados) — **mas NÃO aplicar** sem
  aprovação.
- Gerar relatório SQL (em comentário) que o usuário pode rodar separadamente para
  listar órfãos por tabela.

**Critério de pronto:** relatório documentado, sem alterações de schema.

**Rollback:** N/A (somente documentação).

---

### §06 — RLS (isolamento por tenant)

**Ações (somente onde faltar):**

- Adicionar policies **faltantes** em `tenants` e `company_relationship_types`
  (Advisor: RLS on, sem policy).
- Auditar `storage.objects` por bucket — confirmar 4 policies por bucket
  (`public_read` para `public-media`/`avatars`, `authenticated_read/write/update/delete`
  para `private-documents`).
- **Não tocar** policies existentes (sem `DROP POLICY` global).

**Critério de pronto:** Advisor limpo em `tenants` e `company_relationship_types`.

**Rollback:** `DROP POLICY IF EXISTS …;`

---

### §07 — Security (Advisor cleanup)

**Ações (cirúrgicas, com EXECUTE explícito):**

| Função                         | Ação                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `handle_auth_user_deleted`     | `SET search_path = public, pg_temp`; `REVOKE EXECUTE FROM PUBLIC`; `GRANT EXECUTE TO service_role` |
| `handle_auth_user_updated`     | idem                                                                                               |
| `handle_new_auth_user`         | idem                                                                                               |
| `is_tenant_member`             | idem                                                                                               |
| `is_admin_master`              | idem                                                                                               |
| `user_has_permission`          | idem                                                                                               |
| `user_permissions`             | idem                                                                                               |
| `user_tenant_ids`              | idem                                                                                               |
| `bootstrap_candidate_identity` | idem                                                                                               |

Todas as alterações usam `CREATE OR REPLACE` mantendo a assinatura original.

**Critério de pronto:** `SELECT proname, prosecdef, proconfig FROM pg_proc WHERE proname IN (...)` mostra `search_path` fixo em todas.

**Rollback:** restaurar assinaturas anteriores é impossível sem backup. Por isso **revisão dupla antes de aplicar**.

---

### §08 — Integration (contrato de eventos)

**Ações:**

- Confirmar que `domain_events`, `event_outbox`, `event_deliveries` existem.
- Adicionar (se faltar) índice em `event_outbox(processed_at, created_at)` para o consumer.
- Função `emit_domain_event(event_type text, payload jsonb, tenant_id uuid)` que insere
  em `domain_events` e `event_outbox` em uma transação.
- **NÃO** colocar URLs de webhook, tokens de n8n ou chaves de WhatsApp dentro do banco.
  Esses segredos vivem em `vault` ou em env do consumidor.

**Critério de pronto:** função `emit_domain_event` criada e testada com 1 INSERT dummy.

**Rollback:** `DROP FUNCTION IF EXISTS …;`

---

## Arquivo final (template)

```sql
-- =============================================================================
-- PLATFORM HARDENING + CMS + MEDIA + IDENTITY v1
-- =============================================================================
-- Data: 2026-09-02
-- Status: SPEC APROVADO
-- Transaction: BEGIN … COMMIT (atômico)
-- Idempotente: tudo dentro de EXISTS / IF NOT EXISTS / OR REPLACE
-- =============================================================================

BEGIN;

-- §01 Identity/RBAC
-- ...

-- §02 CMS
-- ...

-- §03 Media
-- ...

-- §04 Forms
-- ...

-- §05 FKs (relatório, sem alterações)
-- ...

-- §06 RLS
-- ...

-- §07 Security
-- ...

-- §08 Integration
-- ...

COMMIT;
```

---

## Decisões já tomadas

1. **Role `candidato` não será criado.** Usar `candidate` (já existe).
2. **`n8n` fora do banco.** Eventos saem via `domain_events`/`event_outbox`.
3. **`media_assets` é o catálogo único** de mídia. Não criar `job_images`, `service_images`, etc.
4. **`services-images` é legado.** Não usar para novas features.
5. **Repair de cadeia de candidato** é função utilitária, não automático.
6. **Migration única e transacional.** Se alguma seção falhar, nada é aplicado.

---

## Próximo passo

**Aguardando "OK, pode fazer"** do usuário.

Após o OK, gero o SQL completo (com placeholders `…` substituídos) em
`supabase/migrations/20260902xxxxxx_platform_hardening_v1.sql`, commito na
`main` (sem push) e aguardo nova aprovação antes do `psql -f`.
