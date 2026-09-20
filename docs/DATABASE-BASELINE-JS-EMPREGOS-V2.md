# DATABASE-BASELINE-JS-EMPREGOS-V2.1

> Status: V2.1 DRAFT — READ-ONLY AUDIT
> Branch: audit/db-frontend-before-rebuild-20260818
> Commit: 1777d88df386252c32608386b08ee51ae5b1a890
> Regra: nenhuma alteração no Supabase, migrations, RLS, RBAC, frontend ou dados até aprovação formal.

---

## 1. Objetivo

Baseline reproduzível do banco da J&S Empregos SaaS multi-tenant, agora com ajustes arquiteturais fechados antes da construção SQL.

---

## 2. Princípios arquiteturais

### 2.1 People-First
```text
auth.users
   ↓
people
   ↓
tenant_memberships
   ↓
role_assignments
   ↓
roles / permissions
```

### 2.2 Multi-tenancy
Toda entidade operacional é tenant-scoped por `tenant_id`, exceto globais explicitamente marcadas.

### 2.3 RBAC separado de domínio
```text
ROLE = autorização
DOMAIN TYPE = identidade funcional/negócio
```

### 2.4 admin_master global
`admin_master` é role global. Não pertence a um tenant.

### 2.5 Auditoria e LGPD
Toda tabela operacional deve suportar:
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- histórico imutável quando aplicável

LGPD:
- consentimento
- exportação
- exclusão/anonimização
- retenção

### 2.6 Financeiro ≠ Fiscal
```text
financeiro interno ≠ documento fiscal oficial
```

Integração fiscal será camada separada futura.

---

## 3. Domínios e entidades

### 3.1 Core / Identity / Tenancy

#### `people`
```text
PK: id
FK: auth_user_id → auth.users.id
Campos principais: full_name, email, phone, document, status, metadata
Tenant ownership: indireto via tenant_memberships
```
Regras:
- `auth_user_id` único
- `email` único
- exclusão/suspensão preserva histórico

#### `tenants`
```text
PK: id
Campos principais: name, slug, legal_name, tax_id, email, phone, address, status, settings
```

#### `tenant_memberships`
```text
PK: id
FK: person_id → people.id
FK: tenant_id → tenants.id
Campos principais: membership_role, status, joined_at, left_at
UNIQUE(person_id, tenant_id)
```

#### `tenant_settings`
Configurações do tenant.
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: branding, timezone, locale, notifications, recruitment, finance, fiscal, chat, feature_flags
Tenant ownership: sim
```

#### `companies`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: name, legal_name, tax_id, email, phone, address, website, status
Tenant ownership: sim
```

#### `company_relationships`
```text
PK: id
FK: tenant_id → tenants.id
FK: company_id → companies.id
Campos principais: relationship_type, status, started_at, ended_at, metadata
Tenant ownership: sim
Tipos: client, partner, supplier
```

#### `company_contacts`
```text
PK: id
FK: tenant_id → tenants.id
FK: company_id → companies.id
FK: person_id → people.id
Campos principais: role, department, email, phone, is_primary
Tenant ownership: sim
```

**Regra V2.1:** `suppliers` é perfil operacional da empresa, não uma segunda empresa. Evita duplicação cadastral.

---

### 3.2 Auth / RBAC / Permissions

#### `roles`
```text
PK: id
Campos principais: name, description, is_global, scope
```

Globais:
```text
admin_master
platform_admin
support_engineer
```

Tenant-scoped:
```text
tenant_admin
rh_manager
recruiter
finance_manager
finance
administrative_manager
administrative
operations_manager
support_manager
support
commercial_manager
commercial
stock_manager
stock_operator
content_manager
viewer
member
```

#### `permissions`
```text
PK: id
Campos principais: resource, action, description, is_global
Formato: resource.action
```

#### `role_permissions`
```text
PK: id
FK: role_id → roles.id
FK: permission_id → permissions.id
UNIQUE(role_id, permission_id)
```

#### `role_assignments`
```text
PK: id
FK: person_id → people.id
FK: role_id → roles.id
FK: tenant_id → tenants.id
Campos principais: assigned_by, expires_at, status
```
Regras:
- `admin_master` usa `tenant_id = NULL`
- sem `tenant_membership_id`
- sem `actor_person_id`

#### `user_has_permission()`
```text
Input: person_id, tenant_id, resource, action
Output: boolean
```

