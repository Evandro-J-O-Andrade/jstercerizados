# V2.1 — Pós-Fix Business Flow Audit

**Branch:** feat/database-v21-local-rebuild  
**Commit:** 8e26594  
**Data:** 2026-08-21  
**Escopo:** Todos os arquivos `supabase/specs/sql/*.sql`

---

## Resumo Executivo

| Item                             | Status      |
| -------------------------------- | ----------- |
| Integridade referencial (FKs)    | **WARNING** |
| Fluxos de negócio completos      | **WARNING** |
| Tabelas órfãs / quebradas        | **FAIL**    |
| service_orders e support_tickets | **WARNING** |
| Problemas conceituais            | **WARNING** |
| **Veredito final**               | **WARNING** |

> **Conclusão:** O banco V2.1 possui estrutura sólida dentro de cada módulo, mas apresenta **3 dependências circulares de migração** que impedem a aplicação limpa dos scripts em ordem numérica, **tabelas órfãs** e **lacunas funcionais** nos fluxos de CRM/Venda e PDV/Fiscal.

---

## 1. Mapa de Fluxos Verificados

### 1.1 CRM → Venda → Financeiro

```
Lead → Customer → Service → Quote → Sale/Order → Invoice → Accounts Receivable → Payment
```

| Entidade            | Tabela existente      | Status                                                    |
| ------------------- | --------------------- | --------------------------------------------------------- |
| Lead                | —                     | **FAIL** (tabela ausente)                                 |
| Customer            | —                     | **FAIL** (tabela ausente; `companies` é usado como proxy) |
| Service             | `services`            | **WARNING** (órfã — não referenciada)                     |
| Service (company)   | `company_services`    | **PASS**                                                  |
| Quote               | —                     | **FAIL** (tabela ausente)                                 |
| Sale/Order          | `service_orders`      | **PASS** (mas atende a serviços, não vendas comerciais)   |
| Sale (PDV)          | `pos_sales`           | **PASS** (domínio PDV separado)                           |
| Invoice             | `invoices`            | **PASS**                                                  |
| Accounts Receivable | `accounts_receivable` | **PASS**                                                  |
| Payment (AR)        | `receipts`            | **PASS**                                                  |

**Observações:**

- Não existem tabelas `leads`, `customers`, `quotes` nem `sales`/`orders` comerciais.
- O fluxo de "venda" é coberto parcialmente por `service_orders` (serviços) e `pos_sales` (PDV), mas falta o elo de venda comercial/atendimento.

### 1.2 Compras → Estoque → Financeiro

```
Purchase Request → Quotation → Supplier → Purchase Order → Receipt → Inventory → Accounts Payable → Payment
```

| Entidade         | Tabela existente                                     | Status   |
| ---------------- | ---------------------------------------------------- | -------- |
| Purchase Request | `purchase_requests`                                  | **PASS** |
| Quotation        | `purchase_quotations`                                | **PASS** |
| Supplier         | `suppliers`                                          | **PASS** |
| Purchase Order   | `purchase_orders`                                    | **PASS** |
| Receipt          | `purchase_receipts`                                  | **PASS** |
| Inventory        | `stock_movements`, `stock_balances`, `stock_entries` | **PASS** |
| Accounts Payable | `accounts_payable`                                   | **PASS** |
| Payment (AP)     | `payments`                                           | **PASS** |

**Status: PASS** — Fluxo completo e integrado.

### 1.3 RH

```
People → Candidate → Job → Application → Recruitment → Employee → Contract
```

| Entidade    | Tabela existente        | Status   |
| ----------- | ----------------------- | -------- |
| People      | `people`                | **PASS** |
| Candidate   | `candidates`            | **PASS** |
| Job         | `jobs`                  | **PASS** |
| Application | `applications`          | **PASS** |
| Recruitment | `recruitment_processes` | **PASS** |
| Employee    | `employees`             | **PASS** |
| Contract    | `employee_contracts`    | **PASS** |

**Status: PASS** — Fluxo completo. Há também `contracts` (contratos de serviço) separado de `employee_contracts`.

### 1.4 PDV

```
Product → POS Sale → Payment → Stock Movement → Fiscal → Financial
```

