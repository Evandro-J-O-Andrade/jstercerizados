# DATABASE-RECOVERY-AUDIT.md

**Data:** 2026-08-30  
**Projeto:** J&S Empregos LTDA  
**Escopo:** Auditoria de recuperação do banco de dados Supabase para reconstrução local segura.  
**Método:** Somente leitura — análise estática de migrations, specs canônicos, seeds, inventário real do Supabase e documentos de reconciliação prévios.  
**Regra:** Nenhuma migration será executada, nenhum código alterado, nenhum dado modificado.

---

## 1. Objetivo da auditoria

Mapear, classificar e priorizar todas as divergências entre as fontes de verdade do schema do banco de dados Supabase do projeto J&S Empregos LTDA, de modo a permitir uma reconstrução local segura, consistente e não-destrutiva.

O escopo cobre:

- Comparação entre **schema.sql unificado**, **migrations aplicadas**, **specs canônicos V2.1**, **inventário real do banco** e **seeds de homologação**.
- Identificação de tabelas/colunas que devem ser **preservadas**, **evoluídas**, **minimizadas**, **ausentes**, **incorretas**, **duplicadas** ou **incompatíveis**.
- Definição de **ordem de execução** para migração/recriação.
- Separação explícita do **fluxo de senhas** (auth) do fluxo de reconstrução do schema.

---

## 2. Fontes comparadas

| Fonte                | Caminho                                  | Descrição                                                                                                                                        |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Schema unificado     | `supabase/schema.sql`                    | Arquivo monolítico GATE-DATA-02. Contém extensões, core, companies, candidates, jobs, services, tickets, automation, functions e seed bootstrap. |
| Migrations aplicadas | `supabase/migrations/*.sql`              | Histórico real de migrations aplicadas no Supabase.                                                                                              |
| Specs canônicos V2.1 | `supabase/specs/sql/*.sql`               | Schema canônico alinhado com contratos funcionais V2.1. Fonte de verdade para reconstrução.                                                      |
| Auditoria de seeds   | `docs/SEED-SCHEMA-AUDIT.md`              | Comparação linha a linha dos seeds contra `information_schema` real.                                                                             |
| Inventário real      | `docs/SUPABASE-REAL-SCHEMA-INVENTORY.md` | Consulta direta ao banco Supabase real via `information_schema`.                                                                                 |
| Reconciliação V2.1   | `docs/V21-STATIC-RECONCILIATION.md`      | Matriz de reconciliação estática entre contratos funcionais, objeto canônico e SQL specs.                                                        |

---

## 3. Classificação das divergências

| Classificação    | Significado                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **PRESERVADO**   | Estrutura existe em todas as fontes principais e está alinhada. Manter como está.                                                                                                          |
| **EVOLUÍDO**     | Estrutura existe em migrations/schema.sql com colunas/extras que não estão nos specs canônicos. Representa evolução real do banco; avaliar se deve ser promovida ao canônico ou revertida. |
| **MINIMIZADO**   | Estrutura existe nos specs canônicos mas é mais simples/enxuta que a encontrada nas migrations ou no inventário real. Pode ser simplificação intencional do canônico.                      |
| **AUSENTE**      | Estrutura existe em uma fonte mas não foi encontrada em outra.                                                                                                                             |
| **INCORRETO**    | Estrutura contém referências a colunas/tabelas que não existem no schema real.                                                                                                             |
| **DUPLICADO**    | Mesma entidade definida em múltiplos arquivos SQL com definições conflitantes ou redundantes.                                                                                              |
| **INCOMPATÍVEL** | Estrutura existe em duas fontes mas com tipos, nomes ou relações de FK divergentes, impedindo coexistência direta.                                                                         |

---

## 4. Core / Multi-tenancy

### 4.1 Tabelas e divergências

