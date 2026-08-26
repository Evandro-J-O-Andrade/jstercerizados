# Supabase Real Schema Inventory

**Data:** 2026-08-25  
**Escopo:** Schema real do Supabase utilizado pelo Portal  
**Método:** Somente leitura via cliente Supabase  
**Atenção:** Nenhum dado alterado, nenhuma migration criada, nenhum seed executado.

---

## Tabelas confirmadas

| Tabela                | Status    | Observação      |
| --------------------- | --------- | --------------- |
| `people`              | ✅ existe | 9 registros     |
| `tenants`             | ✅ existe | 3 registros     |
| `tenant_memberships`  | ✅ existe | 8 registros     |
| `roles`               | ✅ existe | 18 registros    |
| `role_assignments`    | ✅ existe | presente        |
| `role_permissions`    | ✅ existe | 668 vínculos    |
| `permissions`         | ✅ existe | 1479 permissões |
| `first_login_state`   | ✅ existe | presente        |
| `legal_acceptances`   | ✅ existe | sem dados       |
| `companies`           | ✅ existe | sem dados       |
| `products`            | ✅ existe | 1 registro      |
| `stock_movements`     | ✅ existe | sem dados       |
| `purchase_orders`     | ✅ existe | sem dados       |
| `purchase_receipts`   | ✅ existe | sem dados       |
| `service_orders`      | ✅ existe | sem dados       |
| `contracts`           | ✅ existe | sem dados       |
| `tasks`               | ✅ existe | sem dados       |
| `support_tickets`     | ✅ existe | sem dados       |
| `notifications`       | ✅ existe | sem dados       |
| `files`               | ✅ existe | sem dados       |
| `audit_logs`          | ✅ existe | 1 registro      |
| `security_events`     | ✅ existe | sem dados       |
| `jobs`                | ✅ existe | 1 registro      |
| `candidates`          | ✅ existe | sem dados       |
| `applications`        | ✅ existe | sem dados       |
| `recruitment_demands` | ✅ existe | sem dados       |
| `domain_events`       | ✅ existe | 1 registro      |
| `sessions`            | ✅ existe | sem dados       |

## Tabelas não encontradas

| Tabela         | Status        | Observação                                           |
| -------------- | ------------- | ---------------------------------------------------- |
| `chat`         | ❌ não existe | permission existe no banco, mas tabela não           |
| `documents`    | ❌ não existe | permission existe no banco, mas tabela não           |
| `lgpd`         | ❌ não existe | permission existe no banco, mas tabela não           |
| `reports`      | ❌ não existe | permission existe no banco, mas tabela não           |
| `talent_pool`  | ❌ não existe | permission existe no banco, mas tabela não           |
| `ai`           | ❌ não existe | permission existe no banco, mas tabela não           |
| `automations`  | ❌ não existe | permission existe no banco, mas tabela não           |
| `billing`      | ❌ não existe | permission existe no banco, mas tabela não           |
| `integrations` | ❌ não existe | permission existe no banco, mas tabela não           |
| `finance`      | ❌ não existe | permission existe no banco, mas tabela não           |
| `fiscal`       | ❌ não existe | permission existe no banco, mas tabela não           |
| `accounting`   | ❌ não existe | permission existe no banco, mas tabela não           |
| `tenant`       | ❌ não existe | usar `tenants`                                       |
| `users`        | ❌ não existe | usar `auth.users` do Supabase Auth                   |
| `profiles`     | ❌ não existe | usar `people`                                        |
| `auth.users`   | ❌ não existe | tabela do Supabase Auth, não acessível via PostgREST |

---

## Schema por tabela

### `people`

| Coluna         | Tipo        | Nullable | Default  | PK  | FK              | Tenant-scoped | RLS | Dependências |
| -------------- | ----------- | -------- | -------- | --- | --------------- | ------------- | --- | ------------ |
| `id`           | uuid        | NOT NULL | —        | ✅  | —               | ❌            | —   | —            |
| `auth_user_id` | uuid        | NULL     | —        | ❌  | `auth.users.id` | ❌            | —   | —            |
| `full_name`    | text        | NULL     | —        | ❌  | —               | ❌            | —   | —            |
| `email`        | text        | NULL     | —        | ❌  | —               | ❌            | —   | —            |
| `phone`        | text        | NULL     | —        | ❌  | —               | ❌            | —   | —            |
| `status`       | text        | NULL     | `active` | ❌  | —               | ❌            | —   | —            |
| `created_at`   | timestamptz | NULL     | `now()`  | ❌  | —               | ❌            | —   | —            |
| `updated_at`   | timestamptz | NULL     | `now()`  | ❌  | —               | ❌            | —   | —            |

