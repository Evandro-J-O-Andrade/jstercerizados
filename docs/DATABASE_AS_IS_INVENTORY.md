# DATABASE AS-IS INVENTORY — J&S Empregos LTDA

**Data:** 2026-08-18  
**Escopo:** Leitura estática de migrations + schema.sql (referência desatualizada)  
**Objetivo:** Matriz ATUAL × V2.1 para decisão de DROP/RECONSTRUÇÃO

---

## 1. Estrutura do AS-IS (migrations 001–016)

### 1.1 Tabelas confirmadas nas migrations

| # | Tabela | Schema | Observação |
|---|--------|--------|------------|
| 1 | tenants | public | Core |
| 2 | people | public | **People-First** |
| 3 | tenant_memberships | public | person_id (não user_id) |
| 4 | companies | public | **GLOBAL** (sem tenant_id) |
| 5 | company_types | public | Lookup |
| 6 | company_relationships | public | Tenant-scoped via tenant_id |
| 7 | company_contacts | public | Tenant-scoped |
| 8 | candidates | public | person_id + tenant_id |
| 9 | skills | public | **GLOBAL** |
| 10 | candidate_skills | public | Tenant via candidate |
| 11 | jobs | public | company_relationship_id (não company_id) |
| 12 | job_skills | public | Tenant via job |
| 13 | applications | public | candidate + job |
| 14 | application_status_history | public | Append-only |
| 15 | application_profile_snapshots | public | Append-only |
| 16 | recruitment_processes | public | Tenant-scoped |
| 17 | interviews | public | Tenant-scoped |
| 18 | evaluations | public | Tenant-scoped |
| 19 | hires | public | Tenant-scoped |
| 20 | candidate_documents | public | Tenant-scoped |
| 21 | curricula | public | Tenant-scoped |
| 22 | experiences | public | Tenant via curriculum |
| 23 | education | public | Tenant via curriculum |
| 24 | courses | public | Tenant via curriculum |
| 25 | languages | public | Tenant via curriculum |
| 26 | favorite_jobs | public | Tenant-scoped |
| 27 | leads | public | Tenant-scoped |
| 28 | contact_requests | public | Tenant-scoped |
| 29 | notifications | public | user_id (auth.users) |
| 30 | notification_deliveries | public | Tenant via notification |
| 31 | notification_preferences | public | person_id |
| 32 | files | public | Tenant-scoped |
| 33 | file_access_logs | public | Append-only |
| 34 | domain_events | public | Tenant-scoped |
| 35 | webhooks | public | Tenant-scoped |
| 36 | automation_queue | public | Tenant-scoped |
| 37 | whatsapp_messages | public | Tenant-scoped |
| 38 | emails | public | Tenant-scoped |
| 39 | ai_conversations | public | Tenant-scoped |
| 40 | services | public | Tenant-scoped |
| 41 | tickets | public | Tenant-scoped |
| 42 | audit_logs | public | Tenant-scoped |
| 43 | permissions | public | Global RBAC |
| 44 | roles | public | Global + tenant |
| 45 | role_permissions | public | Global RBAC |
| 46 | role_assignments | public | Global + tenant |
| 47 | role_resource_permissions | public | Authorization matrix |
| 48 | talent_pool_memberships | public | Tenant-scoped |
| 49 | candidate_preferences | public | Tenant via candidate |
| 50 | candidate_profile_views | public | Tenant-scoped |
| 51 | job_matches | public | Tenant-scoped |

### 1.2 Tabelas no schema.sql (desatualizado) — NÃO usar como referência

O arquivo `supabase/schema.sql` contém um estado antigo e **inconsistente** com as migrations. Inclui:
- `profiles` (NÃO existe nas migrations — legado)
- `companies` com `tenant_id` (migrations tem companies GLOBAL)
- `tenant_memberships` com `user_id` (migrations tem `person_id`)
- Falta `people`, `roles`, `permissions`, `role_assignments`, etc.

**Conclusão:** O schema.sql está **descartado** como referência. O AS-IS real está nas migrations.

### 1.3 Enums no AS-IS

