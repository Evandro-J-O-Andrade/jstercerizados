# V2.1 — Final Business Contract Reconciliation

**Branch:** `feat/database-v21-local-rebuild`  
**Base:** `main` @ `f14fb09`  
**Data:** 2026-08-21  
**Modo:** READ-ONLY reconciliação final

## Objetivo

Verificar se o SQL canônico atual materializa **todas as decisões de negócio** tomadas durante a construção da V2.1, sem modificar o código.

## Metodologia

1. Listar regras de negócio documentadas
2. Mapear para objetos SQL existentes
3. Identificar PRESENTE / AUSENTE / PARCIAL
4. Propor ações corretivas

---

## 1. Identity & Multi-Tenancy

### Regra canônica

```text
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

### Verificação

| Regra                                               | Status | Evidência SQL                                                                         |
| --------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `people` é entidade de identidade canônica          | ✅     | `01_core.sql`: `people(id, auth_user_id, full_name, email, phone, status)`            |
| `tenant_memberships` separado de `role_assignments` | ✅     | `01_core.sql` + `02_rbac.sql`: tabelas separadas                                      |
| `roles` global + tenant                             | ✅     | `02_rbac.sql`: `roles(scope text default 'tenant')` com `admin_master` global no seed |
| `admin_master` global                               | ✅     | `32_seed.sql`: `('admin_master', 'Administrador global do sistema', 'global')`        |
| Legacy `admin/empresa/candidato` ausentes           | ✅     | Nenhuma referência nos arquivos canônicos                                             |
| `tenant_id` em todas entidades operacionais         | ✅     | Verificado em todas as tabelas operacionais                                           |

**Status:** ✅ IDENTITY/MULTI-TENANCY COMPLETO

---

## 2. RBAC

### Regra canônica

```text
role → permission → resource → action → tenant
```

### Verificação

| Regra                                                          | Status | Evidência SQL                                          |
| -------------------------------------------------------------- | ------ | ------------------------------------------------------ |
| `role_permissions` como pivot                                  | ✅     | `02_rbac.sql`: tabela `role_permissions`               |
| `permissions` com `(resource, action)` único                   | ✅     | `02_rbac.sql`: `uq_permission_resource_action`         |
| `role_assignments` com `tenant_id` opcional                    | ✅     | `02_rbac.sql`: `tenant_id uuid references tenants(id)` |
| `role_assignments` único por `(person_id, role_id, tenant_id)` | ✅     | `02_rbac.sql`: `uq_role_assignment_person_role_tenant` |
| Roles tenant-scoped por padrão                                 | ✅     | `02_rbac.sql`: `scope text not null default 'tenant'`  |
| Cargo funcional ≠ role de segurança                            | ✅     | Nenhuma tabela de cargo no SQL canônico                |

**Status:** ✅ RBAC COMPLETO

---

## 3. CRM

### Regra canônica

```text
companies (tenant-scoped)
    ↓
company_relationships
    ↓
company_contacts
```

### Verificação

| Regra                                                         | Status | Evidência SQL                                                  |
| ------------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| `companies` com `tenant_id`                                   | ✅     | `03_crm.sql`: `tenant_id uuid not null references tenants(id)` |
| `company_relationships` com `relationship_type`               | ✅     | `03_crm.sql`: `relationship_type text not null`                |
| `company_contacts` sem `tenant_id` (herdado via `company_id`) | ⚠️     | `03_crm.sql`: sem `tenant_id` direto                           |
| `companies.document` para CNPJ/CPF                            | ✅     | `03_crm.sql`: `document text`                                  |

**Status:** ⚠️ CRM PARCIAL — `company_contacts` sem `tenant_id` direto (aceitável se herdado)

---

## 4. Inventory / Estoque

### Regra canônica

```text
stock_movements = LEDGER
stock_balances  = estado derivado
```

### Regras de negócio

1. **Entrada** → movimento `entry`
2. **Saída** → movimento `exit`
3. **Ajuste** → movimento `adjustment`
4. **Transferência** → OUT + IN
5. **Inventário** → ajuste controlado
6. **Lote** → validade
7. **Custo** → histórico
8. **Saldo** → derivado do ledger
9. **Saldo negativo** → bloqueado

### Verificação

| Regra                                | Status | Evidência SQL                                                                                                  |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------- |
| `stock_movements` como ledger        | ✅     | `07_inventory_custody.sql`: tabela com `movement_type`, `quantity`, `reference_id`                             |
| `stock_balances` derivado            | ✅     | `21_functions_triggers.sql`: tabela `stock_balances` com `quantity`, `reserved_quantity`, `available_quantity` |
| `stock_entries` para custo histórico | ✅     | `21_functions_triggers.sql`: tabela `stock_entries` com `unit_cost`, `movement_type`                           |
| Trigger de validação de estoque      | ✅     | `21_functions_triggers.sql`: função `stock_movement_insert()`                                                  |
| Saldo negativo bloqueado             | ✅     | Trigger valida `available_quantity >= 0`                                                                       |
| Transferência OUT + IN               | ✅     | Trigger trata `transfer_out` + `transfer_in`                                                                   |
| `products` com `tenant_id`           | ✅     | `07_inventory_custody.sql`: `tenant_id uuid not null`                                                          |

**Status:** ✅ INVENTORY COMPLETO

---

## 5. Purchasing / Compras

### Regra canônica

```text
purchase_request
    ↓