**Observação:** Tabela global. Representa pessoas/usuários do sistema.

---

### `tenants`

| Coluna       | Tipo        | Nullable | Default  | PK  | FK  | Tenant-scoped | RLS | Dependências |
| ------------ | ----------- | -------- | -------- | --- | --- | ------------- | --- | ------------ |
| `id`         | uuid        | NOT NULL | —        | ✅  | —   | ❌            | —   | —            |
| `name`       | text        | NULL     | —        | ❌  | —   | ❌            | —   | —            |
| `slug`       | text        | NULL     | —        | ❌  | —   | ❌            | —   | —            |
| `status`     | text        | NULL     | `active` | ❌  | —   | ❌            | —   | —            |
| `created_at` | timestamptz | NULL     | `now()`  | ❌  | —   | ❌            | —   | —            |
| `updated_at` | timestamptz | NULL     | `now()`  | ❌  | —   | ❌            | —   | —            |

**Observação:** Tabela global. Representa empresas/tenants da plataforma.

---

### `tenant_memberships`

| Coluna       | Tipo        | Nullable | Default  | PK  | FK           | Tenant-scoped | RLS | Dependências |
| ------------ | ----------- | -------- | -------- | --- | ------------ | ------------- | --- | ------------ |
| `id`         | uuid        | NOT NULL | —        | ✅  | —            | ❌            | —   | —            |
| `person_id`  | uuid        | NULL     | —        | ❌  | `people.id`  | ❌            | —   | `people`     |
| `tenant_id`  | uuid        | NULL     | —        | ❌  | `tenants.id` | ❌            | —   | `tenants`    |
| `status`     | text        | NULL     | `active` | ❌  | —            | ❌            | —   | —            |
| `joined_at`  | timestamptz | NULL     | `now()`  | ❌  | —            | ❌            | —   | —            |
| `created_at` | timestamptz | NULL     | `now()`  | ❌  | —            | ❌            | —   | —            |
| `updated_at` | timestamptz | NULL     | `now()`  | ❌  | —            | ❌            | —   | —            |

**Observação:** Tabela global. Relaciona pessoas a tenants. `role_id` não está presente na tabela; role é definida via `role_assignments`.

---

### `roles`

| Coluna        | Tipo        | Nullable | Default | PK  | FK  | Tenant-scoped | RLS | Dependências |
| ------------- | ----------- | -------- | ------- | --- | --- | ------------- | --- | ------------ |
| `id`          | uuid        | NOT NULL | —       | ✅  | —   | ❌            | —   | —            |
| `name`        | text        | NULL     | —       | ❌  | —   | ❌            | —   | —            |
| `description` | text        | NULL     | —       | ❌  | —   | ❌            | —   | —            |
| `scope`       | text        | NULL     | —       | ❌  | —   | ❌            | —   | —            |
| `created_at`  | timestamptz | NULL     | `now()` | ❌  | —   | ❌            | —   | —            |
| `updated_at`  | timestamptz | NULL     | `now()` | ❌  | —   | ❌            | —   | —            |

**Observação:** Tabela global. Scope pode ser `global` ou `tenant`.

---

### `role_assignments`

| Coluna        | Tipo        | Nullable | Default | PK  | FK           | Tenant-scoped | RLS | Dependências |
| ------------- | ----------- | -------- | ------- | --- | ------------ | ------------- | --- | ------------ |
| `id`          | uuid        | NOT NULL | —       | ✅  | —            | ❌            | —   | —            |
| `person_id`   | uuid        | NULL     | —       | ❌  | `people.id`  | ❌            | —   | `people`     |
| `role_id`     | uuid        | NULL     | —       | ❌  | `roles.id`   | ❌            | —   | `roles`      |
| `tenant_id`   | uuid        | NULL     | —       | ❌  | `tenants.id` | ❌            | —   | `tenants`    |
| `assigned_at` | timestamptz | NULL     | `now()` | ❌  | —            | ❌            | —   | —            |
| `created_at`  | timestamptz | NULL     | `now()` | ❌  | —            | ❌            | —   | —            |

**Observação:** Tabela global. Define qual role uma pessoa possui em qual tenant.

---

### `role_permissions`

| Coluna          | Tipo        | Nullable | Default | PK  | FK               | Tenant-scoped | RLS | Dependências  |
| --------------- | ----------- | -------- | ------- | --- | ---------------- | ------------- | --- | ------------- |
| `id`            | uuid        | NOT NULL | —       | ✅  | —                | ❌            | —   | —             |
| `role_id`       | uuid        | NULL     | —       | ❌  | `roles.id`       | ❌            | —   | `roles`       |
| `permission_id` | uuid        | NULL     | —       | ❌  | `permissions.id` | ❌            | —   | `permissions` |
| `created_at`    | timestamptz | NULL     | `now()` | ❌  | —                | ❌            | —   | —             |

