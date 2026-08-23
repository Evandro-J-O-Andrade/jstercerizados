# Fase 2 — Domain Types: Reconciliação com Banco V2.1

**Data:** 2026-08-23  
**Branch:** main  
**Commit base:** a86e19b  
**Status:** Somente leitura / sem alterações de código

---

## 1. Objetivo

Reconciliar os domain types existentes em `src/types/domain/` com o contrato V2.1 do banco remoto, garantindo que:

- Os tipos reflitam o banco real
- Não há tipos duplicados ou legados
- Os mappers estão corretos
- Os enums são derivados do banco

---

## 2. Banco Remoto Confirmado

| Objeto       | Quantidade | Status |
| ------------ | ---------- | ------ |
| Tabelas      | 199        | ✅     |
| Views        | 2          | ✅     |
| Policies/RLS | 553        | ✅     |
| Triggers     | 49         | ✅     |
| Functions    | 22         | ✅     |

---

## 3. Domain Types Existentes

### 3.1 Estrutura atual

```
src/types/
├── database.ts          ✅ Tipos gerados do Supabase (859 linhas)
├── auth.ts              ✅ Tipos de autenticação/RBAC
├── common.ts            ⚠️ Tipos legados (BudgetRequest, Partner, Supplier, Candidate, Vaga, etc.)
├── index.ts             ✅ Re-exports
└── domain/
    ├── index.ts         ✅ Re-exports
    ├── tenant.ts        ✅ Tenant
    ├── company.ts       ✅ Company
    ├── candidate.ts     ✅ Candidate + sub-entidades
    ├── job.ts           ✅ Job + enums
    ├── application.ts   ✅ Application
    ├── recruitment.ts   ⚠️ Lead, Service, Supplier, Partner, BudgetRequest (domínio)
    └── mappers.ts       ✅ Mappers simples
```

### 3.2 Status por arquivo

| Arquivo                 | Status | Observação                                                    |
| ----------------------- | ------ | ------------------------------------------------------------- |
| `database.ts`           | ✅     | Gerado manualmente, reflete banco V2.1                        |
| `auth.ts`               | ✅     | Alinhado com V2.1                                             |
| `common.ts`             | ⚠️     | Contém tipos legados que precisam ser eliminados gradualmente |
| `domain/tenant.ts`      | ✅     | Correto, usa enums do banco                                   |
| `domain/company.ts`     | ✅     | Correto, usa enums do banco                                   |
| `domain/candidate.ts`   | ✅     | Correto, relaciona com `people`                               |
| `domain/job.ts`         | ✅     | Correto, usa enums do banco                                   |
| `domain/application.ts` | ✅     | Correto, usa enums do banco                                   |
| `domain/recruitment.ts` | ⚠️     | Contém tipos legados duplicados com `common.ts`               |
| `domain/mappers.ts`     | ✅     | Mappers simples, funcionais                                   |

---

## 4. Reconciliacao com Banco V2.1

### 4.1 Enums confirmados no banco

| Enum                 | Valores                                        | Uso no frontend   |
| -------------------- | ---------------------------------------------- | ----------------- |
| `person_status`      | active, inactive, pending                      | Tenant, Candidate |
| `tenant_status`      | active, inactive, pending                      | Tenant            |
| `role_scope`         | system, tenant                                 | RBAC              |
| `company_status`     | active, inactive, pending                      | Company           |
| `candidate_status`   | active, inactive, pending                      | Candidate         |
| `job_status`         | draft, published, closed, cancelled            | Job               |
| `application_status` | applied, review, interview, approved, rejected | Application       |
| `lead_status`        | new, contacted, proposal, won, lost            | Lead              |
| `service_category`   | rh, facilities, terceirizacao, candidato       | Service           |
| `service_status`     | active, inactive                               | Service           |
| `supplier_status`    | active, inactive                               | Supplier          |
| `partner_status`     | pending, approved, rejected                    | Partner           |
| `budget_status`      | new, contacted, proposal, won, lost            | BudgetRequest     |

### 4.2 Tabelas confirmadas no banco

| Tabela               | Status | Domain Type                                                 |
| -------------------- | ------ | ----------------------------------------------------------- |
| `people`             | ✅     | `Database['public']['Tables']['people']['Row']`             |
| `tenants`            | ✅     | `Tenant`                                                    |
| `tenant_memberships` | ✅     | `Database['public']['Tables']['tenant_memberships']['Row']` |
| `roles`              | ✅     | `Database['public']['Tables']['roles']['Row']`              |
| `permissions`        | ✅     | `Database['public']['Tables']['permissions']['Row']`        |
| `role_assignments`   | ✅     | `Database['public']['Tables']['role_assignments']['Row']`   |
| `companies`          | ✅     | `Company`                                                   |
| `candidates`         | ✅     | `Candidate`                                                 |
| `jobs`               | ✅     | `Job`                                                       |
| `applications`       | ✅     | `Application`                                               |
| `services`           | ✅     | `Service`                                                   |
| `suppliers`          | ✅     | `Supplier`                                                  |
| `partners`           | ✅     | `Partner`                                                   |
| `leads`              | ✅     | `Lead`                                                      |
| `budget_requests`    | ✅     | `BudgetRequest`                                             |