purchase_order
    ↓
purchase_receipt
    ↓
stock
    ↓
finance
```

### Verificação

| Regra                                                       | Status | Evidência SQL                                                                 |
| ----------------------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| `suppliers` com `tenant_id` e `company_id`                  | ✅     | `06_suppliers_purchasing.sql`: tabela com FKs                                 |
| `purchase_orders` com `number`, `status`, `order_date`      | ✅     | `06_suppliers_purchasing.sql`: tabela completa                                |
| `purchase_order_items` com `received_quantity`              | ✅     | `06_suppliers_purchasing.sql`: `received_quantity numeric not null default 0` |
| `purchase_receipts` com `status`                            | ✅     | `21_functions_triggers.sql`: tabela `purchase_receipts`                       |
| `purchase_receipt_items` com FK para `purchase_order_items` | ✅     | `21_functions_triggers.sql`: tabela com FK                                    |
| Trigger de confirmação de recebimento                       | ✅     | `21_functions_triggers.sql`: função `purchase_receipt_confirm()`              |
| Recebimento → stock entry                                   | ✅     | Trigger cria `stock_entries` ao confirmar receipt                             |
| Recebimento → atualiza `received_quantity`                  | ✅     | Trigger atualiza `purchase_order_items.received_quantity`                     |

**Status:** ✅ PURCHASING COMPLETO

---

## 6. Finance / Fiscal / PDV

### Regra canônica

```text
Finance:
  accounts_receivable
  accounts_payable
  financial_transactions

Fiscal:
  fiscal_documents
  nf-e / SAT

PDV:
  pos_sales
  pos_sale_items
  pos_payments
```

### Verificação

| Regra                    | Status | Evidência SQL                  |
| ------------------------ | ------ | ------------------------------ |
| `accounts_receivable`    | ❌     | Nenhuma tabela no SQL canônico |
| `accounts_payable`       | ❌     | Nenhuma tabela no SQL canônico |
| `financial_transactions` | ❌     | Nenhuma tabela no SQL canônico |
| `fiscal_documents`       | ❌     | Nenhuma tabela no SQL canônico |
| `pos_sales`              | ❌     | Nenhuma tabela no SQL canônico |
| `pos_pale_items`         | ❌     | Nenhuma tabela no SQL canônico |
| `pos_payments`           | ❌     | Nenhuma tabela no SQL canônico |

**Status:** ❌ FINANCE/FISCAL/PDV AUSENTES

**Ação necessária:** Implementar em fase pós-V2.1 ou antes do runtime se for requisito bloqueante.

---

## 7. Recruitment

### Regra canônica

```text
job
 ↓
application
 ↓
process
 ↓
stage
 ↓