| Entidade       | Tabela existente         | Status                                            |
| -------------- | ------------------------ | ------------------------------------------------- |
| Product        | `products`               | **PASS**                                          |
| POS Sale       | `pos_sales`              | **PASS**                                          |
| Payment        | `pos_payments`           | **PASS**                                          |
| Stock Movement | `stock_movements`        | **WARNING** (não gerado automaticamente pelo PDV) |
| Fiscal         | `fiscal_documents`       | **WARNING** (sem link explícito com `pos_sales`)  |
| Financial      | `financial_transactions` | **WARNING** (sem link explícito com `pos_sales`)  |

**Status: WARNING** — Falta integração automática PDV → Estoque, Fiscal e Financeiro.

### 1.5 Fiscal

```
Operation → Fiscal Document → Emit → External Provider → Authorized/Rejected → XML → Events
```

| Entidade            | Tabela existente               | Status                                                                     |
| ------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| Operation           | —                              | **WARNING** (não há tabela dedicada; `fiscal_documents.type` cobre o tipo) |
| Fiscal Document     | `fiscal_documents`             | **PASS**                                                                   |
| Emit                | `fiscal_api_requests`          | **PASS**                                                                   |
| External Provider   | `fiscal_integrations`          | **WARNING** (não há tabela `external_providers` dedicada)                  |
| Authorized/Rejected | `fiscal_documents.status`      | **PASS**                                                                   |
| XML                 | `fiscal_documents.xml_content` | **PASS**                                                                   |
| Events              | `fiscal_document_events`       | **PASS**                                                                   |

**Status: WARNING** — Falta tabela de provedores externos e integração com emissão.

---

## 2. Tabelas Órfãs e FKs Quebradas

### 2.1 Tabelas Órfãs (sem referências de entrada)

| Tabela     | Arquivo                     | Motivo                                                                                                      |
| ---------- | --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `services` | `05_services_contracts.sql` | Nenhuma outra tabela referencia `services.id`. `company_services` duplica a estrutura sem apontar para ela. |

### 2.2 FKs Quebradas por Ordem de Migração

As dependências abaixo violam a ordem numérica dos arquivos. Se os scripts forem executados de `00` a `44` em ordem, as FKs abaixo **falharão** porque a tabela referenciada ainda não existe.

| Tabela dependente               | Arquivo                     | Linha | Tabela referenciada | Arquivo da referência  | Ordem   | Status   |
| ------------------------------- | --------------------------- | ----- | ------------------- | ---------------------- | ------- | -------- |
| `service_order_status_history`  | `05_services_contracts.sql` | 17    | `service_orders`    | `34_crm_services.sql`  | 05 < 34 | **FAIL** |
| `support_ticket_status_history` | `15_support.sql`            | 14    | `support_tickets`   | `40_tasks_support.sql` | 15 < 40 | **FAIL** |
| `accounts_receivable`           | `27_finance.sql`            | 46    | `service_orders`    | `34_crm_services.sql`  | 27 < 34 | **FAIL** |

**Impacto:** A aplicação dos migrations na ordem padrão resultará em erro de FK.

### 2.3 FKs com Definição Ausente

| Coluna                                        | Tabela                                                              | Arquivo             | Problema                                                        |
| --------------------------------------------- | ------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------- |
| `invoice_id`                                  | `accounts_receivable`                                               | `27_finance.sql:47` | Coluna existe mas **não tem constraint FK** para `invoices(id)` |
| `origin_document_type` / `origin_document_id` | `accounts_receivable`, `accounts_payable`, `financial_transactions` | `27_finance.sql`    | Campos polimórficos sem constraint; aceitam qualquer UUID       |

---

## 3. service_orders e support_tickets — Conexões com Módulos

### 3.1 service_orders

- **Origem:** `company_services` → `companies` (CRM)
- **Financeiro:** `accounts_receivable.service_order_id` (FK quebrada na migração)
- **Histórico:** `service_order_status_history` (dependência quebrada na migração)
- **Execuções:** `service_executions`, `service_acceptances`, `service_attachments`
- **Status:** Conectado ao CRM e Financeiro, mas **a migração falha** devido à ordem dos arquivos.

### 3.2 support_tickets

