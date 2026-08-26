# SEED-SCHEMA-AUDIT.md

**Data:** 2026-08-25
**Escopo:** Auditoria linha a linha dos seeds de homologação contra o schema real do Supabase.
**Método:** Somente leitura via `information_schema` + revisão estática dos arquivos TypeScript.
**Regra:** Não alterar banco, não corrigir seeds, não inferir colunas inexistentes.

---

## 1. ARQUIVOS AUDITADOS

| Arquivo                                 | Existe            | Tipo                                               |
| --------------------------------------- | ----------------- | -------------------------------------------------- |
| `scripts/seed-homologation.ts`          | ✅                | Seed base de usuários/roles                        |
| `scripts/seed-homologation-business.ts` | ❌ **NÃO EXISTE** | Nenhum arquivo separado encontrado                 |
| `scripts/seed-homologation-full.ts`     | ✅                | Seed completo (usuários + domínio business + docs) |

**Observação:** O domínio business que seria do arquivo separado está embutido em `seed-homologation-full.ts` (`seedCompanies`, `seedCandidates`, `seedJobs`, `seedApplications`).

---

## 2. SCHEMA REAL CONFIRMADO

Fonte: consulta direta a `information_schema.columns` e `information_schema.table_constraints` no banco Supabase real.

### 2.1 Tabelas confirmadas e colunas reais

#### `tenants`

| Coluna       | Tipo        | Nullable | Default            | PK  | FK  |
| ------------ | ----------- | -------- | ------------------ | --- | --- |
| `id`         | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —   |
| `name`       | text        | NOT NULL | —                  | ❌  | —   |
| `slug`       | text        | NOT NULL | —                  | ❌  | —   |
| `status`     | text        | NOT NULL | 'active'::text     | ❌  | —   |
| `created_at` | timestamptz | NOT NULL | now()              | ❌  | —   |
| `updated_at` | timestamptz | NOT NULL | now()              | ❌  | —   |

**Colunas NÃO existentes no schema real:** `plan`, `settings`

#### `companies`

| Coluna       | Tipo        | Nullable | Default            | PK  | FK           |
| ------------ | ----------- | -------- | ------------------ | --- | ------------ |
| `id`         | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —            |
| `tenant_id`  | uuid        | NOT NULL | —                  | ❌  | `tenants.id` |
| `name`       | text        | NOT NULL | —                  | ❌  | —            |
| `legal_name` | text        | YES      | —                  | ❌  | —            |
| `document`   | text        | YES      | —                  | ❌  | —            |
| `status`     | text        | NOT NULL | 'active'::text     | ❌  | —            |
| `created_at` | timestamptz | NOT NULL | now()              | ❌  | —            |
| `updated_at` | timestamptz | NOT NULL | now()              | ❌  | —            |

**Colunas NÃO existentes no schema real:** `cnpj`, `industry`, `is_active`

#### `company_relationship_types`

| Coluna | Tipo | Nullable | Default | PK  | FK  |
| ------ | ---- | -------- | ------- | --- | --- |
| —      | —    | —        | —       | —   | —   |

**Status:** Tabela **NÃO ENCONTRADA** no `information_schema.tables`. Consulta separada confirmou `0 registros` e ausência no catálogo.

#### `company_relationships`

| Coluna              | Tipo        | Nullable | Default            | PK  | FK             |
| ------------------- | ----------- | -------- | ------------------ | --- | -------------- |
| `id`                | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —              |
| `company_id`        | uuid        | NOT NULL | —                  | ❌  | `companies.id` |
| `relationship_type` | text        | NOT NULL | —                  | ❌  | —              |
| `status`            | text        | NOT NULL | 'active'::text     | ❌  | —              |
| `start_date`        | date        | YES      | —                  | ❌  | —              |
| `end_date`          | date        | YES      | —                  | ❌  | —              |
| `metadata`          | jsonb       | NOT NULL | '{}'::jsonb        | ❌  | —              |
| `created_at`        | timestamptz | NOT NULL | now()              | ❌  | —              |
| `updated_at`        | timestamptz | NOT NULL | now()              | ❌  | —              |

