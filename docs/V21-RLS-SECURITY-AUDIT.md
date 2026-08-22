# Auditoria de Segurança RLS — V2.1 (commit 7c2aa30)

**Arquivo auditado:** `supabase/specs/sql/22_rls.sql`  
**Commit:** `7c2aa30`  
**Branch:** `feat/database-v21-local-rebuild`  
**Data da auditoria:** 2026-08-21  
**Auditoria:** Kilo (automática)

---

## Status Geral

| Item                                                 | Status      |
| ---------------------------------------------------- | ----------- |
| RLS habilitado em todas as tabelas                   | **PASS**    |
| Policies para SELECT em todas as tabelas             | **PASS**    |
| Policies para INSERT em todas as tabelas             | **PASS**    |
| Policies para UPDATE em todas as tabelas             | **WARNING** |
| Policies para DELETE em todas as tabelas             | **FAIL**    |
| search_path em funções SECURITY DEFINER              | **PASS**    |
| Uso de `is_tenant_member()` consistente              | **PASS**    |
| Subqueries corretas para FK indireto                 | **PASS**    |
| user_has_permission() / user_permissions() auditadas | **PASS**    |
| Tabelas novas sem RLS                                | **PASS**    |

**Status geral: WARNING**

---

## 1. Tabelas com RLS Habilitada

Total: **115 tabelas**

### Core / Global

- `people`
- `tenants`
- `tenant_memberships`
- `tenant_settings`
- `roles`
- `permissions`
- `role_permissions`
- `role_assignments`

### CRM / Companies

- `companies`
- `company_relationships`
- `company_contacts`
- `candidates`
- `jobs`
- `applications`
- `application_status_history`
- `interviews`
- `company_services`
- `service_orders`
- `service_order_items`
- `service_acceptances`
- `service_executions`
- `service_attachments`
- `service_order_status_history`
- `contracts`
- `contract_status_history`
- `interactions`

### Recruitment

- `recruitment_demands`
- `talent_pool_memberships`
- `job_matches`
- `candidate_profile_views`

### Employees

- `employees`
- `departments`
- `positions`
- `employee_positions`
- `employee_contracts`
- `employee_documents`
- `employee_status_history`

### Inventory

- `products`
- `warehouses`
- `warehouse_locations`
- `product_categories`
- `stock_lots`
- `stock_inventory`
- `stock_inventory_items`
- `stock_movements`
- `stock_balances`
- `stock_entries`

### Custody

- `third_party_custody`
- `third_party_custody_items`

### Purchasing

- `suppliers`
- `purchase_orders`
- `purchase_order_items`
- `purchase_receipts`
- `purchase_receipt_items`
- `purchase_requests`
- `purchase_request_items`
- `purchase_quotations`
- `purchase_quotation_items`
- `purchase_status_history`
- `purchase_receipt_divergences`

### Finance / Fiscal

- `invoices`
- `invoice_items`
- `financial_accounts`
- `fiscal_integrations`

### POS

- `pos_operators`

### Tasks / Support

- `tasks`
- `task_comments`
- `task_attachments`
- `task_status_history`
- `support_tickets`
- `support_ticket_status_history`
- `support_ticket_categories`
- `support_ticket_messages`
- `support_ticket_assignments`

### Chat / AI

- `chat_rooms`
- `chat_participants`
- `chat_messages`
- `ai_conversations`
- `ai_messages`
- `ai_usage`
- `chat_handoffs`

### Notifications / Events

- `notifications`
- `notification_deliveries`
- `domain_events`
- `event_outbox`
- `event_deliveries`
- `notification_preferences`

### Storage / Documents

- `files`
- `file_access_logs`
- `document_versions`
- `document_links`
- `administrative_requests`
- `administrative_tasks`
- `administrative_approvals`
- `administrative_documents`

### Audit / Security / LGPD

- `audit_logs`
- `security_events`
- `first_login_state`
- `legal_acceptances`
- `consents`
- `privacy_requests`
- `data_export_requests`
- `data_deletion_requests`
- `data_retention_policies`

### Automation / Reports