---

## 5. Divergências Encontradas

### 5.1 `src/types/common.ts` — Tipos legados

| Tipo legado        | Problema                              | Ação                   |
| ------------------ | ------------------------------------- | ---------------------- |
| `BudgetRequest`    | Duplicado com `domain/recruitment.ts` | Eliminar gradualmente  |
| `Partner`          | Duplicado com `domain/recruitment.ts` | Eliminar gradualmente  |
| `Supplier`         | Duplicado com `domain/recruitment.ts` | Eliminar gradualmente  |
| `Candidate`        | Legado, sem relação com `people`      | Eliminar gradualmente  |
| `Vaga`             | Legado, sem relação com banco         | Eliminar gradualmente  |
| `Service`          | Duplicado com `domain/recruitment.ts` | Eliminar gradualmente  |
| `JobCreatePayload` | Paypoint de integração antigo         | Manter temporariamente |

### 5.2 `src/types/domain/recruitment.ts` — Tipos de domínio

| Tipo            | Status | Observação                       |
| --------------- | ------ | -------------------------------- |
| `Lead`          | ✅     | Correto, alinhado com banco      |
| `Service`       | ✅     | Correto, alinhado com banco      |
| `Supplier`      | ⚠️     | Campos diferentes de `common.ts` |
| `Partner`       | ⚠️     | Campos diferentes de `common.ts` |
| `BudgetRequest` | ⚠️     | Campos diferentes de `common.ts` |

**Ação:** Os tipos em `domain/recruitment.ts` estão corretos e alinhados com o banco. Os legados em `common.ts` devem ser eliminados.

### 5.3 Mappers

| Mapper             | Status | Observação                    |
| ------------------ | ------ | ----------------------------- |
| `mapTenant`        | ✅     | Simples spread                |
| `mapCompany`       | ✅     | Simples spread                |
| `mapCandidate`     | ✅     | Enriquece com relacionamentos |
| `mapJob`           | ✅     | Simples spread                |
| `mapApplication`   | ✅     | Simples spread                |
| `mapLead`          | ✅     | Simples spread                |
| `mapService`       | ✅     | Simples spread                |
| `mapSupplier`      | ✅     | Simples spread                |
| `mapPartner`       | ✅     | Simples spread                |
| `mapBudgetRequest` | ✅     | Simples spread                |

---

## 6. Plano de Ação

### 6.1 Manter (estão corretos)

- `src/types/database.ts` — tipos gerados do Supabase
- `src/types/auth.ts` — tipos de autenticação/RBAC
- `src/types/domain/tenant.ts` — Tenant
- `src/types/domain/company.ts` — Company
- `src/types/domain/candidate.ts` — Candidate
- `src/types/domain/job.ts` — Job
- `src/types/domain/application.ts` — Application
- `src/types/domain/mappers.ts` — mappers
- `src/types/domain/index.ts` — re-exports

### 6.2 Ajustar

- `src/types/domain/recruitment.ts` — adicionar mappers para Lead, Service, Supplier, Partner, BudgetRequest
- `src/types/common.ts` — marcar tipos legados como deprecated

### 6.3 Eliminar gradualmente

- `BudgetRequest` de `common.ts`
- `Partner` de `common.ts`
- `Supplier` de `common.ts`
- `Candidate` de `common.ts`
- `Vaga` de `common.ts`
- `Service` de `common.ts`

### 6.4 Manter temporariamente

- `JobCreatePayload` em `common.ts` — usado por `DivulgarVagaForm.tsx`

---

## 7. Próximos Passos

1. ✅ Reconciliar tipos com banco V2.1 — CONCLUÍDO
2. 🔄 Marcar tipos legados como deprecated — PRÓXIMO
3. ⏳ Implementar Fase 2 — Domain Types
4. ⏳ Atualizar componentes que usam tipos legados
5. ⏳ Rodar tsc --noEmit + build

---

## 8. Evidências

### Banco confirmado

```
Tabelas: 199
Views: 2
Policies/RLS: 553
Triggers: 49
Functions: 22
```

### Tipos legados em `common.ts`

```typescript
// Linha 20-35
export interface BudgetRequest { ... }

// Linha 37-50
export interface Partner { ... }

// Linha 52-64
export interface Supplier { ... }

// Linha 66-82
export interface Candidate { ... }

// Linha 84-95
export interface Service { ... }

// Linha 97-130
export interface Vaga { ... }
```

### Domain types corretos

```typescript
// src/types/domain/recruitment.ts
export interface Lead { ... }
export interface Service { ... }
export interface Supplier { ... }
export interface Partner { ... }
export interface BudgetRequest { ... }
```

---

**Fim da reconciliação da Fase 2.**