| Enum | Tabela(s) | Valores |
|------|-----------|---------|
| notification_status | notifications | draft, pending, processing, sent, failed, expired |
| notification_priority | notifications | low, normal, high, urgent |
| notification_channel | notifications | in_app, email, whatsapp, push |
| notification_delivery_status | notification_deliveries | pending, sent, delivered, failed, skipped |
| notification_category | notifications | transactional, matching, marketing, system |
| talent_pool_status | talent_pool_memberships | active, paused, removed |
| talent_pool_source | talent_pool_memberships | direct_signup, application_rejected, recruiter_invitation, import, campaign |
| consent_status | talent_pool_memberships | granted, revoked, expired |

### 1.4 Functions no AS-IS

| Função | Tipo | Propósito |
|--------|------|-----------|
| handle_new_auth_user() | SECURITY DEFINER | Cria people após INSERT em auth.users |
| handle_auth_user_updated() | SECURITY DEFINER | Sync email em people |
| handle_auth_user_deleted() | SECURITY DEFINER | Limpa auth_user_id em people |
| update_updated_at() | SECURITY DEFINER | Trigger genérico updated_at |
| increment_job_views(p_job_id) | SECURITY DEFINER | Incrementa views em jobs |
| increment_application_count(p_job_id) | SECURITY DEFINER | Incrementa applications_count |
| sync_application_current_stage() | SECURITY DEFINER | Sync current_stage em applications |
| capture_application_profile_snapshot() | SECURITY DEFINER | Captura snapshot JSON do candidato |
| prevent_history_modification() | SECURITY DEFINER | Bloqueia UPDATE/DELETE em application_status_history |
| emit_domain_event() | SECURITY DEFINER | Helper para emitir eventos de domínio |
| emit_application_created_event() | SECURITY DEFINER | Trigger event |
| emit_application_status_changed_event() | SECURITY DEFINER | Trigger event |
| emit_candidate_created_event() | SECURITY DEFINER | Trigger event |
| emit_job_published_event() | SECURITY DEFINER | Trigger event |
| skip_expired_notification_deliveries() | SECURITY DEFINER | Skip deliveries expiradas |
| create_notification() | SECURITY DEFINER | Cria notificação idempotente |
| create_notification_delivery() | SECURITY DEFINER | Cria delivery idempotente |
| mark_delivery_sent() | SECURITY DEFINER | Marca delivery como enviada |
| mark_delivery_delivered() | SECURITY DEFINER | Marca delivery como entregue |
| mark_delivery_failed() | SECURITY DEFINER | Marca delivery como falha |
| get_pending_deliveries() | SECURITY DEFINER | Lista deliveries pendentes |
| get_due_deliveries() | SECURITY DEFINER | Lista deliveries por vencer |
| mark_notification_read() | SECURITY DEFINER | Marca notificação como lida |
| is_channel_enabled() | SECURITY DEFINER | Verifica preferência de canal |
| create_default_notification_preferences() | SECURITY DEFINER | Cria preferências padrão |
| validate_talent_pool_consent() | SECURITY DEFINER | Valida consentimento para talent pool |
| join_talent_pool() | SECURITY DEFINER | Adiciona candidato ao talent pool |
| remove_from_talent_pool() | SECURITY DEFINER | Remove candidato do talent pool |
| pause_talent_pool() | SECURITY DEFINER | Pausa candidato no talent pool |
| get_active_candidates_for_matching() | SECURITY DEFINER | Lista candidatos para matching |
| validate_candidate_preferences_update() | SECURITY DEFINER | Valida update de preferências |
| prevent_event_modification() | SECURITY DEFINER | Bloqueia UPDATE de payload/event_name em domain_events |
| get_pending_domain_events() | SECURITY DEFINER | Lista eventos pendentes para n8n |
| mark_event_published() | SECURITY DEFINER | Marca evento como publicado |
| mark_event_failed() | SECURITY DEFINER | Marca evento como falha |
| user_has_permission() | SECURITY DEFINER | Verifica permissão (global + tenant) |
| can_access_tenant() | SECURITY DEFINER | Verifica acesso a tenant |
| is_admin_master() | SECURITY DEFINER | Verifica se usuário é admin_master |
| can_manage_role_assignment() | SECURITY DEFINER | Verifica se pode gerenciar role assignment |
| is_frontend_safe_role() | SECURITY DEFINER | Verifica se role é safe para frontend |

### 1.5 Triggers no AS-IS

