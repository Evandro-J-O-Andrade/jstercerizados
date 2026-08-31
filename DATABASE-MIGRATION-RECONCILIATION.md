# DATABASE-MIGRATION-RECONCILIATION

Data: 2026-08-30
Repositório: Evandro-J-O-Andrade/jstercerizados
Branch: main
Commit base: HEAD

## Objetivo

Confrontar migrations em `supabase/migrations/` e `supabase/specs/sql/` com a arquitetura esperada e com o Supabase real, identificando:

- Migrations faltantes
- Inconsistências de schema/RLS
- Tabelas/documentos que divergem da Core
- Riscos para rebuild

## Resumo Executivo

| Item                                                                                                                                                                                                          | Status     | Severidade |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- |
| `membership_role` CHECK não aceita `recruiter`, mas RLS de candidates/jobs/applications/storage usa `recruiter`                                                                                               | 🔴 CRÍTICO | Alta       |
| Tabelas filhas de candidato (`candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`, `candidate_documents`) existem no Git mas podem não estar aplicadas no Supabase real | 🟠 MÉDIO   | Média      |
| `tmp_apply_migrations.cjs` com credenciais hardcoded eDROP TABLE CASCADE na raiz do projeto                                                                                                                   | 🔴 CRÍTICO | Alta       |
| Seeds são idempotentes, mas scripts de homologação podem ter executado DELETEs diretos via conexão `postgres`                                                                                                 | 🟠 MÉDIO   | Média      |
| Várias migrations usam `membership_role IN ('owner','admin','manager','recruiter', ...)` sem sincronizar CHECK constraint                                                                                     | 🔴 CRÍTICO | Alta       |
| `schema.sql` e `supabase/specs/sql/*.sql` existem mas não são a fonte de verdade aplicada                                                                                                                     | 🟡 INFO    | Baixa      |

## 1. Mapeamento de Migrations

### 1.1 Sequência esperada (Core → Domínios)