#### `role_resource_permissions`
```text
PK: id
FK: role_id → roles.id
Campos principais: resource, action, conditions
RLS: obrigatório
```

---

### 3.3 CRM / Companies

#### `interactions`
```text
PK: id
FK: tenant_id → tenants.id
FK: company_id → companies.id
FK: person_id → people.id
Campos principais: type, subject, notes, occurred_at
```

---

### 3.4 RH / Candidates / Recruitment / Employees

#### `candidates`
```text
PK: id
FK: tenant_id → tenants.id
FK: person_id → people.id
Campos principais: status, source, expected_salary, availability, notes
```
Regras:
- domain type, não role
- pode evoluir para employee

#### `candidate_documents`
```text
PK: id
FK: tenant_id → tenants.id
FK: candidate_id → candidates.id
Campos principais: type, file_url, file_name, mime_type, size, issued_at, expires_at
```

#### `candidate_experiences`
```text
PK: id
FK: tenant_id → tenants.id
FK: candidate_id → candidates.id
Campos principais: company, title, start_date, end_date, description, is_current
```

#### `candidate_education`
```text
PK: id
FK: tenant_id → tenants.id
FK: candidate_id → candidates.id
Campos principais: institution, course, degree, start_date, end_date, is_current
```

#### `candidate_courses`
```text
PK: id
FK: tenant_id → tenants.id
FK: candidate_id → candidates.id
Campos principais: name, institution, hours, issued_at, expires_at
```

#### `candidate_languages`
```text
PK: id
FK: tenant_id → tenants.id
FK: candidate_id → candidates.id
Campos principais: language, proficiency, notes
```

#### `candidate_skills`
```text
PK: id
FK: tenant_id → tenants.id
FK: candidate_id → candidates.id
FK: skill_id → skills.id
Campos principais: level, years, notes
UNIQUE(candidate_id, skill_id)
```

#### `skills`
```text
PK: id
Campos principais: name, description, category, is_global, tenant_id
Regras: is_global = true para catálogo; tenant_id para customizadas
```

#### `jobs`
```text
PK: id
FK: tenant_id → tenants.id
FK: company_id → companies.id
Campos principais: title, description, requirements, location, schedule, contract_type, status, published_at, closed_at
```

#### `job_skills`
```text
PK: id
FK: tenant_id → tenants.id
FK: job_id → jobs.id
FK: skill_id → skills.id
Campos principais: required, weight
UNIQUE(job_id, skill_id)
```

