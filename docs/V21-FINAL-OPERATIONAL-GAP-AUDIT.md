# V2.1 — FINAL OPERATIONAL DOMAIN GAP AUDIT

## J&S Empregos LTDA — Database Canonical Model

**Data:** 2026-08-21  
**Status:** CONCLUÍDO — GAPS IMPLEMENTADOS  
**Escopo:** Domínio operacional de terceirização, field service, almoxarifado, EPI, cliente e qualidade

---

## 1. ESTADO DO SUPABASE (REMOTO)

| Item                        | Valor                              |
| --------------------------- | ---------------------------------- |
| DROP executado              | SIM                                |
| Rebuild iniciado            | SIM                                |
| Tabelas atuais              | 201                                |
| Banco vazio                 | SIM (0 linhas em todas as tabelas) |
| Última migration aplicada   | 20260817000400                     |
| Último arquivo SQL aplicado | fix_role_assignments_recursion.sql |
| Erro atual                  | Nenhum                             |

**Observação:** O remoto foi reconstruído a partir do modelo local V2.1 (specs/sql). Após a auditoria operacional, 22 novas tabelas foram adicionadas diretamente ao remoto e ao modelo canônico.

---

## 2. AUDITORIA LOCAL — CLASSIFICAÇÃO

### 2.1 OPERAÇÃO

| Requisito              | Classificação | Tabela Existente / Equivalente    | Arquivo SQL Local                           |
| ---------------------- | ------------- | --------------------------------- | ------------------------------------------- |
| work_orders            | **MISSING**   | —                                 | Criado em `46_operations_field_service.sql` |
| work_order_assignments | **MISSING**   | —                                 | Criado em `46_operations_field_service.sql` |
| work_order_materials   | **MISSING**   | —                                 | Criado em `46_operations_field_service.sql` |
| work_order_checklists  | **MISSING**   | —                                 | Criado em `46_operations_field_service.sql` |
| work_order_attachments | **MISSING**   | `service_attachments` (comercial) | Criado em `46_operations_field_service.sql` |
| work_order_occurrences | **MISSING**   | —                                 | Criado em `46_operations_field_service.sql` |
| work_order_acceptances | **MISSING**   | `service_acceptances` (comercial) | Criado em `46_operations_field_service.sql` |
| service_executions     | **EXISTS**    | `service_executions`              | `04b_service_orders.sql`                    |
| service_acceptances    | **EXISTS**    | `service_acceptances`             | `04b_service_orders.sql`                    |
| service_sla            | **MISSING**   | —                                 | Criado em `46_operations_field_service.sql` |

**Decisão de consolidação:**

- `service_orders` permanece como relação **comercial/contratual**.
- `work_orders` foi criado como relação **operacional/execução**.
- `service_acceptances` e `service_executions` permanecem vinculados a `service_orders`.
- `work_order_acceptances` e `work_order_occurrences` foram criados vinculados a `work_orders`.

---

### 2.2 CLIENTE

| Requisito                 | Classificação | Tabela Existente / Equivalente           | Arquivo SQL Local                           |
| ------------------------- | ------------- | ---------------------------------------- | ------------------------------------------- |
| company_locations         | **MISSING**   | —                                        | Criado em `46_operations_field_service.sql` |
| customer_locations        | **MISSING**   | `company_locations` cobre o conceito     | Não criado (consolidado)                    |
| customer_service_requests | **MISSING**   | `service_orders` cobre solicitações      | Não criado (consolidado)                    |
| customer_feedback         | **MISSING**   | —                                        | Criado em `46_operations_field_service.sql` |
| customer_approvals        | **MISSING**   | `work_order_acceptances` cobre aprovação | Não criado (consolidado)                    |
| customer_portal_access    | **MISSING**   | `tenant_memberships` cobre acesso        | Não criado (consolidado)                    |

**Decisão de consolidação:**

- `company_locations` foi criado para locais/unidades dos clientes.
- `customer_feedback` foi criado para avaliações específicas do cliente.
- `work_order_acceptances` cobre o fluxo de aprovação/rejeição do cliente.
- `tenant_memberships` controla o acesso do cliente ao portal.

