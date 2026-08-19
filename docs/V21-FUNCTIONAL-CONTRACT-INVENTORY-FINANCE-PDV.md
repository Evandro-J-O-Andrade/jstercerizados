# V21 — Functional Contract: Inventory, Purchasing, Billing, PDV

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Objetivo:** Definir o comportamento esperado dos domínios de Estoque/Almoxarifado, Compras, Faturamento e PDV antes de reconstruir os objetos.  
**Restrição:** READ ONLY. Nenhum arquivo alterado, nenhuma migration executada.

---

## Princípios arquiteturais aplicáveis

1. **Ledger-first:** saldo de estoque não é alterado por `UPDATE` casual. Toda alteração passa por `stock_movements`.
2. **Idempotência:** chaves de idempotência em entradas, saídas, recebimentos, pagamentos, vendas.
3. **Correlation ID:** rastreamento transversal de operações compostas.
4. **Append-only:** `stock_movements`, `domain_events`, `audit_log` são imutáveis.
5. **Separação financeiro × fiscal:** regras, tabelas e fluxos separados.
6. **Event-driven:** regras de negócio disparam `domain_events`; automação consome via outbox.
7. **Multi-tenant:** todas as tabelas são `tenant-scoped` com RLS.
8. **People-first:** `person_id` como identidade canônica; `auth_user_id` em `people`.

---

## 1. Estoque / Almoxarifado

### 1.1 Regras de negócio invariantes

- Nenhum `UPDATE` direto em saldo de estoque.
- Saldo disponível = saldo físico − reservado − bloqueado.
- Lote e validade são obrigatórios para itens controlados.
- Transferência entre almoxarifados gera duas movimentações: saída na origem e entrada no destino.
- Ajuste de inventário físico gera movimentação do tipo `adjustment` com motivo obrigatório.
- Perda/avaria gera movimentação do tipo `loss` e deve ser auditada.
- Estoque mínimo e ponto de reposição disparam alerta; não bloqueiam operações automaticamente.
- Produto sem movimentação em N dias dispara alerta operacional.
- Preço de custo médio é recalculado após cada entrada; histórico é preservado.

### 1.2 Entidades esperadas

| Entidade                | Finalidade                                  |
| ----------------------- | ------------------------------------------- |
| `products`              | Catálogo de produtos                        |
| `product_categories`    | Categorias hierárquicas                     |
| `product_units`         | Unidades de medida e conversões             |
| `warehouses`            | Almoxarifados                               |
| `warehouse_locations`   | Localizações físicas                        |
| `stock_balances`        | Saldos por produto/almoxarifado/localização |
| `stock_movements`       | Ledger imutável de movimentações            |
| `stock_entries`         | Entradas (NF, devolução, ajuste positivo)   |
| `stock_exits`           | Saídas (venda, consumo, ajuste negativo)    |
| `stock_inventory`       | Inventário físico                           |
| `stock_inventory_items` | Itens contados do inventário                |
| `stock_adjustments`     | Ajustes manuais                             |
| `stock_transfers`       | Transferências entre almoxarifados          |
| `stock_lots`            | Lotes e validades                           |
| `stock_cost_history`    | Histórico de custo médio/unitário           |

### 1.3 Estados e transições

| Entidade          | Estados                                         |
| ----------------- | ----------------------------------------------- |
| `products`        | `active`, `inactive`, `discontinued`            |
| `stock_balances`  | Não tem status próprio; deriva de movimentações |
| `stock_movements` | Imutável; tipo define natureza                  |
| `stock_inventory` | `draft`, `in_progress`, `closed`, `cancelled`   |
| `stock_lots`      | `active`, `expired`, `quarantined`              |

### 1.4 Regras de saldo

```text
stock_balances.available = stock_balances.quantity - stock_balances.reserved - stock_balances.blocked
stock_balances.quantity = SUM(stock_movements.quantity) por produto/warehouse/location
```

- `reserved`: vinculado a pedido/venda não confirmado.
- `blocked`: vinculado a qualidade/avaria/validade.
- Nenhum processo externo altera `stock_balances` diretamente.

### 1.5 RLS esperada