#### `stage_templates`
Modelos de etapa reutilizáveis.
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: name, order, is_default, metadata
Tenant ownership: sim
```

#### `recruitment_processes`
```text
PK: id
FK: tenant_id → tenants.id
FK: job_id → jobs.id
FK: stage_template_id → stage_templates.id
Campos principais: name, status, started_at, finished_at
Tenant ownership: sim
```

#### `recruitment_stages`
```text
PK: id
FK: tenant_id → tenants.id
FK: recruitment_process_id → recruitment_processes.id
Campos principais: name, order, status, scheduled_at
Tenant ownership: sim
```

#### `candidate_processes`
```text
PK: id
FK: tenant_id → tenants.id
FK: recruitment_process_id → recruitment_processes.id
FK: candidate_id → candidates.id
Campos principais: current_stage_id, status, notes
Tenant ownership: sim
```

#### `interviews`
```text
PK: id
FK: tenant_id → tenants.id
FK: candidate_process_id → candidate_processes.id
Campos principais: type, scheduled_at, finished_at, location, notes, result
Tenant ownership: sim
```

#### `interview_participants`
```text
PK: id
FK: tenant_id → tenants.id
FK: interview_id → interviews.id
FK: person_id → people.id
Campos principais: role, notes
Tenant ownership: sim
```

#### `interview_feedback`
```text
PK: id
FK: tenant_id → tenants.id
FK: interview_id → interviews.id
FK: participant_id → interview_participants.id
Campos principais: rating, strengths, weaknesses, recommendation, notes
Tenant ownership: sim
```

#### `talent_pool_memberships`
```text
PK: id
FK: tenant_id → tenants.id
FK: candidate_id → candidates.id
Campos principais: source, status, notes, added_at
Tenant ownership: sim
```

#### `job_matches`
```text
PK: id
FK: tenant_id → tenants.id
FK: job_id → jobs.id
FK: candidate_id → candidates.id
Campos principais: score, reason, status, matched_at
Tenant ownership: sim
```

#### `candidate_profile_views`
```text
PK: id
FK: tenant_id → tenants.id
FK: candidate_id → candidates.id
FK: viewed_by_person_id → people.id
Campos principais: source, viewed_at
Tenant ownership: sim
```

#### `employees`
```text
PK: id
FK: tenant_id → tenants.id
FK: person_id → people.id
FK: company_id → companies.id
Campos principais: registration, admission_date, position, department, status, salary_base
Tenant ownership: sim
```

#### `employee_contracts`
```text
PK: id
FK: tenant_id → tenants.id
FK: employee_id → employees.id
Campos principais: type, start_date, end_date, salary, workload, contract_file_url, status
Tenant ownership: sim
```

#### `employee_documents`
```text
PK: id
FK: tenant_id → tenants.id
FK: employee_id → employees.id
Campos principais: type, file_url, file_name, issued_at, expires_at
Tenant ownership: sim
```

#### `employee_status_history`
```text
PK: id
FK: tenant_id → tenants.id
FK: employee_id → employees.id
Campos principais: status, changed_by_person_id, reason, changed_at
Regras: append-only
Tenant ownership: sim
```

#### `departments`
```text
PK: id
FK: tenant_id → tenants.id
FK: parent_department_id → departments.id
Campos principais: name, description, head_person_id, status
Tenant ownership: sim
```

#### `positions`
```text
PK: id
FK: tenant_id → tenants.id
FK: department_id → departments.id
Campos principais: title, description, salary_range, requirements
Tenant ownership: sim
```

#### `employee_positions`
```text
PK: id
FK: tenant_id → tenants.id
FK: employee_id → employees.id
FK: position_id → positions.id
Campos principais: start_date, end_date, is_current, workload
Tenant ownership: sim
```

---

### 3.5 Administrative

#### `administrative_requests`
```text
PK: id
FK: tenant_id → tenants.id
FK: requester_person_id → people.id
Campos principais: type, subject, description, status, priority, requested_at
Tenant ownership: sim
```

#### `administrative_tasks`
```text
PK: id
FK: tenant_id → tenants.id
FK: request_id → administrative_requests.id
FK: assignee_person_id → people.id
Campos principais: title, description, status, due_at, finished_at
Tenant ownership: sim
```

#### `administrative_approvals`
```text
PK: id
FK: tenant_id → tenants.id
FK: task_id → administrative_tasks.id
FK: approver_person_id → people.id
Campos principais: decision, notes, approved_at
Tenant ownership: sim
```

#### `administrative_documents`
```text
PK: id
FK: tenant_id → tenants.id
FK: request_id → administrative_requests.id
Campos principais: type, file_url, file_name, notes
Tenant ownership: sim
```

---

### 3.6 Finance

#### `financial_accounts`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: name, type, bank, agency, account_number, status
Tenant ownership: sim
```

#### `financial_categories`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: name, type, parent_category_id, status
Tipos: receita, despesa
Tenant ownership: sim
```

#### `cost_centers`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: name, code, department, status
Tenant ownership: sim
```

#### `accounts_receivable`
```text
PK: id
FK: tenant_id → tenants.id
FK: customer_company_id → companies.id
FK: invoice_id → invoices.id
Campos principais: amount, due_date, paid_amount, status
Tenant ownership: sim
```

#### `accounts_payable`
```text
PK: id
FK: tenant_id → tenants.id
FK: supplier_id → suppliers.id
FK: invoice_id → invoices.id
Campos principais: amount, due_date, paid_amount, status
Tenant ownership: sim
```

#### `financial_transactions`
```text
PK: id
FK: tenant_id → tenants.id
FK: account_id → financial_accounts.id
FK: category_id → financial_categories.id
FK: cost_center_id → cost_centers.id
Campos principais: type, amount, currency, occurred_at, description, document_url
Tenant ownership: sim
```

#### `invoices`
Documentos comerciais/faturamento interno.
```text
PK: id
FK: tenant_id → tenants.id
FK: customer_id → companies.id
Campos principais: number, series, issue_date, due_date, total_amount, status, pdf_url
Tenant ownership: sim
```
Regra: documento comercial, distinto de documento fiscal.

#### `invoice_items`
```text
PK: id
FK: tenant_id → tenants.id
FK: invoice_id → invoices.id
Campos principais: description, quantity, unit_price, total_price, tax
Tenant ownership: sim
```

