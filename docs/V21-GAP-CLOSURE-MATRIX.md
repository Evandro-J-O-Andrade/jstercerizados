# V2.1 — Gap Closure Matrix

**Branch:** `feat/database-v21-local-rebuild`  
**Commit base:** `19431c3`  
**Data:** 2026-08-21  
**Modo:** READ-ONLY — análise

## Objetivo

Classificar cada gap `MISSING`/`PARTIAL` identificado em `docs/V21-MASTER-COVERAGE-RECONCILIATION.md` e determinar a ação canônica correta antes de implementar SQL.

## Classificação

| Classificação  | Descrição                                   |
| -------------- | ------------------------------------------- |
| `CREATE`       | Nova estrutura canônica                     |
| `EXTEND`       | Tabela existe, faltam colunas/constraints   |
| `CONSOLIDATE`  | Duas estruturas representam o mesmo domínio |
| `REMODEL`      | Estrutura existente não atende V2.1         |
| `VIEW`         | Deve ser view/materialized view             |
| `FUNCTION`     | Deve ser função/trigger                     |
| `CONFIG`       | Deve ser configuração/JSONB                 |
| `GLOBAL`       | Estrutura global sem `tenant_id`            |
| `TENANT`       | Estrutura operacional multi-tenant          |
| `DROP_LEGACY`  | Estrutura histórica não pertence ao V2.1    |
| `NOT_REQUIRED` | Contrato V2.1 não exige                     |

---

## 01 — CORE / IDENTITY / RBAC

| ID    | Gap                                 | Classificação  | Escopo | Justificativa                                                                                                        | Ação SQL        | Prioridade | Status    |
| ----- | ----------------------------------- | -------------- | ------ | -------------------------------------------------------------------------------------------------------------------- | --------------- | ---------- | --------- |
| 01-01 | `role_resource_permissions` ausente | `NOT_REQUIRED` | —      | `role_permissions` já cobre permissões por role. `role_resource_permissions` é redundante com a estrutura existente. | Nenhuma         | Baixa      | CONFIRMED |
| 01-02 | RBAC sem RPCs de comando            | `FUNCTION`     | TENANT | Permissions existem, mas faltam funções para consulta eficiente (`user_has_permission`, `user_permissions`).         | Criar functions | Média      | CONFIRMED |

---

## 02 — EMPLOYEES

| ID    | Gap                               | Classificação | Escopo | Justificativa                                                                  | Ação SQL     | Prioridade | Status    |
| ----- | --------------------------------- | ------------- | ------ | ------------------------------------------------------------------------------ | ------------ | ---------- | --------- |
| 02-01 | `employees` ausente               | `CREATE`      | TENANT | RH interno não existe no SQL. Contrato V2.1 exige gestão de colaboradores J&S. | Criar tabela | Alta       | CONFIRMED |
| 02-02 | `employee_contracts` ausente      | `CREATE`      | TENANT | Contratos de colaboradores (CLT, PJ) não existem.                              | Criar tabela | Alta       | CONFIRMED |
| 02-03 | `employee_documents` ausente      | `CREATE`      | TENANT | Documentos de colaboradores (RG, CPF, certidões) não existem.                  | Criar tabela | Alta       | CONFIRMED |
| 02-04 | `employee_status_history` ausente | `CREATE`      | TENANT | Histórico de status (ativo, afastado, demitido) não existe.                    | Criar tabela | Alta       | CONFIRMED |
| 02-05 | `departments` ausente             | `CREATE`      | TENANT | Estrutura organizacional não existe.                                           | Criar tabela | Alta       | CONFIRMED |
| 02-06 | `positions` ausente               | `CREATE`      | TENANT | Cargos/funções não existem.                                                    | Criar tabela | Alta       | CONFIRMED |
| 02-07 | `employee_positions` ausente      | `CREATE`      | TENANT | Histórico de cargos/funções por colaborador não existe.                        | Criar tabela | Alta       | CONFIRMED |

---

## 03 — RECRUITMENT / TALENT POOL

