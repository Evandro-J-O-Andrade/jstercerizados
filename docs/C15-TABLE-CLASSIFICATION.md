# C1.5 — Classificação das tabelas

## Objetivo

Classificar todas as tabelas do banco por domínio, tipo, tenant e uso em UI.

## Tipos

- `entidade`: tabela de negócio com CRUD
- `transacao`: tabela de movimento/evento
- `juncao`: tabela de relacionamento muitos-para-muitos
- `configuracao`: tabela de settings/metadata
- `historico`: tabela de log/auditoria
- `sistema`: tabela de controle interno

## Escopo tenant

- `tenant`: isolada por `tenant_id`
- `global`: compartilhada entre tenants
- `person`: isolada por `person_id`
- `conforme`: depende da tabela/regra

## Status UI

- `implementado`: UI existente e conectada
- `parcial`: UI existe mas não está completa
- `pendente`: tabela confirmada, UI não iniciada
- `interno`: tabela suporta outras telas, sem página própria
- `nao-ui`: tabela sem interface prevista

## Tabelas confirmadas no banco

| Tabela                         | Domínio       | Tipo         | Tenant | UI           | Observação               |
| ------------------------------ | ------------- | ------------ | ------ | ------------ | ------------------------ |
| people                         | core          | entidade     | person | implementado |                          |
| tenants                        | core          | entidade     | tenant | implementado |                          |
| tenant_memberships             | core          | juncao       | tenant | implementado |                          |
| roles                          | core          | entidade     | global | implementado |                          |
| permissions                    | core          | entidade     | global | implementado |                          |
| role_assignments               | core          | juncao       | tenant | implementado |                          |
| role_permissions               | core          | juncao       | global | implementado |                          |
| companies                      | crm           | entidade     | tenant | parcial      |                          |
| company_relationships          | crm           | entidade     | tenant | implementado |                          |
| company_relationship_types     | crm           | entidade     | global | pendente     |                          |
| company_contacts               | crm           | entidade     | tenant | pendente     |                          |
| leads                          | crm           | entidade     | tenant | parcial      |                          |
| budget_requests                | crm           | entidade     | tenant | parcial      |                          |
| candidates                     | rh            | entidade     | tenant | implementado |                          |
| candidate_experiences          | rh            | entidade     | tenant | interno      |                          |
| candidate_education            | rh            | entidade     | tenant | interno      |                          |
| candidate_courses              | rh            | entidade     | tenant | interno      |                          |
| candidate_languages            | rh            | entidade     | tenant | interno      |                          |
| candidate_documents            | rh            | entidade     | tenant | interno      |                          |
| candidate_skills               | rh            | juncao       | tenant | interno      |                          |
| candidate_profile_views        | rh            | historico    | tenant | interno      |                          |
| jobs                           | rh            | entidade     | tenant | implementado |                          |
| applications                   | rh            | entidade     | tenant | implementado |                          |
| recruitment_processes          | rh            | entidade     | tenant | parcial      |                          |
| recruitment_stages             | rh            | entidade     | tenant | pendente     |                          |
| interviews                     | rh            | entidade     | tenant | pendente     |                          |
| employees                      | rh            | entidade     | tenant | pendente     |                          |
| financial_transactions         | financeiro    | transacao    | tenant | pendente     |                          |
| accounts_payable               | financeiro    | entidade     | tenant | pendente     |                          |
| accounts_receivable            | financeiro    | entidade     | tenant | pendente     |                          |
| financial_accounts             | financeiro    | entidade     | tenant | pendente     |                          |
| financial_installments         | financeiro    | entidade     | tenant | pendente     |                          |
| financial_installment_payments | financeiro    | transacao    | tenant | pendente     |                          |
| invoices                       | financeiro    | entidade     | tenant | pendente     |                          |
| payments                       | financeiro    | transacao    | tenant | pendente     |                          |
| receipts                       | financeiro    | transacao    | tenant | pendente     |                          |
| sales                          | financeiro    | entidade     | tenant | pendente     |                          |
| quotes                         | financeiro    | entidade     | tenant | pendente     |                          |
| fiscal_documents               | fiscal        | entidade     | tenant | pendente     |                          |
| fiscal_document_items          | fiscal        | entidade     | tenant | interno      |                          |
| tax_rates                      | fiscal        | entidade     | global | pendente     |                          |
| tax_calculations               | fiscal        | entidade     | tenant | interno      |                          |
| accounting_chart_of_accounts   | contabilidade | entidade     | tenant | pendente     |                          |
| accounting_entries             | contabilidade | entidade     | tenant | pendente     |                          |
| accounting_trial_balance       | contabilidade | entidade     | tenant | pendente     |                          |
| accounting_reconciliation      | contabilidade | entidade     | tenant | pendente     |                          |
| stock_movements                | estoque       | transacao    | tenant | pendente     |                          |
| stock_balances                 | estoque       | entidade     | tenant | pendente     |                          |
| stock_entries                  | estoque       | transacao    | tenant | pendente     |                          |
| stock_inventory                | estoque       | entidade     | tenant | pendente     |                          |
| warehouses                     | estoque       | entidade     | tenant | pendente     |                          |
| products                       | estoque       | entidade     | tenant | pendente     |                          |
| purchase_orders                | compras       | entidade     | tenant | pendente     |                          |
| purchase_requests              | compras       | entidade     | tenant | pendente     |                          |
| purchase_quotations            | compras       | entidade     | tenant | pendente     |                          |
| purchase_receipts              | compras       | entidade     | tenant | pendente     |                          |
| services                       | servicos      | entidade     | tenant | parcial      |                          |
| service_orders                 | servicos      | entidade     | tenant | parcial      |                          |
| service_executions             | servicos      | entidade     | tenant | pendente     |                          |
| service_occurrences            | servicos      | entidade     | tenant | pendente     |                          |
| support_tickets                | suporte       | entidade     | tenant | pendente     |                          |
| support_ticket_messages        | suporte       | entidade     | tenant | interno      |                          |
| support_ticket_assignments     | suporte       | juncao       | tenant | interno      |                          |
| files                          | documentos    | entidade     | tenant | pendente     |                          |
| document_versions              | documentos    | historico    | tenant | interno      |                          |
| document_links                 | documentos    | juncao       | tenant | interno      |                          |
| report_definitions             | reporting     | entidade     | tenant | pendente     |                          |
| report_executions              | reporting     | entidade     | tenant | interno      |                          |
| report_schedules               | reporting     | configuracao | tenant | pendente     |                          |
| automation_jobs                | automacao     | entidade     | tenant | pendente     |                          |
| automation_executions          | automacao     | historico    | tenant | interno      |                          |
| automation_templates           | automacao     | entidade     | tenant | pendente     |                          |
| ai_conversations               | ia            | entidade     | tenant | pendente     |                          |
| ai_messages                    | ia            | entidade     | tenant | interno      |                          |
| ai_usage                       | ia            | entidade     | tenant | interno      |                          |
| audit_logs                     | auditoria     | historico    | tenant | implementado |                          |
| security_events                | auditoria     | historico    | tenant | implementado |                          |
| domain_events                  | auditoria     | historico    | tenant | implementado |                          |
| event_outbox                   | auditoria     | sistema      | global | nao-ui       |                          |
| event_deliveries               | auditoria     | sistema      | global | nao-ui       |                          |
| notifications                  | notificacoes  | entidade     | tenant | pendente     |                          |
| notification_deliveries        | notificacoes  | historico    | tenant | interno      |                          |
| notification_preferences       | notificacoes  | configuracao | tenant | pendente     |                          |
| chat_rooms                     | chat          | entidade     | tenant | pendente     |                          |
| chat_messages                  | chat          | entidade     | tenant | pendente     |                          |
| email_messages                 | chat          | entidade     | tenant | pendente     |                          |
| tasks                          | operacoes     | entidade     | tenant | pendente     |                          |
| task_comments                  | operacoes     | entidade     | tenant | interno      |                          |
| task_attachments               | operacoes     | entidade     | tenant | interno      |                          |
| partners                       | crm           | entidade     | tenant | parcial      |                          |
| suppliers                      | crm           | entidade     | tenant | parcial      |                          |
| contracts                      | documentos    | entidade     | tenant | pendente     |                          |
| contract_versions              | documentos    | historico    | tenant | interno      |                          |
| legal_acceptances              | termos        | entidade     | person | implementado |                          |
| first_login_state              | termos        | configuracao | person | implementado |                          |
| consents                       | termos        | entidade     | person | implementado |                          |
| dashboard_widgets              | dashboard     | configuracao | person | pendente     |                          |
| dashboard_layouts              | dashboard     | configuracao | person | pendente     |                          |
| tenant_settings                | core          | configuracao | tenant | pendente     |                          |
| sessions                       | core          | sistema      | person | nao-ui       |                          |
| pos_*                          | pos           | conforme     | tenant | pendente     | Reconciliar nomes exatos |

## Observação

Esta lista deve ser validada diretamente no Supabase antes da implementação.