**Colunas NÃO existentes no schema real:** `tenant_id`, `relationship_type_id`

#### `candidates`

| Coluna       | Tipo        | Nullable | Default            | PK  | FK           |
| ------------ | ----------- | -------- | ------------------ | --- | ------------ |
| `id`         | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —            |
| `person_id`  | uuid        | NOT NULL | —                  | ❌  | `people.id`  |
| `tenant_id`  | uuid        | NOT NULL | —                  | ❌  | `tenants.id` |
| `status`     | text        | NOT NULL | 'active'::text     | ❌  | —            |
| `created_at` | timestamptz | NOT NULL | now()              | ❌  | —            |
| `updated_at` | timestamptz | NOT NULL | now()              | ❌  | —            |

**Colunas NÃO existentes no schema real:** `headline`, `source`

**Relacionamento direto com `people`:** ✅ CONFIRMADO via FK `candidates.person_id → people.id`

#### `jobs`

| Coluna            | Tipo        | Nullable | Default            | PK  | FK             |
| ----------------- | ----------- | -------- | ------------------ | --- | -------------- |
| `id`              | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —              |
| `tenant_id`       | uuid        | NOT NULL | —                  | ❌  | `tenants.id`   |
| `company_id`      | uuid        | YES      | —                  | ❌  | `companies.id` |
| `title`           | text        | NOT NULL | —                  | ❌  | —              |
| `description`     | text        | YES      | —                  | ❌  | —              |
| `status`          | text        | NOT NULL | 'draft'::text      | ❌  | —              |
| `employment_type` | text        | YES      | —                  | ❌  | —              |
| `location`        | text        | YES      | —                  | ❌  | —              |
| `salary`          | text        | YES      | —                  | ❌  | —              |
| `benefits`        | text        | YES      | —                  | ❌  | —              |
| `requirements`    | text        | YES      | —                  | ❌  | —              |
| `published_at`    | timestamptz | YES      | —                  | ❌  | —              |
| `closed_at`       | timestamptz | YES      | —                  | ❌  | —              |
| `created_at`      | timestamptz | NOT NULL | now()              | ❌  | —              |
| `updated_at`      | timestamptz | NOT NULL | now()              | ❌  | —              |

**Colunas NÃO existentes no schema real:** `work_mode`, `slug`

**Relacionamento com `applications`:** ✅ CONFIRMADO via FK `jobs.id → applications.job_id`

#### `applications`

| Coluna         | Tipo        | Nullable | Default            | PK  | FK              |
| -------------- | ----------- | -------- | ------------------ | --- | --------------- |
| `id`           | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —               |
| `candidate_id` | uuid        | NOT NULL | —                  | ❌  | `candidates.id` |
| `job_id`       | uuid        | NOT NULL | —                  | ❌  | `jobs.id`       |
| `status`       | text        | NOT NULL | 'pending'::text    | ❌  | —               |
| `created_at`   | timestamptz | NOT NULL | now()              | ❌  | —               |
| `updated_at`   | timestamptz | NOT NULL | now()              | ❌  | —               |

**Colunas NÃO existentes no schema real:** `applied_at`, `current_stage`, `source`

**Relacionamento:** `applications.candidate_id → candidates.id` ✅ CONFIRMADO

#### `people`

| Coluna         | Tipo        | Nullable | Default            | PK  | FK              |
| -------------- | ----------- | -------- | ------------------ | --- | --------------- |
| `id`           | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —               |
| `auth_user_id` | uuid        | YES      | —                  | ❌  | `auth.users.id` |
| `full_name`    | text        | NOT NULL | —                  | ❌  | —               |
| `email`        | text        | NOT NULL | —                  | ❌  | —               |
| `phone`        | text        | YES      | —                  | ❌  | —               |
| `status`       | text        | NOT NULL | 'active'::text     | ❌  | —               |
| `created_at`   | timestamptz | NOT NULL | now()              | ❌  | —               |
| `updated_at`   | timestamptz | NOT NULL | now()              | ❌  | —               |

