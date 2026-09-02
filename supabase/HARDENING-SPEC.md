# Platform Consolidation V1 — SPEC (rev. 2026-09-02)

**Status:** AGUARDANDO OK EXPLÍCITO para geração final do pacote e aplicação

---

## Arquitetura de migrations

Em vez de uma única migration monolítica, o pacote é dividido em **8 migrations pequenas, auditáveis e reversíveis**, aplicadas em ordem:

| #   | Arquivo                                       | Seção                                                                                                                                             | Linhas | Risco |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- |
| 01  | `20260902000001_01_schema_reconciliation.sql` | Schema reconciliation (índices, blog_posts SEO, media_assets CHECK, bucket deprecated)                                                            | ~70    | 🟢    |
| 02  | `20260902000002_02_identity_rbac.sql`         | `repair_candidate_chain` utilitária (manual)                                                                                                      | ~120   | 🟢    |
| 03  | `20260902000003_03_cms_media.sql`             | `media_for_entity`, `set_primary_media`                                                                                                           | ~75    | 🟢    |
| 04  | `20260902000004_04_integration_contracts.sql` | `integration_connections`, `integration_credentials`, `integration_events`, `integration_webhooks`, `integration_sync_runs`, `integration_errors` | ~215   | 🟡    |
| 05  | `20260902000005_05_providers.sql`             | `providers`, `provider_configs` (catálogo)                                                                                                        | ~90    | 🟢    |
| 06  | `20260902000006_06_rls_security.sql`          | RLS policies em `tenants`/`company_relationship_types` + `search_path` em 9 funções                                                               | ~155   | 🟡    |
| 07  | `20260902000007_07_events_outbox.sql`         | `emit_domain_event` + índice em `event_outbox`                                                                                                    | ~85    | 🟢    |
| 08  | `20260902000008_08_forms.sql`                 | `normalize_cnpj/cpf`, `is_valid_cnpj/cpf`                                                                                                         | ~150   | 🟢    |

**Total:** 8 migrations, todas com BEGIN/COMMIT, todas idempotentes, todas reversíveis individualmente.

---

## Decisões arquiteturais congeladas

1. **Role `candidato`:** usar `candidate` (já existe no catálogo). Frontend detecta via `roleNames.some(n => n.includes('candidato'))` em `BoasVindas.tsx`.
2. **Integrações:** banco registra `integration_connections` + `integration_events` + `integration_webhooks`. Segredos **fora do banco** (Vault / Edge Functions env). n8n/Edge Functions fazem a chamada HTTP.
3. **Providers:** catálogo `providers` + config por tenant em `provider_configs`. Seed vazio — populado por migration dedicada quando o cliente habilitar.
4. **Eventos:** `domain_events` é canônico, `emit_domain_event` é a única função de escrita. `event_outbox` tem índice parcial para o consumer.
5. **Sem `services-images`:** bucket legado marcado deprecated via `COMMENT`. Novas features usam `public-media`.
6. **Repair de candidato:** função utilitária, manual, chamada 1 a 1 pelo service_role.

---

## Arquitetura final (32 domínios)

Veja [`GAP-MATRIX.md`](./GAP-MATRIX.md) para o status completo de cada domínio.

### Cobertura por migration

| Migration | Domínios cobertos                          |
| --------- | ------------------------------------------ |
| 01        | 12 (Media), 13 (Blog), 11 (Serviços)       |
| 02        | 01 (Identity), 04 (Candidatos)             |
| 03        | 12 (Media)                                 |
| 04        | 29 (Integrações) — **CRIA infraestrutura** |
| 05        | 30 (Providers) — **CRIA catálogo**         |
| 06        | 02 (Tenancy), 03 (RBAC)                    |
| 07        | 28 (Domain Events)                         |
| 08        | 04, 05, 06 (formulários)                   |

### Domínios ainda sem cobertura específica de migration

15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 31, 32 (Estoque, Almoxarifado, OS, Financeiro, Fiscal, PDV, CRM, Chat, Chatbot, Suporte, Notificações, E-mail, Automação, Auditoria, LGPD) — **todos têm estrutura base** e serão endereçados em sprints futuros conforme a matriz GAP.

---

## Procedimento de aplicação

```bash
# 1. Backup/snapshot do Supabase (obrigatório)
# 2. Validar pré-condições:
psql "$SUPABASE_DB_URL" -c "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5;"

# 3. Aplicar UMA por vez, validando entre cada:
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260902000001_01_schema_reconciliation.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260902000002_02_identity_rbac.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260902000003_03_cms_media.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260902000004_04_integration_contracts.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260902000005_05_providers.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260902000006_06_rls_security.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260902000007_07_events_outbox.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260902000008_08_forms.sql
```

Cada migration tem `BEGIN`/`COMMIT` próprio, então se uma falhar, **as anteriores já aplicadas continuam firmes**.

---

## Rollback

Cada migration tem bloco de ROLLBACK PLAN em comentário no topo do arquivo. Em ordem inversa:

```sql
-- 08
DROP FUNCTION IF EXISTS public.is_valid_cpf(text);
DROP FUNCTION IF EXISTS public.is_valid_cnpj(text);
DROP FUNCTION IF EXISTS public.normalize_cpf(text);
DROP FUNCTION IF EXISTS public.normalize_cnpj(text);

-- 07
DROP FUNCTION IF EXISTS public.emit_domain_event(text, text, uuid, uuid, jsonb, text);
DROP INDEX  IF EXISTS public.idx_event_outbox_processed_created;

-- 06
DROP POLICY IF EXISTS tenants_member_read ON public.tenants;
DROP POLICY IF EXISTS company_relationship_types_authenticated_read ON public.company_relationship_types;
-- search_path: ALTER FUNCTION … RESET search_path em cada função

-- 05
DROP TABLE IF EXISTS public.provider_configs CASCADE;
DROP TABLE IF EXISTS public.providers        CASCADE;

-- 04
DROP TABLE IF EXISTS public.integration_errors      CASCADE;
DROP TABLE IF EXISTS public.integration_sync_runs   CASCADE;
DROP TABLE IF EXISTS public.integration_webhooks    CASCADE;
DROP TABLE IF EXISTS public.integration_events      CASCADE;
DROP TABLE IF EXISTS public.integration_credentials CASCADE;
DROP TABLE IF EXISTS public.integration_connections CASCADE;

-- 03
DROP FUNCTION IF EXISTS public.set_primary_media(text, uuid, uuid);
DROP FUNCTION IF EXISTS public.media_for_entity(text, uuid);

-- 02
DROP FUNCTION IF EXISTS public.repair_candidate_chain(uuid, uuid, text);

-- 01
DROP INDEX  IF EXISTS public.idx_jobs_tenant_status_published;
ALTER TABLE public.blog_posts DROP COLUMN IF EXISTS seo_title;
ALTER TABLE public.blog_posts DROP COLUMN IF EXISTS seo_description;
ALTER TABLE public.media_assets DROP CONSTRAINT IF EXISTS media_assets_entity_type_check;
```

---

## Estado atual

- ✅ `d9f9764` (platform_hardening_v1 monolítico) foi **revertido** com `git reset --soft HEAD~1` antes do push
- ✅ Arquivo movido para `supabase/migrations/_superseded/`
- ✅ 8 migrations novas geradas e validadas
- ✅ `GAP-MATRIX.md` criado
- ⏳ Aguardando seu **OK explícito** para `git push origin main`
- ⏳ Depois do push, você aplica no Supabase com `psql -f` uma por uma