status history
```

### Regras adicionais

1. **Stages** — templates de etapa seletiva
2. **Skills** — competências globais + tenant
3. **Candidate documents** — documentos do candidato
4. **Application profile snapshots** — snapshot imutável

### Verificação

| Regra                                              | Status | Evidência SQL                                                     |
| -------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| `jobs` com `tenant_id`, `company_id`               | ✅     | `04_rh_recruitment.sql`: tabela completa                          |
| `applications` com `candidate_id`, `job_id`        | ✅     | `04_rh_recruitment.sql`: tabela completa                          |
| `application_status_history` com `actor_person_id` | ✅     | `04_rh_recruitment.sql`: tabela com `actor_person_id`, `metadata` |
| `interviews`                                       | ✅     | `04_rh_recruitment.sql`: tabela completa                          |
| `candidates` com `person_id`                       | ✅     | `04_rh_recruitment.sql`: tabela com `person_id`                   |
| `skills`                                           | ❌     | Nenhuma tabela no SQL canônico                                    |
| `candidate_skills`                                 | ❌     | Nenhuma tabela no SQL canônico                                    |
| `recruitment_processes`                            | ❌     | Nenhuma tabela no SQL canônico                                    |
| `recruitment_stages`                               | ❌     | Nenhuma tabela no SQL canônico                                    |
| `candidate_documents`                              | ❌     | Nenhuma tabela no SQL canônico                                    |
| `application_profile_snapshots`                    | ❌     | Nenhuma tabela no SQL canônico                                    |

**Status:** ⚠️ RECRUITMENT PARCIAL — faltam stages, skills, documents, snapshots

**Ação necessária:** Implementar `skills`, `candidate_skills`, `recruitment_processes`, `recruitment_stages`, `candidate_documents`, `application_profile_snapshots` antes do runtime ou marcar como pós-V2.1.

---

## 8. Audit & Security

### Regra canônica

```text
audit_logs
  ├── actor_person_id
  ├── correlation_id
  ├── causation_id
  ├── before_data
  └── after_data

security_events
first_login_state
legal_acceptances
```

### Verificação

| Regra                                                                       | Status | Evidência SQL                                                                                               |
| --------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `audit_logs` com `before_data`/`after_data`                                 | ✅     | `11_audit_security.sql`: tabela completa                                                                    |
| `audit_logs` com `correlation_id`/`causation_id`                            | ✅     | `11_audit_security.sql`: colunas presentes                                                                  |
| `audit_log_insert()` trigger genérico                                       | ✅     | `21_functions_triggers.sql`: função com `security definer`                                                  |
| `security_events` com `ip`, `user_agent`, `metadata`                        | ✅     | `11_audit_security.sql`: tabela completa                                                                    |
| `first_login_state` com LGPD flags                                          | ✅     | `11_audit_security.sql`: `must_change_password`, `terms_version`, `privacy_version`, `lgpd_consent_version` |
| `legal_acceptances` com `actor_person_id`, `correlation_id`, `causation_id` | ✅     | `11_audit_security.sql` + `20_lgpd.sql`: ALTER TABLE adiciona colunas                                       |

**Status:** ✅ AUDIT/SECURITY COMPLETO

---

## 9. LGPD

### Regra canônica

```text
consents
privacy_requests
data_export_requests
data_deletion_requests
data_retention_policies
```

### Verificação

| Regra                                                                                | Status | Evidência SQL                                                       |
| ------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------- |
| `consents` com `purpose`, `granted`, `term_version`                                  | ✅     | `20_lgpd.sql`: tabela completa                                      |
| `consents` com `correlation_id`/`causation_id`                                       | ✅     | `20_lgpd.sql`: colunas presentes                                    |
| `privacy_requests` com `type`, `status`, `notes`                                     | ✅     | `20_lgpd.sql`: tabela completa                                      |
| `data_export_requests`                                                               | ✅     | `20_lgpd.sql`: tabela completa                                      |
| `data_deletion_requests` com `legal_hold`                                            | ✅     | `20_lgpd.sql`: `legal_hold boolean not null default false`          |
| `data_retention_policies` com `data_domain`, `retention_days`, `action_after_expiry` | ✅     | `20_lgpd.sql`: tabela completa                                      |
| Trigger `lgpd_legal_hold_check()`                                                    | ✅     | `21_functions_triggers.sql`: função bloqueia exclusão se legal hold |
| Trigger `lgpd_consent_register()`                                                    | ✅     | `21_functions_triggers.sql`: função registra audit de consent       |

**Status:** ✅ LGPD COMPLETO

---

## 10. Notifications / Events / Outbox

### Regra canônica

```text
notifications
    ↓