- Admin master: acesso global.
- Tenant admin/rh_manager/recruiter: acesso ao tenant.
- Almoxarifado: acesso ao tenant + warehouse scope.
- Leitura: tenant members.
- Escrita: funções SECURITY DEFINER (`create_stock_movement`, `adjust_stock`, `transfer_stock`).

### 1.6 Auditoria esperada

- `stock_movements`: `actor_person_id`, `reason`, `document_type`, `document_id`, `correlation_id`.
- `stock_adjustments`: motivo obrigatório, aprovador opcional.
- `stock_transfers`: origem, destino, responsável, conferência.

### 1.7 Alertas esperados

| Alerta              | Gatilho                                        | Ação                          |
| ------------------- | ---------------------------------------------- | ----------------------------- |
| Estoque baixo       | `stock_balances.available <= min_stock`        | Evento + notificação + tarefa |
| Validade próxima    | `stock_lots.expiry_date <= now() + 30 dias`    | Evento + notificação          |
| Produto parado      | último movimento > N dias                      | Evento + notificação          |
| Inventário pendente | `stock_inventory.status != closed` há > N dias | Evento + tarefa               |

### 1.8 Eventos de domínio esperados

- `stock.entry_created`
- `stock.exit_created`
- `stock.adjusted`
- `stock.transferred`
- `stock.inventory_started`
- `stock.inventory_closed`
- `stock.low_stock`
- `stock.expiry_alert`
- `stock.loss_recorded`

### 1.9 Integrações

- Compras → entrada automática no estoque.
- PDV → saída automática do estoque.
- Faturamento → não mexe diretamente no estoque; usa saída.
- n8n → consome eventos para notificações e tarefas.

---

## 2. Compras

### 2.1 Regras de negócio invariantes

- Pedido de compra não pode ser aprovado sem itens.
- Recebimento parcial é permitido; gera movimentação de entrada parcial.
- Divergência entre pedido e recebido gera registro de divergência; não bloqueia recebimento.
- Cancelamento de pedido não apaga histórico; cria movimento de ajuste se necessário.
- Custo de entrada no estoque = custo do recebimento; não pode ser alterado após entrada.
- Prazo de entrega é tracked por item, não apenas por pedido.
- Aprovação segue RBAC; tenant_admin ou rh_manager podem aprovar.

### 2.2 Entidades esperadas

| Entidade                       | Finalidade               |
| ------------------------------ | ------------------------ |
| `suppliers`                    | Cadastro de fornecedores |
| `supplier_contacts`            | Contatos do fornecedor   |
| `purchase_requests`            | Solicitação de compra    |
| `purchase_request_items`       | Itens da solicitação     |
| `purchase_quotations`          | Cotação                  |
| `purchase_quotation_items`     | Itens da cotação         |
| `purchase_orders`              | Pedido de compra         |
| `purchase_order_items`         | Itens do pedido          |
| `purchase_receipts`            | Recebimento              |
| `purchase_receipt_items`       | Itens recebidos          |
| `purchase_receipt_divergences` | Divergências             |
| `purchase_invoices`            | NF/Fatura de compra      |
| `purchase_status_history`      | Histórico de status      |

### 2.3 Estados e transições

| Entidade            | Estados                                                                       |
| ------------------- | ----------------------------------------------------------------------------- |
| `purchase_requests` | `draft`, `submitted`, `approved`, `rejected`, `cancelled`                     |
| `purchase_orders`   | `draft`, `approved`, `ordered`, `partially_received`, `received`, `cancelled` |
| `purchase_receipts` | `draft`, `received`, `divergent`, `closed`                                    |
| `purchase_invoices` | `draft`, `issued`, `paid`, `cancelled`                                        |

### 2.4 RLS esperada

- Tenant admin: acesso completo.
- Almoxarifado/finance: leitura e escrita no tenant.
- Fornecedor: sem acesso direto; apenas leitura se integração externa.

### 2.5 Auditoria esperada

- `purchase_requests`: solicitante, aprovador, data.
- `purchase_orders`: emissor, aprovador, data.
- `purchase_receipts`: recebedor, conferente, data.
- `purchase_receipt_divergences`: tipo, quantidade, motivo.

### 2.6 Alertas esperados

| Alerta               | Gatilho                                                  | Ação                 |
| -------------------- | -------------------------------------------------------- | -------------------- |
| Pedido atrasado      | `expected_delivery_date < now()` e status não `received` | Evento + notificação |
| Divergência pendente | `purchase_receipt_divergences.status = open`             | Evento + tarefa      |
| Cotação vencendo     | prazo de cotação < N dias                                | Evento + notificação |

