# Migration Allowlist — J&S Terceirizados

**Data:** 2026-09-02
**Status:** Auditoria fechada — somente leitura e aplicação cirúrgica

---

## Regra de ouro

> **NUNCA executar `supabase db push` às cegas.**
> **NUNCA aplicar migrations históricas fora desta allowlist.**
> **SEMPRE aplicar migrations individualmente, via `psql -f` ou SQL Editor.**

O repositório possui `~47` arquivos em `supabase/migrations/` e outros `47` em
`supabase/specs/sql/`. Apenas uma fração está alinhada com o estado real do
Supabase (`okxqfyoqbhcmflpurfrw`). Aplicar o pacote inteiro causa:

- Colunas duplicadas (erro 42701)
- Constraints duplicadas
- Buckets com nomes divergentes (canônico v1 vs legado)
- Recriação de tabelas com perda de dados

---

## Estado conhecido do Supabase

| Objeto                                                                          | Existe?     | Origem                                      |
| ------------------------------------------------------------------------------- | ----------- | ------------------------------------------- |
| `tenants`, `people`, `tenant_memberships`                                       | ✅          | migrations base                             |
| `companies`, `company_relationships`, `company_relationship_types`              | ✅          | `20260816000300`                            |
| `services`                                                                      | ✅ parcial  | migration fora do controle git              |
| `company_services`                                                              | ✅          | `supabase/specs/sql/34_crm_services.sql`    |
| `service_orders`                                                                | ✅          | `supabase/specs/sql/04b_service_orders.sql` |
| `recruitment_demands`                                                           | ✅          | `supabase/specs/sql/34_crm_services.sql`    |
| `job_matches`                                                                   | ✅          | seed RBAC                                   |
| `notifications`                                                                 | ✅          | `20260816001000`                            |
| `company_social_links`                                                          | ❌          | pendente                                    |
| bucket `services-images`                                                        | ❌          | pendente                                    |
| bucket `public-media`                                                           | ❌          | pendente                                    |
| bucket `avatars`                                                                | ❌          | pendente                                    |
| bucket `private-documents`                                                      | ❌          | pendente                                    |
| FKs de `company_services`, `service_orders`, `recruitment_demands` → `services` | ❌          | pendente                                    |
| Triggers `auth.users → people`                                                  | ⚠️ provável | aplicar com defesa                          |

---

## ✅ ALLOWLIST — aplicar nesta ordem

| #   | Arquivo                                               | Por que                                     | Comando     |
| --- | ----------------------------------------------------- | ------------------------------------------- | ----------- |
| 1   | `20260828000001_fix_bootstrap_identity.sql`           | Corrige função órfã                         | `psql -f …` |
| 2   | `20260830000100_auth_people_sync.sql`                 | Garante triggers auth→people                | `psql -f …` |
| 3   | `20260830000200_reconcile_applications.sql`           | Colunas canônicas em `applications`         | `psql -f …` |
| 4   | `20260830000300_reconcile_recruitment_demands.sql`    | Colunas canônicas em `recruitment_demands`  | `psql -f …` |
| 5   | `20260830000500_reconcile_job_matches.sql`            | Colunas canônicas em `job_matches`          | `psql -f …` |
| 6   | `20260830000600_reconcile_notifications.sql`          | Colunas canônicas em `notifications`        | `psql -f …` |
| 7   | `20260830000800_company_services_link.sql`            | FK `company_services → services`            | `psql -f …` |
| 8   | `20260830000900_service_orders_relationship.sql`      | FK `service_orders → company_relationships` | `psql -f …` |
| 9   | `20260830001000_recruitment_demands_service_link.sql` | FK `recruitment_demands → services`         | `psql -f …` |
| 10  | `20260830001100_storage_services_images.sql`          | bucket `services-images`                    | `psql -f …` |
| 11  | `20260831000001_company_social_links.sql`             | cria tabela `company_social_links`          | `psql -f …` |
| 12  | **`20260902000001_reconcile_services_cms.sql`**       | reconcilia colunas CMS em `services`        | `psql -f …` |