#### `tenant_memberships`

| Coluna       | Tipo        | Nullable | Default            | PK  | FK           |
| ------------ | ----------- | -------- | ------------------ | --- | ------------ |
| `id`         | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —            |
| `person_id`  | uuid        | NOT NULL | —                  | ❌  | `people.id`  |
| `tenant_id`  | uuid        | NOT NULL | —                  | ❌  | `tenants.id` |
| `status`     | text        | NOT NULL | 'active'::text     | ❌  | —            |
| `joined_at`  | timestamptz | NOT NULL | now()              | ❌  | —            |
| `created_at` | timestamptz | NOT NULL | now()              | ❌  | —            |
| `updated_at` | timestamptz | NOT NULL | now()              | ❌  | —            |

**Coluna NÃO existente no schema real:** `role_id`

#### `roles`

| Coluna        | Tipo        | Nullable | Default            | PK  | FK  |
| ------------- | ----------- | -------- | ------------------ | --- | --- |
| `id`          | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —   |
| `name`        | text        | NOT NULL | —                  | ❌  | —   |
| `description` | text        | YES      | —                  | ❌  | —   |
| `scope`       | text        | NOT NULL | 'tenant'::text     | ❌  | —   |
| `created_at`  | timestamptz | NOT NULL | now()              | ❌  | —   |
| `updated_at`  | timestamptz | NOT NULL | now()              | ❌  | —   |

#### `role_assignments`

| Coluna        | Tipo        | Nullable | Default            | PK  | FK           |
| ------------- | ----------- | -------- | ------------------ | --- | ------------ |
| `id`          | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —            |
| `person_id`   | uuid        | NOT NULL | —                  | ❌  | `people.id`  |
| `role_id`     | uuid        | NOT NULL | —                  | ❌  | `roles.id`   |
| `tenant_id`   | uuid        | YES      | —                  | ❌  | `tenants.id` |
| `assigned_at` | timestamptz | NOT NULL | now()              | ❌  | —            |
| `created_at`  | timestamptz | NOT NULL | now()              | ❌  | —            |

#### `role_permissions`

| Coluna          | Tipo        | Nullable | Default            | PK  | FK               |
| --------------- | ----------- | -------- | ------------------ | --- | ---------------- |
| `id`            | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —                |
| `role_id`       | uuid        | NOT NULL | —                  | ❌  | `roles.id`       |
| `permission_id` | uuid        | NOT NULL | —                  | ❌  | `permissions.id` |
| `created_at`    | timestamptz | NOT NULL | now()              | ❌  | —                |

#### `permissions`

| Coluna        | Tipo        | Nullable | Default            | PK  | FK  |
| ------------- | ----------- | -------- | ------------------ | --- | --- |
| `id`          | uuid        | NOT NULL | uuid_generate_v4() | ✅  | —   |
| `resource`    | text        | NOT NULL | —                  | ❌  | —   |
| `action`      | text        | NOT NULL | —                  | ❌  | —   |
| `description` | text        | YES      | —                  | ❌  | —   |
| `created_at`  | timestamptz | NOT NULL | now()              | ❌  | —   |

#### `first_login_state`

| Coluna                  | Tipo        | Nullable | Default | PK  | FK          |
| ----------------------- | ----------- | -------- | ------- | --- | ----------- |
| `person_id`             | uuid        | NOT NULL | —       | ✅  | `people.id` |
| `must_change_password`  | boolean     | NOT NULL | true    | ❌  | —           |
| `terms_version`         | text        | YES      | —       | ❌  | —           |
| `privacy_version`       | text        | YES      | —       | ❌  | —           |
| `lgpd_consent_version`  | text        | YES      | —       | ❌  | —           |
| `first_login_completed` | boolean     | NOT NULL | false   | ❌  | —           |
| `created_at`            | timestamptz | NOT NULL | now()   | ❌  | —           |
| `updated_at`            | timestamptz | NOT NULL | now()   | ❌  | —           |

