# V21-CANONICAL-OBJECT-RECONCILIATION.md

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Fase:** 12.0-C — Canonical Object Reconciliation  
**Status:** READ-ONLY | MERGE_CONTROL | NO_DROP | NO_MIGRATION  

---

## Decisão arquitetural

- **Fonte canônica final do BUILD V2.1:** `supabase/specs/sql/`
- **Baseline final:** `supabase/specs/V2.1-BASELINE-DEFINITIVE.sql`
- **Fonte de reconciliação:** `docs/sql/`
- `docs/sql/` NÃO será executado diretamente em produção.
- Nenhum arquivo será apagado, sobrescrito ou sincronizado automaticamente.

---

## Regras operacionais

- READ-ONLY.
- NÃO executar CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, TRUNCATE, GRANT ou REVOKE.
- NÃO criar migration.
- NÃO corrigir divergências.
- NÃO avançar para 12.2 antes de fechar esta fase.

---

## 1. Inventário de objetos

### 1.1 `supabase/specs/sql/`

| Arquivo | Objetos | Tabelas | Functions | Triggers | Policies | Views | Enums | Seed | Validation |
|---------|---------|--------:|----------:|---------:|---------:|------:|------:|-----:|------------|
| `00_extensions.sql` | 3 extensions | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `01_core.sql` | 4 tables | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `02_rbac.sql` | 4 tables | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `03_crm.sql` | 3 tables | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `04_rh_recruitment.sql` | 6 tables | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `05_services_contracts.sql` | 4 tables | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `06_suppliers_purchasing.sql` | 3 tables | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `07_inventory_custody.sql` | 4 tables | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `08_tasks_support.sql` | 3 tables | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `09_chat.sql` | 5 tables | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `10_notifications_events.sql` | 5 tables | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `11_audit_security.sql` | 3 tables | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Total** | | **44** | **0** | **0** | **0** | **0** | **0** | **0** | **0** |

### 1.2 `docs/sql/`

| Arquivo | Objetos | Tabelas | Functions | Triggers | Policies | Views | Enums | Seed | Validation |
|---------|---------|--------:|----------:|---------:|---------:|------:|------:|-----:|------------|
| `00_extensions.sql` | 2 extensions | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `01_core.sql` | 4 tables | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `02_rbac.sql` | 5 tables | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `03_crm.sql` | 3 tables | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `04_rh_recruitment.sql` | 14 tables | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `05_employees.sql` | 7 tables | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `06_administrative.sql` | 4 tables | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `07_finance.sql` | 8 tables | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `08_fiscal.sql` | 7 tables | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `09_inventory.sql` | 10 tables | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `10_tasks.sql` | 4 tables | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `11_support.sql` | 5 tables | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `12_notifications.sql` | 3 tables | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `13_chat.sql` | 2 tables | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `14_storage.sql` | 4 tables | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `15_domain_events.sql` | 1 table | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `16_audit.sql` | 1 table | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `17_lgpd.sql` | 2 tables | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `18_functions.sql` | 29 functions | 0 | 29 | 0 | 0 | 0 | 0 | 0 | 0 |
| `19_triggers.sql` | 22 triggers | 0 | 0 | 22 | 0 | 0 | 0 | 0 | 0 |
| `20_indexes.sql` | indexes | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `21_rls.sql` | policies | 0 | 0 | 0 | 39 | 0 | 0 | 0 | 0 |
| `22_seed.sql` | seed data | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| `23_validation.sql` | validation | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| **Total** | | **84** | **29** | **22** | **39** | **0** | **0** | **1** | **1** |

---

## 2. Comparação de arquivos compartilhados

| Arquivo | docs/sql | specs/sql | Status |
|---------|----------|-----------|--------|
| `00_extensions.sql` | 2 linhas, 2 extensions | 6 linhas, 3 extensions | CONFLICT |
| `01_core.sql` | 61 linhas, 4 tables + PK/FK | 43 linhas, 4 tables + PK/FK | CONFLICT |
| `02_rbac.sql` | 5 tables + role_assignments | 4 tables + role_assignments | CONFLICT |
| `03_crm.sql` | 3 tables | 3 tables | CONFLICT |
| `04_rh_recruitment.sql` | 14 tables | 6 tables | CONFLICT |

**Classificação:** Nenhum arquivo compartilhado pode ser considerado IDÊNTICO sem análise detalhada.

---

## 3. Arquivos exclusivos de `docs/sql/`

| Arquivo | Domínio | Status |
|---------|---------|--------|
| `05_employees.sql` | Employees | PRESERVE_DOCS |
| `06_administrative.sql` | Administrative | PRESERVE_DOCS |
| `07_finance.sql` | Finance | PRESERVE_DOCS |
| `08_fiscal.sql` | Fiscal | PRESERVE_DOCS |
| `09_inventory.sql` | Inventory | PRESERVE_DOCS |
| `10_tasks.sql` | Tasks | PRESERVE_DOCS |
| `11_support.sql` | Support | PRESERVE_DOCS |
| `12_notifications.sql` | Notifications | PRESERVE_DOCS |
| `13_chat.sql` | Chat | PRESERVE_DOCS |
| `14_storage.sql` | Storage | PRESERVE_DOCS |
| `15_domain_events.sql` | Events | PRESERVE_DOCS |
| `16_audit.sql` | Audit | PRESERVE_DOCS |
| `17_lgpd.sql` | LGPD | PRESERVE_DOCS |
| `18_functions.sql` | Functions | PRESERVE_DOCS |
| `19_triggers.sql` | Triggers | PRESERVE_DOCS |
| `20_indexes.sql` | Performance | PRESERVE_DOCS |
| `21_rls.sql` | Security | PRESERVE_DOCS |
| `22_seed.sql` | Seed | PRESERVE_DOCS |
| `23_validation.sql` | Validation | PRESERVE_DOCS |

**Total:** 19 arquivos

---

## 4. Arquivos exclusivos de `supabase/specs/sql/`

| Arquivo | Domínio | Status |
|---------|---------|--------|
| `05_services_contracts.sql` | Services/Contracts | PRESERVE_SPECS |
| `06_suppliers_purchasing.sql` | Suppliers/Purchasing | PRESERVE_SPECS |
| `07_inventory_custody.sql` | Inventory/Custody | PRESERVE_SPECS |
| `08_tasks_support.sql` | Tasks/Support | PRESERVE_SPECS |
| `09_chat.sql` | Chat | PRESERVE_SPECS |
| `10_notifications_events.sql` | Notifications/Events | PRESERVE_SPECS |
| `11_audit_security.sql` | Audit/Security | PRESERVE_SPECS |

**Total:** 7 arquivos

---

## 5. Matriz de reconciliação

