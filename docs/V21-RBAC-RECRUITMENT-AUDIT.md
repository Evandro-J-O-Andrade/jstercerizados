# V2.1 — RBAC Recruitment Domain Audit

**Data:** 2026-08-23  
**Empresa:** J&S Empregos LTDA  
**Escopo:** Auditoria do schema RBAC existente vs contrato canônico de RH/Recrutamento  
**Status:** Somente leitura — nenhuma alteração executada

---

## 1. Estado Atual do Banco

### 1.1 Roles Existentes

| Role               | Scope  | Descrição                               | Status no Contrato  |
| ------------------ | ------ | --------------------------------------- | ------------------- |
| `admin_master`     | global | Acesso global com auditoria obrigatória | ✅ Definido         |
| `platform_admin`   | global | Administração da plataforma J&S         | ❌ Fora do contrato |
| `support_engineer` | global | Suporte técnico global                  | ❌ Fora do contrato |
| `tenant_admin`     | tenant | Administração do tenant                 | ✅ Definido         |
| `rh_manager`       | tenant | Gestão de RH                            | ✅ Definido         |
| `recruiter`        | tenant | Recrutamento e triagem                  | ✅ Definido         |
| `finance`          | tenant | Financeiro                              | ❌ Fora do contrato |
| `support`          | tenant | Atendimento ao cliente                  | ❌ Fora do contrato |
| `content_manager`  | tenant | Conteúdo do site                        | ❌ Fora do contrato |
| `viewer`           | tenant | Apenas leitura                          | ❌ Fora do contrato |

**Observação:** O contrato menciona `finance_manager` mas o seed atual cria apenas `finance`.

### 1.2 Permissions Existentes no Banco

Seed atual (`supabase/migrations/20260816000700_rbac.sql:334-375`):

| Permission             | Module      | Descrição                     |
| ---------------------- | ----------- | ----------------------------- |
| `people.read`          | core        | Visualizar pessoas            |
| `people.create`        | core        | Criar pessoas                 |
| `people.update`        | core        | Atualizar pessoas             |
| `people.disable`       | core        | Desativar pessoas             |
| `candidates.read`      | recruitment | Visualizar candidatos         |
| `candidates.create`    | recruitment | Criar candidatos              |
| `candidates.update`    | recruitment | Atualizar candidatos          |
| `jobs.read`            | recruitment | Visualizar vagas              |
| `jobs.create`          | recruitment | Criar vagas                   |
| `jobs.update`          | recruitment | Editar vagas                  |
| `jobs.publish`         | recruitment | Publicar vagas                |
| `jobs.delete`          | recruitment | Arquivar vagas                |
| `applications.read`    | recruitment | Visualizar candidaturas       |
| `applications.update`  | recruitment | Atualizar candidaturas        |
| `applications.reject`  | recruitment | Rejeitar candidaturas         |
| `applications.approve` | recruitment | Aprovar candidaturas          |
| `companies.read`       | core        | Visualizar empresas           |
| `companies.create`     | core        | Criar empresas                |
| `companies.update`     | core        | Editar empresas               |
| `finance.read`         | finance     | Acessar dados financeiros     |
| `finance.create`       | finance     | Criar lançamentos financeiros |
| `finance.update`       | finance     | Atualizar financeiro          |
| `audit.read`           | platform    | Visualizar logs de auditoria  |
| `roles.manage`         | platform    | Gerenciar papéis e permissões |
| `tenant.manage`        | platform    | Administrar tenant            |
| `integrations.manage`  | platform    | Gerenciar integrações         |

**Total: 26 permissions no banco atual.**

### 1.3 Mapeamento role_permissions Existente

A estrutura existe, mas o seed da migration 007 não inclui inserts explícitos de `role_permissions` no arquivo analisado. O arquivo `20260817000100_seed.sql:60-63` comenta que estão em `012_rls_consolidation.sql`. O spec `47_rbac_canonical.sql` adiciona mapeamentos adicionais para roles canônicos com UUIDs fixos.

---

## 2. Comparação com o Contrato

### 2.1 Gaps: Permissions Faltantes no Banco