| Trigger | Evento | Ação |
|---------|--------|------|
| on_auth_user_created | AFTER INSERT auth.users | handle_new_auth_user() |
| on_auth_user_updated | AFTER UPDATE email auth.users | handle_auth_user_updated() |
| on_auth_user_deleted | AFTER DELETE auth.users | handle_auth_user_deleted() |
| update_tenants_updated_at | BEFORE UPDATE tenants | update_updated_at() |
| update_people_updated_at | BEFORE UPDATE people | update_updated_at() |
| update_tenant_memberships_updated_at | BEFORE UPDATE tenant_memberships | update_updated_at() |
| update_company_types_updated_at | BEFORE UPDATE company_types | update_updated_at() |
| update_companies_updated_at | BEFORE UPDATE companies | update_updated_at() |
| update_company_relationship_types_updated_at | BEFORE UPDATE company_relationship_types | update_updated_at() |
| update_company_relationships_updated_at | BEFORE UPDATE company_relationships | update_updated_at() |
| update_company_contacts_updated_at | BEFORE UPDATE company_contacts | update_updated_at() |
| update_candidates_updated_at | BEFORE UPDATE candidates | update_updated_at() |
| update_skills_updated_at | BEFORE UPDATE skills | update_updated_at() |
| update_jobs_updated_at | BEFORE UPDATE jobs | update_updated_at() |
| update_job_skills_updated_at | BEFORE UPDATE job_skills | update_updated_at() |
| update_applications_updated_at | BEFORE UPDATE applications | update_updated_at() |
| update_applications_updated_at | BEFORE UPDATE applications | update_updated_at() |
| capture_profile_snapshot | BEFORE INSERT applications | capture_application_profile_snapshot() |
| prevent_history_update | BEFORE UPDATE application_status_history | prevent_history_modification() |
| prevent_history_delete | BEFORE DELETE application_status_history | prevent_history_modification() |
| sync_application_current_stage | AFTER INSERT application_status_history | sync_application_current_stage() |
| update_domain_events_updated_at | BEFORE UPDATE domain_events | update_updated_at() |
| prevent_event_update | BEFORE UPDATE domain_events | prevent_event_modification() |
| prevent_event_delete | BEFORE DELETE domain_events | prevent_history_modification() |
| application_created_event | AFTER INSERT applications | emit_application_created_event() |
| application_status_changed_event | AFTER INSERT application_status_history | emit_application_status_changed_event() |
| candidate_created_event | AFTER INSERT candidates | emit_candidate_created_event() |
| job_published_event | AFTER UPDATE jobs | emit_job_published_event() |
| update_talent_pool_updated_at | BEFORE UPDATE talent_pool_memberships | update_updated_at() |
| validate_talent_pool_consent | BEFORE INSERT/UPDATE talent_pool_memberships | validate_talent_pool_consent() |
| talent_pool_joined_event | AFTER INSERT talent_pool_memberships | emit_talent_pool_joined_event() |
| job_match_found_event | AFTER INSERT job_matches | emit_job_match_found_event() |
| update_candidate_prefs_updated_at | BEFORE UPDATE candidate_preferences | update_updated_at() |
| update_job_matches_updated_at | BEFORE UPDATE job_matches | update_updated_at() |
| log_file_access_insert | AFTER INSERT file_access_logs | update_updated_at() |
| update_files_updated_at | BEFORE UPDATE files | update_updated_at() |
| update_notification_deliveries_updated_at | BEFORE UPDATE notification_deliveries | update_updated_at() |
| update_notification_preferences_updated_at | BEFORE UPDATE notification_preferences | update_updated_at() |

### 1.6 RLS Policies no AS-IS

Total: **~70 policies** espalhadas pelas migrations. Padrão consistente:
- `auth.uid() → people.auth_user_id → people.id → tenant_memberships → tenant_id`
- `service_role` bypass em todas
- `admin_master` global via `user_has_permission()`

### 1.7 Dados agregados (REAIS — consulta direta ao Supabase)

**Data:** 2026-08-18  
**Método:** REST API (secret key) + análise de migrations

