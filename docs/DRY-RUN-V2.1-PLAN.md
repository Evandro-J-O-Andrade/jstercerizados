# DRY-RUN-V2.1-PLAN

> Status: PLAN DRAFT — READ-ONLY
> Baseline: DATABASE-BASELINE-JS-EMPREGOS-V2.md
> Build Spec: DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md
> Frontend: FRONTEND-RBAC-CONTRACT.md
> Auth: AUTH-400-INCIDENT-ANALYSIS.md
> Cross-review: V2.1-CROSS-REVIEW.md
> Regra: nenhuma alteração no Supabase de produção, migrations, RLS, RBAC, frontend ou dados até aprovação formal.

---

## 1. Objetivo

Preparar o ensaio geral da reconstrução V2.1 em projeto Supabase temporário e descartável, sem tocar em `js-empregos`.

---

## 2. Pré-requisitos

- Projeto temporário criado com nome explícito: `js-empregos-v21-dryrun`
- Acesso administrativo ao projeto temporário
- Variáveis de ambiente isoladas para o temporário:
  - `SUPABASE_PROJECT_REF`
  - `SUPABASE_DB_PASSWORD`
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY`
- Nenhuma credencial de produção usada no temporário
- Nenhum dado real inserido no temporário

---

## 3. Ordem de execução

```text
01. Bootstrap do banco
02. Extensions
03. Core / People / Tenants
04. Auth ↔ People
05. RBAC
06. CRM
07. RH / candidatos
08. Recrutamento
09. Funcionários / Gestão
10. Administrativo
11. Financeiro
12. Fiscal / NF
13. Estoque
14. Tasks
15. Suporte
16. Notificações
17. Chat humano
18. Chat IA
19. Handoff
20. Storage
21. Domain events
22. Auditoria
23. LGPD
24. RLS
25. Seeds
26. Índices
27. Triggers
28. Testes de isolamento
29. Testes de autorização
30. Testes de integridade
```

---

## 4. Checkboxes de validação

### 4.1 Bootstrap

```text
[ ] Banco temporário criado
[ ] Schema public disponível
[ ] Extensions habilitadas:
    [ ] uuid-ossp ou pgcrypto
    [ ] pgcron (se necessário)
    [ ] pgjwt (se necessário)
    [ ] pg_stat_statements (opcional)
