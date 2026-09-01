# MIGRATION AUDIT — 2026-09-01

> Auditoria de `supabase/migrations/` vs Supabase real.
> **Nenhuma migration foi executada durante esta auditoria.** Apenas leitura (SELECT) no banco remoto.

## 1. Estado do Working Tree

| Item                 | Status                                                              |
| -------------------- | ------------------------------------------------------------------- |
| Branch               | `main`                                                              |
| HEAD                 | `3c4442e` (feat: add Media/Storage v1 canonical baseline migration) |
| Remote `origin/main` | `3c4442e` (in sync)                                                 |
| Working tree         | Clean (após resolução de conflitos de stash)                        |
| Arquivo base local   | `supabase/schema.sql` (~1300 linhas, referência)                    |
| Diretório spec       | `supabase/specs/sql/` (referência, não aplicado por ordem)          |
| Legacy local         | `supabase/migrations/_legacy/20250101_chat.sql`                     |
| Legacy local         | `supabase/legacy/20250102_storage.sql`, `20250102_talent_rls.sql`   |

## 2. Migrations Aplicadas no Supabase Real (schema_migrations)

**Total: 34 migrations** — 26 históricas + 8 desta semana.

### 2.1 Históricas (não de hoje)

| Version        | Name                                   | Fonte local?        |
| -------------- | -------------------------------------- | ------------------- |
| 20260816000100 | core_people_tenants                    | Sim                 |
| 20260816000200 | identity_people_auth                   | Sim                 |
| 20260816000300 | companies                              | Sim                 |
| 20260816000400 | candidates                             | Sim                 |
| 20260816000500 | jobs                                   | Sim                 |
| 20260816000600 | applications                           | Sim                 |
| 20260816000700 | rbac                                   | Sim                 |
| 20260816000800 | storage                                | Sim                 |
| 20260816000900 | domain_events                          | Sim                 |
| 20260816001000 | notifications                          | Sim                 |
| 20260816001100 | talent_pool                            | Sim                 |
| 20260816001200 | rls_consolidation                      | Sim                 |
| 20260817000100 | seed                                   | Sim                 |
| 20260817000200 | enable_rls_role_resource_permissions   | Sim                 |
| 20260817000400 | fix_role_assignments_recursion         | Sim                 |
| 20260822000100 | security_hardening_search_path         | **Não** (não local) |
| 20260822000200 | rls_v21_fix_auth_to_people             | **Não** (não local) |
| 20260823000100 | views_security_invoker                 | **Não** (não local) |
| 20260823000200 | security_hardening_revoke_execute      | **Não** (não local) |
| 20260823004800 | rbac_recruitment_seed                  | Sim                 |
| 20260823210000 | fix_recruitment_kpis_security_invoker  | **Não** (não local) |
| 20260605249    | fix_global_admin_permission_resolution | **Não** (não local) |
| 20260829031812 | candidate_auth_bootstrap_trigger       | **Não** (não local) |
| 20260829031829 | lock_candidate_auth_bootstrap_trigger  | **Não** (não local) |
| 20260829062348 | fix_candidate_bootstrap_idempotency    | **Não** (não local) |
| 20260830081820 | create_blog_cms_core                   | **Não** (não local) |

### 2.2 Destas semana (30/08 – 31/08)

| Version (remoto) | Name (arquivo local)                            | Aplicada? | Confirmado no schema?                                               |
| ---------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------- |
| 20260901081151   | 20260830000200_reconcile_applications           | ✅        | ✅ Colunas tenant_id, metadata, created_by presentes                |
| 20260901081157   | 20260830000300_reconcile_recruitment_demands    | ✅        | ✅ Colunas contact_name, contact_email, etc. presentes              |
| 20260901081203   | 20260830000500_reconcile_job_matches            | ✅        | ✅ Colunas job_id, match_details, notified_at, applied_at presentes |
| 20260901081210   | 20260830000600_reconcile_notifications          | ✅        | ✅ Colunas user_id, title, message, read_at presentes               |
| 20260901081217   | 20260830000800_company_services_link            | ✅        | ✅ Coluna service_id presente                                       |
| 20260901081225   | 202608300900_service_orders_relationship        | ✅        | ✅ Coluna company_relationship_id presente                          |
| 20260901081231   | 20260830001000_recruitment_demands_service_link | ✅        | ✅ Coluna service_id presente                                       |
| 20260901081251   | 20260831000001_company_social_links             | ✅        | ✅ Tabela company_social_links existe com todas as colunas          |