**Observação:** Tabela global. Vínculo many-to-many entre roles e permissions.

---

### `permissions`

| Coluna        | Tipo        | Nullable | Default | PK  | FK  | Tenant-scoped | RLS | Dependências |
| ------------- | ----------- | -------- | ------- | --- | --- | ------------- | --- | ------------ |
| `id`          | uuid        | NOT NULL | —       | ✅  | —   | ❌            | —   | —            |
| `resource`    | text        | NULL     | —       | ❌  | —   | ❌            | —   | —            |
| `action`      | text        | NULL     | —       | ❌  | —   | ❌            | —   | —            |
| `description` | text        | NULL     | —       | ❌  | —   | ❌            | —   | —            |
| `created_at`  | timestamptz | NULL     | `now()` | ❌  | —   | ❌            | —   | —            |

**Observação:** Tabela global. Representa ações permitidas sobre recursos. Formato canônico: `resource.action`.

---

### `first_login_state`

| Coluna                  | Tipo        | Nullable | Default | PK  | FK          | Tenant-scoped | RLS | Dependências |
| ----------------------- | ----------- | -------- | ------- | --- | ----------- | ------------- | --- | ------------ |
| `person_id`             | uuid        | NOT NULL | —       | ✅  | `people.id` | ❌            | —   | `people`     |
| `must_change_password`  | boolean     | NULL     | `false` | ❌  | —           | ❌            | —   | —            |
| `terms_version`         | text        | NULL     | —       | ❌  | —           | ❌            | —   | —            |
| `privacy_version`       | text        | NULL     | —       | ❌  | —           | ❌            | —   | —            |
| `lgpd_consent_version`  | text        | NULL     | —       | ❌  | —           | ❌            | —   | —            |
| `first_login_completed` | boolean     | NULL     | `false` | ❌  | —           | ❌            | —   | —            |
| `created_at`            | timestamptz | NULL     | `now()` | ❌  | —           | ❌            | —   | —            |
| `updated_at`            | timestamptz | NULL     | `now()` | ❌  | —           | ❌            | —   | —            |

**Observação:** Tabela global. Controla estado de primeiro acesso por pessoa.

---

### `legal_acceptances`

| Coluna             | Tipo        | Nullable | Default | PK  | FK           | Tenant-scoped | RLS | Dependências |
| ------------------ | ----------- | -------- | ------- | --- | ------------ | ------------- | --- | ------------ |
| `id`               | uuid        | NOT NULL | —       | ✅  | —            | ❌            | —   | —            |
| `person_id`        | uuid        | NULL     | —       | ❌  | `people.id`  | ❌            | —   | `people`     |
| `tenant_id`        | uuid        | NULL     | —       | ❌  | `tenants.id` | ❌            | —   | `tenants`    |
| `document_type`    | text        | NULL     | —       | ❌  | —            | ❌            | —   | —            |
| `document_version` | text        | NULL     | —       | ❌  | —            | ❌            | —   | —            |
| `accepted_at`      | timestamptz | NULL     | `now()` | ❌  | —            | ❌            | —   | —            |
| `metadata`         | jsonb       | NULL     | —       | ❌  | —            | ❌            | —   | —            |

**Observação:** Tabela global. Registra aceites legais por pessoa/tenant.

---

### `products`

| Coluna       | Tipo        | Nullable | Default  | PK  | FK           | Tenant-scoped | RLS | Dependências |
| ------------ | ----------- | -------- | -------- | --- | ------------ | ------------- | --- | ------------ |
| `id`         | uuid        | NOT NULL | —        | ✅  | —            | ✅            | —   | —            |
| `tenant_id`  | uuid        | NULL     | —        | ❌  | `tenants.id` | ✅            | —   | `tenants`    |
| `name`       | text        | NULL     | —        | ❌  | —            | ✅            | —   | —            |
| `unit`       | text        | NULL     | —        | ❌  | —            | ✅            | —   | —            |
| `category`   | text        | NULL     | —        | ❌  | —            | ✅            | —   | —            |
| `status`     | text        | NULL     | `active` | ❌  | —            | ✅            | —   | —            |
| `created_at` | timestamptz | NULL     | `now()`  | ❌  | —            | ✅            | —   | —            |
| `updated_at` | timestamptz | NULL     | `now()`  | ❌  | —            | ✅            | —   | —            |