| Tabela               | Specs Canônicos                                                                               | Migrations                                                                                           | Schema.sql                                                               | Inventário Real                                     | Classificação                                                  | Observação                                                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `people`             | 7 colunas                                                                                     | 11 colunas (adiciona `social_name`, `cpf`, `birth_date`, `gender`, `metadata`)                       | 7 colunas                                                                | 7 colunas                                           | **EVOLUÍDO** (migrations)                                      | Campos `cpf`, `birth_date`, `gender`, `metadata` existem apenas nas migrations. Avaliar necessidade legal/LGPD antes de remover.                                                     |
| `tenants`            | 6 colunas (sem `plan`, `settings`)                                                            | 8 colunas (adiciona `plan`, `settings`)                                                              | 6 colunas (sem `plan`, `settings` no `information_schema`, mas seed usa) | 6 colunas (sem `plan`, `settings`)                  | **EVOLUÍDO** (migrations + schema.sql) / **INCORRETO** (seeds) | `plan` e `settings` foram adicionados nas migrations e no schema.sql, mas **não existem no inventário real**. Seeds que inserem `plan`/`settings` falham.                            |
| `tenant_memberships` | 7 colunas (`person_id`, `tenant_id`, `status`, `joined_at`, `created_at`, `updated_at`, `id`) | 9 colunas (usa `user_id` em vez de `person_id`, adiciona `membership_role`, `is_primary`, `left_at`) | N/A                                                                      | 7 colunas (`person_id`, `tenant_id`, sem `role_id`) | **INCOMPATÍVEL** (migrations)                                  | Migrations usam `user_id` → `auth.users(id)` e `membership_role` na própria tabela. Specs canônicos e inventário real usam `person_id` → `people(id)` e role via `role_assignments`. |
| `tenant_settings`    | Presente                                                                                      | Ausente                                                                                              | Ausente                                                                  | Não confirmada                                      | **AUSENTE** (migrations / inventário)                          | Tabela existe apenas nos specs canônicos. Não foi encontrada no inventário real nem nas migrations.                                                                                  |
| `profiles`           | Ausente                                                                                       | Ausente                                                                                              | Presente                                                                 | Não existe                                          | **INCORRETO** (schema.sql)                                     | Tabela `profiles` é um resquício legado incompatível com a arquitetura people-first. **Não recriar.**                                                                                |

### 4.2 Triggers / Functions Core

| Objeto                     | Status                    | Observação                                                                                                                                     |
| -------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `update_updated_at`        | **PRESERVADO**            | Existe em migrations e specs canônicos.                                                                                                        |
| `handle_new_auth_user`     | **PRESERVADO**            | Migrations 002. Sincroniza `auth.users` → `people`.                                                                                            |
| `handle_auth_user_updated` | **PRESERVADO**            | Migrations 002. Sincroniza email.                                                                                                              |
| `handle_auth_user_deleted` | **PRESERVADO**            | Migrations 002. Limpa `auth_user_id` sem deletar pessoa.                                                                                       |
| `handle_new_user`          | **EVOLUÍDO** (schema.sql) | Função no `schema.sql` insere tenant + profile. É incompatível com a arquitetura people-first das migrations 001+002. **Não usar no rebuild.** |

---

## 5. RH

### 5.1 Tabelas e divergências

| Tabela                       | Specs Canônicos                                         | Migrations                                                                                                                                                                                                                                                                              | Schema.sql                                                                                                                                                                                                               | Inventário Real                                         | Classificação                                                 | Observação                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `candidates`                 | 7 colunas                                               | 14 colunas (adiciona `headline`, `salary_expectation_min/max`, `salary_type`, `availability`, `source`, `metadata`, `created_by`)                                                                                                                                                       | 21 colunas (`profile_id` em vez de `person_id`, `name`, `cpf`, `rg`, `phone`, `email`, `birth_date`, `city`, `state`, `target_role`, `target_area`, `salary_min/max`, `experience_summary`, `linkedin`, `portfolio_url`) | 6 colunas (sem `headline`, `source`)                    | **EVOLUÍDO** (migrations/schema.sql) / **MINIMIZADO** (specs) | Inventário real confirma apenas `id`, `person_id`, `tenant_id`, `status`, `created_at`, `updated_at`. Colunas `headline`, `source`, `salary_expectation`, `availability`, `metadata`, `created_by` **não existem no banco real**. |
| `jobs`                       | 13 colunas (sem `slug`, `work_mode`)                    | 25 colunas (adiciona `slug`, `responsibilities`, `requirements`, `benefits`, `salary_min/max`, `salary_type`, `contract_type`, `seniority`, `work_hours`, `work_mode`, `city`, `state`, `location_detail`, `views_count`, `applications_count`, `expires_at`, `metadata`, `created_by`) | 15 colunas (sem `slug`, `work_mode` no inventário, mas com `slug` no DDL)                                                                                                                                                | 14 colunas (sem `work_mode`, `slug`)                    | **EVOLUÍDO** (migrations) / **AUSENTE** (inventário real)     | `slug` e `work_mode` existem nas migrations e no `schema.sql`, mas **não existem no inventário real**. Seeds que usam essas colunas falham.                                                                                       |
| `applications`               | 5 colunas (sem `applied_at`, `current_stage`, `source`) | 14 colunas (adiciona `tenant_id`, `profile_snapshot`, `match_score`, `match_details`, `source`, `current_stage`, `notes`, `applied_at`, `created_by`)                                                                                                                                   | 5 colunas (idêntico aos specs canônicos)                                                                                                                                                                                 | 5 colunas (sem `applied_at`, `current_stage`, `source`) | **EVOLUÍDO** (migrations) / **AUSENTE** (inventário real)     | `applied_at`, `current_stage`, `source` **não existem no banco real**.                                                                                                                                                            |
| `application_status_history` | 6 colunas                                               | 8 colunas (adiciona `previous_stage`, `next_stage`, `changed_by`, `reason`)                                                                                                                                                                                                             | Presente (idêntico aos specs)                                                                                                                                                                                            | Presente (confirmado em V21)                            | **PRESERVADO**                                                |                                                                                                                                                                                                                                   |
| `interviews`                 | Presente (specs 04)                                     | Ausente nas migrations analisadas                                                                                                                                                                                                                                                       | Presente                                                                                                                                                                                                                 | Não confirmado no inventário                            | **AUSENTE** (migrations)                                      | Tabela listada no inventário real como "sem dados", mas não foi possível confirmar colunas via sample.                                                                                                                            |

