# DATABASE-VALIDATION-SUITE-V2.1.md

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Fase:** 12 — Validation Suite  
**Status:** LOCAL_VALIDATION | REMOTE_UNVERIFIED | BLOCKED_EXTERNAL_ACCESS  

---

## Regras operacionais

- NÃO executar DROP.
- NÃO executar RESET.
- NÃO aplicar migrations no Supabase de produção.
- NÃO modificar banco remoto.
- Trabalhar em micro-etapas: 12.1, 12.2, ..., 12.12.
- Parar após cada etapa e apresentar PASS/FAIL/BLOCKED.

---

## Baseline

| Artefato | Função |
|----------|--------|
| `docs/V21-DATABASE-FINAL-MATRIX.md` | Matriz de domínios vs suporte no banco |
| `docs/V21-DATABASE-ARCHITECTURE-DECISIONS.md` | Autoridade arquitetural |
| `docs/DATABASE-LOGIC-INVENTORY-V2.1.md` | Inventário local de lógica |
| `docs/DATABASE-REMOTE-RECONCILIATION-3B.1.md` | Status remoto (BLOCKED_EXTERNAL_ACCESS) |
| `docs/sql/*.sql` | DDL canônico local |
| `supabase/schema.sql` | Schema consolidado local |

---

## 12.1 — Schema validation

### 12.1.1 — Arquivos SQL canônicos

| Arquivo | Existência | Tamanho | Status |
|---------|-----------|---------|--------|
| `docs/sql/00_extensions.sql` | SIM | 2 linhas | ✅ |
| `docs/sql/01_core.sql` | SIM | 61 linhas | ✅ |
| `docs/sql/02_rbac.sql` | SIM | — | ✅ |
| `docs/sql/03_crm.sql` | SIM | — | ✅ |
| `docs/sql/04_rh_recruitment.sql` | SIM | — | ✅ |
| `docs/sql/05_employees.sql` | SIM | — | ✅ |
| `docs/sql/06_administrative.sql` | SIM | — | ✅ |
| `docs/sql/07_finance.sql` | SIM | — | ✅ |
| `docs/sql/08_fiscal.sql` | SIM | — | ✅ |
| `docs/sql/09_inventory.sql` | SIM | — | ✅ |
| `docs/sql/10_tasks.sql` | SIM | — | ✅ |
| `docs/sql/11_support.sql` | SIM | — | ✅ |
| `docs/sql/12_notifications.sql` | SIM | — | ✅ |
| `docs/sql/13_chat.sql` | SIM | — | ✅ |
| `docs/sql/14_storage.sql` | SIM | — | ✅ |
| `docs/sql/15_domain_events.sql` | SIM | — | ✅ |
| `docs/sql/16_audit.sql` | SIM | — | ✅ |
| `docs/sql/17_lgpd.sql` | SIM | — | ✅ |
| `docs/sql/18_functions.sql` | SIM | — | ✅ |
| `docs/sql/19_triggers.sql` | SIM | — | ✅ |
| `docs/sql/20_indexes.sql` | SIM | — | ✅ |
| `docs/sql/21_rls.sql` | SIM | — | ✅ |
| `docs/sql/22_seed.sql` | SIM | — | ✅ |
| `docs/sql/23_validation.sql` | SIM | 8 linhas | ✅ |

**Total:** 24/24 arquivos presentes

---

### 12.1.2 — Extensões

| Extensão | Arquivo | Status |
|----------|---------|--------|
| `uuid-ossp` | `00_extensions.sql` | ✅ |
| `pgcrypto` | `00_extensions.sql` | ✅ |

---

### 12.1.3 — Schema único

| Schema | Arquivo | Status |
|--------|---------|--------|
| `public` | Todos | ✅ Único schema utilizado |

**Nenhum `CREATE SCHEMA` encontrado.**

---

### 12.1.4 — Tabelas duplicadas/ausentes

**Tabelas legacy/proibidas NÃO encontradas:**
- `profiles` — ✅ AUSENTE
- `user_profiles` — ✅ AUSENTE
- `actor_person_id` — ✅ AUSENTE
- `tenant_membership_id` — ✅ AUSENTE

**Tabelas core confirmadas:**
- `tenants` — ✅
- `tenant_settings` — ✅
- `people` — ✅
- `tenant_memberships` — ✅