---

## 3. MATRIZ DE AUDITORIA POR DEPENDÊNCIA

### 3.1 `seed-homologation.ts`

| Operação      | Tabela               | Coluna(s) utilizada(s)                                                        | Status     | Tipo real                       | Nullable        | Default    | FK confirmada?                        | Evidência            | Risco |
| ------------- | -------------------- | ----------------------------------------------------------------------------- | ---------- | ------------------------------- | --------------- | ---------- | ------------------------------------- | -------------------- | ----- |
| INSERT/UPDATE | `tenants`            | `id`, `name`, `slug`, `plan`, `status`, `settings`                            | ⚠️ PARCIAL | `plan` e `settings` não existem | —               | —          | —                                     | `information_schema` | Médio |
| SELECT        | `tenants`            | `id`                                                                          | ✅ VALID   | uuid                            | NOT NULL        | —          | —                                     | `information_schema` | Baixo |
| INSERT        | `roles`              | `name`, `scope`, `description`                                                | ✅ VALID   | text                            | conforme schema | —          | —                                     | `information_schema` | Baixo |
| SELECT        | `roles`              | `id`, `name`, `scope`                                                         | ✅ VALID   | —                               | —               | —          | —                                     | `information_schema` | Baixo |
| INSERT/UPDATE | `people`             | `auth_user_id`, `email`, `full_name`, `status`                                | ✅ VALID   | text/uuid                       | conforme schema | —          | `auth.users.id`                       | `information_schema` | Baixo |
| SELECT        | `people`             | `id`, `email`                                                                 | ✅ VALID   | —                               | —               | —          | —                                     | `information_schema` | Baixo |
| INSERT/UPDATE | `tenant_memberships` | `person_id`, `tenant_id`, `status`                                            | ✅ VALID   | uuid/text                       | NOT NULL        | 'active'   | `people.id`, `tenants.id`             | `information_schema` | Baixo |
| SELECT        | `tenant_memberships` | `id`, `person_id`, `tenant_id`                                                | ✅ VALID   | —                               | —               | —          | —                                     | `information_schema` | Baixo |
| INSERT        | `role_assignments`   | `person_id`, `role_id`, `tenant_id`                                           | ✅ VALID   | uuid                            | NOT NULL / YES  | —          | `people.id`, `roles.id`, `tenants.id` | `information_schema` | Baixo |
| SELECT        | `role_assignments`   | `id`, `person_id`, `role_id`, `tenant_id`                                     | ✅ VALID   | —                               | —               | —          | —                                     | `information_schema` | Baixo |
| INSERT/UPDATE | `first_login_state`  | `person_id`, `must_change_password`, `first_login_completed`, `terms_version` | ✅ VALID   | boolean/text                    | conforme schema | true/false | `people.id`                           | `information_schema` | Baixo |
| SELECT        | `first_login_state`  | `person_id`                                                                   | ✅ VALID   | —                               | —               | —          | —                                     | `information_schema` | Baixo |
| AUTH          | `auth.users`         | `createUser`, `listUsers`, `updateUserById`                                   | ✅ VALID   | Supabase Auth managed           | —               | —          | —                                     | API Supabase         | Baixo |

**RBAC VIOLATION?** Nenhuma. O seed respeita a arquitetura `auth.users → people → tenant_memberships → role_assignments → roles`.

**Risco principal:** Tenta inserir `plan` e `settings` em `tenants`, que não existem no schema real. Isso causará erro PostgreSQL no INSERT do tenant.

### 3.2 `seed-homologation-full.ts` (domínio business)

