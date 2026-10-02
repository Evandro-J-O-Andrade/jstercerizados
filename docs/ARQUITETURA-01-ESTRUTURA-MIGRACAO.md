# ARQUITETURA-01 — Estrutura-alvo e Plano de Migração

## Princípio reator

> **Global fornece infraestrutura. Cada módulo é dono do seu domínio.**

O Portal é a entrada e navegação global.
Cada domínio (RH, Empresas, Operações, Financeiro, Sistema) é uma célula autônoma com dashboard, sidebar, pages, forms, crud, repository, service.

## 1. Estrutura-alvo do Frontend

```text
src/
├── app/
│   ├── providers/       # AuthProvider, AccountProvider, ThemeProvider, ModuleProvider
│   ├── auth/            # Guards, route wrappers
│   ├── rbac/            # Permission utilities, role resolution
│   ├── routing/         # Rotas globais, App.tsx
│   ├── portal/
│   │   ├── shell/
│   │   ├── header/
│   │   ├── sidebar/
│   │   └── launcher/
│   └── navigation/      # Menus, breadcrumbs
│
├── modules/
│   ├── rh/
│   │   ├── dashboard/
│   │   ├── sidebar/
│   │   ├── candidates/
│   │   ├── employees/
│   │   ├── recruitment/
│   │   ├── jobs/
│   │   ├── talent-bank/
│   │   ├── interviews/
│   │   ├── forms/
│   │   ├── crud/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── domain/
│   ├── empresas/
│   ├── operacoes/
│   ├── financeiro/
│   └── sistema/
│
├── candidate/
│   ├── dashboard/
│   ├── sidebar/
│   ├── pages/
│   ├── components/
│   ├── forms/
│   ├── crud/
│   ├── repositories/
│   ├── services/
│   └── domain/
│
├── shared/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   ├── feedback/
│   ├── hooks/
│   └── utils/
│
└── integrations/
    └── supabase/
        ├── client.ts
        ├── types.ts
        └── index.ts
```

## 2. Domínios e responsabilidades

### GLOBAL