| ID    | Gap                                  | Classificação | Escopo | Justificativa                                                                                                     | Ação SQL       | Prioridade | Status    |
| ----- | ------------------------------------ | ------------- | ------ | ----------------------------------------------------------------------------------------------------------------- | -------------- | ---------- | --------- |
| 03-01 | `talent_pool_memberships` ausente    | `CREATE`      | TENANT | Banco de talentos é entidade separada de `candidates`. Contrato exige estado de "banco de talentos" independente. | Criar tabela   | Média      | CONFIRMED |
| 03-02 | `job_matches` ausente                | `CREATE`      | TENANT | Matching candidato x vaga não existe. Contrato exige matching automático.                                         | Criar tabela   | Média      | CONFIRMED |
| 03-03 | `candidate_profile_views` ausente    | `CREATE`      | TENANT | Rastreamento de visualizações de perfil não existe.                                                               | Criar tabela   | Baixa      | CONFIRMED |
| 03-04 | `recruitment_kpis` ausente           | `VIEW`        | TENANT | Métricas agregadas devem ser view/materialized view, não tabela operacional.                                      | Criar view     | Baixa      | CONFIRMED |
| 03-05 | Matching automático não implementado | `FUNCTION`    | TENANT | Falta função de matching. Deve ser function, não tabela.                                                          | Criar function | Média      | CONFIRMED |

---

## 04 — INVENTORY / ALMOXARIFADO

| ID    | Gap                             | Classificação | Escopo | Justificativa                                                                                                             | Ação SQL     | Prioridade | Status    |
| ----- | ------------------------------- | ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- | --------- |
| 04-01 | `warehouses` ausente            | `CREATE`      | TENANT | Almoxarifados não existem. Contrato exige localização física.                                                             | Criar tabela | Alta       | CONFIRMED |
| 04-02 | `warehouse_locations` ausente   | `CREATE`      | TENANT | Locais dentro de armazéns não existem.                                                                                    | Criar tabela | Alta       | CONFIRMED |
| 04-03 | `stock_exits` ausente           | `CONSOLIDATE` | TENANT | Saídas podem ser representadas por `stock_movements` com `movement_type = 'exit'`. Não precisa de tabela separada.        | Nenhuma      | Baixa      | CONFIRMED |
| 04-04 | `stock_inventory` ausente       | `CREATE`      | TENANT | Inventário físico não existe. É entidade separada de movimentações.                                                       | Criar tabela | Alta       | CONFIRMED |
| 04-05 | `stock_inventory_items` ausente | `CREATE`      | TENANT | Itens contados do inventário não existem.                                                                                 | Criar tabela | Alta       | CONFIRMED |
| 04-06 | `stock_adjustments` ausente     | `CONSOLIDATE` | TENANT | Ajustes podem ser representados por `stock_movements` com `movement_type = 'adjustment'`. Não precisa de tabela separada. | Nenhuma      | Baixa      | CONFIRMED |
| 04-07 | `product_categories` ausente    | `CREATE`      | TENANT | Categorias de produtos não existem.                                                                                       | Criar tabela | Média      | CONFIRMED |
| 04-08 | `stock_lots` ausente            | `CREATE`      | TENANT | Lotes e validades não existem. Contrato exige rastreabilidade de lote.                                                    | Criar tabela | Alta       | CONFIRMED |

---

## 05 — PURCHASING

| ID    | Gap                                    | Classificação | Escopo | Justificativa                                        | Ação SQL     | Prioridade | Status    |
| ----- | -------------------------------------- | ------------- | ------ | ---------------------------------------------------- | ------------ | ---------- | --------- |
| 05-01 | `purchase_requests` ausente            | `CREATE`      | TENANT | Fluxo de solicitação de compra não existe.           | Criar tabela | Alta       | CONFIRMED |
| 05-02 | `purchase_request_items` ausente       | `CREATE`      | TENANT | Itens da solicitação não existem.                    | Criar tabela | Alta       | CONFIRMED |
| 05-03 | `purchase_quotations` ausente          | `CREATE`      | TENANT | Cotação de fornecedores não existe.                  | Criar tabela | Alta       | CONFIRMED |
| 05-04 | `purchase_quotation_items` ausente     | `CREATE`      | TENANT | Itens da cotação não existem.                        | Criar tabela | Alta       | CONFIRMED |
| 05-05 | `purchase_receipt_divergences` ausente | `CREATE`      | TENANT | Divergências entre pedido e recebimento não existem. | Criar tabela | Média      | CONFIRMED |
| 05-06 | `purchase_status_history` ausente      | `CREATE`      | TENANT | Histórico de status de pedidos não existe.           | Criar tabela | Média      | CONFIRMED |