- **Origem:** `support_ticket_categories`
- **Atendimento:** `support_ticket_assignees`, `support_ticket_messages`
- **Histórico:** `support_ticket_status_history` (dependência quebrada na migração)
- **Status:** **Módulo isolado**. Não há conexão com CRM, Service Orders, Financeiro ou nenhum outro módulo operacional. É uma entidade standalone de suporte.

---

## 4. Problemas Conceituais

### 4.1 Invoice Comercial vs Documento Fiscal vs Conta Financeira

| Conceito                  | Tabela                | Problema                                                                                  |
| ------------------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| **Invoice Comercial**     | `invoices`            | Possui itens, valores, status `draft`/`emitted`/`cancelled`                               |
| **Documento Fiscal**      | `fiscal_documents`    | Possui `xml_content`, `key` (chave NF-e), status `draft`/`issued`/`authorized`/`rejected` |
| **Conta Financeira (AR)** | `accounts_receivable` | Registro de valores a receber com `due_date`, `status`                                    |

**Conflitos identificados:**

1. **Emissão fiscal simplificada:** A função `fiscal_emit_invoice` (`39_fiscal.sql:14`) apenas altera o status de `invoices` para `'emitted'`. **Não cria um `fiscal_document` correspondente.** Isso confunde invoice comercial com documento fiscal autorizado pela SEFAZ.

2. **Ausência de vínculo FK:** `accounts_receivable.invoice_id` é uma coluna solta sem constraint. Não há garantia de integridade entre a invoice e o título financeiro.

3. **Duplo caminho de recebimento:** Existem `receipts` (ligados a `accounts_receivable`) e `financial_transactions` (genérico). Não está claro se um recebimento deve gerar ambas as entradas ou apenas uma.

### 4.2 PDV Isolado

- `pos_sales` não gera `stock_movements` automaticamente.
- `pos_sales` não gera `fiscal_documents` automaticamente.
- `pos_sales` não gera `financial_transactions` automaticamente.
- O PDV é uma ilha operacional sem integração fiscal/contábil.

### 4.3 Nomenclatura Confusa

- `payments` (Contas a Pagar) vs `receipts` (Contas a Receber): semanticamente, "payment" é pagamento (saída) e "receipt" é recebimento (entrada). Está correto, mas pode gerar confusão em código.
- `contracts` (contratos de serviço) vs `employee_contracts` (contratos de trabalho): dois conceitos de "contrato" em domínios diferentes.

---

## 5. Veredito Final

### Pontos Fortes

- Estrutura multi-tenant consistente em todos os módulos.
- RLS e auditoria abrangentes.
- Fluxo de Compras → Estoque → Financeiro é completo e bem modelado.
- Fluxo de RH é completo e bem modelado.
- Uso consistente de `tenant_id`, `actor_person_id`, `correlation_id`.

### Pontos Críticos

1. **3 dependências de migração quebradas** impedem deploy em ordem numérica.
2. **Tabelas órfãs** (`services`) desperdiçam schema e podem causar confusão.
3. **Lacunas funcionais** nos fluxos de CRM/Venda e PDV/Fiscal.

### Recomendações

1. Reordenar ou ajustar os arquivos de migração para eliminar forward references:
   - Mover `service_orders` e tabelas dependentes para antes de `05_services_contracts.sql` e `27_finance.sql`, OU
   - Mover `service_order_status_history` para um arquivo pós-`34_crm_services.sql`.
   - Mover `support_tickets` e tabelas dependentes para antes de `15_support.sql`, OU
   - Mover `support_ticket_status_history` para um arquivo pós-`40_tasks_support.sql`.
2. Adicionar FK em `accounts_receivable.invoice_id`.
3. Decidir se `services` será removida ou integrada a `company_services`.
4. Criar tabelas `leads`, `customers` e `quotes` para fechar o fluxo CRM/Venda, ou documentar que o fluxo usa `companies` + `company_services` + `service_orders`.
5. Integrar `pos_sales` com `stock_movements`, `fiscal_documents` e `financial_transactions` via triggers ou jobs.
6. Separar claramente a emissão de `invoices` da emissão de `fiscal_documents` na função `fiscal_emit_invoice` ou criar uma função específica.

---

_Relatório gerado por auditoria estática de schema. Não foram executadas queries contra banco de dados vivo._