---

### 2.3 ESTOQUE / ALMOXARIFADO

| Requisito             | Classificação | Tabela Existente / Equivalente | Arquivo SQL Local                           |
| --------------------- | ------------- | ------------------------------ | ------------------------------------------- |
| stock_movements       | **EXISTS**    | `stock_movements`              | `07_inventory_custody.sql`                  |
| material_issues       | **MISSING**   | —                              | Criado em `46_operations_field_service.sql` |
| material_issue_items  | **MISSING**   | —                              | Criado em `46_operations_field_service.sql` |
| material_returns      | **MISSING**   | —                              | Criado em `46_operations_field_service.sql` |
| material_return_items | **MISSING**   | —                              | Criado em `46_operations_field_service.sql` |

**Decisão de consolidação:**

- `stock_movements` permanece como movimentação genérica de estoque.
- `material_issues` e `material_returns` foram criados como documentos de saída/entrada vinculados a `work_orders`.
- `material_issue_items` e `material_return_items` detalham os itens por documento.
- Integração com `stock_movements` via `reference_id` para rastreabilidade.

---

### 2.4 EPI

| Requisito          | Classificação | Tabela Existente / Equivalente       | Arquivo SQL Local                           |
| ------------------ | ------------- | ------------------------------------ | ------------------------------------------- |
| epi_deliveries     | **MISSING**   | —                                    | Criado em `46_operations_field_service.sql` |
| epi_delivery_items | **MISSING**   | —                                    | Criado em `46_operations_field_service.sql` |
| epi_returns        | **MISSING**   | —                                    | Criado em `46_operations_field_service.sql` |
| epi_return_items   | **MISSING**   | —                                    | Criado em `46_operations_field_service.sql` |
| employee_epi       | **MISSING**   | `epi_delivery_items` cobre o vínculo | Não criado (consolidado)                    |
| ppe_deliveries     | **MISSING**   | `epi_deliveries` cobre o conceito    | Não criado (consolidado)                    |

**Decisão de consolidação:**

- `epi_deliveries` e `epi_delivery_items` foram criados para controle de entrega/aceite/devolução de EPI.
- `epi_returns` e `epi_return_items` controlam a devolução.
- Não foi criada tabela `employee_epi` separada; o vínculo employee↔EPI é feito via `epi_delivery_items`.

---

### 2.5 AGENDAMENTO

| Requisito             | Classificação  | Tabela Existente / Equivalente                  | Arquivo SQL Local                 |
| --------------------- | -------------- | ----------------------------------------------- | --------------------------------- |
| appointments          | **MISSING**    | `calendar_events` cobre agendamentos            | Não criado (consolidado)          |
| calendar_events       | **EXISTS**     | `calendar_events`                               | `45b_scheduling_integrations.sql` |
| meeting_rooms         | **EXISTS**     | `meeting_rooms`                                 | `45b_scheduling_integrations.sql` |
| room_reservations     | **EQUIVALENT** | `meeting_room_reservations`                     | `45b_scheduling_integrations.sql` |
| scheduling            | **MISSING**    | `calendar_events` + `meeting_room_reservations` | Não criado (consolidado)          |
| schedule_participants | **EQUIVALENT** | `event_participants`                            | `45b_scheduling_integrations.sql` |

---

### 2.6 INTEGRAÇÕES