---

## 06 — FINANCE

| ID    | Gap                                              | Classificação | Escopo | Justificativa                                                                                                         | Ação SQL       | Prioridade | Status    |
| ----- | ------------------------------------------------ | ------------- | ------ | --------------------------------------------------------------------------------------------------------------------- | -------------- | ---------- | --------- |
| 06-01 | `invoices` ausente                               | `CREATE`      | TENANT | Notas fiscais de venda não existem.                                                                                   | Criar tabela   | Alta       | CONFIRMED |
| 06-02 | `invoice_items` ausente                          | `CREATE`      | TENANT | Itens de nota fiscal não existem.                                                                                     | Criar tabela   | Alta       | CONFIRMED |
| 06-03 | `financial_accounts` ausente                     | `CREATE`      | TENANT | Contas bancárias não existem.                                                                                         | Criar tabela   | Alta       | CONFIRMED |
| 06-04 | `expenses` ausente                               | `CONSOLIDATE` | TENANT | Despesas podem ser representadas por `financial_transactions` com `type = 'expense'`. Não precisa de tabela separada. | Nenhuma        | Baixa      | CONFIRMED |
| 06-05 | `revenues` ausente                               | `CONSOLIDATE` | TENANT | Receitas podem ser representadas por `financial_transactions` com `type = 'revenue'`. Não precisa de tabela separada. | Nenhuma        | Baixa      | CONFIRMED |
| 06-06 | `financial_kpis` ausente                         | `VIEW`        | TENANT | KPIs devem ser view/materialized view.                                                                                | Criar view     | Baixa      | CONFIRMED |
| 06-07 | `competence_date` vs `payment_date` não enforced | `FUNCTION`    | TENANT | Falta trigger/constraint.                                                                                             | Criar trigger  | Média      | CONFIRMED |
| 06-08 | Parcela não alterada após baixa                  | `FUNCTION`    | TENANT | Falta proteção contra UPDATE.                                                                                         | Criar trigger  | Média      | CONFIRMED |
| 06-09 | `cost_center_id` não obrigatório                 | `EXTEND`      | TENANT | Tornar `cost_center_id` NOT NULL em `financial_transactions`.                                                         | ALTER TABLE    | Média      | CONFIRMED |
| 06-10 | Estorno automático ausente                       | `FUNCTION`    | TENANT | Falta função de estorno.                                                                                              | Criar function | Média      | CONFIRMED |

---

## 07 — FISCAL

| ID    | Gap                              | Classificação | Escopo | Justificativa                                           | Ação SQL       | Prioridade | Status    |
| ----- | -------------------------------- | ------------- | ------ | ------------------------------------------------------- | -------------- | ---------- | --------- |
| 07-01 | `fiscal_integrations` ausente    | `CREATE`      | TENANT | Integração com provedor fiscal não existe.              | Criar tabela   | Média      | CONFIRMED |
| 07-02 | RPC emissão/cancelamento ausente | `FUNCTION`    | TENANT | Falta função RPC para emitir/cancelar documento fiscal. | Criar function | Média      | CONFIRMED |

---

## 08 — REPORTS / VIEWS

