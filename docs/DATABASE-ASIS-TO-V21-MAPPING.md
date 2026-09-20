# DATABASE-ASIS-TO-V21-MAPPING.md

## 1. Regras gerais

- **PRESERVAR**: tabela existe no AS-IS e não muda estruturalmente.
- **REBUILD**: tabela existe no AS-IS e é reconstruída com nova estrutura.
- **TRANSFORM**: tabela existe no AS-IS e sofre alteração controlada de colunas/relacionamentos.
- **RECONCILE**: tabela existe no AS-IS com estrutura rica e é simplificada na V2.1.
- **NEW**: tabela não existe no AS-IS e é criada na V2.1.
- **REMOVER**: tabela existe no AS-IS e é descontinuada ou não existe na V2.1.

## 2. Identity

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `users` | `users` | PRESERVAR | Nenhuma | preservar | Mantém `id`, `email`, `password_hash`, `status`. |
| `people` | `people` | PRESERVAR | Nenhuma | preservar | Adiciona referência opcional `auth_user_id`. |
| `auth.users` (Supabase) | `auth.users` | PRESERVAR | Nenhuma | preservar | Gerenciado pelo Supabase Auth. |

## 3. Tenancy

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| *(inexistente)* | `tenants` | NEW | — | vazio | Tenant único: `J&S Empregos LTDA`. |
| *(inexistente)* | `tenant_memberships` | NEW | — | vazio | Associação pessoa/tenant com papel. |
| *(inexistente)* | `tenant_settings` | NEW | — | vazio | Configurações por tenant (branding, timezone, feature flags). |

## 4. RBAC

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `roles` | `roles` | PRESERVAR | Nenhuma | preservar | |
| `permissions` | `permissions` | PRESERVAR | Nenhuma | preservar | |
| `role_permissions` | `role_permissions` | PRESERVAR | Nenhuma | preservar | |
| *(inexistente)* | `role_assignments` | NEW | — | vazio | Atribuição de papéis a pessoas no tenant. |
| *(inexistente)* | `role_resource_permissions` | NEW | — | vazio | Permissões por recurso/role. |

## 5. CRM

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `companies` | `companies` | REBUILD | Adicionar `tenant_id`. Migrar dados para tenant `J&S Empregos LTDA`. | migrar | AS-IS é global; V2.1 é tenant-scoped. |
| `contacts` | `contacts` | PRESERVAR | Nenhuma | preservar | |
| `company_relationships` | `company_relationships` | PRESERVAR | Nenhuma | preservar | Mantida para uso em CRM e como ponte para `jobs`. |
| `company_contacts` | `company_contacts` | NEW | — | vazio | Contatos primários/por função por empresa. |
| `interactions` | `interactions` | NEW | — | vazio | Histórico de interações com empresas. |
| `deals` | `deals` | PRESERVAR | Nenhuma | preservar | |
| `leads` | `leads` | TRANSFORM | Adicionar `tenant_id`; mapear `tipo_lead` para tipos V2.1. | migrar | AS-IS tinha `tipo_lead` limitado; V2.1 expande. |
| `demands_recruitment` | `recruitment_demands` | NEW | — | vazio | Demandas de recrutamento por empresa. |

