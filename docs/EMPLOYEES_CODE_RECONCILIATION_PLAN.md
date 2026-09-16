# EMPLOYEES CODE RECONCILIATION PLAN

> **BASEADO EM:** `docs/RECONCILIACAO_EMPLOYEES_READONLY.md`
>
> **SUPABASE = SOURCE OF TRUTH.** Código deve ser adaptado ao Supabase real.
> **STATUS:** 🔒 READ-ONLY — Nenhuma alteração executada. Aguardando autorização.

---

## 1. Estratégia Aprovada

**Opção B: Código → Supabase** (adaptar código ao banco real, zero DDL destrutivo)

| Direção              | Supabase          | Código                                                                     |
| -------------------- | ----------------- | -------------------------------------------------------------------------- |
| `employees`          | `employee_code`   | → migrar de `registration`                                                 |
| `employee_documents` | `file_url` (slim) | → migrar de `document_url` + remover `document_name`/`is_verified`/`notes` |
| V2.1 tables (5)      | ✅ existem        | ✅ já no database.ts                                                       |
| V2.0 tables (5)      | ❌ não existem    | ❌ já removidas do database.ts                                             |

---

## 2. Classificação dos Campos de `employee_documents`

### V2.1 Spec (`33_employees.sql`) — `employee_documents`:

```sql
id          uuid PK
employee_id uuid FK → employees
document_type
file_url
issue_date
expiry_date
created_at, updated_at
```

### V2.0 Migration (`/20260827000100_employees.sql`) — `employee_documents` (FAT):

```sql
id          uuid PK
employee_id uuid FK → employees
document_type
document_name   ← V2.1 não tem
document_url    ← V2.1 substitui por file_url
issue_date
expiry_date
is_verified     ← V2.1 não tem
notes           ← V2.1 não tem
created_at, updated_at
```

### Classificação de consumidores

| Campo           | Supabase | Code | Tipo                                  | Ação         | Risco | Teste                               |
| --------------- | -------- | ---- | ------------------------------------- | ------------ | ----- | ----------------------------------- |
| `document_url`  | ❌       | ✅   | A — substituir por equivalente físico | `→ file_url` | Baixo | Verificar link funciona             |
| `document_name` | ❌       | ✅   | C — legado sem contrato físico        | **Remover**  | Médio | Verificar se usado em busca/display |
| `is_verified`   | ❌       | ✅   | C — legado sem contrato físico        | **Remover**  | Médio | Verificar se usado em validação     |
| `notes` (docs)  | ❌       | ✅   | C — legado sem contrato físico        | **Remover**  | Médio | Verificar se usado em display       |

### Análise detalhada

#### A. `document_url` → `file_url`

- **Supabase:** `file_url` existe ✅
- **Código:** `document_url` usado em 6 arquivos
- **Classificação:** Tipo A — substituição direta
- **Ação:** Rename `document_url → file_url` em todos os consumidores

#### B. `document_name`

- **Supabase:** Não existe ❌
- **Código:** Usado como label de display e filtro de busca
- **Classificação:** Tipo C — legado
- **Ação:** Remover do contrato. O display pode usar `document_type` como fallback
- **Consumidores:** `DocumentosRh.tsx:195` (busca), `DocumentosRh.tsx:99,477` (form state)

#### C. `is_verified`

- **Supabase:** Não existe ❌
- **Código:** Checkbox em formulário de documentos
- **Classificação:** Tipo C — legado
- **Ação:** Remover do contrato e da UI
- **Consumidores:** `DocumentosRh.tsx` — form state, checkbox, display

#### D. `notes` (employee_documents.notes)

- **Supabase:** Não existe ❌
- **Código:** Textarea em formulário de documentos
- **Classificação:** Tipo C — legado
- **Ação:** Remover do contrato e da UI
- **Consumidores:** `DocumentosRh.tsx` — form state, textarea

---

## 3. Mapa de Consumidores — `registration → employee_code`

