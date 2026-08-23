# AUDITORIA PRÉ-VÍNCULO — EVANDRO

**Data:** 2026-08-23  
**Branch:** main  
**Commit base:** a86e19b  
**Modo:** READ-ONLY / NÃO ALTERAR NADA

---

## 1. Objetivo

Validar se o modelo de vínculo `auth.users → people → tenant_memberships → role_assignments` está correto antes de criar qualquer INSERT para o usuário `evandro_j.o.a@hotmail.com`.

---

## 2. Usuário alvo

| Campo            | Valor                                                      |
| ---------------- | ---------------------------------------------------------- |
| Email            | `evandro_j.o.a@hotmail.com`                                |
| Auth ID esperado | `a78ddef1-5659-404f-9c7c-940c5df0abf1`                     |
| Role             | `admin_master`                                             |
| Tenant           | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` (J&S Empregos LTDA) |

---

## 3. Modelo de vínculo confirmado

```text
auth.users (Supabase Auth)
    │
    │ id
    ▼
people.auth_user_id (único)
    │
    │ id
    ▼
tenant_memberships.person_id
    │
    │ person_id
    ▼
role_assignments.person_id
    │
    │ role_id
    ▼
roles (admin_master, scope=system, is_global=true)
```

---

## 4. Estrutura confirmada

### `people`

- `auth_user_id` — FK para `auth.users.id`
- Unique constraint em `auth_user_id`
- Campos obrigatórios: `id`, `auth_user_id`, `full_name`, `email`, `status`, `created_at`, `updated_at`

### `tenant_memberships`

- `person_id` — FK para `people.id`
- `tenant_id` — FK para `tenants.id`
- `status` — `'active' | 'inactive' | 'pending'`
- `joined_at` — timestamp
- Unique constraint: `(person_id, tenant_id)`

### `role_assignments`

- `person_id` — FK para `people.id`
- `role_id` — FK para `roles.id`
- `tenant_id` — nullable (para roles globais como `admin_master`)
- `expires_at` — nullable
- `assigned_at` — timestamp

### `roles`

- `admin_master` deve ter:
  - `name = 'admin_master'`
  - `scope = 'system'`
  - `is_global = true`
  - `tenant_id = NULL`

---

## 5. Script de provisionamento existente

Arquivo: `scripts/provision-admin.ts`

O script já implementa exatamente o fluxo necessário:

1. **Auth**: cria/verifica usuário em `auth.users`
2. **People**: cria/verifica pessoa em `people` via upsert por `auth_user_id`
3. **Tenant Membership**: cria/verifica vínculo em `tenant_memberships`
4. **Role Assignment**: cria/verifica `admin_master` global (`tenant_id = NULL`)

**Observações do script:**

- Usa `SUPABASE_SECRET_KEY` (service role) — não usa anon key
- É idempotente (`upsert` + `maybeSingle`)
- Não cria senha em código
- Não armazena credenciais em repositório
- Validações de ambiente antes de executar

---

## 6. Validações necessárias antes de executar

### 6.1 Constraints do banco

| Tabela               | Campo          | Tipo | Nullable | FK/Unique                             |
| -------------------- | -------------- | ---- | -------- | ------------------------------------- |
| `people`             | `auth_user_id` | uuid | NOT NULL | FK auth.users + UNIQUE                |
| `people`             | `id`           | uuid | NOT NULL | PK                                    |
| `tenant_memberships` | `person_id`    | uuid | NOT NULL | FK people.id                          |
| `tenant_memberships` | `tenant_id`    | uuid | NOT NULL | FK tenants.id                         |
| `tenant_memberships` | `status`       | text | NOT NULL | DEFAULT 'active'                      |
| `role_assignments`   | `person_id`    | uuid | NOT NULL | FK people.id                          |
| `role_assignments`   | `role_id`      | uuid | NOT NULL | FK roles.id                           |
| `role_assignments`   | `tenant_id`    | uuid | NULLABLE | FK tenants.id (nullable para globais) |

### 6.2 Validações no banco remoto

**Executar READ-ONLY antes do provisionamento:**

```sql
-- 1. Verificar auth.user
SELECT id, email, email_confirmed_at, banned_until, last_sign_in_at
FROM auth.users
WHERE email = 'evandro_j.o.a@hotmail.com';

-- 2. Verificar people existente
SELECT id, auth_user_id, full_name, email, status
FROM people
WHERE auth_user_id = 'a78ddef1-5659-404f-9c7c-940c5df0abf1';

