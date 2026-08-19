# V21 — Inventory/Custody Reconciliation Matrix

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Status:** READ-ONLY — Draft para aprovação  
**Objetivo:** Matriz final de reconciliação dos domínios Inventory e Custody contra o contrato V2.1, master spec e functional contract.  
**Restrição:** Nenhum arquivo SQL alterado, nenhuma migration executada, Supabase remoto intacto, frontend intacto.

---

## 1. Objetos Inventory

### 1.1 products

| Campo                     | Valor                                                           |
| ------------------------- | --------------------------------------------------------------- |
| Objeto                    | products                                                        |
| Domínio                   | Inventory                                                       |
| Tipo                      | TABLE                                                           |
| Arquivo atual             | 07_inventory_custody.sql                                        |
| Arquivo backup            | 11_inventory.sql                                                |
| Origem                    | Backup canônico 11_inventory.sql                                |
| Status                    | PRESENT — versão simplificada; reconciliar com backup           |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                 |
| FK                        | Nenhuma                                                         |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)          |
| Colunas obrigatórias      | `id`, `tenant_id`, `name`, `status`, `created_at`, `updated_at` |
| Colunas ausentes no atual | `sku`, `description`, `unit`, `min_stock`, `updated_by`         |
| Constraints               | `status CHECK (status IN ('active','inactive','discontinued'))` |
| Auditoria                 | `created_at`, `updated_at`, `created_by`, `updated_by`          |
| Eventos emitidos          | `stock.product_created`, `stock.product_updated`                |
| Relacionamento Purchasing | `purchase_order_items.product_id`                               |
| Relacionamento Custody    | `third_party_custody_items.product_id`                          |
| Relacionamento Finance    | `invoice_items.product_id`                                      |
| RLS necessária            | ✅ Tenant-scoped; admin_master bypass                           |
| Riscos concorrência       | Baixo; updates por função SECURITY DEFINER                      |
| Observação                | Versão atual faltam campos importantes do backup                |

### 1.2 product_categories

| Campo                     | Valor                                                  |
| ------------------------- | ------------------------------------------------------ |
| Objeto                    | product_categories                                     |
| Domínio                   | Inventory                                              |
| Tipo                      | TABLE                                                  |
| Arquivo atual             | Ausente                                                |
| Arquivo backup            | 11_inventory.sql                                       |
| Origem                    | Backup canônico 11_inventory.sql                       |
| Status                    | MISSING — RESTORE_FROM_BACKUP                          |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`        |
| FK                        | `parent_category_id → product_categories(id)`          |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`) |
| Colunas obrigatórias      | `id`, `tenant_id`, `name`, `created_at`, `updated_at`  |
| Constraints               | `parent_category_id self-reference`                    |
| Auditoria                 | `created_at`, `updated_at`                             |
| Eventos emitidos          | `stock.category_created`, `stock.category_updated`     |
| Relacionamento Purchasing | Indireto via `products.category`                       |
| Relacionamento Custody    | Indireto via `products.category`                       |
| Relacionamento Finance    | Indireto via `invoice_items`                           |
| RLS necessária            | ✅ Tenant-scoped                                       |
| Riscos concorrência       | Baixo; hierarquia limitada                             |

### 1.3 warehouses

| Campo                     | Valor                                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| Objeto                    | warehouses                                                                 |
| Domínio                   | Inventory                                                                  |
| Tipo                      | TABLE                                                                      |
| Arquivo atual             | Ausente                                                                    |
| Arquivo backup            | 11_inventory.sql                                                           |
| Origem                    | Backup canônico 11_inventory.sql                                           |
| Status                    | MISSING — RESTORE_FROM_BACKUP                                              |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                            |
| FK                        | Nenhuma                                                                    |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                     |
| Colunas obrigatórias      | `id`, `tenant_id`, `name`, `address`, `status`, `created_at`, `updated_at` |
| Constraints               | `status CHECK (status IN ('active','inactive','maintenance'))`             |
| Auditoria                 | `created_at`, `updated_at`                                                 |
| Eventos emitidos          | `stock.warehouse_created`, `stock.warehouse_updated`                       |
| Relacionamento Purchasing | Recebimento em warehouse                                                   |
| Relacionamento Custody    | Indireto via `products`                                                    |
| Relacionamento Finance    | Custo por warehouse                                                        |
| RLS necessária            | ✅ Tenant-scoped                                                           |
| Riscos concorrência       | Baixo                                                                      |

### 1.4 warehouse_locations