- `automation_templates`
- `report_definitions`
- `report_executions`
- `report_schedules`
- `dashboard_widgets`
- `dashboard_layouts`

### Auth / Security

- `sessions`
- `password_policies`

---

## 2. Policies por Tabela (Resumo)

Total de policies: **286**

### Políticas por Operação

| Operação | Quantidade de Policies | Observação                                                                               |
| -------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| SELECT   | 115                    | Uma por tabela — todas cobertas                                                          |
| INSERT   | 114                    | Falta em `audit_logs` (apenas admin-read)                                                |
| UPDATE   | ~80                    | Algumas tabelas de histórico/leitura não possuem                                         |
| DELETE   | 0                      | **Nenhuma policy explícita de DELETE**                                                   |
| FOR ALL  | 4                      | Apenas para tabelas RBAC globais (`tenants`, `roles`, `permissions`, `role_permissions`) |

### Tabelas SEM policy de UPDATE

Algumas tabelas de histórico, configuração ou apenas-leitura não possuem policy de UPDATE explícita. Isso pode ser intencional, mas deve ser documentado:

- `application_status_history`
- `audit_logs`
- `contract_status_history`
- `domain_events`
- `event_deliveries`
- `event_outbox`
- `first_login_state` (apenas admin-update)
- `interviews`
- `notification_deliveries`
- `purchase_status_history`
- `security_events`
- `service_order_status_history`
- `stock_balances`
- `stock_entries`
- `support_ticket_status_history`
- `task_status_history`

---

## 3. Problemas de Segurança Encontrados

### 3.1 CRÍTICO — Ausência de políticas DELETE explícitas

- **Nenhuma** tabela operacional possui policy de DELETE explícita (`for delete`).
- Apenas 4 tabelas globais (`tenants`, `roles`, `permissions`, `role_permissions`) possuem `for all`, que inclui DELETE implicitamente.
- **Impacto:** Se houver uma falha na aplicação ou uso indevido de service_role, dados não podem ser removidos via RLS. Se a intenção é bloquear DELETE, isso deve ser documentado explicitamente com policy `using (false)`.

### 3.2 MÉDIO — user_has_permission() e user_permissions() não são usadas em 22_rls.sql

- As funções `public.user_has_permission()` e `public.user_permissions()` existem em `supabase/specs/sql/21_functions_triggers.sql` e estão corretamente implementadas como `SECURITY DEFINER` com `search_path = public, pg_temp`.
- Porém, **nenhuma policy em 22_rls.sql** utiliza essas funções para verificação granular de permissões (`resource` / `action`).
- **Impacto:** O controle de acesso atual é baseado apenas em membership de tenant (`is_tenant_member`) e master admin (`is_admin_master`). Permissões RBAC granulares definidas nas tabelas `permissions` / `role_permissions` não estão sendo aplicadas nas policies RLS.

### 3.3 BAIXO — Uso de auth.uid() em funções SECURITY DEFINER

- As funções `is_tenant_member()`, `is_admin_master()` e `user_tenant_ids()` usam `auth.uid()` diretamente.
- Embora sejam `SECURITY DEFINER` com `search_path` correto, elas confiam no contexto do Supabase Auth. Isso é seguro no ambiente Supabase, mas não seria reutilizável em chamadas diretas via `service_role`.

### 3.4 BAIXO — Falta de policy em algumas tabelas para operações específicas

- `audit_logs`: apenas SELECT para admin. Nenhuma INSERT/UPDATE policy. Provavelmente intencional (logs são imutáveis), mas INSERT pode ser necessário via trigger/função.
- `domain_events`, `event_outbox`, `event_deliveries`: apenas admin-read e admin-write. Adequado para tabelas de infraestrutura.
- `first_login_state`: apenas self-read e admin-write. Adequado.

---

## 4. Funções SECURITY DEFINER Auditadas

### 4.1 Funções em `supabase/specs/sql/22_rls.sql`