#### `payments`
```text
PK: id
FK: tenant_id → tenants.id
FK: invoice_id → invoices.id
Campos principais: method, amount, currency, paid_at, confirmation, notes
Tenant ownership: sim
```

#### `expenses`
```text
PK: id
FK: tenant_id → tenants.id
FK: account_id → financial_accounts.id
FK: category_id → financial_categories.id
FK: approved_by_person_id → people.id
Campos principais: amount, occurred_at, description, document_url
Tenant ownership: sim
```

#### `revenues`
```text
PK: id
FK: tenant_id → tenants.id
FK: account_id → financial_accounts.id
FK: category_id → financial_categories.id
Campos principais: amount, occurred_at, description, document_url
Tenant ownership: sim
```

---

### 3.7 Fiscal / NF

#### `fiscal_configurations`
```text
PK: id
FK: tenant_id → tenants.id
FK: company_id → companies.id
Campos principais: environment, certificate_reference, api_endpoint, api_key_reference, status
Tenant ownership: sim
Regras: não armazenar certificado/senha no banco
```

#### `fiscal_integrations`
```text
PK: id
FK: tenant_id → tenants.id
FK: fiscal_configuration_id → fiscal_configurations.id
Campos principais: provider, mode, status, last_sync_at
Tenant ownership: sim
```

#### `fiscal_documents`
```text
PK: id
FK: tenant_id → tenants.id
FK: company_id → companies.id
FK: invoice_id → invoices.id
Campos principais: number, series, type, status, issue_date, authorization_protocol, xml_url, pdf_url
Tenant ownership: sim
Status: draft, processing, authorized, rejected, cancelled, corrected, error
```

#### `fiscal_document_items`
```text
PK: id
FK: tenant_id → tenants.id
FK: fiscal_document_id → fiscal_documents.id
Campos principais: code, description, quantity, unit_price, total_price, tax_code, tax_value
Tenant ownership: sim
```

#### `fiscal_document_events`
```text
PK: id
FK: tenant_id → tenants.id
FK: fiscal_document_id → fiscal_documents.id
Campos principais: event_type, description, payload, occurred_at
Regras: append-only
Tenant ownership: sim
```

#### `fiscal_document_status_history`
```text
PK: id
FK: tenant_id → tenants.id
FK: fiscal_document_id → fiscal_documents.id
Campos principais: status, reason, occurred_at, operator_person_id
Regras: append-only
Tenant ownership: sim
```

#### `fiscal_api_requests`
```text
PK: id
FK: tenant_id → tenants.id
FK: fiscal_document_id → fiscal_documents.id
Campos principais: method, endpoint, response_status, duration_ms, request_reference, response_reference, sanitized_metadata
Tenant ownership: sim
Regras: backend-only; sem segredos em texto puro
```

#### `fiscal_api_responses`
```text
PK: id
FK: tenant_id → tenants.id
FK: fiscal_api_request_id → fiscal_api_requests.id
Campos principais: status_code, body, headers, received_at
Tenant ownership: sim
Regras: backend-only; payloads sensíveis devem ser referenciados, não armazenados em texto puro
```

Regras gerais:
- backend-only
- nenhuma credencial fiscal no frontend
- certificado/segredo via secret manager externo

---

### 3.8 Inventory / Estoque

#### `products`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: name, sku, description, unit, category, min_stock, status
Tenant ownership: sim
```

#### `product_categories`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: name, description, parent_category_id
Tenant ownership: sim
```