| Permission                    | Contrato | Banco Atual | Gap         |
| ----------------------------- | -------- | ----------- | ----------- |
| `jobs.close`                  | ✅       | ❌          | **CRÍTICO** |
| `candidates.delete`           | ✅       | ❌          | **CRÍTICO** |
| `candidates.documents.read`   | ✅       | ❌          | **ALTO**    |
| `candidates.documents.manage` | ✅       | ❌          | **ALTO**    |
| `candidates.profile.read`     | ✅       | ❌          | **ALTO**    |
| `recruitment.read`            | ✅       | ❌          | **CRÍTICO** |
| `recruitment.create`          | ✅       | ❌          | **CRÍTICO** |
| `recruitment.update`          | ✅       | ❌          | **CRÍTICO** |
| `recruitment.delete`          | ✅       | ❌          | **CRÍTICO** |
| `recruitment.advance`         | ✅       | ❌          | **ALTO**    |
| `recruitment.reject`          | ✅       | ❌          | **ALTO**    |
| `recruitment.stage.manage`    | ✅       | ❌          | **ALTO**    |
| `applications.advance`        | ✅       | ❌          | **ALTO**    |
| `applications.history.read`   | ✅       | ❌          | **MÉDIO**   |
| `talent_pool.read`            | ✅       | ❌          | **ALTO**    |
| `talent_pool.manage`          | ✅       | ❌          | **MÉDIO**   |
| `talent_pool.match`           | ✅       | ❌          | **MÉDIO**   |
| `recruitment_demands.read`    | ✅       | ❌          | **ALTO**    |
| `recruitment_demands.create`  | ✅       | ❌          | **ALTO**    |
| `recruitment_demands.update`  | ✅       | ❌          | **ALTO**    |
| `recruitment_demands.delete`  | ✅       | ❌          | **ALTO**    |

**Total: 21 permissions faltantes no banco.**

### 2.2 Gaps: Roles Faltantes no Banco

| Role              | Contrato | Banco Atual | Gap       |
| ----------------- | -------- | ----------- | --------- |
| `finance_manager` | ✅       | ❌          | **MÉDIO** |
| `recruiter`       | ✅       | ✅          | —         |
| `rh_manager`      | ✅       | ✅          | —         |
| `tenant_admin`    | ✅       | ✅          | —         |
| `admin_master`    | ✅       | ✅          | —         |

### 2.3 Conflitos: Permissions com Nome/Module Diferente

| Banco Atual                            | Contrato                                       | Conflito                                                                          |
| -------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------- |
| `applications.approve`                 | `applications.advance` + `applications.reject` | **ALTO** — O banco usa `approve` genérico, o contrato separa `advance` e `reject` |
| `jobs.delete` (desc: "Arquivar vagas") | `jobs.delete` (desc: "Excluir vaga")           | **MÉDIO** — Semântica diferente                                                   |
| `people.disable`                       | Não existe no contrato                         | **BAIXO** — É de domínio core, não recruitment                                    |
| `roles.manage`                         | Não existe no contrato                         | **BAIXO** — É de domínio platform                                                 |
| `tenant.manage`                        | Não existe no contrato                         | **BAIXO** — É de domínio platform                                                 |

### 2.4 Duplicações no Seed Existente

Não há duplicações diretas no seed atual. Porém:

- O contrato não define `applications.create`, mas o banco também não tem (é consistente).
- O contrato define `recruitment.stage.manage` e `talent_pool.*` como sub-permissões pontilhadas, que não existem no seed atual.
- O seed atual mistura domínios (core, recruitment, finance, platform) enquanto o contrato é específico para recruitment.

---

## 3. Análise de Compatibilidade do Seed SQL do Contrato com o Schema Atual

### 3.1 Estrutura da Tabela permissions

