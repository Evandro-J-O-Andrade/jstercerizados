# STAGE 02.14.1b — Classificação das 101 policies `public` sem referência textual aos helpers canônicos (docs-only)

**Projeto:** J&S Empregos LTDA (CHECK BOULER 24H / `js-empregos`, Supabase `okxqfyoqbhcmflpurfrw`)  
**Data:** 2026-11-06  
**Base:** `STAGE02_14_RECONCILIACAO_EVIDENCIAS_E_PARECERES_P0.md` (02.14.1: 671 policies `public`, 570 citam `is_tenant_member`/`user_has_permission`, 101 restantes); `STAGE02_13_MATRIZ_REGRESSAO_E_INVENTARIO_COMPLEMENTAR.md` (RLS-001–010).  
**Método:** consultas **read-only** remotas via `supabase db query --linked` sobre `pg_policies` (schema `public`), filtrando policies onde `qual/with_check` **não** contêm `is_tenant_member` nem `user_has_permission`. **Sem** DDL/DML, `GRANT/REVOKE`, alteração de RLS/policies/funções/Storage/Edge/config/código, commit, push ou deploy.

## 1. Reconciliação da contagem (Comprovado por SQL)

| Métrica                                                                       |   Valor | Evidência                                              |
| ----------------------------------------------------------------------------- | ------: | ------------------------------------------------------ |
| Policies `public` sem ref. textual a `is_tenant_member`/`user_has_permission` | **101** | `count(*)` com filtro negativo sobre `qual/with_check` |
| Policies `public` com ref. a qualquer helper                                  | **570** | 02.14.1                                                |
| Total `public`                                                                | **671** | 570 + 101                                              |
| Total `pg_policies`                                                           | **683** | 671 `public` + 12 `storage` (02.14.1)                  |

**Conclusão:** as 101 policies fecham a reconciliação 671×570. “Sem referência textual aos helpers canônicos” significa ausência de `is_tenant_member`/`user_has_permission` em `qual/with_check`; **não** significa ausência de autorização, nem equivalência automática ao padrão canônico.

## 2. Distribuição (Comprovado por SQL)

| Roles                  | Cmd    |   N |
| ---------------------- | ------ | --: |
| `{authenticated}`      | INSERT |  28 |
| `{authenticated}`      | UPDATE |  25 |
| `{public}`             | SELECT |  18 |
| `{authenticated}`      | SELECT |   8 |
| `{anon,authenticated}` | SELECT |   6 |
| `{authenticated}`      | ALL    |   6 |
| `{public}`             | INSERT |   4 |
| `{authenticated}`      | DELETE |   3 |
| `{public}`             | DELETE |   2 |
| `{public}`             | UPDATE |   1 |

## 3. Classificação por mecanismo de autorização

Classificação **Inferida** a partir de `roles/cmd/qual/with_check` (Comprovado por SQL para o texto das políticas). Uma policy pode combinar mecanismos; categoria principal = controle dominante.