| Ordem | Migration                                                 | Tabelas principais                           | Status no Git |
| ----- | --------------------------------------------------------- | -------------------------------------------- | ------------- |
| 1     | `20260816000100_core_people_tenants.sql`                  | `tenants`, `people`, `tenant_memberships`    | ✅ Presente   |
| 2     | `20260816000200_identity_people_auth.sql`                 | identity/auth helpers                        | ✅ Presente   |
| 3     | `20260816000300_companies.sql`                            | `companies`, `company_relationships`         | ✅ Presente   |
| 4     | `20260816000400_candidates.sql`                           | `candidates`, `skills`, `candidate_skills`   | ✅ Presente   |
| 5     | `20260816000500_jobs.sql`                                 | `jobs`                                       | ✅ Presente   |
| 6     | `20260816000600_applications.sql`                         | `applications`, `application_status_history` | ✅ Presente   |
| 7     | `20260816000700_rbac.sql`                                 | `roles`, `permissions`, `role_permissions`   | ✅ Presente   |
| 8     | `20260816000800_storage.sql`                              | storage/documents                            | ✅ Presente   |
| 9     | `20260816000900_domain_events.sql`                        | `domain_events`                              | ✅ Presente   |
| 10    | `20260816001000_notifications.sql`                        | notifications                                | ✅ Presente   |
| 11    | `20260816001100_talent_pool.sql`                          | talent pool                                  | ✅ Presente   |
| 12    | `20260816001200_rls_consolidation.sql`                    | RLS/permissions seed                         | ✅ Presente   |
| 13    | `20260817000100_seed.sql`                                 | seed canonical                               | ✅ Presente   |
| 14    | `20260817000200_enable_rls_role_resource_permissions.sql` | RLS role/permissions                         | ✅ Presente   |
| 15    | `20260817000400_fix_role_assignments_recursion.sql`       | role_assignments fix                         | ✅ Presente   |
| 16    | `20260823004800_rbac_recruitment_seed.sql`                | RBAC recruitment                             | ✅ Presente   |
| 17    | `20260823004900_rbac_recruitment_seed_remote.sql`         | RBAC recruitment remote                      | ✅ Presente   |
| 18    | `20260823005000_rbac_recruitment_seed_complement.sql`     | RBAC complement                              | ✅ Presente   |
| 19    | `20260824000000_fix_rls_infrastructure_grants.sql`        | RLS grants fix                               | ✅ Presente   |
| 20    | `20260824000000_fix_is_tenant_member.sql`                 | tenant_member helper                         | ✅ Presente   |
| 21    | `20260824000001_seed_jobs.sql`                            | seed jobs                                    | ✅ Presente   |
| 22    | `20260824005100_fix_auth_helper_grants.sql`               | auth grants fix                              | ✅ Presente   |
| 23    | `20260825000001_seed_editorial_data.sql`                  | seed editorial                               | ✅ Presente   |
| 24    | `20260825000002_rls_published_jobs_public.sql`            | RLS jobs public                              | ✅ Presente   |
| 25    | `20260825000003_reconcile_local_vs_cloud.sql`             | reconcile (SELECTs)                          | ✅ Presente   |
| 26    | `20260825000004_first_access_tables.sql`                  | first access                                 | ✅ Presente   |
| 27    | `20260825000005_rbac_finance_fiscal_accounting.sql`       | RBAC finance/fiscal                          | ✅ Presente   |
| 28    | `20260825000006_auth_flow_welcome.sql`                    | auth flow welcome                            | ✅ Presente   |
| 29    | `20260826000001_candidate_bootstrap.sql`                  | bootstrap candidate                          | ✅ Presente   |
| 30    | `20260827000000_recruitment_stages.sql`                   | recruitment stages                           | ✅ Presente   |
| 31    | `20260827000100_employees.sql`                            | employees                                    | ✅ Presente   |
| 32    | `20260827001300_candidate_child_tables.sql`               | candidate filhas                             | ✅ Presente   |
| 33    | `20260827154500_seed_admin_master_permissions.sql`        | seed admin perms                             | ✅ Presente   |
| 34    | `20260828000001_fix_bootstrap_identity.sql`               | fix bootstrap                                | ✅ Presente   |
| 35    | `20260829000001_company_relationships_canonical.sql`      | canonical companies                          | ✅ Presente   |
| 36    | `20260829000002_companies_canonical.sql`                  | canonical companies                          | ✅ Presente   |
| 37    | `20260829000003_candidates_canonical.sql`                 | canonical candidates                         | ✅ Presente   |
| 38    | `20260829000004_jobs_canonical.sql`                       | canonical jobs                               | ✅ Presente   |
| 39    | `20260829000005_applications_canonical.sql`               | canonical applications                       | ✅ Presente   |
| 40    | `20260829000006_job_skills_canonical.sql`                 | canonical job skills                         | ✅ Presente   |
| 41    | `20260829000007_recruitment_demands_canonical.sql`        | canonical demands                            | ✅ Presente   |
| 42    | `20260829000008_job_matches_canonical.sql`                | canonical matches                            | ✅ Presente   |

### 1.2 Specs SQL (referência, não aplicadas por ordem)

Arquivos em `supabase/specs/sql/` são referência/design. A aplicação real usa `supabase/migrations/`.

Quantidade: **52 arquivos SQL** em specs/sql

## 2. Inconsistência Crítica: `membership_role`

### 2.1 CHECK constraint real na Core

Arquivo: `supabase/migrations/20260816000100_core_people_tenants.sql`

```sql
membership_role varchar(20) not null
                 check (membership_role in ('owner','admin','manager','member','viewer')),
```

### 2.2 Uso de `recruiter` em RLS/policies

Migrations que usam `recruiter` (valor **não permitido** pelo CHECK):