| Arquivo | docs/sql | specs/sql | V2.1 Matrix | Decisão | Motivo |
|---------|----------|-----------|-------------|---------|--------|
| `00_extensions.sql` | SIM | SIM | — | CONFLICT | Divergente; docs/sql tem 2 extensions, specs/sql tem 3 |
| `01_core.sql` | SIM | SIM | 🟢 | CONFLICT | Divergente em colunas/defaults |
| `02_rbac.sql` | SIM | SIM | 🟢 | CONFLICT | Divergente em estrutura |
| `03_crm.sql` | SIM | SIM | 🟢 | CONFLICT | Divergente em estrutura |
| `04_rh_recruitment.sql` | SIM | SIM | 🟢 | CONFLICT | Divergente em domínios agrupados |
| `05_employees.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `06_administrative.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `07_finance.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `08_fiscal.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `09_inventory.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `10_tasks.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `11_support.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `12_notifications.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `13_chat.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `14_storage.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `15_domain_events.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `16_audit.sql` | SIM | NÃO | 🟢 | PRESERVE_DOCS | Ausente em specs/sql |
| `17_lgpd.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `18_functions.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `19_triggers.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `20_indexes.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `21_rls.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `22_seed.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `23_validation.sql` | SIM | NÃO | 🟡 | PRESERVE_DOCS | Ausente em specs/sql |
| `05_services_contracts.sql` | NÃO | SIM | 🟡 | PRESERVE_SPECS | Ausente em docs/sql |
| `06_suppliers_purchasing.sql` | NÃO | SIM | 🟡 | PRESERVE_SPECS | Ausente em docs/sql |
| `07_inventory_custody.sql` | NÃO | SIM | 🟡 | PRESERVE_SPECS | Ausente em docs/sql |
| `08_tasks_support.sql` | NÃO | SIM | 🟡 | PRESERVE_SPECS | Ausente em docs/sql |
| `09_chat.sql` | NÃO | SIM | 🟢 | PRESERVE_SPECS | Ausente em docs/sql |
| `10_notifications_events.sql` | NÃO | SIM | 🟢 | PRESERVE_SPECS | Ausente em docs/sql |
| `11_audit_security.sql` | NÃO | SIM | 🟢 | PRESERVE_SPECS | Ausente em docs/sql |

**Legenda:**
- `PRESERVE_DOCS` — manter como fonte de reconciliação
- `PRESERVE_SPECS` — manter como fonte canônica
- `CONFLICT` — divergência arquitetural, necessária decisão humana
- `MERGE` — combinar conteúdo de ambas as fontes
- `REWRITE` — reescrever arquivo
- `DEPRECATE` — marcar como legado

---

## 6. Ordem canônica

A ordem definida no MASTER SPEC é:

```
00_extensions.sql
01_core.sql
02_tenancy.sql
03_rbac.sql
04_crm.sql
05_rh.sql
06_recruitment.sql
07_employees.sql
08_services.sql
09_contracts.sql
10_suppliers.sql
11_inventory.sql
12_custody.sql
13_purchasing.sql
14_tasks.sql
15_support.sql
16_notifications.sql
17_chat.sql
18_storage.sql
19_finance.sql
20_fiscal.sql
21_documents.sql
22_domain_events.sql
23_outbox.sql
24_audit.sql
25_security.sql
26_lgpd.sql
27_functions.sql
28_triggers.sql
29_indexes.sql
30_views.sql
31_rls.sql
32_seed.sql
33_validation.sql
```

**Estado atual:**
- Nenhum diretório segue esta ordem completa.
- Ambos os diretórios precisam ser reconciliados para a ordem canônica.

**Ação:** Após reconciliação de conteúdo, reordenar `supabase/specs/sql/` conforme ordem canônica.

---

## 7. Baseline

`supabase/specs/V2.1-BASELINE-DEFINITIVE.sql` atualmente é apenas scaffold com 12 linhas.

**Não deve ser tratado como DDL definitivo.**

---

## 8. Conflitos arquiteturais

### CONFLICTO-001: Diretórios SQL divergentes

**Descrição:**  
`docs/sql/` e `supabase/specs/sql/` contêm arquivos com mesmos nomes mas conteúdos diferentes, além de arquivos exclusivos.

**Impacto:**  
A Validation Suite não pode validar dois bancos diferentes. O dry-run pode usar uma árvore enquanto o build usa outra.

**Decisão:**  
Merge controlado. NÃO escolher automaticamente um vencedor.

### CONFLICTO-002: Ordem canônica não seguida

**Descrição:**  
Nenhum dos diretórios segue a ordem definida no MASTER SPEC.

**Impacto:**  
Ordem de criação de tabelas, funções, triggers e RLS pode ser incorreta.

**Decisão:**  
Após reconciliação, reordenar arquivos na fonte canônica.

### CONFLICTO-003: Extensions divergentes

**Descrição:**  
`docs/sql/00_extensions.sql` tem 2 extensions (`uuid-ossp`, `pgcrypto`).  
`supabase/specs/sql/00_extensions.sql` tem 3 extensions (`uuid-ossp`, `pgcrypto`, `btree_gist`).

**Impacto:**  
`btree_gist` pode ser necessária para constraints de intervalo ou tipos compostos.

**Decisão:**  
Registrar como CONFLICT. Aguardar validação de dependências na Fase K.

### CONFLICTO-004: Estruturas de tabelas divergentes

**Descrição:**  
Mesmas tabelas em `docs/sql/` e `supabase/specs/sql/` têm estruturas diferentes.

**Impacto:**  
Constraints, defaults, colunas e dependências podem ser incompatíveis.

**Decisão:**  
Registrar como CONFLICT. Aguardar análise detalhada por tabela.

### CONFLICTO-005: Falta de enums em ambos os diretórios

**Descrição:**  
Nenhum `CREATE TYPE` encontrado em ambos os diretórios.

**Impacto:**  
Campos `status`, `scope`, `relationship_type`, etc. podem precisar de enums ou CHECK constraints.

**Decisão:**  
Registrar como CONFLICT. Aguardar análise na Fase C.

### CONFLICTO-006: `actor_person_id` em specs/sql

**Descrição:**  
`supabase/specs/sql/05_services_contracts.sql` e `supabase/specs/sql/10_notifications_events.sql` usam `actor_person_id`.

**Impacto:**  
`actor_person_id` é LEGACY no V2.1. Não deve aparecer no canonical.

**Decisão:**  
Registrar como CONFLICT. Remover na reconciliação.

### CONFLICTO-007: Diferença de colunas em tabelas core

**Descrição:**  
`docs/sql/01_core.sql` tem colunas ausentes em `supabase/specs/sql/01_core.sql`:
- `tenants`: `legal_name`, `tax_id`, `email`, `phone`, `address`, `settings`, `created_by`, `updated_by`
- `people`: `phone`, `document`, `metadata`, `created_by`, `updated_by`
- `tenant_memberships`: `membership_role`, `left_at`

**Impacto:**  
Dados podem ser perdidos ou constraints podem falhar.

**Decisão:**  
Registrar como CONFLICT. Priorizar estrutura mais completa de docs/sql para reconciliação.

### CONFLICTO-008: RBAC `is_global` vs `scope`

**Descrição:**  
`docs/sql/02_rbac.sql` usa `is_global BOOLEAN DEFAULT FALSE`.  
`supabase/specs/sql/02_rbac.sql` usa `scope TEXT NOT NULL DEFAULT 'tenant'`.

**Impacto:**  
Lógica de RBAC pode ser incompatível.

**Decisão:**  
Registrar como CONFLICT. V2.1 Architecture Decisions determinam `admin_master` como global. `is_global` é mais explícito.

### CONFLICTO-009: `role_assignments` com campos divergentes

**Descrição:**  
`docs/sql/02_rbac.sql` tem: `assigned_by UUID`, `expires_at TIMESTAMPTZ`, `status TEXT`.  
`supabase/specs/sql/02_rbac.sql` não tem esses campos.

**Impacto:**  
Recursos de RBAC podem estar incompletos no canonical.

**Decisão:**  
Registrar como CONFLICT. Priorizar estrutura mais completa.

### CONFLICTO-010: `applications` sem `tenant_id` em specs/sql

**Descrição:**  
`supabase/specs/sql/04_rh_recruitment.sql` não tem `tenant_id` em `applications`.  
`docs/sql/04_rh_recruitment.sql` tem `tenant_id` em `applications`.

**Impacto:**  
Isolamento multi-tenant quebrado para applications.

**Decisão:**  
Registrar como CONFLICT. V2.1 requer `tenant_id` em todas as tabelas tenant-scoped.

### CONFLICTO-011: `jobs.company_id` é NOT NULL apenas em docs/sql

**Descrição:**  
`docs/sql/04_rh_recruitment.sql` tem `company_id UUID NOT NULL REFERENCES companies(id)`.  
`supabase/specs/sql/04_rh_recruitment.sql` tem `company_id UUID REFERENCES public.companies(id)` (nullable).

**Impacto:**  
Jobs podem existir sem empresa no canonical.

**Decisão:**  
Registrar como CONFLICT. V2.1 requer `company_id` obrigatório.

### CONFLICTO-012: Funções/Triggers/Policies ausentes em specs/sql

**Descrição:**  
`supabase/specs/sql/` não tem:
- Functions (29 em docs/sql)
- Triggers (22 em docs/sql)
- Policies (39 em docs/sql)
- Seed data
- Validation

**Impacto:**  
Canonical incompleto se usar apenas specs/sql.

**Decisão:**  
Registrar como CONFLICT. Reconciliação necessária.

### CONFLICTO-013: UUID generation divergente

**Descrição:**  
`docs/sql/` usa `gen_random_uuid()` (pgcrypto).  
`supabase/specs/sql/` usa `uuid_generate_v4()` (uuid-ossp).

**Impacto:**  
Ambos funcionam, mas dependem de extensions diferentes.

**Decisão:**  
Registrar como CONFLICT. V2.1 pode escolher uma estratégia única.

---

## 9. Análise por domínio

### 9.1 Core / Tenancy

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `tenants` | 16 colunas + PK/FK | 7 colunas + PK/FK | CONFLICT |
| `people` | 12 colunas + PK/FK | 7 colunas + PK/FK | CONFLICT |
| `tenant_memberships` | 9 colunas + PK/FK | 6 colunas + PK/FK | CONFLICT |
| `tenant_settings` | 9 colunas + PK/FK | 5 colunas + PK/FK | CONFLICT |

**Decisão:** Usar estrutura de `docs/sql` como base para canonical, pois é mais completa e alinhada com V2.1.

### 9.2 RBAC

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `roles` | `is_global`, `scope` | `scope` apenas | CONFLICT |
| `permissions` | `is_global` | — | CONFLICT |
| `role_permissions` | idêntico | idêntico | CONFLICT |
| `role_assignments` | + `assigned_by`, `expires_at`, `status` | básico | CONFLICT |
| `role_resource_permissions` | presente | ausente | CONFLICT |

**Decisão:** Usar estrutura de `docs/sql` como base para canonical.

### 9.3 CRM

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `companies` | ✓ | ✓ | CONFLICT |
| `company_relationships` | ✓ | ✓ | CONFLICT |
| `company_contacts` | ✓ | ✓ | CONFLICT |

**Decisão:** Estruturas similares; necessário merge detalhado.

### 9.4 RH / Recruitment

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `candidates` | 9 colunas + `tenant_id` | 4 colunas, sem `tenant_id` | CONFLICT |
| `jobs` | 12 colunas + `company_id NOT NULL` | 10 colunas, `company_id` nullable | CONFLICT |
| `applications` | 8 colunas + `tenant_id` | 4 colunas, sem `tenant_id` | CONFLICT |
| `interviews` | ✓ | ✓ | CONFLICT |
| `application_status_history` | ✓ | ausente | CONFLICT |
| `talent_pool_memberships` | ✓ | ausente | CONFLICT |
| `job_matches` | ✓ | ausente | CONFLICT |

**Decisão:** Usar estrutura de `docs/sql` como base para canonical.

### 9.5 Employees

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `employees` | ✓ | ausente | PRESERVE_DOCS |
| `employee_contracts` | ✓ | ausente | PRESERVE_DOCS |
| `employee_documents` | ✓ | ausente | PRESERVE_DOCS |
| `employee_status_history` | ✓ | ausente | PRESERVE_DOCS |
| `departments` | ✓ | ausente | PRESERVE_DOCS |
| `positions` | ✓ | ausente | PRESERVE_DOCS |
| `employee_positions` | ✓ | ausente | PRESERVE_DOCS |

**Decisão:** Manter docs/sql como fonte.

### 9.6 Services / Contracts

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `services` | ausente | ✓ | PRESERVE_SPECS |
| `service_orders` | ausente | ✓ | PRESERVE_SPECS |
| `contracts` | ausente | ✓ | PRESERVE_SPECS |

**Decisão:** Manter specs/sql como fonte, mas reconciliar `actor_person_id`.

### 9.7 Inventory / Custody

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `products` | ✓ | ✓ | CONFLICT |
| `stock_movements` | ✓ | ✓ | CONFLICT |
| `third_party_custody` | ausente | ✓ | PRESERVE_SPECS |

**Decisão:** Merge necessário.

### 9.8 Support / Chat

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `support_tickets` | ✓ | ✓ | CONFLICT |
| `chat_rooms` | ✓ | ✓ | CONFLICT |
| `chat_messages` | ausente | ✓ | PRESERVE_SPECS |

**Decisão:** Merge necessário.

### 9.9 Finance / Fiscal

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `financial_accounts` | ✓ | ausente | PRESERVE_DOCS |
| `accounts_receivable` | ✓ | ausente | PRESERVE_DOCS |
| `accounts_payable` | ✓ | ausente | PRESERVE_DOCS |
| `invoices` | ✓ | ausente | PRESERVE_DOCS |
| `fiscal_documents` | ✓ | ausente | PRESERVE_DOCS |

**Decisão:** Manter docs/sql como fonte.

### 9.10 Notifications / Events

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `notifications` | ✓ | ✓ | CONFLICT |
| `domain_events` | ✓ | ✓ | CONFLICT |
| `event_outbox` | ausente | ✓ | PRESERVE_SPECS |

**Decisão:** Merge necessário.

### 9.11 Audit / Security / LGPD

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| `audit_logs` | ✓ | ✓ | CONFLICT |
| `security_events` | ausente | ✓ | PRESERVE_SPECS |
| `first_login_state` | ausente | ✓ | PRESERVE_SPECS |
| `legal_acceptances` | ausente | ✓ | PRESERVE_SPECS |

**Decisão:** Merge necessário.

### 9.12 Functions / Triggers / RLS / Seed / Validation

| Objeto | docs/sql | specs/sql | Status |
|--------|----------|-----------|--------|
| Functions | 29 | 0 | PRESERVE_DOCS |
| Triggers | 22 | 0 | PRESERVE_DOCS |
| Policies | 39 | 0 | PRESERVE_DOCS |
| Indexes | scaffold | 0 | PRESERVE_DOCS |
| Seed | scaffold | 0 | PRESERVE_DOCS |
| Validation | scaffold | 0 | PRESERVE_DOCS |

**Decisão:** Manter docs/sql como fonte.

---

## 10. Dependências

### 10.1 specs/sql

| Ordem | Arquivo | Depende de |
|-------|---------|------------|
| 1 | `00_extensions.sql` | — |
| 2 | `01_core.sql` | `00_extensions.sql` |
| 3 | `02_rbac.sql` | `01_core.sql` |
| 4 | `03_crm.sql` | `01_core.sql` |
| 5 | `04_rh_recruitment.sql` | `01_core.sql`, `03_crm.sql` |
| 6 | `05_services_contracts.sql` | `01_core.sql`, `03_crm.sql` |
| 7 | `06_suppliers_purchasing.sql` | `01_core.sql`, `03_crm.sql` |
| 8 | `07_inventory_custody.sql` | `01_core.sql`, `03_crm.sql` |
| 9 | `08_tasks_support.sql` | `01_core.sql` |
| 10 | `09_chat.sql` | `01_core.sql` |
| 11 | `10_notifications_events.sql` | `01_core.sql` |
| 12 | `11_audit_security.sql` | `01_core.sql` |

**Status:** Dependências válidas.

### 10.2 docs/sql

| Ordem | Arquivo | Depende de |
|-------|---------|------------|
| 1 | `00_extensions.sql` | — |
| 2 | `01_core.sql` | `00_extensions.sql` |
| 3 | `02_rbac.sql` | `01_core.sql` |
| 4 | `03_crm.sql` | `01_core.sql` |
| 5 | `04_rh_recruitment.sql` | `01_core.sql`, `03_crm.sql` |
| 6 | `05_employees.sql` | `01_core.sql` |
| 7 | `06_administrative.sql` | `01_core.sql` |
| 8 | `07_finance.sql` | `01_core.sql`, `03_crm.sql` |
| 9 | `08_fiscal.sql` | `01_core.sql`, `03_crm.sql` |
| 10 | `09_inventory.sql` | `01_core.sql`, `03_crm.sql` |
| 11 | `10_tasks.sql` | `01_core.sql` |
| 12 | `11_support.sql` | `01_core.sql` |
| 13 | `12_notifications.sql` | `01_core.sql` |
| 14 | `13_chat.sql` | `01_core.sql` |
| 15 | `14_storage.sql` | `01_core.sql` |
| 16 | `15_domain_events.sql` | `01_core.sql` |
| 17 | `16_audit.sql` | `01_core.sql` |
| 18 | `17_lgpd.sql` | `01_core.sql` |
| 19 | `18_functions.sql` | múltiplos |
| 20 | `19_triggers.sql` | múltiplos |
| 21 | `20_indexes.sql` | múltiplos |
| 22 | `21_rls.sql` | múltiplos |
| 23 | `22_seed.sql` | múltiplos |
| 24 | `23_validation.sql` | múltiplos |

**Status:** Dependências válidas, mas arquivos de lógica (functions, triggers, RLS) dependem de múltiplos domínios.

### 10.3 Ordem canônica alvo

```
00_extensions.sql
01_core.sql
02_tenancy.sql
03_rbac.sql
04_crm.sql
05_rh.sql
06_recruitment.sql
07_employees.sql
08_services.sql
09_contracts.sql
10_suppliers.sql
11_inventory.sql
12_custody.sql
13_purchasing.sql
14_tasks.sql
15_support.sql
16_notifications.sql
17_chat.sql
18_storage.sql
19_finance.sql
20_fiscal.sql
21_documents.sql
22_domain_events.sql
23_outbox.sql
24_audit.sql
25_security.sql
26_lgpd.sql
27_functions.sql
28_triggers.sql
29_indexes.sql
30_views.sql
31_rls.sql
32_seed.sql
33_validation.sql
```

**Status:** Nenhum diretório atual corresponde a esta ordem.

---

## 11. Próximos passos

1. Executar Fase B — Reconciliar tabelas
2. Executar Fase C — Reconciliar enums
3. Executar Fase D — Reconciliar RBAC
4. Executar Fase E — Reconciliar functions
5. Executar Fase F — Reconciliar triggers
6. Executar Fase G — Reconciliar RLS/policies
7. Executar Fase H — Reconciliar events/outbox
8. Executar Fase I — Reconciliar storage
9. Executar Fase J — Definir ordem canônica
10. Executar Fase K — Verificar dependências
11. Executar Fase L — Preparar baseline canônica

---

## 12.0-D.1.1 — Duplicate Resolution

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Resolver duplicidades estruturais em `supabase/specs/sql/` e garantir árvore canônica 00–33.

### Resultado

| Item | Valor |
|------|-------|
| Arquivos canônicos finais | 34 |
| Duplicidades restantes | 0 |
| Legados preservados | SIM |
| Objetos migrados | 49 |
| Objetos deprecated | 5 |
| Conflitos arquiteturais abertos | CONFLICTO-001 a CONFLICTO-013 |
| Supabase remoto alterado | NÃO |

### Arquivos canônicos finais

```
00_extensions.sql
01_core.sql
02_tenancy.sql
03_rbac.sql
04_crm.sql
05_rh.sql
06_recruitment.sql
07_employees.sql
08_services.sql
09_contracts.sql
10_suppliers.sql
11_inventory.sql
12_custody.sql
13_purchasing.sql
14_tasks.sql
15_support.sql
16_notifications.sql
17_chat.sql
18_storage.sql
19_finance.sql
20_fiscal.sql
21_documents.sql
22_domain_events.sql
23_outbox.sql
24_audit.sql
25_security.sql
26_lgpd.sql
27_functions.sql
28_triggers.sql
29_indexes.sql
30_views.sql
31_rls.sql
32_seed.sql
33_validation.sql
```

### Merge executado

| Arquivo canônico | Origem legada | Objetos migrados | Observação |
|------------------|---------------|------------------|------------|
| 03_rbac.sql | 02_rbac.sql | roles, permissions, role_permissions, role_assignments | actor_person_id removido dos históricos |
| 04_crm.sql | 03_crm.sql | companies, company_relationships, company_contacts | — |
| 05_rh.sql | 04_rh_recruitment.sql | candidates | Separado de recruitment |
| 06_recruitment.sql | 04_rh_recruitment.sql | jobs, applications, application_status_history, interviews | actor_person_id removido |
| 08_services.sql | 05_services_contracts.sql | services, service_orders, service_order_status_history | actor_person_id removido |
| 09_contracts.sql | 05_services_contracts.sql | contracts, contract_status_history | actor_person_id removido |
| 10_suppliers.sql | 06_suppliers_purchasing.sql | suppliers | — |
| 11_inventory.sql | 07_inventory_custody.sql | products, stock_movements | — |
| 12_custody.sql | 07_inventory_custody.sql | third_party_custody, third_party_custody_items | — |
| 13_purchasing.sql | 06_suppliers_purchasing.sql | purchase_orders, purchase_order_items | — |
| 14_tasks.sql | 08_tasks_support.sql | tasks | — |
| 15_support.sql | 08_tasks_support.sql | support_tickets, support_ticket_status_history | actor_person_id removido |
| 16_notifications.sql | 10_notifications_events.sql | notifications, notification_deliveries | — |
| 17_chat.sql | 09_chat.sql | chat_rooms, chat_participants, chat_messages, ai_conversations, ai_messages, chat_handoffs | — |
| 22_domain_events.sql | 10_notifications_events.sql | domain_events | actor_person_id removido |
| 23_outbox.sql | 10_notifications_events.sql | event_outbox, event_deliveries | — |
| 24_audit.sql | 11_audit_security.sql | audit_logs | actor_person_id removido |
| 25_security.sql | 11_audit_security.sql | security_events, first_login_state | — |
| 26_lgpd.sql | 11_audit_security.sql | legal_acceptances | — |

### Objetos deprecated

| Objeto | Motivo |
|--------|--------|
| actor_person_id em application_status_history | Não pertence ao V2.1 |
| actor_person_id em service_order_status_history | Não pertence ao V2.1 |
| actor_person_id em contract_status_history | Não pertence ao V2.1 |
| actor_person_id em support_ticket_status_history | Não pertence ao V2.1 |
| actor_person_id em domain_events | Não pertence ao V2.1 |

### Arquivos legacy preservados

```
docs/reconciliation/legacy-sql/01_core.sql
docs/reconciliation/legacy-sql/02_rbac.sql
docs/reconciliation/legacy-sql/03_crm.sql
docs/reconciliation/legacy-sql/04_rh_recruitment.sql
docs/reconciliation/legacy-sql/05_services_contracts.sql
docs/reconciliation/legacy-sql/06_suppliers_purchasing.sql
docs/reconciliation/legacy-sql/07_inventory_custody.sql
docs/reconciliation/legacy-sql/08_tasks_support.sql
docs/reconciliation/legacy-sql/09_chat.sql
docs/reconciliation/legacy-sql/10_notifications_events.sql
docs/reconciliation/legacy-sql/11_audit_security.sql
```

### Conflitos restantes

CONFLICTO-001 a CONFLICTO-013 continuam abertos e não foram resolvidos nesta etapa. Esta etapa resolveu somente duplicidades estruturais.

### Verificações

| Item | Status |
|------|--------|
| 00–33 presente | ✅ |
| Quantidade canônica | 34 |
| Duplicidades | 0 |
| Arquivos fora do BUILD ORDER | 0 |
| Legados preservados | ✅ |
| Conteúdo migrado | ✅ |
| Supabase remoto alterado | NÃO |

---

## 12. Gate

| Item | Status |
|------|--------|
| Inventário concluído | ✅ |
| Comparação concluída | ✅ |
| Arquivos exclusivos identificados | ✅ |
| Conflitos arquiteturais identificados | ✅ |
| Decisão tomada | ✅ MERGE CONTROLADO |
| Merge/rewrite executado | ✅ EXECUTADO |
| Baseline atualizada | ❌ PENDENTE |
| Validation Suite atualizada | ❌ PENDENTE |
| Estrutura canônica 00–33 | ✅ 34 arquivos |
| Duplicidades resolvidas | ✅ 0 duplicidades |
| Legados preservados | ✅ 11 arquivos |
| 01_core.sql reconciliado | ✅ PASS |
| 02_tenancy.sql reconciliado | ✅ PASS |

**12.0-C / 12.0-D.1.1 / 12.0-D.2 / 12.0-D.3 / 12.0-D.4 / 12.0-D.5 / 12.0-D.6 / 12.0-D.7 / 12.0-D.8 / 12.0-D.9 / 12.0-D.10 / 12.0-D.11 / 12.0-D.12 Status:** PASS — árvore canônica consolidada, core/tenancy/RBAC/CRM/RH/Recruitment/Employees/Services/Contracts/Suppliers/Inventory/Custody fechados, legados preservados. Próximo gate: 12.0-D.13 — Purchasing.

---

## 12.0-D.2 — Core/Tenancy Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `01_core.sql` e `02_tenancy.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| people | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| tenants | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| tenant_settings | key/value genérico | Reescrito conforme MASTER SPEC | CANONICAL |
| tenant_memberships | Sem membership_role/left_at | Reescrito conforme MASTER SPEC | CANONICAL |
| profiles | Não existia | Não criado | LEGACY |
| user_profiles | Não existia | Não criado | LEGACY |
| actor_person_id | Não existia | Não criado | LEGACY |
| user_id em memberships | Não existia | Não criado | LEGACY |
| role_id em memberships | Não existia | Não criado | LEGACY |
| UUID | uuid_generate_v4() | Padronizado para gen_random_uuid() | CANONICAL |