**Observação:** Tabela tenant-scoped. Pertence a um tenant.

---

### `jobs`

| Coluna            | Tipo        | Nullable | Default | PK  | FK             | Tenant-scoped | RLS | Dependências |
| ----------------- | ----------- | -------- | ------- | --- | -------------- | ------------- | --- | ------------ |
| `id`              | uuid        | NOT NULL | —       | ✅  | —              | ✅            | —   | —            |
| `tenant_id`       | uuid        | NULL     | —       | ❌  | `tenants.id`   | ✅            | —   | `tenants`    |
| `company_id`      | uuid        | NULL     | —       | ❌  | `companies.id` | ✅            | —   | `companies`  |
| `title`           | text        | NULL     | —       | ❌  | —              | ✅            | —   | —            |
| `description`     | text        | NULL     | —       | ❌  | —              | ✅            | —   | —            |
| `status`          | text        | NULL     | —       | ❌  | —              | ✅            | —   | —            |
| `employment_type` | text        | NULL     | —       | ❌  | —              | ✅            | —   | —            |
| `location`        | text        | NULL     | —       | ❌  | —              | ✅            | —   | —            |
| `salary`          | text        | NULL     | —       | ❌  | —              | ✅            | —   | —            |
| `benefits`        | text        | NULL     | —       | ❌  | —              | ✅            | —   | —            |
| `requirements`    | text        | NULL     | —       | ❌  | —              | ✅            | —   | —            |
| `published_at`    | timestamptz | NULL     | —       | ❌  | —              | ✅            | —   | —            |
| `closed_at`       | timestamptz | NULL     | —       | ❌  | —              | ✅            | —   | —            |
| `created_at`      | timestamptz | NULL     | `now()` | ❌  | —              | ✅            | —   | —            |
| `updated_at`      | timestamptz | NULL     | `now()` | ❌  | —              | ✅            | —   | —            |

**Observação:** Tabela tenant-scoped. Vagas de recrutamento.

---

### `domain_events`

| Coluna            | Tipo        | Nullable | Default | PK  | FK           | Tenant-scoped | RLS | Dependências |
| ----------------- | ----------- | -------- | ------- | --- | ------------ | ------------- | --- | ------------ |
| `id`              | uuid        | NOT NULL | —       | ✅  | —            | ✅            | —   | —            |
| `tenant_id`       | uuid        | NULL     | —       | ❌  | `tenants.id` | ✅            | —   | `tenants`    |
| `event_type`      | text        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `aggregate_type`  | text        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `aggregate_id`    | uuid        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `actor_person_id` | uuid        | NULL     | —       | ❌  | `people.id`  | ✅            | —   | `people`     |
| `payload`         | jsonb       | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `correlation_id`  | uuid        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `causation_id`    | uuid        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `idempotency_key` | text        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `created_at`      | timestamptz | NULL     | `now()` | ❌  | —            | ✅            | —   | —            |

**Observação:** Tabela tenant-scoped. Eventos de domínio/analytics.

---

### `audit_logs`

| Coluna            | Tipo        | Nullable | Default | PK  | FK           | Tenant-scoped | RLS | Dependências |
| ----------------- | ----------- | -------- | ------- | --- | ------------ | ------------- | --- | ------------ |
| `id`              | uuid        | NOT NULL | —       | ✅  | —            | ✅            | —   | —            |
| `actor_person_id` | uuid        | NULL     | —       | ❌  | `people.id`  | ✅            | —   | `people`     |
| `tenant_id`       | uuid        | NULL     | —       | ❌  | `tenants.id` | ✅            | —   | `tenants`    |
| `scope`           | text        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `action`          | text        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `entity_type`     | text        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `entity_id`       | uuid        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `before_data`     | jsonb       | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `after_data`      | jsonb       | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `correlation_id`  | uuid        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `causation_id`    | uuid        | NULL     | —       | ❌  | —            | ✅            | —   | —            |
| `created_at`      | timestamptz | NULL     | `now()` | ❌  | —            | ✅            | —   | —            |

**Observação:** Tabela tenant-scoped. Logs de auditoria.

---

### Tabelas sem colunas confirmadas

As tabelas abaixo existem, mas estavam vazias no momento da inspeção, portanto não foi possível extrair colunas via sample:

- `legal_acceptances`
- `companies`
- `stock_movements`
- `purchase_orders`
- `purchase_receipts`
- `service_orders`
- `contracts`
- `tasks`
- `support_tickets`
- `notifications`
- `files`
- `security_events`
- `candidates`
- `applications`
- `recruitment_demands`
- `sessions`

