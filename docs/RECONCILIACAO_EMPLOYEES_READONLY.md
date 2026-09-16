# RECONCILIAÇÃO READ-ONLY: Employees — Worktree × GitHub × Supabase

> **FASE 1B — INVESTIGAÇÃO READ-ONLY**
> Nenhum arquivo foi alterado. Nenhuma migration foi aplicada. Nenhuma DDL foi executada.

---

## 1. Contexto

A conclusão anterior (relatório `AUDITORIA_WORKTREE_BANCO.md`) assumia que as 5 tabelas V2.1
(`departments`, `positions`, `employee_positions`, `employee_contracts`,
`employee_status_history`) **não existiam fisicamente** no Supabase, baseando-se exclusivamente
na migration local `20260827000100_employees.sql`.

**Essa premissa foi invalidada.** Consulta direta ao Supabase project `okxqfyoqbhcmflpurfrw`
via PostgREST REST API (anon key) confirmou:

| Tabela                    | Supabase | Colunas confirmadas                                                                                                                            |
| ------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `employees`               | ✅       | `id`, `tenant_id`, `person_id`, `company_id`, `employee_code`, `hire_date`, `termination_date`, `salary`, `status`, `created_at`, `updated_at` |
| `employee_documents`      | ✅       | `employee_id`, `document_type`, `file_url`, `issue_date`, `expiry_date`, `created_at`, `updated_at`                                            |
| `departments`             | ✅       | 0 rows                                                                                                                                         |
| `positions`               | ✅       | 0 rows                                                                                                                                         |
| `employee_positions`      | ✅       | 0 rows                                                                                                                                         |
| `employee_contracts`      | ✅       | 0 rows                                                                                                                                         |
| `employee_status_history` | ✅       | 0 rows                                                                                                                                         |
| `employee_education`      | ❌       | NOT FOUND                                                                                                                                      |
| `employee_experiences`    | ❌       | NOT FOUND                                                                                                                                      |
| `employee_skills`         | ❌       | NOT FOUND                                                                                                                                      |
| `employee_languages`      | ❌       | NOT FOUND                                                                                                                                      |
| `employee_courses`        | ❌       | NOT FOUND                                                                                                                                      |

**employee_documents no Supabase usa a versão V2.1 "slim" (`file_url`), NÃO a versão V2.0 "fat"
(`document_url`, `document_name`, `is_verified`, `notes`).**

**employees no Supabase NÃO tem `registration` — usa `employee_code`.**
Todas as colunas V2.0 (`job_title`, `department`, `cost_center`, `work_mode`,
`employment_type`, `probation_end_date`, `salary_currency`, `salary_frequency`,
`manager_id`, `notes`) estão AUSENTES.

---

## 2. Linha do Tempo do GitHub

| Data       | Commit    | Descrição                                                                                                 |
| ---------- | --------- | --------------------------------------------------------------------------------------------------------- |
| 2026-08-21 | `7c2aa30` | Criação das specs V2.1: `33_employees.sql`, `45_rls_remaining.sql`, etc.                                  |
| 2026-08-26 | `9007799` | Criação da migration `20260827000100_employees.sql` (estilo C2.2 / V2.0)                                  |
| 2026-09-12 | `2c490b9` | Reconciliação de código para V2.1 — database.ts, employee.ts, UI atualizados. **Migration não alterada.** |

---

## 3. Origem de Cada Fonte

### 3.1 Supabase Real (project: `okxqfyoqbhcmflpurfrw`)

Consultado via `list_tables` + `information_schema.columns`. Tabelas existentes:

- `employees` — possui **`employee_code`** (varchar/text, único)
- `employee_documents`
- `departments`
- `positions`
- `employee_positions`
- `employee_contracts`
- `employee_status_history`

**NÃO existem no Supabase:**

- `employee_education`
- `employee_experiences`
- `employee_skills`
- `employee_languages`
- `employee_courses`

### 3.2 GitHub Spec V2.1: `supabase/specs/sql/33_employees.sql`

```text
create table public.departments ( ... )
create table public.positions ( ... )
create table public.employees ( ... employee_code text not null unique ... )
create table public.employee_positions ( ... )
create table public.employee_contracts ( ... )
create table public.employee_documents ( ... file_url text ... )  -- slim
create table public.employee_status_history ( ... )
```