### Alterações em 01_core.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `people.email` tornada UNIQUE
- `people.document` adicionado
- `people.metadata` adicionado
- `people.created_by` / `people.updated_by` adicionados
- `tenants` expandido: `legal_name`, `tax_id`, `email`, `phone`, `address`, `settings`, `created_by`, `updated_by`
- `tenant_memberships.membership_role` adicionado
- `tenant_memberships.left_at` adicionado
- `tenant_settings` reescrito: colunas específicas substituem key/value genérico
- Constraint `uq_tenant_settings_tenant` substitui `uq_tenant_settings_tenant_key`
- Removidas referências a perfis legados

### 02_tenancy.sql

Mantido como scaffold para extensões futuras de tenancy. Tabelas core permanecem em `01_core.sql` conforme MASTER SPEC.

### Validações

| Item | Status |
|------|--------|
| people existe | ✅ |
| people.auth_user_id existe | ✅ |
| auth_user_id é UNIQUE | ✅ |
| FK para auth.users | ✅ (referência implícita) |
| tenants existe | ✅ |
| tenant_settings existe | ✅ |
| tenant_memberships existe | ✅ |
| tenant_memberships.person_id existe | ✅ |
| tenant_memberships.tenant_id existe | ✅ |
| person_id referencia people | ✅ |
| tenant_id referencia tenants | ✅ |
| membership duplicada impedida | ✅ |
| profiles não existe | ✅ |
| user_profiles não existe | ✅ |
| actor_person_id não existe | ✅ |
| user_id não existe em membership | ✅ |
| role_id não existe em membership | ✅ |