| Arquivo                                               | Tabela/Policy       | Linha                                                                |
| ----------------------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| `20260816000400_candidates.sql`                       | candidates RLS      | 240, 250, 282, 293                                                   |
| `20260816000500_jobs.sql`                             | jobs RLS            | 228, 238, 270, 281                                                   |
| `20260816000600_applications.sql`                     | applications RLS    | 392, 402, 469, 480, 512, 523                                         |
| `20260816000800_storage.sql`                          | storage RLS         | 247, 257                                                             |
| `20260816001100_talent_pool.sql`                      | talent_pool RLS     | 32                                                                   |
| `20260816001200_rls_consolidation.sql`                | RBAC seed           | 142, 154                                                             |
| `20260823004800_rbac_recruitment_seed.sql`            | seed recruiter role | 104, 275, 279                                                        |
| `20260823004900_rbac_recruitment_seed_remote.sql`     | seed recruiter role | 102                                                                  |
| `20260823005000_rbac_recruitment_seed_complement.sql` | seed recruiter role | 52                                                                   |
| `20260827000100_employees.sql`                        | employees RLS       | 282, 292, 328, 339, 366, 377, 404, 415, 442, 453, 480, 491, 518, 529 |
| `20260827000000_recruitment_stages.sql`               | stages RLS          | 80, 90                                                               |

### 2.3 Outros valores além do CHECK

Além de `recruiter`, há usos de:

- `rh_manager`
- `hr`
- `finance`
- `fiscal_manager`
- `accountant`
- `support`
- `commercial`
- `operations_manager`
- `stock_manager`
- `security_manager`
- `facilities_manager`
- `lawyer`
- `it_admin`

Esses valores **não estão no CHECK** da Core.

### 2.4 Conclusão

Há **duas fontes de verdade conflitantes**:

1. `tenant_memberships.membership_role` com CHECK fixo (`owner/admin/manager/member/viewer`)
2. Políticas RLS e seeds que esperam roles como `recruiter`, `rh_manager`, etc.

**Isso impede que qualquer migration/seed funcione corretamente**, pois:

- INSERT com `membership_role = 'recruiter'` falha no CHECK
- RLS que filtra por `recruiter` nunca encontrará linhas

## 3. Tabelas Filhas de Candidato

### 3.1 Migration existente

Arquivo: `supabase/migrations/20260827001300_candidate_child_tables.sql`

Tabelas criadas:

- `candidate_experiences`
- `candidate_education`
- `candidate_courses`
- `candidate_languages`
- `candidate_documents`

### 3.2 Referência no código

`src/types/domain/candidate.ts` e repositories correspondentes usam essas tabelas.

### 3.3 Status

- **Git**: ✅ Migration existe
- **Supabase real**: ❓ Não confirmado — precisa de query direta

## 3.1 COMPANY SOCIAL LINKS

### 3.1.1 Migration existente

Arquivo: `supabase/migrations/20260831000001_company_social_links.sql`

Tabela criada:

- `company_social_links` com colunas: `id`, `tenant_id`, `company_id`, `platform`, `url`, `is_active`, `display_order`, `created_at`, `updated_at`

### 3.1.2 Separação arquitetônica

**Redes sociais da empresa** são URLs oficiais e ficam em `company_social_links`:

- Instagram, Facebook, LinkedIn, YouTube, TikTok, WhatsApp, Website
- Acesso por platform + URL
- RLS própria com `is_tenant_member(tenant_id)`
- Integridade: `tenant_id` → `companies.tenant_id` via `company_id`

**Imagens/arquivos do sistema** são outra coisa e não entram em `company_social_links`:

- `storage/file_uploads` → URLs
- `companies.logo_url`, `services.card_image_url`, `blog_posts.cover_image_url`, etc.
- Cada entidade mantém suas próprias URLs de mídia

### 3.1.3 Status

- **Git**: ✅ Migration existe
- **Supabase real**: ❓ Não confirmado — precisa de query direta

## 3.2 Tabelas Filhas de Candidato

### 3.2.1 Migration existente

Arquivo: `supabase/migrations/20260827001300_candidate_child_tables.sql`

Tabelas criadas:

- `candidate_experiences`
- `candidate_education`
- `candidate_courses`
- `candidate_languages`
- `candidate_documents`

### 3.2.2 Referência no código

`src/types/domain/candidate.ts` e repositories correspondentes usam essas tabelas.

### 3.2.3 Status

- **Git**: ✅ Migration existe
- **Supabase real**: ❓ Não confirmado — precisa de query direta

## 4. Scripts Administrativos

### 4.1 `tmp_apply_migrations.cjs`

- Hardcoded credentials PostgreSQL
- DROP TRIGGER / FUNCTION / TABLE / TYPE CASCADE
- Reaplica todas as migrations de `supabase/specs/sql/`
- **Risco**: execução acidental ou em ambiente errado causa perda de dados
- **Correlação com DELETEs**: explica `actor_person_id = NULL`