| Campo                     | Valor                                                                 |
| ------------------------- | --------------------------------------------------------------------- |
| Objeto                    | warehouse_locations                                                   |
| Domínio                   | Inventory                                                             |
| Tipo                      | TABLE                                                                 |
| Arquivo atual             | Ausente                                                               |
| Arquivo backup            | 11_inventory.sql                                                      |
| Origem                    | Backup canônico 11_inventory.sql                                      |
| Status                    | MISSING — RESTORE_FROM_BACKUP                                         |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                       |
| FK                        | `warehouse_id → warehouses(id)`                                       |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                |
| Colunas obrigatórias      | `id`, `tenant_id`, `warehouse_id`, `code`, `created_at`, `updated_at` |
| Constraints               | `code UNIQUE(tenant_id, warehouse_id, code)`                          |
| Auditoria                 | `created_at`, `updated_at`                                            |
| Eventos emitidos          | `stock.location_created`, `stock.location_updated`                    |
| Relacionamento Purchasing | Recebimento em location                                               |
| Relacionamento Custody    | Indireto                                                              |
| Relacionamento Finance    | Custo por location                                                    |
| RLS necessária            | ✅ Tenant-scoped                                                      |
| Riscos concorrência       | Baixo                                                                 |

### 1.5 stock_balances

| Campo                     | Valor                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Objeto                    | stock_balances                                                                                                                                  |
| Domínio                   | Inventory                                                                                                                                       |
| Tipo                      | TABLE                                                                                                                                           |
| Arquivo atual             | Ausente                                                                                                                                         |
| Arquivo backup            | 11_inventory.sql                                                                                                                                |
| Origem                    | Backup canônico 11_inventory.sql                                                                                                                |
| Status                    | MISSING — RESTORE_FROM_BACKUP                                                                                                                   |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                                                                                 |
| FK                        | `product_id → products(id)`, `warehouse_id → warehouses(id)`, `location_id → warehouse_locations(id)`                                           |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                                                                          |
| Colunas obrigatórias      | `id`, `tenant_id`, `product_id`, `warehouse_id`, `location_id`, `quantity`, `reserved_quantity`, `last_movement_at`, `created_at`, `updated_at` |
| Constraints               | `uq_stock_balance_product_warehouse_location (product_id, warehouse_id, location_id)`                                                           |
| Auditoria                 | `created_at`, `updated_at`                                                                                                                      |
| Eventos emitidos          | `stock.balance_updated`                                                                                                                         |
| Relacionamento Purchasing | Atualizado por `stock_entries`                                                                                                                  |
| Relacionamento Custody    | Indireto                                                                                                                                        |
| Relacionamento Finance    | Custo médio                                                                                                                                     |
| RLS necessária            | ✅ Tenant-scoped                                                                                                                                |
| Riscos concorrência       | **ALTO** — concorrência em atualização de saldo; usar função SECURITY DEFINER                                                                   |

### 1.6 stock_movements

| Campo                     | Valor                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Objeto                    | stock_movements                                                                                                                                        |
| Domínio                   | Inventory                                                                                                                                              |
| Tipo                      | TABLE                                                                                                                                                  |
| Arquivo atual             | 07_inventory_custody.sql                                                                                                                               |
| Arquivo backup            | 11_inventory.sql                                                                                                                                       |
| Origem                    | Backup canônico 11_inventory.sql                                                                                                                       |
| Status                    | PRESENT — versão simplificada; reconciliar com backup                                                                                                  |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                                                                                        |
| FK                        | `product_id → products(id)`, `warehouse_id → warehouses(id)`                                                                                           |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                                                                                 |
| Colunas obrigatórias      | `id`, `tenant_id`, `product_id`, `warehouse_id`, `type`, `quantity`, `unit_cost`, `document_type`, `document_id`, `notes`, `occurred_at`, `created_at` |
| Constraints               | `type CHECK (type IN ('entry','exit','adjustment','transfer','loss'))`                                                                                 |
| Auditoria                 | `created_at`, `actor_person_id`, `correlation_id`, `document_type`, `document_id`                                                                      |
| Eventos emitidos          | `stock.entry_created`, `stock.exit_created`, `stock.adjusted`, `stock.transferred`, `stock.loss_recorded`                                              |
| Relacionamento Purchasing | `purchase_orders`, `purchase_receipts`                                                                                                                 |
| Relacionamento Custody    | Indireto via `products`                                                                                                                                |
| Relacionamento Finance    | Custo médio, `accounts_payable`                                                                                                                        |
| RLS necessária            | ✅ Tenant-scoped; append-only                                                                                                                          |
| Riscos concorrência       | Baixo; append-only                                                                                                                                     |
| Observação                | Versão atual faltam `warehouse_id`, `type`, `unit_cost`, `document_type`, `document_id`, `occurred_at`                                                 |