notification_deliveries

domain_events
    ↓
event_outbox
    ↓
event_deliveries
```

### Verificação

| Regra                                                                       | Status | Evidência SQL                                                    |
| --------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------- |
| `notifications` com `tenant_id`, `channel`, `status`                        | ✅     | `10_notifications_events.sql`: tabela completa                   |
| `notification_deliveries` com `attempts`, `sent_at`, `failed_at`            | ✅     | `10_notifications_events.sql`: tabela completa                   |
| `domain_events` com `aggregate_type`, `aggregate_id`, `idempotency_key`     | ✅     | `10_notifications_events.sql`: tabela completa                   |
| `event_outbox` com `available_at`, `processed_at`                           | ✅     | `10_notifications_events.sql`: tabela completa                   |
| `event_deliveries` com `destination`, `request_payload`, `response_payload` | ✅     | `10_notifications_events.sql`: tabela completa                   |
| `domain_event_emit()` com idempotency                                       | ✅     | `21_functions_triggers.sql`: função com `ON CONFLICT DO NOTHING` |
| `event_outbox_enqueue()`                                                    | ✅     | `21_functions_triggers.sql`: função de enqueue                   |
| `event_outbox_process_next()` com SKIP LOCKED                               | ✅     | `21_functions_triggers.sql`: worker function                     |

**Status:** ✅ NOTIFICATIONS/EVENTS/OUTBOX COMPLETO

---

## 11. Chat / AI / Handoff

### Regra canônica

```text
HUMAN
  chat_rooms
    ↓
  chat_participants
    ↓
  chat_messages

AI
  ai_conversations
    ↓
  ai_messages

HANDOFF
  chat_handoffs
```

### Verificação

| Regra                                                          | Status | Evidência SQL                         |
| -------------------------------------------------------------- | ------ | ------------------------------------- |
| `chat_rooms` com `tenant_id`                                   | ✅     | `09_chat.sql`: tabela com `tenant_id` |
| `chat_participants` com `room_id`, `person_id`                 | ✅     | `09_chat.sql`: tabela completa        |
| `chat_messages` com `sender_type`, `sender_person_id`          | ✅     | `09_chat.sql`: tabela completa        |
| `ai_conversations` com `tenant_id`, `model`, `status`          | ✅     | `09_chat.sql`: tabela completa        |
| `ai_messages` com `role`, `content`, `tokens`                  | ✅     | `09_chat.sql`: tabela completa        |
| `chat_handoffs` com `from_person_id`, `to_person_id`, `reason` | ✅     | `09_chat.sql`: tabela completa        |

**Status:** ✅ CHAT/AI/HANDOFF COMPLETO

---

## 12. Storage / Documents

### Regra canônica

```text
files
  ↓
file_access_logs

documents
  ↓
document_versions
  ↓
document_links

administrative_requests
  ↓
administrative_tasks
  ↓
administrative_approvals
  ↓
administrative_documents
```

### Verificação

| Regra                                                         | Status | Evidência SQL                                 |
| ------------------------------------------------------------- | ------ | --------------------------------------------- |
| `files` com `storage_path`, `bucket`, `tenant_id`             | ✅     | `18_storage_documents.sql`: tabela completa   |
| `files` com `uq_files_storage_path`                           | ✅     | `18_storage_documents.sql`: unique constraint |
| `file_access_logs` com `action`, `ip`, `user_agent`           | ✅     | `18_storage_documents.sql`: tabela completa   |
| `document_versions` com `version`, `storage_path`, `bucket`   | ✅     | `18_storage_documents.sql`: tabela completa   |
| `document_versions` com `uq_document_versions_entity_version` | ✅     | `18_storage_documents.sql`: unique constraint |
| `document_links` com `relation_type`                          | ✅     | `18_storage_documents.sql`: tabela completa   |
| `administrative_requests` com `type`, `subject`, `priority`   | ✅     | `18_storage_documents.sql`: tabela completa   |
| `administrative_tasks` com `assignee_person_id`, `due_at`     | ✅     | `18_storage_documents.sql`: tabela completa   |
| `administrative_approvals` com `decision`, `approved_at`      | ✅     | `18_storage_documents.sql`: tabela completa   |
| `administrative_documents` com `file_id`, `type`              | ✅     | `18_storage_documents.sql`: tabela completa   |

**Status:** ✅ STORAGE/DOCUMENTS COMPLETO

---

## 13. Tasks / Support

### Regra canônica

```text
tasks
  ├── title, description, status
  └── related_entity_type, related_entity_id