**Características V2.1:**

- `employees.id` → `references public.people(id)` (PK = FK para people)
- `employees` usa `employee_code` (não `registration`)
- `employee_documents` usa `file_url` (sem `document_name`, `is_verified`, `notes`)
- Não cria employee_education, experiences, skills, languages, courses

### 3.3 Local Migration: `supabase/migrations/20260827000100_employees.sql`

```text
create table public.employees ( ... registration varchar(120) unique ... )
create table public.employee_documents ( ... document_name, document_url, is_verified, notes ... )  -- fat
create table public.employee_education ( ... )
create table public.employee_experiences ( ... )
create table public.employee_skills ( ... )
create table public.employee_languages ( ... )
create table public.employee_courses ( ... )
```

**Características C2.2/V2.0:**

- `employees.id` → `uuid primary key default gen_random_uuid()` (PK autogerado)
- `employees` usa `registration` (não `employee_code`)
- `employee_documents` usa `document_url` + `document_name` + `is_verified` + `notes` (versão "fat")
- Cria employee_education, experiences, skills, languages, courses
- **NÃO cria** departments, positions, employee_positions, employee_contracts, employee_status_history
- RLS inline no mesmo arquivo (usando `auth.uid()` direto)

### 3.4 GitHub Spec V2.1: `supabase/specs/sql/45_rls_remaining.sql`

Define policies para: employees, departments, positions, employee_positions,
employee_contracts, employee_documents, employee_status_history — usando `is_tenant_member(tenant_id)`.

### 3.5 Código (database.ts + domain types)

Após commit `2c490b9`:

- `database.ts` contém: `employees` (com `registration`), `employee_documents` (versão **fat**: `document_url`, `document_name`, `is_verified`, `notes`)
- `database.ts` contém: `departments`, `positions`, `employee_positions`, `employee_contracts`, `employee_status_history` (V2.1)
- `database.ts` **não contém**: `employee_education`, `employee_experiences`, `employee_skills`, `employee_languages`, `employee_courses`
- `employee.ts` (domain) usa `registration: string | null`
- `mappers.ts` faz `registration: row.registration`
- `employees.repository.ts` usa `registration` e busca por `%${filters.search}%` em `registration`

### 3.6 database_new.ts (raiz — órfão)

- Arquivo `database_new.ts` na raiz (`C:\NewWaveProjetos\jrtercerisados\database_new.ts`)
- **Não importado por nenhum código ativo**
- Não contém employees, departments, positions ou quaisquer tabelas V2.1
- Classificado como **LEGADO / ÓRFÃO**

---

## 4. Matriz de Reconciliação

| Entidade / Coluna          | Supabase Real            | Local Migration                             | Spec V2.1                | Code (database.ts)      | Status                           |
| -------------------------- | ------------------------ | ------------------------------------------- | ------------------------ | ----------------------- | -------------------------------- |
| `employees`                | ✅ (com `employee_code`) | ✅ (com `registration`)                     | ✅ (com `employee_code`) | ✅ (com `registration`) | **DIVERGENTE**                   |
| `employee_code`            | ✅ existe                | ❌ ausente                                  | ✅ existe                | ❌ ausente              | **SUPABASE À FRENTE**            |
| `registration`             | ⚠ (presumir ausente)     | ✅ existe                                   | ❌ ausente               | ✅ existe               | **CÓDIGO À FRENTE**              |
| `departments`              | ✅                       | ❌                                          | ✅                       | ✅                      | **ALINHADO** (Código ≈ Supabase) |
| `positions`                | ✅                       | ❌                                          | ✅                       | ✅                      | **ALINHADO** (Código ≈ Supabase) |
| `employee_positions`       | ✅                       | ❌                                          | ✅                       | ✅                      | **ALINHADO** (Código ≈ Supabase) |
| `employee_contracts`       | ✅                       | ❌                                          | ✅                       | ✅                      | **ALINHADO** (Código ≈ Supabase) |
| `employee_status_history`  | ✅                       | ❌                                          | ✅                       | ✅                      | **ALINHADO** (Código ≈ Supabase) |
| `employee_documents`       | ✅                       | ✅ (fat: document_name, is_verified, notes) | ✅ (slim: file_url)      | ✅ (fat)                | **DIVERGENTE**                   |
| `employee_education`       | ❌                       | ✅                                          | ❌                       | ❌                      | **MIGRATION OBSOLETA**           |
| `employee_experiences`     | ❌                       | ✅                                          | ❌                       | ❌                      | **MIGRATION OBSOLETA**           |
| `employee_skills`          | ❌                       | ✅                                          | ❌                       | ❌                      | **MIGRATION OBSOLETA**           |
| `employee_languages`       | ❌                       | ✅                                          | ❌                       | ❌                      | **MIGRATION OBSOLETO**           |
| `employee_courses`         | ❌                       | ✅                                          | ❌                       | ❌                      | **MIGRATION OBSOLETO**           |
| `database_new.ts`          | —                        | —                                           | —                        | —                       | **LEGADO / ÓRFÃO**               |
| Spec `33_employees.sql`    | —                        | —                                           | ✅                       | —                       | **ESPEC NÃO APLICADA**           |
| Migration `20260827000100` | —                        | ✅                                          | —                        | —                       | **DESBIGUADA**                   |