### 2.7 Eventos de domínio esperados

- `purchase.request_created`
- `purchase.request_approved`
- `purchase.order_created`
- `purchase.order_cancelled`
- `purchase.receipt_created`
- `purchase.receipt_divergence`
- `purchase.invoice_received`

### 2.8 Integrações

- Compras → estoque via `stock_entries`.
- Compras → faturamento via `accounts_payable`.
- n8n → notificações de pedido atrasado.

---

## 3. Faturamento

### 3.1 Separação financeiro × fiscal

- **Financeiro:** contas a receber, contas a pagar, pagamentos, recebimentos, centros de custo, competência, conciliação, inadimplência, baixas, estornos.
- **Fiscal:** documento fiscal, série, número, chave de acesso, emissão, cancelamento, retenções, integração com SEFAZ, eventos fiscais.

### 3.2 Regras de negócio invariantes

- Conta a receber/pagar é criada a partir de origem documental (venda, compra, serviço).
- Parcela não pode ser alterada após baixa; gera estorno + nova parcela se necessário.
- Cancelamento não apaga histórico; cria movimento inverso.
- Centro de custo é obrigatório para lançamentos financeiros.
- Competência é separada de data de pagamento.
- Conciliação bancária compara extrato com lançamentos; não apaga nada.
- Inadimplência é calculada por data de vencimento + tolerância.
- Retenções fiscais são registradas como lançamentos separados.

### 3.3 Entidades esperadas — Financeiro

| Entidade                              | Finalidade                    |
| ------------------------------------- | ----------------------------- |
| `financial_categories`                | Categorias de receita/despesa |
| `cost_centers`                        | Centros de custo              |
| `accounts_receivable`                 | Contas a receber              |
| `accounts_payable`                    | Contas a pagar                |
| `payments`                            | Pagamentos efetuados          |
| `receipts`                            | Recebimentos efetuados        |
| `financial_transactions`              | Lançamentos genéricos         |
| `bank_reconciliations`                | Conciliação bancária          |
| `financial_installments`              | Parcelas                      |
| `financial_installment_payments`      | Baixas de parcela             |
| `financial_installment_cancellations` | Cancelamentos/estornos        |

### 3.4 Entidades esperadas — Fiscal

| Entidade                         | Finalidade                     |
| -------------------------------- | ------------------------------ |
| `fiscal_configurations`          | Configurações por tenant       |
| `fiscal_documents`               | Cabeçalho de documento fiscal  |
| `fiscal_document_items`          | Itens do documento fiscal      |
| `fiscal_document_status_history` | Histórico de status            |
| `fiscal_api_requests`            | Requisições a SEFAZ/prefeitura |
| `fiscal_api_responses`           | Respostas                      |
| `fiscal_document_events`         | Eventos fiscais                |
| `tax_rates`                      | Alíquotas                      |
| `tax_calculations`               | Cálculos de imposto            |

### 3.5 Estados e transições

| Entidade              | Estados                                                  |
| --------------------- | -------------------------------------------------------- |
| `accounts_receivable` | `open`, `partial`, `paid`, `overdue`, `cancelled`        |
| `accounts_payable`    | `open`, `partial`, `paid`, `overdue`, `cancelled`        |
| `fiscal_documents`    | `draft`, `issued`, `authorized`, `cancelled`, `rejected` |

### 3.6 RLS esperada

- Financeiro: tenant admin + finance role.
- Fiscal: tenant admin + platform_admin para configurações sensíveis.
- Auditoria: admin_master global.

### 3.7 Auditoria esperada

- `accounts_receivable/payable`: `actor_person_id`, `correlation_id`, `origin_document_type`, `origin_document_id`.
- `financial_transactions`: `cost_center_id`, `competence_date`, `bank_account_id`.
- `fiscal_documents`: número, série, chave, emissor, status changes.

### 3.8 Alertas esperados

