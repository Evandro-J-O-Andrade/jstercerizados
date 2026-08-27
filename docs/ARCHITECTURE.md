# Mapa Mestre — Arquitetura do SaaS J&S Empregos LTDA

## Regra absoluta

Nada de criar formulário, campo, CRUD, dashboard ou página por suposição.
Todo recurso deve nascer do banco real: `%dados da tabela% → colunas → tipos → PK/FK → constraints → RLS → tenant → roles → permissions → tela`.

---

## 1. Fluxo empresarial canônico

```text
CRM
 ├─ Empresas / Clientes / Fornecedores
 ├─ Contratos
 └─ Relacionamentos
        │
        ├──────────────┐
        ▼              ▼
   ORÇAMENTOS      COMPRAS
        │              │
        ▼              ▼
 ORDEM DE SERVIÇO   COTAÇÕES
        │              │
        ▼              ▼
   FATURAMENTO      PEDIDOS
        │              │
        ▼              ▼
       FISCAL       RECEBIMENTO
        │              │
        ▼              ▼
  CONTAS A RECEBER  ESTOQUE
        │           ALMOXARIFADO
        ▼              │
   FINANCEIRO ◄────────┘
        │
        ▼
 CONTABILIDADE
```

Paralelo:

```text
RH
 ├─ Funcionários
 ├─ Documentos
 ├─ Cursos
 ├─ EPI
 └─ Alocação/Serviços
          │
          ▼
    Ordem de Serviço
```

---

## 2. Módulos independentes

```text
RH
Recrutamento
CRM
Financeiro
Faturamento
Fiscal
Contabilidade
Serviços
Estoque
AlmoXarifado
Suporte
Relatórios
IA
Configurações
Minha Conta
Segurança
```

Cada módulo é independente na interface e nas permissões, mas compartilha dados no banco.

---

## 3. Classificação do banco real

### 3.1 CRM

| Tabela                       | Situação                     | Ação                                                 |
| ---------------------------- | ---------------------------- | ---------------------------------------------------- |
| `companies`                  | 🟢 Banco já atende           | Reutilizar                                           |
| `company_relationships`      | 🟢 Banco já atende           | Reutilizar                                           |
| `company_relationship_types` | 🟢 Banco já atende           | Reutilizar                                           |
| `contracts`                  | 🟡 Banco atende parcialmente | Verificar campos e relacionamentos com orçamentos/OS |
| `leads`                      | 🟢 Banco já atende           | Reutilizar                                           |
| `prospects`                  | 🟢 Banco já atende           | Reutilizar                                           |

### 3.2 Recrutamento

| Tabela                  | Situação           | Ação       |
| ----------------------- | ------------------ | ---------- |
| `jobs`                  | 🟢 Banco já atende | Reutilizar |
| `applications`          | 🟢 Banco já atende | Reutilizar |
| `candidates`            | 🟢 Banco já atende | Reutilizar |
| `recruitment_processes` | 🟢 Banco já atende | Reutilizar |
| `recruitment_stages`    | 🟢 Banco já atende | Reutilizar |

### 3.3 RH

| Tabela                 | Situação           | Ação       |
| ---------------------- | ------------------ | ---------- |
| `employees`            | 🟢 Banco já atende | Reutilizar |
| `employee_experiences` | 🟢 Banco já atende | Reutilizar |
| `employee_educations`  | 🟢 Banco já atende | Reutilizar |
| `employee_courses`     | 🟢 Banco já atende | Reutilizar |
| `employee_languages`   | 🟢 Banco já atende | Reutilizar |
| `employee_skills`      | 🟢 Banco já atende | Reutilizar |
| `employee_documents`   | 🟢 Banco já atende | Reutilizar |

### 3.4 Financeiro

| Tabela                                | Situação                     | Ação                                     |
| ------------------------------------- | ---------------------------- | ---------------------------------------- |
| `financial_categories`                | 🟢 Banco já atende           | Reutilizar                               |
| `cost_centers`                        | 🟢 Banco já atende           | Reutilizar                               |
| `accounts_receivable`                 | 🟢 Banco já atende           | Reutilizar                               |
| `accounts_payable`                    | 🟢 Banco já atende           | Reutilizar                               |
| `payments`                            | 🟢 Banco já atende           | Reutilizar                               |
| `receipts`                            | 🟢 Banco já atende           | Reutilizar                               |
| `financial_transactions`              | 🟢 Banco já atende           | Reutilizar                               |
| `bank_reconciliations`                | 🟢 Banco já atende           | Reutilizar                               |
| `financial_installments`              | 🟢 Banco já atende           | Reutilizar                               |
| `financial_installment_payments`      | 🟢 Banco já atende           | Reutilizar                               |
| `financial_installment_cancellations` | 🟢 Banco já atende           | Reutilizar                               |
| `financial_accounts`                  | 🟢 Banco já atende           | Reutilizar                               |
| `cash_flows`                          | 🟢 Banco já atende           | Reutilizar                               |
| `invoices`                            | 🟡 Banco atende parcialmente | Verificar relação com Faturamento/Fiscal |
| `invoice_items`                       | 🟡 Banco atende parcialmente | Verificar relação com Faturamento/Fiscal |