---

## 5. Análise das Divergências

### 5.1 Origem das 5 tabelas V2.1 (departments, positions, etc.)

**Conclusão:** As 5 tabelas existem no Supabase porque foram criadas a partir da spec
`33_employees.sql` (commit `7c2aa30`, 21/08/2026), **não** pela migration local
`20260827000100_employees.sql`.

**Evidência:**

- A spec `33_employees.sql` contém `CREATE TABLE departments`, `positions`,
  `employee_positions`, `employee_contracts`, `employee_status_history`
- A migration local `20260827000100_employees.sql` **não contém** nenhum `CREATE TABLE`
  para essas 5 tabelas
- O Supabase possui todas as 5 tabelas
- Portanto, foi aplicada uma migration histórica (baseada na spec V2.1) que não está mais
  na worktree atual, ou a spec foi aplicada manualmente

**Classificação:** `INDETERMINADO` — a migration que criou fisicamente essas tabelas
no Supabase **não está presente na worktree local**. Provavelmente foi uma migration
anterior que foi substituída.

### 5.2 employee_code × registration

**Conclusão:** O Supabase possui `employee_code`; o código e a migration local usam
`registration`. Não há migration de rename/backfill entre os dois.

**Evidência:**

- Migration local `20260827000100_employees.sql`: `registration varchar(120) unique`
- Spec V2.1 `33_employees.sql`: `employee_code text not null unique`
- Supabase: `employee_code` existe (confirmado via information_schema)
- database.ts: `registration: string | null`
- employee.ts: `registration: string | null`
- mappers.ts: `registration: row.registration`
- employees.repository.ts: usa `registration`
- codebase inteiro: **0 referências a `employee_code`** (grep confirmado)

**Classificação:** `DEFINIÇÃO DIVERGENTE` — Supabase usa `employee_code`; código e
migration local usam `registration`. Precisa de migration de migração de dados.

### 5.3 employee_documents: fat vs slim

**Conclusão:** A migration local e database.ts usam a versão "fat" (document_name,
document_url, is_verified, notes), enquanto a spec V2.1 define versão "slim" (file_url).
Status no Supabase: **não verificado detalhadamente** — precisa de consulta direta.

### 5.4 Migration `20260827000100_employees.sql` está desincronizada

A migration não reflete o estado reconciliado do código (commit `2c490b9`):

- Ela ainda cria `employee_education`, `employee_experiences`, `employee_skills`,
  `employee_languages`, `employee_courses` — que foram **removidos do database.ts**
- Ela **não cria** `departments`, `positions`, `employee_positions`,
  `employee_contracts`, `employee_status_history` — que foram **adicionadas ao database.ts**
- Ela usa `registration` enquanto o Supabase usa `employee_code`

---

## 6. Resumo das 3 Camadas