#### `warehouses`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: name, address, status
Tenant ownership: sim
```

#### `warehouse_locations`
```text
PK: id
FK: tenant_id → tenants.id
FK: warehouse_id → warehouses.id
Campos principais: code, aisle, shelf, bin, notes
Tenant ownership: sim
```

#### `stock_balances`
Estado atual do estoque.
```text
PK: id
FK: tenant_id → tenants.id
FK: product_id → products.id
FK: warehouse_id → warehouses.id
FK: location_id → warehouse_locations.id
Campos principais: quantity, reserved_quantity, last_movement_at
UNIQUE(product_id, warehouse_id, location_id)
Tenant ownership: sim
```

#### `stock_movements`
Ledger do estoque.
```text
PK: id
FK: tenant_id → tenants.id
FK: product_id → products.id
FK: warehouse_id → warehouses.id
Campos principais: type, quantity, unit_cost, document_type, document_id, notes, occurred_at
Regras: append-only
Tipos: entrada, saída, ajuste, transferência
Tenant ownership: sim
```
Regra V2.1: `stock_movements` é a única fonte de verdade histórica. `stock_balances` reflete o estado derivado.

#### `stock_entries`
```text
PK: id
FK: tenant_id → tenants.id
FK: product_id → products.id
FK: warehouse_id → warehouses.id
Campos principais: quantity, unit_cost, supplier_id, received_at, notes
Tenant ownership: sim
```

#### `stock_exits`
```text
PK: id
FK: tenant_id → tenants.id
FK: product_id → products.id
FK: warehouse_id → warehouses.id
Campos principais: quantity, unit_cost, reason, requested_by_person_id, approved_by_person_id, occurred_at
Tenant ownership: sim
```

#### `stock_inventory`
```text
PK: id
FK: tenant_id → tenants.id
FK: warehouse_id → warehouses.id
Campos principais: type, status, started_at, finished_at
Tenant ownership: sim
```

#### `stock_inventory_items`
```text
PK: id
FK: tenant_id → tenants.id
FK: stock_inventory_id → stock_inventory.id
FK: product_id → products.id
Campos principais: counted_quantity, system_quantity, difference, notes
Tenant ownership: sim
```

#### `stock_adjustments`
```text
PK: id
FK: tenant_id → tenants.id
FK: product_id → products.id
FK: warehouse_id → warehouses.id
Campos principais: type, quantity, reason, approved_by_person_id, occurred_at
Tenant ownership: sim
```

#### `suppliers`
Perfil operacional da empresa.
```text
PK: id
FK: tenant_id → tenants.id
FK: company_id → companies.id
Campos principais: payment_terms, lead_time, status, notes
Tenant ownership: sim
```

#### `purchase_orders`
```text
PK: id
FK: tenant_id → tenants.id
FK: supplier_id → suppliers.id
Campos principais: number, status, order_date, expected_delivery_date
Tenant ownership: sim
```

#### `purchase_order_items`
```text
PK: id
FK: tenant_id → tenants.id
FK: purchase_order_id → purchase_orders.id
FK: product_id → products.id
Campos principais: quantity, unit_price, total_price, received_quantity
Tenant ownership: sim
```

---

### 3.9 Tasks / Tasks engine

#### `tasks`
Tarefas multi-setor.
```text
PK: id
FK: tenant_id → tenants.id
FK: assignee_person_id → people.id
Campos principais: title, description, status, priority, due_at, finished_at, metadata, related_entity_type, related_entity_id
Tenant ownership: sim
```
Regras:
- usada por RH, Financeiro, Administrativo, Estoque, Comercial, Suporte
- `related_entity_type/related_entity_id` é polimórfico sem FK física; integridade garantida por aplicação/triggers

#### `task_comments`
```text
PK: id
FK: tenant_id → tenants.id
FK: task_id → tasks.id
FK: author_person_id → people.id
Campos principais: content, created_at
Tenant ownership: sim
```

#### `task_attachments`
```text
PK: id
FK: tenant_id → tenants.id
FK: task_id → tasks.id
Campos principais: file_url, file_name, mime_type, size
Tenant ownership: sim
```

#### `task_status_history`
```text
PK: id
FK: tenant_id → tenants.id
FK: task_id → tasks.id
Campos principais: status, changed_by_person_id, notes, changed_at
Regras: append-only
Tenant ownership: sim
```

---

### 3.10 Support / Tickets

#### `support_tickets`
```text
PK: id
FK: tenant_id → tenants.id
FK: requester_person_id → people.id
FK: assignee_person_id → people.id
Campos principais: category_id, subject, description, status, priority, sla_due_at, finished_at
Tenant ownership: sim
```

#### `support_ticket_messages`
```text
PK: id
FK: tenant_id → tenants.id
FK: support_ticket_id → support_tickets.id
FK: author_person_id → people.id
Campos principais: content, created_at
Tenant ownership: sim
```

#### `support_ticket_assignments`
```text
PK: id
FK: tenant_id → tenants.id
FK: support_ticket_id → support_tickets.id
FK: person_id → people.id
Campos principais: assigned_at, released_at
Tenant ownership: sim
```

#### `support_ticket_status_history`
```text
PK: id
FK: tenant_id → tenants.id
FK: support_ticket_id → support_tickets.id
Campos principais: status, changed_by_person_id, notes, changed_at
Regras: append-only
Tenant ownership: sim
```

#### `support_ticket_categories`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: name, description, sla_hours, active
Tenant ownership: sim
```