| #   | Arquivo                                              | Linhas                                        | Uso atual                                                                         | Alteração                          |
| --- | ---------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | `src/types/database.ts`                              | 1309, 1332, 1355                              | `registration: string \| null`                                                    | `employee_code: string \| null`    |
| 2   | `src/types/domain/employee.ts`                       | 11, 39, 60                                    | `registration: string \| null`                                                    | `employee_code: string \| null`    |
| 3   | `src/types/domain/mappers.ts`                        | 181                                           | `registration: row.registration`                                                  | `employee_code: row.employee_code` |
| 4   | `src/repositories/employees.repository.ts`           | 36, 77, 119                                   | `.ilike.registration`, `registration: input.registration`, `payload.registration` | `employee_code`                    |
| 5   | `src/pages/dashboard/Funcionarios.tsx`               | 36, 85, 96, 110, 140, 185, 280, 341, 343, 419 | Form field, display, busca                                                        | `employee_code`                    |
| 6   | `src/pages/dashboard/FuncionarioDetalhe.tsx`         | 110, 180                                      | Display "Matrícula"                                                               | `employee_code`                    |
| 7   | `src/pages/dashboard/RhPage.tsx`                     | 196                                           | Display                                                                           | `employee_code`                    |
| 8   | `src/pages/dashboard/DocumentosRh.tsx`               | 21, 69, 204                                   | Form type, label function                                                         | `employee_code`                    |
| 9   | `src/pages/dashboard/relatorios/RelatorioRhPage.tsx` | 36, 133                                       | Busca, display                                                                    | `employee_code`                    |

**Total: 9 arquivos para alteração de `registration → employee_code`**

---

## 4. Mapa de Consumidores — `document_url → file_url` e remoção de campos

| #   | Arquivo                                             | Linhas                                                                    | Alteração                                                                  |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | `src/types/database.ts`                             | 1379-1384                                                                 | Remover `document_name`, `document_url`; manter `file_url`                 |
| 2   | `src/types/domain/employee-document.ts`             | 5-6, 9, 18-19, 22, 29-30, 33                                              | `document_url → file_url`; remover `document_name`, `is_verified`, `notes` |
| 3   | `src/repositories/employee-documents.repository.ts` | 57-62, 81-89                                                              | `document_url → file_url`; remover `document_name`, `is_verified`, `notes` |
| 4   | `src/pages/dashboard/DocumentosRh.tsx`              | 33-46, 99-117, 131-135, 163-167, 195, 300, 305, 387-404, 442-444, 476-480 | `document_url → file_url`; remover campos inexistentes                     |
| 5   | `src/pages/dashboard/FuncionarioDetalhe.tsx`        | 217-219                                                                   | `document_url → doc.file_url`                                              |

**Total: 5 arquivos para alteração de documentos**

---

## 5. Mapa de Consumidores — Remoção de V2.0 columns de `employees`

O código atual faz insert/update com colunas que NÃO existem no Supabase:

| Coluna V2.0          | database.ts | employee.ts | repository        | Páginas | Ação    |
| -------------------- | ----------- | ----------- | ----------------- | ------- | ------- |
| `job_title`          | ✅          | ✅          | ✅ (line 87, 132) | ✅      | Remover |
| `department`         | ✅          | ✅          | ✅ (line 88, 133) | ✅      | Remover |
| `cost_center`        | ✅          | ✅          | ✅ (line 89, 134) | ✅      | Remover |
| `work_mode`          | ✅          | ✅          | ✅ (line 82, 127) | ✅      | Remover |
| `employment_type`    | ✅          | ✅          | ✅ (line 81, 125) | ✅      | Remover |
| `probation_end_date` | ✅          | ✅          | ✅ (line 80, 123) | ✅      | Remover |
| `salary_currency`    | ✅          | ✅          | ✅ (line 84, 129) | ✅      | Remover |
| `salary_frequency`   | ✅          | ✅          | ✅ (line 85, 130) | ✅      | Remover |
| `manager_id`         | ✅          | ✅          | ✅ (line 86, 131) | ✅      | Remover |
| `notes`              | ✅          | ✅          | ✅ (line 90, 135) | ✅      | Remover |

**Ação:** Remover estas 10 colunas das interfaces, mapper, repository, types, e páginas.

---

## 6. Plano de Implementação (Sequência Recomendada)

### Fase A: database.ts + domain types (types only)