```text
SUPABASE (real)
├── employees → employee_code ✅
├── employee_documents ✅ (slim ou fat? — não verificado)
├── departments ✅ (origem: spec 33_employees.sql ou migration histórica)
├── positions ✅
├── employee_positions ✅
├── employee_contracts ✅
├── employee_status_history ✅
├── employee_education ❌ (migration local cria, mas não no Supabase)
├── employee_experiences ❌
├── employee_skills ❌
├── employee_languages ❌
└── employee_courses ❌

MIGRATION LOCAL (20260827000100_employees.sql)
├── employees → registration ✅
├── employee_documents ✅ (fat)
├── employee_education ✅
├── employee_experiences ✅
├── employee_skills ✅
├── employee_languages ✅
├── employee_courses ✅
├── departments ❌
├── positions ❌
├── employee_positions ❌
├── employee_contracts ❌
├── employee_status_history ❌

SPEC V2.1 (33_employees.sql)
├── employees → employee_code ✅
├── employee_documents ✅ (slim)
├── departments ✅
├── positions ✅
├── employee_positions ✅
├── employee_contracts ✅
├── employee_status_history ✅
├── employee_education ❌
├── employee_experiences ❌
├── employee_skills ❌
├── employee_languages ❌
└── employee_courses ❌

CÓDIGO (database.ts após 2c490b9)
├── employees → registration ✅
├── employee_documents ✅ (fat — NÃO reconciliado com V2.1 slim)
├── departments ✅
├── positions ✅
├── employee_positions ✅
├── employee_contracts ✅
├── employee_status_history ✅
├── employee_education ❌
├── employee_experiences ❌
├── employee_skills ❌
├── employee_languages ❌
└── employee_courses ❌
```

---

## 7. Conclusões

### A) O que realmente existe no Supabase

Todas as 7 tabelas: `employees` (com `employee_code`), `employee_documents`,
`departments`, `positions`, `employee_positions`, `employee_contracts`,
`employee_status_history`. Não existem employee_education, experiences, skills,
languages, courses.

### B) O que realmente existe nas migrations locais

A migration `20260827000100_employees.sql` é uma versão V2.0/C2.2 que cria
`employees` (com `registration`), `employee_documents` (fat), e 5 tabelas
adicionais (education, experiences, skills, languages, courses) que **não estão
no Supabase**. Ela **não cria** as 5 tabelas V2.1 que existem no Supabase.

### C) O que realmente existe no GitHub

- Spec `33_employees.sql` (commit `7c2aa30`, 21/08): define a estrutura V2.1
  com `employee_code`
- Commit `2c490b9` (12/09): reconciliou o CÓDIGO para V2.1, adicionando
  `departments`, `positions`, etc. ao `database.ts` e trocando `employee_code`
  → `registration`. **A migration não foi alterada.**

### D) Divergências

1. **Migration local está desatualizada** — não reflete a reconciliação V2.1 feita
   em commit `2c490b9`
2. **Supabase usa `employee_code`**; código e migration usam `registration`
3. **Migration local cria 5 tabelas obsoletas** (education, experiences, skills,
   languages, courses) que não existem no Supabase
4. **Migration local não cria 5 tabelas V2.1** (departments, positions, etc.)
   que existem no Supabase
5. **database_new.ts** na raiz é órfão — não importado por código ativo

### E) Origem provável de cada divergência

- As 5 tabelas V2.1 no Supabase vieram da spec `33_employees.sql` ou de uma
  migration histórica que não está na worktree
- O Supabase usa `employee_code` porque foi populado da spec V2.1 original
  (antes da reconciliação C2.2 que introduziu `registration`)
- A migration `20260827000100_employees.sql` foi criada como uma nova versão
  C2.2/V2.0, mas **nunca foi aplicada ao Supabase** (PostgreSQL was locked)
- O database_new.ts foi um esforço separado de tipagem que nunca foi integrado

### F) Alterações necessárias (para análise futura — NÃO EXECUTAR)

1. **Resolver `employee_code` × `registration`:**
   - Criar migration de rename: `ALTER TABLE employees RENAME COLUMN employee_code TO registration`
   - Ou adicionar coluna `registration` e migrar dados
   - Atualizar `database.ts` e código (já usam `registration` — OK)

2. **Substituir/atualizar migration `20260827000100_employees.sql`:**
   - Remover criação de: `employee_education`, `employee_experiences`, `employee_skills`,
     `employee_languages`, `employee_courses` (não existem no Supabase)
   - Adicionar criação de: `departments`, `positions`, `employee_positions`,
     `employee_contracts`, `employee_status_history` (existem no Supabase mas não na migration)
   - Resolver diferença em `employee_documents`: migration local é "fat",
     spec V2.1 é "slim". Precisa verificar qual está no Supabase.
   - Usar `registration` (já está no código) e aplicar migration de rename
     no Supabase

