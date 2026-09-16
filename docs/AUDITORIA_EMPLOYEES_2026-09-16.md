# AUDITORIA READ-ONLY — Employees × Supabase Real

**Data:** 2026-09-16
**Projeto:** okxqfyoqbhcmflpurfrw
**Método:** READ-ONLY — nenhuma migration aplicada, nenhum arquivo alterado, nenhum dado modificado
**Branch:** main
**HEAD:** 05672b4 (checkpoint 0 fechado)

---

## 1. ESTADO DAS TABELAS (probe via PostgREST anon key)

| Tabela                    | Status       | Count | Observação             |
| ------------------------- | ------------ | ----- | ---------------------- |
| `employees`               | ✅ Existe    | 0     | Acessível publicamente |
| `employee_documents`      | ✅ Existe    | 0     | Acessível publicamente |
| `departments`             | ✅ Existe    | 0     | Acessível publicamente |
| `positions`               | ✅ Existe    | 0     | Acessível publicamente |
| `employee_positions`      | ✅ Existe    | 0     | Acessível publicamente |
| `employee_contracts`      | ✅ Existe    | 0     | Acessível publicamente |
| `employee_status_history` | ✅ Existe    | 0     | Acessível publicamente |
| `employee_education`      | ✅ Existe    | 0     | Acessível publicamente |
| `employee_experiences`    | ✅ Existe    | 0     | Acessível publicamente |
| `employee_skills`         | ✅ Existe    | 0     | Acessível publicamente |
| `employee_languages`      | ✅ Existe    | 0     | Acessível publicamente |
| `employee_courses`        | ✅ Existe    | 0     | Acessível publicamente |
| `permissions`             | ✅ Existe    | 230   | Acessível publicamente |
| `tenants`                 | ✅ Existe    | 0     | Acessível publicamente |
| `jobs`                    | ✅ Existe    | 19    | Acessível publicamente |
| `companies`               | ✅ Existe    | 10    | Acessível publicamente |
| `company_relationships`   | ✅ Existe    | 0     | Acessível publicamente |
| `role_assignments`        | ❌ Bloqueado | —     | RLS nega acesso anon   |
| `roles`                   | ❌ Bloqueado | —     | RLS nega acesso anon   |
| `role_permissions`        | ❌ Bloqueado | —     | RLS nega acesso anon   |
| `tenant_memberships`      | ❌ Bloqueado | —     | RLS nega acesso anon   |
| `people`                  | ❌ Bloqueado | —     | RLS nega acesso anon   |
| `first_login_state`       | ❌ Bloqueado | —     | RLS nega acesso anon   |
| `candidates`              | ❌ Bloqueado | —     | RLS nega acesso anon   |
| `applications`            | ❌ Bloqueado | —     | RLS nega acesso anon   |
| `domain_events`           | ❌ Bloqueado | —     | RLS nega acesso anon   |

---

## 2. COLUNAS DE `employees` (probe individual)

### Existentes no Supabase real

```
id, tenant_id, employee_code, hire_date, termination_date, salary, status, created_at, updated_at
```

### Ausentes no Supabase real

```
person_id, company_id, registration, job_title, department, cost_center,
work_mode, employment_type, probation_end_date, salary_currency,
salary_frequency, manager_id, notes
```

---

## 3. COLUNAS DE `employee_documents` (probe individual)

### Existentes no Supabase real

```
id, employee_id, document_type, file_url, issue_date, expiry_date, created_at, updated_at
```

### Ausentes no Supabase real

```
document_name, document_url, is_verified, notes
```

---

## 4. CONFLITO CRÍTICO — Código × Supabase

O commit `05672b4` (checkpoint 0) contém código que usa colunas que **não existem no Supabase real**:

| Arquivo                                              | Coluna usada                                                                                                                                                                                            | Existe no Supabase? |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `src/types/database.ts`                              | `registration`, `person_id`, `company_id`, `job_title`, `department`, `cost_center`, `work_mode`, `employment_type`, `probation_end_date`, `salary_currency`, `salary_frequency`, `manager_id`, `notes` | ❌ NÃO              |
| `src/types/domain/employee.ts`                       | `registration`, `person_id`, `company_id`, etc.                                                                                                                                                         | ❌ NÃO              |
| `src/types/domain/mappers.ts`                        | `registration: row.registration`                                                                                                                                                                        | ❌ NÃO              |
| `src/repositories/employees.repository.ts`           | `.ilike.registration`, `payload.registration`                                                                                                                                                           | ❌ NÃO              |
| `src/pages/dashboard/Funcionarios.tsx`               | Form field `registration`                                                                                                                                                                               | ❌ NÃO              |
| `src/pages/dashboard/FuncionarioDetalhe.tsx`         | Display `registration`                                                                                                                                                                                  | ❌ NÃO              |
| `src/pages/dashboard/DocumentosRh.tsx`               | `document_name`, `is_verified`, `notes`                                                                                                                                                                 | ❌ NÃO              |
| `src/pages/dashboard/RhPage.tsx`                     | Display `registration`                                                                                                                                                                                  | ❌ NÃO              |
| `src/pages/dashboard/relatorios/RelatorioRhPage.tsx` | Busca `registration`                                                                                                                                                                                    | ❌ NÃO              |

**Qualquer query de employees ou employee_documents falhará com HTTP 400 no Supabase real.**

---

## 5. MIGRATIONS PENDENTES (não aplicadas)

| Migration                                               | Objetivo                                                   | Status          |
| ------------------------------------------------------- | ---------------------------------------------------------- | --------------- |
| `20260909000000_fix_user_has_permission_expires_at.sql` | Remover `expires_at` de `user_has_permission()`            | ❌ Não aplicada |
| `20260909000001_fix_bootstrap_candidate_role_name.sql`  | Corrigir role name `candidate` → `candidato`               | ❌ Não aplicada |
| `20260910000002_unify_first_login_state.sql`            | Unificar `must_change_password`, adicionar `signup_origin` | ❌ Não aplicada |

---

## 6. CONCLUSÃO

O Supabase real está em **V2.1** (`employee_code`, `employee_documents` slim com `file_url`).
O código está em **V2.0** (`registration`, `employee_documents` fat com `document_name`/`is_verified`/`notes`).

A direção correta de reconciliação é **Opção B: Código → Supabase** (já aprovada em `docs/EMPLOYEES_CODE_RECONCILIATION_PLAN.md`).

**Próximo passo:** Plano de migração de código, sem tocar no banco.

---

**Relatório gerado em READ-ONLY. Nenhuma alteração foi feita.**