```sql
-- Schema atual (20260816000700_rbac.sql)
create table public.permissions (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(100) not null unique,
  description text,
  module      varchar(50),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

### 3.2 Problemas no Seed do Contrato

1. **IDs fixos textuais vs UUID**
   - O contrato usa `INSERT INTO permissions (id, resource, action, description) VALUES ('jobs-read', ...)`
   - O schema atual espera `uuid` na coluna `id`, mas o seed do contrato tenta inserir texto (`jobs-read`)
   - **ERRO:** O seed do contrato falhará com erro de tipo (`invalid input syntax for uuid`)

2. **Colunas inexistentes**
   - O seed do contrato referencia colunas `resource` e `action` na tabela `permissions`
   - O schema atual NÃO tem essas colunas — tem apenas `name`, `description`, `module`
   - **ERRO:** O seed do contrato falhará com erro de coluna inexistente

3. **Role IDs fixos**
   - O seed do contrato usa UUIDs fixos como `10000000-0000-0000-0000-000000000002`
   - Esses UUIDs não existem no seed atual da migration 007
   - O spec `47_rbac_canonical.sql` insere esses UUIDs, mas essa migration ainda não foi aplicada (é apenas um spec)

### 3.3 Recomendação de Seed Ajustado

Para compatibilidade com o schema atual, o seed deve:

- Usar `name` no formato `resource.action` (ex: `jobs.close`)
- Inserir apenas colunas existentes: `(name, module, description)`
- Usar `ON CONFLICT (name) DO NOTHING` para idempotência
- Referenciar roles existentes por `name` em subqueries, não por UUID fixo

Exemplo ajustado:

```sql
INSERT INTO public.permissions (name, module, description) VALUES
  ('jobs.close', 'recruitment', 'Encerrar vaga'),
  ('candidates.delete', 'recruitment', 'Remover candidato'),
  ('candidates.documents.read', 'recruitment', 'Consultar documentos'),
  ('candidates.documents.manage', 'recruitment', 'Gerenciar documentos'),
  ('candidates.profile.read', 'recruitment', 'Consultar perfil'),
  ('recruitment.read', 'recruitment', 'Visualizar processos'),
  ('recruitment.create', 'recruitment', 'Criar processo'),
  ('recruitment.update', 'recruitment', 'Editar processo'),
  ('recruitment.delete', 'recruitment', 'Excluir processo'),
  ('recruitment.advance', 'recruitment', 'Avançar candidato'),
  ('recruitment.reject', 'recruitment', 'Reprovar candidato'),
  ('recruitment.stage.manage', 'recruitment', 'Gerenciar etapas'),
  ('talent_pool.read', 'recruitment', 'Consultar banco de talentos'),
  ('talent_pool.manage', 'recruitment', 'Administrar talentos'),
  ('talent_pool.match', 'recruitment', 'Executar matching'),
  ('recruitment_demands.read', 'recruitment', 'Consultar demandas'),
  ('recruitment_demands.create', 'recruitment', 'Abrir demanda'),
  ('recruitment_demands.update', 'recruitment', 'Editar demanda'),
  ('recruitment_demands.delete', 'recruitment', 'Excluir demanda')