## 6. RH / Recruitment

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `jobs` | `jobs` | TRANSFORM | `jobs.company_relationship_id → company_relationships.company_id → jobs.company_id` | migrar | V2.1 passa a usar `company_id` diretamente. |
| `candidates` | `candidates` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| `applications` | `applications` | PRESERVAR | Nenhuma | preservar | |
| `interviews` | `interviews` | PRESERVAR | Nenhuma | preservar | |
| *(inexistente)* | `skills` | NEW | — | vazio | Catálogo de habilidades global/tenant. |
| *(inexistente)* | `stage_templates` | NEW | — | vazio | Templates de etapa de recrutamento. |
| *(inexistente)* | `job_skills` | NEW | — | vazio | Habilidades requeridas por vaga. |
| *(inexistente)* | `recruitment_processes` | NEW | — | vazio | Processos seletivos vinculados a vagas. |
| *(inexistente)* | `recruitment_stages` | NEW | — | vazio | Etapas dos processos seletivos. |
| *(inexistente)* | `candidate_processes` | NEW | — | vazio | Candidatos em processos. |
| *(inexistente)* | `interview_participants` | NEW | — | vazio | Participantes das entrevistas. |
| *(inexistente)* | `interview_feedback` | NEW | — | vazio | Feedback dos avaliadores. |
| *(inexistente)* | `candidate_documents` | NEW | — | vazio | Documentos do candidato. |
| *(inexistente)* | `candidate_experiences` | NEW | — | vazio | Experiências profissionais. |
| *(inexistente)* | `candidate_education` | NEW | — | vazio | Formação acadêmica. |
| *(inexistente)* | `candidate_courses` | NEW | — | vazio | Cursos e certificados. |
| *(inexistente)* | `candidate_languages` | NEW | — | vazio | Idiomas do candidato. |
| *(inexistente)* | `candidate_skills` | NEW | — | vazio | Habilidades do candidato. |
| *(inexistente)* | `talent_pool_memberships` | NEW | — | vazio | Banco de talentos. |
| *(inexistente)* | `job_matches` | NEW | — | vazio | Match candidato x vaga. |
| *(inexistente)* | `candidate_profile_views` | NEW | — | vazio | Visualizações de perfil. |
| *(inexistente)* | `application_status_history` | NEW | — | vazio | Histórico de status de candidaturas. |
| *(inexistente)* | `application_profile_snapshots` | NEW | — | vazio | Snapshot do perfil na candidatura. |
| *(inexistente)* | `recruitment_kpis` | NEW | — | vazio | Métricas agregadas de recrutamento (vagas, candidaturas, entrevistas, contratações). |

## 7. Employees

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `employees` | `employees` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| `positions` | `positions` | PRESERVAR | Nenhuma | preservar | |
| `assignments` | `assignments` | PRESERVAR | Nenhuma | preservar | |
| *(inexistente)* | `employee_contracts` | NEW | — | vazio | Contratos de colaboradores. |
| *(inexistente)* | `employee_documents` | NEW | — | vazio | Documentos de colaboradores. |
| *(inexistente)* | `employee_status_history` | NEW | — | vazio | Histórico de status. |
| *(inexistente)* | `departments` | NEW | — | vazio | Estrutura organizacional. |
| *(inexistente)* | `employee_positions` | NEW | — | vazio | Histórico de cargos/funções. |

## 8. Administrative

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `documents` | `documents` | PRESERVAR | Nenhuma | preservar | |
| `document_types` | `document_types` | PRESERVAR | Nenhuma | preservar | |
| *(inexistente)* | `administrative_requests` | NEW | — | vazio | Solicitações administrativas. |
| *(inexistente)* | `administrative_tasks` | NEW | — | vazio | Tarefas derivadas de solicitações. |
| *(inexistente)* | `administrative_approvals` | NEW | — | vazio | Aprovações administrativas. |
| *(inexistente)* | `administrative_documents` | NEW | — | vazio | Anexos de solicitações administrativas. |

## 9. Finance

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `invoices` | `invoices` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| `payments` | `payments` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| `financial_accounts` | `financial_accounts` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| *(inexistente)* | `financial_categories` | NEW | — | vazio | Categorias financeiras (receita/despesa). |
| *(inexistente)* | `cost_centers` | NEW | — | vazio | Centros de custo. |
| *(inexistente)* | `accounts_receivable` | NEW | — | vazio | Contas a receber. |
| *(inexistente)* | `accounts_payable` | NEW | — | vazio | Contas a pagar. |
| *(inexistente)* | `financial_transactions` | NEW | — | vazio | Lançamentos financeiros. |
| *(inexistente)* | `invoice_items` | NEW | — | vazio | Itens de nota fiscal. |
| *(inexistente)* | `expenses` | NEW | — | vazio | Despesas. |
| *(inexistente)* | `revenues` | NEW | — | vazio | Receitas. |
| *(inexistente)* | `financial_kpis` | NEW | — | vazio | Métricas financeiras (faturamento, recebimentos, pagamentos). |

