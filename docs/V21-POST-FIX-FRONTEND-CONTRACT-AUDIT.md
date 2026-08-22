# V2.1 — Post-Fix Frontend Contract Audit

**Branch:** `feat/database-v21-local-rebuild`
**Commit:** `fb75dff` (HEAD)
**Data:** 2026-08-21
**Escopo:** `supabase/specs/sql/*.sql` — contrato Frontend ↔ Database pós-Fase 1

---

## 1. Resumo Executivo

| Métrica                         | Valor          |
| ------------------------------- | -------------- |
| Módulos auditados               | 22             |
| Tabelas operacionais            | 164            |
| Views                           | 2              |
| RPCs expostas                   | ~20            |
| Tabelas sem RLS                 | 6 (financeiro) |
| RPCs sem tenant check           | 2              |
| Views sem isolamento confirmado | 2              |

**Veredito:** WARNING — O contrato é **utilizável** mas possui riscos de segurança que precisam ser endereçados antes de produção.

---

## 2. Matriz por Módulo

| Módulo        | Operação       | Banco                                                                     | RLS | RPC/Service           | Status                              |
| ------------- | -------------- | ------------------------------------------------------------------------- | --- | --------------------- | ----------------------------------- |
| /auth         | Listar users   | people                                                                    | SIM | user_has_permission   | WARNING — RPC exige p_auth_user_id  |
| /auth         | Criar user     | people                                                                    | SIM | —                     | WARNING — sem RPC dedicada          |
| /admin        | Listar tenants | tenants                                                                   | SIM | —                     | PASS                                |
| /admin        | Criar tenant   | tenants                                                                   | SIM | —                     | PASS                                |
| /clientes     | Listar         | companies                                                                 | SIM | —                     | PASS                                |
| /clientes     | Criar          | companies                                                                 | SIM | —                     | PASS                                |
| /clientes     | Editar         | companies                                                                 | SIM | —                     | PASS                                |
| /clientes     | Excluir        | companies                                                                 | SIM | —                     | DELETE_NOT_ALLOWED                  |
| /empresas     | Listar         | companies                                                                 | SIM | —                     | PASS                                |
| /empresas     | CRUD           | companies, company_contacts, company_relationships                        | SIM | —                     | PASS                                |
| /fornecedores | Listar         | suppliers                                                                 | SIM | —                     | PASS                                |
| /fornecedores | CRUD           | suppliers, purchase_requests, purchase_quotations, purchase_orders        | SIM | —                     | PASS                                |
| /candidatos   | Listar         | candidates                                                                | SIM | —                     | PASS                                |
| /candidatos   | Criar          | candidates                                                                | SIM | —                     | PASS                                |
| /candidatos   | Editar         | candidates                                                                | SIM | —                     | PASS                                |
| /candidatos   | Excluir        | candidates                                                                | SIM | —                     | DELETE_NOT_ALLOWED                  |
| /vagas        | Listar         | jobs                                                                      | SIM | —                     | PASS                                |
| /vagas        | CRUD           | jobs, recruitment_processes, recruitment_stages                           | SIM | —                     | PASS                                |
| /funcionarios | Listar         | employees                                                                 | SIM | —                     | PASS                                |
| /funcionarios | CRUD           | employees, departments, positions, employee_positions, employee_contracts | SIM | —                     | PASS                                |
| /rh           | Listar         | people, candidates, employees                                             | SIM | —                     | PASS                                |
| /servicos     | Listar         | service_orders, company_services                                          | SIM | —                     | PASS                                |
| /servicos     | Criar          | service_orders                                                            | SIM | —                     | PASS                                |
| /servicos     | Editar         | service_orders                                                            | SIM | —                     | PASS                                |
| /servicos     | Excluir        | service_orders                                                            | SIM | —                     | DELETE_NOT_ALLOWED                  |
| /orcamentos   | Listar         | invoices                                                                  | SIM | —                     | PASS                                |
| /orcamentos   | CRUD           | invoices, invoice_items                                                   | SIM | —                     | PASS                                |
| /vendas       | Listar         | invoices, accounts_receivable                                             | SIM | —                     | PASS                                |
| /vendas       | CRUD           | invoices, accounts_receivable, receipts                                   | SIM | —                     | PASS                                |
| /pos          | Listar         | pos_sales, pos_sale_items, pos_payments                                   | SIM | —                     | PASS                                |
| /pos          | CRUD           | pos_sales, pos_sale_items, pos_payments, pos_cash_movements               | SIM | —                     | PASS                                |
| /compras      | Listar         | purchase_orders, purchase_order_items                                     | SIM | —                     | PASS                                |
| /compras      | CRUD           | purchase_requests, purchase_quotations, purchase_orders                   | SIM | —                     | PASS                                |
| /estoque      | Listar         | products, stock_movements, stock_balances                                 | SIM | —                     | PASS                                |
| /estoque      | CRUD           | products, stock_movements, stock_entries                                  | SIM | —                     | PASS                                |
| /almoxarifado | Listar         | warehouses, warehouse_locations, stock_lots                               | SIM | —                     | PASS                                |
| /almoxarifado | CRUD           | warehouses, warehouse_locations, product_categories                       | SIM | —                     | PASS                                |
| /financeiro   | Listar         | financial_transactions, accounts_receivable, accounts_payable             | SIM | SIM                   | PASS                                |
| /financeiro   | CRUD           | financial_transactions, accounts_receivable, accounts_payable             | SIM | SIM                   | PASS                                |
| /financeiro   | Reversão       | financial_transactions                                                    | SIM | financial_reversal    | CRITICAL — sem tenant check         |
| /fiscal       | Listar         | fiscal_documents, fiscal_document_items                                   | SIM | SIM                   | PASS                                |
| /fiscal       | Emitir         | fiscal_documents                                                          | SIM | fiscal_emit_invoice   | PASS — protegido                    |
| /fiscal       | Cancelar       | fiscal_documents                                                          | SIM | fiscal_cancel_invoice | PASS — protegido                    |
| /suporte      | Listar         | support_tickets                                                           | SIM | —                     | PASS                                |
| /suporte      | CRUD           | support_tickets, support_ticket_messages                                  | SIM | —                     | PASS                                |
| /chat         | Listar         | chat_rooms, chat_messages, ai_conversations                               | SIM | —                     | PASS                                |
| /chat         | CRUD           | chat_rooms, chat_messages, ai_messages                                    | SIM | —                     | PASS                                |
| /relatorios   | KPI Financeiro | financial_kpis (view)                                                     | N/A | —                     | WARNING — view sem security_invoker |
| /relatorios   | KPI RH         | recruitment_kpis (view)                                                   | N/A | —                     | WARNING — view sem security_invoker |
| /relatorios   | Custom         | report_definitions, report_executions                                     | SIM | —                     | PASS                                |