- **providers/** AuthProvider, AccountProvider, ThemeProvider, ModuleProvider, IntroProvider
- **auth/** ProtectedRoute, AuthRoute, FirstAccessRoute, PermissionGuard, CandidateRoute
- **rbac/** Permissões, role resolution, UserIdentity
- **routing/** App.tsx, rotas globais
- **portal/** PortalShell, PortalHeader, PortalSidebar (navegação entre módulos), launcher (MetroTiles)
- **navigation/** menus, breadcrumbs globais

### RH

- candidates, employees, recruitment, jobs, talent-bank, interviews
- experiências, formação, cursos, idiomas, habilidades, documentos de RH
- candidaturas, processos seletivos, etapas

### EMPRESAS

- companies, clients, partners, contacts, contracts
- relacionamento comercial, demandas de contratação

### OPERAÇÕES

- services, service-orders, attendance, support-tickets
- chamados, acompanhamento operacional

### FINANCEIRO

- accounts, receivables, payables, transactions
- fluxo de caixa, bancos, centro de custos, faturas, vendas, orçamentos

### SISTEMA

- users (people), roles, permissions, role-assignments, memberships
- audit-logs, sessions, configurações, integrações, IA

### SHARED

- UI primitives: Button, Input, Card, Modal, Dialog, Table, Badge, etc.
- Form infrastructure: FormField, etc.
- Feedback: Toast, alerts, loaders, empty states
- Utilities: hooks genéricos, formatters, validators

### CANDIDATO (portal do candidato)

- dashboard, vagas, candidaturas, favoritas, alertas, curriculo, perfil, notificacoes
- autônomo mas consome Global (auth, RBAC)

## 3. Inventário atual classificado

### 3.1 components/ — Classificação

| Grupo            | Arquivos                                                                                                                                                                                                                                      | Destino                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| portal (Global)  | PortalShell, PortalHeader, PortalSidebar, PortalFooter, MetroTiles, ModuleCard, ModuleSidebar, ModuleWorkspace, CandidateContent, CandidateHeader, CandidatePortal, CandidateSidebar                                                          | app/portal/* OU candidate/*  |
| auth (Global)    | ProtectedRoute, CandidateRoute, FirstAccessRoute, PermissionGuard, AuthRoute, RecoveryGuard, Turnstile                                                                                                                                        | app/auth/*                   |
| layout           | AppShell → revisar; Navbar, Footer (público) → public; RoleBasedFooter (Global); FloatingHelpWidgets (Global); CandidateBottomNavigation → candidate; PortalBottomNavigation (Global); PublicBottomNavigation → public; PublicLayout → public | app/navigation/* OU public/* |
| common           | Container, PageTemplateBanner                                                                                                                                                                                                                 | shared/ui                    |
| dashboard        | DashboardCard, DashboardErrorState, DashboardSkeleton, DashboardSection                                                                                                                                                                       | shared/ui                    |
| feedback         | Alert, ConfirmDialog, DataState, InlineLoader, SectionLoader, Toast, ToastContext, ToastProvider                                                                                                                                              | shared/feedback              |
| fallback         | EmptyState, ErrorState, NotFoundState, TimeoutState, UnauthorizedState                                                                                                                                                                        | shared/ui                    |
| forms            | DivulgarVagaForm (RH/Empresas), JobApplicationForm (Candidato), ServiceRequestForm (Operações)                                                                                                                                                | módulo correspondente        |
| ui               | Badge, Button, Card, Input, Label, Select, Textarea, etc.                                                                                                                                                                                     | shared/ui                    |
| ui (específicos) | AccessibilityWidget, ChatWidget, HumanChatWidget, FormAlert, LoadingSpinner, PageLoader, PremiumCard, RouteLoadingFallback, SafeImage, ScrollToTop, SectionReveal, SEO                                                                        | shared/ui                    |

### 3.2 pages/ — Classificação

| Pasta                                     | Destino                         |
| ----------------------------------------- | ------------------------------- |
| pages/dashboard/* (RH)                    | modules/rh/                     |
| pages/dashboard/* (Financeiro)            | modules/financeiro/             |
| pages/dashboard/* (Sistema)               | modules/sistema/                |
| pages/dashboard/* (Operações)             | modules/operacoes/              |
| pages/dashboard/* (Empresas)              | modules/empresas/               |
| pages/auth/*                              | app/auth/pages                  |
| pages/primeiro-acesso/*                   | app/auth/pages                  |
| pages/cadastro/*                          | candidate/pages OU public/pages |
| pages/{Home,Sobre,Servicos,Vagas,...}.tsx | public/pages                    |
| pages/cadastro/CadastroCandidato.tsx      | candidate/pages ou public       |

### 3.3 contexts/ — Classificação

| Contexto         | Destino            |
| ---------------- | ------------------ |
| AccountContext   | app/providers/     |
| AuthContext      | app/providers/     |
| ModuleContext    | app/providers/     |
| ThemeContext     | app/providers/     |
| IntroContext     | app/providers/     |
| UserIdentity.ts  | app/rbac/          |
| CandidateContext | modules/candidate/ |

### 3.4 repositories/ — Classificação

| Repositório                            | Domínio      |
| -------------------------------------- | ------------ |
| candidates.repository                  | RH           |
| employees.repository                   | RH           |
| jobs.repository                        | RH           |
| applications.repository                | RH           |
| recruitment-*.repository               | RH           |
| employee-*.repository                  | RH           |
| candidate-*.repository                 | RH           |
| companies.repository                   | Empresas     |
| clients.repository                     | Empresas     |
| partners.repository                    | Empresas     |
| recruitment-demands.repository         | RH           |
| services.repository                    | Operações    |
| support.repository                     | Operações    |
| accounts-payable.receivable.repository | Financeiro   |
| finance.repository                     | Financeiro   |
| financial-*.repository                 | Financeiro   |
| fiscal.repository                      | Operações    |
| stock.repository                       | Operações    |
| warehouse.repository                   | Operações    |
| tenants.repository                     | Sistema      |
| roles.repository                       | Sistema      |
| permissions.repository                 | Sistema      |
| users.repository                       | Sistema      |
| audit.repository                       | Sistema      |
| session.repository                     | Sistema      |
| notification.repository                | Sistema      |
| tenant.repository                      | Sistema      |
| supabase.repository                    | Global       |
| navigation.repository                  | Global       |
| footer.repository                      | Global       |
| page-template.repository               | Global       |
| candidate-portal/*.repository          | RH/Candidato |

### 3.5 services/ — Classificação

| Service                   | Domínio                |
| ------------------------- | ---------------------- |
| candidates.service        | RH                     |
| matching.service          | RH                     |
| candidate-context.service | Candidato              |
| mock/*                    | Mock — manter separado |

### 3.6 hooks/ — Classificação

| Hook                                | Domínio   |
| ----------------------------------- | --------- |
| useCandidates, useJobs              | RH        |
| useCompanies, usePartners           | Empresas  |
| useServices, useSuppliers           | Operações |
| useCrud                             | Shared    |
| useNavigation, useNavigationContext | Global    |
| useIsPortalRoute                    | Global    |
| useTheme                            | Global    |
| useTurnstileToken                   | Global    |
| useGlobalDashboardStats             | Global    |
| useAccessibility                    | Shared    |
| useAsync                            | Shared    |
| useFocusTrap                        | Shared    |
| useFooterConfig                     | Public    |
| usePageTemplate                     | Public    |
| usePublic*                          | Public    |

## 4. Inventário do Supabase — classificação por domínio

### 4.1 Resumo de schema

- **Tabelas (public):** 221
- **Tabelas com RLS ativado:** 221/221 ✅
- **Policies:** 600
- **Triggers:** 79
- **Funções:** 233
- **Views:** 5
- **Extensions:** 6 (pgcrypto, postgis, postgis_topology, pg_trgm, supabase_functions, plpgsql)
- **Roles:** 53
- **role_permissions:** 739

### 4.2 Triggers críticos (auth.users)

| Trigger                                  | Função                                 | Observação                                       |
| ---------------------------------------- | -------------------------------------- | ------------------------------------------------ |
| `on_auth_user_created`                   | `handle_new_auth_user()`               | Cria `people`                                    |
| `trg_bootstrap_candidate_from_auth_user` | `bootstrap_candidate_from_auth_user()` | Provisiona candidato                             |
| `trg_bootstrap_company_from_auth_user`   | `bootstrap_company_from_auth_user()`   | Provisiona empresa (se signup_context = empresa) |
| `on_auth_user_updated`                   | —                                      | Monitora updates                                 |
| `on_auth_user_deleted`                   | —                                      | Limpeza                                          |

### 4.3 Triggers de auditoria

- `trg_audit_people`, `trg_audit_companies`, `trg_audit_tenants`, `trg_audit_role_assignments`, `trg_audit_tenant_memberships`, `trg_audit_products`, `trg_audit_suppliers`, `trg_audit_contracts`, `trg_audit_purchase_orders`, `trg_audit_purchase_receipts`, `trg_audit_stock_balances`, `trg_audit_stock_movements`, `trg_audit_approvals_administrative_requests`

### 4.4 Classificação de tabelas por domínio

```text
GLOBAL (infraestrutura)
├── people                         # identidade/pessoas
├── tenants                          # tenants
├── tenant_memberships               # vínculos pessoa-tenant
├── tenant_settings                  # configurações de tenant
├── roles                            # papéis/RBAC
├── permissions                      # permissões
├── role_assignments                 # atribuições de papel
├── role_permissions                 # matriz role→permission
├── first_login_state                # estado de primeiro login
├── legal_acceptances                # aceites legais
├── sessions                         # sessões de usuário
├── notifications                    # notificações
├── notification_preferences         # preferências
├── notification_deliveries          # entregas
├── audit_logs                       # auditoria/eventos
├── domain_events                    # eventos de domínio
├── event_outbox                     # outbox de eventos
├── integrations                     # conexões, credenciais, webhooks
├── files                            # arquivos/upload
├── page_templates                   # templates de página
├── data_retention_policies          # políticas de retenção
├── data_deletion_requests           # solicitações de deleção
├── privacy_requests                 # solicitações de privacidade
├── consents                         # consentimentos
├── password_policies                # políticas de senha
├── security_events                  # eventos de segurança
├── activity_logs                    # logs de atividade
├── validation_results               # resultados de validação

RH (Recursos Humanos)
├── candidates                       # candidatos (18)
├── employees                      # funcionários
├── employee_contracts             # contratos
├── employee_documents             # documentos
├── employee_positions             # cargos
├── employee_status_history        # histórico de status
├── departments                    # departamentos
├── jobs                           # vagas (20)
├── applications                   # candidaturas
├── application_status_history     # histórico de status
├── application_profile_snapshots  # snapshots
├── recruitment_processes          # processos seletivos
├── recruitment_stages             # etapas
├── recruitment_demands            # demandas
├── interviews                     # entrevistas
├── interview_participants         # participantes
├── interview_feedback             # feedback
├── interview_followups            # followups
├── candidate_experiences          # experiências
├── candidate_education            # formação
├── candidate_courses              # cursos
├── candidate_languages            # idiomas
├── candidate_skills               # habilidades
├── candidate_documents            # documentos
├── candidate_job_alerts           # alertas
├── candidate_profile_views        # visualizações
├── candidate_processes            # processos
├── talent_pool_memberships        # banco de talentos
├── job_skills                     # skills de vagas
├── job_matches                    # matches
├── stage_templates                # templates de etapas
├── skills                         # habilidades

EMPRESAS (Relacionamento Comercial)
├── companies                      # empresas (12)
├── company_contacts               # contatos
├── company_locations              # localizações
├── company_relationships          # relacionamentos (7)
├── company_relationship_types     # tipos
├── company_services               # serviços
├── company_social_links           # redes sociais
├── leads                          # leads
├── customers                      # clientes
├── suppliers                      # fornecedores
├── contracts                      # contratos
├── contract_status_history        # histórico
├── pipeline                        # (ver notes)
└── document_links/document_versions # gestão de docs

OPERAÇÕES (Facility/Services)
├── services                       # serviços (20)
├── service_orders                 # ordens de serviço
├── service_order_items            # itens
├── service_order_status_history   # status
├── service_acceptances            # aceites
├── service_attachments            # anexos
├── service_executions             # execuções
├── service_occurrences            # ocorrências
├── service_sla                    # SLA
├── support_tickets                # chamados
├── support_ticket_messages        # mensagens
├── support_ticket_assignments     # atribuições
├── support_ticket_status_history  # status
├── support_ticket_categories      # categorias
├── work_orders                    # ordens de trabalho
├── work_order_items               # itens
├── work_order_status_history      # status
├── work_order_attachments         # anexos
├── work_order_materials           # materiais
├── work_order_occurreces          # ocorrências
├── work_order_checklists          # checklists
├── work_order_accolences          # aceitações

ESTOQUE / ALMOXARIFADO (subset de Operações)
├── stock_movements                # movimentações
├── stock_balances                 # saldos
├── stock_entries                  # entradas
├── stock_inventory                # inventário
├── stock_inventory_items          # itens
├── stock_lots                     # lotes
├── warehouses                     # armazéns
├── warehouse_locations            # localizações
├── products                       # produtos (5)
├── product_categories             # categorias
├── material_issues                # saídas
├── material_issue_items           # itens
├── material_returns               # devoluções
├── material_return_items          # itens
├── third_party_custody            # custódia terceiros
├── third_party_custody_items      # itens
├── epi_deliveries                 # entregas EPI
├── epi_delivery_items             # itens
├── epi_return_items               # devoluções EPI
├── epi_returns                    # returns

COMPRAS / PROCUREMENT
├── purchase_requests              # requisições
├── purchase_request_items         # itens
├── purchase_orders                # pedidos
├── purchase_order_items           # itens
├── purchase_quotations            # cotações
├── purchase_quotation_items       # itens
├── purchase_receipts              # recebimentos
├── purchase_receipt_items         # itens
├── purchase_receipt_divergences   # divergências
├── purchase_status_history        # status

VENDAS / FATURAMENTO
├── sales                          # vendas
├── sale_items                     # itens
├── invoices                       # faturas
├── invoice_items                  # itens
├── quotes                         # orçamentos
├── quote_items                    # itens
├── receipts                       # recebimentos
├── quotations                     # cotações (dup?)

FINANCEIRO
├── financial_transactions         # transações
├── financial_accounts             # contas
├── financial_categories           # categorias (5)
├── financial_installments         # parcelas
├── financial_installment_payments # pagamentos parcela
├── financial_installment_cancellations # cancelamentos
├── financial_accounts            # contas bancárias
├── accounts_payable              # contas a pagar
├── accounts_receivable           # contas a receber
├── bank_reconciliations          # conciliação
├── cash_flow                      # fluxo de caixa (view?)
├── payments                        # pagamentos
├── costs_centers                   # centro de custos (5)
├── tax_rates                       # alíquotas (5)

FISCAL (tributação)
├── fiscal_documents                # documentos fiscais
├── fiscal_document_items           # itens
├── fiscal_document_events          # eventos
├── fiscal_document_status_history  # histórico
├── fiscal_api_requests             # requisições API
├── fiscal_api_responses            # respostas
├── fiscal_configurations           # (1)
├── fiscal_integrations             # integrações
├── fiscal_document_items           # itens NFC-e/NFe

CONTÁBIL
├── accounting_chart_of_accounts    # plano de contas
├── accounting_entries              # lançamentos
├── accounting_trial_balances       # balancetes
├── accounting_adjustments          # ajustes
├── accounting_closures             # fechamentos

SISTEMA / CONFIGURAÇÃO
├── tenants                         # ja listado em Global
├── providers                       # provedores
├── provider_configs                # configurações
├── integration_connections         # (ja em Global)
├── integration_credentials         # (ja em Global)
├── integration_webhooks            # (ja em Global)
├── integration_events              # (ja em Global)
├── integration_errors              # (ja em Global)
├── integration_sync_jobs           # jobs de sync
├── integration_sync_runs           # runs de sync
├── dashboard_layouts               # layouts de dashboard
├── dashboard_widgets               # widgets
├── email_templates                 # templates de e-mail
├── email_messages                  # e-mails enviados
├── faqs                            # FAQs
├── feedback                        # feedback
├── interactions                    # interações
├── media_assets                    # assets de mídia
├── calendar_integrations           # integrações calendário
├── calendar_events                 # eventos
├── calendars                       # calendários
├── meeting_rooms                   # salas de reunião
├── meeting_room_reservations       # reservas
├── tasks                           # tarefas
├── task_attachments                # anexos
├── task_comments                   # comentários
├── task_status_history             # status
├── customer_feedback               # feedback clientes
├── customer_ratings                # ratings
├── report_definitions               # definições relatórios
├── report_executions                # execuções
├── report_schedules                 # agendamentos
├── automation_jobs                  # jobs (2)
├── automation_executions            # execuções
├── automation_templates             # templates
├── pos_*                           # módulo POS (não ativo no escopo atual)
├── ai_conversations                # conversas IA
├── ai_messages                     # mensagens IA
├── ai_usage                        # uso IA
├── chatbot_*                       # chatbots
├── chat_*                          # chat
├── document_*                      # documentos
├── blog_*                          # blog
├── positions                       # cargos
├── administrative_*                # administrativo
├── file_*                          # arquivos
├── footer_configs                  # (6) config footer
├── global_navigation_links         # (5) navegação global
├── page_templates                  # templates
├── data_export_requests            # exportação
├── data_deletion_requests          # (1)
└── data_retention_policies         # (8)

CANDIDATO (Portal do Candidato)
├── candidate_portal_modules         # (9) módulos do portal
├── candidate_job_alerts             # alertas de vagas
├── candidate_profile_views          # visualizações perfil
├── candidate_processes              # processos
├── favorite_jobs                    # favoritos (5)

EDGE FUNCTIONS (não tabelas)
└── /functions/                      # (empty — todas via trigger)
```

### 4.5 Dados reais significativos

| Tabela               | Registros | Observação               |
| -------------------- | --------- | ------------------------ |
| `people`             | 41        | identidade consolidada   |
| `candidate`          | 18        | candidatos provisionados |
| `candidates`         | 18        | candidatos (tabela)      |
| `roles`              | 53        | papéis/RBAC              |
| `permissions`        | 230       | permissões               |
| `role_permissions`   | 739       | matriz role→permission   |
| `role_assignments`   | 37        | atribuições              |
| `tenant_memberships` | 43        | vínculos tenant          |
| `first_login_state`  | 36        | estado primeiro login    |
| `jobs`               | 20        | vagas ativas             |
| `companies`          | 12        | empresas                 |
| `services`           | 20        | serviços                 |
| `audit_logs`         | 298       | eventos de auditoria     |
| `tenants`            | 3         | tenants                  |
| `validation_results` | 77        | validações               |

### 4.6 Tabelas órfãs / gaps (não mapeadas automaticamente)

A serem classificadas manualmente:

```text
blog_categories, blog_posts, chat_*, customer_*, pos_*, meeting_*, calendar_*,
interactions, media_assets, faqs, feedback, administrative_*, file_*,
document_links, document_versions, privacy_requests, sessions, event_participants,
provider_configs, providers, report_*, dashboard_*, email_*, data_*,
security_events, password_policies, consents, activity_logs,
contract_status_history, company_*, leads, customers, suppliers, contracts,
recruitment_demands/stages/processes, interview_*, application_profile_snapshots,
candidate_processes/views/alerts/skills/courses/education/experiences/languages/documents/formacao
```

---

## 5. Plano de migração (atualizado com dados reais)

### FASE 1 — Estrutura base (com dados reais mapeados)

1. Criar raiz `src/app/`
2. Criar `src/modules/{rh,empresas,operacoes,financeiro,sistema}/`
3. Criar `src/candidate/`
4. Criar `src/shared/` e `src/integrations/supabase/`
5. Mover providers/contexts do Global

### FASE 2 — Portal + Shell

1. Extrair PortalShell, PortalHeader, PortalSidebar para `app/portal/`
2. Separar navegação do Portal do MetroTiles
3. Definir launcher como ponto de entrada

### FASE 3 — Módulo por módulo (exemplo: RH)

1. Criar `modules/rh/` com estrutura básica
2. Migrar repositories/services
3. Migrar páginas de `pages/dashboard/*RH*`
4. Criar sidebar e dashboard do módulo
5. Atualizar rotas no App.tsx

### FASE 4 — Banco de dados

1. ✅ **Inventário completo — 221 tabelas classificadas**
2. ✅ RLS verificado — 221/221 com RLS
3. ✅ Triggers críticos identificados
4. Gap analysis entre domínios
5. Propor migrations APENAS se necessário (pós-aprovação)

### FASE 5 — Limpeza

1. Remover arquivos/imports legados
2. Consolidar providers
3. Finalizar tipagem global