-- 3. Verificar tenant
SELECT id, name, slug, status
FROM tenants
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- 4. Verificar role admin_master
SELECT id, name, scope, is_global, tenant_id
FROM roles
WHERE name = 'admin_master';

-- 5. Verificar vínculos existentes
SELECT
  p.id AS person_id,
  p.full_name,
  tm.id AS membership_id,
  tm.tenant_id,
  tm.status AS membership_status,
  ra.id AS assignment_id,
  ra.role_id,
  r.name AS role_name,
  r.scope AS role_scope
FROM people p
LEFT JOIN tenant_memberships tm ON tm.person_id = p.id AND tm.status = 'active'
LEFT JOIN role_assignments ra ON ra.person_id = p.id AND (ra.expires_at IS NULL OR ra.expires_at > now())
LEFT JOIN roles r ON r.id = ra.role_id
WHERE p.auth_user_id = 'a78ddef1-5659-404f-9c7c-940c5df0abf1';
```

---

## 7. Resultado esperado da auditoria

### Cenário A — Tudo limpo (ideal)

```text
auth.users: 1 registro (evandro_j.o.a@hotmail.com)
people: 0 registros para esse auth_user_id
tenant_memberships: 0
role_assignments: 0
roles: admin_master existe (scope=system, is_global=true)
tenant: J&S Empregos LTDA existe e ativo
```

**Ação:** Executar `scripts/provision-admin.ts` para criar o vínculo completo.

### Cenário B — People existe, sem membership/role

```text
auth.users: 1 registro
people: 1 registro (auth_user_id preenchido)
tenant_memberships: 0
role_assignments: 0
```

**Ação:** Apenas criar `tenant_memberships` + `role_assignments`.

### Cenário C — Vínculo completo já existe

```text
auth.users: 1
people: 1
tenant_memberships: 1 (active)
role_assignments: 1 (admin_master)
```

**Ação:** Nada a fazer. O problema do `400 Invalid login credentials` é outro (senha incorreta/reset).

### Cenário D — Conflito

```text
people: múltiplos registros com mesmo auth_user_id
OU
tenant_memberships: múltiplos ativos para mesma pessoa
OU
role_assignments: múltiplos admin_master para mesma pessoa
```

**Ação:** PARAR. Não provisionar. Investigar conflito primeiro.

---

## 8. SQL corrigido para vínculo (se Cenário A)

**Não executar ainda. Apenas referência.**

```sql
-- 1. Garantir person (se não existir)
INSERT INTO people (auth_user_id, full_name, email, status, created_at, updated_at)
VALUES (
  'a78ddef1-5659-404f-9c7c-940c5df0abf1',
  'Evandro Andrade',
  'evandro_j.o.a@hotmail.com',
  'active',
  now(),
  now()
)
ON CONFLICT (auth_user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = now()
RETURNING id;

-- 2. Garantir tenant_membership
INSERT INTO tenant_memberships (person_id, tenant_id, status, joined_at, created_at, updated_at)
VALUES (
  '<PERSON_ID_DO_PASSO_1>',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'active',
  now(),
  now(),
  now()
)
ON CONFLICT (person_id, tenant_id) DO UPDATE SET
  status = 'active',
  updated_at = now();

-- 3. Garantir role_assignment (admin_master global)
INSERT INTO role_assignments (person_id, role_id, tenant_id, assigned_at)
SELECT
  '<PERSON_ID_DO_PASSO_1>',
  id,
  NULL,
  now()
FROM roles
WHERE name = 'admin_master' AND scope = 'system'
ON CONFLICT (person_id, role_id, tenant_id) DO NOTHING;
```

---

## 9. Próximo passo

1. **Você executa as queries de verificação (item 6.2) no Supabase SQL Editor**
2. **Me traz o resultado**
3. **Eu identifico o cenário (A/B/C/D)**
4. **Você autoriza executar `scripts/provision-admin.ts` APENAS se cenário for A, B ou C**
5. **Se cenário D, paramos para investigar conflitos**

---

## 10. Observações importantes

- **Não executar `scripts/provision-admin.ts` ainda**
- **Não executar o SQL do item 8 ainda**
- **Não alterar RBAC ainda**
- **Não criar/remover roles ainda**
- **O provisioning do Auth (`auth.users`) é feito pelo script, não pelo SQL direto**

---

**Fim da auditoria pré-vínculo.**