| Tabela | Count real | Observação |
|--------|-----------|------------|
| tenants | 1 | J&S Empregos LTDA (slug: js-empregos) |
| people | 1 | Evandro Andrade (auth_user_id: a78ddef1...) |
| tenant_memberships | 1 | owner, tenant_id: a1b2c3d4... |
| roles | 10 | 3 globais + 7 tenant |
| role_assignments | 1 | admin_master global (tenant_id: null) |
| role_permissions | 0 | Vazio |
| role_resource_permissions | 114 | Matriz de permissões |
| permissions | 26 | Permissões canônicas |
| companies | 0 | Vazio |
| candidates | 0 | Vazio |
| jobs | 0 | Vazio |
| applications | 0 | Vazio |
| notifications | 0 | Vazio |
| files | 0 | Vazio |
| domain_events | 0 | Vazio |
| skills | 68 | Catálogo seed |
| candidate_skills | 0 | Vazio |
| job_skills | 0 | Vazio |
| talent_pool_memberships | 0 | Vazio |
| candidate_preferences | 0 | Vazio |
| candidate_profile_views | 0 | Vazio |
| job_matches | 0 | Vazio |
| notification_deliveries | 0 | Vazio |
| notification_preferences | 0 | Vazio |
| file_access_logs | 0 | Vazio |
| company_relationships | 0 | Vazio |
| company_contacts | 0 | Vazio |
| company_types | 6 | Seed |
| application_status_history | 0 | Vazio |
| application_profile_snapshots | 0 | Vazio |

### 1.8 Tabelas que EXISTEM nas migrations mas NÃO no banco real (PGRST205)

| Tabela | Status |
|--------|--------|
| profiles | **NÃO EXISTE** |
| webhooks | **NÃO EXISTE** |
| automation_queue | **NÃO EXISTE** |
| ai_conversations | **NÃO EXISTE** |
| services | **NÃO EXISTE** |
| tickets | **NÃO EXISTE** |
| leads | **NÃO EXISTE** |
| contact_requests | **NÃO EXISTE** |
| audit_logs | **NÃO EXISTE** |
| recruitment_processes | **NÃO EXISTE** |
| interviews | **NÃO EXISTE** |
| evaluations | **NÃO EXISTE** |
| hires | **NÃO EXISTE** |
| candidate_documents | **NÃO EXISTE** |
| curricula | **NÃO EXISTE** |
| experiences | **NÃO EXISTE** |
| education | **NÃO EXISTE** |
| courses | **NÃO EXISTE** |
| languages | **NÃO EXISTE** |
| favorite_jobs | **NÃO EXISTE** |

### 1.9 Chain de identidade confirmada (REAL)

```
auth.users (a78ddef1-5659-404f-9c7c-940c5df0abf1)
    ↓
people (5959468c-ce89-474a-a277-a1eef6ff1731)
    ↓
tenant_memberships (b6e3f6b8-3c38-440b-978b-c8cf77b4b3d1)
    tenant_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890 (J&S Empregos LTDA)
    membership_role: owner
    ↓
role_assignments (5e79f69b-9b31-44e8-a464-4144f31add0b)
    role_id: 82c33a22-b8d4-4711-b003-53c11b0d0be8
    role_name: admin_master
    is_global: true
    tenant_id: null (global)
```

**Conclusão da chain:** O banco real está com a estrutura correta de People-First. O usuário `evandro_j.o.a@hotmail.com` é `admin_master` global e `owner` do tenant J&S Empregos LTDA.

### 1.10 Extensões confirmadas no banco real

| Extensão | Status |
|----------|--------|
| uuid-ossp | ✅ |
| pgcrypto | ✅ |

### 1.11 Enums confirmados no banco real

| Enum | Valores |
|------|---------|
| notification_status | draft, pending, processing, sent, failed, expired |
| notification_priority | low, normal, high, urgent |
| notification_channel | in_app, email, whatsapp, push |
| notification_delivery_status | pending, sent, delivered, failed, skipped |
| notification_category | transactional, matching, marketing, system |
| talent_pool_status | active, paused, removed |
| talent_pool_source | direct_signup, application_rejected, recruiter_invitation, import, campaign |
| consent_status | granted, revoked, expired |

### 1.12 Functions confirmadas no banco real (via REST)

O banco real tem as functions listadas na seção 1.4, mas **não foi possível confirmar via REST** porque functions não são expostas pelo PostgREST. A confiança vem das migrations.

### 1.13 RLS Policies confirmadas no banco real (via REST)

Não foi possível listar policies via REST (requer acesso a `pg_policy`). Confiança vem das migrations.

---