| Operação | Tabela                       | Coluna(s) utilizada(s)                                                                                                                           | Status         | Tipo real                 | Nullable        | Default   | FK confirmada?               | Evidência            | Risco    |
| -------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------------------------- | --------------- | --------- | ---------------------------- | -------------------- | -------- |
| INSERT   | `companies`                  | `tenant_id`, `name`, `status`                                                                                                                    | ✅ VALID       | uuid/text                 | conforme schema | 'active'  | `tenants.id`                 | `information_schema` | Baixo    |
| SELECT   | `companies`                  | `id`, `name`                                                                                                                                     | ✅ VALID       | —                         | —               | —         | —                            | `information_schema` | Baixo    |
| SELECT   | `company_relationship_types` | `id`, `code`                                                                                                                                     | ❌ **MISSING** | —                         | —               | —         | —                            | `information_schema` | **Alto** |
| INSERT   | `company_relationships`      | `company_id`, `tenant_id`, `relationship_type_id`, `status`                                                                                      | ❌ **MISSING** | —                         | —               | —         | —                            | `information_schema` | **Alto** |
| INSERT   | `candidates`                 | `person_id`, `tenant_id`, `status`                                                                                                               | ✅ VALID       | uuid/text                 | NOT NULL        | 'active'  | `people.id`, `tenants.id`    | `information_schema` | Baixo    |
| SELECT   | `candidates`                 | `id`, `person_id`, `tenant_id`                                                                                                                   | ✅ VALID       | —                         | —               | —         | —                            | `information_schema` | Baixo    |
| INSERT   | `jobs`                       | `tenant_id`, `company_id`, `title`, `description`, `status`, `employment_type`, `location`, `salary`, `benefits`, `requirements`, `published_at` | ⚠️ PARCIAL     | Falta `work_mode`, `slug` | —               | —         | `companies.id`, `tenants.id` | `information_schema` | Médio    |
| SELECT   | `jobs`                       | `id`, `tenant_id`                                                                                                                                | ✅ VALID       | —                         | —               | —         | —                            | `information_schema` | Baixo    |
| INSERT   | `applications`               | `candidate_id`, `job_id`, `status`                                                                                                               | ✅ VALID       | uuid/text                 | NOT NULL        | 'pending' | `candidates.id`, `jobs.id`   | `information_schema` | Baixo    |
| SELECT   | `applications`               | `id`, `candidate_id`, `job_id`                                                                                                                   | ✅ VALID       | —                         | —               | —         | —                            | `information_schema` | Baixo    |

**RBAC VIOLATION?** Nenhuma. As inserções respeitam as FKs confirmadas.

**Riscos principais:**

1. `company_relationship_types` não existe → INSERT em `company_relationships` usando `relationship_type_id` vai falhar.
2. `company_relationships` não tem `tenant_id` nem `relationship_type_id` no schema real → INSERT falhará.
3. `jobs.work_mode` e `jobs.slug` não existem → INSERT falhará.

### 3.3 Colunas utilizadas nos seeds e status real