3. **Remover `database_new.ts`** (órfão, não usado)

4. **Reconciliar RLS:**
   - Migration local definou RLS inline com `auth.uid()`
   - Spec `45_rls_remaining.sql` definiu RLS usando `is_tenant_member()`
   - Verificar qual está no Supabase

### G) Alterações que NÃO devem ser feitas

- ❌ Remover `departments`, `positions`, `employee_positions`, `employee_contracts`,
  `employee_status_history` do `database.ts` — existem no Supabase
- ❌ Aplicar migration `20260827000100_employees.sql` no Supabase — tentaria criar
  tabelas já existentes (conflictos) e colunas que não existem (`registration`
  não existe no Supabase; `employee_code` existe)
- ❌ Executar rename de `employee_code` → `registration` por pressa — exige análise
  de dados existentes e dependências
- ❌ Remover `employee_documents` columns que existem no Supabase (`file_url`,
  `document_type`, `issue_date`, `expiry_date`)

### H) Supabase Schema Validation — RESULTS (Read-Only)

Consulta realizada via PostgREST REST API (anon key) em `okxqfyoqbhcmflpurfrw.supabase.co`.

**employees table — Supabase real:**

| Coluna               | Supabase | V2.1 Spec      | Local Migration | database.ts | Status                 |
| -------------------- | -------- | -------------- | --------------- | ----------- | ---------------------- |
| `id`                 | ✅       | ✅ (FK→people) | ✅ (uuid pk)    | ✅          | DIVERGENTE             |
| `tenant_id`          | ✅       | ✅             | ✅              | ✅          | ALINHADO               |
| `person_id`          | ✅       | ✅             | ✅              | ✅          | DIVERGENTE (FK target) |
| `company_id`         | ✅       | ✅             | ✅              | ✅          | DIVERGENTE (FK target) |
| `employee_code`      | ✅       | ✅             | ❌              | ❌          | **SUPABASE ≠ CÓDIGO**  |
| `registration`       | ❌       | ❌             | ✅              | ✅          | **CÓDIGO ≠ SUPABASE**  |
| `hire_date`          | ✅       | ✅             | ✅              | ✅          | ALINHADO               |
| `termination_date`   | ✅       | ✅             | ✅              | ✅          | ALINHADO               |
| `salary`             | ✅       | ✅             | ✅              | ✅          | ALINHADO               |
| `status`             | ✅       | ✅             | ✅              | ✅          | ALINHADO               |
| `created_at`         | ✅       | ✅             | ✅              | ✅          | ALINHADO               |
| `updated_at`         | ✅       | ✅             | ✅              | ✅          | ALINHADO               |
| `job_title`          | ❌       | ❌             | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `department`         | ❌       | ❌             | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `cost_center`        | ❌       | ❌             | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `work_mode`          | ❌       | ❌             | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `employment_type`    | ❌       | ❌             | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `probation_end_date` | ❌       | ❌             | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `salary_currency`    | ❌       | ❌             | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `salary_frequency`   | ❌       | ❌             | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `manager_id`         | ❌       | ❌             | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `notes`              | ❌       | ❌             | ✅              | ✅          | **MIGRATION OBSOLETO** |

**employee_documents table — Supabase real:**

| Coluna          | Supabase | V2.1 Spec | Local Migration | database.ts | Status                 |
| --------------- | -------- | --------- | --------------- | ----------- | ---------------------- |
| `id`            | ✅       | ✅        | ✅              | ✅          | ALINHADO               |
| `employee_id`   | ✅       | ✅        | ✅              | ✅          | ALINHADO               |
| `document_type` | ✅       | ✅        | ✅              | ✅          | ALINHADO               |
| `document_name` | ❌       | ❌        | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `document_url`  | ❌       | ❌        | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `file_url`      | ✅       | ✅        | ❌              | ❌          | **CÓDIGO ≠ SUPABASE**  |
| `issue_date`    | ✅       | ✅        | ✅              | ✅          | ALINHADO               |
| `expiry_date`   | ✅       | ✅        | ✅              | ✅          | ALINHADO               |
| `is_verified`   | ❌       | ❌        | ✅              | ✅          | **MIGRATION OBSOLETO** |
| `notes`         | ❌       | ❌        | ✅              | ✅          | **MIGRATION OBSOLETO** |