| Alerta                     | Gatilho                                 | Ação                          |
| -------------------------- | --------------------------------------- | ----------------------------- |
| Vencimento próximo         | `due_date <= now() + N dias`            | Evento + notificação          |
| Inadimplência              | `due_date < now() AND status != paid`   | Evento + notificação + tarefa |
| Conciliação pendente       | `bank_reconciliations.status = pending` | Evento + tarefa               |
| Documento fiscal rejeitado | `fiscal_documents.status = rejected`    | Evento + notificação          |

### 3.9 Eventos de domínio esperados

- `billing.receivable_created`
- `billing.receivable_paid`
- `billing.receivable_cancelled`
- `billing.payable_created`
- `billing.payable_paid`
- `billing.payment_made`
- `billing.overdue_detected`
- `billing.reconciliation_completed`
- `fiscal.document_issued`
- `fiscal.document_cancelled`
- `fiscal.document_rejected`

### 3.10 Integrações

- PDV → `accounts_receivable` + `fiscal_documents`.
- Compras → `accounts_payable`.
- Estoque → não mexe diretamente em financeiro; usa lançamento contábil separado.

---

## 4. PDV

### 4.1 Regras de negócio invariantes

- Venda só é confirmada após pagamento aprovado ou autorização de crédito.
- Cancelamento de venda gera estorno de estoque e financeiro.
- Devolução gera entrada de estoque e lançamento financeiro.
- Sangria e suprimento são lançamentos de caixa separados de vendas.
- Caixa não pode ser reaberto após fechamento; apenas supervisor pode reabrir.
- Operador de caixa não pode alterar venda de outro operador.
- Desconto é percentual ou valor; requer autorização se acima de limite.
- PDV deve gerar documento fiscal automaticamente quando configurado.

### 4.2 Entidades esperadas

| Entidade               | Finalidade                             |
| ---------------------- | -------------------------------------- |
| `pos_terminals`        | Terminais de PDV                       |
| `pos_cashiers`         | Caixas                                 |
| `pos_cashier_sessions` | Sessões de caixa (abertura/fechamento) |
| `pos_operators`        | Operadores de caixa                    |
| `pos_sales`            | Vendas                                 |
| `pos_sale_items`       | Itens da venda                         |
| `pos_payments`         | Pagamentos por venda                   |
| `pos_cancellations`    | Cancelamentos                          |
| `pos_returns`          | Devoluções                             |
| `pos_cash_movements`   | Sangria/suprimento                     |
| `pos_daily_closures`   | Fechamento diário                      |

### 4.3 Estados e transições

| Entidade               | Estados                                       |
| ---------------------- | --------------------------------------------- |
| `pos_cashier_sessions` | `open`, `closed`, `reopened`                  |
| `pos_sales`            | `draft`, `confirmed`, `cancelled`, `returned` |
| `pos_payments`         | `pending`, `confirmed`, `failed`, `refunded`  |
| `pos_cancellations`    | `requested`, `approved`, `completed`          |
| `pos_returns`          | `requested`, `received`, `closed`             |

### 4.4 Regras de saldo de caixa

```text
pos_cashier_sessions.opening_amount + SUM(payments.confirmed) - SUM(cash_movements.amount) = closing_amount
```

- `cash_movements.type`: `sangria`, `suprimento`, `despesa`.
- Sangria requer aprovação se acima de limite.
- Suprimento gera entrada financeira.

### 4.5 RLS esperada

- Operador de caixa: acesso apenas à sua sessão.
- Supervisor/admin: acesso a todas as sessões do tenant.
- Financeiro: leitura de vendas e pagamentos.

### 4.6 Auditoria esperada

- `pos_sales`: operador, hora, desconto, motivo de cancelamento.
- `pos_cashier_sessions`: abertura, fechamento, conferência, diferença.
- `pos_cancellations`: solicitante, aprovador, motivo.
- `pos_returns`: motivo, estado do produto devolvido.

### 4.7 Alertas esperados

| Alerta                      | Gatilho                                      | Ação                 |
| --------------------------- | -------------------------------------------- | -------------------- |
| Caixa aberto há muito tempo | sessão `open` > N horas                      | Evento + notificação |
| Diferença de caixa          | `abs(closing_amount - expected) > tolerance` | Evento + tarefa      |
| Cancelamento suspeito       | N cancelamentos em M minutos                 | Evento + notificação |
| Devolução pendente          | `pos_returns.status = received` há > N dias  | Evento + tarefa      |