| Função                                      | search_path       | Auth direto  | Status |
| ------------------------------------------- | ----------------- | ------------ | ------ |
| `public.is_tenant_member(p_tenant_id uuid)` | `public, pg_temp` | `auth.uid()` | OK     |
| `public.is_admin_master()`                  | `public, pg_temp` | `auth.uid()` | OK     |
| `public.user_tenant_ids()`                  | `public, pg_temp` | `auth.uid()` | OK     |

**Avaliação:** Todas as funções em 22_rls.sql são `SECURITY DEFINER`, usam `search_path = public, pg_temp` (evitando search_path inseguro), e consultam apenas tabelas do schema `public`. Sem risco de bypass via `temp` tables maliciosas.

### 4.2 Funções em `supabase/specs/sql/21_functions_triggers.sql`

| Função                                  | search_path       | Auth direto           | Uso em RLS | Status |
| --------------------------------------- | ----------------- | --------------------- | ---------- | ------ |
| `public.user_has_permission(...)`       | `public, pg_temp` | Não (recebe UUID)     | Não usada  | OK     |
| `public.user_permissions(...)`          | `public, pg_temp` | Não (recebe UUID)     | Não usada  | OK     |
| `public.domain_event_emit(...)`         | `public, pg_temp` | Não                   | N/A        | OK     |
| `public.event_outbox_enqueue(...)`      | `public, pg_temp` | Não                   | N/A        | OK     |
| `public.event_outbox_process_next(...)` | `public, pg_temp` | Não                   | N/A        | OK     |
| `public.stock_movement_insert()`        | `public, pg_temp` | Não                   | Trigger    | OK     |
| `public.purchase_receipt_confirm()`     | `public, pg_temp` | Não                   | Trigger    | OK     |
| `public.lgpd_legal_hold_check()`        | `public, pg_temp` | Não                   | Trigger    | OK     |
| `public.lgpd_consent_register()`        | `public, pg_temp` | `auth.uid()` fallback | Trigger    | OK     |

**Avaliação:** Todas as funções `SECURITY DEFINER` possuem `search_path = public, pg_temp` definido imediatamente após o corpo da função. Nenhuma usa `SET search_path` inseguro. Nenhuma função faz `GRANT` ou acessa objetos fora do schema esperado.

---

## 5. Tabelas Globais (sem tenant_id) — Policies

| Tabela               | Estratégia                | Policy                                                  | Avaliação |
| -------------------- | ------------------------- | ------------------------------------------------------- | --------- |
| `people`             | self-read + admin-write   | `people_self_read`, `people_admin_write`                | OK        |
| `tenants`            | admin-only                | `tenants_admin_all`                                     | OK        |
| `tenant_memberships` | admin + tenant membership | `tenant_memberships_member_read`, `*_write`, `*_update` | OK        |
| `tenant_settings`    | admin + tenant membership | `tenant_settings_member_read`, `*_write`, `*_update`    | OK        |
| `roles`              | admin-only                | `roles_admin_all`                                       | OK        |
| `permissions`        | admin-only                | `permissions_admin_all`                                 | OK        |
| `role_permissions`   | admin-only                | `role_permissions_admin_all`                            | OK        |
| `role_assignments`   | admin + self + tenant     | `role_assignments_admin_read`, `*_write`, `*_update`    | OK        |

---

## 6. Tabelas com FK Indireto — Subqueries

Todas as tabelas que não possuem `tenant_id` próprio utilizam subqueries `EXISTS` corretamente para verificar o tenant via tabela parent:

| Tabela                          | FK Parent           | Tabela Parent                 | Método                                     | Status |
| ------------------------------- | ------------------- | ----------------------------- | ------------------------------------------ | ------ |
| `employee_positions`            | `employee_id`       | `employees`                   | `EXISTS` + `is_tenant_member`              | OK     |
| `employee_contracts`            | `employee_id`       | `employees`                   | `EXISTS` + `is_tenant_member`              | OK     |
| `employee_documents`            | `employee_id`       | `employees`                   | `EXISTS` + `is_tenant_member`              | OK     |
| `employee_status_history`       | `employee_id`       | `employees`                   | `EXISTS` + `is_tenant_member`              | OK     |
| `service_order_items`           | `service_order_id`  | `service_orders`              | `EXISTS` + `is_tenant_member`              | OK     |
| `service_acceptances`           | `service_order_id`  | `service_orders`              | `EXISTS` + `is_tenant_member`              | OK     |
| `service_executions`            | `service_order_id`  | `service_orders`              | `EXISTS` + `is_tenant_member`              | OK     |
| `service_attachments`           | `service_order_id`  | `service_orders`              | `EXISTS` + `is_tenant_member`              | OK     |
| `service_order_status_history`  | `service_order_id`  | `service_orders`              | `EXISTS` + `is_tenant_member`              | OK     |
| `purchase_order_items`          | `purchase_order_id` | `purchase_orders`             | `EXISTS` + `is_tenant_member`              | OK     |
| `purchase_receipt_items`        | `receipt_id`        | `purchase_receipts`           | `EXISTS` + `is_tenant_member`              | OK     |
| `purchase_request_items`        | `request_id`        | `purchase_requests`           | `EXISTS` + `is_tenant_member`              | OK     |
| `purchase_quotation_items`      | `quotation_id`      | `purchase_quotations`         | `EXISTS` + `is_tenant_member`              | OK     |
| `invoice_items`                 | `invoice_id`        | `invoices`                    | `EXISTS` + `is_tenant_member`              | OK     |
| `stock_inventory_items`         | `inventory_id`      | `stock_inventory`             | `EXISTS` + `is_tenant_member`              | OK     |
| `chat_participants`             | `room_id`           | `chat_rooms`                  | `EXISTS` + `is_tenant_member`              | OK     |
| `chat_messages`                 | `room_id`           | `chat_rooms`                  | `EXISTS` + `is_tenant_member`              | OK     |
| `chat_handoffs`                 | `room_id`           | `chat_rooms`                  | `EXISTS` + `is_tenant_member`              | OK     |
| `ai_messages`                   | `conversation_id`   | `ai_conversations`            | `EXISTS` + `is_tenant_member`              | OK     |
| `notification_deliveries`       | `notification_id`   | `notifications`               | `EXISTS` + `is_tenant_member`              | OK     |
| `file_access_logs`              | `file_id`           | `files`                       | `EXISTS` + `is_tenant_member`              | OK     |
| `task_comments`                 | `task_id`           | `tasks`                       | `EXISTS` + `is_tenant_member`              | OK     |
| `task_attachments`              | `task_id`           | `tasks`                       | `EXISTS` + `is_tenant_member`              | OK     |
| `task_status_history`           | `task_id`           | `tasks`                       | `EXISTS` + `is_tenant_member`              | OK     |
| `support_ticket_status_history` | `ticket_id`         | `support_tickets`             | `EXISTS` + `is_tenant_member`              | OK     |
| `support_ticket_messages`       | `ticket_id`         | `support_tickets`             | `EXISTS` + `is_tenant_member`              | OK     |
| `support_ticket_assignments`    | `ticket_id`         | `support_tickets`             | `EXISTS` + `is_tenant_member`              | OK     |
| `application_status_history`    | `application_id`    | `applications` → `candidates` | `EXISTS` + `is_tenant_member(c.tenant_id)` | OK     |
| `interviews`                    | `application_id`    | `applications` → `candidates` | `EXISTS` + `is_tenant_member(c.tenant_id)` | OK     |
| `company_relationships`         | `company_id`        | `companies`                   | `EXISTS` + join `tenant_memberships`       | OK     |
| `company_contacts`              | `company_id`        | `companies`                   | `EXISTS` + join `tenant_memberships`       | OK     |

---

## 7. Verificação de Tabelas Novas SEM RLS

Foram verificados todos os arquivos SQL adicionados/modificados no commit 7c2aa30:

| Arquivo                          | Tabelas criadas                                                                                                                                        | RLS em 22_rls.sql |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| `33_employees.sql`               | departments, positions, employees, employee_positions, employee_contracts, employee_documents, employee_status_history                                 | Todas cobertas    |
| `34_crm_services.sql`            | company_services, service_orders, service_order_items, service_acceptances, service_executions, service_attachments, interactions, recruitment_demands | Todas cobertas    |
| `35_recruitment_talent_pool.sql` | talent_pool_memberships, job_matches, candidate_profile_views                                                                                          | Todas cobertas    |
| `36_inventory.sql`               | warehouses, warehouse_locations, product_categories, stock_lots, stock_inventory, stock_inventory_items                                                | Todas cobertas    |
| `37_purchasing.sql`              | purchase_requests, purchase_request_items, purchase_quotations, purchase_quotation_items, purchase_status_history, purchase_receipt_divergences        | Todas cobertas    |
| `39_fiscal.sql`                  | fiscal_integrations                                                                                                                                    | Coberta           |
| `40_tasks_support.sql`           | task_comments, task_attachments, task_status_history, support_ticket_categories, support_tickets, support_ticket_messages, support_ticket_assignments  | Todas cobertas    |
| `41_chat_security.sql`           | ai_usage, sessions, password_policies                                                                                                                  | Todas cobertas    |
| `42_automation.sql`              | automation_templates                                                                                                                                   | Coberta           |
| `43_notifications.sql`           | notification_preferences                                                                                                                               | Coberta           |
| `44_reports_views.sql`           | report_definitions, report_executions, report_schedules, dashboard_widgets, dashboard_layouts                                                          | Todas cobertas    |

**Resultado:** Nenhuma tabela nova está sem RLS.

---

## 8. Recomendações

### 8.1 Alta Prioridade

1. **Adicionar políticas DELETE explícitas** ou documentar a decisão de bloquear DELETE em todas as tabelas operacionais. Se o bloqueio é intencional, substituir a ausência por:

   ```sql
   create policy <table>_member_delete on public.<table>
     for delete
     using (false);
   ```

2. **Integrar `user_has_permission()` nas policies RLS** para aplicar RBAC granular. Exemplo:
   ```sql
   create policy orders_member_update on public.service_orders
     for update
     using (
       public.is_admin_master()
       or is_tenant_member(tenant_id)
       or public.user_has_permission(auth.uid(), 'service_orders', 'update', tenant_id)
     )
     with check (
       public.is_admin_master()
       or is_tenant_member(tenant_id)
       or public.user_has_permission(auth.uid(), 'service_orders', 'update', tenant_id)
     );
   ```

### 8.2 Média Prioridade

3. **Documentar tabelas sem UPDATE:** As tabelas de histórico (`*_status_history`, `audit_logs`, `domain_events`, etc.) devem ter comentário explícito ou policy `using (false)` para UPDATE, para evitar interpretação como omissão.

4. **Adicionar policy INSERT em `audit_logs`:** Se logs são gerados via trigger/função, garantir que a função tenha permissão. Caso contrário, `audit_logs` ficará vazia.

### 8.3 Baixa Prioridade

5. **Considerar wrapper para auth.uid():** Embora seguro no Supabase, se houver migração futura para outro provedor Auth, as funções `is_tenant_member()` e `is_admin_master()` precisarão de refatoração.

6. **Garantir que `current_setting('app.current_person_id')` seja definido:** Funções como `purchase_receipt_confirm()` usam fallback para `auth.uid()`. Verificar se o middleware da aplicação define essa variável corretamente para evitar uso inadvertido de `auth.uid()` em contexts de service_role.

---

## 9. Conclusão

O arquivo `22_rls.sql` demonstra maturidade na aplicação de RLS multi-tenant:

- Todas as 115 tabelas possuem RLS habilitado.
- O isolamento cross-tenant é consistentemente aplicado via `is_tenant_member()`.
- Tabelas com FK indireto utilizam subqueries corretas.
- Funções `SECURITY DEFINER` possuem `search_path` correto.

Os principais riscos são:

1. Falta de DELETE policies (crítico se intencional, documentar).
2. RBAC granular não aplicada nas policies RLS (médio).
3. Ausência de algumas policies UPDATE em tabelas de histórico (baixo, se intencional).

**Recomendação final:** Implementar as recomendações de alta prioridade antes do deploy em produção.