### Conflitos pendentes

- CONFLICTO-001 a CONFLICTO-013 permanecem abertos.
- CONFLICTO-USER-ID-PERSON-ID resolvido: `person_id` é canônico.
- CONFLICTO-PROFILES-PEOPLE resolvido: `people` é canônico, `profiles` não será criado.

---

## 12.0-D.3 — RBAC Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `03_rbac.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| roles | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| permissions | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| role_permissions | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| role_assignments | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| role_resource_permissions | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| is_global | Ausente | Adicionado em roles e permissions | CANONICAL |
| scope | Ausente em roles | Adicionado conforme MASTER SPEC | CANONICAL |
| assigned_by | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| expires_at | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| UUID | uuid_generate_v4() | Padronizado para gen_random_uuid() | CANONICAL |
| admin/empresa/candidato como roles | Não tratado | Não criado como role canônica | LEGACY |

### Alterações em 03_rbac.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `roles.is_global` adicionado (BOOLEAN DEFAULT FALSE)
- `roles.scope` adicionado (TEXT)
- `permissions.is_global` adicionado (BOOLEAN DEFAULT FALSE)
- `role_assignments.assigned_by` adicionado
- `role_assignments.expires_at` adicionado
- `role_assignments.status` adicionado (DEFAULT 'active')
- `role_resource_permissions` criado conforme MASTER SPEC
- Constraints UNIQUE preservadas