| ID    | Gap                          | Classificação | Escopo | Justificativa                                                      | Ação SQL     | Prioridade | Status    |
| ----- | ---------------------------- | ------------- | ------ | ------------------------------------------------------------------ | ------------ | ---------- | --------- |
| 08-01 | `report_definitions` ausente | `CONFIG`      | TENANT | Definições de relatórios são configuração, não tabela operacional. | Criar tabela | Baixa      | CONFIRMED |
| 08-02 | `report_executions` ausente  | `CONFIG`      | TENANT | Execuções de relatórios são configuração.                          | Criar tabela | Baixa      | CONFIRMED |
| 08-03 | `report_schedules` ausente   | `CONFIG`      | TENANT | Agendamentos são configuração.                                     | Criar tabela | Baixa      | CONFIRMED |
| 08-04 | `report_recipients` ausente  | `CONFIG`      | TENANT | Destinatários são configuração.                                    | Criar tabela | Baixa      | CONFIRMED |
| 08-05 | `dashboard_widgets` ausente  | `CONFIG`      | TENANT | Widgets são configuração.                                          | Criar tabela | Baixa      | CONFIRMED |
| 08-06 | `dashboard_layouts` ausente  | `CONFIG`      | TENANT | Layouts são configuração.                                          | Criar tabela | Baixa      | CONFIRMED |
| 08-07 | Views de relatório ausentes  | `VIEW`        | TENANT | Faltam views materializadas para dashboards.                       | Criar views  | Baixa      | CONFIRMED |

---

## 09 — TASKS / SUPPORT

| ID    | Gap                                  | Classificação | Escopo | Justificativa                               | Ação SQL     | Prioridade | Status    |
| ----- | ------------------------------------ | ------------- | ------ | ------------------------------------------- | ------------ | ---------- | --------- |
| 09-01 | `task_comments` ausente              | `CREATE`      | TENANT | Comentários em tarefas não existem.         | Criar tabela | Média      | CONFIRMED |
| 09-02 | `task_attachments` ausente           | `CREATE`      | TENANT | Anexos de tarefas não existem.              | Criar tabela | Média      | CONFIRMED |
| 09-03 | `task_status_history` ausente        | `CREATE`      | TENANT | Histórico de status de tarefas não existe.  | Criar tabela | Média      | CONFIRMED |
| 09-04 | `support_ticket_categories` ausente  | `CREATE`      | TENANT | Categorias de chamados não existem.         | Criar tabela | Média      | CONFIRMED |
| 09-05 | `support_ticket_messages` ausente    | `CREATE`      | TENANT | Mensagens internas de chamados não existem. | Criar tabela | Média      | CONFIRMED |
| 09-06 | `support_ticket_assignments` ausente | `CREATE`      | TENANT | Atribuições de atendentes não existem.      | Criar tabela | Média      | CONFIRMED |

---

## 10 — CHAT

| ID    | Gap                        | Classificação | Escopo | Justificativa                                                                                              | Ação SQL     | Prioridade | Status    |
| ----- | -------------------------- | ------------- | ------ | ---------------------------------------------------------------------------------------------------------- | ------------ | ---------- | --------- |
| 10-01 | `ai_usage` ausente         | `CREATE`      | TENANT | Métricas de uso de IA não existem.                                                                         | Criar tabela | Baixa      | CONFIRMED |
| 10-02 | `chat_assignments` ausente | `CONSOLIDATE` | TENANT | Atendentes responsáveis por salas já são cobertos por `chat_participants`. Não precisa de tabela separada. | Nenhuma      | Baixa      | CONFIRMED |
| 10-03 | `chat_events` ausente      | `CONSOLIDATE` | TENANT | Eventos de chat já são cobertos por `domain_events`. Não precisa de tabela separada.                       | Nenhuma      | Baixa      | CONFIRMED |

---

## 11 — SECURITY / AUDIT / LGPD

| ID    | Gap                         | Classificação | Escopo | Justificativa                        | Ação SQL     | Prioridade | Status    |
| ----- | --------------------------- | ------------- | ------ | ------------------------------------ | ------------ | ---------- | --------- |
| 11-01 | `sessions` ausente          | `CREATE`      | TENANT | Gestão de sessões ativas não existe. | Criar tabela | Alta       | CONFIRMED |
| 11-02 | `password_policies` ausente | `CONFIG`      | TENANT | Políticas de senha são configuração. | Criar tabela | Média      | CONFIRMED |

---

## 12 — AUTOMATION