## 10. Fiscal

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `tax_entries` | `tax_entries` | PRESERVAR | Nenhuma | preservar | |
| *(inexistente)* | `fiscal_configurations` | NEW | — | vazio | Configurações fiscais por empresa. |
| *(inexistente)* | `fiscal_integrations` | NEW | — | vazio | Integrações com provedores fiscais. |
| *(inexistente)* | `fiscal_documents` | NEW | — | vazio | Notas fiscais (NF-e, NFS-e). |
| *(inexistente)* | `fiscal_document_items` | NEW | — | vazio | Itens de notas fiscais. |
| *(inexistente)* | `fiscal_document_events` | NEW | — | vazio | Eventos fiscais (cancelamento, carta de correção). |
| *(inexistente)* | `fiscal_document_status_history` | NEW | — | vazio | Histórico de status de NF. |
| *(inexistente)* | `fiscal_api_requests` | NEW | — | vazio | Log de requisições à API fiscal. |
| *(inexistente)* | `fiscal_api_responses` | NEW | — | vazio | Log de respostas da API fiscal. |

## 11. Inventory

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `inventory_items` | `inventory_items` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| `inventory_movements` | `inventory_movements` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| *(inexistente)* | `products` | NEW | — | vazio | Catálogo de produtos. |
| *(inexistente)* | `product_categories` | NEW | — | vazio | Categorias de produtos. |
| *(inexistente)* | `warehouses` | NEW | — | vazio | Armazéns/centros de distribuição. |
| *(inexistente)* | `warehouse_locations` | NEW | — | vazio | Locais dentro de armazéns. |
| *(inexistente)* | `stock_balances` | NEW | — | vazio | Saldos por produto/armazém/local. |
| *(inexistente)* | `stock_movements` | NEW | — | vazio | Movimentações gerais de estoque. |
| *(inexistente)* | `stock_entries` | NEW | — | vazio | Entradas de estoque. |
| *(inexistente)* | `stock_exits` | NEW | — | vazio | Saídas de estoque. |
| *(inexistente)* | `stock_inventory` | NEW | — | vazio | Inventários físicos. |
| *(inexistente)* | `stock_inventory_items` | NEW | — | vazio | Itens de inventário físico. |
| *(inexistente)* | `stock_adjustments` | NEW | — | vazio | Ajustes de estoque. |
| *(inexistente)* | `suppliers` | NEW | — | vazio | Fornecedores vinculados a empresas. |
| *(inexistente)* | `purchase_orders` | NEW | — | vazio | Ordens de compra. |
| *(inexistente)* | `purchase_order_items` | NEW | — | vazio | Itens de ordens de compra. |

## 12. Tasks

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `tasks` | `tasks` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| *(inexistente)* | `task_comments` | NEW | — | vazio | Comentários em tarefas. |
| *(inexistente)* | `task_attachments` | NEW | — | vazio | Anexos de tarefas. |
| *(inexistente)* | `task_status_history` | NEW | — | vazio | Histórico de status de tarefas. |

## 13. Support

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `tickets` | `support_tickets` | TRANSFORM | Renomear; adicionar `tenant_id`, `requester_person_id`, `category_id`. | migrar | AS-IS simples; V2.1 multi-tenant com categorias e SLA. |
| *(inexistente)* | `support_ticket_categories` | NEW | — | vazio | Categorias de chamados. |
| *(inexistente)* | `support_ticket_messages` | NEW | — | vazio | Mensagens internas de chamados. |
| *(inexistente)* | `support_ticket_assignments` | NEW | — | vazio | Atribuições de atendentes. |
| *(inexistente)* | `support_ticket_status_history` | NEW | — | vazio | Histórico de status. |