---

## 6. Recrutamento

### 6.1 Tabelas e divergências

| Tabela                          | Specs Canônicos                              | Migrations                                       | Schema.sql                         | Inventário Real | Classificação                    | Observação                                                                                                                                                                                                                                                                                                         |
| ------------------------------- | -------------------------------------------- | ------------------------------------------------ | ---------------------------------- | --------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `recruitment_processes`         | Presente (04/30)                             | Presente (005/027)                               | Ausente                            | Não confirmado  | **PRESERVADO**                   |                                                                                                                                                                                                                                                                                                                    |
| `recruitment_stages`            | Presente (30)                                | Presente (027)                                   | Ausente                            | Não confirmado  | **PRESERVADO**                   |                                                                                                                                                                                                                                                                                                                    |
| `application_profile_snapshots` | Presente (30)                                | Presente (006)                                   | Ausente                            | Não confirmado  | **PRESERVADO**                   |                                                                                                                                                                                                                                                                                                                    |
| `candidate_experiences`         | Presente (30)                                | Presente (013)                                   | Presente                           | Não confirmado  | **PRESERVADO**                   |                                                                                                                                                                                                                                                                                                                    |
| `candidate_education`           | Presente (30)                                | Presente (013)                                   | Presente                           | Não confirmado  | **PRESERVADO**                   |                                                                                                                                                                                                                                                                                                                    |
| `candidate_courses`             | Presente (30)                                | Presente (013)                                   | Presente                           | Não confirmado  | **PRESERVADO**                   |                                                                                                                                                                                                                                                                                                                    |
| `candidate_languages`           | Presente (30)                                | Presente (013)                                   | Presente                           | Não confirmado  | **PRESERVADO**                   |                                                                                                                                                                                                                                                                                                                    |
| `candidate_skills`              | Presente (04/30)                             | Presente (004/030)                               | Presente                           | Não confirmado  | **DUPLICADO**                    | Definida em múltiplos specs/migrations com estruturas diferentes: migration 004 usa `(candidate_id, skill_id)` como PK sem `tenant_id`; spec 30 usa `id` + `tenant_id` + `unique(candidate_id, skill_id)`.                                                                                                         |
| `job_skills`                    | Presente (04/30)                             | Presente (005/030)                               | Presente                           | Não confirmado  | **DUPLICADO**                    | Mesma divergência de PK/tenant_id entre migrations e specs.                                                                                                                                                                                                                                                        |
| `stage_templates`               | Presente (30)                                | Presente (027)                                   | Ausente                            | Não confirmado  | **PRESERVADO**                   |                                                                                                                                                                                                                                                                                                                    |
| `skills`                        | Presente (04) — sem `tenant_id`, sem `scope` | Presente (004) — com `code`, `slug`, `is_active` | Presente (com `scope`, `category`) | Presente        | **DUPLICADO** / **INCOMPATÍVEL** | Quatro definições conflitantes: (1) migration 004 tem `code`, `slug`, `is_active`, `category`; (2) spec 04 tem apenas `name`, `category`; (3) spec 30 tem `tenant_id`, `description`, `is_global`, `status`; (4) `schema.sql` tem `scope`, `category`. Inventário real confirma existência mas não colunas exatas. |