| Coluna usada pelo seed       | Tabela real          | Status       | Tipo real   | Nullable | Observação                                 |
| ---------------------------- | -------------------- | ------------ | ----------- | -------- | ------------------------------------------ |
| `tenants.plan`               | `tenants`            | ❌ MISSING   | —           | —        | Seed falhará no INSERT                     |
| `tenants.settings`           | `tenants`            | ❌ MISSING   | —           | —        | Seed falhará no INSERT                     |
| `companies.legal_name`       | `companies`          | ✅ CONFIRMED | text        | YES      | Existe, mas seed não usa (usa `name`)      |
| `companies.cnpj`             | `companies`          | ❌ MISSING   | —           | —        | NÃO existe                                 |
| `companies.industry`         | `companies`          | ❌ MISSING   | —           | —        | NÃO existe                                 |
| `companies.is_active`        | `companies`          | ❌ MISSING   | —           | —        | NÃO existe (usa `status`)                  |
| `jobs.work_mode`             | `jobs`               | ❌ MISSING   | —           | —        | NÃO existe                                 |
| `jobs.slug`                  | `jobs`               | ❌ MISSING   | —           | —        | NÃO existe                                 |
| `jobs.published_at`          | `jobs`               | ✅ CONFIRMED | timestamptz | YES      | Existe                                     |
| `candidates.person_id`       | `candidates`         | ✅ CONFIRMED | uuid        | NOT NULL | FK `people.id` confirmada                  |
| `candidates.headline`        | `candidates`         | ❌ MISSING   | —           | —        | NÃO existe                                 |
| `candidates.source`          | `candidates`         | ❌ MISSING   | —           | —        | NÃO existe                                 |
| `applications.candidate_id`  | `applications`       | ✅ CONFIRMED | uuid        | NOT NULL | FK `candidates.id` confirmada              |
| `applications.job_id`        | `applications`       | ✅ CONFIRMED | uuid        | NOT NULL | FK `jobs.id` confirmada                    |
| `applications.source`        | `applications`       | ❌ MISSING   | —           | —        | NÃO existe                                 |
| `applications.current_stage` | `applications`       | ❌ MISSING   | —           | —        | NÃO existe                                 |
| `applications.applied_at`    | `applications`       | ❌ MISSING   | —           | —        | NÃO existe                                 |
| `tenant_memberships.role_id` | `tenant_memberships` | ❌ MISSING   | —           | —        | NÃO existe (role é via `role_assignments`) |

### 3.4 Foreign keys utilizadas pelos seeds

| Origem                             | Coluna | Destino          | Coluna destino | Status    | Observação |
| ---------------------------------- | ------ | ---------------- | -------------- | --------- | ---------- |
| `tenant_memberships.person_id`     | →      | `people.id`      | ✅ CONFIRMED   | FK existe |
| `tenant_memberships.tenant_id`     | →      | `tenants.id`     | ✅ CONFIRMED   | FK existe |
| `role_assignments.person_id`       | →      | `people.id`      | ✅ CONFIRMED   | FK existe |
| `role_assignments.role_id`         | →      | `roles.id`       | ✅ CONFIRMED   | FK existe |
| `role_assignments.tenant_id`       | →      | `tenants.id`     | ✅ CONFIRMED   | FK existe |
| `role_permissions.role_id`         | →      | `roles.id`       | ✅ CONFIRMED   | FK existe |
| `role_permissions.permission_id`   | →      | `permissions.id` | ✅ CONFIRMED   | FK existe |
| `companies.tenant_id`              | →      | `tenants.id`     | ✅ CONFIRMED   | FK existe |
| `company_relationships.company_id` | →      | `companies.id`   | ✅ CONFIRMED   | FK existe |
| `candidates.person_id`             | →      | `people.id`      | ✅ CONFIRMED   | FK existe |
| `candidates.tenant_id`             | →      | `tenants.id`     | ✅ CONFIRMED   | FK existe |
| `jobs.company_id`                  | →      | `companies.id`   | ✅ CONFIRMED   | FK existe |
| `jobs.tenant_id`                   | →      | `tenants.id`     | ✅ CONFIRMED   | FK existe |
| `applications.candidate_id`        | →      | `candidates.id`  | ✅ CONFIRMED   | FK existe |
| `applications.job_id`              | →      | `jobs.id`        | ✅ CONFIRMED   | FK existe |
| `first_login_state.person_id`      | →      | `people.id`      | ✅ CONFIRMED   | FK existe |

### 3.5 Enums e status strings