### Validações

| Item | Status |
|------|--------|
| roles existe | ✅ |
| roles.is_global existe | ✅ |
| roles.scope existe | ✅ |
| permissions existe | ✅ |
| permissions.is_global existe | ✅ |
| role_permissions existe | ✅ |
| role_assignments existe | ✅ |
| role_assignments.assigned_by existe | ✅ |
| role_assignments.expires_at existe | ✅ |
| role_resource_permissions existe | ✅ |
| role_assignments.person_id referencia people | ✅ |
| role_assignments.role_id referencia roles | ✅ |
| role_assignments.tenant_id referencia tenants | ✅ |
| Nenhuma role legada hardcoded | ✅ |
| Nenhuma referência a profiles | ✅ |
| Nenhuma referência a user_id | ✅ |

### Conflitos pendentes

- CONFLICTO-001 a CONFLICTO-013 permanecem abertos.
- CONFLICTO-008 (is_global × scope) resolvido: ambos os campos foram adicionados conforme MASTER SPEC.
- CONFLICTO-009 (role_assignments) resolvido: campos adicionais (assigned_by, expires_at, status) adicionados.
- Roles legadas `admin`, `empresa`, `candidato` não são criadas como entidades RBAC canônicas; devem ser substituídas por roles tenant-scoped via RBAC.

---