---

### 3.11 Notifications

#### `notifications`
```text
PK: id
FK: tenant_id → tenants.id
FK: recipient_person_id → people.id
Campos principais: channel, title, body, status, scheduled_at, sent_at, read_at
Tenant ownership: sim
```

#### `notification_deliveries`
```text
PK: id
FK: tenant_id → tenants.id
FK: notification_id → notifications.id
Campos principais: channel, provider, payload, status, sent_at, delivered_at, opened_at, error
Tenant ownership: sim
```

#### `notification_preferences`
```text
PK: id
FK: tenant_id → tenants.id
FK: person_id → people.id
Campos principais: channel, enabled, quiet_hours_start, quiet_hours_end
UNIQUE(person_id, channel)
Tenant ownership: sim
```

---

### 3.12 Chat

#### `chat_rooms`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: type, title, status, created_by_person_id, closed_at
Tipos: human, ai, handoff
Tenant ownership: sim
```

#### `chat_participants`
```text
PK: id
FK: tenant_id → tenants.id
FK: chat_room_id → chat_rooms.id
FK: person_id → people.id
Campos principais: role, joined_at, left_at
Tenant ownership: sim
```

#### `chat_messages`
```text
PK: id
FK: tenant_id → tenants.id
FK: chat_room_id → chat_rooms.id
FK: sender_person_id → people.id
Campos principais: type, content, metadata, sent_at, read_at
Regras: append-only
Tenant ownership: sim
```

#### `ai_conversations`
```text
PK: id
FK: tenant_id → tenants.id
FK: chat_room_id → chat_rooms.id
Campos principais: model, context, started_at, finished_at
Tenant ownership: sim
```

#### `ai_messages`
```text
PK: id
FK: tenant_id → tenants.id
FK: ai_conversation_id → ai_conversations.id
Campos principais: role, content, tokens_used, finished_at
Tenant ownership: sim
```

#### `ai_usage`
```text
PK: id
FK: tenant_id → tenants.id
FK: ai_conversation_id → ai_conversations.id
Campos principais: provider, model, prompt_tokens, completion_tokens, total_tokens, cost, occurred_at
Tenant ownership: sim
```

#### `chat_assignments`
```text
PK: id
FK: tenant_id → tenants.id
FK: chat_room_id → chat_rooms.id
FK: person_id → people.id
Campos principais: assigned_at, released_at
Tenant ownership: sim
```

#### `chat_handoffs`
```text
PK: id
FK: tenant_id → tenants.id
FK: chat_room_id → chat_rooms.id
FK: from_person_id → people.id
FK: to_person_id → people.id
Campos principais: reason, occurred_at
Regras: append-only
Tenant ownership: sim
```

#### `chat_events`
```text
PK: id
FK: tenant_id → tenants.id
FK: chat_room_id → chat_rooms.id
Campos principais: event_type, payload, occurred_at
Regras: append-only
Tenant ownership: sim
```

---

### 3.13 Documents / Storage

#### `files`
```text
PK: id
FK: tenant_id → tenants.id
FK: uploaded_by_person_id → people.id
Campos principais: entity_type, entity_id, file_name, mime_type, size, storage_path, bucket
Tenant ownership: sim
```

#### `file_access_logs`
```text
PK: id
FK: tenant_id → tenants.id
FK: file_id → files.id
FK: person_id → people.id
Campos principais: action, ip, user_agent, occurred_at
Regras: append-only
Tenant ownership: sim
```

#### `document_versions`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: entity_type, entity_id, version, file_url, changed_by_person_id, changed_at
Tenant ownership: sim
```

#### `document_links`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: document_id, entity_type, entity_id, relation_type
Tenant ownership: sim
```

---

### 3.14 Events / Domain

#### `domain_events`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: aggregate, aggregate_id, event_type, payload, occurred_at
Regras: append-only
Tenant ownership: sim
```

---

### 3.15 Audit / Security

#### `audit_logs`
```text
PK: id
FK: tenant_id → tenants.id
FK: person_id → people.id
Campos principais: entity_type, entity_id, action, before, after, ip, user_agent, occurred_at, scope
Regras: append-only
Tenant ownership: sim
```
Regra V2.1: `tenant_id` pode ser `NULL` quando `scope = global`.