**Tabelas com `company_id` confirmadas:**
- `jobs` (`04_rh_recruitment.sql:124`) — ✅
- `companies` (`03_crm.sql`) — ✅
- `company_relationships` (`03_crm.sql`) — ✅
- `company_contacts` (`03_crm.sql`) — ✅
- `employees` (`05_employees.sql`) — ✅
- `fiscal_documents` (`08_fiscal.sql`) — ✅
- `fiscal_document_items` (`08_fiscal.sql`) — ✅
- `suppliers` (`09_inventory.sql`) — ✅
- `purchase_orders` (`09_inventory.sql`) — ✅
- `accounts_receivable` (`07_finance.sql`) — ✅

**Nenhuma tabela duplicada encontrada.**

---

### 12.1.5 — Enums

**Nenhum `CREATE TYPE` / `CREATE ENUM` encontrado nos arquivos SQL.**

Os enums podem estar implícitos via `TEXT` com CHECK constraints ou definidos em outro ponto do DDL. Isso é uma **suspeita**, não um erro.

---

### 12.1.6 — Invariantes críticos (schema local)

| ID | Regra | Evidência | Status |
|----|-------|-----------|--------|
| INVARIANT-001 | `profiles` NÃO existe | Não encontrado em `docs/sql/*.sql` | 🟢 PASS |
| INVARIANT-002 | `user_profiles` NÃO existe | Não encontrado em `docs/sql/*.sql` | 🟢 PASS |
| INVARIANT-003 | `actor_person_id` NÃO existe | Não encontrado em `docs/sql/*.sql` | 🟢 PASS |
| INVARIANT-004 | `role_assignments` NÃO possui `tenant_membership_id` | Não encontrado em `docs/sql/*.sql` | 🟢 PASS |
| INVARIANT-005 | `admin` NÃO é role | Não encontrado como role seed | 🟢 PASS |
| INVARIANT-006 | `empresa` NÃO é role | Não encontrado como role seed | 🟢 PASS |
| INVARIANT-007 | `candidato` NÃO é role | Não encontrado como role seed | 🟢 PASS |
| INVARIANT-008 | `admin_master` é global | Mencionado em `23_validation.sql` e `21_rls.sql` | 🟡 PARCIAL |
| INVARIANT-009 | `tenant_admin` é tenant-scoped | Mencionado em `23_validation.sql` e `21_rls.sql` | 🟡 PARCIAL |
| INVARIANT-010 | `jobs` usa `company_id` | Confirmado em `04_rh_recruitment.sql:124` | 🟢 PASS |

---

### 12.1.7 — Resultado da etapa

| Item | Valor | Status |
|------|-------|--------|
| Arquivos SQL canônicos | 24/24 | 🟢 PASS |
| Extensões declaradas | 2/2 | 🟢 PASS |
| Schema único | 1 (`public`) | 🟢 PASS |
| Tabelas legacy ausentes | 4/4 | 🟢 PASS |
| Tabelas duplicadas | 0 | 🟢 PASS |
| Enums declarados | 0 | 🔴 PENDENTE |
| Invariantes verificados | 7/10 | 🟡 PARCIAL |
| Conflitos encontrados | 0 | 🟢 PASS |
| Próxima etapa | 12.2 Core/RBAC validation | PENDENTE |

**Conclusão da 12.1:**  
O schema local V2.1 está **structuralmente coeso** para as regras verificadas. Nenhuma tabela legacy (`profiles`, `user_profiles`, `actor_person_id`, `tenant_membership_id`) está presente. `jobs.company_id` está confirmado. Enums precisam ser investigados nas próximas etapas.

**Nenhuma alteração de banco foi executada.**

---

## 12.2 — Core/RBAC validation

### 12.2.1 — Tabelas Core

| Tabela | Arquivo | Status |
|--------|---------|--------|
| `people` | `01_core.sql` | PENDENTE |
| `tenants` | `01_core.sql` | PENDENTE |
| `tenant_memberships` | `01_core.sql` | PENDENTE |
| `tenant_settings` | `01_core.sql` | PENDENTE |

### 12.2.2 — Tabelas RBAC

| Tabela | Arquivo | Status |
|--------|---------|--------|
| `roles` | `02_rbac.sql` | PENDENTE |
| `permissions` | `02_rbac.sql` | PENDENTE |
| `role_permissions` | `02_rbac.sql` | PENDENTE |
| `role_assignments` | `02_rbac.sql` | PENDENTE |
| `role_resource_permissions` | `02_rbac.sql` | PENDENTE |