```

### 4.2 Core / People / Tenants

```text
[ ] tenants criada
[ ] tenant_settings criada
[ ] people criada
[ ] tenant_memberships criada
[ ] auth_user_id UNIQUE válido
[ ] email UNIQUE válido
[ ] UNIQUE(tenant_id, person_id) válido
```

### 4.3 Auth ↔ People

```text
[ ] Trigger on_auth_user_created criada
[ ] handle_new_person() funciona
[ ] auth.users → people sincroniza
[ ] Sem erro de recursão/privilege
```

### 4.4 RBAC

```text
[ ] roles criada
[ ] permissions criada
[ ] role_permissions criada
[ ] role_assignments criada
[ ] role_resource_permissions criada
[ ] admin_master existe
[ ] tenant_admin existe
[ ] rh_manager existe
[ ] recruiter existe
[ ] finance_manager existe
[ ] finance existe
[ ] administrative_manager existe
[ ] administrative existe
[ ] operations_manager existe
[ ] support_manager existe
[ ] support existe
[ ] commercial_manager existe
[ ] commercial existe
[ ] stock_manager existe
[ ] stock_operator existe
[ ] content_manager existe
[ ] viewer existe
[ ] member existe
[ ] NÃO existe role 'admin'
[ ] NÃO existe role 'empresa'
[ ] NÃO existe role 'candidato'
```

### 4.5 CRM

```text
[ ] companies criada
[ ] company_relationships criada
[ ] company_contacts criada
[ ] interactions criada
[ ] suppliers criada como perfil operacional
```

### 4.6 RH / Candidatos

```text
[ ] candidates criada
[ ] candidate_documents criada
[ ] candidate_experiences criada
[ ] candidate_education criada
[ ] candidate_courses criada
[ ] candidate_languages criada
[ ] candidate_skills criada
[ ] skills criada
[ ] employees criada
[ ] employee_contracts criada
[ ] employee_documents criada
[ ] employee_status_history criada
[ ] departments criada
[ ] positions criada
[ ] employee_positions criada
[ ] candidate pode evoluir para employee sem perder person_id
```

### 4.7 Recrutamento

```text
[ ] stage_templates criada
[ ] recruitment_processes criada
[ ] recruitment_stages criada
[ ] candidate_processes criada
[ ] interviews criada
[ ] interview_participants criada
[ ] interview_feedback criada
[ ] talent_pool_memberships criada
[ ] job_matches criada
[ ] candidate_profile_views criada
```

### 4.8 Vagas / Candidaturas

```text
[ ] jobs criada
[ ] job_skills criada
[ ] applications criada
[ ] application_status_history criada
[ ] application_profile_snapshots criada
```

### 4.9 Administrativo

```text
[ ] administrative_requests criada
[ ] administrative_tasks criada
[ ] administrative_approvals criada
[ ] administrative_documents criada
```

### 4.10 Financeiro

```text
[ ] financial_accounts criada
[ ] financial_categories criada
[ ] cost_centers criada
[ ] accounts_receivable criada
[ ] accounts_payable criada
[ ] financial_transactions criada
[ ] invoices criada
[ ] invoice_items criada
[ ] payments criada
[ ] expenses criada
[ ] revenues criada
```

### 4.11 Fiscal / NF

```text
[ ] fiscal_configurations criada
[ ] fiscal_integrations criada
[ ] fiscal_documents criada
[ ] fiscal_document_items criada
[ ] fiscal_document_events criada
[ ] fiscal_document_status_history criada
[ ] fiscal_api_requests criada
[ ] fiscal_api_responses criada
[ ] invoices ≠ fiscal_documents
[ ] Nenhuma credencial fiscal em tabelas comuns
```

### 4.12 Estoque

```text
[ ] products criada
[ ] product_categories criada
[ ] warehouses criada
[ ] warehouse_locations criada
[ ] stock_balances criada
[ ] stock_movements criada
[ ] stock_entries criada
[ ] stock_exits criada
[ ] stock_inventory criada
[ ] stock_inventory_items criada
[ ] stock_adjustments criada
[ ] purchase_orders criada
[ ] purchase_order_items criada
[ ] stock_movements é ledger único
[ ] stock_balances reflete estado derivado
```

### 4.13 Tasks

```text
[ ] tasks criada
[ ] task_comments criada
[ ] task_attachments criada
[ ] task_status_history criada
[ ] related_entity_type/related_entity_id documentado como polimórfico
```

### 4.14 Suporte

```text
[ ] support_tickets criada
[ ] support_ticket_messages criada
[ ] support_ticket_assignments criada
[ ] support_ticket_status_history criada
[ ] support_ticket_categories criada
```

### 4.15 Notificações

```text
[ ] notifications criada
[ ] notification_deliveries criada
[ ] notification_preferences criada
```

### 4.16 Chat

```text
[ ] chat_rooms criada
[ ] chat_participants criada
[ ] chat_messages criada
[ ] ai_conversations criada
[ ] ai_messages criada
[ ] ai_usage criada
[ ] chat_assignments criada
[ ] chat_handoffs criada
[ ] chat_events criada
[ ] humano separado de IA
[ ] handoff rastreável
[ ] eventos imutáveis
```

### 4.17 Storage / Documents

```text
[ ] files criada
[ ] file_access_logs criada
[ ] document_versions criada
[ ] document_links criada
[ ] buckets sugeridos planejados:
    [ ] documents
    [ ] avatars
    [ ] invoices
    [ ] fiscal
    [ ] chat
    [ ] candidates
```

### 4.18 Domain Events

```text
[ ] domain_events criada
[ ] append-only garantido
```

### 4.19 Auditoria

```text
[ ] audit_logs criada
[ ] security_events criada
[ ] scope global/tenant documentado
[ ] operações sensíveis geram entrada em audit_logs
```

### 4.20 LGPD

```text
[ ] consents criada
[ ] privacy_requests criada
[ ] data_export_requests criada
[ ] data_deletion_requests criada
[ ] data_retention_policies criada
[ ] retenção explícita modelada
```

### 4.21 Functions / Triggers

```text
[ ] user_has_permission() criada
[ ] update_updated_at_column() criada
[ ] handle_new_person() criada
[ ] on_auth_user_created criada
[ ] Funções executam sem erro
[ ] Triggers disparam corretamente
```

### 4.22 RLS

```text
[ ] RLS habilitada em todas as tabelas tenant-scoped
[ ] Política SELECT para membro ativo do tenant
[ ] Política INSERT para role com permissão create
[ ] Política UPDATE para role com permissão update
[ ] Política DELETE para role com permissão delete
[ ] admin_master acessa qualquer tenant
```

### 4.23 Seeds

```text
[ ] seeds reproduzíveis do zero
[ ] tenant inicial criado
[ ] tenant_settings inicial criado
[ ] people inicial criado
[ ] tenant_memberships inicial criado
[ ] role_assignments inicial criado
[ ] roles tenant-scoped criadas
[ ] permissions criadas
[ ] role_permissions criadas
[ ] Nenhuma role legada criada
[ ] Nenhuma senha hardcoded no SQL
```

### 4.24 Índices

```text
[ ] idx_people_auth_user_id
[ ] idx_people_email
[ ] idx_tenant_memberships_person_id
[ ] idx_tenant_memberships_tenant_id
[ ] uq_tenant_memberships_tenant_person
[ ] idx_role_assignments_person_id
[ ] idx_role_assignments_tenant_id
[ ] idx_role_resource_permissions_role_id
[ ] idx_companies_tenant_id
[ ] idx_jobs_tenant_id
[ ] idx_candidates_tenant_id
[ ] idx_employees_tenant_id
[ ] idx_suppliers_tenant_id
[ ] idx_tasks_tenant_id
[ ] idx_support_tickets_tenant_id
[ ] idx_chat_rooms_tenant_id
[ ] idx_financial_transactions_tenant_id
[ ] idx_invoices_tenant_id
[ ] idx_stock_movements_tenant_id
[ ] idx_audit_logs_tenant_id
[ ] idx_audit_logs_person_id
[ ] idx_audit_logs_occurred_at
[ ] idx_security_events_tenant_id
[ ] idx_domain_events_aggregate
```

---

## 5. Matriz de evidências

| Teste | Esperado | Resultado | Evidência |
| --- | --- | --- | --- |
| Tenant A lê Tenant A | ALLOW | — | — |
| Tenant A lê Tenant B | DENY | — | — |
| Tenant B lê Tenant B | ALLOW | — | — |
| Tenant B lê Tenant A | DENY | — | — |
| admin_master acessa Tenant A | ALLOW | — | — |
| admin_master acessa Tenant B | ALLOW | — | — |
| tenant_admin acessa Tenant B | DENY | — | — |
| role `candidato` existe | NÃO | — | — |
| role `empresa` existe | NÃO | — | — |
| role `admin` existe | NÃO | — | — |
| candidate como domínio | ALLOW conforme permissão | — | — |
| Finance acessa fiscal | conforme permissionamento | — | — |
| Invoice ≠ fiscal_document | PASS | — | — |
| Chat IA ≠ humano | PASS | — | — |
| Handoff IA → humano | auditável | — | — |
| LGPD consent | append-only | — | — |
| Stock movement | append-only | — | — |
| Auth → People sync | PASS | — | — |
| RLS ativa em todas as tabelas tenant-scoped | PASS | — | — |
| Seed reproduzível do zero | PASS | — | — |

---

## 6. Scripts auxiliares

### 6.1 Verificação de schema

```sql
-- listar tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 6.2 Verificação de RLS

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 6.3 Verificação de roles