**Migrações desta semana NO remote (não aplicadas):**

| Arquivo local                                    | Aplicada?                      | Motivo                                                                                              |
| ------------------------------------------------ | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| 20260824000002_fix_rls_infrastructure_grants.sql | Não                            | Funções is_tenant_member/user_tenant_ids já corretas no remote                                      |
| 20260829000001_services.sql                      | Não                            | Tabela `services` já existe (criada por `create_blog_cms_core`); CREATE TABLE IF NOT EXISTS é no-op |
| 20260830000100_auth_people_sync.sql              | Não                            | Funções handle_new_auth_user / trigger on_auth_user_created NÃO existem                             |
| 20260830000400_candidate_bootstrap_role.sql      | **Removida do repo** (0ed62af) | `candidate` role e function já existem via outras migrations                                        |
| 20260830000700_services_catalog.sql              | **Removida do repo** (0ed62af) | Substituída por `20260829000001_services.sql`                                                       |
| 20260830001100_storage_services_images.sql       | Não                            | Bucket `services-images` e policies NÃO existem                                                     |
| 20260901000001_media_storage_v1.sql              | Não                            | `media_assets`, buckets `public-media`/`avatars`/`private-documents` e policies NÃO existem         |

### 2.3 Hoje (01/09) — Media/Storage v1 (não aplicada)

| Arquivo local                         | Alteração principal                                                             | Aplicada? | Confirmado no DB?                         |
| ------------------------------------- | ------------------------------------------------------------------------------- | --------- | ----------------------------------------- |
| `20260901000001_media_storage_v1.sql` | `media_assets` table, 3 storage buckets + policies, companies cols, service FKs | Não       | `media_assets` NÃO existe; buckets vazios |

## 3. Matriz: Arquivo → Alteração → Aplicada? → Pode executar?

### Arquivos desta semana no HEAD atual

| Arquivo                                               | Alteração                                                  | Já aplicada?               | Confirmação no DB                      | Pode executar?  | Observação                                                                          |
| ----------------------------------------------------- | ---------------------------------------------------------- | -------------------------- | -------------------------------------- | --------------- | ----------------------------------------------------------------------------------- |
| `20260824000002_fix_rls_infrastructure_grants.sql`    | CREATE OR REPLACE is_tenant_member/user_tenant_ids + GRANT | Não (no schema_migrations) | Funções já existem e corretas          | ✅ Seguro       | Idempotente (CREATE OR REPLACE)                                                     |
| `20260829000001_services.sql`                         | CREATE TABLE IF NOT EXISTS services + RLS                  | Não (no schema_migrations) | Tabela existe via create_blog_cms_core | ⚠️ Revisar      | No-op (tabela já existe); faltam colunas published_at, meta_title, meta_description |
| `20260830000100_auth_people_sync.sql`                 | Triggers auth.users → people sync                          | Não (no schema_migrations) | handle_new_auth_user NÃO existe        | ✅ Sim, preciso | NUNCA aplicada; trigger NÃO existe                                                  |
| `20260830000200_reconcile_applications.sql`           | ADD COLUMN tenant_id, metadata, created_by                 | Sim (v. 20260901081151)    | Colunas confirmadas                    | ❌ Não          | Já aplicada                                                                         |
| `20260830000300_reconcile_recruitment_demands.sql`    | ADD COLUMN contato + urgencia + service_type               | Sim (v. 20260901081157)    | Colunas confirmadas                    | ❌ Não          | Já aplicada                                                                         |
| `20260830000500_reconcile_job_matches.sql`            | ADD COLUMN job_id, match_details, etc.                     | Sim (v. 20260901081203)    | Colunas confirmadas                    | ❌ Não          | Já aplicada                                                                         |
| `20260830000600_reconcile_notifications.sql`          | ADD COLUMN user_id, title, message, read_at                | Sim (v. 20260901081210)    | Colunas confirmadas                    | ❌ Não          | Já aplicada                                                                         |
| `20260830000800_company_services_link.sql`            | ADD COLUMN service_id + FK                                 | Sim (v. 20260901081217)    | Coluna confirmada                      | ❌ Não          | Já aplicada                                                                         |
| `20260830000900_service_orders_relationship.sql`      | ADD COLUMN company_relationship_id                         | Sim (v. 20260901081225)    | Coluna confirmada                      | ❌ Não          | Já aplicada                                                                         |
| `20260830001000_recruitment_demands_service_link.sql` | ADD COLUMN service_id + FK                                 | Sim (v. 20260901081231)    | Coluna confirmada                      | ❌ Não          | Já aplicada                                                                         |
| `20260830001100_storage_services_images.sql`          | Bucket services-images + 4 policies                        | Não (no schema_migrations) | Bucket e policies NÃO existem          | ✅ Sim, preciso | NUNCA aplicada                                                                      |
| `20260831000001_company_social_links.sql`             | CREATE TABLE company_social_links                          | Sim (v. 20260901081251)    | Tabela e colunas confirmadas           | ❌ Não          | Já aplicada                                                                         |
| `20260901000001_media_storage_v1.sql`                 | media_assets table, 3 buckets + policies, companies cols   | Não (no schema_migrations) | NÃO existe; buckets vazios             | ✅ Sim, preciso | NUNCA aplicada; commit 3c4442e                                                      |