## 2. Estrutura do TO-BE (V2.1 — docs/sql/)

### 2.1 Tabelas na V2.1

| # | Tabela | Status vs AS-IS |
|---|--------|-----------------|
| 1 | tenants | PRESERVAR |
| 2 | tenant_settings | **NEW** |
| 3 | people | PRESERVAR (não usar profiles) |
| 4 | tenant_memberships | PRESERVAR |
| 5 | roles | PRESERVAR |
| 6 | permissions | PRESERVAR |
| 7 | role_permissions | PRESERVAR |
| 8 | role_assignments | PRESERVAR |
| 9 | role_resource_permissions | PRESERVAR |
| 10 | companies | **REBUILD** (global → tenant-scoped) |
| 11 | company_relationships | PRESERVAR |
| 12 | company_contacts | PRESERVAR |
| 13 | interactions | **NEW** |
| 14 | candidates | PRESERVAR |
| 15 | candidate_documents | PRESERVAR |
| 16 | candidate_experiences | PRESERVAR |
| 17 | candidate_education | PRESERVAR |
| 18 | candidate_courses | PRESERVAR |
| 19 | candidate_languages | PRESERVAR |
| 20 | candidate_skills | PRESERVAR |
| 21 | skills | **REBUILD** (global → híbrido) |
| 22 | stage_templates | **NEW** |
| 23 | jobs | **REBUILD** (estrutura diferente) |
| 24 | job_skills | PRESERVAR |
| 25 | recruitment_processes | PRESERVAR |
| 26 | recruitment_stages | **NEW** |
| 27 | candidate_processes | **NEW** |
| 28 | interviews | PRESERVAR |
| 29 | interview_participants | **NEW** |
| 30 | interview_feedback | **NEW** |
| 31 | talent_pool_memberships | PRESERVAR |
| 32 | job_matches | PRESERVAR |
| 33 | candidate_profile_views | PRESERVAR |
| 34 | applications | **REBUILD** (estrutura diferente) |
| 35 | application_status_history | PRESERVAR |
| 36 | application_profile_snapshots | PRESERVAR |
| 37 | employees | **NEW** |
| 38 | employee_contracts | **NEW** |
| 39 | employee_documents | **NEW** |
| 40 | employee_status_history | **NEW** |
| 41 | departments | **NEW** |
| 42 | positions | **NEW** |
| 43 | employee_positions | **NEW** |
| 44 | administrative_requests | **NEW** |
| 45 | administrative_tasks | **NEW** |
| 46 | administrative_approvals | **NEW** |
| 47 | administrative_documents | **NEW** |
| 48 | financial_accounts | **NEW** |
| 49 | financial_categories | **NEW** |
| 50 | cost_centers | **NEW** |
| 51 | accounts_receivable | **NEW** |
| 52 | accounts_payable | **NEW** |
| 53 | financial_transactions | **NEW** |
| 54 | invoices | **NEW** |
| 55 | invoice_items | **NEW** |
| 56 | payments | **NEW** |
| 57 | expenses | **NEW** |
| 58 | revenues | **NEW** |
| 59 | fiscal_configurations | **NEW** |
| 60 | fiscal_integrations | **NEW** |
| 61 | fiscal_documents | **NEW** |
| 62 | fiscal_document_items | **NEW** |
| 63 | fiscal_document_events | **NEW** |
| 64 | fiscal_document_status_history | **NEW** |
| 65 | fiscal_api_requests | **NEW** |
| 66 | fiscal_api_responses | **NEW** |
| 67 | products | **NEW** |
| 68 | product_categories | **NEW** |
| 69 | warehouses | **NEW** |
| 70 | warehouse_locations | **NEW** |
| 71 | stock_balances | **NEW** |
| 72 | stock_movements | **NEW** |
| 73 | stock_entries | **NEW** |
| 74 | stock_exits | **NEW** |
| 75 | stock_inventory | **NEW** |
| 76 | stock_inventory_items | **NEW** |
| 77 | stock_adjustments | **NEW** |
| 78 | suppliers | **NEW** |
| 79 | purchase_orders | **NEW** |
| 80 | purchase_order_items | **NEW** |
| 81 | tasks | **NEW** |
| 82 | task_comments | **NEW** |
| 83 | task_attachments | **NEW** |
| 84 | task_status_history | **NEW** |
| 85 | support_ticket_categories | **NEW** |
| 86 | support_tickets | **NEW** |
| 87 | support_ticket_messages | **NEW** |
| 88 | support_ticket_assignments | **NEW** |
| 89 | support_ticket_status_history | **NEW** |
| 90 | notifications | **REBUILD** (recipient_person_id vs user_id) |
| 91 | notification_deliveries | PRESERVAR |
| 92 | notification_preferences | PRESERVAR |
| 93 | chat_rooms | **NEW** |
| 94 | chat_participants | **NEW** |
| 95 | chat_messages | **NEW** |
| 96 | ai_conversations | **REBUILD** (estrutura diferente) |
| 97 | ai_messages | **NEW** |
| 98 | ai_usage | **NEW** |
| 99 | chat_assignments | **NEW** |
| 100 | chat_handoffs | **NEW** |
| 101 | chat_events | **NEW** |
| 102 | files | **REBUILD** (estrutura diferente) |
| 103 | file_access_logs | PRESERVAR |
| 104 | document_versions | **NEW** |
| 105 | document_links | **NEW** |
| 106 | domain_events | **REBUILD** (estrutura diferente) |
| 107 | audit_logs | PRESERVAR |
| 108 | security_events | **NEW** |
| 109 | consents | PRESERVAR |
| 110 | privacy_requests | **NEW** |
| 111 | data_export_requests | **NEW** |
| 112 | data_deletion_requests | **NEW** |
| 113 | data_retention_policies | **NEW** |

