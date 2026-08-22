# V2.1 Post-Implementation Audit — Synthesis Gate

**Checkpoint:** `7c2aa30`  
**Branch:** `feat/database-v21-local-rebuild`  
**Data:** 2026-08-21  
**Modo:** READ-ONLY — auditoria

---

## Status Final dos Gates

| Gate                           | Status | Bloqueia produção? |
| ------------------------------ | ------ | ------------------ |
| READY FOR SUPABASE             | **NO** | ✅ Sim             |
| READY FOR RUNTIME              | **NO** | ✅ Sim             |
| READY FOR FRONTEND INTEGRATION | **NO** | ✅ Sim             |

---

## Resumo Executivo

A implementação das 16 fases produziu um schema amplo (162 tabelas, 2 views, ~20 RPCs), mas a auditoria pós-implementação identificou **falhas estruturais e de segurança que impedem a promoção para Supabase/runtime/produção**.

### Problemas Críticos (impedem deploy)

| #   | Problema                                                                                                        | Impacto                                            | Arquivo(s)                                                |
| --- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| 1   | **Duplicidade `service_orders`**: definida em `05` e `34` com schemas incompatíveis                             | Erro de execução SQL; dados corrompidos            | `05_services_contracts.sql`, `34_crm_services.sql`        |
| 2   | **Duplicidade `support_tickets`**: definida em `15` e `40` com schemas incompatíveis                            | Erro de execução SQL; dados corrompidos            | `15_support.sql`, `40_tasks_support.sql`                  |
| 3   | **FK quebrada por ordem de execução**: `06` referencia `products(id)` que só existe em `07`                     | Migration falha na ordem atual                     | `06_suppliers_purchasing.sql`, `07_inventory_custody.sql` |
| 4   | **47 tabelas sem RLS**: incluindo `financial_transactions`, `fiscal_documents`, `pos_sales`                     | Vazamento cross-tenant; isolamento quebrado        | Diversos                                                  |
| 5   | **RPCs fiscais sem checagem**: `fiscal_emit_invoice()` e `fiscal_cancel_invoice()` não validam tenant/permissão | Usuário pode emitir/cancelar NF de qualquer tenant | `39_fiscal.sql`                                           |
| 6   | **Views sem `security_invoker`**: `financial_kpis`, `recruitment_kpis` expõem dados de todos os tenants         | Vazamento de dados sensíveis                       | `27_finance.sql`, `35_recruitment_talent_pool.sql`        |

### Problemas de Alta Prioridade (devem ser corrigidos antes de produção)

| #   | Problema                                                                                                    | Impacto                                                            |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 7   | RPCs RBAC exigem `auth_user_id` manual (não usam `auth.uid()`)                                              | Erro de preenchimento permite checar permissão de outra identidade |
| 8   | Nenhuma policy DELETE explícita para tabelas operacionais                                                   | `DELETE` pode não ser controlado por RLS                           |
| 9   | `financial_accounts` não é referenciada por `financial_transactions`, `payments` ou `receipts`              | Contas bancárias não são usadas no fluxo financeiro                |
| 10  | `payments` só existe para `accounts_payable`, não para `accounts_receivable`                                | Falta fluxo de pagamento de contas a receber                       |
| 11  | `invoices` usa `customer_id` referenciando `companies(id)` — não há entidade `customers` separada           | Confusão conceitual cliente vs fornecedor                          |
| 12  | `talent_pool_memberships` e `job_matches` referenciam `people` ao invés de `candidates`                     | Banco de talentos não vinculado a candidatos                       |
| 13  | 7 arquivos ausentes: `08`, `13`, `16`, `17`, `19`, `24`, `38`                                               | Lacunas funcionais potenciais                                      |
| 14  | `employee_positions`, `employee_contracts`, `employee_documents`, `employee_status_history` sem `tenant_id` | Isolamento multi-tenant quebrado para funcionários                 |

### Problemas de Média Prioridade (recomendações)

| #   | Problema                                                                                           | Impacto                                              |
| --- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 15  | Falta RPCs "current_*" baseadas em `auth.uid()`                                                    | Frontend precisa propagar `auth_user_id` manualmente |
| 16  | Tabelas sem `updated_at` ou sem trigger `set_updated_at`                                           | Auditoria de modificação incompleta                  |
| 17  | Falta CHECK constraints em ~80 colunas                                                             | Dados inválidos podem ser inseridos                  |
| 18  | `skills.tenant_id` nullable + UK global permite duplicatas                                         | Dados inconsistentes entre tenants                   |
| 19  | `company_relationships` e `company_contacts` sem `tenant_id`                                       | Isolamento quebrado                                  |
| 20  | `chat_rooms`, `chat_participants`, `chat_messages`, `ai_messages`, `chat_handoffs` sem `tenant_id` | Isolamento quebrado                                  |

---

## Fluxos de Negócio — Status