### 1.7 stock_entries

| Campo                     | Valor                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Objeto                    | stock_entries                                                                                                                               |
| Domínio                   | Inventory                                                                                                                                   |
| Tipo                      | TABLE                                                                                                                                       |
| Arquivo atual             | Ausente                                                                                                                                     |
| Arquivo backup            | 11_inventory.sql                                                                                                                            |
| Origem                    | Backup canônico 11_inventory.sql                                                                                                            |
| Status                    | MISSING — RESTORE_FROM_BACKUP                                                                                                               |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                                                                             |
| FK                        | `product_id → products(id)`, `warehouse_id → warehouses(id)`, `supplier_id → suppliers(id)`                                                 |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                                                                      |
| Colunas obrigatórias      | `id`, `tenant_id`, `product_id`, `warehouse_id`, `quantity`, `unit_cost`, `supplier_id`, `received_at`, `notes`, `created_at`, `updated_at` |
| Constraints               | `quantity > 0`                                                                                                                              |
| Auditoria                 | `created_at`, `updated_at`, `actor_person_id`                                                                                               |
| Eventos emitidos          | `stock.entry_created`                                                                                                                       |
| Relacionamento Purchasing | Direto via `purchase_order_items` → `suppliers`                                                                                             |
| Relacionamento Custody    | Indireto                                                                                                                                    |
| Relacionamento Finance    | Custo médio, `accounts_payable`                                                                                                             |
| RLS necessária            | ✅ Tenant-scoped                                                                                                                            |
| Riscos concorrência       | Baixo                                                                                                                                       |

### 1.8 stock_exits

| Campo                     | Valor                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objeto                    | stock_exits                                                                                                                                                                      |
| Domínio                   | Inventory                                                                                                                                                                        |
| Tipo                      | TABLE                                                                                                                                                                            |
| Arquivo atual             | Ausente                                                                                                                                                                          |
| Arquivo backup            | 11_inventory.sql                                                                                                                                                                 |
| Origem                    | Backup canônico 11_inventory.sql                                                                                                                                                 |
| Status                    | MISSING — RESTORE_FROM_BACKUP                                                                                                                                                    |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                                                                                                                  |
| FK                        | `product_id → products(id)`, `warehouse_id → warehouses(id)`                                                                                                                     |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                                                                                                           |
| Colunas obrigatórias      | `id`, `tenant_id`, `product_id`, `warehouse_id`, `quantity`, `unit_cost`, `reason`, `requested_by_person_id`, `approved_by_person_id`, `occurred_at`, `created_at`, `updated_at` |
| Constraints               | `quantity > 0`                                                                                                                                                                   |
| Auditoria                 | `created_at`, `updated_at`, `actor_person_id`, `reason`                                                                                                                          |
| Eventos emitidos          | `stock.exit_created`                                                                                                                                                             |
| Relacionamento Purchasing | Indireto                                                                                                                                                                         |
| Relacionamento Custody    | Indireto                                                                                                                                                                         |
| Relacionamento Finance    | Custo médio                                                                                                                                                                      |
| RLS necessária            | ✅ Tenant-scoped                                                                                                                                                                 |
| Riscos concorrência       | Baixo                                                                                                                                                                            |

### 1.9 stock_inventory

| Campo                     | Valor                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Objeto                    | stock_inventory                                                                                              |
| Domínio                   | Inventory                                                                                                    |
| Tipo                      | TABLE                                                                                                        |
| Arquivo atual             | Ausente                                                                                                      |
| Arquivo backup            | 11_inventory.sql                                                                                             |
| Origem                    | Backup canônico 11_inventory.sql                                                                             |
| Status                    | MISSING — RESTORE_FROM_BACKUP                                                                                |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                                              |
| FK                        | `warehouse_id → warehouses(id)`                                                                              |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                                       |
| Colunas obrigatórias      | `id`, `tenant_id`, `warehouse_id`, `type`, `status`, `started_at`, `finished_at`, `created_at`, `updated_at` |
| Constraints               | `status CHECK (status IN ('draft','in_progress','closed','cancelled'))`                                      |
| Auditoria                 | `created_at`, `updated_at`, `actor_person_id`                                                                |
| Eventos emitidos          | `stock.inventory_started`, `stock.inventory_closed`                                                          |
| Relacionamento Purchasing | Indireto                                                                                                     |
| Relacionamento Custody    | Indireto                                                                                                     |
| Relacionamento Finance    | Ajuste de valor                                                                                              |
| RLS necessária            | ✅ Tenant-scoped                                                                                             |
| Riscos concorrência       | Médio; concorrência em contagem física                                                                       |