Para essas tabelas, o schema exato precisa ser confirmado via:

- `information_schema.columns` diretamente no banco
- Migrations do Supabase
- ou inspeção via `psql`/Supabase Studio

---

## Tabelas do Supabase Auth

O Supabase Auth utiliza tabelas no schema `auth`, que não são acessíveis via PostgREST público:

- `auth.users`
- `auth.refresh_tokens`
- `auth.identities`
- `auth.mfa_factors`
- etc.

Essas tabelas são gerenciadas pelo próprio Supabase e não devem ser alteradas diretamente.

---

## Entidades de negócio mapeadas

| Entidade           | Tabela                | Tenant-scoped | Status               |
| ------------------ | --------------------- | ------------- | -------------------- |
| Pessoa             | `people`              | ❌            | ✅                   |
| Tenant             | `tenants`             | ❌            | ✅                   |
| Membership         | `tenant_memberships`  | ❌            | ✅                   |
| Role               | `roles`               | ❌            | ✅                   |
| Role Assignment    | `role_assignments`    | ❌            | ✅                   |
| Permission         | `permissions`         | ❌            | ✅                   |
| Role Permission    | `role_permissions`    | ❌            | ✅                   |
| First Login State  | `first_login_state`   | ❌            | ✅                   |
| Legal Acceptance   | `legal_acceptances`   | ❌            | ✅                   |
| Company/Empresa    | `companies`           | ✅            | ✅ existe, sem dados |
| Product/Produto    | `products`            | ✅            | ✅                   |
| Stock Movement     | `stock_movements`     | ✅            | ✅ existe, sem dados |
| Purchase Order     | `purchase_orders`     | ✅            | ✅ existe, sem dados |
| Purchase Receipt   | `purchase_receipts`   | ✅            | ✅ existe, sem dados |
| Service Order      | `service_orders`      | ✅            | ✅ existe, sem dados |
| Contract           | `contracts`           | ✅            | ✅ existe, sem dados |
| Task               | `tasks`               | ✅            | ✅ existe, sem dados |
| Support Ticket     | `support_tickets`     | ✅            | ✅ existe, sem dados |
| Notification       | `notifications`       | ✅            | ✅ existe, sem dados |
| File               | `files`               | ✅            | ✅ existe, sem dados |
| Audit Log          | `audit_logs`          | ✅            | ✅                   |
| Security Event     | `security_events`     | ✅            | ✅ existe, sem dados |
| Job/Vaga           | `jobs`                | ✅            | ✅                   |
| Candidate          | `candidates`          | ✅            | ✅ existe, sem dados |
| Application        | `applications`        | ✅            | ✅ existe, sem dados |
| Recruitment Demand | `recruitment_demands` | ✅            | ✅ existe, sem dados |
| Domain Event       | `domain_events`       | ✅            | ✅                   |
| Session            | `sessions`            | ✅            | ✅ existe, sem dados |

### Entidades não encontradas no banco

| Entidade    | Tabela esperada | Observação    |
| ----------- | --------------- | ------------- |
| Chat        | `chat`          | ❌ não existe |
| Document    | `documents`     | ❌ não existe |
| LGPD        | `lgpd`          | ❌ não existe |
| Report      | `reports`       | ❌ não existe |
| Talent Pool | `talent_pool`   | ❌ não existe |
| AI          | `ai`            | ❌ não existe |
| Automation  | `automations`   | ❌ não existe |
| Billing     | `billing`       | ❌ não existe |
| Integration | `integrations`  | ❌ não existe |
| Finance     | `finance`       | ❌ não existe |
| Fiscal      | `fiscal`        | ❌ não existe |
| Accounting  | `accounting`    | ❌ não existe |

---

## Dependências de inserção

Ordem sugerida para seed sem quebrar FK:

1. `tenants`
2. `people`
3. `roles`
4. `permissions`
5. `tenant_memberships`
6. `role_assignments`
7. `role_permissions`
8. `first_login_state`
9. `legal_acceptances`
10. Tabelas tenant-scoped: `companies`, `products`, `jobs`, `candidates`, `applications`, `service_orders`, `contracts`, `tasks`, `support_tickets`, `files`, `audit_logs`, `domain_events`, etc.

**Regra:** tabelas globais primeiro, depois tenant-scoped. `tenant_id` e `person_id` devem existir antes de inserir em tabelas filhas.

---

## Próximos passos

1. Confirmar colunas exatas das tabelas vazias via Supabase Studio ou `information_schema` direto
2. Verificar RLS policies diretamente no banco
3. Somente depois: ajustar seed e executar dados de homologação