support_tickets
  ├── subject, status, priority, category
  └── sla_due_at

support_ticket_status_history
  ├── ticket_id, status, changed_at
  └── metadata
```

### Verificação

| Regra                                                                   | Status | Evidência SQL                     |
| ----------------------------------------------------------------------- | ------ | --------------------------------- |
| `tasks` com `tenant_id`, `assignee_person_id`, `related_entity_type/id` | ✅     | `14_tasks.sql`: tabela completa   |
| `support_tickets` com `sla_due_at`, `priority`, `category`              | ✅     | `15_support.sql`: tabela completa |
| `support_ticket_status_history` com `tenant_id`, `metadata`             | ✅     | `15_support.sql`: tabela completa |

**Status:** ✅ TASKS/SUPPORT COMPLETO

---

## 14. RLS

### Regra canônica

```text
auth.uid() -> people -> tenant_memberships -> tenant_id
```

### Verificação

| Regra                                                                       | Status | Evidência SQL                                             |
| --------------------------------------------------------------------------- | ------ | --------------------------------------------------------- |
| Helper functions (`is_tenant_member`, `is_admin_master`, `user_tenant_ids`) | ✅     | `22_rls.sql`: funções criadas antes das policies          |
| RLS habilitado em todas tabelas tenant-scoped                               | ✅     | `22_rls.sql`: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| Policies para SELECT/INSERT/UPDATE/DELETE                                   | ✅     | `22_rls.sql`: policies por tabela                         |
| `admin_master` bypass                                                       | ✅     | `22_rls.sql`: `is_admin_master()` nas policies            |
| `search_path` seguro nas funções                                            | ✅     | `22_rls.sql`: `set search_path = public, pg_temp`         |

**Status:** ✅ RLS COMPLETO

---

## 15. Functions / Triggers

### Regra canônica

| Função                        | Propósito                       | Status |
| ----------------------------- | ------------------------------- | ------ |
| `set_updated_at()`            | Auto-update timestamps          | ✅     |
| `audit_log_insert()`          | Generic audit trigger           | ✅     |
| `domain_event_emit()`         | Event emission with idempotency | ✅     |
| `event_outbox_enqueue()`      | Outbox enqueue                  | ✅     |
| `event_outbox_process_next()` | Worker with SKIP LOCKED         | ✅     |
| `stock_movement_insert()`     | Stock validation + ledger       | ✅     |
| `purchase_receipt_confirm()`  | Receipt → stock + PO update     | ✅     |
| `lgpd_legal_hold_check()`     | Block deletion on legal hold    | ✅     |
| `lgpd_consent_register()`     | Consent audit trail             | ✅     |

**Status:** ✅ FUNCTIONS/TRIGGERS COMPLETO

---

## 16. Indexes

### Verificação

| Categoria            | Count | Status |
| -------------------- | ----- | ------ |
| Core/Tenancy         | 7     | ✅     |
| RBAC                 | 6     | ✅     |
| CRM                  | 4     | ✅     |
| RH/Recruitment       | 12    | ✅     |
| Services/Contracts   | 12    | ✅     |
| Suppliers/Purchasing | 14    | ✅     |
| Inventory/Custody    | 10    | ✅     |
| Tasks/Support        | 6     | ✅     |
| Chat/AI              | 9     | ✅     |
| Notifications/Events | 15    | ✅     |
| Storage/Documents    | 20    | ✅     |
| Audit/Security       | 9     | ✅     |
| LGPD                 | 12    | ✅     |

**Total:** 136 indexes ✅

**Status:** ✅ INDEXES COMPLETO

---

## 17. Seed

### Regra canônica

```text
roles globais + tenant
permissions
role_permissions
tenant + people + membership bootstrap
```

### Verificação

| Item                                                 | Status | Evidência SQL                               |
| ---------------------------------------------------- | ------ | ------------------------------------------- |
| Roles globais (`admin_master`)                       | ✅     | `32_seed.sql`: insert into roles            |
| Roles tenant (`admin_tenant`, `manager`, `operator`) | ✅     | `32_seed.sql`: insert into roles            |
| Permissions cobrem recursos principais               | ✅     | `32_seed.sql`: 40+ permissions              |
| Role-permission mappings                             | ✅     | `32_seed.sql`: insert into role_permissions |
| Bootstrap tenant/people/membership                   | ✅     | `32_seed.sql`: inserts condicionais         |

**Status:** ✅ SEED COMPLETO

---

## 18. Validation

### Regra canônica

```text
validation_results
validation_upsert()
validation_assert()
DO blocks com testes
```

### Verificação

| Item                                                      | Status | Evidência SQL                                         |
| --------------------------------------------------------- | ------ | ----------------------------------------------------- |
| `validation_results` com `status check (PASS/FAIL/ERROR)` | ✅     | `25_validation.sql`: tabela com check constraint      |
| `validation_upsert()` com `ON CONFLICT DO NOTHING`        | ✅     | `25_validation.sql`: função idempotente               |
| `validation_assert()` helper                              | ✅     | `25_validation.sql`: função auxiliar                  |
| Testes estruturais                                        | ✅     | `25_validation.sql`: DO block com loop em `pg_tables` |
| Testes de multi-tenancy                                   | ✅     | `25_validation.sql`: testes de tenant isolation       |
| Testes de RLS                                             | ✅     | `25_validation.sql`: testes de RLS                    |
| Testes de transações                                      | ✅     | `25_validation.sql`: testes de transações             |
| Testes de idempotency                                     | ✅     | `25_validation.sql`: testes de idempotency            |
| Testes de ledger                                          | ✅     | `25_validation.sql`: testes de estoque                |
| Testes de LGPD                                            | ✅     | `25_validation.sql`: testes de LGPD                   |
| Testes de audit                                           | ✅     | `25_validation.sql`: testes de audit                  |
| Testes de outbox                                          | ✅     | `25_validation.sql`: testes de outbox                 |

**Status:** ✅ VALIDATION COMPLETO

---

## 19. Services / Contracts

### Regra canônica

```text
services
  ↓