---

## 7. CRM

### 7.1 Tabelas e divergências

| Tabela                       | Specs Canônicos                                                                                       | Migrations                                                                                                                                                                                                                                                   | Schema.sql                                             | Inventário Real                                     | Classificação                                                        | Observação                                                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `companies`                  | 7 colunas (`id`, `tenant_id`, `name`, `legal_name`, `document`, `status`, `created_at`, `updated_at`) | 20+ colunas (adiciona `trading_name`, `cnpj`, `cnpj_root`, `state_registration`, `municipal_registration`, `company_type_id`, `industry`, `phone`, `email`, `website`, `linkedin_url`, `logo_url`, `address`, `size`, `is_active`, `metadata`, `created_by`) | 13 colunas (com `cnpj`, `type`, `logo_url`, `address`) | 7 colunas (sem `cnpj`, `industry`, `is_active`)     | **EVOLUÍDO** (migrations/schema.sql) / **AUSENTE** (inventário real) | `cnpj`, `industry`, `is_active` **não existem no banco real**. `companies` é global nas migrations, mas tenant-scoped nos specs canônicos.                                           |
| `company_relationships`      | 7 colunas (sem `tenant_id`, `relationship_type_id`)                                                   | 12 colunas (com `tenant_id`, `relationship_type_id`, `started_at`, `ended_at`, `metadata`, `created_by`)                                                                                                                                                     | 8 colunas (com `metadata`)                             | 8 colunas (sem `tenant_id`, `relationship_type_id`) | **INCOMPATÍVEL**                                                     | Migrations esperam FK para `company_relationship_types.id` e `tenant_id`. Inventário real e specs canônicos usam `relationship_type` como texto livre e **não possuem `tenant_id`**. |
| `company_relationship_types` | Ausente                                                                                               | Presente (003)                                                                                                                                                                                                                                               | Ausente                                                | **Não existe**                                      | **AUSENTE**                                                          | Tabela **não encontrada no inventário real**. Seeds que dependem dela falham.                                                                                                        |
| `company_contacts`           | 6 colunas (sem `tenant_id`, `updated_at`)                                                             | 8 colunas (com `tenant_id`, `is_primary`, `updated_at`)                                                                                                                                                                                                      | Ausente                                                | Não confirmado                                      | **EVOLUÍDO** (migrations)                                            |                                                                                                                                                                                      |
| `company_types`              | Ausente                                                                                               | Presente (003)                                                                                                                                                                                                                                               | Ausente                                                | Não confirmado                                      | **AUSENTE**                                                          |                                                                                                                                                                                      |
| `company_services`           | Presente (34)                                                                                         | Ausente                                                                                                                                                                                                                                                      | Ausente                                                | Não confirmado                                      | **AUSENTE** (migrations)                                             |                                                                                                                                                                                      |
| `interactions`               | Presente (34)                                                                                         | Ausente                                                                                                                                                                                                                                                      | Ausente                                                | Não confirmado                                      | **AUSENTE** (migrations)                                             |                                                                                                                                                                                      |
| `recruitment_demands`        | Presente (34)                                                                                         | Ausente                                                                                                                                                                                                                                                      | Ausente                                                | Presente (inventário)                               | **AUSENTE** (migrations) / **PRESERVADO** (inventário)               |                                                                                                                                                                                      |

---

## 8. Facilities

### 8.1 Tabelas e divergências