| Fluxo                                                                          | Status     | Observação                                       |
| ------------------------------------------------------------------------------ | ---------- | ------------------------------------------------ |
| RH: people → employee → department → position → contract                       | ⚠️ WARNING | Funciona, mas employee sem tenant_id direto      |
| Comercial: company → service → order → items → execution → acceptance          | ❌ FAIL    | Duplicidade `service_orders` impede execução     |
| Compras: supplier → request → quotation → PO → receipt → inventory → financial | ⚠️ WARNING | Funciona, mas stock_movements sem FK estruturada |
| Venda: product → POS → payment → stock → fiscal → financial                    | ⚠️ WARNING | Funciona, mas fiscal sem vínculo estruturado     |
| Fiscal: operation → emission → authorization → XML → event → cancellation      | ⚠️ WARNING | Funciona, mas `fiscal_integrations` órfã         |
| Suporte: ticket → category → assignee → message → status → closure             | ❌ FAIL    | Duplicidade `support_tickets` impede execução    |

---

## RLS — Status

| Item                                           | Status                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| RLS habilitado                                 | ⚠️ WARNING (115 de 162 tabelas)                                  |
| Policies SELECT                                | ✅ PASS (115 tabelas)                                            |
| Policies INSERT                                | ⚠️ WARNING (114 tabelas — falta `audit_logs`)                    |
| Policies UPDATE                                | ⚠️ WARNING (~80 tabelas — algumas intencionais, não documentado) |
| Policies DELETE                                | ❌ FAIL (0 tabelas — nenhuma policy explícita)                   |
| search_path em SECURITY DEFINER                | ✅ PASS                                                          |
| `user_has_permission()` / `user_permissions()` | ⚠️ WARNING (existem, mas não usam `auth.uid()`)                  |

---

## Frontend ↔ Database — Status

| Item                         | Status                                                   |
| ---------------------------- | -------------------------------------------------------- |
| Tabelas expostas             | ✅ 162                                                   |
| Views expostas               | ✅ 2 (`financial_kpis`, `recruitment_kpis`)              |
| RPCs expostas                | ⚠️ ~20 (muitas internas expostas)                        |
| RPCs RBAC                    | ⚠️ WARNING (existem, mas exigem `auth_user_id` manual)   |
| Tabelas sem RLS              | ❌ FAIL (47 tabelas — risco cross-tenant)                |
| Views sem `security_invoker` | ❌ FAIL (2 views — vazamento de dados)                   |
| RPCs fiscais sem checagem    | ❌ FAIL (`fiscal_emit_invoice`, `fiscal_cancel_invoice`) |

---

## Recomendações para Correção

### Fase 1 — Bloqueadores (antes de qualquer deploy)

1. **Resolver duplicidades**:
   - `service_orders`: manter definição de `34_crm_services.sql` (mais moderna), remover de `05_services_contracts.sql`
   - `support_tickets`: manter definição de `40_tasks_support.sql` (mais completa), remover de `15_support.sql`

2. **Corrigir ordem de execução**:
   - Mover `products` para antes de `purchase_order_items` ou adicionar FK opcional

3. **Habilitar RLS nas 47 tabelas faltantes**:
   - Prioridade: `financial_transactions`, `fiscal_documents`, `pos_sales`, `accounts_receivable`, `accounts_payable`, `payments`, `receipts`

4. **Adicionar policies DELETE** para tabelas operacionais

5. **Proteger RPCs fiscais**:
   - Adicionar validação de tenant e permissão em `fiscal_emit_invoice()` e `fiscal_cancel_invoice()`

6. **Recriar views com `security_invoker = true`** ou filtrar por `tenant_id`

### Fase 2 — Alta prioridade (antes de produção)

7. Adicionar RPCs `current_*` baseadas em `auth.uid()`
8. Adicionar `tenant_id` em tabelas órfãs (`employee_*`, `chat_*`, etc.)
9. Conectar `financial_accounts` ao fluxo financeiro
10. Adicionar `payments` para `accounts_receivable`
11. Corrigir conceito `customer` vs `company`
12. Vincular `talent_pool` a `candidates`

### Fase 3 — Média prioridade (melhorias contínuas)

13. Adicionar CHECK constraints
14. Padronizar triggers `updated_at`
15. Documentar tabelas sem UPDATE policy
16. Revogar `execute` de funções internas para `anon`/`authenticated`
17. Criar whitelist oficial de RPCs para o frontend

---

## Conclusão

O commit `7c2aa30` representa um avanço significativo na cobertura do schema, mas **não está pronto para Supabase/runtime/frontend** devido a:

- Falhas estruturais que impedem a execução do SQL (duplicidades, FKs quebradas)
- RLS incompleto (47 tabelas expostas)
- RPCs críticas sem validação de segurança
- Views com risco de vazamento cross-tenant

**Próximos passos recomendados:**

1. Aplicar Fase 1 (bloqueadores)
2. Re-auditar após correções
3. Promover para runtime apenas após `READY FOR SUPABASE = YES`