### 1.10 stock_inventory_items

| Campo                     | Valor                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Objeto                    | stock_inventory_items                                                                                                                           |
| Domínio                   | Inventory                                                                                                                                       |
| Tipo                      | TABLE                                                                                                                                           |
| Arquivo atual             | Ausente                                                                                                                                         |
| Arquivo backup            | 11_inventory.sql                                                                                                                                |
| Origem                    | Backup canônico 11_inventory.sql                                                                                                                |
| Status                    | MISSING — RESTORE_FROM_BACKUP                                                                                                                   |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                                                                                 |
| FK                        | `stock_inventory_id → stock_inventory(id)`, `product_id → products(id)`                                                                         |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                                                                          |
| Colunas obrigatórias      | `id`, `tenant_id`, `stock_inventory_id`, `product_id`, `counted_quantity`, `system_quantity`, `difference`, `notes`, `created_at`, `updated_at` |
| Constraints               | Nenhuma adicional                                                                                                                               |
| Auditoria                 | `created_at`, `updated_at`                                                                                                                      |
| Eventos emitidos          | `stock.inventory_item_counted`                                                                                                                  |
| Relacionamento Purchasing | Indireto                                                                                                                                        |
| Relacionamento Custody    | Indireto                                                                                                                                        |
| Relacionamento Finance    | Ajuste de valor                                                                                                                                 |
| RLS necessária            | ✅ Tenant-scoped                                                                                                                                |
| Riscos concorrência       | Baixo                                                                                                                                           |

### 1.11 stock_adjustments

| Campo                     | Valor                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objeto                    | stock_adjustments                                                                                                                                 |
| Domínio                   | Inventory                                                                                                                                         |
| Tipo                      | TABLE                                                                                                                                             |
| Arquivo atual             | Ausente                                                                                                                                           |
| Arquivo backup            | 11_inventory.sql                                                                                                                                  |
| Origem                    | Backup canônico 11_inventory.sql                                                                                                                  |
| Status                    | MISSING — RESTORE_FROM_BACKUP                                                                                                                     |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                                                                                   |
| FK                        | `product_id → products(id)`, `warehouse_id → warehouses(id)`                                                                                      |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                                                                            |
| Colunas obrigatórias      | `id`, `tenant_id`, `product_id`, `warehouse_id`, `type`, `quantity`, `reason`, `approved_by_person_id`, `occurred_at`, `created_at`, `updated_at` |
| Constraints               | `type CHECK (type IN ('gain','loss','correction'))`                                                                                               |
| Auditoria                 | `created_at`, `updated_at`, `actor_person_id`, `reason`                                                                                           |
| Eventos emitidos          | `stock.adjusted`                                                                                                                                  |
| Relacionamento Purchasing | Indireto                                                                                                                                          |
| Relacionamento Custody    | Indireto                                                                                                                                          |
| Relacionamento Finance    | Custo médio                                                                                                                                       |
| RLS necessária            | ✅ Tenant-scoped                                                                                                                                  |
| Riscos concorrência       | Baixo                                                                                                                                             |

---

## 2. Objetos Custody

### 2.1 third_party_custody

| Campo                     | Valor                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| Objeto                    | third_party_custody                                                                         |
| Domínio                   | Custody                                                                                     |
| Tipo                      | TABLE                                                                                       |
| Arquivo atual             | 07_inventory_custody.sql + 12_custody.sql                                                   |
| Arquivo backup            | 12_custody.sql                                                                              |
| Origem                    | Backup canônico 12_custody.sql                                                              |
| Status                    | DUPLICATED — fonte única é 12_custody.sql                                                   |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                             |
| FK                        | `tenant_id → tenants(id)`, `company_id → companies(id)`                                     |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                      |
| Colunas obrigatórias      | `id`, `tenant_id`, `company_id`, `status`, `expected_return_at`, `created_at`, `updated_at` |
| Constraints               | `status CHECK (status IN ('open','returned','partially_returned','closed'))`                |
| Auditoria                 | `created_at`, `updated_at`                                                                  |
| Eventos emitidos          | `custody.created`, `custody.returned`                                                       |
| Relacionamento Purchasing | Indireto via `companies`                                                                    |
| Relacionamento Custody    | N/A                                                                                         |
| Relacionamento Finance    | Indireto via `companies`                                                                    |
| RLS necessária            | ✅ Tenant-scoped                                                                            |
| Riscos concorrência       | Baixo                                                                                       |
| Observação                | Remover duplicidade em 07_inventory_custody.sql                                             |