## 14. Chat

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| *(inexistente)* | `chat_rooms` | NEW | — | vazio | Salas de chat humano. |
| *(inexistente)* | `chat_participants` | NEW | — | vazio | Participantes de salas. |
| `messages` | `chat_messages` | TRANSFORM | Renomear para `chat_messages`; adicionar `tenant_id`, `chat_room_id`, `sender_person_id`, `type`. | migrar | AS-Is era global; V2.1 é por sala/tenant. |
| *(inexistente)* | `ai_conversations` | NEW | — | vazio | Conversas com IA. |
| *(inexistente)* | `ai_messages` | NEW | — | vazio | Mensagens de IA. |
| *(inexistente)* | `ai_usage` | NEW | — | vazio | Uso de tokens/modelo por conversa. |
| *(inexistente)* | `chat_assignments` | NEW | — | vazio | Atendentes responsáveis por salas. |
| *(inexistente)* | `chat_handoffs` | NEW | — | vazio | Transferências entre atendentes. |
| *(inexistente)* | `chat_events` | NEW | — | vazio | Eventos de chat (abertura, fechamento, etc). |

## 15. Services / Contracts

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `servicos` | `services` | REBUILD | Adicionar `tenant_id`, `category`, `type`. | migrar | AS-IS simples; V2.1 multi-tenant com tipo de serviço. |
| `cliente_servicos` | `company_services` | REBUILD | Adicionar `tenant_id`. | migrar | Associação cliente x serviço. |
| `contratos` | `contracts` | REBUILD | Adicionar `tenant_id`, `servico_id`. | migrar | AS-Is tinha só `cliente_id`; V2.1 vincula serviço. |
| *(inexistente)* | `service_orders` | NEW | — | vazio | Ordens de serviço. |
| *(inexistente)* | `service_order_items` | NEW | — | vazio | Itens de OS. |
| *(inexistente)* | `service_acceptances` | NEW | — | vazio | Aceites de OS. |
| *(inexistente)* | `service_executions` | NEW | — | vazio | Execuções de serviço. |
| *(inexistente)* | `service_attachments` | NEW | — | vazio | Anexos de OS/contratos. |

## 16. Documents

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `documentos` | `documents` | TRANSFORM | Adicionar `tenant_id`, `entity_type`, `entity_id`. | migrar | AS-Is era global; V2.1 é multi-tenant e vinculável a qualquer entidade. |
| `document_types` | `document_types` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| *(inexistente)* | `files` | NEW | — | vazio | Arquivos genéricos multi-tenant. |
| *(inexistente)* | `file_access_logs` | NEW | — | vazio | Log de acesso a arquivos. |
| *(inexistente)* | `document_versions` | NEW | — | vazio | Versionamento de documentos. |
| *(inexistente)* | `document_links` | NEW | — | vazio | Links entre documentos e entidades. |

## 17. Notifications

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `notificacoes` | `notifications` | TRANSFORM | `notificacoes.usuario_id → notifications.recipient_person_id` via `people.auth_user_id`. Adicionar `tenant_id`, `channel`, `status`, `scheduled_at`, `sent_at`, `read_at`. | migrar | V2.1 deixa de referenciar usuário direto e usa `people`. |
| *(inexistente)* | `notification_deliveries` | NEW | — | vazio | Entregas por canal (email, push, WhatsApp). |
| *(inexistente)* | `notification_preferences` | NEW | — | vazio | Preferências de notificação por pessoa/canal. |

## 18. Automation / Events

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `webhooks` | `webhooks` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| `fila_automacao` | `automation_queue` | TRANSFORM | Renomear; adicionar `tenant_id`, `payload`, `processed_at`. | migrar | AS-Is usava `payload_json`, `executado_em`. |
| `eventos_automacao` | `automation_events` | TRANSFORM | Renomear; adicionar `tenant_id`. | migrar | Templates de eventos de automação. |
| `fluxos_automacao` | `automation_flows` | TRANSFORM | Renomear; adicionar `tenant_id`. | migrar | Fluxos de automação. |
| `domain_events` | `domain_events` | RECONCILE | Preservar `actor_person_id`, `correlation_id`, `causation_id`, `payload`, `metadata`. Ajustar `aggregate_type/aggregate_id` para `aggregate/aggregate_id` se necessário. | preservar | Estrutura enriquecida simplificada na V2.1. |
| *(inexistente)* | `automation_templates` | NEW | — | vazio | Templates de automação. |
| *(inexistente)* | `webhook_deliveries` | NEW | — | vazio | Histórico de entregas de webhook. |