1. `database.ts`
   - employees: `registration → employee_code`
   - employees: remover `job_title`, `department`, `cost_center`, `work_mode`, `employment_type`, `probation_end_date`, `salary_currency`, `salary_frequency`, `manager_id`, `notes`
   - employee_documents: `document_url → file_url`, remover `document_name`, `is_verified`, `notes`
   - V2.1 tables: mantidas (já corretas)

2. `employee.ts`
   - `registration → employee_code`
   - Remover 10 V2.0 columns

3. `employee-document.ts`
   - `document_url → file_url`
   - Remover `document_name`, `is_verified`, `notes`

4. `mappers.ts`
   - `registration → employee_code`
   - Remover 10 V2.0 colunas do mapEmployee

### Fase B: repositories

5. `employees.repository.ts`
   - Search: `registration.ilike → employee_code.ilike`
   - Create: `registration → employee_code`, remover 10 V2.0 cols
   - Update: `registration → employee_code`, remover 10 V2.0 cols

6. `employee-documents.repository.ts`
   - `document_url → file_url`
   - Remover `document_name`, `is_verified`, `notes`

### Fase C: páginas

7. `Funcionarios.tsx`
   - Form field, display, busca: `registration → employee_code`
   - Remover inputs para V2.0 cols

8. `FuncionarioDetalhe.tsx`
   - Display: `registration → employee_code`
   - `document_url → doc.file_url`

9. `RhPage.tsx`
   - Display: `registration → employee_code`

10. `DocumentosRh.tsx`
    - Form: `document_url → file_url`, remover `document_name`, `is_verified`, `notes`
    - Display: `document_url → file_url`
    - Search: remover `document_name` filter, usar `document_type`
    - Label: `registration → employee_code`

11. `RelatorioRhPage.tsx`
    - Busca e display: `registration → employee_code`

### Fase D: migration local

12. Marcar `20260827000100_employees.sql` como **deprecated** (não aplicar)
    - Criar nova migration `20260915000000_employees_v21_rebase.sql` com:
      - Spec V2.1 (`33_employees.sql` + `45_rls_remaining.sql`)
      - Migration `employee_code → registration` já aplicada (Supabase já tem `employee_code`, não precisa de rename)

### Fase E: database_new.ts

13. Remover `database_new.ts` (órfão, não importado)

---

## 7. Validação Pós-Implementação

| Check                | Comando                        | Expectativa                           |
| -------------------- | ------------------------------ | ------------------------------------- |
| Typecheck            | `npm run typecheck`            | 0 errors                              |
| Build                | `npm run build`                | SUCCESS                               |
| Tests                | `npm test`                     | 50 passed / 1 skipped                 |
| Lint                 | `npm run lint`                 | 0 warnings críticos                   |
| Grep `registration`  | `grep -r "registration" src/`  | 0 matches (exceto state_registration) |
| Grep `employee_code` | `grep -r "employee_code" src/` | >0 matches (code now uses it)         |
| Grep `document_url`  | `grep -r "document_url" src/`  | 0 matches                             |
| Grep `document_name` | `grep -r "document_name" src/` | 0 matches                             |
| Grep `is_verified`   | `grep -r "is_verified" src/`   | 0 matches                             |

---

## 8. Riscos

| Risco                                                      | Mitigação                           |
| ---------------------------------------------------------- | ----------------------------------- |
| Página Funcionarios.tsx pode quebrar com colunas removidas | Testar formulário de criação/edição |
| FuncionarioDetalhe.tsx usa document.document_url           | Atualizar para file_url             |
| employee_documents sem notes/is_verified pode impactar UX  | Verificar fluxo de criação          |
| `employee_code` pode ser nullable no Supabase              | Confirmar constraints via Supabase  |
| database_new.ts pode ser referenciado por import oculto    | Grep global para `database_new`     |

---

## 9. Status

| Gate                   | Status                         |
| ---------------------- | ------------------------------ |
| Supabase validated     | ✅ COMPLETO                    |
| Estratégia aprovada    | ✅ Opção B (Código → Supabase) |
| Plano de reconciliação | ✅ Este documento              |
| Implementação          | 🔒 **AGUARDANDO AUTORIZAÇÃO**  |
| Banco alterado?        | **0 alterações**               |
| Código alterado?       | **0 alterações**               |
| Commit/push?           | **0**                          |