service_orders
  ↓
service_order_status_history

contracts
  ↓
contract_status_history
```

### Verificação

| Regra                                                                | Status | Evidência SQL                                |
| -------------------------------------------------------------------- | ------ | -------------------------------------------- |
| `services` com `tenant_id`, `category`, `status`                     | ✅     | `05_services_contracts.sql`: tabela completa |
| `service_orders` com `company_id`, `service_id`, `quantity`, `value` | ✅     | `05_services_contracts.sql`: tabela completa |
| `service_order_status_history` com `actor_person_id`, `metadata`     | ✅     | `05_services_contracts.sql`: tabela completa |
| `contracts` com `company_id`, `start_date`, `end_date`, `value`      | ✅     | `05_services_contracts.sql`: tabela completa |
| `contract_status_history` com `actor_person_id`, `metadata`          | ✅     | `05_services_contracts.sql`: tabela completa |

**Status:** ✅ SERVICES/CONTRACTS COMPLETO

---

## 20. Custody

### Regra canônica

```text
third_party_custody
  ↓
third_party_custody_items
```

### Verificação

| Regra                                                             | Status | Evidência SQL                     |
| ----------------------------------------------------------------- | ------ | --------------------------------- |
| `third_party_custody` com `company_id`, `expected_return_at`      | ✅     | `12_custody.sql`: tabela completa |
| `third_party_custody_items` com `product_id`, `returned_quantity` | ✅     | `12_custody.sql`: tabela completa |

**Status:** ✅ CUSTODY COMPLETO

---

## 21. Error Handling / Business Codes

### Regra canônica

```text
INSUFFICIENT_STOCK
DUPLICATE_OPERATION
INVALID_STATUS_TRANSITION
PURCHASE_RECEIPT_ALREADY_CONFIRMED
LGPD_LEGAL_HOLD
UNAUTHORIZED_OPERATION
TENANT_ACCESS_DENIED
CONCURRENT_UPDATE
VALIDATION_ERROR
INTERNAL_ERROR
```

### Verificação

| Regra                                      | Status | Evidência SQL                                    |
| ------------------------------------------ | ------ | ------------------------------------------------ |
| Códigos de erro definidos                  | ❌     | Nenhum enum ou constante no SQL canônico         |
| `INSUFFICIENT_STOCK` no trigger de estoque | ⚠️     | Trigger valida mas não retorna código específico |
| `LGPD_LEGAL_HOLD` no trigger de exclusão   | ✅     | `lgpd_legal_hold_check()` bloqueia exclusão      |

**Status:** ⚠️ ERROR CODES PARCIAL — faltam códigos explícitos

**Ação necessária:** Implementar enum `business_error_code` ou constants no schema.

---

## 22. Domínio Functions/Triggers por Domínio

| Domínio    | Função/Trigger                             | Status |
| ---------- | ------------------------------------------ | ------ |
| Inventory  | `stock_movement_insert()`                  | ✅     |
| Inventory  | Trigger `trg_audit_stock_movements`        | ✅     |
| Purchasing | `purchase_receipt_confirm()`               | ✅     |
| Purchasing | Trigger `trg_audit_purchase_receipts`      | ✅     |
| LGPD       | `lgpd_legal_hold_check()`                  | ✅     |
| LGPD       | `lgpd_consent_register()`                  | ✅     |
| LGPD       | Trigger `trg_audit_consents`               | ✅     |
| LGPD       | Trigger `trg_audit_data_deletion_requests` | ✅     |
| Events     | `domain_event_emit()`                      | ✅     |
| Events     | `event_outbox_enqueue()`                   | ✅     |
| Events     | `event_outbox_process_next()`              | ✅     |
| Events     | Trigger `trg_domain_event_to_outbox`       | ✅     |
| Audit      | `audit_log_insert()`                       | ✅     |
| Audit      | Triggers `trg_audit_*`                     | ✅     |
| Core       | `set_updated_at()`                         | ✅     |

**Status:** ✅ DOMAIN FUNCTIONS/TRIGGERS COMPLETO

---

## 23. Talent Pool / Candidate Experience

### Regra canônica

```text
candidate
  ↓
