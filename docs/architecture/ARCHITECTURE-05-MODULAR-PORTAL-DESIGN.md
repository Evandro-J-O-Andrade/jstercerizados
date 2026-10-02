# Modular Portal Design — Definitive Architecture

> **Status:** Approved for implementation (2026-10-02)
> **Supabase:** `okxqfyoqbhcmflpurfrw` — 221 tabelas, 221/221 RLS, PostgreSQL 17.6
> **Site público:** PROTEGIDO — não alterar
> **Git:** Local ≠ Remote — verificar SHA após push

## 1. Princípios Arquiteturais (imutáveis)

1. **Banco é fonte de verdade.** Frontend consome, não recria.
2. **Tabela ≠ módulo.** 221 tabelas → domínios → módulos → células.
3. **One Portal, many cells.** Um Portal global. Módulos isolados.
4. **Module não conhece outro module.** Compartilha só via `platform/` ou contrato explícito.
5. **Permissão única.** `MODULE_PERMISSION_MAP` é fonte única. Nenhuma string literal em rotas.
6. **Frontend não é segurança.** RBAC + RLS são as barreiras reais.
7. **Site público é zona protegida.** Nunca tocar.
8. **Checkpoint Git = SHA local + push + verificação remote.** Local ≠ remote.
9. **Kilo não decide arquitetura.** Segue este contrato.

## 2. Arch

```text
GLOBAL PLATFORM SPINE
│
├── Auth            → src/platform/auth/
├── Identity        → src/platform/identity/
├── Tenant/Account  → src/platform/account/
├── RBAC            → src/platform/permissions/
├── Router          → src/platform/router/
├── Navigation      → src/platform/navigation/
├── Notifications   → src/platform/notifications/
├── Chat            → src/platform/chat/
├── Calendar        → src/platform/calendar/
├── Files           → src/platform/files/
├── Media           → src/platform/media/
├── Audit           → src/platform/audit/
├── Security        → src/platform/security/
├── UI              → src/shared/ui/
└── CRUD            → src/shared/crud/
        │
        ▼
PORTAL / DASHBOARD SHELL
│
├── PortalDashboard        → /dashboard
├── GlobalHeader           → sempre visível
├── GlobalSidebar          → módulos + transversal
├── GlobalFooter           → discreto
├── AccountSwitcher        → header
└── ErrorBoundary (por módulo)
        │
        ▼
MODULE CONTAINER
│
│   src/modules/<module>/
│   ├── dashboard/         → Dashboard<Module>
│   ├── sidebar/           → <Module>Sidebar
│   ├── routes/            → ModuleRoute[]
│   ├── pages/             → telas
│   ├── crud/              → bindings
│   ├── forms/             → Zod + RHF
│   ├── repositories/      → re-export (nunca novo client)
│   ├── services/          → business logic
│   ├── hooks/             → React hooks
│   ├── types/             → domínio
│   ├── permissions/       → <MODULE>_PERMISSIONS
│   ├── config/            → configuração
│   ├── components/        → componentes específicos
│   └── index.ts           → barrel export
        │
        ▼
Supabase (221 tabelas + RLS)
```

## 3. Dashboard Hierarchy (3 níveis)

### Nível 1 — Portal (`/dashboard`)

PortalDashboard: visão geral, KPIs, módulos disponíveis, atividades recentes, alertas.

### Nível 2 — Dashboard Gerencial (`/dashboard/<module>`)

Dashboard<Module>: KPIs e indicadores do módulo.

### Nível 3 — Operação (`/dashboard/<module>/<entity>`)

Pages com DataTable, Filters, CRUD. Foco em densidade e legibilidade.

## 4. Module Cell Contract (obrigatório para todos)