### 4.8 Eventos de domínio esperados

- `pos.sale_confirmed`
- `pos.sale_cancelled`
- `pos.return_created`
- `pos.cashier_opened`
- `pos.cashier_closed`
- `pos.cash_movement`
- `pos.daily_closure`

### 4.9 Integrações

- PDV → estoque: saída automática por item vendido.
- PDV → financeiro: lançamento de recebimento.
- PDV → fiscal: emissão de NF-e/ SAT quando configurado.
- PDV → n8n: notificação de fechamento de caixa.

---

## 5. Alertas / Lembretes / Automação

### 5.1 Princípios

- Nenhuma regra de alerta é hardcoded no banco.
- Regras são consultadas por um job/scheduler e geram `domain_events`.
- n8n consome `domain_events` e decide canal: painel, e-mail, WhatsApp, tarefa.
- Alerta pode ser silenciado por tempo; não deve spammar.
- Alerta pode escalar: notify → task → escalation.

### 5.2 Arquitetura

```text
Rule Engine / Scheduler
       ↓
   domain_events
       ↓
   Outbox
       ↓
   n8n
       ↓
   ┌─────────┬─────────┬─────────┬─────────┐
   │  Painel │  E-mail │WhatsApp │ Tarefa  │
   └─────────┴─────────┴─────────┴─────────┘
```

### 5.3 Regras esperadas

| Regra                   | Gatilho                       | Ação                 |
| ----------------------- | ----------------------------- | -------------------- |
| Estoque baixo           | saldo <= min_stock            | Notificação + tarefa |
| Validade próxima        | lote expira em <= N dias      | Notificação          |
| Produto parado          | sem movimento há > N dias     | Notificação          |
| Pedido atrasado         | entrega atrasada              | Notificação + tarefa |
| Conta a rececer vencida | vencimento passado            | Notificação          |
| Caixa aberto há muito   | sessão > N horas              | Notificação          |
| Inventário pendente     | inventário aberto há > N dias | Tarefa               |
| Divergência de compra   | receipt divergent aberto      | Tarefa               |
| Devolução pendente      | return received há > N dias   | Tarefa               |

### 5.4 Entidades de suporte

| Entidade            | Finalidade                  |
| ------------------- | --------------------------- |
| `alert_rules`       | Regras configuráveis        |
| `alert_silences`    | Silenciamento temporário    |
| `alert_escalations` | Escalonamento automático    |
| `tasks`             | Tarefas geradas por alertas |
| `task_assignments`  | Responsáveis                |

### 5.5 Comportamento esperado

- Alerta gera `domain_event` único por ocorrência.
- Se já existe alerta ativo para mesma regra + entidade, não duplica.
- Silêncio respeita `tenant_id` e `person_id`.
- Escalonamento respeita hierarquia de roles.

---

## 6. Integrações entre domínios

### 6.1 Estoque ↔ Compras

- Recebimento de compra gera entrada automática no estoque.
- Divergência não impede entrada; registra quantidade real vs pedido.

### 6.2 Estoque ↔ PDV

- Confirmação de venda gera saída automática por item.
- Devolução gera entrada automática + lançamento financeiro.

### 6.3 PDV ↔ Financeiro

- Venda confirmada gera `accounts_receivable`.
- Pagamento confirmado baixa parcela.
- Cancelamento gera estorno.

### 6.4 Compras ↔ Financeiro

- Pedido aprovado pode gerar `accounts_payable` se necessário.
- Recebimento com NF gera conta a pagar.

### 6.5 Todos ↔ Eventos/Outbox

- Qualquer alteração relevante gera `domain_event`.
- n8n consome e notifica.

---

## 7. RLS e segurança

### 7.1 Padrão canônico

```
auth.uid()
  ↓
people.auth_user_id
  ↓
people.id
  ↓
tenant_memberships.person_id
  ↓
tenant_memberships.tenant_id
  ↓
[SELECT/INSERT/UPDATE/DELETE] em tabelas tenant-scoped
```

### 7.2 Roles esperadas