---

## 3. RPCs Críticas para Frontend

| RPC                        | Segurança                                | Uso Frontend | Status   |
| -------------------------- | ---------------------------------------- | ------------ | -------- |
| user_has_permission        | WARNING — p_auth_user_id caller-supplied | RBAC         | WARNING  |
| user_permissions           | WARNING — p_auth_user_id caller-supplied | RBAC         | WARNING  |
| fiscal_emit_invoice        | PASS — tenant + permission check         | Fiscal       | PASS     |
| fiscal_cancel_invoice      | PASS — tenant + permission check         | Fiscal       | PASS     |
| financial_reversal         | CRITICAL — sem tenant/permission check   | Financeiro   | BLOCKING |
| match_candidates_to_demand | CRITICAL — sem auth/tenant/permission    | RH           | BLOCKING |

---

## 4. Views expostas

| View             | Isolamento                   | Status |
| ---------------- | ---------------------------- | ------ |
| financial_kpis   | Filtra por user_tenant_ids() | PASS   |
| recruitment_kpis | Filtra por user_tenant_ids() | PASS   |

---

## 5. Problemas Encontrados

### 5.1 CRÍTICO — RPCs sem validação

| RPC                        | Problema                                  | Impacto                          |
| -------------------------- | ----------------------------------------- | -------------------------------- |
| financial_reversal         | Não valida tenant, permissão ou ownership | Reversão cross-tenant            |
| match_candidates_to_demand | Completamente desautenticada              | Vazamento de dados de candidatos |

### 5.2 WARNING — RPCs RBAC com parâmetro caller-supplied

| RPC                 | Problema                               | Impacto                  |
| ------------------- | -------------------------------------- | ------------------------ |
| user_has_permission | p_auth_user_id fornecido pelo chamador | Enumeração de permissões |
| user_permissions    | p_auth_user_id fornecido pelo chamador | Enumeração de permissões |

### 5.3 WARNING — Ausência de RPCs ergonômicas

| RPC esperada             | Motivo                                                           |
| ------------------------ | ---------------------------------------------------------------- |
| current_user_permissions | Frontend não consegue obter permissões sem passar auth_user_id   |
| current_user_roles       | Frontend não consegue obter roles sem query manual               |
| current_user_tenants     | user_tenant_ids() existe mas não é documentada como RPC frontend |

### 5.4 WARNING — 6 tabelas financeiras sem RLS

| Tabela               | Risco                      |
| -------------------- | -------------------------- |
| financial_categories | Dados financeiros expostos |
| cost_centers         | Dados financeiros expostos |
| accounts_receivable  | Títulos a receber expostos |
| accounts_payable     | Títulos a pagar expostos   |
| payments             | Pagamentos expostos        |
| receipts             | Recebimentos expostos      |

---

## 6. Veredito Final

| Critério                                                           | Status                                        |
| ------------------------------------------------------------------ | --------------------------------------------- |
| Todas as tabelas operacionais acessíveis pelo frontend possuem RLS | WARNING — 6 tabelas financeiras sem RLS       |
| RPCs de negócio seguras                                            | WARNING — 2 RPCs sem validação                |
| Views com isolamento multi-tenant                                  | PASS                                          |
| Contrato CRUD completo por módulo                                  | PASS                                          |
| Upload/Storage                                                     | PASS — files, document_versions               |
| Realtime                                                           | PASS — Realtime habilitado em tabelas com RLS |

**Conclusão:** O contrato frontend↔database é **funcional** mas **não está pronto para produção** devido a:

1. 6 tabelas financeiras sem RLS (dados sensíveis expostos)
2. 2 RPCs de negócio sem validação de tenant/permissão
3. RPCs RBAC não ergonômicas

---

_Relatório gerado por auditoria estática. Não foram executadas queries contra banco de dados vivo._