```text
src/modules/<module>/
├── index.ts              # barrel: moduleMeta, routes, permissions, service
├── types/
│   └── index.ts          # re-export domain types + ModuleMeta
├── routes/
│   └── index.ts          # ModuleRoute[] — lazy imports ONLY
├── permissions/
│   └── index.ts          # <MODULE>_PERMISSIONS constant
├── dashboard/
│   ├── index.tsx         # DashboardPage re-export
│   └── widgets/          # componentes de dashboard (opcional)
├── sidebar/
│   └── index.tsx         # <Module>Sidebar — filtra por permissão
├── pages/                # re-exports de src/pages/dashboard/* (durante migração)
├── crud/
│   └── <entity>/         # table, details, actions, filters
├── forms/
│   └── <entity>/         # Form + schema
├── repositories/
│   └── index.ts          # re-export repository EXISTENTE
├── services/
│   └── index.ts          # business logic
├── hooks/
│   └── use<Entity>.ts    # React hooks
├── config/
│   └── index.ts          # configuração do módulo
├── components/           # componentes específicos
├── assets/               # imagens, icons
└── index.ts
```

### ModuleRoute Contract

```typescript
interface ModuleRoute {
  path: string; // relativo ao módulo
  label: string; // sidebar label
  icon?: string; // lucide icon name
  element: ComponentType; // lazy-loaded
  requiredPermissions: string[]; // resource.action
  children?: ModuleRoute[];
  implementationStatus?:
    'implemented' | 'coming_soon' | 'beta' | 'disabled' | 'deprecated';
}
```

## 5. Permission Contract

```text
Source of truth: MODULE_PERMISSION_MAP (ModuleRegistry.ts)
Format: resource.action
Example: service_orders.read, candidates.create, people.update

module/<module>/permissions/index.ts → <MODULE>_PERMISSIONS constant
  → references strings reais do banco

Nenhuma string literal hardcoded em App.tsx ou routes.
```

## 6. IDOR Contract (3 barriers)

```text
ROTA → RouteGuard (PermissionGuard)
     → Repository (filter tenant_id + person_id)
     → Supabase RLS (current_setting('app.tenant_id') + auth.uid())
```

## 7. Global Capabilities (platform layer)

| Capability    | Directory                     | Tables (sample)                            |
| ------------- | ----------------------------- | ------------------------------------------ |
| Identity      | `src/platform/identity/`      | people                                     |
| Account       | `src/platform/account/`       | tenants, tenant_memberships                |
| RBAC          | `src/platform/permissions/`   | roles, permissions, role_assignments       |
| Navigation    | `src/platform/navigation/`    | global_navigation_links                    |
| Notifications | `src/platform/notifications/` | notifications, notification_*              |
| Chat          | `src/platform/chat/`          | chat_rooms, chat_messages                  |
| Calendar      | `src/platform/calendar/`      | calendars, calendar_events                 |
| Files         | `src/platform/files/`         | files, document_versions                   |
| Media         | `src/platform/media/`         | media_assets                               |
| Audit         | `src/platform/audit/`         | audit_logs, activity_logs, security_events |
| CRUD          | `src/shared/crud/`            | (infra — DataTable, CrudFilters, etc.)     |

## 8. Module Registry (221 tabelas → 14 módulos)

### Plataforma (platform)

```text
people, tenants, tenant_memberships, tenant_settings
roles, permissions, role_permissions, role_assignments
sessions, first_login_state, legal_acceptances
security_events, audit_logs, activity_logs
consents, privacy_requests, data_export_requests, data_deletion_requests, data_retention_policies
```

### RH (13 módulos de tabela)

```text
candidates, candidate_documents, candidate_experiences, candidate_education,
candidate_courses, candidate_languages, candidate_skills, candidate_processes,
candidate_job_alerts, candidate_profile_views, favorite_jobs
candidates_candidates (self-ref)
skills, job_skills, job_matches, talent_pool_memberships
jobs, applications, application_status_history, application_profile_snapshots
recruitment_demands, recruitment_processes, recruitment_stages, stage_templates
interviews, interview_participants, interview_feedback, interview_followups
employees, employee_positions, employee_contracts, employee_documents,
employee_status_history, positions, departments
```

### Comercial/CRM (16 tabelas)

```text
companies, company_relationships, company_relationship_types, company_contacts,
company_locations, company_social_links, company_services
leads, customers, interactions
quotes, quote_items
sales, sale_items
contracts, contract_status_history
```

### Serviços (13 tabelas)

```text
services, service_sla, company_services
service_orders, service_order_items, service_order_status_history
service_acceptances, service_executions, service_attachments
service_occurrences
customer_feedback, customer_ratings, feedback
```