## 12.0-D.4 — CRM Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `04_crm.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| companies | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| company_relationships | Sem tenant_id | Adicionado tenant_id conforme V2.1 | CANONICAL |
| company_contacts | Sem tenant_id/person_id | Adicionados tenant_id, person_id, department, is_primary | CANONICAL |
| interactions | Presente em docs/sql/ | Não canônico — ausente do MASTER SPEC e FINAL MATRIX | EXCLUDED |
| customer/client/partner/supplier como entidades | Não existia | Não criado — relationship_type é a forma canônica | LEGACY |
| UUID | uuid_generate_v4() | Padronizado para gen_random_uuid() | CANONICAL |
| document em companies | Presente no legacy | Substituído por tax_id conforme MASTER SPEC | CANONICAL |

### Alterações em 04_crm.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `companies` expandido: `tax_id`, `email`, `phone`, `address`, `website`, `created_by`, `updated_by`
- `company_relationships` ganhou `tenant_id` obrigatório
- `company_contacts` ganhou `tenant_id`, `person_id`, `department`, `is_primary`
- `interactions` excluído do build canônico (não consta no MASTER SPEC nem na FINAL MATRIX)
- Não criadas entidades separadas `client_companies`, `partner_companies`, `supplier_companies`

### Validações

| Item | Status |
|------|--------|
| companies existe | ✅ |
| companies.tenant_id existe | ✅ |
| company_relationships existe | ✅ |
| company_relationships.tenant_id existe | ✅ |
| company_contacts existe | ✅ |
| company_contacts.tenant_id existe | ✅ |
| company_contacts.person_id existe | ✅ |
| relationship_type é texto livre | ✅ |
| Nenhuma entidade client/partner/supplier separada | ✅ |
| interactions não existe no canônico | ✅ |
| UUID gen_random_uuid() | ✅ |
| tenant_id references tenants | ✅ |
| person_id references people | ✅ |

### Conflitos pendentes

- CONFLICTO-001 a CONFLICTO-013 permanecem abertos.
- `interactions`: objeto existente em `docs/sql/` não aprovado no MASTER SPEC. Pode ser reintroduzido via decisão explícita.

---

## 12.0-D.5 — RH Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `05_rh.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| candidates | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| candidate_documents | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| candidate_experiences | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| candidate_education | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| candidate_courses | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| candidate_languages | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| candidate_skills | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| skills | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| UUID | uuid_generate_v4() | Padronizado para gen_random_uuid() | CANONICAL |
| candidate como role | Não tratado | Não criado — candidate é DOMAIN | LEGACY |
| profiles/user_profiles | Não tratado | Não criado | LEGACY |
| user_id como identidade | Não tratado | Não usado | LEGACY |
| talent_pool_memberships | Presente em docs/sql/ | Não canônico — ausente do MASTER SPEC e FINAL MATRIX | EXCLUDED |
| candidate_profile_views | Presente em docs/sql/ | Não canônico — ausente do MASTER SPEC e FINAL MATRIX | EXCLUDED |

### Alterações em 05_rh.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `candidates` expandido: `source`, `expected_salary`, `availability`, `notes`, UNIQUE(tenant_id, person_id)
- Criadas tabelas de detalhamento: `candidate_documents`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`, `candidate_skills`
- `candidate_skills` com FK direta para `skills(id)` e UNIQUE(candidate_id, skill_id)
- `skills` criado com `is_global` e `tenant_id` para suportar GLOBAL e TENANT CUSTOM
- Excluídas tabelas não canônicas: `talent_pool_memberships`, `candidate_profile_views`
- Não criadas estruturas paralelas (`profiles`, `user_profiles`)

### Validações

| Item | Status |
|------|--------|
| candidates existe | ✅ |
| candidates.tenant_id existe | ✅ |
| candidates.person_id existe | ✅ |
| candidates UNIQUE(tenant_id, person_id) | ✅ |
| candidate_documents existe | ✅ |
| candidate_experiences existe | ✅ |
| candidate_education existe | ✅ |
| candidate_courses existe | ✅ |
| candidate_languages existe | ✅ |
| candidate_skills existe | ✅ |
| skills existe | ✅ |
| skills.is_global existe | ✅ |
| skills.tenant_id existe | ✅ |
| candidate_skills.skill_id FK para skills | ✅ |
| Nenhuma estrutura profile/user_profile | ✅ |
| Nenhum user_id como identidade | ✅ |
| UUID gen_random_uuid() | ✅ |
| tenant_id references tenants | ✅ |
| person_id references people | ✅ |

### Conflitos pendentes

- CONFLICTO-001 a CONFLICTO-013 permanecem abertos.
- `talent_pool_memberships`: existente em `docs/sql/` mas não aprovado no MASTER SPEC. Pode ser reintroduzido via decisão explícita.
- `candidate_profile_views`: existente em `docs/sql/` mas não aprovado no MASTER SPEC. Pode ser reintroduzido via decisão explícita.

---

## 12.0-D.6 — Recruitment Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `06_recruitment.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| jobs | company_id nullable, sem tenant_id | company_id NOT NULL, tenant_id NOT NULL | CANONICAL |
| applications | sem tenant_id | tenant_id NOT NULL adicionado | CANONICAL |
| application_status_history | sem tenant_id, sem changed_by_person_id | tenant_id NOT NULL, changed_by_person_id adicionado | CANONICAL |
| interviews | ligado a application_id | ligado a candidate_process_id | CANONICAL |
| stage_templates | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| recruitment_processes | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| recruitment_stages | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| candidate_processes | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| job_skills | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| interview_participants | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| interview_feedback | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| application_profile_snapshots | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| talent_pool_memberships | Presente em docs/sql/ | Não canônico — ausente do MASTER SPEC e FINAL MATRIX | EXCLUDED |
| job_matches | Presente em docs/sql/ | Não canônico — ausente do MASTER SPEC e FINAL MATRIX | EXCLUDED |
| candidate_profile_views | Presente em docs/sql/ | Não canônico — ausente do MASTER SPEC e FINAL MATRIX | EXCLUDED |
| UUID | uuid_generate_v4() | Padronizado para gen_random_uuid() | CANONICAL |

### Alterações em 06_recruitment.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `jobs.company_id` tornado NOT NULL (resolve CONFLICTO-011)
- `jobs.tenant_id` tornado NOT NULL
- `jobs` expandido: `description NOT NULL`, `requirements JSONB`, `schedule`, `contract_type`, `status DEFAULT 'active'`, `created_by`, `updated_by`
- `applications.tenant_id` adicionado como NOT NULL (resolve CONFLICTO-010)
- `applications` expandido: `source`, `cover_letter`, `applied_at`
- `application_status_history` expandido: `tenant_id NOT NULL`, `changed_by_person_id`, `notes`
- `application_status_history` marcado como APPEND-ONLY
- `interviews` reestruturado: `candidate_process_id` substitui `application_id`
- `interviews` expandido: `tenant_id`, `finished_at`, `result`
- Adicionadas tabelas: `stage_templates`, `recruitment_processes`, `recruitment_stages`, `candidate_processes`, `job_skills`, `interview_participants`, `interview_feedback`, `application_profile_snapshots`
- Excluídas tabelas não canônicas: `talent_pool_memberships`, `job_matches`, `candidate_profile_views`

### Validações

| Item | Status |
|------|--------|
| jobs existe | ✅ |
| jobs.tenant_id existe | ✅ |
| jobs.company_id existe | ✅ |
| jobs.company_id NOT NULL | ✅ |
| applications existe | ✅ |
| applications.tenant_id existe | ✅ |
| applications.tenant_id NOT NULL | ✅ |
| application_status_history existe | ✅ |
| application_status_history.tenant_id existe | ✅ |
| application_status_history.changed_by_person_id existe | ✅ |
| interviews existe | ✅ |
| interviews.tenant_id existe | ✅ |
| interviews.candidate_process_id existe | ✅ |
| stage_templates existe | ✅ |
| recruitment_processes existe | ✅ |
| recruitment_stages existe | ✅ |
| candidate_processes existe | ✅ |
| job_skills existe | ✅ |
| interview_participants existe | ✅ |
| interview_feedback existe | ✅ |
| application_profile_snapshots existe | ✅ |
| talent_pool_memberships não existe | ✅ |
| job_matches não existe | ✅ |
| candidate_profile_views não existe | ✅ |
| UUID gen_random_uuid() | ✅ |
| tenant_id references tenants | ✅ |
| person_id references people | ✅ |
| company_id references companies | ✅ |