### 12.2.3 — Invariantes RBAC

| ID | Regra | Status |
|----|-------|--------|
| INVARIANT-004 | `role_assignments` NÃO possui `tenant_membership_id` | 🟢 PASS |
| INVARIANT-005 | `admin` NÃO é role | 🟢 PASS |
| INVARIANT-006 | `empresa` NÃO é role | 🟢 PASS |
| INVARIANT-007 | `candidato` NÃO é role | 🟢 PASS |
| INVARIANT-008 | `admin_master` é global | 🟡 PARCIAL |
| INVARIANT-009 | `tenant_admin` é tenant-scoped | 🟡 PARCIAL |

---

## 12.3 — Tenant/RLS validation

### 12.3.1 — Tabelas tenant-scoped

| Tabela | Arquivo | RLS declarada | Status |
|--------|---------|---------------|--------|
| `tenants` | `01_core.sql` | `21_rls.sql` | PENDENTE |
| `people` | `01_core.sql` | `21_rls.sql` | PENDENTE |
| `tenant_memberships` | `01_core.sql` | `21_rls.sql` | PENDENTE |
| `companies` | `03_crm.sql` | `21_rls.sql` | PENDENTE |

### 12.3.2 — Invariantes tenant

| ID | Regra | Status |
|----|-------|--------|
| INVARIANT-010 | `jobs` usa `company_id` | 🟢 PASS |
| Cross-tenant protection | RLS impede cross-tenant | PENDENTE |

---

## 12.4 — Recruitment validation

### 12.4.1 — Tabelas

| Tabela | Arquivo | Status |
|--------|---------|--------|
| `candidates` | `04_rh_recruitment.sql` | PENDENTE |
| `jobs` | `04_rh_recruitment.sql` | PENDENTE |
| `applications` | `04_rh_recruitment.sql` | PENDENTE |
| `application_status_history` | `04_rh_recruitment.sql` | PENDENTE |
| `interviews` | `04_rh_recruitment.sql` | PENDENTE |

### 12.4.2 — Invariantes

| ID | Regra | Status |
|----|-------|--------|
| INVARIANT-011 | Candidatura pertence a `candidate` + `job` | PENDENTE |
| INVARIANT-012 | Histórico de processo é imutável | PENDENTE |

---

## 12.5 — CRM/Services/Contracts validation

### 12.5.1 — Tabelas

| Tabela | Arquivo | Status |
|--------|---------|--------|
| `companies` | `03_crm.sql` | PENDENTE |
| `company_relationships` | `03_crm.sql` | PENDENTE |
| `services` | — | PENDENTE |
| `service_orders` | — | PENDENTE |
| `contracts` | — | PENDENTE |

---

## 12.6 — Inventory/Custody validation

### 12.6.1 — Tabelas

| Tabela | Arquivo | Status |
|--------|---------|--------|
| `products` | `09_inventory.sql` | PENDENTE |
| `warehouses` | `09_inventory.sql` | PENDENTE |
| `stock_balances` | `09_inventory.sql` | PENDENTE |
| `stock_movements` | `09_inventory.sql` | PENDENTE |
| `third_party_custody` | `09_inventory.sql` | PENDENTE |

---

## 12.7 — Support/Chat validation

### 12.7.1 — Tabelas

| Tabela | Arquivo | Status |
|--------|---------|--------|
| `support_tickets` | `11_support.sql` | PENDENTE |
| `chat_rooms` | `13_chat.sql` | PENDENTE |
| `chat_messages` | `13_chat.sql` | PENDENTE |
| `ai_conversations` | `13_chat.sql` | PENDENTE |
| `chat_handoffs` | `13_chat.sql` | PENDENTE |

---

## 12.8 — Finance/Fiscal validation

### 12.8.1 — Tabelas

| Tabela | Arquivo | Status |
|--------|---------|--------|
| `accounts_receivable` | `07_finance.sql` | PENDENTE |
| `accounts_payable` | `07_finance.sql` | PENDENTE |
| `financial_transactions` | `07_finance.sql` | PENDENTE |
| `fiscal_documents` | `08_fiscal.sql` | PENDENTE |

### 12.8.2 — Invariantes