| Classe                                                 | Critério dominante                                                                                                                                                                       | N (aprox.) | Risco principal                                                                                                                    | Reconc. 02.13.1                                                                                                            |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------: | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **A. Admin/gestão global**                             | `is_admin_master()` e/ou `can_manage_role_assignment(tenant_id)`; inclui `canon_rbac_*` RESTRICTIVE sem `user_has_permission`                                                            |        ~58 | Cobertura de recurso/ação pode ser mais ampla que `resource.action` canônico; depende da semântica de `can_manage_role_assignment` | RLS-004/005/010: validar que admin/gestor não amplia indevidamente e que não substitui permissão de recurso quando exigida |
| **B. Guardas de atribuição/membership**                | `role_assignments`/`tenant_memberships`: self via `current_person_id()` ou gestão via `can_manage_role_assignment`                                                                       |         10 | Escalada de privilégios se guardas permitirem autoatribuição/escopo incorreto                                                      | RLS-002/003/006/010 + testes de bootstrap/RBAC                                                                             |
| **C. Self/identidade**                                 | `auth.uid()=auth_user_id`, `person_id=current_person_id()`, `can_read_person(id)`                                                                                                        |          8 | Vazamento se predicado self for fraco; dependência de `current_person_id()`/`can_read_person()`                                    | RLS-001/002/007                                                                                                            |
| **D. Conteúdo público intencional**                    | `is_active=true`, `status='published'/'active'`, join a registros publicados/ativos, sem tenant no predicado salvo caso específico                                                       |         13 | Exposição cross-tenant/conteúdo indevido se view/tabela misturar tenants; compatível com P0-D em views, mas aqui são policies base | VW/ST-004 análogos; RLS-001; revisar cada tabela                                                                           |
| **E. Tenant/escopo específico não-helper**             | `tenants_public_js_empregos_read` fixa `slug='js-empregos'`                                                                                                                              |          1 | Acoplamento tenant; aceitável só se intencional e mínimo                                                                           | Alinhar à estratégia multi-tenant (P0-D)                                                                                   |
| **F. Amplas/permissivas a revisar**                    | `permissions_member_read` = `true` (roles `{public}`); `company_relationship_types_*` = `true`; `roles_select` usa `auth.role() IN ('authenticated','service_role')` sob role `{public}` |          4 | Exposição desnecessária de catálogo/metadados; semântica de `roles_select` atípica                                                 | RLS-001/010; endurecimento após validar consumidores                                                                       |
| **G. Deny explícito**                                  | `integration_credentials_deny_all` = `false/false`                                                                                                                                       |          1 | Positivo; confirmar ausência de policies permissivas concorrentes efetivas para acesso indevido                                    | Revisar conjunto completo da tabela                                                                                        |
| **H. Join/membership direto sem `is_tenant_member()`** | `activity_logs`, `file_uploads`, `interview_followups_read`, `first_login_state*` usam `EXISTS` em `tenant_memberships`/`people`/`auth.uid()`                                            |          8 | Divergência semântica futura (status ativo, expiração, soft-delete) vs helper canônico; manutenção                                 | RLS-006/010; candidato a harmonização futura, **não** mudança agora                                                        |

## 4. Achados prioritários (sem correção)

| Achado                                                                                                                                                                                                             | Evidência         | Severidade           | Ação recomendada (futura, autorizada)                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `permissions_member_read` permite `SELECT` com `true` para `{public}`                                                                                                                                              | `pg_policies`     | **P1**               | Validar se catálogo de permissões pode ser público; se não, restringir a authenticated/admin/can_manage conforme necessidade.              |
| `company_relationship_types_*` `qual=true` para public/authenticated                                                                                                                                               | `pg_policies`     | **P2/P1**            | Confirmar natureza pública dos tipos; minimizar se contiver dados sensíveis.                                                               |
| `roles_select` combina role `{public}` com predicado `auth.role() authenticated/service_role`                                                                                                                      | `pg_policies`     | **P1**               | Revisar intenção/efetividade (RLS+grants); normalizar padrão.                                                                              |
| Policies `public`/`anon,authenticated` leem tabelas sem filtro tenant (`blog_*`, `jobs` published, `services` published, `company_relationships_public_read` com join companies, `media_assets` published service) | `pg_policies`     | **P0/P1 contextual** | Coerente apenas quando conteúdo é global/publicado intencionalmente; reconciliar com P0-D (views públicas) e estratégia multi-tenant/site. |
| Admin/event/log writes em role `{public}` (`audit_logs_admin_read`, `domain_events_admin_read`, `event_*_admin_write`, `security_events_*`) protegidos por `is_admin_master()`                                     | `pg_policies`     | **P2** (design)      | Role `{public}` com predicado admin pode ser aceitável em RLS; validar superfície/ruído e intenção.                                        |
| `first_login_state*` usa role `{public}` com admin/EXISTS membership                                                                                                                                               | `pg_policies`     | **P1**               | Confirmar necessidade de role `public` vs `authenticated`; validar escopo de self/membership.                                              |
| `candidate_job_alerts`/`favorite_jobs` usam `{public}` + `current_person_id()`                                                                                                                                     | `pg_policies`     | **P1**               | Confirmar comportamento para anon (`current_person_id()` tende a nulo → deny implícito) e se role `authenticated` seria mais clara.        |
| `canon_rbac_*` RESTRICTIVE sem `user_has_permission` (apenas `is_admin_master`/`can_manage_role_assignment`)                                                                                                       | múltiplas tabelas | **P1/P2**            | Pode ser intencional para operações administrativas; verificar se tabelas deveriam exigir permissão de recurso além de gestão.             |