| Tabela                        | Specs Canônicos                       | Migrations                                                                               | Schema.sql                      | Inventário Real                 | Classificação             | Observação                                                            |
| ----------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------- | ------------------------- | --------------------------------------------------------------------- |
| `services`                    | Presente (05) — `category` text livre | Presente (018) — `category` com CHECK (`rh`, `facilities`, `terceirizacao`, `candidate`) | Presente — `category` com CHECK | Não confirmado                  | **EVOLUÍDO** (schema.sql) | Schema.sql adiciona CHECK constraint e categorias fixas.              |
| `service_orders`              | Presente (04b/05)                     | Presente (013)                                                                           | Presente                        | Presente                        | **PRESERVADO**            |                                                                       |
| `contracts`                   | Presente (05)                         | Presente (013)                                                                           | Presente                        | Presente                        | **PRESERVADO**            |                                                                       |
| `tickets` / `support_tickets` | Presente (14b/40)                     | Presente (019) como `tickets`                                                            | Presente como `tickets`         | Presente como `support_tickets` | **PRESERVADO**            | Nome divergente (`tickets` vs `support_tickets`), mas mesma entidade. |
| `tasks`                       | Presente (14/40)                      | Presente (013)                                                                           | Presente                        | Presente                        | **PRESERVADO**            |                                                                       |
| `task_comments`               | Presente (40)                         | Presente (013)                                                                           | Ausente                         | Não confirmado                  | **PRESERVADO**            |                                                                       |
| `task_attachments`            | Presente (40)                         | Presente (013)                                                                           | Ausente                         | Não confirmado                  | **PRESERVADO**            |                                                                       |
| `task_status_history`         | Presente (40)                         | Presente (013)                                                                           | Ausente                         | Não confirmado                  | **PRESERVADO**            |                                                                       |

---

## 9. Comunicação

### 9.1 Tabelas e divergências

| Tabela                     | Specs Canônicos  | Migrations     | Schema.sql     | Inventário Real | Classificação                  | Observação                                                                      |
| -------------------------- | ---------------- | -------------- | -------------- | --------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `notifications`            | Presente (10/43) | Presente (010) | Presente       | Presente        | **PRESERVADO**                 |                                                                                 |
| `notification_deliveries`  | Presente (10)    | Presente (009) | Ausente        | Não confirmado  | **PRESERVADO**                 |                                                                                 |
| `notification_preferences` | Presente (43)    | Ausente        | Ausente        | Não confirmado  | **AUSENTE** (migrations)       |                                                                                 |
| `emails`                   | Ausente          | Ausente        | Presente (021) | Não confirmado  | **AUSENTE** (specs/migrations) | Tabela existe apenas no `schema.sql` legado. Não confirmada no inventário real. |
| `whatsapp_messages`        | Ausente          | Ausente        | Presente (021) | Não confirmado  | **AUSENTE** (specs/migrations) | Tabela existe apenas no `schema.sql` legado. Não confirmada no inventário real. |

---

## 10. Automação

### 10.1 Tabelas e divergências

| Tabela                                                              | Specs Canônicos | Migrations          | Schema.sql     | Inventário Real | Classificação                  | Observação                                                                                                                                                               |
| ------------------------------------------------------------------- | --------------- | ------------------- | -------------- | --------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `webhooks`                                                          | Ausente         | Ausente             | Presente (021) | Não confirmado  | **AUSENTE** (specs/migrations) | Tabela existe apenas no `schema.sql` legado.                                                                                                                             |
| `webhook_deliveries`                                                | Presente (31)   | Presente (009)      | Ausente        | Não confirmado  | **PRESERVADO**                 |                                                                                                                                                                          |
| `automation_queue`                                                  | Ausente         | Ausente             | Presente (021) | Não confirmado  | **AUSENTE** (specs/migrations) | Tabela existe apenas no `schema.sql` legado.                                                                                                                             |
| `automation_jobs`                                                   | Presente (31)   | Ausente             | Ausente        | Não confirmado  | **AUSENTE** (migrations)       |                                                                                                                                                                          |
| `automation_executions`                                             | Presente (31)   | Ausente             | Ausente        | Não confirmado  | **AUSENTE** (migrations)       |                                                                                                                                                                          |
| `automation_templates`                                              | Presente (42)   | Ausente             | Ausente        | Não confirmado  | **AUSENTE** (migrations)       |                                                                                                                                                                          |
| `ai_conversations`                                                  | Presente (09)   | Presente (008/009)  | Presente       | Não confirmado  | **PRESERVADO**                 | Inventário real lista `chat` como não existente, mas V21-STATIC-RECONCILIATION.md confirma existência via canonical SQL. Possível atraso de sincronização do inventário. |
| `ai_messages`                                                       | Presente (09)   | Presente (009)      | Ausente        | Não confirmado  | **PRESERVADO**                 |                                                                                                                                                                          |
| `chat_rooms`, `chat_participants`, `chat_messages`, `chat_handoffs` | Presentes (09)  | Presentes (008/009) | Ausente        | Não confirmado  | **PRESERVADO**                 |                                                                                                                                                                          |