> Nota: `services` e `feedback` aparecem aqui e no CMS (site público). No módulo, são gerenciados via tenant_id RLS.

### Operações (11 tabelas)

```text
work_orders, work_order_assignments, work_order_materials,
work_order_checklists, work_order_attachments, work_order_occurrences,
work_order_acceptances
tasks, task_comments, task_attachments, task_status_history
```

### Estoque/Suprimentos (31 tabelas)

```text
products, product_categories
warehouses, warehouse_locations
stock_balances, stock_entries, stock_movements, stock_lots
stock_inventory, stock_inventory_items
purchase_orders, purchase_order_items, purchase_status_history
purchase_requests, purchase_request_items
purchase_quotations, purchase_quotation_items
purchase_receipts, purchase_receipt_items, purchase_receipt_divergences
suppliers, supplier_contacts (if exists)
third_party_custody, third_party_custody_items
material_issues, material_issue_items
material_returns, material_return_items
epi_deliveries, epi_delivery_items
epi_returns, epi_return_items
```

### Financeiro (15 tabelas)

```text
financial_categories, cost_centers, financial_accounts
financial_transactions
accounts_receivable, accounts_payable
financial_installments, financial_installment_payments,
financial_installment_cancellations
payments, receipts
bank_reconciliations
invoices, invoice_items
```

### Fiscal (10 tabelas)

```text
fiscal_configurations, tax_rates, tax_calculations
fiscal_documents, fiscal_document_items, fiscal_document_status_history,
fiscal_document_events
fiscal_api_requests, fiscal_api_responses
fiscal_integrations
```

### POS (11 tabelas)

```text
pos_terminals, pos_cashiers, pos_operators, pos_cashier_sessions
pos_cash_movements, pos_daily_closures
pos_sales, pos_sale_items, pos_payments
pos_cancellations, pos_returns
```

### Suporte (9 tabelas)

```text
support_ticket_categories, support_tickets, support_ticket_messages,
support_ticket_assignments, support_ticket_status_history
tasks, task_comments, task_attachments, task_status_history
```

### Comunicação (transversal)

```text
chat_rooms, chat_participants, chat_messages, chat_handoffs
notifications, notification_deliveries, notification_preferences
email_templates, email_messages
```

### Arquivos/Documentos (transversal — reconciliar 2 gerações)

```text
files, file_access_logs, document_versions, document_links (canônico)
file_uploads, media_assets (legado?)
candidate_documents, employee_documents (scoped to módulos)
administrative_documents (admin module)
```

### Calendário (transversal)

```text
calendar_integrations, calendars, calendar_events, event_participants
meeting_rooms, meeting_room_reservations
```

### Relatórios/Dashboards (transversal)

```text
report_definitions, report_executions, report_schedules
dashboard_widgets, dashboard_layouts
```

### IA (transversal)

```text
ai_conversations, ai_messages, ai_usage
```

### Integrações (transversal)

```text
providers, provider_configs
integration_connections, integration_credentials, integration_errors
integration_events, integration_webhooks, integration_sync_jobs,
integration_sync_runs, integration_webhooks
```

### Eventos/Automação (transversal)

```text
domain_events, event_outbox, event_deliveries
automation_jobs, automation_executions, automation_templates
```

### CMS (site público — PROTEGIDO)

```text
blog_categories, blog_posts, faqs, page_templates
services (public), media_assets
company_social_links, footer_configs
candidate_portal_modules, global_navigation_links
```

## 9. Module Cell Implementation Status