## 5. Correlação com matriz 02.13.1

| Caso 02.13.1                                        | Cobertura 02.14.1b                                                                                                                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RLS-001 (anon em tabelas protegidas)                | Identificadas policies `{public}`/`{anon,authenticated}` SELECT; cada uma requer validação de sensibilidade/tenant/publicação.                                                    |
| RLS-002/003 (tenant A vs B, UUID/tenant adulterado) | Classes A/H/B dependem de `can_manage_role_assignment`, joins `tenant_memberships` ou self; **Pendente** prova controlada por tabela. Classe D geralmente não é tenant-scoped.    |
| RLS-004/005 (admin/global/ROOT)                     | Classe A usa `is_admin_master`/`can_manage_role_assignment`; semântica global vs tenant permanece crítica (06.2, ADR-0001).                                                       |
| RLS-006 (membership expirada/inativa)               | Classe H usa `tm.status='active'` em alguns casos (`first_login_state`), mas padrões variam; **Pendente** harmonização/validação.                                                 |
| RLS-007 (authenticated sem `people`)                | `current_person_id()` e joins por `people`/`auth.uid()` cobrem parte; comportamento exato **Pendente** prova.                                                                     |
| RLS-010 (regressão)                                 | 101 policies são caminho paralelo ao padrão 570-helper; mudanças em `is_admin_master`/`can_manage_role_assignment`/`current_person_id`/`can_read_person` também têm blast radius. |

## 6. Inventário completo (101 policies) — Comprovado por SQL