#### `security_events`
```text
PK: id
FK: tenant_id → tenants.id
FK: person_id → people.id
Campos principais: event_type, severity, description, ip, user_agent, metadata, occurred_at, scope
Regras: append-only
Tenant ownership: sim
```

---

### 3.16 LGPD

#### `consents`
```text
PK: id
FK: tenant_id → tenants.id
FK: person_id → people.id
Campos principais: purpose, granted, channel, evidence_url, granted_at, revoked_at
Regras: append-only
Tenant ownership: sim
```

#### `privacy_requests`
```text
PK: id
FK: tenant_id → tenants.id
FK: person_id → people.id
Campos principais: type, status, requested_at, finished_at, notes
Tipos: export, delete, correct
Tenant ownership: sim
```

#### `data_export_requests`
```text
PK: id
FK: tenant_id → tenants.id
FK: person_id → people.id
Campos principais: status, file_url, requested_at, finished_at
Tenant ownership: sim
```

#### `data_deletion_requests`
```text
PK: id
FK: tenant_id → tenants.id
FK: person_id → people.id
Campos principais: status, reason, anonymized_fields, requested_at, finished_at
Tenant ownership: sim
```

#### `data_retention_policies`
```text
PK: id
FK: tenant_id → tenants.id
Campos principais: data_domain, retention_days, legal_basis, action_after_expiry, enabled
Tenant ownership: sim
```

---

## 4. Segurança

### 4.1 RLS

Todas as tabelas tenant-scoped com RLS.

Políticas:
```text
SELECT  → membro ativo do tenant ou role global permitida
INSERT  → role com permissão create
UPDATE  → role com permissão update
DELETE  → role com permissão delete
```

### 4.2 Roles e permissões

admin_master:
```text
acesso global a tenants e configurações
```

tenant_admin:
```text
administração do tenant
```

Demais roles:
```text
vinculadas a permissions via role_permissions
```

### 4.3 Storage

Buckets:
```text
documents
avatars
invoices
fiscal
chat
candidates
```

### 4.4 Realtime

Somente após definição de autorização e topic.

---

## 5. Tasks

Engine transversal. Sem tabelas paralelas por setor sem justificativa.

---

## 6. Chat

Três camadas:
```text
chat_rooms / chat_participants / chat_messages
ai_conversations / ai_messages / ai_usage
chat_assignments / chat_handoffs / chat_events
```

---

## 7. Auditoria

Tabelas:
```text
audit_logs
security_events
domain_events
file_access_logs
```

Regra:
```text
qualquer alteração sensível gera entrada em audit_logs
```

---

## 8. LGPD

Tabelas:
```text
consents
privacy_requests
data_export_requests
data_deletion_requests
data_retention_policies
```

---

## 9. Integrações externas

```text
email
WhatsApp
API fiscal
Storage
```

Regra:
```text
credenciais/certificados fora do frontend e fora de tabelas comuns
referência via secret manager / backend service
```

---

## 10. Itens excluídos

```text
profiles
tenant_membership_id em role_assignments
get_user_roles RPC fantasma
actor_person_id em role_assignments
migration 015 revertida
migration 016 como patch histórico
schema.sql legado
chat.sql legado
roles legadas: admin, candidato, empresa
```

---

## 11. Critérios de aprovação V2.1

```text
✅ tenant_settings documentado
✅ stage_templates documentado
✅ fiscal_api logging endurecido
✅ data_retention_policies documentado
✅ suppliers como perfil operacional
✅ related_entity polimórfico documentado
✅ accounts_receivable/payable com FKs explícitas
✅ invoice separada de fiscal_documents
✅ stock_movements como ledger
✅ admin_master global preservado
✅ RBAC separado de domínio
✅ auditoria com scope global/tenant
✅ chat humano/IA/handoff separado
✅ LGPD completa com retenção
✅ frontend contract sem roles legadas
✅ nenhuma dependência de migrations históricas inconsistentes
```

Somente após aprovação:
```text
V2.1 APPROVED
       ↓
SQL BUILD SPEC
       ↓
DRY-RUN / VALIDAÇÃO
       ↓
BACKUP COMPLETO
       ↓
DROP / RESET
       ↓
BUILD V2.1
       ↓
SEED / AUTH / RBAC
       ↓
TESTES E2E
```