### 4.2 `scripts/seed-homologation-full.ts`

- Cria 10 usuários de teste
- Cria memberships, role_assignments, companies, relationships, candidates, jobs, applications
- **Idempotente** (usa UPSERT)
- **Não faz DELETE** por conta própria

### 4.3 `scripts/apply-migrations.ts`

- Usa RPC `exec_sql` (não verificada se existe)
- Aplica apenas 2 migrations específicas
- Não contém DELETE em massa

## 5. Schema.sql vs Migrations

### 5.1 `supabase/schema.sql`

Arquivo grande (~1300 linhas). Contém DDL consolidado, mas **não é executado como migration**.

### 5.2 `supabase/V2.1-BASELINE-DEFINITIVE.sql`

Contém referência arquitetural, não DDL executável completo.

### 5.3 `supabase/specs/sql/*.sql`

52 arquivos de referência. `tmp_apply_migrations.cjs` usa essa ordem, mas:

- Inclui migrations que não existem em `supabase/migrations/`
- Ordem pode divergir da aplicada pelo Supabase CLI

## 6. Migrations Aplicadas no Supabase Real (hipótese)

Com base nos DELETEs auditados e na existência de dados parciais:

| Cenário                                                      | Indício                                                                                                                |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Migrations até ~004 aplicadas parcialmente                   | DELETEs em `companies`, `tenant_memberships`, `role_assignments` com `actor_person_id=NULL` sugerem rebuild destrutivo |
| Dados de teste (`Teste Company`) presentes antes dos DELETEs | Indica seed/homologação executada                                                                                      |
| `audit_logs` registra DELETEs individuais                    | Indica `DELETE FROM` explícito, não CASCADE                                                                            |

## 7. Ações Corretivas Recomendadas

### Imediatas

1. **Rotar/remover credenciais** de `tmp_apply_migrations.cjs`
2. **Corrigir CHECK constraint** de `tenant_memberships.membership_role` para incluir roles usadas em RLS, ou remover `recruiter`/outras roles das policies
3. **Confirmar aplicação** de `20260827001300_candidate_child_tables.sql` no Supabase real

### Curto prazo

4. Gerar migration de reconciliação que:
   - Adiciona roles faltantes no CHECK
   - Garante RLS consistente
   - Não deleta dados existentes
5. Documentar ordem canônica de migrations
6. Remover `tmp_apply_migrations.cjs` ou movê-lo para `.scripts/` com aviso explícito

### Médio prazo

7. Adotar **Supabase CLI** como única fonte de verdade para migrations aplicadas
8. Eliminar `supabase/schema.sql` como documento executável; manter apenas como referência
9. Implementar CI que valida `supabase/migrations/` contra banco de teste

## 8. Matriz de Reconciliação

| Migration        | Git | Aplicada (hipótese) | Correta | Problema                                  |
| ---------------- | :-: | :-----------------: | :-----: | ----------------------------------------- |
| Core             | ✅  |          ?          |   🟡    | CHECK constraint muito restritivo         |
| Identity         | ✅  |          ?          |   🟢    | —                                         |
| Companies        | ✅  |          ?          |   🟡    | Validar estrutura real                    |
| Candidates       | ✅  |          ?          |   🟠    | RLS usa `recruiter` sem CHECK             |
| Jobs             | ✅  |          ?          |   🟠    | RLS usa `recruiter` sem CHECK             |
| Applications     | ✅  |          ?          |   🟠    | RLS usa `recruiter` sem CHECK             |
| RBAC             | ✅  |          ?          |   🟠    | Seed inclui roles sem CHECK               |
| Storage          | ✅  |          ?          |   🟡    | RLS usa `recruiter` sem CHECK             |
| Events           | ✅  |          ?          |   🟢    | —                                         |
| Notifications    | ✅  |          ?          |   🟢    | —                                         |
| Talent Pool      | ✅  |          ?          |   🟡    | RLS usa `recruiter` sem CHECK             |
| Candidate filhas | ✅  |          ?          |   🟡    | Migration existe; validar se foi aplicada |