ON CONFLICT (name) DO NOTHING;
```

---

## 4. Análise de Compatibilidade com o Frontend

### 4.1 Estrutura Esperada

```typescript
// src/types/auth.ts:57-64
export interface Permission {
  id: string; // UUID
  name: string; // ex: "jobs.read"
  resource: string; // ex: "jobs"
  action: string; // ex: "read"
  description?: string | null;
  created_at: string;
}
```

### 4.2 Função de Verificação

```typescript
// src/utils/rbac.ts:3-5
export function getPermissionKey(permission: Permission): string {
  return `${permission.resource}.${permission.action}`;
}
```

### 4.3 Uso no DashboardSidebar

```typescript
// src/components/dashboard/DashboardSidebar.tsx:59
permissions: ['jobs.read'],
```

### 4.4 Compatibilidade

| Aspecto                   | Status        | Observação                                                               |
| ------------------------- | ------------- | ------------------------------------------------------------------------ |
| Formato `resource.action` | ✅ Compatível | O contrato usa `jobs.read`, o frontend compara `resource + "." + action` |
| IDs como strings          | ✅ Compatível | O frontend armazena `id` como string (UUID)                              |
| `admin_master` bypass     | ✅ Compatível | `PermissionGuard.tsx:75` já trata `isAdminMaster` como bypass            |
| DashboardSidebar          | ✅ Compatível | Já referencia `jobs.read`, `candidates.read`, `recruitment.read`         |
| PermissionGuard           | ✅ Compatível | Suporta `permission` (string) e `permissions` (array de strings)         |

**Conclusão:** O formato do contrato é compatível com o frontend. O único ajuste necessário é garantir que a query do banco retorne `resource` e `action` separados, ou que o frontend derive `resource.action` do campo `name`.

**Atenção:** O seed do contrato atual não popula `resource` e `action` separadamente. Se o frontend consultar `permissions` e esperar `resource` e `action` preenchidos, o seed ajustado deve garantir isso. O schema atual não tem essas colunas, então o frontend deve derivá-las do `name` (ex: `jobs.read` → `resource: "jobs"`, `action: "read"`).

---

## 5. Recomendações

### 5.1 Seed SQL Ajustado (Prioridade Alta)

Substituir o seed do contrato por uma versão compatível:

```sql
-- Permissions do domínio RH/Recrutamento
INSERT INTO public.permissions (name, module, description) VALUES
  -- Jobs
  ('jobs.close', 'recruitment', 'Encerrar vaga'),

  -- Candidates
  ('candidates.delete', 'recruitment', 'Remover candidato'),
  ('candidates.documents.read', 'recruitment', 'Consultar documentos'),
  ('candidates.documents.manage', 'recruitment', 'Gerenciar documentos'),
  ('candidates.profile.read', 'recruitment', 'Consultar perfil completo'),

  -- Recruitment
  ('recruitment.read', 'recruitment', 'Visualizar processos'),
  ('recruitment.create', 'recruitment', 'Criar processo'),
  ('recruitment.update', 'recruitment', 'Editar processo'),
  ('recruitment.delete', 'recruitment', 'Excluir processo'),
  ('recruitment.advance', 'recruitment', 'Avançar candidato'),
  ('recruitment.reject', 'recruitment', 'Reprovar candidato'),
  ('recruitment.stage.manage', 'recruitment', 'Gerenciar etapas'),

  -- Applications
  ('applications.advance', 'recruitment', 'Avançar candidatura'),
  ('applications.history.read', 'recruitment', 'Consultar histórico'),

  -- Talent Pool
  ('talent_pool.read', 'recruitment', 'Consultar banco de talentos'),
  ('talent_pool.manage', 'recruitment', 'Administrar talentos'),
  ('talent_pool.match', 'recruitment', 'Executar matching'),

  -- Recruitment Demands
  ('recruitment_demands.read', 'recruitment', 'Consultar demandas'),
  ('recruitment_demands.create', 'recruitment', 'Abrir demanda'),
  ('recruitment_demands.update', 'recruitment', 'Editar demanda'),
  ('recruitment_demands.delete', 'recruitment', 'Excluir demanda')
ON CONFLICT (name) DO NOTHING;

-- Role: finance_manager (faltante)
INSERT INTO public.roles (name, is_global, description) VALUES
  ('finance_manager', FALSE, 'Gerente Financeiro')
ON CONFLICT (is_global, name) DO NOTHING;