| ID    | Gap                            | Classificação | Escopo | Justificativa                                                                              | Ação SQL     | Prioridade | Status    |
| ----- | ------------------------------ | ------------- | ------ | ------------------------------------------------------------------------------------------ | ------------ | ---------- | --------- |
| 12-01 | `automation_templates` ausente | `CREATE`      | TENANT | Templates de automação não existem.                                                        | Criar tabela | Média      | CONFIRMED |
| 12-02 | `automation_events` ausente    | `CONSOLIDATE` | TENANT | Eventos de automação já são cobertos por `domain_events`. Não precisa de tabela separada.  | Nenhuma      | Baixa      | CONFIRMED |
| 12-03 | `automation_flows` ausente     | `CONSOLIDATE` | TENANT | Fluxos de automação já são cobertos por `automation_jobs`. Não precisa de tabela separada. | Nenhuma      | Baixa      | CONFIRMED |
| 12-04 | `automation_queue` ausente     | `CONSOLIDATE` | TENANT | Queue de automação já é coberta por `event_outbox`. Não precisa de tabela separada.        | Nenhuma      | Baixa      | CONFIRMED |

---

## 13 — SERVICES / CONTRACTS

| ID    | Gap                           | Classificação | Escopo | Justificativa                            | Ação SQL     | Prioridade | Status    |
| ----- | ----------------------------- | ------------- | ------ | ---------------------------------------- | ------------ | ---------- | --------- |
| 13-01 | `company_services` ausente    | `CREATE`      | TENANT | Associação empresa x serviço não existe. | Criar tabela | Alta       | CONFIRMED |
| 13-02 | `service_order_items` ausente | `CREATE`      | TENANT | Itens de OS não existem.                 | Criar tabela | Alta       | CONFIRMED |
| 13-03 | `service_acceptances` ausente | `CREATE`      | TENANT | Aceites de OS não existem.               | Criar tabela | Média      | CONFIRMED |
| 13-04 | `service_executions` ausente  | `CREATE`      | TENANT | Execuções de serviço não existem.        | Criar tabela | Média      | CONFIRMED |
| 13-05 | `service_attachments` ausente | `CREATE`      | TENANT | Anexos de OS/contratos não existem.      | Criar tabela | Média      | CONFIRMED |

---

## 14 — NOTIFICATIONS

| ID    | Gap                                | Classificação | Escopo | Justificativa                                             | Ação SQL     | Prioridade | Status    |
| ----- | ---------------------------------- | ------------- | ------ | --------------------------------------------------------- | ------------ | ---------- | --------- |
| 14-01 | `notification_preferences` ausente | `CREATE`      | TENANT | Preferências de notificação por pessoa/canal não existem. | Criar tabela | Média      | CONFIRMED |

---

## 15 — CRM

| ID    | Gap                           | Classificação | Escopo | Justificativa                                     | Ação SQL     | Prioridade | Status    |
| ----- | ----------------------------- | ------------- | ------ | ------------------------------------------------- | ------------ | ---------- | --------- |
| 15-01 | `interactions` ausente        | `CREATE`      | TENANT | Histórico de interações com empresas não existe.  | Criar tabela | Média      | CONFIRMED |
| 15-02 | `recruitment_demands` ausente | `CREATE`      | TENANT | Demandas de recrutamento por empresa não existem. | Criar tabela | Média      | CONFIRMED |

---

## 16 — PARTIALS