### 2.2 third_party_custody_items

| Campo                     | Valor                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Objeto                    | third_party_custody_items                                                                                  |
| Domínio                   | Custody                                                                                                    |
| Tipo                      | TABLE                                                                                                      |
| Arquivo atual             | 07_inventory_custody.sql + 12_custody.sql                                                                  |
| Arquivo backup            | 12_custody.sql                                                                                             |
| Origem                    | Backup canônico 12_custody.sql                                                                             |
| Status                    | DUPLICATED — fonte única é 12_custody.sql                                                                  |
| PK                        | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                                            |
| FK                        | `tenant_id → tenants(id)`, `custody_id → third_party_custody(id)`, `product_id → products(id)`             |
| tenant_id                 | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                                     |
| Colunas obrigatórias      | `id`, `tenant_id`, `custody_id`, `product_id`, `quantity`, `returned_quantity`, `created_at`, `updated_at` |
| Constraints               | `quantity > 0`, `returned_quantity <= quantity`                                                            |
| Auditoria                 | `created_at`, `updated_at`                                                                                 |
| Eventos emitidos          | `custody.item_added`, `custody.item_returned`                                                              |
| Relacionamento Purchasing | Indireto via `products`                                                                                    |
| Relacionamento Custody    | Direto via `custody_id`                                                                                    |
| Relacionamento Finance    | Indireto via `companies`                                                                                   |
| RLS necessária            | ✅ Tenant-scoped                                                                                           |
| Riscos concorrência       | Baixo                                                                                                      |
| Observação                | Remover duplicidade em 07_inventory_custody.sql                                                            |

---

## 3. Objetos Purchasing relacionados

### 3.1 suppliers

| Campo                    | Valor                                                                 |
| ------------------------ | --------------------------------------------------------------------- |
| Objeto                   | suppliers                                                             |
| Domínio                  | Purchasing                                                            |
| Tipo                     | TABLE                                                                 |
| Arquivo atual            | 06_suppliers_purchasing.sql                                           |
| Arquivo backup           | 10_suppliers.sql                                                      |
| Origem                   | Canônico atual                                                        |
| Status                   | PRESENT                                                               |
| PK                       | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                       |
| FK                       | `tenant_id → tenants(id)`, `company_id → companies(id)`               |
| tenant_id                | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                |
| Colunas obrigatórias     | `id`, `tenant_id`, `company_id`, `status`, `created_at`, `updated_at` |
| Constraints              | `status CHECK (status IN ('active','inactive','suspended'))`          |
| Auditoria                | `created_at`, `updated_at`                                            |
| Eventos emitidos         | `purchase.supplier_created`                                           |
| Relacionamento Inventory | `stock_entries.supplier_id`                                           |
| Relacionamento Custody   | Indireto via `companies`                                              |
| Relacionamento Finance   | `accounts_payable`                                                    |
| RLS necessária           | ✅ Tenant-scoped                                                      |
| Riscos concorrência      | Baixo                                                                 |

### 3.2 purchase_orders

| Campo                    | Valor                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Objeto                   | purchase_orders                                                                                                          |
| Domínio                  | Purchasing                                                                                                               |
| Tipo                     | TABLE                                                                                                                    |
| Arquivo atual            | 06_suppliers_purchasing.sql                                                                                              |
| Arquivo backup           | 13_purchasing.sql                                                                                                        |
| Origem                   | Canônico atual                                                                                                           |
| Status                   | PRESENT                                                                                                                  |
| PK                       | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                                                          |
| FK                       | `tenant_id → tenants(id)`, `supplier_id → suppliers(id)`                                                                 |
| tenant_id                | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                                                   |
| Colunas obrigatórias     | `id`, `tenant_id`, `supplier_id`, `number`, `status`, `order_date`, `expected_delivery_date`, `created_at`, `updated_at` |
| Constraints              | `status CHECK (status IN ('draft','approved','ordered','partially_received','received','cancelled'))`                    |
| Auditoria                | `created_at`, `updated_at`, `actor_person_id`                                                                            |
| Eventos emitidos         | `purchase.order_created`, `purchase.order_cancelled`                                                                     |
| Relacionamento Inventory | `stock_entries` via recebimento                                                                                          |
| Relacionamento Custody   | Indireto via `companies`                                                                                                 |
| Relacionamento Finance   | `accounts_payable`, `purchase_invoices`                                                                                  |
| RLS necessária           | ✅ Tenant-scoped                                                                                                         |
| Riscos concorrência      | Baixo                                                                                                                    |