## 19. LGPD

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `consents` | `consents` | PRESERVAR | Nenhuma | preservar | Adiciona `tenant_id`. |
| `data_processing_requests` | `privacy_requests` | REBUILD | Adicionar `tenant_id`; mapear tipos para V2.1. | migrar | V2.1 unifica tipos de solicitação. |
| *(inexistente)* | `legal_acceptances` | NEW | — | vazio | Aceites legais (termos, políticas). |
| *(inexistente)* | `data_export_requests` | NEW | — | vazio | Solicitações de exportação de dados. |
| *(inexistente)* | `data_deletion_requests` | NEW | — | vazio | Solicitações de exclusão/anonimização. |
| *(inexistente)* | `data_retention_policies` | NEW | — | vazio | Políticas de retenção por domínio. |

## 20. Security

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `logs` | `audit_trail` | REBUILD | Adicionar `tenant_id`, `person_id`, `entity_type`, `entity_id`, `action`, `before`, `after`, `ip`, `user_agent`, `scope`, `occurred_at`. | migrar | AS-Is tinha `detalhes` textual; V2.1 usa JSON estruturado. |
| *(inexistente)* | `security_events` | NEW | — | vazio | Eventos de segurança (login suspeito, brute force, etc). |
| *(inexistente)* | `sessions` | NEW | — | vazio | Sessões ativas de usuário. |
| *(inexistente)* | `password_policies` | NEW | — | vazio | Políticas de senha por tenant. |
| *(inexistente)* | `first_login_state` | NEW | — | vazio | Estado de primeiro login por usuário. |

## 21. Reports

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| *(inexistente)* | `report_definitions` | NEW | — | vazio | Definições de relatórios (filtros, agregações, agendamento). |
| *(inexistente)* | `report_executions` | NEW | — | vazio | Execuções de relatórios (PDF, CSV, Excel). |
| *(inexistente)* | `report_schedules` | NEW | — | vazio | Agendamentos de relatórios. |
| *(inexistente)* | `report_recipients` | NEW | — | vazio | Destinatários de relatórios agendados. |
| *(inexistente)* | `dashboard_widgets` | NEW | — | vazio | Widgets de dashboard. |
| *(inexistente)* | `dashboard_layouts` | NEW | — | vazio | Layouts personalizados de dashboard. |

## 22. Storage

| AS-IS | V2.1 | Ação | Transformação | Dados | Observação |
|---|---|---|---|---|---|
| `attachments` | `files` | TRANSFORM | Renomear para `files`; adicionar `tenant_id`, `uploaded_by_person_id`, `entity_type`, `entity_id`, `bucket`. | migrar | AS-Is era simples; V2.1 é multi-tenant e genérico. |
| `storage_objects` | `file_access_logs` | REBUILD | Adicionar `tenant_id`, `file_id`, `person_id`, `action`, `ip`, `user_agent`. | migrar | AS-Is era metadados de storage; V2.1 vira log de acesso. |
| *(inexistente)* | `document_versions` | NEW | — | vazio | Versionamento de documentos. |
| *(inexistente)* | `document_links` | NEW | — | vazio | Links entre arquivos e entidades. |

## 23. Tabelas sem transformação

Tabelas mantidas integralmente do AS-IS para V2.1:
- `users`, `people`, `auth.users`
- `roles`, `permissions`, `role_permissions`
- `contacts`, `company_relationships`
- `candidates`, `applications`, `interviews`
- `employees`, `positions`, `assignments`
- `documents`, `document_types`
- `invoices`, `payments`, `financial_accounts`
- `tax_entries`
- `inventory_items`, `inventory_movements`
- `tasks`
- `support_tickets`
- `audit_logs`, `security_events`
- `consents`
- `webhooks`

## 24. Tabelas transformadas