### 3.5 Faturamento / PDV

| Tabela                 | Situação           | Ação       |
| ---------------------- | ------------------ | ---------- |
| `pos_terminals`        | 🟢 Banco já atende | Reutilizar |
| `pos_cashiers`         | 🟢 Banco já atende | Reutilizar |
| `pos_operators`        | 🟢 Banco já atende | Reutilizar |
| `pos_cashier_sessions` | 🟢 Banco já atende | Reutilizar |
| `pos_sales`            | 🟢 Banco já atende | Reutilizar |
| `pos_sale_items`       | 🟢 Banco já atende | Reutilizar |
| `pos_payments`         | 🟢 Banco já atende | Reutilizar |
| `pos_cancellations`    | 🟢 Banco já atende | Reutilizar |
| `pos_returns`          | 🟢 Banco já atende | Reutilizar |
| `pos_cash_movements`   | 🟢 Banco já atende | Reutilizar |
| `pos_daily_closures`   | 🟢 Banco já atende | Reutilizar |

### 3.6 Fiscal

| Tabela                           | Situação           | Ação       |
| -------------------------------- | ------------------ | ---------- |
| `fiscal_configurations`          | 🟢 Banco já atende | Reutilizar |
| `tax_rates`                      | 🟢 Banco já atende | Reutilizar |
| `tax_calculations`               | 🟢 Banco já atende | Reutilizar |
| `fiscal_documents`               | 🟢 Banco já atende | Reutilizar |
| `fiscal_document_items`          | 🟢 Banco já atende | Reutilizar |
| `fiscal_document_status_history` | 🟢 Banco já atende | Reutilizar |
| `fiscal_api_requests`            | 🟢 Banco já atende | Reutilizar |
| `fiscal_api_responses`           | 🟢 Banco já atende | Reutilizar |
| `fiscal_document_events`         | 🟢 Banco já atende | Reutilizar |
| `fiscal_integrations`            | 🟢 Banco já atende | Reutilizar |

### 3.7 Contabilidade

| Tabela        | Situação                      | Ação                                                                       |
| ------------- | ----------------------------- | -------------------------------------------------------------------------- |
| Contabilidade | ⚪ Não existe no schema atual | Verificar se há specs/migrations não aplicadas; senão, modelar novo módulo |

### 3.8 Estoque

| Tabela                  | Situação                     | Ação                      |
| ----------------------- | ---------------------------- | ------------------------- |
| `products`              | 🟢 Banco já atende           | Reutilizar                |
| `product_categories`    | 🟢 Banco já atende           | Reutilizar                |
| `warehouses`            | 🟢 Banco já atende           | Reutilizar                |
| `warehouse_locations`   | 🟢 Banco já atende           | Reutilizar                |
| `stock_lots`            | 🟢 Banco já atende           | Reutilizar                |
| `stock_inventory`       | 🟢 Banco já atende           | Reutilizar                |
| `stock_inventory_items` | 🟢 Banco já atende           | Reutilizar                |
| `stock_balances`        | 🟡 Banco atende parcialmente | Verificar estrutura e uso |
| `stock_movements`       | 🟡 Banco atende parcialmente | Verificar estrutura e uso |

### 3.9 Almoxarifado / Compras

| Tabela                         | Situação                     | Ação                |
| ------------------------------ | ---------------------------- | ------------------- |
| `suppliers`                    | 🟢 Banco já atende           | Reutilizar          |
| `purchase_requests`            | 🟢 Banco já atende           | Reutilizar          |
| `purchase_request_items`       | 🟢 Banco já atende           | Reutilizar          |
| `purchase_quotations`          | 🟢 Banco já atende           | Reutilizar          |
| `purchase_quotation_items`     | 🟢 Banco já atende           | Reutilizar          |
| `purchase_orders`              | 🟡 Banco atende parcialmente | Verificar estrutura |
| `purchase_order_items`         | 🟡 Banco atende parcialmente | Verificar estrutura |
| `purchase_receipts`            | 🟡 Banco atende parcialmente | Verificar estrutura |
| `purchase_receipt_items`       | 🟡 Banco atende parcialmente | Verificar estrutura |
| `purchase_receipt_divergences` | 🟡 Banco atende parcialmente | Verificar estrutura |
| `material_issues`              | 🟡 Banco atende parcialmente | Verificar estrutura |
| `material_issue_items`         | 🟡 Banco atende parcialmente | Verificar estrutura |
| `material_returns`             | 🟡 Banco atende parcialmente | Verificar estrutura |
| `material_return_items`        | 🟡 Banco atende parcialmente | Verificar estrutura |
| `third_party_custody`          | 🟡 Banco atende parcialmente | Verificar estrutura |
| `third_party_custody_items`    | 🟡 Banco atende parcialmente | Verificar estrutura |
| `epi_deliveries`               | 🟡 Banco atende parcialmente | Verificar estrutura |
| `epi_delivery_items`           | 🟡 Banco atende parcialmente | Verificar estrutura |
| `epi_returns`                  | 🟡 Banco atende parcialmente | Verificar estrutura |
| `epi_return_items`             | 🟡 Banco atende parcialmente | Verificar estrutura |