---

## 11. Auditoria / LGPD

### 11.1 Tabelas e divergências

| Tabela                    | Specs Canônicos                                                                                                                                                            | Migrations         | Schema.sql                                                                                   | Inventário Real       | Classificação            | Observação                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------- | --------------------- | ------------------------ | ---------------------------------------------------------------------------------------------- |
| `audit_logs`              | Presente (11) — `actor_person_id`, `tenant_id`, `scope`, `action`, `entity_type`, `entity_id`, `before_data`, `after_data`, `correlation_id`, `causation_id`, `created_at` | Presente (009/011) | Presente (017) — `user_id`, `table_name`, `record_id`, `details`, `ip_address`, `user_agent` | Presente (1 registro) | **EVOLUÍDO**             | Migrations e specs canônicos possuem estrutura mais rica que o schema.sql e o inventário real. |
| `security_events`         | Presente (11)                                                                                                                                                              | Presente (011)     | Ausente                                                                                      | Presente              | **PRESERVADO**           |                                                                                                |
| `first_login_state`       | Presente (11)                                                                                                                                                              | Presente (011)     | Ausente                                                                                      | Presente              | **PRESERVADO**           |                                                                                                |
| `legal_acceptances`       | Presente (11)                                                                                                                                                              | Presente (011)     | Ausente                                                                                      | Presente              | **PRESERVADO**           |                                                                                                |
| `consents`                | Presente (11)                                                                                                                                                              | Ausente            | Ausente                                                                                      | Não confirmado        | **AUSENTE** (migrations) |                                                                                                |
| `privacy_requests`        | Presente (11)                                                                                                                                                              | Ausente            | Ausente                                                                                      | Não confirmado        | **AUSENTE** (migrations) |                                                                                                |
| `data_export_requests`    | Presente (11)                                                                                                                                                              | Ausente            | Ausente                                                                                      | Não confirmado        | **AUSENTE** (migrations) |                                                                                                |
| `data_deletion_requests`  | Presente (11)                                                                                                                                                              | Ausente            | Ausente                                                                                      | Não confirmado        | **AUSENTE** (migrations) |                                                                                                |
| `data_retention_policies` | Presente (11)                                                                                                                                                              | Ausente            | Ausente                                                                                      | Não confirmado        | **AUSENTE** (migrations) |                                                                                                |

---

## 12. Matriz final