| Module       | Routes | Cell structure   | Dashboard | Sidebar | Permissions | Repositories | Status  |
| ------------ | ------ | ---------------- | --------- | ------- | ----------- | ------------ | ------- |
| platform     | —      | ✅               | ✅        | ✅      | ✅          | ✅           | ACTIVE  |
| rh           | 20     | parcial (façade) | ✅        | ✅      | ✅          | ✅           | ACTIVE  |
| servicos     | 8      | ✅               | ✅        | ✅      | ✅          | ✅           | ACTIVE  |
| estoque      | 8      | ✅               | ✅        | ✅      | ✅          | ✅           | ACTIVE  |
| fiscal       | 6      | ✅               | ✅        | ✅      | ✅          | ✅           | ACTIVE  |
| suporte      | 5      | ✅               | ✅        | ✅      | ✅          | ✅           | ACTIVE  |
| financeiro   | 7      | ✅               | ✅        | ✅      | ✅          | ✅           | ACTIVE  |
| operacoes    | 7      | ✅               | ✅        | ✅      | ✅          | re-export    | ACTIVE  |
| empresas     | 8      | ✅               | ✅        | ✅      | ✅          | re-export    | ACTIVE  |
| pos          | 6      | ✅               | ✅        | ✅      | ✅          | re-export    | ACTIVE  |
| sistema      | 0      | ❌               | ❌        | ❌      | ❌          | ❌           | PENDING |
| comunicacao  | 0      | ❌               | ❌        | ❌      | ❌          | ❌           | PENDING |
| documentos   | 0      | ❌               | ❌        | ❌      | ❌          | ❌           | PENDING |
| calendar     | 0      | ❌               | ❌        | ❌      | ❌          | ❌           | PENDING |
| reports      | 0      | ❌               | ❌        | ❌      | ❌          | ❌           | PENDING |
| ai           | 0      | ❌               | ❌        | ❌      | ❌          | ❌           | PENDING |
| integrations | 0      | ❌               | ❌        | ❌      | ❌          | ❌           | PENDING |
| automation   | 0      | ❌               | ❌        | ❌      | ❌          | ❌           | PENDING |
| pos_system   | 0      | ❌               | ❌        | ❌      | ❌          | ❌           | PENDING |

## 10. Execution Order (imutável)

```text
FASE 00 ✅  Checkpoint Git local + push verificado
FASE 01 ✅  Reconciliação DB↔Frontend (ARCHITECTURE-04)
FASE 02 ✅  Platform Spine (src/platform/*)
FASE 03 ✅  Auth + Identity + Tenant + Context
FASE 04    Account Switcher + revalidação
FASE 05    Permission Contract (MODULE_PERMISSION_MAP completo)
FASE 06    Portal global dinâmico
FASE 07    Module Cell contract (index.ts barrel)
FASE 08    RH completion (CRUD + forms + pages)
FASE 09    Serviços completion
FASE 10    Estoque completion
FASE 11    Fiscal completion
FASE 12    Financeiro completion
FASE 13    Suporte completion
FASE 14    Operações completion
FASE 15    Empresas/Comercial completion
FASE 16    POS completion
FASE 17    Plataforma transversal (chat, calendar, files, notifications)
FASE 18    Dashboard Engine (dashboard_widgets, dashboard_layouts)
FASE 19    CRUD/Form Engine padronizado
FASE 20    IDOR E2E test
FASE 21    Security hardening (34 SD functions audit)
FASE 22    Reconciliação final (221/221)
FASE 23    Migrations (somente com autorização)
FASE 24    Produção (somente com autorização)
```

## 11. Validation Gate (por fase)

```text
1. tsc —no-emit → 0 errors
2. eslint --max-warnings=0 → 0 errors
3. vitest → all existing tests pass
4. npm run build → success
5. git commit → SHA registrado
6. git push → verificado no remoto
7. Testes E2E (quando aplicável)
```

## 12. Gaps (tabelas documentadas como não existentes)

```text
12 tabelas documentadas como GAP — VERIFICAR antes de implementar:
accounting_entries, bank_accounts, candidate_preferences, cash_flows,
chart_of_accounts, curriculos, epis, support_faqs,
warehouse_custodies, warehouse_entries, warehouse_issues, warehouse_returns
```

## 13. Security — 12-item checklist

```text
1. 221/221 tabelas com RLS ✅
2. 34 SECURITY DEFINER functions — audit pending
3. 7 SD functions sem search_path — fix pending
4. 18 SD functions com exposição anon/authenticated — review pending
5. admin_master: 96/230 permissions (não "todas") — documentado
6. IDOR: RouteGuard + Repository + RLS
7. Temp-auth.json: SECURITY BLOCKER — NUNCA commitar
8. Nenhuma migration sem autorização
9. Banco read-only até revisão
10. Site público intacto
11. Footer fixo: © 2026 J&S Empregos LTDA. Todos os direitos reservados.
12. Empresa sempre "J&S Empregos LTDA"
```