### 2.2 Tabelas no AS-IS mas NÃO na V2.1

| Tabela | Decisão |
|--------|---------|
| company_types | REMOVER (tipo inline em V2.1) |
| curricula | REMOVER (estrutura substituída por candidate_experiences/education/courses/languages diretas) |
| leads | REMOVER (não existe na V2.1) |
| contact_requests | REMOVER (não existe na V2.1) |
| webhooks | REMOVER (substituído por domain_events + n8n) |
| automation_queue | REMOVER (substituído por domain_events + n8n) |
| whatsapp_messages | REMOVER (logging deve ir para integration_logs, não tabela core) |
| emails | REMOVER (logging deve ir para integration_logs, não tabela core) |
| services | REMOVER (não existe na V2.1) |
| tickets | REMOVER (substituído por support_tickets) |

### 2.3 Tabelas na V2.1 mas NÃO no AS-IS (NEW)

| Tabela | Justificativa |
|--------|---------------|
| tenant_settings | Configurações centralizadas do tenant |
| interactions | CRM — histórico de interações |
| stage_templates | RH — templates de etapa de processo |
| recruitment_stages | RH — etapas de processo seletivo |
| candidate_processes | RH — relação candidato × processo |
| interview_participants | RH — participantes de entrevista |
| interview_feedback | RH — feedback de entrevista |
| employees | RH — funcionários contratados |
| employee_contracts | RH — contratos |
| employee_documents | RH — documentos de funcionário |
| employee_status_history | RH — histórico de status |
| departments | RH — departamentos |
| positions | RH — cargos |
| employee_positions | RH — histórico de posições |
| administrative_requests | Administrativo — solicitações |
| administrative_tasks | Administrativo — tarefas |
| administrative_approvals | Administrativo — aprovações |
| administrative_documents | Administrativo — documentos |
| financial_accounts | Financeiro — contas |
| financial_categories | Financeiro — categorias |
| cost_centers | Financeiro — centros de custo |
| accounts_receivable | Financeiro — contas a receber |
| accounts_payable | Financeiro — contas a pagar |
| financial_transactions | Financeiro — transações |
| invoices | Financeiro — notas fiscais |
| invoice_items | Financeiro — itens de nota |
| payments | Financeiro — pagamentos |
| expenses | Financeiro — despesas |
| revenues | Financeiro — receitas |
| fiscal_configurations | Fiscal — configurações |
| fiscal_integrations | Fiscal — integrações |
| fiscal_documents | Fiscal — documentos fiscais |
| fiscal_document_items | Fiscal — itens |
| fiscal_document_events | Fiscal — eventos |
| fiscal_document_status_history | Fiscal — histórico |
| fiscal_api_requests | Fiscal — requests |
| fiscal_api_responses | Fiscal — responses |
| products | Estoque — produtos |
| product_categories | Estoque — categorias |
| warehouses | Estoque — armazéns |
| warehouse_locations | Estoque — locais |
| stock_balances | Estoque — saldos |
| stock_movements | Estoque — movimentações |
| stock_entries | Estoque — entradas |
| stock_exits | Estoque — saídas |
| stock_inventory | Estoque — inventário |
| stock_inventory_items | Estoque — itens de inventário |
| stock_adjustments | Estoque — ajustes |
| suppliers | Estoque — fornecedores |
| purchase_orders | Estoque — ordens de compra |
| purchase_order_items | Estoque — itens de ordem |
| tasks | Tasks — tarefas |
| task_comments | Tasks — comentários |
| task_attachments | Tasks — anexos |
| task_status_history | Tasks — histórico |
| support_ticket_categories | Support — categorias |
| support_tickets | Support — tickets |
| support_ticket_messages | Support — mensagens |
| support_ticket_assignments | Support — atribuições |
| support_ticket_status_history | Support — histórico |
| chat_rooms | Chat — salas |
| chat_participants | Chat — participantes |
| chat_messages | Chat — mensagens |
| ai_messages | Chat IA — mensagens |
| ai_usage | Chat IA — uso |
| chat_assignments | Chat — atribuições |
| chat_handoffs | Chat — handoffs |
| chat_events | Chat — eventos |
| document_versions | Storage — versões |
| document_links | Storage — links |
| security_events | Audit — eventos de segurança |
| privacy_requests | LGPD — solicitações |
| data_export_requests | LGPD — exportação |
| data_deletion_requests | LGPD — exclusão |
| data_retention_policies | LGPD — retenção |