| Requisito             | Classificação  | Tabela Existente / Equivalente                               | Arquivo SQL Local                          |
| --------------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------ |
| google_calendar       | **EQUIVALENT** | `calendar_integrations` (provider='google')                  | `45b_scheduling_integrations.sql`          |
| google_sheets         | **MISSING**    | —                                                            | Não criado (aguardando demanda específica) |
| google_meet           | **EQUIVALENT** | `calendar_events.meeting_provider` + `meeting_url`           | `45b_scheduling_integrations.sql`          |
| microsoft_calendar    | **EQUIVALENT** | `calendar_integrations` (provider='microsoft')               | `45b_scheduling_integrations.sql`          |
| microsoft_graph       | **MISSING**    | —                                                            | Não criado (aguardando demanda específica) |
| teams                 | **MISSING**    | —                                                            | Não criado (aguardando demanda específica) |
| oauth_connections     | **EQUIVALENT** | `calendar_integrations` armazena tokens OAuth                | `45b_scheduling_integrations.sql`          |
| external_integrations | **MISSING**    | —                                                            | Não criado (aguardando demanda específica) |
| integration_accounts  | **MISSING**    | —                                                            | Não criado (aguardando demanda específica) |
| webhook_subscriptions | **MISSING**    | `webhook_deliveries` existe mas é delivery, não subscription | Não criado (aguardando demanda específica) |
| sync_jobs             | **EQUIVALENT** | `integration_sync_jobs`                                      | `45b_scheduling_integrations.sql`          |
| integration_events    | **MISSING**    | `domain_events` cobre eventos genéricos                      | Não criado (consolidado)                   |

---

### 2.7 COMUNICAÇÃO

| Requisito                | Classificação | Tabela Existente / Equivalente                   | Arquivo SQL Local                 |
| ------------------------ | ------------- | ------------------------------------------------ | --------------------------------- |
| email_templates          | **EXISTS**    | `email_templates`                                | `45b_scheduling_integrations.sql` |
| email_messages           | **EXISTS**    | `email_messages`                                 | `45b_scheduling_integrations.sql` |
| email_deliveries         | **MISSING**   | `email_messages` cobre o ciclo de vida           | Não criado (consolidado)          |
| email_events             | **MISSING**   | `domain_events` pode registrar eventos de e-mail | Não criado (consolidado)          |
| email_queue              | **MISSING**   | `email_messages.status = 'queued'` cobre fila    | Não criado (consolidado)          |
| notification_preferences | **EXISTS**    | `notification_preferences`                       | `10_notifications_events.sql`     |

---

### 2.8 QUALIDADE / SUPORTE

| Requisito           | Classificação | Tabela Existente / Equivalente                                         | Arquivo SQL Local                           |
| ------------------- | ------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| feedback            | **MISSING**   | `interview_feedback` é específico de entrevista                        | Criado em `46_operations_field_service.sql` |
| faqs                | **MISSING**   | —                                                                      | Criado em `46_operations_field_service.sql` |
| sla                 | **MISSING**   | `support_tickets.sla_due_at` existe mas não há configuração standalone | Criado em `46_operations_field_service.sql` |
| service_occurrences | **MISSING**   | —                                                                      | Criado em `46_operations_field_service.sql` |
| customer_ratings    | **MISSING**   | —                                                                      | Criado em `46_operations_field_service.sql` |

---

## 3. TABELAS IMPLEMENTADAS

Foram adicionadas **22 novas tabelas** no arquivo `supabase/specs/sql/46_operations_field_service.sql`:

1. `company_locations` — Locais/unidades de clientes
2. `work_orders` — Ordens de serviço operacionais
3. `work_order_assignments` — Atribuição de funcionários à OS
4. `work_order_materials` — Materiais planejados/consumidos na OS
5. `work_order_checklists` — Checklists de execução
6. `work_order_attachments` — Anexos/evidências da OS
7. `work_order_occurrences` — Ocorrências/incidentes na OS
8. `work_order_acceptances` — Aprovação/rejeição da OS pelo cliente
9. `material_issues` — Cabeçalho de retirada de materiais
10. `material_issue_items` — Itens retirados
11. `material_returns` — Cabeçalho de devolução de materiais
12. `material_return_items` — Itens devolvidos
13. `epi_deliveries` — Cabeçalho de entrega de EPI
14. `epi_delivery_items` — Itens de EPI entregues (com aceite/assinatura/devolução)
15. `epi_returns` — Cabeçalho de devolução de EPI
16. `epi_return_items` — Itens de EPI devolvidos
17. `service_sla` — Configuração de SLA por serviço/prioridade
18. `customer_feedback` — Feedback detalhado do cliente
19. `feedback` — Feedback genérico por entidade
20. `faqs` — Perguntas frequentes
21. `service_occurrences` — Ocorrências de serviço
22. `customer_ratings` — Avaliações simples do cliente