### Arquivos históricos (NÃO TOCAR)

| Arquivo                                     | Aplicada?                     | Observação                                        |
| ------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| `_legacy/20250101_chat.sql`                 | Sim (tabelas existem)         | Legacy - NÃO aplicar via CLI                      |
| `20260816*` (12 arquivos)                   | Sim (15 migrations no remote) | Base do sistema - NÃO tocar                       |
| `20260817*` (3 arquivos)                    | Sim (3 no remote)             | Base do sistema - NÃO tocar                       |
| `20260823*` (3 arquivos)                    | Parcial (1 no remote)         | 2 aplicadas via outros meios                      |
| `20260824000000_fix_is_tenant_member.sql`   | Não no remote                 | Substituído por 20260824000002                    |
| `20260824000001_seed_jobs.sql`              | Não no remote                 | Não aplicada                                      |
| `20260824005100_fix_auth_helper_grants.sql` | Não no remote                 | Não aplicada                                      |
| `20260825*` (6 arquivos)                    | Não no remote                 | Não aplicadas                                     |
| `20260826000001_candidate_bootstrap.sql`    | Não no remote                 | Não aplicada (trigger existe via outra migration) |
| `20260827*` (5 arquivos)                    | Não no remote                 | Não aplicadas                                     |
| `20260828000001_fix_bootstrap_identity.sql` | Não no remote                 | Não aplicada                                      |

### Arquivos removidos do repo (não aplicar)

| Arquivo antigo                                        | Motivo da remoção                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `20260830000001_auth_people_sync.sql`                 | Timestamp colidía com `20260830000001_reconcile_applications.sql`; substituído por `20260830000100` |
| `20260830000001_reconcile_applications.sql`           | Timestamp duplicado; substituído por `20260830000200`                                               |
| `20260830000002_candidate_bootstrap_role.sql`         | Timestamp colidia com `20260830000002_reconcile_recruitment_demands.sql`; removido (role já existe) |
| `20260830000002_reconcile_recruitment_demands.sql`    | Timestamp duplicado; substituído por `20260830000300`                                               |
| `20260830000003_reconcile_job_matches.sql`            | Substituído por `20260830000500`                                                                    |
| `20260830000004_reconcile_notifications.sql`          | Substituído por `20260830000600`                                                                    |
| `20260830000005_services_catalog.sql`                 | Substituído por `20260829000001_services.sql`                                                       |
| `20260830000006_company_services_link.sql`            | Substituído por `20260830000800`                                                                    |
| `20260830000007_service_orders_relationship.sql`      | Substituído por `20260830000900`                                                                    |
| `20260830000008_recruitment_demands_service_link.sql` | Substituído por `20260830001000`                                                                    |
| `20260830000009_storage_services_images.sql`          | Substituído por `20260830001100`                                                                    |
| `20260824000000_fix_rls_infrastructure_grants.sql`    | Substituído por `20260824000002`                                                                    |
| `20260831000002_reconcile_services.sql`               | Removido (consolidado em outras)                                                                    |
| `20260830000400_candidate_bootstrap_role.sql`         | Removido (function já existe no remote)                                                             |
| `20260830000700_services_catalog.sql`                 | Removido (substituído por `20260829000001_services.sql`)                                            |

## 4. Colisões de Timestamp Encontradas e Resolvidas