Cada arquivo é **idempotente** (usa `IF NOT EXISTS`, `CREATE OR REPLACE`,
`DROP … IF EXISTS`). Re-executar não causa efeito colateral.

---

## 🚫 ALLOWLIST-negativa — NÃO aplicar

| Arquivo                                   | Por que NÃO                                                                                                                                                                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `20260829000001_services.sql`             | Tabela `services` já existe parcialmente; `CREATE TABLE IF NOT EXISTS` é no-op, mas as policies/triggers seriam recriados e podem quebrar permissões existentes. Usar a reconciliação (`20260902000001`).                                              |
| `20260901000001_media_storage_v1.sql`     | Canônico consolidado pensado para ambiente limpo; conflita com a sequência incremental acima e cria 3 buckets (`public-media`, `avatars`, `private-documents`) não solicitados nesta janela. Reaproveitar a lógica se for pedido em momento posterior. |
| Qualquer migration em `supabase/_legacy/` | Histórica, já refletida no banco.                                                                                                                                                                                                                      |
| Qualquer arquivo em `supabase/specs/sql/` | Catálogo de referência, não migrations. Nunca rodar em produção.                                                                                                                                                                                       |

---

## Procedimento de aplicação

1. Confirmar o **estado real** rodando os 6 SELECTs abaixo no SQL Editor
   (somente leitura):

   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_schema='public' AND table_name='services'
   ORDER BY ordinal_position;

   SELECT table_name FROM information_schema.tables
   WHERE table_schema='public' AND table_name IN
   ('services','company_services','service_orders','recruitment_demands',
    'company_relationships','company_social_links','media_assets');

   SELECT id, name, public FROM storage.buckets ORDER BY id;

   SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;
   ```

2. Confirmar backup/snapshot do projeto Supabase.

3. Aplicar a allowlist **na ordem**, **um arquivo por vez**, validando o
   resultado entre execuções:

   ```bash
   psql "$SUPABASE_DB_URL" \
        -v ON_ERROR_STOP=1 \
        -f supabase/migrations/20260828000001_fix_bootstrap_identity.sql

   psql "$SUPABASE_DB_URL" \
        -v ON_ERROR_STOP=1 \
        -f supabase/migrations/20260830000100_auth_people_sync.sql
   # ... e assim por diante.
   ```

4. Após cada execução, conferir com `information_schema` que o objeto
   esperado foi criado/alterado.

5. Ao final, rodar:

   ```sql
   -- Verificação final de sanidade
   SELECT column_name FROM information_schema.columns
   WHERE table_schema='public' AND table_name='services'
   ORDER BY ordinal_position;

   SELECT conname FROM pg_constraint
   WHERE conrelid = 'public.services'::regclass;

   SELECT indexname FROM pg_indexes
   WHERE schemaname='public' AND tablename='services';

   SELECT policyname FROM pg_policies
   WHERE schemaname='public' AND tablename='services';

   SELECT id, name, public FROM storage.buckets
   WHERE id = 'services-images';
   ```

---

## Rollback — em caso de falha durante a aplicação

A allowlist foi desenhada para ser **para-safe** (cada migration adiciona,
nunca remove). Caso uma aplicação falhe, o rollback é igualmente cirúrgico.

### Antes de tudo

1. **NÃO** rodar `git revert` do commit `14a1f84` enquanto o banco estiver
   inconsistente — o SQL já foi aplicado.
2. **NÃO** rodar `supabase db reset` — isso recria o banco inteiro e perde
   dados de produção.
3. Confirmar o backup mais recente no painel do Supabase (Project →
   Database → Backups → Point-in-Time Recovery).

### Rollback por arquivo (na ordem inversa da allowlist)

```sql
-- 12. REMOVER reconciliação de services CMS
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
DROP POLICY IF EXISTS services_member_write ON public.services;
DROP POLICY IF EXISTS services_member_read ON public.services;
DROP POLICY IF EXISTS services_public_read ON public.services;
-- Apenas colunas ADICIONADAS por esta migration (se tiver certeza de que
-- são nossas e não vieram de fora):
-- ALTER TABLE public.services DROP COLUMN IF EXISTS short_description;
-- ALTER TABLE public.services DROP COLUMN IF EXISTS card_image_url;
-- ... (uma por uma, validando que estavam ausentes antes)