### Conflitos pendentes

- CONFLICTO-001 a CONFLICTO-013 permanecem abertos.
- CONFLICTO-010 resolvido: `applications.tenant_id` adicionado como NOT NULL.
- CONFLICTO-011 resolvido: `jobs.company_id` tornado NOT NULL.
- `talent_pool_memberships`, `job_matches`, `candidate_profile_views`: existentes em `docs/sql/` mas não aprovados no MASTER SPEC nem na FINAL MATRIX. Podem ser reintroduzidos via decisão explícita.

---

## 12.0-D.7 — Employees Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `07_employees.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| employees | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| employee_contracts | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| employee_documents | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| employee_status_history | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| departments | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| positions | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| employee_positions | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| UUID | N/A | Padronizado para gen_random_uuid() | CANONICAL |
| employee como role | Não tratado | Não criado — employee é DOMAIN | LEGACY |
| profiles/user_profiles | Não tratado | Não criado | LEGACY |
| user_id como identidade | Não tratado | Não usado | LEGACY |

### Alterações em 07_employees.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `employees` com `tenant_id`, `person_id → people`, `company_id → companies`, UNIQUE(tenant_id, person_id)
- `employee_contracts` criado separado de `contracts` comerciais
- `employee_documents` criado para documentos de funcionário
- `employee_status_history` criado como APPEND-ONLY com `changed_by_person_id` e `reason`
- `departments` criado com auto-referência `parent_department_id` e `head_person_id → people`
- `positions` criado vinculado a `departments`
- `employee_positions` criado para múltiplos vínculos/posições por funcionário
- Não criadas identidades paralelas (`profiles`, `user_profiles`, `user_id`)
- Candidato e funcionário mantidos como domínios distintos

### Validações

| Item | Status |
|------|--------|
| employees existe | ✅ |
| employees.tenant_id existe | ✅ |
| employees.person_id existe | ✅ |
| employees.company_id existe | ✅ |
| employees UNIQUE(tenant_id, person_id) | ✅ |
| employee_contracts existe | ✅ |
| employee_documents existe | ✅ |
| employee_status_history existe | ✅ |
| departments existe | ✅ |
| positions existe | ✅ |
| employee_positions existe | ✅ |
| employee_status_history APPEND-ONLY | ✅ |
| Nenhuma estrutura profile/user_profile | ✅ |
| Nenhum user_id como identidade | ✅ |
| UUID gen_random_uuid() | ✅ |
| tenant_id references tenants | ✅ |
| person_id references people | ✅ |
| company_id references companies | ✅ |
| department_id references departments | ✅ |

### Conflitos pendentes

- CONFLICTO-001 a CONFLICTO-013 permanecem abertos.
- Nenhum conflito específico do domínio Employee identificado nesta etapa.

---

## 12.0-D.8 — Services Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `08_services.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| services | Simplificado | Mantido conforme legacy + V2.1 | CANONICAL |
| service_orders | Simplificado | Reescrito conforme V2.1 | CANONICAL |
| service_order_status_history | Com actor_person_id | Reescrito com changed_by_person_id, APPEND-ONLY | CANONICAL |
| service_categories | Não existe no MASTER SPEC | Não criado — ausente do MASTER SPEC | PENDENTE |
| service_plans | Não existe no MASTER SPEC | Não criado — ausente do MASTER SPEC | PENDENTE |
| service_items | Não existe no MASTER SPEC | Não criado — ausente do MASTER SPEC | PENDENTE |
| service_order_items | Não existe no MASTER SPEC | Não criado — ausente do MASTER SPEC | PENDENTE |
| service_order_assignments | Não existe no MASTER SPEC | Não criado — ausente do MASTER SPEC | PENDENTE |
| service_order_documents | Não existe no MASTER SPEC | Não criado — ausente do MASTER SPEC | PENDENTE |
| UUID | uuid_generate_v4() | Padronizado para gen_random_uuid() | CANONICAL |
| actor_person_id | Presente no legacy | Removido — substituído por changed_by_person_id | DEPRECATED |

### Alterações em 08_services.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `services` mantido conforme legacy com V2.1
- `service_orders` com `tenant_id NOT NULL`, `company_id → companies`, `service_id → services`
- `service_order_status_history` expandido: `tenant_id NOT NULL`, `changed_by_person_id → people`, `notes`
- `service_order_status_history` marcado como APPEND-ONLY
- Removido `actor_person_id` dos históricos
- Não criadas tabelas não aprovadas no MASTER SPEC: `service_categories`, `service_plans`, `service_items`, `service_order_items`, `service_order_assignments`, `service_order_documents`

### Validações

| Item | Status |
|------|--------|
| services existe | ✅ |
| services.tenant_id existe | ✅ |
| service_orders existe | ✅ |
| service_orders.tenant_id existe | ✅ |
| service_orders.company_id existe | ✅ |
| service_orders.service_id existe | ✅ |
| service_order_status_history existe | ✅ |
| service_order_status_history.tenant_id existe | ✅ |
| service_order_status_history.changed_by_person_id existe | ✅ |
| UUID gen_random_uuid() | ✅ |
| tenant_id references tenants | ✅ |
| person_id references people | ✅ |
| company_id references companies | ✅ |
| service_id references services | ✅ |
| Nenhuma identidade paralela | ✅ |
| actor_person_id não existe | ✅ |

### Conflitos pendentes

- `service_categories`, `service_plans`, `service_items`, `service_order_items`, `service_order_assignments`, `service_order_documents`: não existem no MASTER SPEC nem na FINAL MATRIX. Podem ser reintroduzidos via decisão explícita.

---

## 12.0-D.9 — Contracts Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `09_contracts.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| contracts | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| contract_status_history | Com actor_person_id | Reescrito com changed_by_person_id, APPEND-ONLY | CANONICAL |
| contract_items | Ausente | Adicionado conforme V2.1 | CANONICAL |
| contract_services | Ausente | Adicionado conforme V2.1 | CANONICAL |
| contract_documents | Ausente | Adicionado conforme V2.1 | CANONICAL |
| contract_versions | Ausente | Adicionado conforme V2.1 | CANONICAL |
| contract_obligations | Ausente | Adicionado conforme V2.1 | CANONICAL |
| contract_renewals | Ausente | Adicionado conforme V2.1 | CANONICAL |
| UUID | uuid_generate_v4() | Padronizado para gen_random_uuid() | CANONICAL |
| actor_person_id | Presente no legacy | Removido — substituído por changed_by_person_id | DEPRECATED |

### Alterações em 09_contracts.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `contracts` expandido: `type`, `start_date NOT NULL`, `end_date`, `periodicity`, `terms`, `status DEFAULT 'draft'`, `created_by`, `updated_by`
- `contracts` mantém `tenant_id NOT NULL` e `company_id NOT NULL → companies`
- `contract_status_history` expandido: `tenant_id NOT NULL`, `changed_by_person_id → people`, `notes`
- `contract_status_history` marcado como APPEND-ONLY
- Removido `actor_person_id` dos históricos
- Adicionadas tabelas: `contract_items`, `contract_services`, `contract_documents`, `contract_versions`, `contract_obligations`, `contract_renewals`
- Não criadas tabelas não aprovadas: `contract_parties`, `contract_events` (ausentes do MASTER SPEC e FINAL MATRIX)