-- role_permissions para recruiter
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'recruiter'
  AND p.name IN (
    'jobs.read', 'jobs.create', 'jobs.update',
    'candidates.read', 'candidates.create', 'candidates.update',
    'candidates.documents.read', 'candidates.profile.read',
    'recruitment.read', 'recruitment.create', 'recruitment.update',
    'recruitment.advance', 'recruitment.reject',
    'applications.read', 'applications.update', 'applications.advance', 'applications.reject',
    'applications.history.read',
    'talent_pool.read', 'talent_pool.match',
    'recruitment_demands.read'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- role_permissions para rh_manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'rh_manager'
  AND p.name IN (
    'jobs.read', 'jobs.create', 'jobs.update', 'jobs.delete', 'jobs.publish', 'jobs.close',
    'candidates.read', 'candidates.create', 'candidates.update', 'candidates.delete',
    'candidates.documents.read', 'candidates.documents.manage', 'candidates.profile.read',
    'recruitment.read', 'recruitment.create', 'recruitment.update', 'recruitment.delete',
    'recruitment.advance', 'recruitment.reject', 'recruitment.stage.manage',
    'applications.read', 'applications.update', 'applications.advance', 'applications.reject',
    'applications.history.read',
    'talent_pool.read', 'talent_pool.manage', 'talent_pool.match',
    'recruitment_demands.read', 'recruitment_demands.create', 'recruitment_demands.update', 'recruitment_demands.delete'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- role_permissions para tenant_admin (todas as permissions de recruitment)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'tenant_admin'
  AND p.module = 'recruitment'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- role_permissions para admin_master (todas as permissions)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin_master'
ON CONFLICT (role_id, permission_id) DO NOTHING;
```

### 5.2 Ajuste no Frontend (Se Necessário)

Se o frontend consulta `resource` e `action` diretamente do banco, garantir que a query retorne:

```sql
SELECT
  id,
  name,
  split_part(name, '.', 1) as resource,
  split_part(name, '.', 2) as action,
  description,
  module,
  created_at
FROM permissions;
```

Ou ajustar o `AuthContext` para derivar `resource` e `action` do `name` se essas colunas não existirem na query.

### 5.3 Limpeza de Conflitos

- Renomear `applications.approve` para `applications.advance` (breaking change — verificar se há código dependente)
- Revisar descrição de `jobs.delete` para alinhar com o contrato
- Considerar remover `people.disable` do seed de recruitment se não for usado no domínio

### 5.4 Prioridade de Implementação

| Prioridade | Item                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| P0         | Aplicar seed ajustado com as 21 permissions faltantes                                                                                 |
| P0         | Corrigir conflito `applications.approve` → `applications.advance`                                                                     |
| P1         | Criar role `finance_manager`                                                                                                          |
| P1         | Mapear `role_permissions` para `recruiter`, `rh_manager`, `tenant_admin`                                                              |
| P2         | Remover roles não utilizados (`platform_admin`, `support_engineer`, `finance`, `support`, `content_manager`) se não forem necessários |
| P2         | Implementar `resolvePostLoginDestination()`                                                                                           |

---

## 6. Decisões Pendentes que Precisam de Aprovação

1. **IDs das permissions:** O contrato propõe IDs fixos (`jobs-read`, `jobs-create`), mas o schema atual usa UUIDs. Devemos:
   - A) Mantiver UUIDs automáticos e usar `name` como identificador canônico
   - B) Alterar o schema para aceitar IDs textuais (breaking change)

2. **`applications.approve` vs `applications.advance`:** O banco atual tem `applications.approve`, o contrato tem `applications.advance` e `applications.reject`. Devemos:
   - A) Renomear `applications.approve` para `applications.advance`
   - B) Manter ambos e mapear `approve` → `advance` no frontend
   - C) Remover `applications.approve` e usar apenas os do contrato

3. **Roles globais extras:** `platform_admin`, `support_engineer` existem no seed atual mas não no contrato. Devemos:
   - A) Remover do seed (se não forem usados)
   - B) Manter (são de outros domínios)

4. **Colunas `resource` e `action`:** O contrato pressupõe essas colunas na tabela `permissions`, mas o schema atual não as tem. Devemos:
   - A) Adicionar colunas `resource` e `action` na tabela `permissions`
   - B) Derivar `resource` e `action` do campo `name` no frontend/backend

5. **Scope dos roles:** O contrato usa `scope = 'global'` e `scope = 'tenant'`, mas o schema atual usa `is_global` (boolean). Devemos:
   - A) Adicionar coluna `scope` e manter `is_global` como legacy
   - B) Usar apenas `is_global` (já funcional)
   - C) Renomear `is_global` para `scope`

6. **UUIDs fixos no spec 47:** O spec `supabase/specs/sql/47_rbac_canonical.sql` usa UUIDs fixos para roles. Devemos:
   - A) Aplicar essa migration como base para IDs canônicos
   - B) Ignorar e usar UUIDs automáticos

---

## 7. Conclusão

O banco atual possui 26 permissions, das quais 21 faltam para o contrato de RH/Recrutamento. O schema atual usa `uuid` como PK e `name` como unique, enquanto o seed do contrato usa IDs textuais fixos e colunas inexistentes (`resource`, `action`). O frontend é compatível com o formato `resource.action`, mas o seed do contrato precisa ser ajustado para funcionar com o schema existente.

**Recomendação principal:** Aprovar o seed SQL ajustado (Seção 5.1) antes de executar qualquer migration, e decidir sobre os 6 pontos pendentes da Seção 6.