### 3.3 purchase_order_items

| Campo                    | Valor                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Objeto                   | purchase_order_items                                                                                                                           |
| Domínio                  | Purchasing                                                                                                                                     |
| Tipo                     | TABLE                                                                                                                                          |
| Arquivo atual            | 06_suppliers_purchasing.sql                                                                                                                    |
| Arquivo backup           | 13_purchasing.sql                                                                                                                              |
| Origem                   | Canônico atual                                                                                                                                 |
| Status                   | PRESENT                                                                                                                                        |
| PK                       | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`                                                                                                |
| FK                       | `tenant_id → tenants(id)`, `purchase_order_id → purchase_orders(id)`, `product_id → products(id)`                                              |
| tenant_id                | Sim (`tenant_id uuid NOT NULL REFERENCES tenants(id)`)                                                                                         |
| Colunas obrigatórias     | `id`, `tenant_id`, `purchase_order_id`, `product_id`, `quantity`, `unit_price`, `total_price`, `received_quantity`, `created_at`, `updated_at` |
| Constraints              | `quantity > 0`, `received_quantity <= quantity`                                                                                                |
| Auditoria                | `created_at`, `updated_at`                                                                                                                     |
| Eventos emitidos         | `purchase.item_added`, `purchase.item_received`                                                                                                |
| Relacionamento Inventory | Gera `stock_entries` no recebimento                                                                                                            |
| Relacionamento Custody   | Indireto                                                                                                                                       |
| Relacionamento Finance   | Custo de entrada                                                                                                                               |
| RLS necessária           | ✅ Tenant-scoped                                                                                                                               |
| Riscos concorrência      | Baixo                                                                                                                                          |

---

## 4. Matriz consolidada de relacionamentos

| Objeto Inventory      | Purchasing                      | Custody                   | Finance                       | Eventos                                         |
| --------------------- | ------------------------------- | ------------------------- | ----------------------------- | ----------------------------------------------- |
| products              | purchase_order_items            | third_party_custody_items | invoice_items                 | stock.product_created                           |
| product_categories    | Indireto                        | Indireto                  | Indireto                      | stock.category_created                          |
| warehouses            | Recebimento                     | Indireto                  | Custo por warehouse           | stock.warehouse_created                         |
| warehouse_locations   | Recebimento                     | Indireto                  | Custo por location            | stock.location_created                          |
| stock_balances        | Atualizado por entries          | Indireto                  | Custo médio                   | stock.balance_updated                           |
| stock_movements       | Origem: purchase_orders         | Indireto                  | Custo médio                   | stock.entry_created, stock.exit_created         |
| stock_entries         | Direto via purchase_order_items | Indireto                  | Custo médio, accounts_payable | stock.entry_created                             |
| stock_exits           | Indireto                        | Indireto                  | Custo médio                   | stock.exit_created                              |
| stock_inventory       | Indireto                        | Indireto                  | Ajuste de valor               | stock.inventory_started, stock.inventory_closed |
| stock_inventory_items | Indireto                        | Indireto                  | Ajuste de valor               | stock.inventory_item_counted                    |
| stock_adjustments     | Indireto                        | Indireto                  | Custo médio                   | stock.adjusted                                  |

---

## 5. Regras de estoque invariantes

| Regra          | Descrição                                               | Implementação                                     |
| -------------- | ------------------------------------------------------- | ------------------------------------------------- |
| Ledger-first   | Nenhum UPDATE direto em saldo                           | Função SECURITY DEFINER `create_stock_movement()` |
| Saldo derivado | `quantity = SUM(stock_movements.quantity)`              | Trigger ou função recalcula                       |
| Reserva        | `reserved_quantity` para pedidos/vendas não confirmadas | `reserve_stock()` / `release_reservation()`       |
| Bloqueio       | `blocked_quantity` para qualidade/avaliação             | `block_stock()` / `unblock_stock()`               |
| Custo médio    | Recalculado após cada entrada                           | `recalculate_average_cost()`                      |
| Lote/validade  | Obrigatório para itens controlados                      | `stock_lots` + `stock_balances`                   |
| Transferência  | Gera duas movimentações                                 | `transfer_stock()`                                |
| Ajuste         | Gera movimentação `adjustment` com motivo               | `adjust_stock()`                                  |
| Perda          | Gera movimentação `loss` auditada                       | `record_loss()`                                   |

---

## 6. Riscos de concorrência

| Objeto          | Risco                                      | Mitigação                                                      |
| --------------- | ------------------------------------------ | -------------------------------------------------------------- |
| stock_balances  | ALTO — múltiplas movimentações simultâneas | Função SECURITY DEFINER com locking (`SELECT ... FOR UPDATE`)  |
| stock_movements | BAIXO — append-only                        | Nenhuma mitigação especial                                     |
| stock_entries   | MÉDIO — recebimento concorrente            | Idempotência por `purchase_order_id + item_id + received_at`   |
| stock_exits     | MÉDIO — saída concorrente                  | Reserva prévia via `reserve_stock()`                           |
| stock_inventory | MÉDIO — contagem física concorrente        | Status `in_progress` bloqueia movimentações no mesmo warehouse |
| products        | BAIXO                                      | Nenhuma mitigação especial                                     |

---

## 7. RLS necessária

### 7.1 Padrão canônico

```text
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