- `companies` — REBUILD: adiciona `tenant_id` e migra dados para o tenant `J&S Empregos LTDA`.
- `jobs` — TRANSFORM: substitui `company_relationship_id` por `company_id` usando `company_relationships` como ponte.
- `notifications` — TRANSFORM: substitui referência de usuário por `recipient_person_id` (people) via `people.auth_user_id`.
- `domain_events` — RECONCILE: simplifica estrutura, preservando campos essenciais e ajustando `aggregate_type/aggregate_id`.
- `tickets` — TRANSFORM: renomeia para `support_tickets` e enriquece com categorias, SLA, histórico.
- `messages` — TRANSFORM: renomeia para `chat_messages` e adiciona contexto de sala/tenant.
- `attachments` — TRANSFORM: renomeia para `files` e adiciona contexto multi-tenant.
- `logs` — REBUILD: renomeia para `audit_trail` com estrutura JSON estruturada.
- `documentos` — TRANSFORM: adiciona `tenant_id` e vínculo genérico por entidade.
- `fila_automacao` — TRANSFORM: renomeia para `automation_queue` e ajusta campos de status.
- `eventos_automacao` — TRANSFORM: renomeia para `automation_events`.
- `fluxos_automacao` — TRANSFORM: renomeia para `automation_flows`.

## 25. Tabelas novas