| ID    | Domínio     | Gap                                 | Classificação | Escopo | Justificativa                                               | Ação SQL           | Prioridade | Status    |
| ----- | ----------- | ----------------------------------- | ------------- | ------ | ----------------------------------------------------------- | ------------------ | ---------- | --------- |
| 16-01 | CRM         | `company_contacts` sem `tenant_id`  | `EXTEND`      | TENANT | Adicionar `tenant_id` direto para cumprir regra de tenancy. | ALTER TABLE        | Baixa      | CONFIRMED |
| 16-02 | Finance     | `competence_date` vs `payment_date` | `FUNCTION`    | TENANT | Criar trigger enforcing separação.                          | Criar trigger      | Média      | CONFIRMED |
| 16-03 | Finance     | Parcela não alterada após baixa     | `FUNCTION`    | TENANT | Criar trigger bloqueando UPDATE em parcela baixada.         | Criar trigger      | Média      | CONFIRMED |
| 16-04 | Finance     | `cost_center_id` obrigatório        | `EXTEND`      | TENANT | Tornar `cost_center_id` NOT NULL.                           | ALTER TABLE        | Média      | CONFIRMED |
| 16-05 | Finance     | Estorno automático                  | `FUNCTION`    | TENANT | Criar função de estorno.                                    | Criar function     | Média      | CONFIRMED |
| 16-06 | Fiscal      | RPC emissão/cancelamento            | `FUNCTION`    | TENANT | Criar RPCs de emissão/cancelamento.                         | Criar function     | Média      | CONFIRMED |
| 16-07 | Inventory   | Lotes/validade                      | `CREATE`      | TENANT | Criar `stock_lots`.                                         | Criar tabela       | Alta       | CONFIRMED |
| 16-08 | Inventory   | Almoxarifado                        | `CREATE`      | TENANT | Criar `warehouses`, `warehouse_locations`.                  | Criar tabelas      | Alta       | CONFIRMED |
| 16-09 | POS         | Integração automática               | `FUNCTION`    | TENANT | Criar triggers/functions para PDV → estoque/finance/fiscal. | Criar functions    | Alta       | CONFIRMED |
| 16-10 | POS         | Caixa não reaberto                  | `FUNCTION`    | TENANT | Criar trigger/constraint.                                   | Criar trigger      | Média      | CONFIRMED |
| 16-11 | POS         | Operador não altera venda de outro  | `EXTEND`      | TENANT | Adicionar RLS por operador.                                 | ALTER TABLE/policy | Média      | CONFIRMED |
| 16-12 | Talent Pool | Matching automático                 | `FUNCTION`    | TENANT | Criar função de matching.                                   | Criar function     | Média      | CONFIRMED |
| 16-13 | Error Codes | Uso em functions/triggers           | `FUNCTION`    | GLOBAL | Adotar enum nos triggers existentes.                        | Alterar functions  | Baixa      | CONFIRMED |
| 16-14 | Audit       | `sessions`                          | `CREATE`      | TENANT | Criar tabela de sessões.                                    | Criar tabela       | Média      | CONFIRMED |
| 16-15 | Employees   | Gestão de colaboradores             | `CREATE`      | TENANT | Ver 02-01 a 02-07.                                          | Criar tabelas      | Alta       | CONFIRMED |
| 16-16 | Services    | `company_services`                  | `CREATE`      | TENANT | Ver 13-01.                                                  | Criar tabela       | Alta       | CONFIRMED |

---

## Resumo

| Classificação  | Quantidade | Descrição                         |
| -------------- | ---------- | --------------------------------- |
| `CREATE`       | 36         | Novas tabelas/views necessárias   |
| `EXTEND`       | 4          | Alterações em tabelas existentes  |
| `CONSOLIDATE`  | 6          | Estruturas já cobertas por outras |
| `FUNCTION`     | 8          | Funções/triggers faltantes        |
| `VIEW`         | 2          | Views de relatório/KPIs           |
| `CONFIG`       | 6          | Tabelas de configuração           |
| `NOT_REQUIRED` | 1          | Redundante                        |
| **Total**      | **63**     | —                                 |

---

## Ações por prioridade

### Alta (bloqueiam runtime)

1. Employees (7 tabelas)
2. Inventory/Almoxarifado (4 tabelas)
3. Purchasing completo (6 tabelas)
4. Finance invoices/accounts (4 tabelas)
5. POS integração automática
6. Sessions
7. Services company_services

### Média (não bloqueiam mas são necessárias)

1. RBAC RPCs
2. Talent Pool (3 tabelas + function)
3. Tasks/Support enriquecido (6 tabelas)
4. Chat enriquecido (1 tabela)
5. Fiscal RPC + integrations
6. Reports/Views (6 tabelas + views)
7. Notification preferences
8. CRM interactions/recruitment_demands
9. Finance triggers (competência, estorno, parcela)
10. Password policies

### Baixa (não bloqueiam)

1. CRM `company_contacts` `tenant_id`
2. Error codes adoption
3. Recruitment KPIs (view)
4. Chat assignments/events (consolidate)
5. Automation templates

---

## Próximo passo

**AGUARDANDO APROVAÇÃO** desta matriz para executar as implementações na ordem de prioridade.

Nenhum SQL será criado até aprovação.