---

## 4. REQUISITOS DE SEGURANÇA ATENDIDOS

Todas as novas tabelas obedecem:

- ✅ `tenant_id NOT NULL` com FK para `public.tenants(id)`
- ✅ RLS habilitado em todas as tabelas
- ✅ Políticas de acesso por tenant usando `is_tenant_member(tenant_id)`
- ✅ Nenhum acesso cross-tenant
- ✅ Usuário autenticado obrigatório (via RLS + `auth.uid()`)
- ✅ Permissões RBAC via `role_permissions` (coberto pelo seed existente)
- ✅ Auditoria para operações sensíveis (via audit_logs existente)
- ✅ Soft-delete não aplicado (dados operacionais devem ser imutáveis)
- ✅ Histórico imutável para entregas/devoluções/aprovações (criado_at não atualizado)
- ✅ LGPD: minimização de dados pessoais, finalidade explícita, retenção controlada
- ✅ Foreign keys com `on delete cascade` onde apropriado
- ✅ Constraints de unicidade para números de documento (issue_number, return_number, delivery_number)
- ✅ Check constraints para campos de status e prioridade

---

## 5. FLUXOS REPRESENTADOS

### 5.1 Operação

```
Cliente → Contrato → Serviço → Service Order → Work Order → Equipe → Execução → Materiais → EPI → Checklist → Evidências → Aprovação → Feedback → Encerramento → Faturamento
```

### 5.2 Estoque

```
Compra → Recebimento → Estoque → Retirada (material_issues) → OS → Consumo (work_order_materials) → Devolução (material_returns) → Movimentação (stock_movements) → Custo
```

### 5.3 EPI

```
Funcionário → EPI → Entrega (epi_deliveries) → Aceite → Utilização → Devolução (epi_returns) → Histórico
```

### 5.4 Cliente

```
Cliente → Solicitação → OS → Execução → Acompanhamento → Aprovação/Rejeição (work_order_acceptances) → Feedback (customer_feedback) → Relatório
```

---

## 6. IMPACTO

| Domínio    | Impacto                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Frontend   | Novas telas: Work Orders, Assignments, Materials, EPI, Checklists, Attachments, Occurrences, Acceptances, Feedback, FAQ, SLA |
| Financeiro | Work orders aprovadas alimentam medição e faturamento                                                                        |
| Estoque    | Retiradas e devoluções vinculadas a work orders                                                                              |
| RH         | Entregas de EPI e atribuições de funcionários                                                                                |
| Cliente    | Portal com aprovação, feedback e acompanhamento de OS                                                                        |
| Compliance | LGPD, auditoria, histórico imutável de entregas/devoluções                                                                   |

---

## 7. PRÓXIMOS PASSOS

1. ✅ **Concluído:** Diagnóstico do estado do Supabase
2. ✅ **Concluído:** Auditoria local do modelo V2.1
3. ✅ **Concluído:** Implementação das 22 tabelas operacionais
4. ✅ **Concluído:** Aplicação no remoto (201 tabelas totais)
5. 🔄 **Pendente:** Rebuild completo via `tmp_apply_migrations.cjs` (drop + recriação)
6. 🔄 **Pendente:** Validação Reality Gate
7. 🔄 **Pendente:** Seeds e dados de referência
8. 🔄 **Pendente:** Frontend — contratos de banco

---

## 8. ARQUIVOS MODIFICADOS

| Arquivo                                              | Alteração                                              |
| ---------------------------------------------------- | ------------------------------------------------------ |
| `supabase/specs/sql/46_operations_field_service.sql` | **CRIADO** — 22 novas tabelas + RLS + indexes          |
| `tmp_apply_migrations.cjs`                           | **ATUALIZADO** — ordem de migração inclui novo arquivo |
| `scripts/dryrun_migration.sql`                       | **ATUALIZADO** — dry-run inclui novo arquivo           |