### 7.2 Roles específicas

| Role                 | Escopo | Acesso Inventory/Custody               |
| -------------------- | ------ | -------------------------------------- |
| `admin_master`       | Global | Todos os tenants                       |
| `tenant_admin`       | Tenant | Administração                          |
| `inventory_manager`  | Tenant | CRUD completo em Inventory/Custody     |
| `purchasing_manager` | Tenant | CRUD em Purchasing + leitura Inventory |
| `rh_manager`         | Tenant | Leitura Inventory/Custody              |
| `finance`            | Tenant | Leitura Inventory/Custody              |
| `pos_operator`       | Tenant | Leitura Inventory (PDV)                |

### 7.3 Políticas esperadas

| Operação | Inventory                             | Custody             | Purchasing          |
| -------- | ------------------------------------- | ------------------- | ------------------- |
| SELECT   | tenant members                        | tenant members      | tenant members      |
| INSERT   | inventory_manager, purchasing_manager | inventory_manager   | purchasing_manager  |
| UPDATE   | inventory_manager via função          | inventory_manager   | purchasing_manager  |
| DELETE   | Apenas admin_master                   | Apenas admin_master | Apenas admin_master |

---

## 8. Auditoria esperada

| Objeto                    | Campos obrigatórios                                                                                             | Tipo            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------- |
| stock_movements           | actor_person_id, tenant_id, action, entity_type, entity_id, before_data, after_data, created_at, correlation_id | Append-only     |
| stock_balances            | created_at, updated_at                                                                                          | Estado derivado |
| stock_entries             | actor_person_id, tenant_id, created_at, updated_at                                                              | Transacional    |
| stock_exits               | actor_person_id, tenant_id, created_at, updated_at                                                              | Transacional    |
| stock_adjustments         | actor_person_id, tenant_id, reason, created_at, updated_at                                                      | Transacional    |
| stock_inventory           | actor_person_id, tenant_id, created_at, updated_at                                                              | Transacional    |
| third_party_custody       | actor_person_id, tenant_id, created_at, updated_at                                                              | Transacional    |
| third_party_custody_items | actor_person_id, tenant_id, created_at, updated_at                                                              | Transacional    |
| purchase_orders           | actor_person_id, tenant_id, created_at, updated_at                                                              | Transacional    |
| purchase_order_items      | actor_person_id, tenant_id, created_at, updated_at                                                              | Transacional    |

---

## 9. Eventos de domínio consolidados