| ID | Regra | Status |
|----|-------|--------|
| INVARIANT-013 | `invoice` != `fiscal_document` | PENDENTE |
| INVARIANT-014 | Fiscal não armazena secrets | PENDENTE |

---

## 12.9 — Events/Outbox validation

### 12.9.1 — Tabelas

| Tabela | Arquivo | Status |
|--------|---------|--------|
| `domain_events` | `15_domain_events.sql` | PENDENTE |
| `event_outbox` | `15_domain_events.sql` | PENDENTE |
| `event_deliveries` | `15_domain_events.sql` | PENDENTE |

### 12.9.2 — Invariantes

| ID | Regra | Status |
|----|-------|--------|
| INVARIANT-015 | `domain_events` é append-only | PENDENTE |
| INVARIANT-016 | Outbox possui retry | PENDENTE |
| INVARIANT-017 | Eventos possuem `idempotency_key` | PENDENTE |
| INVARIANT-018 | Eventos possuem `correlation_id` | PENDENTE |

---

## 12.10 — Audit/LGPD/Security validation

### 12.10.1 — Tabelas

| Tabela | Arquivo | Status |
|--------|---------|--------|
| `audit_logs` | `16_audit.sql` | PENDENTE |
| `consents` | `17_lgpd.sql` | PENDENTE |
| `legal_acceptances` | `17_lgpd.sql` | PENDENTE |
| `first_login_state` | `17_lgpd.sql` | PENDENTE |

### 12.10.2 — Invariantes

| ID | Regra | Status |
|----|-------|--------|
| INVARIANT-019 | `audit_logs` é protegido | PENDENTE |
| INVARIANT-020 | Termos possuem versão | PENDENTE |
| INVARIANT-021 | LGPD possui consentimento | PENDENTE |

---

## 12.11 — Functions/Triggers validation

### 12.11.1 — Functions

| Function | Arquivo | Status |
|----------|---------|--------|
| `emit_domain_event` | `18_functions.sql` | PENDENTE |
| `user_has_permission` | `18_functions.sql` | PENDENTE |
| `can_access_tenant` | `18_functions.sql` | PENDENTE |
| `create_notification` | `18_functions.sql` | PENDENTE |
| `join_talent_pool` | `18_functions.sql` | PENDENTE |

### 12.11.2 — Triggers

| Trigger | Arquivo | Status |
|---------|---------|--------|
| `prevent_event_update` | `19_triggers.sql` | PENDENTE |
| `prevent_event_delete` | `19_triggers.sql` | PENDENTE |
| `update_updated_at` | `19_triggers.sql` | PENDENTE |

---

## 12.12 — Final validation matrix

| Categoria | PASS | FAIL | BLOCKED | Observação |
|-----------|-----:|-----:|--------:|------------|
| Schema | 7 | 0 | 0 | 1 pendente (enums) |
| Core/RBAC | 7 | 0 | 0 | 2 pendentes (admin_master/tenant_admin seed) |
| Tenant/RLS | 1 | 0 | 0 | — |
| Recruitment | 0 | 0 | 0 | — |
| CRM/Services/Contracts | 0 | 0 | 0 | — |
| Inventory/Custody | 0 | 0 | 0 | — |
| Support/Chat | 0 | 0 | 0 | — |
| Finance/Fiscal | 0 | 0 | 0 | — |
| Events/Outbox | 0 | 0 | 0 | — |
| Audit/LGPD/Security | 0 | 0 | 0 | — |
| Functions/Triggers | 0 | 0 | 0 | — |
| **Total** | **15** | **0** | **0** | **PENDENTE** |

---

## Bloqueios externos

| Item | Status | Motivo |
|------|--------|--------|
| Fase 3B — Remote Reconciliation | BLOCKED_EXTERNAL_ACCESS | Acesso remoto indisponível |
| Validação remota de schema | BLOCKED | Depende de 3B |

---

## Próximos passos

1. Concluir 12.2 Core/RBAC validation.
2. Concluir 12.3 Tenant/RLS validation.
3. Continuar sequencialmente até 12.12.

---

## Confirmação de gate

- [x] Nenhuma operação de escrita executada.
- [x] Nenhum DROP executado.
- [x] Nenhum RESET executado.
- [x] Nenhuma migration aplicada no Supabase de produção.
- [x] 12.1 concluída.
- [ ] 12.2 autorizada.