| Valor usado pelo seed | Tabela               | Coluna            | Tipo real | Status                    |
| --------------------- | -------------------- | ----------------- | --------- | ------------------------- |
| `'enterprise'`        | `tenants`            | `plan`            | —         | ❌ COLUNA NÃO EXISTE      |
| `'active'`            | `tenants`            | `status`          | text      | ✅ string livre           |
| `'active'`            | `companies`          | `status`          | text      | ✅ string livre           |
| `'active'`            | `people`             | `status`          | text      | ✅ string livre           |
| `'active'`            | `tenant_memberships` | `status`          | text      | ✅ string livre           |
| `'active'`            | `candidates`         | `status`          | text      | ✅ string livre           |
| `'published'`         | `jobs`               | `status`          | text      | ✅ string livre           |
| `'draft'`             | `jobs`               | `status`          | text      | ✅ string livre (default) |
| `'clt'`               | `jobs`               | `employment_type` | text      | ✅ string livre           |
| `'pending'`           | `applications`       | `status`          | text      | ✅ string livre           |

**Nenhum enum do PostgreSQL foi encontrado** no banco para esses valores. Todos são armazenados como `text` com defaults hardcoded como `'active'::text`.

---

## 4. VIOLAÇÕES RBAC

Nenhuma violação de arquitetura RBAC foi encontrada nos seeds. A ordem de dependência está correta:

```
auth.users
    ↓
people
    ↓
tenant_memberships
    ↓
role_assignments
    ↓
roles
    ↓
permissions
```

Nenhum seed utiliza:

- `tenant_memberships.role_id`
- `profiles.role`
- `user_profiles.role`
- `actor_person_id` como autorização
- bypass de RBAC via código

---

## 5. CONSOLIDATED SEED STATUS

| Seed                            | Confirmadas | Não confirmadas | Inexistentes | RBAC violations | Pode executar? |
| ------------------------------- | ----------: | --------------: | -----------: | --------------: | -------------- |
| `seed-homologation.ts`          |          13 |               0 |            2 |               0 | **NÃO**        |
| `seed-homologation-business.ts` |           — |               — |            — |               — | **NÃO EXISTE** |
| `seed-homologation-full.ts`     |          18 |               0 |            5 |               0 | **NÃO**        |

### Motivos do bloqueio

#### `seed-homologation.ts`

- INSERT em `tenants` usa colunas `plan` e `settings` que **não existem** no schema real.
- Resultado: erro PostgreSQL ao criar tenant.

#### `seed-homologation-full.ts`

- SELECT em `company_relationship_types` usa colunas `id` e `code` de tabela **inexistente**.
- INSERT em `company_relationships` usa colunas `tenant_id` e `relationship_type_id` que **não existem** no schema real da tabela.
- INSERT em `jobs` usa colunas `work_mode` e `slug` que **não existem** no schema real.
- INSERT em `tenants` usa colunas `plan` e `settings` que **não existem** no schema real.
- Resultado: erro PostgreSQL em múltiplos pontos.

---

## 6. GAPS IDENTIFICADOS

### 6.1 Gaps de schema (banco vs seed)

| Seed                | Tabela                       | Coluna esperada        | Status real | Ação necessária                 |
| ------------------- | ---------------------------- | ---------------------- | ----------- | ------------------------------- |
| homologation / full | `tenants`                    | `plan`                 | MISSING     | Criar coluna OU remover do seed |
| homologation / full | `tenants`                    | `settings`             | MISSING     | Criar coluna OU remover do seed |
| full                | `company_relationship_types` | toda tabela            | MISSING     | Criar tabela OU remover do seed |
| full                | `company_relationships`      | `tenant_id`            | MISSING     | Criar coluna OU remover do seed |
| full                | `company_relationships`      | `relationship_type_id` | MISSING     | Criar coluna OU remover do seed |
| full                | `jobs`                       | `work_mode`            | MISSING     | Criar coluna OU remover do seed |
| full                | `jobs`                       | `slug`                 | MISSING     | Criar coluna OU remover do seed |

### 6.2 Gaps de schema (banco vs documentação anterior)