| Domínio          | Tabela                                | Legado | V2.1 Canônico | Banco Real | Classificação | Ação                           |
| ---------------- | ------------------------------------- | ------ | ------------- | ---------- | ------------- | ------------------------------ |
| **Core**         | `people`                              | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Core**         | `tenants`                             | ✅     | ✅            | ✅         | PRESERVADO    | Manter (sem `plan`/`settings`) |
| **Core**         | `tenants.plan`                        | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar                    |
| **Core**         | `tenants.settings`                    | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar                    |
| **Core**         | `tenant_settings`                     | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **Core**         | `profiles`                            | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar                    |
| **Core**         | `tenant_memberships`                  | ✅     | ✅            | ✅         | EVOLUÍDO      | Migrar `user_id` → `person_id` |
| **Core**         | `tenant_memberships.membership_role`  | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar                    |
| **RBAC**         | `roles`                               | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **RBAC**         | `permissions`                         | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **RBAC**         | `role_permissions`                    | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **RBAC**         | `role_assignments`                    | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **CRM**          | `companies`                           | ✅     | ✅            | ✅         | EVOLUÍDO      | Migrar colunas                 |
| **CRM**          | `companies.cnpj`                      | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar                    |
| **CRM**          | `companies.type`                      | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar                    |
| **CRM**          | `company_relationships`               | ✅     | ✅            | ✅         | INCOMPATÍVEL  | Migrar modelo                  |
| **CRM**          | `company_relationship_types`          | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar                    |
| **CRM**          | `company_contacts`                    | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **RH**           | `candidates`                          | ✅     | ✅            | ✅         | INCOMPATÍVEL  | Migrar modelo                  |
| **RH**           | `jobs`                                | ✅     | ✅            | ✅         | EVOLUÍDO      | Remover `work_mode`/`slug`     |
| **RH**           | `applications`                        | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **RH**           | `application_status_history`          | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **RH**           | `interviews`                          | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **RH**           | `curricula`                           | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar                    |
| **RH**           | `experiences`, `education`, `courses` | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar                    |
| **RH**           | Tabelas de processo seletivo          | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar                    |
| **Recrutamento** | `recruitment_demands`                 | ❌     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Services**     | `services`                            | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **Services**     | `service_orders`                      | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Services**     | `service_order_status_history`        | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **Services**     | `contracts`                           | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Services**     | `contract_status_history`             | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **Facilities**   | `products`                            | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Facilities**   | `stock_movements`                     | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Facilities**   | `purchase_orders`                     | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Facilities**   | `purchase_receipts`                   | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Facilities**   | Tabelas de estoque/custódia V2.1      | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **Comunicação**  | `notifications`                       | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Comunicação**  | `notification_deliveries`             | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **Comunicação**  | `domain_events`                       | ❌     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Comunicação**  | `event_outbox`, `event_deliveries`    | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **Comunicação**  | Chat / AI                             | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **Automação**    | `automation_templates`                | ❌     | ✅            | ❌         | AUSENTE       | Criar (se necessário)          |
| **Auditoria**    | `audit_logs`                          | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Auditoria**    | `security_events`                     | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Auditoria**    | `first_login_state`                   | ✅     | ✅            | ✅         | PRESERVADO    | Manter                         |
| **Auditoria**    | `legal_acceptances`                   | ✅     | ✅            | ✅         | EVOLUÍDO      | Adicionar colunas              |
| **LGPD**         | `consents`                            | ❌     | ✅            | ❌         | AUSENTE       | Criar                          |
| **LGPD**         | `privacy_requests`                    | ❌     | ✅            | ❌         | AUSENTE       | Criar                          |
| **LGPD**         | `data_export_requests`                | ❌     | ✅            | ❌         | AUSENTE       | Criar                          |
| **LGPD**         | `data_deletion_requests`              | ❌     | ✅            | ❌         | AUSENTE       | Criar                          |
| **LGPD**         | `data_retention_policies`             | ❌     | ✅            | ❌         | AUSENTE       | Criar                          |
| **Finance**      | `finance`                             | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar (post-V2.1)        |
| **Fiscal**       | `fiscal`                              | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar (post-V2.1)        |
| **PDV**          | `pos`                                 | ✅     | ❌            | ❌         | MINIMIZADO    | Não recriar (post-V2.1)        |
| **Finance**      | Tabelas Finance/Fiscal/PDV            | ❌     | ❌            | ❌         | AUSENTE       | Post-V2.1                      |

---

## 13. Itens que NÃO devem ser recriados

Os seguintes itens fazem parte do schema legado, mas foram removidos ou minimizados no V2.1 canônico. **Não devem ser recriados** durante a recuperação do banco:

### 13.1 Tabelas

- `profiles` — substituída por `people`
- `curricula` — removida do V2.1
- `experiences` — removida do V2.1
- `education` — removida do V2.1
- `courses` — removida do V2.1
- `candidate_skills` — removida do V2.1
- `candidate_experiences` — removida do V2.1
- `candidate_education` — removida do V2.1
- `candidate_courses` — removida do V2.1
- `candidate_languages` — removida do V2.1
- `skills` — removida do V2.1
- `job_skills` — removida do V2.1
- `stage_templates` — removida do V2.1
- `recruitment_processes` — removida do V2.1
- `recruitment_stages` — removida do V2.1
- `finance` — post-V2.1
- `fiscal` — post-V2.1
- `pos` — post-V2.1
- `accounting` — post-V2.1

### 13.2 Colunas