candidate_documents
  ↓
candidate_experiences
  ↓
candidate_education
  ↓
candidate_courses
  ↓
candidate_languages
  ↓
candidate_skills
```

### Verificação

| Regra                        | Status | Evidência SQL                   |
| ---------------------------- | ------ | ------------------------------- |
| `candidates` com `person_id` | ✅     | `04_rh_recruitment.sql`: tabela |
| `candidate_documents`        | ❌     | Nenhuma tabela no SQL canônico  |
| `candidate_experiences`      | ❌     | Nenhuma tabela no SQL canônico  |
| `candidate_education`        | ❌     | Nenhuma tabela no SQL canônico  |
| `candidate_courses`          | ❌     | Nenhuma tabela no SQL canônico  |
| `candidate_languages`        | ❌     | Nenhuma tabela no SQL canônico  |
| `candidate_skills`           | ❌     | Nenhuma tabela no SQL canônico  |
| `skills`                     | ❌     | Nenhuma tabela no SQL canônico  |

**Status:** ❌ TALENT POOL AUSENTE

**Ação necessária:** Implementar em fase pós-V2.1 ou antes do runtime se for requisito bloqueante.

---

## 24. Webhooks / Automation

### Regra canônica

```text
webhook_deliveries
automation_jobs
automation_executions
```

### Verificação

| Regra                   | Status | Evidência SQL                  |
| ----------------------- | ------ | ------------------------------ |
| `webhook_deliveries`    | ❌     | Nenhuma tabela no SQL canônico |
| `automation_jobs`       | ❌     | Nenhuma tabela no SQL canônico |
| `automation_executions` | ❌     | Nenhuma tabela no SQL canônico |

**Nota:** `domain_events` + `event_outbox` + `event_deliveries` cobrem a base de integração. `webhook_deliveries` pode ser absorvido por `event_deliveries`.

**Status:** ⚠️ AUTOMATION PARCIAL — coberto por events/outbox

**Ação necessária:** Avaliar se `webhook_deliveries`/`automation_*` são necessários ou se `event_deliveries` é suficiente.

---

## Resumo da Reconciliação

| Domínio                     | Status      | Ação                                                                                                                                            |
| --------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity/Multi-Tenancy      | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| RBAC                        | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| CRM                         | ⚠️ PARCIAL  | `company_contacts` sem `tenant_id` (aceitável)                                                                                                  |
| Inventory                   | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Purchasing                  | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Finance                     | ❌ AUSENTE  | Implementar pós-V2.1                                                                                                                            |
| Fiscal                      | ❌ AUSENTE  | Implementar pós-V2.1                                                                                                                            |
| PDV                         | ❌ AUSENTE  | Implementar pós-V2.1                                                                                                                            |
| Recruitment                 | ⚠️ PARCIAL  | Implementar `skills`, `candidate_skills`, `recruitment_processes`, `recruitment_stages`, `candidate_documents`, `application_profile_snapshots` |
| Chat/AI/Handoff             | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Notifications/Events/Outbox | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Audit/Security              | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| LGPD                        | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Storage/Documents           | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Tasks/Support               | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Custody                     | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Services/Contracts          | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| RLS                         | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Functions/Triggers          | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Indexes                     | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Seed                        | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Validation                  | ✅ COMPLETO | Nenhuma                                                                                                                                         |
| Error Codes                 | ⚠️ PARCIAL  | Implementar enum `business_error_code`                                                                                                          |
| Talent Pool                 | ❌ AUSENTE  | Implementar pós-V2.1                                                                                                                            |
| Automation/Webhooks         | ⚠️ PARCIAL  | Avaliar se `event_deliveries` é suficiente                                                                                                      |

---

## Lacunas Críticas para Runtime

| #   | Lacuna                             | Impacto                           | Decisão                          |
| --- | ---------------------------------- | --------------------------------- | -------------------------------- |
| 1   | Finance/Fiscal/PDV ausentes        | Bloqueia módulos financeiros      | **Implementar antes do runtime** |
| 2   | Recruitment stages/skills ausentes | Bloqueia fluxo de recrutamento    | **Implementar antes do runtime** |
| 3   | Talent Pool ausente                | Bloqueia experiência do candidato | Implementar pós-V2.1             |
| 4   | Error codes ausentes               | Dificulta tratamento de erros     | Implementar antes do runtime     |
| 5   | Automation/Webhooks parcial        | Integração n8n limitada           | Avaliar                          |

---

## Recomendação

### Antes do Runtime (Bloqueante)

1. **Finance/Fiscal/PDV** — implementar `accounts_receivable`, `accounts_payable`, `financial_transactions`, `fiscal_documents`, `pos_sales`, `pos_sale_items`, `pos_payments`
2. **Recruitment** — implementar `skills`, `candidate_skills`, `recruitment_processes`, `recruitment_stages`, `candidate_documents`, `application_profile_snapshots`
3. **Error Codes** — implementar enum `business_error_code` e atualizar triggers

### Pós-V2.1 (Não bloqueante)

4. **Talent Pool** — `candidate_documents`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`
5. **Automation** — avaliar se `event_deliveries` cobre ou se precisa de `webhook_deliveries`/`automation_*`

---

## Conclusão

### O que está PRONTO para runtime

| Domínio                     | Status |
| --------------------------- | ------ |
| Core/Tenancy                | ✅     |
| RBAC                        | ✅     |
| CRM                         | ✅     |
| Inventory/Custody           | ✅     |
| Purchasing                  | ✅     |
| Chat/AI/Handoff             | ✅     |
| Notifications/Events/Outbox | ✅     |
| Audit/Security              | ✅     |
| LGPD                        | ✅     |
| Storage/Documents           | ✅     |
| Tasks/Support               | ✅     |
| Services/Contracts          | ✅     |
| RLS                         | ✅     |
| Functions/Triggers          | ✅     |
| Indexes                     | ✅     |
| Seed                        | ✅     |
| Validation                  | ✅     |

### O que NÃO está pronto (bloqueante)

| Domínio                     | Status |
| --------------------------- | ------ |
| Finance                     | ❌     |
| Fiscal                      | ❌     |
| PDV                         | ❌     |
| Recruitment (stages/skills) | ❌     |
| Error Codes                 | ⚠️     |

### Próximo passo

1. Implementar lacunas bloqueantes na branch `feat/database-v21-local-rebuild`
2. Revisar e validar
3. Commit + push
4. Só então: runtime gate