| Colisão antiga   | Arquivos em conflito                                                 | Resolução                                                                                           |
| ---------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `20260830000001` | `auth_people_sync.sql` + `reconcile_applications.sql`                | Ambos renomeados para timestamps únicos                                                             |
| `20260830000002` | `candidate_bootstrap_role.sql` + `reconcile_recruitment_demands.sql` | `reconcile_...` renomeado para `20260830000300`; `candidate_bootstrap_role` posteriormente removido |

## 5. Tabelas Críticas — Contagem de Registros no Remote

| Tabela          | Registros |
| --------------- | --------- |
| jobs            | 20        |
| blog_posts      | 0         |
| blog_categories | 0         |
| candidates      | 5         |
| companies       | 10        |
| customers       | 0         |
| suppliers       | 0         |
| applications    | 0         |

## 6. ALLOWLIST — Migrations Autorizadas para Aplicação no Remote

> IDs de versão remotos já aplicados usam timestamps de 2026-09-01 (quando foram realmente enviadas).

### ✅ JÁ APLICADAS (não executar novamente)

1. `20260830000200_reconcile_applications.sql`
2. `20260830000300_reconcile_recruitment_demands.sql`
3. `20260830000500_reconcile_job_matches.sql`
4. `20260830000600_reconcile_notifications.sql`
5. `20260830000800_company_services_link.sql`
6. `20260830000900_service_orders_relationship.sql`
7. `20260830001000_recruitment_demands_service_link.sql`
8. `20260831000001_company_social_links.sql`

### ⏳ PENDING — Precisam ser aplicadas

| #   | Arquivo                                            | Segurança                                     | Ação recomendada                                        |
| --- | -------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| 1   | `20260830000100_auth_people_sync.sql`              | ✅ `create or replace` + `create trigger`     | Executar via CLI                                        |
| 2   | `20260830001100_storage_services_images.sql`       | ✅ `ON CONFLICT DO NOTHING` + `IF NOT EXISTS` | Executar via CLI                                        |
| 3   | `20260824000002_fix_rls_infrastructure_grants.sql` | ✅ `CREATE OR REPLACE` + `GRANT`              | Executar via CLI (funções já corretas, mas idempotente) |
| 4   | `20260901000001_media_storage_v1.sql`              | ✅ `IF NOT EXISTS` + `ON CONFLICT DO NOTHING` | Executar via CLI                                        |

### ⚠️ REVISAR — Tabela já existe, migração é no-op

| Arquivo                       | Problema                                                                                              | Ação                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `20260829000001_services.sql` | `CREATE TABLE IF NOT EXISTS` é no-op; faltam colunas `published_at`, `meta_title`, `meta_description` | Aplicar como `ALTER TABLE ADD COLUMN IF NOT EXISTS` para fechar gaps |

## 7. Instrução para Kilo (comando específico)

```
APLICAR SOMENTE:
  supabase/migrations/20260824000002_fix_rls_infrastructure_grants.sql
  supabase/migrations/20260829000001_services.sql
  supabase/migrations/20260830000100_auth_people_sync.sql
  supabase/migrations/20260830001100_storage_services_images.sql
  supabase/migrations/20260901000001_media_storage_v1.sql

NÃO EXECUTAR:
  - Todas as migrations históricas (20260816* – 20260828*)
  - _legacy/*
  - supabase/legacy/*
  - Todas as migrations já aplicadas (7 arquivos desta semana)
  - Arquivos removidos do repo (timestamp collidido)

COMANDO SEGURO:
  npx supabase db push --dry-run   # verifica antes de aplicar
  npx supabase db push            # aplica somente as 5 pendentes
```

## 8. Observações

1. **Dados preservados**: jobs (20), candidates (5), companies (10) — nenhuma migration desta semana faz DROP TABLE ou DELETE.
2. **Função `is_tenant_member`**: já corrigida no remote (usa `p.auth_user_id = auth.uid()`), não `person_id`.
3. **Bucket `services-images`**: não existe — criar via `20260830001100_storage_services_images.sql`.
4. **`handle_new_auth_user`**: não existe no remote — criar via `20260830000100_auth_people_sync.sql`.
5. **Colisões de timestamp resolvidas**: arquivos antigos `20260830000001` e `20260830000002` (duplicados) foram removidos e substituídos por versões com timestamps únicos.
6. **Migrações remotas não locais**: 9 migrations aplicadas ao remote mas ausentes do repo local (security_hardening__, candidate_auth_bootstrap__, create_blog_cms_core). Não devem ser recriadas — já aplicadas.