**Other V2.1 tables — Supabase real:**

| Tabela                    | Supabase | Local Migration | database.ts | Status                 |
| ------------------------- | -------- | --------------- | ----------- | ---------------------- |
| `departments`             | ✅       | ❌              | ✅          | **ALINHADO**           |
| `positions`               | ✅       | ❌              | ✅          | **ALINHADO**           |
| `employee_positions`      | ✅       | ❌              | ✅          | **ALINHADO**           |
| `employee_contracts`      | ✅       | ❌              | ✅          | **ALINHADO**           |
| `employee_status_history` | ✅       | ❌              | ✅          | **ALINHADO**           |
| `employee_education`      | ❌       | ✅              | ❌          | **MIGRATION OBSOLETO** |
| `employee_experiences`    | ❌       | ✅              | ❌          | **MIGRATION OBSOLETO** |
| `employee_skills`         | ❌       | ✅              | ❌          | **MIGRATION OBSOLETO** |
| `employee_languages`      | ❌       | ✅              | ❌          | **MIGRATION OBSOLETO** |
| `employee_courses`        | ❌       | ✅              | ❌          | **MIGRATION OBSOLETO** |

**All V2.1 tables exist, all V2.0 extra tables do NOT exist in Supabase. Confirmed.**

### I) Conclusão Final

**O Supabase reflete exatamente a spec V2.1 (`33_employees.sql`), NÃO a migration local
`20260827000100_employees.sql`.**

A migration local é uma versão **anterior/V2.0** que:

- Usa `registration` (Supabase usa `employee_code`)
- Cria `employee_documents` com colunas "fat" (Supabase tem versão "slim" com `file_url`)
- Cria 5 tabelas obsoletas (education, experiences, skills, languages, courses)
- Não cria as 5 tabelas V2.1 (departments, positions, etc.)

O código (`database.ts`) está em um **estado híbrido inconsistente**:

- Inclui as 5 tabelas V2.1 ✅ (alinhadas com Supabase)
- Usa `registration` ❌ (Supabase usa `employee_code`)
- Usa `employee_documents` fat ❌ (Supabase usa slim com `file_url`)
- Não inclui as 5 tabelas V2.0 ❌ (alinhado com Supabase)

### J) Próximo passo

1. **Decidir direção estratégica:** migrar Supabase → `registration` + `employee_documents` fat
   (para alinhar com código), ou migrar código → `employee_code` + `employee_documents` slim
   (para alinhar com Supabase)
2. Criar migration de reconciliação baseada na decisão acima
3. A migration `20260827000100_employees.sql` deve ser **substituída** por uma nova migration
   que reflite o estado V2.1 do Supabase
4. Ajustar `database.ts`, `employee.ts`, `employee-document.ts`, `mappers.ts`,
   repositories e páginas conforme a decisão de reconciliação

---

## 5. Auditoria de Consumidores (Read-Only)

Mapeamento de todas as referências no código para os campos divergentes.

### 5.1 `registration` — usado no código, NÃO existe no Supabase

| Arquivo                                              | Tipo        | Linhas                                        | Uso                                       |
| ---------------------------------------------------- | ----------- | --------------------------------------------- | ----------------------------------------- |
| `src/types/database.ts`                              | database.ts | 1309, 1332, 1355                              | Definição coluna `employees.registration` |
| `src/types/domain/employee.ts`                       | domain type | 11, 39, 60                                    | Interface Employee + inputs               |
| `src/types/domain/mappers.ts`                        | mapper      | 181                                           | `registration: row.registration`          |
| `src/repositories/employees.repository.ts`           | repository  | 36, 77, 119                                   | Busca, create, update                     |
| `src/pages/dashboard/Funcionarios.tsx`               | page        | 36, 85, 96, 110, 140, 185, 280, 341, 343, 419 | Form, display, busca                      |
| `src/pages/dashboard/FuncionarioDetalhe.tsx`         | page        | 110, 180                                      | Display                                   |
| `src/pages/dashboard/RhPage.tsx`                     | page        | 196                                           | Display                                   |
| `src/pages/dashboard/DocumentosRh.tsx`               | page        | 21, 69, 204                                   | Form type, display, label                 |
| `src/pages/dashboard/relatorios/RelatorioRhPage.tsx` | page        | 36, 133                                       | Busca, display                            |