---

## 3. Matriz de Decisão

### 3.1 Referências proibidas encontradas

| Referência | Onde encontrada | Status |
|------------|-----------------|--------|
| `profiles` | schema.sql (desatualizado) | ELIMINAR — não deve ser recriado |
| `user_id` em tenant_memberships | schema.sql (desatualizado) | ELIMINAR — usar `person_id` |
| `tenant_membership_id` | Não encontrado | OK |
| `get_user_roles()` | Não encontrado | OK |
| `actor_person_id` | Não encontrado | OK |
| roles `admin`, `empresa`, `candidato` | profiles.role no schema.sql | ELIMINAR — usar RBAC canônico |
| `notification_preferences` | Existe no AS-IS e V2.1 | PRESERVAR |
| `role_resource_permissions` | Existe no AS-IS e V2.1 | PRESERVAR |
| `talent_pool_memberships` | Existe no AS-IS e V2.1 | PRESERVAR |

### 3.2 Divergências estruturais críticas

| Aspecto | AS-IS | V2.1 | Impacto |
|---------|-------|------|---------|
| Identidade | `profiles` (schema.sql) / `people` (migrations) | `people` | Alto — schema.sql está errado |
| Tenant memberships | `user_id` (schema.sql) / `person_id` (migrations) | `person_id` | Alto — schema.sql está errado |
| Companies | GLOBAL (migrations) | tenant-scoped | Alto — quebra relacionamentos |
| Jobs FK | `company_relationship_id` (migrations) | `company_id` | Alto — inversão de relação |
| Applications FK | `candidate_id` (contexto) | `candidate_id` (contexto) | OK |
| Notifications | `user_id` (auth.users) | `recipient_person_id` (people) | Médio — adaptação necessária |
| Domain events | `actor_person_id` + campos complexos | `aggregate` + `event_type` simplificado | Médio — perde detalhes |
| Candidates | Campos específicos (cpf, rg, etc) | Campos simplificados | Médio — backfill necessário |
| Skills | GLOBAL (sem tenant_id) | híbrido (tenant_id opcional) | Baixo — compatível |

### 3.3 Matriz de decisão resumida

| Categoria | Decisão |
|-----------|---------|
| Tabelas PRESERVAR | ~30 tabelas |
| Tabelas REBUILD | ~10 tabelas |
| Tabelas NEW | ~70 tabelas |
| Tabelas REMOVER | ~10 tabelas |
| Tabelas MISSING (V2.1 cobre AS-IS?) | 0 — V2.1 cobre todas as funcionalidades, mas com estrutura diferente |

---

## 4. Conclusão e Recomendação

### 4.1 Estado do AS-IS (REAL)