```sql
SELECT id, name, is_global
FROM roles
ORDER BY name;
```

### 6.4 Verificação de permissões

```sql
SELECT r.name AS role, p.resource, p.action
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
ORDER BY r.name, p.resource, p.action;
```

### 6.5 Verificação de tenant isolation

```sql
-- exemplo conceitual; executar com personas diferentes
SET request.jwt.claims = '{"sub": "<person_id_tenant_a>"}';
SELECT COUNT(*) FROM jobs WHERE tenant_id = '<tenant_b_id>'; -- esperado 0

SET request.jwt.claims = '{"sub": "<person_id_tenant_b>"}';
SELECT COUNT(*) FROM jobs WHERE tenant_id = '<tenant_a_id>'; -- esperado 0
```

### 6.6 Verificação de admin_master

```sql
SELECT ra.id, p.email, r.name, ra.tenant_id
FROM role_assignments ra
JOIN people p ON p.id = ra.person_id
JOIN roles r ON r.id = ra.role_id
WHERE r.name = 'admin_master';
-- esperado tenant_id = NULL
```

### 6.7 Verificação de roles legadas

```sql
SELECT id, name
FROM roles
WHERE name IN ('admin', 'empresa', 'candidato');
-- esperado 0 rows
```

### 6.8 Verificação de Finance/Fiscal

```sql
-- confirmar separação
SELECT 'invoices' AS table_name, COUNT(*) AS count FROM invoices
UNION ALL
SELECT 'fiscal_documents', COUNT(*) FROM fiscal_documents;
-- ambas devem existir separadas
```

### 6.9 Verificação de Chat

```sql
SELECT 'chat_messages' AS table_name, COUNT(*) AS count FROM chat_messages
UNION ALL
SELECT 'ai_messages', COUNT(*) FROM ai_messages
UNION ALL
SELECT 'chat_handoffs', COUNT(*) FROM chat_handoffs;
-- todas devem existir separadas
```

---

## 7. Critérios de aprovação

```text
✅ 27 etapas aplicadas sem erro
✅ FKs válidas
✅ Constraints válidas
✅ Índices criados
✅ Triggers disparam
✅ Functions executam
✅ RLS habilitada
✅ Policies aplicadas
✅ Tenant isolation comprovada
✅ RBAC comprovada
✅ admin_master global comprovado
✅ Roles legadas ausentes
✅ Seeds reproduzíveis
✅ Finance ≠ Fiscal comprovado
✅ Chat separado comprovado
✅ LGPD modelada
✅ Auditoria modelada
✅ Auth → People funcionando
```

Somente após aprovação:
```text
DRY-RUN V2.1 ✅
       ↓
BACKUP COMPLETO DO js-empregos
       ↓
APROVAÇÃO FINAL
       ↓
DROP / RESET
       ↓
BUILD V2.1
       ↓
SEED / AUTH / RBAC
       ↓
TESTES E2E
```