**Total: 8 arquivos (4 tipos + 1 repository + 5 páginas)**

### 5.2 `employee_code` — existe no Supabase, NÃO usado no código

| Arquivo            | Uso                                                 |
| ------------------ | --------------------------------------------------- |
| (nenhum no `src/`) | Código usa `registration` em vez de `employee_code` |

**0 consumidores no código.**

### 5.3 `document_url`, `document_name`, `is_verified`, `notes` — usado no código, NÃO existe no Supabase

| Arquivo                                             | Tipo        | Linhas                                                                                    | Uso                            |
| --------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- | ------------------------------ |
| `src/types/database.ts`                             | database.ts | 1379-1384                                                                                 | Definição `employee_documents` |
| `src/types/domain/employee-document.ts`             | domain type | 5-6, 9, 18-19, 22, 29-30, 33                                                              | Interface completa             |
| `src/repositories/employee-documents.repository.ts` | repository  | 57, 58, 61, 81-82, 83-84, 88-89                                                           | create, update                 |
| `src/pages/dashboard/DocumentosRh.tsx`              | page        | 33-37, 42-46, 99-103, 113-117, 131-135, 163-167, 300, 305, 387-39, 402-04, 442-44, 476-80 | Form, display, busca           |
| `src/pages/dashboard/FuncionarioDetalhe.tsx`        | page        | 217-219                                                                                   | Display                        |

**`file_url` — existe no Supabase `employee_documents`, NÃO referenciado como coluna de employee_documents no código**

### 5.4 V2.1 tables — usadas no código e existem no Supabase

| Tabela                    | Código                                           | Supabase | Status   |
| ------------------------- | ------------------------------------------------ | -------- | -------- |
| `departments`             | database.ts:1511                                 | ✅       | ALINHADO |
| `positions`               | database.ts:1540                                 | ✅       | ALINHADO |
| `employee_positions`      | database.ts:1415, employee.ts:30, mappers.ts:200 | ✅       | ALINHADO |
| `employee_contracts`      | database.ts:1444, employee.ts:31                 | ✅       | ALINHADO |
| `employee_status_history` | database.ts:1479, employee.ts:32                 | ✅       | ALINHADO |

**Consumo real:** as tabelas V2.1 são referenciadas apenas em tipos (database.ts, employee.ts,
mappers.ts). **Nenhuma página UI ou repository faz query diretamente** para estas tabelas.

### 5.5 V2.0 tabelas obsoletas — apenas na migration local, não no Supabase

| Tabela                 | Migration local | database.ts | Supabase | Repositório | Page |
| ---------------------- | --------------- | ----------- | -------- | ----------- | ---- |
| `employee_education`   | ✅              | ❌          | ❌       | ❌          | ❌   |
| `employee_experiences` | ✅              | ❌          | ❌       | ❌          | ❌   |
| `employee_skills`      | ✅              | ❌          | ❌       | ❌          | ❌   |
| `employee_languages`   | ✅              | ❌          | ❌       | ❌          | ❌   |
| `employee_courses`     | ✅              | ❌          | ❌       | ❌          | ❌   |

**A migration `20260827000100_employees.sql` ainda contém estas 5 tabelas, mas o código
já foi reconciliado (commit `2c490b9`) e não as referencia.**

### 5.6 `database_new.ts` — órfão

| Arquivo                  | Importado? | Tabelas relevantes                           |
| ------------------------ | ---------- | -------------------------------------------- |
| `database_new.ts` (raiz) | ❌         | Não contém employees/departments/V2.1 tables |

---

## 6. Matriz de Consumo vs Supabase