O banco **atual** está em um estado **muito menor** do que as migrations descrevem. Consulta direta ao Supabase revelou:

- **Tabelas existentes:** ~25 (core + RBAC + notifications + storage + skills)
- **Tabelas das migrations que NÃO existem no banco:** ~25 (recruitment, RH, fiscal, inventory, chat, support, etc.)
- **Dados:** praticamente apenas seed (1 person, 1 membership, 10 roles, 114 role_resource_permissions, 68 skills, 6 company_types)
- **`profiles` NÃO existe** no banco real
- **`profiles` com `user_id` NÃO existe** no banco real

**Isso significa:** O banco real está em um estado "core + RBAC" e NÃO tem as tabelas operacionais (vagas, candidatos, processos, etc.) populadas. As migrations foram aplicadas parcialmente ou o banco foi normalizado em algum ponto.

### 4.2 Estado do TO-BE (V2.1)

A V2.1 representa uma **reconstrução arquitetural**, não uma evolução. Principais mudanças:

- **Companies vira tenant-scoped** (quebra arquitetura global atual)
- **Jobs volta a referenciar companies diretamente** (não mais relationship)
- **Candidates/Employees/Departments** completamente reestruturados
- **Financeiro/Fiscal/Estoque** totalmente novos
- **Chat IA** separado em `ai_conversations`, `ai_messages`, `ai_usage`
- **LGPD** expandida com `privacy_requests`, `data_export_requests`, `data_deletion_requests`, `data_retention_policies`

### 4.3 Risco do DROP

| Risco | Probabilidade | Impacto |
|-------|--------------|---------|
| Perda de dados de candidatos | BAIXA (banco está vazio) | Baixo |
| Perda de vagas e processos | BAIXA (banco está vazio) | Baixo |
| Perda de configurações de tenant | BAIXA | Baixo |
| Perda de logs de auditoria | BAIXA (banco está vazio) | Baixo |
| Incompatibilidade com frontend | ALTA | Crítico |

### 4.4 Recomendação

**AINDA NÃO autorizar DROP.** Motivos:

1. **V2.1 não é um upgrade, é uma reconstrução.** A quantidade de tabelas novas e estruturas alteradas indica que o esforço é equivalente a um novo projeto.
2. **Falta mapeamento de dados.** Embora o banco esteja quase vazio, não há documento que mostre como migrar dados do AS-IS para a V2.1.
3. **Falta validação com frontend.** Não foi confirmado que todos os componentes do frontend funcionarão com a V2.1.
4. **schema.sql está desatualizado.** Isso indica falta de controle de versão do schema, o que aumenta risco.
5. **Divergência entre migrations e banco real.** Apenas ~25 tabelas existem no banco real, mas as migrations descrevem ~50. Isso precisa ser investigado antes de qualquer ação.

### 4.5 Achados Críticos

| Achado | Severidade |
|--------|-----------|
| schema.sql desatualizado e inconsistente com migrations | Alto |
| Migrations descrevem tabelas que não existem no banco real | Alto |
| `profiles` não existe no banco real (apenas `people`) | Médio |
| `companies` no banco real é global (sem tenant_id) | Alto |
| Jobs no banco real usa `company_relationship_id` | Alto |
| V2.1 propõe `companies` tenant-scoped | Conflito |
| V2.1 propõe `jobs` com `company_id` direto | Conflito |

### 4.6 Próximos passos obrigatórios

1. **Investigar divergência migrations vs banco real:** Por que ~25 tabelas não existem no banco?
2. **Backup completo do banco atual** (pg_dump ou Supabase backup)
3. **Levantamento de dados:** confirmar se há dados além dos seeds
4. **Mapeamento frontend → V2.1:** confirmar que cada tela/feature tem suporte
5. **Script de migração de dados:** AS-IS → V2.1 (não DROP, mas TRANSFORM)
6. **Dry-run em ambiente isolado** com dados reais anonimizados
7. **Plano de rollback** documentado

---

**Checkpoint atualizado:**

```text
PRODUÇÃO
🔒 js-empregos intacto

SQL V2.1
✅ 24 blocos produzidos
✅ revisão estática concluída
✅ inventário real confirmado
⚠️  NÃO recomendado para DROP direto

DRY-RUN
⏳ aguardando mapeamento frontend + migração de dados

DROP
❌ bloqueado
```
