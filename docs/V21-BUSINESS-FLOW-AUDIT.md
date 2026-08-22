# Auditoria de Fluxos de Negócio V2.1 — Commit 7c2aa30

**Branch:** feat/database-v21-local-rebuild  
**Data:** 2026-08-21  
**Escopo:** supabase/specs/sql/*.sql (00-44)

---

## Status Geral: FAIL

O schema apresenta **cobertura parcial dos fluxos**, mas contém **falhas estruturais graves** que impedem a execução correta do script SQL, além de **lacunas conceituais** em domínios críticos (Comercial, Fiscal e Integração).

---

## 1. Mapa de Arquivos Analisados

| Arquivo                        | Domínio                | Status       |
| ------------------------------ | ---------------------- | ------------ |
| 00_extensions.sql              | Extensões              | OK           |
| 01_core.sql                    | Core (people, tenants) | OK           |
| 02_rbac.sql                    | RBAC                   | OK           |
| 03_crm.sql                     | CRM base               | OK           |
| 04_rh_recruitment.sql          | RH/Recrutamento        | OK           |
| 05_services_contracts.sql      | Serviços/Contratos     | **CONFLITO** |
| 06_suppliers_purchasing.sql    | Compras                | OK           |
| 07_inventory_custody.sql       | Inventário             | OK           |
| 08                             | —                      | **AUSENTE**  |
| 09_chat.sql                    | Chat                   | OK           |
| 10_notifications_events.sql    | Notificações/Eventos   | OK           |
| 11_audit_security.sql          | Auditoria              | OK           |
| 12_custody.sql                 | Custódia               | OK           |
| 13                             | —                      | **AUSENTE**  |
| 14_tasks.sql                   | Tarefas                | OK           |
| 15_support.sql                 | Suporte                | **CONFLITO** |
| 16                             | —                      | **AUSENTE**  |
| 17                             | —                      | **AUSENTE**  |
| 18_storage_documents.sql       | Documentos             | OK           |
| 19                             | —                      | **AUSENTE**  |
| 20_lgpd.sql                    | LGPD                   | OK           |
| 21_functions_triggers.sql      | Funções/Triggers       | OK           |
| 22_rls.sql                     | RLS                    | OK           |
| 23_indexes.sql                 | Índices                | OK           |
| 24                             | —                      | **AUSENTE**  |
| 25_validation.sql              | Validação              | OK           |
| 26_error_codes.sql             | Error Codes            | OK           |
| 27_finance.sql                 | Financeiro             | OK           |
| 28_fiscal.sql                  | Fiscal                 | OK           |
| 29_pos.sql                     | PDV                    | OK           |
| 30_recruitment.sql             | Recrutamento           | OK           |
| 31_automation.sql              | Automação              | OK           |
| 32_seed.sql                    | Seed                   | OK           |
| 33_employees.sql               | RH                     | OK           |
| 34_crm_services.sql            | CRM Serviços           | **CONFLITO** |
| 35_recruitment_talent_pool.sql | Talent Pool            | OK           |
| 36_inventory.sql               | Inventário             | OK           |
| 37_purchasing.sql              | Compras                | OK           |
| 38                             | —                      | **AUSENTE**  |
| 39_fiscal.sql                  | Fiscal RPCs            | OK           |
| 40_tasks_support.sql           | Tarefas/Suporte        | **CONFLITO** |
| 41_chat_security.sql           | Chat/Segurança         | OK           |
| 42_automation.sql              | Automação              | OK           |
| 43_notifications.sql           | Notificações           | OK           |
| 44_reports_views.sql           | Reports                | OK           |

---

## 2. Mapa de Fluxos Cobertos

### 2.1 RH: people → employee → department → position → contract

**Status:** PASS (com ressalvas)

| Relacionamento                   | Tabela/FK                                                                                      | Observação                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| people → employees               | `employees.id PK → people(id)`                                                                 | OK — `employees.id` é PK e FK para `people`              |
| employees → departments          | `employee_positions.position_id → positions(id)` + `positions.department_id → departments(id)` | OK — via `employee_positions`                            |
| departments → positions          | `positions.department_id → departments(id)`                                                    | OK                                                       |
| employees → contracts            | `employee_contracts.employee_id → employees(id)`                                               | OK                                                       |
| employees → departments (direto) | Ausente                                                                                        | **WARNING** — não há FK direta `employees.department_id` |

**Tabelas órfãs no fluxo:** Nenhuma crítica. `employee_positions` serve como ponte adequada.

---

### 2.2 company → service → service_order → service_order_items → execution → acceptance

**Status:** FAIL — **Duplicação de tabela crítica**

| Relacionamento            | Tabela/FK                                       | Observação                                                   |
| ------------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| company → services        | `services.tenant_id` (sem FK company)           | **WARNING** — `services` não tem FK para `companies`         |
| services → service_orders | `05: service_orders.service_id → services(id)`  | OK no arquivo 05                                             |
| service_orders → items    | `service_order_status_history.service_order_id` | **WARNING** — `service_order_items` não existe no arquivo 05 |
| execution                 | `service_executions.service_order_id`           | OK no arquivo 34                                             |
| acceptance                | `service_acceptances.service_order_id`          | OK no arquivo 34                                             |

**PROBLEMA CRÍTICO:**

- `05_services_contracts.sql` cria `service_orders` com colunas: `company_id`, `service_id`, `quantity`, `value`, `period_start`, `period_end`, `location`, `notes`
- `34_crm_services.sql` cria `service_orders` com colunas: `company_service_id`, `status`, `scheduled_at`, `completed_at`
- Ambas usam `create table if not exists public.service_orders`. A segunda execução **irá sobrescrever** ou falhar dependendo da ordem.

**Tabelas órfãs:**

- `services` (05) não tem vínculo com `companies`
- `service_order_items` existe apenas em 34, não em 05

---

### 2.3 supplier → purchase_request → quotation → purchase_order → receipt → inventory → financial

**Status:** PASS

| Relacionamento                 | Tabela/FK                                                      | Observação                       |
| ------------------------------ | -------------------------------------------------------------- | -------------------------------- |
| companies → suppliers          | `suppliers.company_id → companies(id)`                         | OK                               |
| suppliers → purchase_orders    | `purchase_orders.supplier_id → suppliers(id)`                  | OK                               |
| purchase_requests → quotations | `purchase_quotations.request_id → purchase_requests(id)`       | OK                               |
| purchase_requests → items      | `purchase_request_items.request_id → purchase_requests(id)`    | OK                               |
| purchase_orders → items        | `purchase_order_items.purchase_order_id → purchase_orders(id)` | OK                               |
| purchase_orders → receipts     | `purchase_receipts.purchase_order_id → purchase_orders(id)`    | OK                               |
| receipts → items               | `purchase_receipt_items.receipt_id → purchase_receipts(id)`    | OK                               |
| receipts → stock               | `stock_movements.reference_id` (texto livre)                   | **WARNING** — FK não estruturada |
| inventory → financial          | `accounts_payable.purchase_receipt_id → purchase_receipts(id)` | OK                               |

**Tabelas órfãs:** Nenhuma crítica. Fluxo bem conectado.

---

### 2.4 customer → invoice → invoice_items → financial_account → payment

**Status:** PASS (com ressalvas conceituais)

| Relacionamento       | Tabela/FK                                                                      | Observação                                                  |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| companies → invoices | `invoices.company_id → companies(id)` e `invoices.customer_id → companies(id)` | OK — mas confunde cliente e fornecedor na mesma tabela      |
| invoices → items     | `invoice_items.invoice_id → invoices(id)`                                      | OK                                                          |
| invoices → financial | `accounts_receivable.invoice_id → invoices(id)`                                | OK                                                          |
| financial → payments | `payments.account_payable_id → accounts_payable(id)`                           | OK — mas `payments` é só para contas a pagar                |
| financial → receipts | `receipts.account_receivable_id → accounts_receivable(id)`                     | OK                                                          |
| financial_accounts   | `financial_transactions` não tem FK para `financial_accounts`                  | **WARNING** — contas bancárias não são usadas em transações |

**Problemas conceituais:**

- `customer_id` em `invoices` referencia `companies(id)` — não há entidade `customers` separada
- `payments` só existe para `accounts_payable`, não para `accounts_receivable`
- `financial_accounts` existe mas não é referenciada por `financial_transactions` ou `payments`/`receipts`

---

### 2.5 VENDA: produto → PDV → pagamento → estoque → fiscal → financeiro

**Status:** PASS

| Relacionamento      | Tabela/FK                                     | Observação                                                                |
| ------------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| produtos → PDV      | `pos_sale_items.product_id → products(id)`    | OK                                                                        |
| PDV → pagamentos    | `pos_payments.sale_id → pos_sales(id)`        | OK                                                                        |
| PDV → estoque       | `stock_movements.reference_id` (texto livre)  | **WARNING** — não há FK estruturada de `pos_sales` para `stock_movements` |
| PDV → fiscal        | `fiscal_documents.origin_document_type/id`    | OK — genérico                                                             |
| fiscal → financeiro | `accounts_receivable.origin_document_type/id` | OK — genérico                                                             |

**Tabelas órfãs:** Nenhuma. Fluxo coberto via `origin_document_type`/`origin_document_id`.

---

### 2.6 COMPRA: solicitação → cotação → fornecedor → pedido → recebimento → estoque → financeiro

**Status:** PASS

| Relacionamento                 | Tabela/FK                                                      | Observação                                                   |
| ------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------ |
| companies → purchase_requests  | `purchase_requests.company_id → companies(id)`                 | OK                                                           |
| people → purchase_requests     | `purchase_requests.requester_id → people(id)`                  | OK                                                           |
| purchase_requests → quotations | `purchase_quotations.request_id → purchase_requests(id)`       | OK                                                           |
| quotations → suppliers         | `purchase_quotations.supplier_id → suppliers(id)`              | OK                                                           |
| suppliers → purchase_orders    | `purchase_orders.supplier_id → suppliers(id)`                  | OK                                                           |
| purchase_orders → items        | `purchase_order_items.purchase_order_id → purchase_orders(id)` | OK                                                           |
| purchase_orders → receipts     | `purchase_receipts.purchase_order_id → purchase_orders(id)`    | OK                                                           |
| receipts → items               | `purchase_receipt_items.receipt_id → purchase_receipts(id)`    | OK                                                           |
| receipts → estoque             | `stock_movements` não referencia `purchase_receipts`           | **WARNING** — movimentação de estoque não tem FK estruturada |
| receipts → financeiro          | `accounts_payable.purchase_receipt_id → purchase_receipts(id)` | OK                                                           |

**Tabelas órfãs:** Nenhuma crítica.

---

### 2.7 FISCAL: operação → emissão → autorização/rejeição → XML → evento → cancelamento

**Status:** PASS

| Relacionamento            | Tabela/FK                                                                        | Observação                     |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| configuração → documentos | `fiscal_documents` referenciam `fiscal_configurations` implicitamente por tenant | **WARNING** — não há FK direta |
| documentos → items        | `fiscal_document_items.fiscal_document_id → fiscal_documents(id)`                | OK                             |
| documentos → status       | `fiscal_document_status_history.fiscal_document_id`                              | OK                             |
| documentos → API          | `fiscal_api_requests.fiscal_document_id → fiscal_documents(id)`                  | OK                             |
| API → responses           | `fiscal_api_responses.fiscal_api_request_id → fiscal_api_requests(id)`           | OK                             |
| documentos → eventos      | `fiscal_document_events.fiscal_document_id → fiscal_documents(id)`               | OK                             |
| XML                       | `fiscal_documents.xml_content` e `fiscal_api_responses.xml_content`              | OK                             |
| cancelamento              | `fiscal_documents.status` + `fiscal_cancel_invoice()`                            | OK                             |

**Tabelas órfãs:** `fiscal_integrations` não é referenciada por nenhuma tabela de domínio fiscal.

---

### 2.8 RH: pessoa → candidato → vaga → candidatura → processo seletivo → contratação → funcionário

**Status:** PASS

| Relacionamento            | Tabela/FK                                                | Observação    |
| ------------------------- | -------------------------------------------------------- | ------------- |
| people → candidates       | `candidates.person_id → people(id)`                      | OK            |
| candidates → applications | `applications.candidate_id → candidates(id)`             | OK            |
| applications → jobs       | `applications.job_id → jobs(id)`                         | OK            |
| jobs → companies          | `jobs.company_id → companies(id)`                        | OK            |
| applications → interviews | `interviews.application_id → applications(id)`           | OK            |
| candidates → employees    | `employees.id → people(id)` (via `candidates.person_id`) | OK — indireto |
| recruitment_processes     | `recruitment_processes.job_id/candidate_id`              | OK            |
| recruitment_stages        | `recruitment_stages.recruitment_process_id`              | OK            |

**Tabelas órfãs:** Nenhuma crítica. Fluxo bem coberto.

---

### 2.9 Cliente: lead → empresa/cliente → serviço → orçamento → contrato → execução → faturamento

**Status:** FAIL — **Lacunas conceituais graves**

| Relacionamento  | Tabela/FK                                         | Observação                                   |
| --------------- | ------------------------------------------------- | -------------------------------------------- |
| lead            | **AUSENTE**                                       | Não há tabela `leads`                        |
| empresa/cliente | `companies`                                       | OK — mas não distingue cliente de fornecedor |
| serviço         | `company_services` / `services`                   | Duplicidade conceitual                       |
| orçamento       | **AUSENTE**                                       | Não há tabela `budgets` ou `proposals`       |
| contrato        | `contracts.company_id → companies(id)`            | OK                                           |
| execução        | `service_executions.service_order_id`             | OK (em 34)                                   |
| faturamento     | `invoices.company_id/customer_id → companies(id)` | OK                                           |

**PROBLEMAS:**

- Não há modelo de `leads`/oportunidades
- Não há `orcamentos` comerciais — `service_orders` é usado como proxy
- `services` (05) vs `company_services` (34) são entidades distintas sem vínculo claro

---

### 2.10 Suporte: ticket → categoria → responsável → mensagem → SLA/status → encerramento → auditoria

**Status:** WARNING — **Duplicação de tabela crítica**

| Relacionamento       | Tabela/FK                                                                       | Observação           |
| -------------------- | ------------------------------------------------------------------------------- | -------------------- |
| ticket → categoria   | `15_support: category` (texto livre)                                            | **WARNING** — sem FK |
| ticket → categoria   | `40_tasks_support: support_tickets.category_id → support_ticket_categories(id)` | OK                   |
| ticket → responsável | `15_support: assignee_person_id → people(id)`                                   | OK                   |
| ticket → mensagens   | **AUSENTE** em 15                                                               | **WARNING**          |
| ticket → mensagens   | `support_ticket_messages.ticket_id → support_tickets(id)`                       | OK (em 40)           |
| SLA                  | `support_tickets.sla_due_at`                                                    | OK (em 15)           |
| status/history       | `support_ticket_status_history`                                                 | OK (em 15)           |
| auditoria            | `audit_logs.entity_type/entity_id`                                              | OK                   |

**PROBLEMA CRÍTICO:**

- `15_support.sql` cria `support_tickets` com `category` (texto) e `assignee_person_id`
- `40_tasks_support.sql` cria `support_tickets` com `category_id` (FK), `title`, `description`
- Estruturas conflitantes causam perda de dados ou erro de schema

---

## 3. Relacionamentos Quebrados ou Ausentes

### 3.1 Quebras Estruturais (Impedem Execução)

| #   | Arquivo | Problema                                                    | Severidade  |
| --- | ------- | ----------------------------------------------------------- | ----------- |
| 1   | 05 + 34 | Duas definições de `service_orders` com colunas diferentes  | **CRÍTICO** |
| 2   | 15 + 40 | Duas definições de `support_tickets` com colunas diferentes | **CRÍTICO** |

**Impacto:** O segundo `CREATE TABLE IF NOT EXISTS` não substitui a primeira; se a primeira já existir, a segunda é ignorada. Se executados em ordem inversa, a primeira sobrescreve a segunda. Isso gera schema inconsistente dependendo da ordem de execução.

### 3.2 FKs Ausentes ou Fracas

| Tabela                    | FK Esperada                                           | Status                        |
| ------------------------- | ----------------------------------------------------- | ----------------------------- |
| `services`                | `company_id → companies(id)`                          | **AUSENTE**                   |
| `fiscal_documents`        | `tenant_fiscal_config_id → fiscal_configurations(id)` | **AUSENTE**                   |
| `stock_movements`         | `warehouse_id → warehouses(id)`                       | **AUSENTE**                   |
| `stock_movements`         | `purchase_receipt_id → purchase_receipts(id)`         | **AUSENTE**                   |
| `stock_movements`         | `pos_sale_id → pos_sales(id)`                         | **AUSENTE**                   |
| `financial_transactions`  | `bank_account_id → financial_accounts(id)`            | **AUSENTE**                   |
| `payments`                | `bank_account_id → financial_accounts(id)`            | **AUSENTE**                   |
| `receipts`                | `bank_account_id → financial_accounts(id)`            | **AUSENTE**                   |
| `invoices`                | `contract_id → contracts(id)`                         | **AUSENTE**                   |
| `contracts`               | `service_id → services(id)` ou `company_service_id`   | **AUSENTE**                   |
| `employees`               | `department_id → departments(id)`                     | **AUSENTE**                   |
| `candidates`              | `tenant_id`                                           | OK (tem)                      |
| `talent_pool_memberships` | `candidate_id → candidates(id)`                       | **AUSENTE** — usa `person_id` |
| `job_matches`             | `candidate_id → candidates(id)`                       | **AUSENTE** — usa `person_id` |

### 3.3 Tabelas Órfãs (sem conexão com fluxos principais)

| Tabela                          | Problema                                                              |
| ------------------------------- | --------------------------------------------------------------------- |
| `fiscal_integrations`           | Não referenciada por `fiscal_documents` ou `fiscal_api_requests`      |
| `company_relationships`         | Sem vínculo com fluxos de serviço/contrato                            |
| `company_contacts`              | Sem vínculo com fluxos comerciais                                     |
| `interactions`                  | Sem integração com `service_orders` ou `companies` (além de FK solta) |
| `recruitment_demands`           | Sem vínculo com `jobs` ou `companies` além de `company_id`            |
| `application_profile_snapshots` | Útil, mas isolada                                                     |
| `candidate_profile_views`       | Isolada                                                               |

---

## 4. Problemas Conceituais

### 4.1 Duplicidade de Entidades

- **`service_orders`** existe em dois arquivos (05 e 34) com estruturas radicalmente diferentes. O arquivo 05 parece ser o modelo "antigo" de serviços, enquanto 34 é o modelo "CRM/novo".
- **`support_tickets`** existe em dois arquivos (15 e 40) com estruturas diferentes. O arquivo 15 tem `priority` e `sla_due_at`, enquanto 40 tem `title`, `description` e `category_id`.

### 4.2 Confusão de Conceitos: Invoice Comercial vs Documento Fiscal

- `invoices` (27_finance.sql) representa **fatura comercial** (accounts receivable)
- `fiscal_documents` (28_fiscal.sql) representa **documento fiscal** (NF-e, NFCe, NFS-e)
- Não há vínculo explícito entre `invoices` e `fiscal_documents`. A relação é implícita via `origin_document_type`/`origin_document_id` em `accounts_receivable`, mas não em `fiscal_documents` → `invoices`.
- **Risco:** Pode-se emitir documento fiscal sem fatura, ou faturar sem documento fiscal.

### 4.3 Conta Financeira Não Integrada

- `financial_accounts` existe, mas `payments`, `receipts` e `financial_transactions` usam `bank_account` (texto livre) em vez de FK para `financial_accounts`.
- Isso quebra a rastreabilidade bancária e impede reconciliação automática.

### 4.4 Falta de Entidades Comerciais Básicas

- Não há tabela `leads`
- Não há tabela `budgets`/`proposals`/`orcamentos`
- Não há distinção formal entre `companies` como cliente, fornecedor ou parceiro — tudo é `companies`

### 4.5 Recrutamento: Candidates vs People

- `candidates` referencia `people(id)` via `person_id`
- `talent_pool_memberships` referencia `people(id)` via `person_id`
- `job_matches` referencia `people(id)` via `candidate_id`
- Isso permite que uma pessoa seja candidato sem registro em `candidates`, quebrando a integridade do domínio.

### 4.6 Estoque sem Rastreabilidade Estruturada

- `stock_movements` usa `reference_id` (UUID genérico) e `reference_type` (texto) para ligar a PDV, compras, etc.
- Não há `warehouse_id` em `stock_movements`, impedindo rastreabilidade por local.

---

## 5. Lacunas de Arquivos (33-44)

Os arquivos 33-44 estão **incompletos** quanto à numeração esperada:

| Esperado                       | Presente    | Status |
| ------------------------------ | ----------- | ------ |
| 33_employees.sql               | Presente    | OK     |
| 34_crm_services.sql            | Presente    | OK     |
| 35_recruitment_talent_pool.sql | Presente    | OK     |
| 36_inventory.sql               | Presente    | OK     |
| 37_purchasing.sql              | Presente    | OK     |
| 38                             | **AUSENTE** | FAIL   |
| 39_fiscal.sql                  | Presente    | OK     |
| 40_tasks_support.sql           | Presente    | OK     |
| 41_chat_security.sql           | Presente    | OK     |
| 42_automation.sql              | Presente    | OK     |
| 43_notifications.sql           | Presente    | OK     |
| 44_reports_views.sql           | Presente    | OK     |

**Arquivos ausentes gerais:** 08, 13, 16, 17, 19, 24, 38

---

## 6. Recomendações

### 6.1 Correções Críticas (Bloqueiam Deploy)

1. **Resolver duplicação de `service_orders`:** Escolher entre o modelo 05 (serviços operacionais) ou 34 (CRM), ou renomear um deles (ex: `crm_service_orders` vs `operational_service_orders`).
2. **Resolver duplicação de `support_tickets`:** Unificar as estruturas, preferencialmente mantendo `category_id`, `title`, `description`, `priority`, `sla_due_at`.
3. **Adicionar `leads` e `budgets`:** Criar tabelas para o funil comercial completo.
4. **Corrigir `financial_accounts`:** Adicionar FK em `payments`, `receipts` e `financial_transactions`.
5. **Adicionar `warehouse_id` em `stock_movements`:** Permitir rastreabilidade por local.

### 6.2 Melhorias de Integridade

6. Adicionar FK `services.company_id → companies(id)`.
7. Adicionar FK `fiscal_documents.configuration_id → fiscal_configurations(id)`.
8. Adicionar FK `invoices.contract_id → contracts(id)`.
9. Adicionar FK `stock_movements.reference_id` com checagem de tipo via trigger ou tabela de referência.
10. Padronizar uso de `candidates.id` em vez de `people.id` em `talent_pool_memberships` e `job_matches`.

### 6.3 Limpeza de Tabelas Órfãs

11. Integrar `fiscal_integrations` ao fluxo fiscal.
12. Definir propósito de `company_relationships`, `company_contacts` e `interactions` ou removê-las.

### 6.4 Governança

13. Adotar convenção de nomenclatura consistente (singular vs plural): `service_order_items` (plural) vs `invoice_items` (plural) — OK, mas verificar demais.
14. Criar diagrama ER atualizado após correções.
15. Adicionar testes de integridade referencial no `25_validation.sql`.

---

## 7. Resumo Executivo

| Categoria             | Status  | Detalhe                                        |
| --------------------- | ------- | ---------------------------------------------- |
| Fluxos cobertos       | 7/10    | Falta Cliente (leads/orçamento) e há conflitos |
| FKs quebradas         | 12+     | Várias ausências críticas                      |
| Tabelas duplicadas    | 2 pares | `service_orders` e `support_tickets`           |
| Arquivos ausentes     | 7       | 08, 13, 16, 17, 19, 24, 38                     |
| Problemas conceituais | 5       | Invoice/fiscal, accounts, leads, candidates    |

**Conclusão:** O schema V2.1 está em estágio intermediário de refatoração. Os fluxos de RH, Compras, PDV e Fiscal têm cobertura razoável, mas os domínios Comercial e Suporte possuem conflitos estruturais que impedem deploy seguro. Recomenda-se bloqueio de deploy até resolução das duplicações de tabela.