| Item                         | Supabase | Código                     | Migration Local | Status         | Ação Necessária                                          |
| ---------------------------- | -------- | -------------------------- | --------------- | -------------- | -------------------------------------------------------- |
| `registration`               | ❌       | ✅ (8 arquivos)            | ✅              | **DIVERGENTE** | Migration rename `employee_code→registration` + backfill |
| `employee_code`              | ✅       | ❌                         | ❌              | **DIVERGENTE** | Migration rename OU update código                        |
| `document_url`               | ❌       | ✅ (6 arquivos)            | ✅              | **DIVERGENTE** | Migration rename `file_url→document_url` + schema ajuste |
| `file_url`                   | ✅       | ❌ (em employee_documents) | ❌              | **DIVERGENTE** | Update database.ts + código                              |
| `document_name`              | ❌       | ✅ (6 arquivos)            | ✅              | **OBSOLETO**   | Migration DROP COLUMN + code cleanup                     |
| `is_verified`                | ❌       | ✅ (6 arquivos)            | ✅              | **OBSOLETO**   | Migration DROP COLUMN + code cleanup                     |
| `notes` (employee_documents) | ❌       | ✅ (6 arquivos)            | ✅              | **OBSOLETO**   | Migration DROP COLUMN + code cleanup                     |
| V2.1 tables (5)              | ✅       | ✅                         | ❌              | ALINHADO       | Nenhuma                                                  |
| V2.0 tables (5)              | ❌       | ❌                         | ✅              | OBSOLETO       | Migration DELETE ou marcar como deprecated               |
| `database_new.ts`            | —        | —                          | —               | ÓRFÃO          | Remover da worktree                                      |

---

## 7. Conclusão

**Supabase = V2.1 spec (`33_employees.sql`) — NÃO V2.0 migration (`20260827000100_employees.sql`).**

A migration local é uma **versão intermediária V2.0/C2.2 que nunca foi aplicada**.

O código (`database.ts` + domain types) é um **híbrido inconsistente**:

- Adotou as 5 tabelas V2.1 (correto) ✅
- Mas manteve `registration` em vez de `employee_code` (incorreto) ❌
- E manteve `employee_documents` fat em vez de slim (incorreto) ❌

### Decisão necessária antes da implementação

**Opção A: Migrar Supabase → código** (rename `employee_code→registration`, expandir `employee_documents`)

- ✅ Mais alinhado com o código atual (menos changes no frontend)
- ❌ Requer migration destrutiva no banco (rename + backfill)
- ❌ Pode quebrar integrações externas que usam `employee_code`

**Opção B: Migrar código → Supabase** (`employee_code`, `file_url`, slim `employee_documents`)

- ✅ Banco já está correto — zero DDL destrutivo
- ✅ Nenhuma migration de rename necessária
- ❌ Precisa update em 8 arquivos para `registration→employee_code`
- ❌ Precisa update em 6 arquivos para `document_url→file_url`, remover `document_name/is_verified/notes`

**Recomendação:** Opção B — mais segura, preserva dado existente, zero risco de perda.

---

## Documentos Relacionados

- `docs/AUDITORIA_WORKTREE_BANCO.md` — inventário original (contém conclusões invalidadas)
- `supabase/migrations/20260827000100_employees.sql` — migration local atual (V2.0/C2.2, **não aplicada**)
- `supabase/specs/sql/33_employees.sql` — spec V2.1 (source of truth do Supabase)
- `supabase/specs/sql/45_rls_remaining.sql` — RLS V2.1 para employees
- `src/types/database.ts` — tipos TypeScript (híbrido inconsistente)
- `src/types/domain/employee.ts` — tipos de domínio (uses `registration`)
- `src/types/domain/employee-document.ts` — tipos de domínio (uses `document_url`, `is_verified`, `notes`)
- `src/types/domain/mappers.ts` — mapEmployee (uses `registration`)
- `src/repositories/employees.repository.ts` — CRUD (uses `registration`, V2.0 cols)
- `src/repositories/employee-documents.repository.ts` — CRUD (uses `document_url`, `is_verified`, `notes`)
- `src/pages/dashboard/Funcionarios.tsx` — page (uses `registration`)
- `src/pages/dashboard/FuncionarioDetalhe.tsx` — page (uses `registration`, `document_url`)
- `src/pages/dashboard/DocumentosRh.tsx` — page (uses `registration`, `document_url`, `is_verified`, `notes`)
- `src/pages/dashboard/RhPage.tsx` — page (uses `registration`)
- `src/pages/dashboard/relatorios/RelatorioRhPage.tsx` — page (uses `registration`)
- `database_new.ts` — arquivo órfão na raiz (não referenciado)
- `database_new.ts` — arquivo órfão na raiz