## 10. Consolidação e Limpeza de Migrations

### 10.1 Colisões de timestamp resolvidas

| Timestamp conflitante | Arquivos envolvidos                                                  | Resolução                                                            |
| --------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `20260824000000`      | `fix_is_tenant_member.sql` + `fix_rls_infrastructure_grants.sql`     | Renomeado para `20260824000002_fix_rls_infrastructure_grants.sql`    |
| `20260830000001`      | `auth_people_sync.sql` + `reconcile_applications.sql`                | Renomeado para `20260830000200_reconcile_applications.sql`           |
| `20260830000002`      | `reconcile_recruitment_demands.sql` + `candidate_bootstrap_role.sql` | Renomeado para `20260830000400_candidate_bootstrap_role.sql`         |
| `20260830000003`      | `candidate_bootstrap_role.sql` + `reconcile_job_matches.sql`         | Renomeado para `20260830000500_reconcile_job_matches.sql`            |
| `20260830000004`      | `reconcile_notifications.sql`                                        | Renomeado para `20260830000600_reconcile_notifications.sql`          |
| `20260830000005`      | `services_catalog.sql`                                               | Renomeado para `20260830000700_services_catalog.sql`                 |
| `20260830000006`      | `company_services_link.sql`                                          | Renomeado para `20260830000800_company_services_link.sql`            |
| `20260830000007`      | `service_orders_relationship.sql`                                    | Renomeado para `20260830000900_service_orders_relationship.sql`      |
| `20260830000008`      | `recruitment_demands_service_link.sql`                               | Renomeado para `20260830001000_recruitment_demands_service_link.sql` |
| `20260830000009`      | `storage_services_images.sql`                                        | Renomeado para `20260830001100_storage_services_images.sql`          |

### 10.2 Migrations mortas removidas

- `20260831000002_reconcile_companies_services.sql` — duplicata de propósito; consolidava services, storage e vínculos que já existem em migrations separadas, além de quebrar a ordenação (timestamp 20260831 ficava após migrations de 20260830 que dependem de `services`).
- `20260830000400_candidate_bootstrap_role.sql` — função `bootstrap_candidate_from_auth_user()` não é usada em nenhum trigger nem no frontend; já existe `bootstrap_candidate_identity` em `20260826000001_candidate_bootstrap.sql`.

### 10.3 Nova migration criada

- `20260829000001_services.sql` — cria a tabela `services` com schema canônico completo, RLS, políticas e trigger `updated_at`. Resolve o gap onde `20260830000700_services_catalog.sql` era executada sem a tabela existir.

### 10.4 Ajustes de segurança

- Removido `SET LOCAL row_security = off;` de `20260830000400_candidate_bootstrap_role.sql` antes de removê-la.
- Adicionado `DROP TRIGGER IF EXISTS ...` antes de cada `CREATE TRIGGER` em `20260830000100_auth_people_sync.sql` para permitir reexecução segura.
- Mantidas políticas de storage em `20260830001100_storage_services_images.sql` com verificação de `tenant_membership` ativa para escrita; leitura pública permanece apenas para bucket `services-images` conforme regra P1.1.

### 10.5 Estado final

- Nenhuma colisão de timestamp.
- Sem migrations duplicadas de propósito.
- Ordem de aplicação coerente: core → identity → companies → candidates → jobs → applications → rbac → storage → services → vínculos → storage images → company_social_links.
- `company_relationship_types` já possuía RLS/policies em `20260816000300_companies.sql`.
- `company_social_links` permanece idempotente com RLS e integridade tenant/company em `20260831000001_company_social_links.sql`.

## 11. Próximos Passos

1. Executar query no Supabase real:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
   ```
2. Executar query para verificar CHECK constraint:
   ```sql
   SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'tenant_memberships'::regclass;
   ```
3. Verificar se `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`, `candidate_documents` existem no banco real.
4. Verificar `auth.logins` ou logs do Supabase para identificar quem executou os DELETEs em 25/08 às 16:23.
5. Após confirmação, corrigir CHECK constraint antes de qualquer rebuild.
6. Aplicar migrations na ordem canônica consolidada e validar RLS/policies de `company_relationship_types` e `company_social_links` conforme regras P0.
