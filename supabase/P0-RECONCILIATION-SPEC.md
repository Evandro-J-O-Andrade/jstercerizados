# P0 Reconciliation Spec — 4 Blockers

**Data:** 2026-09-02
**Origem:** [`PREFLIGHT-20260902.md`](../PREFLIGHT-20260902.md)
**Status:** AGUARDANDO OK EXPLÍCITO para aplicação no Supabase

---

## Blocker P0-01 — Version collision na migration 01

**Causa:** O Supabase já tem registrado `20260902000001 = reconcile_services_cms` (a superseded). A nova `01_schema_reconciliation` nunca executou.

**Correção:** As 4 migrations P0 usam timestamps novos (`20260903000001`..`20260903000004`) para evitar colisão. Conteúdo do `01_schema_reconciliation` original é mantido.

**O que a migration `20260903000001_p0_01_collision_and_schema.sql` faz:**

1. Aplica manualmente o conteúdo da antiga `01_schema_reconciliation` (índice + CHECK + comment).
2. Tudo `IF NOT EXISTS` / `IF NOT EXISTS` no `pg_constraint` para ser idempotente.
3. Não toca em `supabase_migrations.schema_migrations` (a versão antiga fica lá; isso é OK porque a P0-01 é uma nova versão).

## Blocker P0-02 — `repair_candidate_chain` referencia `roles.code`

**Causa:** Migration 02 fez `WHERE code = p_role_code`, mas o `roles` real tem `name` e `scope`, não `code`.

**Correção:** Migration `20260903000002_p0_02_repair_chain.sql` faz `CREATE OR REPLACE FUNCTION` da função, trocando `code` por `name`. O default `p_role_code` (parâmetro continua se chamando `p_role_code` por compatibilidade da assinatura) agora corresponde a `roles.name`.

**Confirmação:** A role `candidate` no banco real tem `name='candidate'`, `scope='tenant'`. A função corrigida vai encontrá-la.

**O que NÃO faz:** Não corrige os 6+9+3+4 registros quebrados. A função fica **utilitária e manual** (não auto-executa). Você decide quando e em quem aplicar.

## Blocker P0-03 — `emit_domain_event` incompatível com `domain_events` real

**Causa:** Função tenta inserir em colunas inexistentes (`event_name`, `event_version`, `occurred_at`).

**Correção:** Migration `20260903000003_p0_03_event_emitter.sql` faz `CREATE OR REPLACE FUNCTION` que usa o schema real:

```text
ANTES:  event_name, event_version, occurred_at
AGORA:  event_type, created_at
```

Mantém os mesmos parâmetros da assinatura (compatibilidade). Também faz `REVOKE EXECUTE FROM PUBLIC, anon` para fechar a exposição. Mantém `GRANT EXECUTE TO authenticated, service_role`.

**Função `domain_event_emit` (existente no banco):** **NÃO TOCA**. A P0-03 só corrige a `emit_domain_event` quebrada. As duas vão coexistir. Você pode, em migration futura, consolidar — não é P0.

## Blocker P0-04 — Política de `tenants` restritiva demais

**Causa:** Apenas `tenants_member_read` existe (usa `is_tenant_member(id)`). 6 people sem membership ativo não conseguem ler **nenhum** tenant → fluxo de login/dashboard quebra.

**Correção:** Migration `20260903000004_p0_04_tenants_rls.sql` adiciona uma policy **aberta** para leitura autenticada:

```sql
CREATE POLICY tenants_authenticated_read
  ON public.tenants FOR SELECT
  TO authenticated
  USING (true);
```

A `tenants_member_read` (restritiva) **fica mantida** — quem tem membership usa a específica. Quem não tem membership usa a aberta. **Não há conflito**: as duas policies se combinam via `OR` (Postgres une policies do mesmo `cmd` por `OR`).

**A escrita continua restrita** (não há INSERT/UPDATE/DELETE policy — só `service_role` consegue escrever, que é o comportamento correto).

---

## Ordem de aplicação

```
1. 20260903000001_p0_01_collision_and_schema.sql
2. 20260903000002_p0_02_repair_chain.sql
3. 20260903000003_p0_03_event_emitter.sql
4. 20260903000004_p0_04_tenants_rls.sql
```

Cada uma com BEGIN/COMMIT próprio, idempotente, reversível.

---

## Pós-flight esperado

Depois de aplicar, rodar:

```sql
-- 1. repair_candidate_chain funciona
SELECT * FROM public.repair_candidate_chain(
  (SELECT person_id FROM public.candidates WHERE NOT EXISTS (
    SELECT 1 FROM public.tenant_memberships tm
    WHERE tm.person_id = public.candidates.person_id AND tm.status='active'
  ) LIMIT 1)
);

-- 2. emit_domain_event funciona
SELECT public.emit_domain_event(
  'test.p0', 'test', gen_random_uuid(),
  (SELECT id FROM public.tenants LIMIT 1),
  '{"hello":"world"}'::jsonb,
  'test-p0-' || extract(epoch from now())::text
);

-- 3. tenants: SELECT autenticado
SET LOCAL ROLE authenticated;
SELECT id, name FROM public.tenants LIMIT 1;
RESET ROLE;
```

Se os 3 retornarem OK, **P0 = 0** e seguimos para Fase 2.

---

## Rollback

Cada migration tem bloco de ROLLBACK PLAN no topo. Em ordem inversa:

```sql
-- 04
DROP POLICY IF EXISTS tenants_authenticated_read ON public.tenants;

-- 03
DROP FUNCTION IF EXISTS public.emit_domain_event(text, text, uuid, uuid, jsonb, text);

-- 02
DROP FUNCTION IF EXISTS public.repair_candidate_chain(uuid, uuid, text);

-- 01
DROP INDEX IF EXISTS public.idx_jobs_tenant_status_published;
ALTER TABLE public.media_assets DROP CONSTRAINT IF EXISTS media_assets_entity_type_check;
-- (bucket services-images comentário é inofensivo se permanecer)
```

---

## Decisões congeladas

- ❌ NÃO recriar migrations 01..08 originais (elas já foram aplicadas com bugs)
- ❌ NÃO renomear `emit_domain_event` para `domain_event_emit` (coexistem)
- ❌ NÃO mexer em `schema_migrations` (versão antiga fica lá)
- ❌ NÃO auto-executar `repair_candidate_chain` (utilitário manual)
- ✅ Apenas corrigir as 4 funções/policies quebradas