-- 11. company_social_links (DROP TABLE — só se segura que está vazia)
DROP TABLE IF EXISTS public.company_social_links;

-- 10. bucket services-images
DELETE FROM storage.buckets WHERE id = 'services-images';
-- policies caem juntas com o bucket (storage.objects referencia bucket_id)

-- 9. recruitment_demands.service_id
ALTER TABLE public.recruitment_demands DROP COLUMN IF EXISTS service_id;
DROP INDEX IF EXISTS idx_recruitment_demands_service_id;

-- 8. service_orders.company_relationship_id
ALTER TABLE public.service_orders DROP COLUMN IF EXISTS company_relationship_id;
DROP INDEX IF EXISTS idx_service_orders_company_relationship_id;

-- 7. company_services.service_id
ALTER TABLE public.company_services DROP COLUMN IF EXISTS service_id;
DROP INDEX IF EXISTS idx_company_services_service_id;
DROP INDEX IF EXISTS idx_company_services_company_id;

-- 6. notifications (colunas adicionadas)
ALTER TABLE public.notifications DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS title;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS message;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS read_at;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_read_at;

-- 5. job_matches
ALTER TABLE public.job_matches DROP COLUMN IF EXISTS job_id;
ALTER TABLE public.job_matches DROP COLUMN IF EXISTS match_details;
ALTER TABLE public.job_matches DROP COLUMN IF EXISTS notified_at;
ALTER TABLE public.job_matches DROP COLUMN IF EXISTS applied_at;
DROP INDEX IF EXISTS idx_job_matches_job_id;

-- 4. recruitment_demands (FASE 3)
ALTER TABLE public.recruitment_demands
  DROP COLUMN IF EXISTS contact_name,
  DROP COLUMN IF EXISTS contact_email,
  DROP COLUMN IF EXISTS contact_phone,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS urgency,
  DROP COLUMN IF EXISTS service_type,
  DROP COLUMN IF EXISTS responsible_person_id;
DROP INDEX IF EXISTS idx_recruitment_demands_urgency;

-- 3. applications
ALTER TABLE public.applications
  DROP COLUMN IF EXISTS tenant_id,
  DROP COLUMN IF EXISTS metadata,
  DROP COLUMN IF EXISTS created_by;
DROP INDEX IF EXISTS idx_applications_tenant_id;
DROP INDEX IF EXISTS idx_applications_status;
DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;

-- 2. auth_people_sync
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();
DROP FUNCTION IF EXISTS public.handle_auth_user_updated();
DROP FUNCTION IF EXISTS public.handle_auth_user_deleted();

-- 1. bootstrap_identity — reverter para versão anterior (não há DROP
-- automático; recriar a função a partir da migration 20260826000001)
```

### Rollback do commit git

```bash
# após confirmar que o banco está no estado desejado
git revert --no-edit 14a1f84
git push origin main
```

---

## Quando voltar a migrar normalmente

Esta allowlist é **pontual** (janela 2026-09). Quando o estado do Supabase
estiver totalmente reconciliado e a `supabase_migrations.schema_migrations`
incluir os 12 arquivos acima, o fluxo volta a ser:

```bash
supabase db push   # ou psql em lote das novas migrations
```

até que uma nova divergência force nova auditoria.