| Documento                           | Tabela      | Coluna afirmada                            | Status real  | Observação                                              |
| ----------------------------------- | ----------- | ------------------------------------------ | ------------ | ------------------------------------------------------- |
| `SUPABASE-REAL-SCHEMA-INVENTORY.md` | `companies` | `legal_name` listada como "sem dados"      | ✅ CONFIRMED | Coluna existe, tabela estava vazia na inspeção anterior |
| `SUPABASE-REAL-SCHEMA-INVENTORY.md` | `companies` | `cnpj`, `industry`, `is_active` implícitas | ❌ MISSING   | Essas colunas não existem no schema real                |
| `PORTAL-PAGES-MATRIX.md`            | `jobs`      | `slug` em rotas                            | ❌ MISSING   | Rota `/dashboard/vagas/:slug` não tem coluna suporte    |
| `PORTAL-NAVIGATION-MATRIX.md`       | `jobs`      | `slug`                                     | ❌ MISSING   | Mesmo gap acima                                         |

### 6.3 Gaps funcionais

| Item                                      | Status | Observação                                                                                              |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `company_relationship_types`              | GAP    | Tabela inexistente. Seed depende dela para relacionamentos.                                             |
| `company_relationships.relationship_type` | GAP    | Seed espera FK para `company_relationship_types.id`, mas seed usa `relationship_type` como texto livre. |

---

## 7. ESTRUTURA ESPERADA vs REAL

### 7.1 Modelo esperado pelo seed

```
tenants
  ├── id, name, slug, plan, status, settings

companies
  ├── id, tenant_id, name, legal_name, cnpj, industry, is_active, status

company_relationship_types
  ├── id, code, name

company_relationships
  ├── id, company_id, tenant_id, relationship_type_id, status

jobs
  ├── id, tenant_id, company_id, title, slug, description, status, employment_type, work_mode, location, salary, benefits, requirements, published_at

applications
  ├── id, candidate_id, job_id, source, current_stage, applied_at, status
```

### 7.2 Modelo real no Supabase

```
tenants
  ├── id, name, slug, status

companies
  ├── id, tenant_id, name, legal_name, document, status

company_relationships
  ├── id, company_id, relationship_type (text livre), status, start_date, end_date, metadata

jobs
  ├── id, tenant_id, company_id, title, description, status, employment_type, location, salary, benefits, requirements, published_at, closed_at

applications
  ├── id, candidate_id, job_id, status
```

---

## 8. CONCLUSÃO DA AUDITORIA

**Nenhum dos três seeds está alinhado com o schema real.**

Os seeds **não podem ser executados** contra o Supabase real sem correção prévia, pois contêm referências a colunas e tabelas que não existem.

### Principais bloqueadores

1. **`tenants.plan` e `tenants.settings`** — colunas inexistentes.
2. **`company_relationship_types`** — tabela inexistente.
3. **`company_relationships.tenant_id` e `relationship_type_id`** — colunas inexistentes.
4. **`jobs.work_mode` e `jobs.slug`** — colunas inexistentes.

### Nenhuma violação de arquitetura RBAC

Os seeds respeitam a hierarquia `auth → people → membership → role_assignments → roles → permissions`. O problema é exclusivamente de divergência de schema.

### Nenhuma inferência deve ser feita agora

Não trocar `legal_name` por `name`.
Não remover `person_id` de `candidates`.
Não criar tabelas `company_relationship_types` sem decisão explícita.
Não criar colunas `plan`, `settings`, `work_mode`, `slug` sem decisão explícita.

---

## 9. PRÓXIMO PASCO OBRIGATÓRIO

Antes de qualquer correção, o time deve decidir:

1. O seed está errado ou o schema está errado?
2. `tenants.plan` e `tenants.settings` devem existir?
3. `company_relationship_types` deve ser criada?
4. `jobs.work_mode` e `jobs.slug` devem ser adicionados?
5. `company_relationships` deve usar `relationship_type` (texto livre) ou voltar a ter FK para `company_relationship_types`?

Somente após essas decisões, o seed pode ser corrigido.