|   # | Tabela                       | Policy                                            | Tipo | Roles                  | Cmd    | Classe                                         |
| --: | ---------------------------- | ------------------------------------------------- | ---- | ---------------------- | ------ | ---------------------------------------------- |
|   1 | `activity_logs`              | `activity_logs_insert`                            | PERM | `{authenticated}`      | INSERT | H/A                                            |
|   2 | `activity_logs`              | `activity_logs_read`                              | PERM | `{authenticated}`      | SELECT | H/A                                            |
|   3 | `ai_usage`                   | `canon_rbac_i_e0df600a`                           | REST | `{authenticated}`      | INSERT | A                                              |
|   4 | `ai_usage`                   | `canon_rbac_u_e0df600a`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|   5 | `audit_logs`                 | `audit_logs_admin_read`                           | PERM | `{public}`             | SELECT | A (role public)                                |
|   6 | `blog_categories`            | `blog_categories_public_read`                     | PERM | `{public}`             | SELECT | D                                              |
|   7 | `blog_posts`                 | `blog_posts_public_read`                          | PERM | `{public}`             | SELECT | D                                              |
|   8 | `candidate_job_alerts`       | `candidate_job_alerts_self_delete`                | PERM | `{public}`             | DELETE | C                                              |
|   9 | `candidate_job_alerts`       | `candidate_job_alerts_self_read`                  | PERM | `{public}`             | SELECT | C                                              |
|  10 | `candidate_portal_modules`   | `cpm_admin_write`                                 | PERM | `{authenticated}`      | ALL    | A                                              |
|  11 | `candidate_portal_modules`   | `cpm_public_read`                                 | PERM | `{anon,authenticated}` | SELECT | D                                              |
|  12 | `companies`                  | `canon_rbac_i_14651675`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  13 | `companies`                  | `canon_rbac_u_14651675`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  14 | `companies`                  | `companies_public_read`                           | PERM | `{public}`             | SELECT | D (cross-tenant em base; reconciliar P0-D)     |
|  15 | `company_relationship_types` | `company_relationship_types_authenticated_read`   | PERM | `{authenticated}`      | SELECT | F                                              |
|  16 | `company_relationship_types` | `company_relationship_types_public_read`          | PERM | `{public}`             | SELECT | F                                              |
|  17 | `company_relationships`      | `company_relationships_public_read`               | PERM | `{public}`             | SELECT | D (join companies; validar tenant)             |
|  18 | `dashboard_widgets`          | `canon_rbac_i_a63d914c`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  19 | `dashboard_widgets`          | `canon_rbac_u_a63d914c`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  20 | `domain_events`              | `domain_events_admin_read`                        | PERM | `{public}`             | SELECT | A (role public)                                |
|  21 | `employee_status_history`    | `parent_emp_u_fd95d9a6`                           | REST | `{authenticated}`      | UPDATE | A (via employees)                              |
|  22 | `event_deliveries`           | `event_deliveries_admin_write`                    | PERM | `{public}`             | INSERT | A (role public)                                |
|  23 | `event_outbox`               | `event_outbox_admin_write`                        | PERM | `{public}`             | INSERT | A (role public)                                |
|  24 | `faqs`                       | `canon_rbac_d_6da8c9e2`                           | REST | `{authenticated}`      | DELETE | A                                              |
|  25 | `faqs`                       | `canon_rbac_i_6da8c9e2`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  26 | `faqs`                       | `canon_rbac_u_6da8c9e2`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  27 | `favorite_jobs`              | `favorite_jobs_self_delete`                       | PERM | `{public}`             | DELETE | C                                              |
|  28 | `favorite_jobs`              | `favorite_jobs_self_read`                         | PERM | `{public}`             | SELECT | C                                              |
|  29 | `file_access_logs`           | `canon_rbac_i_1f622760`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  30 | `file_uploads`               | `file_uploads_insert`                             | PERM | `{authenticated}`      | INSERT | H/A                                            |
|  31 | `file_uploads`               | `file_uploads_read`                               | PERM | `{authenticated}`      | SELECT | H/A                                            |
|  32 | `first_login_state`          | `first_login_state_member_read`                   | PERM | `{public}`             | SELECT | H/A                                            |
|  33 | `first_login_state`          | `first_login_state_member_update`                 | PERM | `{public}`             | UPDATE | H/A                                            |
|  34 | `first_login_state`          | `first_login_state_member_write`                  | PERM | `{public}`             | INSERT | H/A                                            |
|  35 | `fiscal_api_requests`        | `canon_rbac_i_d7d5de5e`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  36 | `fiscal_api_requests`        | `canon_rbac_u_d7d5de5e`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  37 | `fiscal_api_responses`       | `canon_rbac_i_70a3b599`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  38 | `footer_configs`             | `footer_configs_admin_write`                      | PERM | `{authenticated}`      | ALL    | A                                              |
|  39 | `footer_configs`             | `footer_configs_public_read`                      | PERM | `{anon,authenticated}` | SELECT | D                                              |
|  40 | `global_navigation_links`    | `gnl_admin_write`                                 | PERM | `{authenticated}`      | ALL    | A                                              |
|  41 | `global_navigation_links`    | `gnl_public_read`                                 | PERM | `{anon,authenticated}` | SELECT | D                                              |
|  42 | `integration_credentials`    | `integration_credentials_deny_all`                | PERM | `{authenticated}`      | ALL    | G                                              |
|  43 | `interview_followups`        | `interview_followups_admin`                       | PERM | `{authenticated}`      | ALL    | A                                              |
|  44 | `interview_followups`        | `interview_followups_read`                        | PERM | `{authenticated}`      | SELECT | H/A                                            |
|  45 | `job_skills`                 | `Job skills for published jobs visible to public` | PERM | `{public}`             | SELECT | D                                              |
|  46 | `jobs`                       | `Published jobs visible to public`                | PERM | `{public}`             | SELECT | D (validar tenant em base/P0-D)                |
|  47 | `media_assets`               | `media_assets_public_published_service_read`      | PERM | `{anon,authenticated}` | SELECT | D (join services/tenants)                      |
|  48 | `page_templates`             | `page_templates_admin_write`                      | PERM | `{authenticated}`      | ALL    | A                                              |
|  49 | `page_templates`             | `page_templates_public_read`                      | PERM | `{anon,authenticated}` | SELECT | D                                              |
|  50 | `password_policies`          | `canon_rbac_i_e225f31c`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  51 | `password_policies`          | `canon_rbac_u_e225f31c`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  52 | `people`                     | `People: users update own record`                 | PERM | `{authenticated}`      | UPDATE | C                                              |
|  53 | `people`                     | `people_member_read`                              | PERM | `{authenticated}`      | SELECT | C/A (`auth.uid` OR admin OR `can_read_person`) |
|  54 | `permissions`                | `permissions_member_read`                         | PERM | `{public}`             | SELECT | F                                              |
|  55 | `pos_cancellations`          | `canon_rbac_i_bd3e2276`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  56 | `pos_cancellations`          | `canon_rbac_u_bd3e2276`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  57 | `pos_cash_movements`         | `canon_rbac_i_888e71e8`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  58 | `pos_cash_movements`         | `canon_rbac_u_888e71e8`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  59 | `pos_cashier_sessions`       | `canon_rbac_i_8301740a`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  60 | `pos_cashier_sessions`       | `canon_rbac_u_8301740a`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  61 | `pos_cashiers`               | `canon_rbac_i_91ae8a83`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  62 | `pos_cashiers`               | `canon_rbac_u_91ae8a83`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  63 | `pos_daily_closures`         | `canon_rbac_i_8bf4b95f`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  64 | `pos_daily_closures`         | `canon_rbac_u_8bf4b95f`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  65 | `pos_operators`              | `canon_rbac_i_7ea5448c`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  66 | `pos_operators`              | `canon_rbac_u_7ea5448c`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  67 | `pos_payments`               | `canon_rbac_i_1edfbb58`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  68 | `pos_payments`               | `canon_rbac_u_1edfbb58`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  69 | `pos_returns`                | `canon_rbac_i_f37d3020`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  70 | `pos_returns`                | `canon_rbac_u_f37d3020`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  71 | `pos_sale_items`             | `canon_rbac_i_824b0c7a`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  72 | `pos_sale_items`             | `canon_rbac_u_824b0c7a`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  73 | `pos_sales`                  | `canon_rbac_i_cb5f534d`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  74 | `pos_sales`                  | `canon_rbac_u_cb5f534d`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  75 | `pos_terminals`              | `canon_rbac_i_2ff5e124`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  76 | `pos_terminals`              | `canon_rbac_u_2ff5e124`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  77 | `privacy_requests`           | `canon_rbac_u_f8d05504`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  78 | `providers`                  | `providers_authenticated_read`                    | PERM | `{authenticated}`      | SELECT | D (authenticated-only, sem tenant no texto)    |
|  79 | `role_assignments`           | `role_assignments_admin_delete_guard`             | PERM | `{authenticated}`      | DELETE | B                                              |
|  80 | `role_assignments`           | `role_assignments_admin_scope_guard`              | REST | `{authenticated}`      | INSERT | B                                              |
|  81 | `role_assignments`           | `role_assignments_admin_update_guard`             | REST | `{authenticated}`      | UPDATE | B                                              |
|  82 | `role_assignments`           | `role_assignments_visibility_guard`               | REST | `{authenticated}`      | SELECT | B/C                                            |
|  83 | `role_permissions`           | `role_permissions_member_read`                    | PERM | `{public}`             | SELECT | A/D (admin OR roles tenant scope)              |
|  84 | `roles`                      | `roles_member_read`                               | PERM | `{public}`             | SELECT | A/D                                            |
|  85 | `roles`                      | `roles_select`                                    | PERM | `{public}`             | SELECT | F                                              |
|  86 | `sale_items`                 | `canon_rbac_i_61fdebfe`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  87 | `sale_items`                 | `canon_rbac_u_61fdebfe`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  88 | `sales`                      | `canon_rbac_i_9ed083b1`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  89 | `sales`                      | `canon_rbac_u_9ed083b1`                           | REST | `{authenticated}`      | UPDATE | A                                              |
|  90 | `security_events`            | `security_events_admin_read`                      | PERM | `{public}`             | SELECT | A (role public)                                |
|  91 | `security_events`            | `security_events_admin_write`                     | PERM | `{public}`             | INSERT | A (role public)                                |
|  92 | `services`                   | `services_public_read`                            | PERM | `{public}`             | SELECT | D (validar tenant/publicação)                  |
|  93 | `sessions`                   | `canon_rbac_i_161bca2e`                           | REST | `{authenticated}`      | INSERT | A                                              |
|  94 | `tenant_memberships`         | `tenant_memberships_admin_delete_guard`           | PERM | `{authenticated}`      | DELETE | B                                              |
|  95 | `tenant_memberships`         | `tenant_memberships_admin_insert_permissive`      | PERM | `{authenticated}`      | INSERT | B                                              |
|  96 | `tenant_memberships`         | `tenant_memberships_admin_scope_guard`            | REST | `{authenticated}`      | INSERT | B                                              |
|  97 | `tenant_memberships`         | `tenant_memberships_admin_update_guard`           | REST | `{authenticated}`      | UPDATE | B                                              |
|  98 | `tenant_memberships`         | `tenant_memberships_admin_update_permissive`      | PERM | `{authenticated}`      | UPDATE | B                                              |
|  99 | `tenant_memberships`         | `tenant_memberships_visibility_guard`             | REST | `{authenticated}`      | SELECT | B/C                                            |
| 100 | `tenants`                    | `tenants_public_js_empregos_read`                 | PERM | `{anon,authenticated}` | SELECT | E                                              |
| 101 | `webhook_deliveries`         | `canon_rbac_i_4bbbb5e9`                           | REST | `{authenticated}`      | INSERT | A                                              |

## 7. Pendências (fechamento de 02.14.1b)

1. Validar efetividade de policies com role `{public}` mas predicado admin/self (RLS x grants x `anon/authenticated`).
2. Revisar `permissions_member_read`, `company_relationship_types*`, `roles_select` quanto à necessidade de exposição.
3. Harmonizar políticas H (join direto `tenant_memberships`) com semântica canônica de `is_tenant_member`/expiração/status — **após** matriz 02.13.1 e autorização.
4. Cruzar políticas D (conteúdo público) com modelo multi-tenant/site e P0-D.
5. Confirmar ausência de policies permissivas concorrentes em tabelas sensíveis (`integration_credentials` possui deny-all; outras tabelas não verificadas exaustivamente aqui).

## 8. Estado

- **02.14.1b concluído documentalmente** (contagem e classificação baseadas em SQL read-only). **Nenhuma policy alterada.**
- Próximo: 02.14.2b (provas controladas/efetividade Storage+buckets, se autorizadas) ou 02.14.3b (varredura `pg_proc` segmentada) e pareceres P0 remanescentes. P0 permanecem abertos.