| Role                 | Escopo | Acesso                 |
| -------------------- | ------ | ---------------------- |
| `admin_master`       | Global | Todos os domínios      |
| `tenant_admin`       | Tenant | Administração          |
| `finance`            | Tenant | Financeiro/faturamento |
| `rh_manager`         | Tenant | RH/recrutamento        |
| `inventory_manager`  | Tenant | Estoque/almoxarifado   |
| `purchasing_manager` | Tenant | Compras                |
| `pos_operator`       | Tenant | PDV operacional        |
| `pos_supervisor`     | Tenant | PDV supervisão         |

### 7.3 Políticas esperadas

- Admin master: acesso global.
- Tenant roles: acesso scoped por `tenant_memberships`.
- Self-service: acesso aos próprios dados quando aplicável.
- service_role: acesso administrativo; nunca exposto ao frontend.

---

## 8. Auditoria e rastreabilidade

### 8.1 Campos obrigatórios

- `actor_person_id`: quem executou.
- `tenant_id`: tenant proprietário.
- `correlation_id`: request única.
- `causation_id`: evento anterior.
- `before_data` / `after_data`: estado anterior e novo.
- `created_at`: timestamp do evento.

### 8.2 Entidades append-only

- `stock_movements`
- `domain_events`
- `audit_log`
- `fiscal_document_status_history`
- `application_status_history`

### 8.3 Histórico esperado

- Toda alteração de status deve gerar registro em `*_status_history`.
- Toda movimentação de estoque gera `stock_movement`.
- Toda alteração financeira gera `financial_transaction`.

---

## 9. Regras de negócio invariantes

1. Estoque é ledger; saldo é derivado.
2. Nenhuma venda sem estoque disponível.
3. Cancelamento de venda restaura estoque e gera estorno financeiro.
4. Devolução de venda gera entrada de estoque e recebimento.
5. Compras não geram faturamento automaticamente; separar fluxos.
6. Fiscal não é financeiro; separar tabelas e responsabilidades.
7. PDV não altera estoque diretamente; usa função SECURITY DEFINER.
8. Alerta não executa ação externa; apenas notifica.
9. n8n executa integrações; banco apenas registra eventos.
10. Idempotência em todas as operações externas.

---

## 10. Eventos de domínio consolidados

### 10.1 Estoque

- `stock.entry_created`
- `stock.exit_created`
- `stock.adjusted`
- `stock.transferred`
- `stock.inventory_started`
- `stock.inventory_closed`
- `stock.low_stock`
- `stock.expiry_alert`
- `stock.loss_recorded`

### 10.2 Compras

- `purchase.request_created`
- `purchase.request_approved`
- `purchase.order_created`
- `purchase.order_cancelled`
- `purchase.receipt_created`
- `purchase.receipt_divergence`
- `purchase.invoice_received`

### 10.3 Financeiro

- `billing.receivable_created`
- `billing.receivable_paid`
- `billing.receivable_cancelled`
- `billing.payable_created`
- `billing.payable_paid`
- `billing.payment_made`
- `billing.overdue_detected`
- `billing.reconciliation_completed`

### 10.4 Fiscal

- `fiscal.document_issued`
- `fiscal.document_cancelled`
- `fiscal.document_rejected`

### 10.5 PDV

- `pos.sale_confirmed`
- `pos.sale_cancelled`
- `pos.return_created`
- `pos.cashier_opened`
- `pos.cashier_closed`
- `pos.cash_movement`
- `pos.daily_closure`

---

## 11. Critérios de conclusão

- [ ] Contrato funcional aprovado para Estoque/Almoxarifado
- [ ] Contrato funcional aprovado para Compras
- [ ] Contrato funcional aprovado para Financeiro
- [ ] Contrato funcional aprovado para Fiscal
- [ ] Contrato funcional aprovado para PDV
- [ ] Contrato funcional aprovado para Alertas/Automação
- [ ] Regras de negócio invariantes documentadas
- [ ] Eventos de domínio consolidados
- [ ] RLS e roles definidas
- [ ] Auditoria e rastreabilidade definidas
- [ ] Integrações entre domínios mapeadas
- [ ] Nenhuma alteração executada no banco/frontend

---

## 12. Próximos passos

1. Aprovar este contrato funcional.
2. Reconciliar com o `V21-MISSING-OBJECTS-RECONSTRUCTION-PLAN.md`.
3. Gerar specs SQL funcionais (não apenas estruturais).
4. Implementar Functions/Triggers/RLS conforme contrato.
5. Executar gates D.16 em diante.