- `tenants.plan` — substituída por modelo de assinatura futuro
- `tenants.settings` — substituída por `tenant_settings`
- `tenant_memberships.user_id` — substituída por `person_id`
- `tenant_memberships.membership_role` — substituída por `role_assignments`
- `companies.cnpj` — substituída por `document`
- `companies.type` — removida
- `companies.trading_name` — removida
- `companies.address` — removida
- `companies.logo_url` — removida
- `companies.website` — removida
- `companies.whatsapp` — removida
- `companies.phone` — removida
- `companies.email` — removida
- `companies.is_active` — substituída por `status`
- `jobs.work_mode` — removida
- `jobs.slug` — removida
- `applications.applied_at` — removida
- `applications.current_stage` — removida
- `applications.source` — removida
- `candidates.profile_id` — substituída por `person_id`
- `candidates.cpf` — removida
- `candidates.rg` — removida
- `candidates.birth_date` — removida
- `candidates.city` — removida
- `candidates.state` — removida
- `candidates.target_role` — removida
- `candidates.target_area` — removida
- `candidates.salary_min/max` — removida
- `candidates.experience_summary` — removida
- `candidates.linkedin` — removida
- `candidates.portfolio_url` — removida
- `candidates.name` — removida (usa `people.full_name`)
- `candidates.phone` — removida (usa `people.phone`)
- `candidates.email` — removida (usa `people.email`)

---

## 14. Riscos de migração

### 14.1 Seeds bloqueados

Os seeds atuais tentam inserir colunas que não existem no banco real:

- `tenants.plan`, `tenants.settings`
- `company_relationships.tenant_id`, `company_relationships.relationship_type_id`
- `jobs.work_mode`, `jobs.slug`
- `tenant_memberships.role_id`

**Mitigação:** Corrigir seeds antes de executar qualquer migration.

### 14.2 Dados existentes

O banco real possui dados em homologação. Qualquer migration deve ser **incremental e não destrutiva**.

**Mitigação:** Usar `ALTER TABLE ... ADD COLUMN ...` com defaults seguros, nunca `DROP COLUMN` sem backup.

### 14.3 RLS

Muitas tabelas no banco real já possuem RLS habilitado. Alterar schema pode quebrar policies existentes.

**Mitigação:** Revisar policies após cada migration de schema.

### 14.4 Dependências de código

O frontend/types/repositories referenciam colunas que não existem no banco real:

- `companies.tenant_id` (ainda usado em código)
- `candidates.headline`, `candidates.source`
- `applications.source`, `applications.current_stage`

**Mitigação:** Alinhar código e banco na mesma ordem de migração.

---

## 15. Ordem de execução

### Fase 1 — Correções de schema críticas

1. `companies`: remover `tenant_id` (se existir) ou ajustar para modelo canônico
2. `company_relationships`: adicionar `tenant_id` e `relationship_type_id`
3. `jobs`: remover `work_mode`, `slug` ou documentar como extensão
4. `applications`: adicionar `applied_at`, `source`, `current_stage` (se necessário)
5. `candidates`: expandir com colunas de perfil profissional

### Fase 2 — Tabelas ausentes do core

6. `company_relationship_types`
7. `company_contacts`
8. `application_status_history`
9. `interviews`
10. `services`
11. `service_order_status_history`
12. `contract_status_history`
13. `suppliers`
14. `purchase_order_items`
15. `purchase_receipt_items`
16. `stock_balances`
17. `stock_entries`
18. `third_party_custody`, `third_party_custody_items`
19. `support_ticket_status_history`
20. `notification_deliveries`
21. `event_outbox`, `event_deliveries`

### Fase 3 — Chat/AI e automação

22. `chat_rooms`, `chat_participants`, `chat_messages`
23. `ai_conversations`, `ai_messages`, `chat_handoffs`
24. `automation_templates`

### Fase 4 — LGPD e administrativo

25. `consents`
26. `privacy_requests`
27. `data_export_requests`
28. `data_deletion_requests`
29. `data_retention_policies`
30. `tenant_settings`
31. `files`, `file_access_logs`
32. `document_versions`, `document_links`
33. `administrative_requests`, `administrative_tasks`, `administrative_approvals`, `administrative_documents`

### Fase 5 — Seeds e validação

34. Corrigir seeds para refletir o schema real
35. Executar validação SQL completa
36. Revisar RLS/policies
37. Atualizar types/repositories
38. Validar runtime

---

## 16. Fluxo de senha — separado da reconstrução do banco

A recuperação de senha e o fluxo de primeiro acesso são correções independentes da reconstrução do schema. Eles devem ser tratados como uma frente paralela:

```text
CHANGE PASSWORD
        +
PASSWORD RECOVERY
        +
SESSION
        +
/verify
        +
PASSWORD_RECOVERY event
```

Essas correções não dependem de migrations de negócio e podem ser implementadas em paralelo.

---

Documento gerado em: 2026-08-30
