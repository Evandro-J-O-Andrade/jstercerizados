# SaaS Portal Architecture — Final (v1.0)

> **Status:** Aprovado para implementação (2026-10-02)
> **Baseado em:** Supabase real (`okxqfyoqbhcmflpurfrw`) — 221 tabelas, 233 funções, 600 policies, 34 SECURITY DEFINER functions, 221/221 tabelas com RLS
> **Zona protegida:** Site público (`/`, `/vagas`, `/servicos`, etc.) — NÃO será alterado

---

## Índice

1. [Princípios](#1-princípios)
2. [Zonas protegidas](#2-zonas-protegidas)
3. [Estado atual do código](#3-estado-atual-do-código)
4. [Identity model](#4-identity-model)
5. [Tenant/account model](#5-tenantaccount-model)
6. [RBAC](#6-rbac)
7. [Permission Contract](#7-permission-contract)
8. [Module Registry](#8-module-registry)
9. [Portal](#9-portal)
10. [Global Sidebar](#10-global-sidebar)
11. [Contextual Sidebar](#11-contextual-sidebar)
12. [Router](#12-router)
13. [Module Cell](#13-module-cell)
14. [Dashboard hierarchy](#14-dashboard-hierarchy)
15. [CRUD architecture](#15-crud-architecture)
16. [Forms architecture](#16-forms-architecture)
17. [Repository/Service/Hook](#17-repositoryservicehook)
18. [IDOR model](#18-idor-model)
19. [Chack Bouer 24H](#19-chack-bouer-24h)
20. [Candidate registration](#20-candidate-registration)
21. [Dashboard Builder](#21-dashboard-builder)
22. [Security hardening](#22-security-hardening)
23. [Migration rules](#23-migration-rules)
24. [Git checkpoint rules](#24-git-checkpoint-rules)
25. [Migration order](#25-migration-order)
26. [Definition of Done](#26-definition-of-done)

---

## 1. Princípios

- **Banco é fonte de verdade.** Frontend consome, não recria.
- **Cada módulo é uma célula independente.** Chack Bouer 24H.
- **Um Portal global.** Não há PortalRH, PortalEstoque, etc.
- **Permissão única.** `MODULE_PERMISSION_MAP` é a fonte única.
- **Frontend não é segurança.** RBAC + RLS são as barreiras reais.
- **Site público é zona protegida.** Não tocar.

## 2. Zonas protegidas

| Zone         | Scope                               | A alterar?                   |
| ------------ | ----------------------------------- | ---------------------------- |
| Site público | `src/pages/*` públicas, `public/*`  | NÃO                          |
| Portal       | `src/components/portal/*`           | Sim (consolidação)           |
| Módulos      | `src/modules/*` ou `src/features/*` | Sim (nova estrutura)         |
| Banco        | `supabase/migrations/*.sql`         | Só com autorização explícita |

## 3. Estado atual do código

### Inventário completo do banco (read-only query, 2026-10-02)

```text
Supabase (okxqfyoqbhcmflpurfrw)
│
├── Schemas: public, auth, realtime, storage
├── 221 tabelas public
├── 5 views public
├── 713 indexes public
├── 233 public functions
├── 600 policies
├── 1 enum
├── 0 sequences
├── 66 triggers não-internos
├── 53 application roles
├── 230 permissions
├── 739 role_permissions
├── 23 auth.users
├── 41 people
├── 3 tenants
├── 43 tenant_memberships
├── 37 role_assignments
├── admin_master: 96/230 permissions (NÃO "todas")
├── 34 functions SECURITY DEFINER
├── 7 SECURITY DEFINER sem search_path explícito
└── RLS: 221/221 tabelas public ativo
```

### Domínios confirmados no banco

```text
Identity/Platform
  people, tenants, tenant_memberships, tenant_settings
  roles, permissions, role_permissions, role_assignments

RH (3 subdomínios)
  Candidate: candidates, candidate_documents, candidate_experiences, candidate_education,
    candidate_courses, candidate_languages, candidate_skills, candidate_processes,
    candidate_job_alerts, candidate_profile_views, favorite_jobs
  Recruitment: jobs, applications, application_status_history, application_profile_snapshots,
    recruitment_demands, recruitment_processes, recruitment_stages, stage_templates,
    interviews, interview_participants, interview_feedback, interview_followups,
    skills, job_skills, job_matches, talent_pool_memberships
  Employee: employees, employee_positions, employee_contracts, employee_documents,
    employee_status_history, positions, departments

Comercial/CRM
  companies, company_relationships, company_relationship_types, company_contacts,
    company_locations, company_social_links, company_services, leads, customers,
    interactions, quotes, quote_items, sales, sale_items, contracts, contract_status_history

Serviços
  services, service_sla, company_services, service_orders, service_order_items,
    service_order_status_history, service_acceptances, service_executions,
    service_attachments, service_occurrences, customer_feedback, customer_ratings,
    feedback

Operações
  work_orders, work_order_assignments, work_order_materials, work_order_checklists,
    work_order_attachments, work_order_occurrences, work_order_acceptances

Estoque/Supply Chain
  products, product_categories, warehouses, warehouse_locations, stock_balances,
    stock_entries, stock_movements, stock_lots, stock_inventory, stock_inventory_items,
    purchase_orders, purchase_order_items, purchase_requests, purchase_request_items,
    purchase_quotations, purchase_quotation_items, purchase_status_history,
    purchase_receipts, purchase_receipt_items, purchase_receipt_divergences,
    suppliers, third_party_custody, third_party_custody_items, material_issues,
    material_issue_items, material_returns, material_return_items, epi_deliveries,
    epi_delivery_items, epi_returns, epi_return_items

Financeiro
  financial_categories, cost_centers, financial_accounts, financial_transactions,
    accounts_receivable, accounts_payable, financial_installments,
    financial_installment_payments, financial_installment_cancellations,
    payments, receipts, bank_reconciliations, invoices, invoice_items

Fiscal
  fiscal_configurations, tax_rates, tax_calculations, fiscal_documents,
    fiscal_document_items, fiscal_document_status_history, fiscal_document_events,
    fiscal_api_requests, fiscal_api_responses, fiscal_integrations

POS
  pos_terminals, pos_cashiers, pos_operators, pos_cashier_sessions,
    pos_sales, pos_sale_items, pos_payments, pos_cancellations, pos_returns,
    pos_cash_movements, pos_daily_closures

Suporte/Atendimento
  support_ticket_categories, support_tickets, support_ticket_messages,
    support_ticket_assignments, support_ticket_status_history, tasks,
    task_comments, task_attachments, task_status_history

Comunicação (transversal)
  chat_rooms, chat_participants, chat_messages, chat_handoffs, notifications,
    notification_deliveries, notification_preferences, email_templates, email_messages

Calendário (transversal)
  calendar_integrations, calendars, calendar_events, event_participants,
    meeting_rooms, meeting_room_reservations

Documentos (DUAS gerações — reconciliar)
  files, file_access_logs, document_versions, document_links
  file_uploads, media_assets
  candidate_documents, employee_documents, administrative_documents

LGPD/Privacidade (transversal)
  consents, privacy_requests, data_export_requests, data_deletion_requests,
    data_retention_policies, legal_acceptances, first_login_state,
    security_events, audit_logs, activity_logs

Eventos/Automação (transversal)
  domain_events, event_outbox, event_deliveries, webhook_deliveries,
    automation_jobs, automation_executions, automation_templates

Relatórios/Dashboards
  report_definitions, report_executions, report_schedules, dashboard_widgets,
    dashboard_layouts

IA
  ai_conversations, ai_messages, ai_usage

Integrações
  providers, provider_configs, integration_connections, integration_credentials,
    integration_events, integration_webhooks, integration_sync_runs,
    integration_errors, integration_sync_jobs

CMS (site público — PROTEGIDO)
  blog_categories, blog_posts, faqs, page_templates, services, media_assets,
    company_social_links, footer_configs, candidate_portal_modules,
    global_navigation_links
```

```text
src/
├── App.tsx                    # Router principal (926 lines)
├── components/
│   ├── auth/                  # ProtectedRoute, AuthRoute, PermissionGuard
│   ├── layout/                # AppShell, PublicLayout, Footer
│   ├── portal/                # ModuleRegistry, ModuleWorkspace, PortalShell, etc.
│   ├── sections/              # CinematicShowcase, HeroImage, etc.
│   ├── shared/crud/           # DataTable, CrudFilters, ModulePage (8 componentes)
│   ├── feedback/              # ToastProvider
│   └── fallback/              # EmptyState, RouteLoadingFallback
├── contexts/
│   ├── AuthContext.tsx        # Fonte de verdade: auth.users, people, roles, permissions
│   ├── AccountContext.tsx     # Consolida identidade, tenant, módulos, permissões
│   ├── ModuleContext.tsx      # Detecta módulo/feature da URL atual
│   ├── CandidateContext.tsx   # Contexto específico de candidato
│   ├── UserIdentity.ts        # Derivador de identidade (people + roles + tenant)
│   └── IntroContext.tsx       # Intro cinematográfico
├── modules/rh/                # Façade de transição (não autossuficiente ainda)
│   ├── dashboard/             # RHDashboardPage.tsx (reativa para src/pages/dashboard/DashboardRh)
│   ├── candidates/            # Re-exporta páginas existentes
│   ├── types/                 # Tipos de domínio
│   ├── repositories/          # Re-exporta repositórios existentes
│   ├── services/              # Re-exporta services existentes
│   └── routes/                # Definição de rotas (incompleta: apenas dashboard stub)
├── features/candidato/        # Portal de candidato (separado do módulo principal)
│   └── pages/                 # CandidateMetroDashboard, Vagas, Candidaturas, etc.
├── pages/
│   ├── dashboard/             # ~50 páginas de dashboard (Candidatos, Funcionarios, etc.)
│   ├── auth/                  # Login, Cadastro, Callback, Termos, BoasVindas
│   └── [públicas]             # Home, Sobre, Vagas, Servicos, etc. (PROTETIDAS)
├── repositories/              # ~30 repositórios Supabase
├── services/                  # Services de negócio
├── hooks/                     # Hooks React
└── types/                     # Tipos globais
```

### Router

App.tsx usa padrão híbrido:

- **Rotas fixas:** DashboardHome, analitico, global, rbac-auditoria, etc. (hardcoded)
- **Rotas dinâmicas:** `launcherRoutes` geram rotas a partir de `PORTAL_MODULES.filter()` + `createModuleDashboardPage()` — mas ainda faltam as sub-rotas dos features.

### ModuleRegistry (2498 lines)

- `PORTAL_MODULES`: 26 módulos com `ModuleFeature[]` aninhados, `requiredPermissions`, `implementationStatus`
- `MODULE_PERMISSION_MAP`: 30 entradas mapeando module ID → permissão top-level
- Funções helper: `hasModulePermission`, `getAvailableModules`, `getAvailableFeatures`, `getModuleById`, `groupModulesByCategory`

### Contextos

- `AuthContext` → fonte de verdade (person, roles, permissions, tenant, switchTenant)
- `AccountContext` → `AccountProvider` consolida identidade + availableModules + switchAccount
- `ModuleContext` → `ModuleProvider` detecta módulo/feature da URL
- App.tsx envolve tudo com `AuthRoute → ProtectedRoute → ModuleProvider → AppShell`

### Problemas conhecidos — Status

1. ✅ **Permissões literais espalhados** — RESOLVIDO via `ModuleRouter` + `MODULE_PERMISSION_MAP`
2. ✅ **AppShell fixo** — em transição via `ModuleProvider` (detecta módulo da URL)
3. ⏳ **Module façade não autossuficiente** — `src/modules/rh/` re-exporta de `src/pages/dashboard/` (façade de transição)
4. ✅ **Module routes incompleto** — `rhRoutes` tem 20 rotas lazy-load criadas
5. ⏳ **CRUD não unificado** — `src/shared/crud/` existe, adotar em cada módulo
6. ⏳ **Reconciliação DB ↔ Frontend** — 221 tabelas precisam ser mapeadas vs pages/repositories existentes

## 22b. Reconciliation Matrix (gerar)

Precisamos produzir um mapa completo:

```text
DATABASE (221 tabelas)
│
├── table → repository (existe?)
├── table → frontend page (existe?)
├── table → permission (qual?)
├── table → module (qual domínio?)
├── table → tenant_id column? (RLS scope)
└── table → person_id column? (owner)

FRONTEND
│
├── page → table (fonte de dados)
├── repository → table ( Supabase client)
├── route → permission (guard)
├── module → tables (domínio)
└── form → table (target)
```

### Gaps identificados (tabelas sem frontend)

```text
12 tabelas documentadas como GAP (não inventar no frontend):
- accounting_entries
- bank_accounts
- candidate_preferences
- cash_flows
- chart_of_accounts
- curriculos
- epis
- support_faqs
- warehouse_custodies
- warehouse_entries
- warehouse_issues
- warehouse_returns
```

## 4. Identity model

```text
auth.users
   ↓ (1:1 via auth.uid())
people
   ↓ (1:N via tenant_memberships)
tenants
   ↓ (N:1 via role_assignments)
roles
   ↓ (N:N via role_permissions)
permissions
```

### Flow de boot

```text
Supabase client
  ↓
AuthContext (on_auth_state_change)
  ↓
fetchPerson() → people via auth.uid()
  ↓
fetchRoles() → role_assignments join roles
  ↓
fetchPermissions() → role_permissions join permissions
  ↓
switchTenant() → atualiza currentTenantId
  ↓
RLS usa auth.uid() + current_setting('app.tenant_id')
```

## 5. Tenant/account model

- `tenant_id` resolvido via `tenant_memberships`
- `currentTenantId` em `AuthContext`
- Account switcher via `AccountContext.switchAccount()` → `AuthContext.switchTenant()`

## 6. RBAC

- `admin_master` (scope: global) — 96 permissões reais
- `company_representative` (scope: tenant) — empresa
- `candidato` (scope: tenant) — portal de candidato
- Outros: RH, financeiro, fiscal, estoque, suporte, etc.

## 7. Permission Contract

**Regra única:** `MODULE_PERMISSION_MAP` em `ModuleRegistry.ts` é a fonte única de verdade.

```typescript
export const MODULE_PERMISSION_MAP: Record<string, string> = {
  inicio: '',
  'admin-master': 'domain_events.read',
  tenants: 'tenants.read',
  rh: 'people.read',
  recrutamento: 'jobs.read',
  servicos: 'service_orders.read',
  estoque: 'stock.read',
  fiscal: 'fiscal.read',
  contabilidade: 'accounting.read',
  financeiro: 'finance.read',
  suporte: 'support_tickets.read',
  // ...
};
```

**Nenhuma permissão hardcoded em App.tsx.** Todas as rotas novas usam `MODULE_PERMISSION_MAP[moduleId]`.

## 8. Module Registry

O `ModuleRegistry.ts` já define:

```typescript
export interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string; // /dashboard/<id>
  category: ModuleCategory;
  scope: 'global' | 'tenant';
  requiredPermissions?: string[]; // do banco
  features?: ModuleFeature[];
}

export interface ModuleFeature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  route: string;
  requiredPermissions?: string[];
  actions?: ModuleAction[];
  features?: ModuleFeature[]; // sub-features aninhadas
  implementationStatus?:
    'implemented' | 'coming_soon' | 'beta' | 'disabled' | 'deprecated';
}
```

**Funcionalidades helper existentes:**

- `getAvailableModules(permissions, scope)` — filtra módulos por permissão
- `getAvailableFeatures(permissions, module, scope)` — filtra features de um módulo
- `getModuleById(id)` — lookup O(1)
- `groupModulesByCategory(modules)` — agrupa para o Portal

## 9. Portal

```text
/dashboard
  ↓
Portal (DashboardHome)
  ↓
MetroTileGrid — tiles dinâmicos baseados em perfil
```

O Portal é **um só lugar**. Ele consulta `getAvailableModules()` e mostra os tiles.

## 10. Global Sidebar

```text
Sidebar global (PortalSidebar)
├── Início
├── Módulos disponíveis (baseado em perfil)
├── Notificações
├── Minha Conta
└── Sair
```

Apenas módulos que o usuário tem permissão.

## 11. Contextual Sidebar

Ao entrar em um módulo, o sidebar muda para:

```text
Sidebar contextual (ModuleSidebar)
├── Dashboard (módulo)
├── Feature 1
├── Feature 2
├── Entity 1
├── Entity 2
└── Relatórios
```

Filtrado por: `getAvailableFeatures(permissions, module, scope)`

**Sidebar nunca é segurança.** É UX filtering apenas.

## 12. Router

### Estado atual

App.tsx é o router principal:

```text
App
├── / (public routes) — PROTEGIDO
├── /dashboard/* (AuthRoute → ProtectedRoute → ModuleProvider → AppShell)
├── /auth/callback
├── /onboarding
├── /candidato/* (CandidateRoute → CandidateProvider → CandidatePortal)
├── /auth/* (login, cadastro, etc.)
└── catch-all
```

### Roteamento dinâmico

```tsx
const launcherRoutes = PORTAL_MODULES.filter(
  (module) =>
    module.route !== '/dashboard' &&
    (MODULE_PERMISSION_MAP[module.id] || !module.requiredPermissions?.length),
).map((module) => ({
  key: module.id,
  path: module.route.replace('/dashboard/', ''),
  moduleId: module.id,
  permission: MODULE_PERMISSION_MAP[module.id],
}));
```

### Objetivo Phase 2

Migrar para **module-specific routes** — cada módulo define suas próprias rotas via `ModuleRoute[]`. O App.tsx consome dinamicamente.

## 13. Module Cell

Estrutura alvo:

```text
src/modules/<domain>/
├── routes/              # ModuleRoute[] — rotas do módulo
├── dashboard/           # Dashboard gerencial (Level 2)
├── sidebar/             # Sidebar contextual do módulo
├── pages/               # Páginas do módulo
├── components/          # Componentes específicos do módulo
├── forms/               # Forms com Zod validation
├── crud/                # CRUD operations
├── repositories/        # Repository wrapper (Supabase)
├── hooks/               # React hooks
├── services/            # Business logic
├── types/               # Domain types
├── permissions.ts       # Permissões específicas do módulo
└── index.ts             # Public API do módulo
```

### Módulo piloto: RH

```text
src/modules/rh/
├── routes/index.ts      # rhRoutes: ModuleRoute[]
├── dashboard/
│   ├── RHDashboardPage.tsx
│   └── index.ts
├── sidebar/
│   └── RHSidebar.tsx
├── pages/
│   ├── CandidatosPage.tsx
│   ├── VagasPage.tsx
│   ├── FuncionariosPage.tsx
│   └── ...
├── crud/
├── forms/
├── repositories/        # (exists - re-exports)
├── services/            # (exists - re-exports)
├── types/               # (exists - domain types)
├── permissions.ts       # RH-specific permissions
└── index.ts
```

## 14. Dashboard hierarchy

### Nível 1 — Portal

```text
/dashboard
```

Launcher visual (Metro/Bento). Tiles clicáveis.

### Nível 2 — Dashboard gerencial

```text
/dashboard/<module>
```

KPIs, gráficos, indicadores.

### Nível 3 — Operacional

```text
/dashboard/<entity>
```

Tabela, formulário, CRUD. Foco em densidade e legibilidade.

## 15. CRUD architecture

Shared components em `src/shared/crud/`:

```text
src/shared/crud/
├── DataTable.tsx
├── CrudFilters.tsx
├── CrudDialog.tsx
├── CrudStates.tsx
├── ModulePage.tsx
├── CrudAlerts.tsx
├── types.ts
└── index.ts
```

Cada módulo instancia o CRUD com seus próprios repositórios e schemas.

## 16. Forms architecture

- Validação: Zod
- Hook form: react-hook-form
- Forms vivem **dentro do módulo**
- Shared: apenas componentes genéricos de input

## 17. Repository/Service/Hook

```text
Repository (Supabase wrapper)
  ↓
Service (business logic)
  ↓
Hook (React integration)
  ↓
Component
```

Repository é grosso modo um wrapper do Supabase client.

Service contém validações de negócio.

Hook é o ponto de entrada no React.

## 18. IDOR model

3 barreiras:

1. **Frontend** — PermissionGuard / RouteGuard / ProtectedRoute
2. **Backend** — Repository queries filtered by tenant_id
3. **Database** — RLS com `current_setting('app.tenant_id')` + `auth.uid()`

Exemplo: candidate 123 não pode ser acessado sem validação de tenant + person_id.

## 19. Chack Bouer 24H

> Se um módulo quebra, todos os outros continuam vivos.

### Checklist de isolamento

- [ ] Module tem seu próprio `index.ts`
- [ ] Module não importa de outros modules (exceto platform/shared)
- [ ] Module não importa de `src/pages/*` (exceto durante migração)
- [ ] Repository é autossuficiente
- [ ] Permissions são declaradas no `permissions.ts`, não hardcodidas
- [ ] Module test suite passa independentemente dos outros
- [ ] Module build chunk é independente

## 20. Candidate registration

```text
/cadastro/candidato
  ↓
AuthContext.register({ signupContext: 'candidato' })
  ↓
supabase.auth.signUp()
  ↓
auth.users INSERT (trigger AFTER INSERT)
  ↓
handle_new_auth_user() → people
  ↓
bootstrap_candidate_from_auth_user() → tenant_memberships + candidates + role_assignments + first_login_state
  ↓
session estabelecida
  ↓
redirect → /auth/welcome → /candidato
  ↓
CandidateRoute (verifica isCandidate)
  ↓
CandidateProvider → CandidateContext
  ↓
CandidatePortal
```

### Fix aplicado

- Migration `20260925000001_fix_missing_candidate_trigger.sql`
- `CadastroCandidato.tsx` now passes `signupContext: 'candidato'`

## 21. Dashboard Builder

Banco já possui:

- `dashboard_widgets` — definição de widgets
- `dashboard_layouts` — layout por role/tenant

Frontend precisa consumir estas tabelas para construir dashboards dinâmicos.

## 22. Security hardening

### Security Definer functions

```text
public functions ............... 233
SECURITY DEFINER ............... 34
SECURITY DEFINER sem search_path  7
SECURITY DEFINER anon/authenticated  18
```

#### Matrix de exposição (precisa de análise pós-fato)

| Function                           | SECURITY DEFINER | search_path | Exposição           | Risco  |
| ---------------------------------- | ---------------- | ----------- | ------------------- | ------ |
| `bootstrap_candidate_identity`     | yes              | (check)     | anon, authenticated | Médio  |
| `bootstrap_company_from_auth_user` | yes              | (check)     | anon, authenticated | Alto   |
| `repair_candidate_chain`           | yes              | (check)     | anon, authenticated | Alto   |
| `set_primary_media`                | yes              | (check)     | anon, authenticated | Médio  |
| `is_admin_master`                  | yes              | (check)     | anon, authenticated | Baixo  |
| `user_has_permission`              | yes              | (check)     | anon, authenticated | Baixo  |
| ... (28 more SD functions)         | yes              | vary        | vary                | varies |

### Ações necessárias

1. Auditar as 34 SECURITY DEFINER functions — quais realmente precisam de definer
2. Restringir write functions a `service_role` apenas
3. Garantir `search_path = public, pg_temp` em todas as SD functions
4. Revista de admin_master: 96/230 permissions (NÃO "todas")

## 23. Migration rules

- Nenhuma migration sem autorização explícita
- Documentar antes de migrar
- Testar contra sandbox antes
- Preservar dados existentes

## 24. Git checkpoint rules

- Commit checkpoint antes de mudanças arquитектurais grandes
- Separar arquivos válidos de temporários/gerados
- Tag: `checkpoint/architecture-<versão>`
- Branch: `arch/<versão>`

## 25. Migration order

1. ✅ **Checkpoint Git 1** (`bb02e33`) — 115 arquivos, lint/prettier/build/tests passando
2. ✅ **Checkpoint Git 2** (`4dfe335`) — Platform spine + modular router, 11 arquivos novos
3. ✅ **Checkpoint Git 3** (`346cb9b`) — Testes E2E cadastro candidato (4 testes)
4. ✅ **Checkpoint Git 4** (`6fdd598`) — Security hardening migration
5. ✅ **Fix trigger candidato** — Migration `20260925000001`
6. ✅ **Fix signupContext** — `signupContext: 'candidato'`
7. ✅ **Permission contract unified** — 6 permissões corrigidas
8. ✅ **PermissionGuard bypass removido** — commit `8482111`
9. ✅ **ARCHITECTURE-03-SAAS-SPINE** — documento aprovado
10. ✅ **Inventário completo banco** — 221 tabelas, 233 funções, 600 policies, 34 SD functions
11. ✅ **Platform Spine** — `src/platform/*` criado e integrado ao App.tsx
12. ✅ **Router modular** — ModuleRouter integrado ao App.tsx (28 linhas removidas)
13. ✅ **RH routes registry** — 20 rotas lazy-load criadas
14. ✅ **Serviços module** — rotas expandidas (8 routes), cell criada
15. ✅ **Estoque module** — cell completa criada (routes, types, permissions, dashboard, sidebar)
16. ✅ **Fiscal module** — cell criada (6 routes)
17. ✅ **Suporte module** — cell criada (5 routes)
18. ✅ **Financeiro module** — cell criada (7 routes)
19. ✅ **Operações module** — cell criada (7 routes)
20. ✅ **Empresas/Comercial module** — cell criada (8 routes)
21. ✅ **POS module** — cell criada (6 routes)
22. ✅ **Reconciliação DB↔Frontend** — `ARCHITECTURE-04-RECONCILIATION.md` criado (221 tabelas mapeadas)
23. ⏳ **Dashboard Builder** — consumir `dashboard_widgets`
24. ⏳ **Security hardening** — auditoria das 34 SD functions
25. ⏳ **IDOR test** — validar 3 barreiras

## 26. Definition of Done

Para cada módulo:

- [ ] Module cell completa (routes, dashboard, sidebar, pages, crud, forms, repositories, hooks, services, types)
- [ ] Permissions declaradas no `permissions.ts`
- [ ] Router modular integrado
- [ ] Tests unitários + integração passam
- [ ] Lint, typecheck, build passam
- [ ] IDOR test passa
- [ ] Chack Bouer 24H verificado (isolamento)