| Evento                        | Origem                       | Consumidor                    |
| ----------------------------- | ---------------------------- | ----------------------------- |
| `stock.entry_created`         | stock_entries                | n8n → notificação, financeiro |
| `stock.exit_created`          | stock_exits                  | n8n → notificação, PDV        |
| `stock.adjusted`              | stock_adjustments            | n8n → notificação             |
| `stock.transferred`           | stock_transfers              | n8n → notificação             |
| `stock.inventory_started`     | stock_inventory              | n8n → tarefa                  |
| `stock.inventory_closed`      | stock_inventory              | n8n → notificação             |
| `stock.low_stock`             | Rule engine                  | n8n → notificação + tarefa    |
| `stock.expiry_alert`          | Rule engine                  | n8n → notificação             |
| `stock.loss_recorded`         | stock_movements (loss)       | n8n → notificação             |
| `custody.created`             | third_party_custody          | n8n → notificação             |
| `custody.item_returned`       | third_party_custody_items    | n8n → notificação             |
| `purchase.order_created`      | purchase_orders              | n8n → notificação             |
| `purchase.receipt_created`    | purchase_receipts            | n8n → estoque, financeiro     |
| `purchase.receipt_divergence` | purchase_receipt_divergences | n8n → tarefa                  |

---

## 10. Decisões arquiteturais

| #   | Decisão                                              | Justificativa                                                 |
| --- | ---------------------------------------------------- | ------------------------------------------------------------- |
| 1   | `stock_movements` é fonte da verdade                 | Ledger imutável; saldo derivado                               |
| 2   | `stock_balances` é estado derivado                   | Evita UPDATE casual; recalculado por função                   |
| 3   | Custody separado de Inventory                        | Decisão 16: produtos em posse de terceiros não baixam estoque |
| 4   | Purchasing integrado com estoque via `stock_entries` | Recebimento gera entrada automática                           |
| 5   | PDV fora do V2.1                                     | Sem evidência no contrato/backup/build spec                   |
| 6   | Almoxarifado integrado a Inventory                   | `warehouses`, `warehouse_locations`, `stock_transfers`        |
| 7   | Financeiro separado de Inventory                     | Regras fiscais diferentes; separação de responsabilidades     |
| 8   | RLS por função SECURITY DEFINER                      | Evita exposição direta; centraliza regras                     |
| 9   | Eventos via domain_events + outbox                   | n8n consome; banco não executa integrações externas           |
| 10  | Idempotência por chave                               | Evita duplicação em recebimentos, pagamentos, vendas          |

---

## 11. Gaps restantes

| Objeto                | Gap                          | Ação                                                 |
| --------------------- | ---------------------------- | ---------------------------------------------------- |
| products              | Versão simplificada no atual | RECONCILE — atualizar para versão completa do backup |
| stock_movements       | Versão simplificada no atual | RECONCILE — atualizar para versão completa do backup |
| third_party_custody*  | Duplicado em 07 e 12         | REMOVE_DUPLICATE — manter apenas em 12               |
| stock_balances        | Ausente                      | RESTORE_FROM_BACKUP                                  |
| stock_entries         | Ausente                      | RESTORE_FROM_BACKUP                                  |
| stock_exits           | Ausente                      | RESTORE_FROM_BACKUP                                  |
| stock_inventory       | Ausente                      | RESTORE_FROM_BACKUP                                  |
| stock_inventory_items | Ausente                      | RESTORE_FROM_BACKUP                                  |
| stock_adjustments     | Ausente                      | RESTORE_FROM_BACKUP                                  |
| product_categories    | Ausente                      | RESTORE_FROM_BACKUP                                  |
| warehouses            | Ausente                      | RESTORE_FROM_BACKUP                                  |
| warehouse_locations   | Ausente                      | RESTORE_FROM_BACKUP                                  |
| stock_transfers       | Ausente no backup            | DESIGN — criar conforme functional contract          |
| stock_lots            | Ausente no backup            | DESIGN — criar conforme functional contract          |
| stock_cost_history    | Ausente no backup            | DESIGN — criar conforme functional contract          |

---

## 12. Próximos passos

1. Aprovar esta matriz de reconciliação.
2. Remover duplicidade de custódia em `07_inventory_custody.sql`.
3. Reconciliar `products` e `stock_movements` com versão completa do backup.
4. Restaurar objetos ausentes do backup (11_inventory.sql).
5. Projetar `stock_transfers`, `stock_lots`, `stock_cost_history` conforme functional contract.
6. Implementar Functions/Triggers/RLS no gate transversal.
7. Só então prosseguir para D.16.

---

## 13. Confirmação de gates aprovados

| Gate | Domínio    | Resultado |
| ---- | ---------- | --------- |
| D.12 | Custody    | PASS      |
| D.13 | Purchasing | PASS      |
| D.14 | Tasks      | PASS      |
| D.15 | Support    | PASS      |

---

**Checkpoint:**

- Nenhum arquivo alterado.
- Nenhuma migration executada.
- Supabase remoto não alterado.
- Frontend não alterado.