### 3.10 Serviços

| Tabela                | Situação                     | Ação                                                                                       |
| --------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| `services`            | 🟢 Banco já atende           | Reutilizar                                                                                 |
| `service_orders`      | 🟡 Banco atende parcialmente | Verificar estrutura completa (cabeçalho, itens, equipe, materiais, EPI, anexos, histórico) |
| `service_order_items` | 🟡 Banco atende parcialmente | Verificar estrutura                                                                        |
| `service_executions`  | 🟡 Banco atende parcialmente | Verificar estrutura                                                                        |
| `service_acceptances` | 🟡 Banco atende parcialmente | Verificar estrutura                                                                        |
| `service_occurrences` | 🟡 Banco atende parcialmente | Verificar estrutura                                                                        |

### 3.11 Suporte

| Tabela                    | Situação           | Ação       |
| ------------------------- | ------------------ | ---------- |
| `support_tickets`         | 🟢 Banco já atende | Reutilizar |
| `support_ticket_messages` | 🟢 Banco já atende | Reutilizar |
| `faq_items`               | 🟢 Banco já atende | Reutilizar |

---

## 4. Permissões confirmadas

### Financeiro

- `finance.dashboard.read`
- `finance.accounts_receivable.read/create/update/delete`
- `finance.accounts_payable.read/create/update/delete`
- `finance.cashflow.read`
- `finance.billing.read/create/update/cancel`
- `finance.collections.read/manage`
- `finance.customers.read`
- `finance.suppliers.read`
- `finance.reports.read/export`

### Fiscal

- `fiscal.dashboard.read`
- `fiscal.invoices.read/issue/cancel/void`
- `fiscal.documents.read`
- `fiscal.taxes.read`
- `fiscal.reports.read/export`

### Contabilidade

- `accounting.dashboard.read`
- `accounting.chart_of_accounts.read/create/update/delete`
- `accounting.entries.read/create/update/delete`
- `accounting.reconciliation.read/manage`
- `accounting.trial_balance.read`
- `accounting.income_statement.read`
- `accounting.balance_sheet.read`
- `accounting.reports.read/export`

### Roles

- `finance_manager`
- `accountant`
- `fiscal`

---

## 5. Classificação por situação

| Situação                     | Quantidade                | Ação                          |
| ---------------------------- | ------------------------- | ----------------------------- |
| 🟢 Banco já atende           | 38 tabelas                | Reutilizar diretamente        |
| 🟡 Banco atende parcialmente | 18 tabelas                | Upgrade / completar estrutura |
| ⚪ Não existe                | 1 domínio (Contabilidade) | Modelar novo módulo           |
| 🔴 Modelo inadequado         | 0                         | —                             |
| 🚫 Não pertence ao domínio   | 0                         | —                             |

---

## 6. Regra de implementação

Depois desse mapa aprovado, cada tabela entrará no Stage completo:

```text
%dados completos da tabela%
 ↓
colunas + tipos + PK/FK + constraints
 ↓
relationships
 ↓
tenant / RLS
 ↓
%roles% / %permissions%
 ↓
Repository
 ↓
Types
 ↓
Dashboard
 ↓
Landing
 ↓
Mini-landing / detalhe
 ↓
Formulário completo
 ↓
CRUD
 ↓
Busca + filtros + paginação
 ↓
EmptyState / ErrorState / NotFound / Unauthorized
 ↓
Sidebar + rota canônica
 ↓
Documentação
 ↓
typecheck + build + eslint
```

**Nada de mock para dado operacional.**
**Nada de inventar campo.**
**Nada de criar tabela sem antes verificar se já existe.**

---

## 7. Pendente

- [ ] Aprovação deste mapa mestre
- [ ] Verificação detalhada das tabelas 🟡 (parciais)
- [ ] Modelagem da Contabilidade, se necessário
- [ ] Definição das roles e permissions finais por módulo
- [ ] Aprovação do fluxo empresarial por domínio
- [ ] Início do Stage 01 Financeiro após aprovação