- `tenants`, `tenant_memberships`, `tenant_settings` — Cadastro e configuração de tenants.
- `role_assignments`, `role_resource_permissions` — RBAC avançado.
- `company_contacts`, `interactions` — CRM enriquecido.
- `recruitment_demands` — Demandas de recrutamento.
- `skills`, `stage_templates`, `job_skills`, `recruitment_processes`, `recruitment_stages`, `candidate_processes`, `interview_participants`, `interview_feedback`, `candidate_documents`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`, `candidate_skills`, `talent_pool_memberships`, `job_matches`, `candidate_profile_views`, `application_status_history`, `application_profile_snapshots`, `recruitment_kpis` — RH/Recrutamento avançado.
- `employee_contracts`, `employee_documents`, `employee_status_history`, `departments`, `employee_positions` — Gestão de colaboradores.
- `administrative_requests`, `administrative_tasks`, `administrative_approvals`, `administrative_documents` — Fluxo administrativo.
- `financial_categories`, `cost_centers`, `accounts_receivable`, `accounts_payable`, `financial_transactions`, `invoice_items`, `expenses`, `revenues`, `financial_kpis` — Financeiro detalhado.
- `fiscal_configurations`, `fiscal_integrations`, `fiscal_documents`, `fiscal_document_items`, `fiscal_document_events`, `fiscal_document_status_history`, `fiscal_api_requests`, `fiscal_api_responses` — Fiscal.
- `products`, `product_categories`, `warehouses`, `warehouse_locations`, `stock_balances`, `stock_movements`, `stock_entries`, `stock_exits`, `stock_inventory`, `stock_inventory_items`, `stock_adjustments`, `suppliers`, `purchase_orders`, `purchase_order_items` — Estoque/almoxarifado.
- `task_comments`, `task_attachments`, `task_status_history` — Enriquecimento de tarefas.
- `support_ticket_categories`, `support_ticket_messages`, `support_ticket_assignments`, `support_ticket_status_history` — Suporte avançado.
- `chat_rooms`, `chat_participants`, `ai_conversations`, `ai_messages`, `ai_usage`, `chat_assignments`, `chat_handoffs`, `chat_events` — Chat humano e IA.
- `services`, `company_services`, `contracts`, `service_orders`, `service_order_items`, `service_acceptances`, `service_executions`, `service_attachments` — Serviços/contratos.
- `files`, `file_access_logs`, `document_versions`, `document_links` — Storage/arquivos.
- `notification_deliveries`, `notification_preferences` — Notificações avançadas.
- `automation_events`, `automation_flows`, `automation_templates`, `webhook_deliveries` — Automação.
- `legal_acceptances`, `data_export_requests`, `data_deletion_requests`, `data_retention_policies` — LGPD.
- `security_events`, `sessions`, `password_policies`, `first_login_state` — Segurança.
- `report_definitions`, `report_executions`, `report_schedules`, `report_recipients`, `dashboard_widgets`, `dashboard_layouts` — Relatórios.

## 26. Tabelas descartadas

- `profiles` (se existir) — Descontinuada na V2.1.
- `schema.sql` antigo — Substituído por migrações versionadas.
- `tickets` — Substituída por `support_tickets`.
- `messages` — Substituída por `chat_messages`.
- `attachments` — Substituída por `files`.
- `logs` — Substituída por `audit_trail`.
- `storage_objects` — Substituída por `file_access_logs`.
- `fila_automacao` — Substituída por `automation_queue`.
- `eventos_automacao` — Substituída por `automation_events`.
- `fluxos_automacao` — Substituída por `automation_flows`.
- `notificacoes` — Substituída por `notifications`.
- `conversas_ia` — Substituída por `ai_conversations`.
- `mensagens` — Substituída por `chat_messages`/`email_deliveries`.
- `emails_enviados` — Substituída por `email_deliveries`.
- `documentos` — Substituída por `documents`.
- `data_processing_requests` — Substituída por `privacy_requests`.

## 27. Ordem de migração de dados

1. Criar `tenants`, `tenant_memberships` e inserir `J&S Empregos LTDA`.
2. Criar `tenant_settings` e associar configurações padrão.
3. Migrar `users`, `people`, `roles`, `permissions`, `role_permissions`.
4. Criar `role_assignments`, `role_resource_permissions`.
5. Rebuild `companies` com `tenant_id`.
6. Transform `jobs` (resolver `company_id` via `company_relationships`).
7. Migrar `contacts`, `company_relationships`, `deals`, `leads`.
8. Migrar `candidates`, `applications`, `interviews` e tabelas de recrutamento.
9. Migrar `employees`, `positions`, `assignments` e tabelas de RH.
10. Migrar `invoices`, `payments`, `financial_accounts` e tabelas financeiras.
11. Migrar `fiscal_documents`, `fiscal_document_items` e tabelas fiscais.
12. Migrar `inventory_items`, `inventory_movements` e tabelas de estoque.
13. Migrar `tasks` e enriquecimentos.
14. Transform `support_tickets` e migrar tabelas de suporte.
15. Transform `chat_messages`, `chat_rooms` e tabelas de chat.
16. Transform `notifications` e migrar `notification_deliveries`, `notification_preferences`.
17. Transform `domain_events`, `automation_queue`, `webhooks`.
18. Migrar `audit_trail`, `security_events`, `sessions`.
19. Migrar `consents`, `privacy_requests`, `data_export_requests`, `data_deletion_requests`, `data_retention_policies`.
20. Migrar `files`, `file_access_logs`, `document_versions`, `document_links`.
21. Criar tabelas de relatórios e dashboards.
22. Executar checks de integridade.
23. Remover tabelas descontinuadas.

## 28. Checks de integridade

- Todo `company_id` em `jobs` deve existir em `companies`.
- Todo `recipient_person_id` em `notifications` deve existir em `people`.
- Todo `tenant_id` em `companies` deve existir em `tenants`.
- Nenhuma `company_relationship_id` órfã em `jobs` após migração.
- `domain_events.aggregate_type` e `aggregate_id` devem ser válidos na V2.1.
- Todo `support_ticket_id` em `support_ticket_messages` deve existir em `support_tickets`.
- Todo `chat_room_id` em `chat_messages` deve existir em `chat_rooms`.
- Todo `person_id` em `tenant_memberships` deve existir em `people`.
- Todo `invoice_id` em `payments` deve existir em `invoices`.
- Todo `fiscal_document_id` em `fiscal_document_items` deve exister em `fiscal_documents`.
- Todo `product_id` em `stock_balances` deve existir em `products`.
- Todo `contract_id` em `service_orders` deve existir em `contracts`.
- Todo `file_id` em `file_access_logs` deve existir em `files`.
- Todo `person_id` em `security_events` deve existir em `people`.
- Todo `report_id` em `report_executions` deve existir em `report_definitions`.

## 29. Rollback strategy

1. Manter snapshot do AS-IS antes da migração.
2. Executar migrações em transação quando possível.
3. Registrar checks de integridade com timestamp.
4. Em caso de falha, restaurar snapshot e recomeçar.
5. Tabelas descartadas só são dropadas após validação completa da V2.1.