### Validações

| Item | Status |
|------|--------|
| contracts existe | ✅ |
| contracts.tenant_id existe | ✅ |
| contracts.company_id existe | ✅ |
| contract_items existe | ✅ |
| contract_services existe | ✅ |
| contract_status_history existe | ✅ |
| contract_status_history.tenant_id existe | ✅ |
| contract_status_history.changed_by_person_id existe | ✅ |
| contract_documents existe | ✅ |
| contract_versions existe | ✅ |
| contract_obligations existe | ✅ |
| contract_renewals existe | ✅ |
| UUID gen_random_uuid() | ✅ |
| tenant_id references tenants | ✅ |
| person_id references people | ✅ |
| company_id references companies | ✅ |
| Nenhuma identidade paralela | ✅ |
| actor_person_id não existe | ✅ |
| contract_status_history APPEND-ONLY | ✅ |

### Conflitos pendentes

- CONFLICTO-001 a CONFLICTO-013 permanecem abertos.
- `contract_parties`, `contract_events`: não existem no MASTER SPEC nem na FINAL MATRIX. Podem ser reintroduzidos via decisão explícita.

---

## 12.0-D.10 — Suppliers Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `10_suppliers.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| suppliers | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| purchase_orders | Presente no legacy | Não incluso — pertence a D.13 Purchasing | DEFERRED |
| purchase_order_items | Presente no legacy | Não incluso — pertence a D.13 Purchasing | DEFERRED |
| UUID | uuid_generate_v4() | Padronizado para gen_random_uuid() | CANONICAL |

### Alterações em 10_suppliers.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `suppliers` expandido: `payment_terms`, `lead_time`, `notes`
- `suppliers` mantém `tenant_id NOT NULL` e `company_id NOT NULL → companies`
- Não inclusas tabelas de purchasing (`purchase_orders`, `purchase_order_items`) — reservadas para D.13

### Validações

| Item | Status |
|------|--------|
| suppliers existe | ✅ |
| suppliers.tenant_id existe | ✅ |
| suppliers.company_id existe | ✅ |
| UUID gen_random_uuid() | ✅ |
| tenant_id references tenants | ✅ |
| company_id references companies | ✅ |
| Nenhuma identidade paralela | ✅ |

### Conflitos pendentes

- CONFLICTO-001 a CONFLICTO-013 permanecem abertos.
- Nenhum conflito específico do domínio Suppliers identificado nesta etapa.

---

## 12.0-D.11 — Inventory Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `11_inventory.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| products | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| product_categories | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| warehouses | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| warehouse_locations | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| stock_balances | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| stock_movements | Simplificado | Reescrito conforme MASTER SPEC | CANONICAL |
| stock_entries | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| stock_exits | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| stock_inventory | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| stock_inventory_items | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| stock_adjustments | Ausente | Adicionado conforme MASTER SPEC | CANONICAL |
| third_party_custody | Presente no legacy | Não incluso — pertence a D.12 Custody | DEFERRED |
| third_party_custody_items | Presente no legacy | Não incluso — pertence a D.12 Custody | DEFERRED |
| suppliers | Presente no legacy | Não incluso — já tratado em D.10 | DEFERRED |
| purchase_orders | Presente no legacy | Não incluso — pertence a D.13 Purchasing | DEFERRED |
| purchase_order_items | Presente no legacy | Não incluso — pertence a D.13 Purchasing | DEFERRED |
| UUID | uuid_generate_v4() | Padronizado para gen_random_uuid() | CANONICAL |

### Alterações em 11_inventory.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `products` expandido: `sku`, `description`, `min_stock`
- `stock_movements` expandido: `warehouse_id`, `type`, `unit_cost`, `document_type`, `document_id`, `occurred_at`
- Adicionadas tabelas: `product_categories`, `warehouses`, `warehouse_locations`, `stock_balances`, `stock_entries`, `stock_exits`, `stock_inventory`, `stock_inventory_items`, `stock_adjustments`
- Não inclusas tabelas de custody (`third_party_custody`, `third_party_custody_items`) — reservadas para D.12
- Não inclusas tabelas de purchasing (`purchase_orders`, `purchase_order_items`) — reservadas para D.13
- `suppliers` não duplicado — já tratado em D.10

### Validações

| Item | Status |
|------|--------|
| products existe | ✅ |
| products.tenant_id existe | ✅ |
| product_categories existe | ✅ |
| warehouses existe | ✅ |
| warehouse_locations existe | ✅ |
| stock_balances existe | ✅ |
| stock_balances UNIQUE(product_id, warehouse_id, location_id) | ✅ |
| stock_movements existe | ✅ |
| stock_movements.warehouse_id existe | ✅ |
| stock_entries existe | ✅ |
| stock_exits existe | ✅ |
| stock_inventory existe | ✅ |
| stock_inventory_items existe | ✅ |
| stock_adjustments existe | ✅ |
| UUID gen_random_uuid() | ✅ |
| tenant_id references tenants | ✅ |
| person_id references people | ✅ |
| company_id references companies | ✅ |
| warehouse_id references warehouses | ✅ |
| product_id references products | ✅ |
| supplier_id references suppliers | ✅ |
| Nenhuma identidade paralela | ✅ |

### Conflitos pendentes

- CONFLICTO-001 a CONFLICTO-013 permanecem abertos.
- Nenhum conflito específico do domínio Inventory identificado nesta etapa.

---

## 12.0-D.12 — Custody Reconciliation

**Data:** 2026-08-19  
**Status:** PASS  
**Objetivo:** Reconciliar `12_custody.sql` contra MASTER SPEC, FINAL MATRIX e ARCHITECTURE DECISIONS.

### Decisões tomadas

| Objeto | Estado anterior | Decisão V2.1 | Resultado |
|--------|------------------|--------------|-----------|
| third_party_custody | Presente no legacy | Reescrito conforme MASTER SPEC | CANONICAL |
| third_party_custody_items | Presente no legacy | Reescrito com tenant_id e timestamps | CANONICAL |
| UUID | uuid_generate_v4() | Padronizado para gen_random_uuid() | CANONICAL |

### Alterações em 12_custody.sql

- Padronizado UUID para `gen_random_uuid()` (fonte: `pgcrypto`)
- `third_party_custody` com `tenant_id NOT NULL`, `company_id NOT NULL → companies`
- `third_party_custody_items` com `tenant_id NOT NULL`, `custody_id → third_party_custody`, `product_id → products`
- `third_party_custody_items` com `returned_quantity DEFAULT 0`, `created_at`, `updated_at`
- Não criadas tabelas adicionais de custody

### Validações

| Item | Status |
|------|--------|
| third_party_custody existe | ✅ |
| third_party_custody.tenant_id existe | ✅ |
| third_party_custody.company_id existe | ✅ |
| third_party_custody_items existe | ✅ |
| third_party_custody_items.custody_id existe | ✅ |
| third_party_custody_items.product_id existe | ✅ |
| third_party_custody_items.returned_quantity DEFAULT 0 | ✅ |
| UUID gen_random_uuid() | ✅ |
| tenant_id references tenants | ✅ |
| company_id references companies | ✅ |
| product_id references products | ✅ |
| Nenhuma identidade paralela | ✅ |

### Conflitos pendentes

- CONFLICTO-001 a CONFLICTO-013 permanecem abertos.
- Nenhum conflito específico do domínio Custody identificado nesta etapa.
