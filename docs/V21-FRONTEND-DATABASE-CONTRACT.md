# V21 — Frontend ↔ Database Contract Audit

**Projeto:** J&S Empregos LTDA
**Escopo:** `supabase/specs/sql/*.sql` (commit `7c2aa30`)
**Data:** 2026-08-21
**Tipo:** Relatório de auditoria — **apenas leitura, nenhum código alterado**

---

## 1. Status

**Resultado geral: ⚠️ WARNING**

O esquema expõe um conjunto sólido de tabelas, views e RPCs para o frontend (via PostgREST/Supabase), com RBAC e RLS presentes. Porém, **47 das 162 tabelas não têm Row Level Security habilitado**, incluindo tabelas financeiras e fiscais sensíveis. Isso representa um risco de vazamento cross-tenant e quebra o contrato de isolamento esperado pelo frontend. Há também ausência de RPCs "convenient" que usem `auth.uid()` internamente.

| Métrica                    | Valor                                         |
| -------------------------- | --------------------------------------------- |
| Tabelas criadas            | 162                                           |
| Views expostas             | 2 (`financial_kpis`, `recruitment_kpis`)      |
| Tabelas com RLS habilitado | 115                                           |
| **Tabelas SEM RLS (gap)**  | **47**                                        |
| Funções/RPCs expostas      | ~20 (ver seção 2)                             |
| RPCs de RBAC               | 2 (`user_has_permission`, `user_permissions`) |

---

## 2. Objetos disponíveis para o Frontend

### 2.1 RPCs (funções chamáveis via PostgREST `/rpc/<nome>`)

| Função                                     | Arquivo | Parâmetros                                                                        | Propósito                         | Observação                          |
| ------------------------------------------ | ------- | --------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------- |
| `user_has_permission`                      | 21      | `p_auth_user_id uuid, p_resource text, p_action text, p_tenant_id uuid` → boolean | Verifica permissão pontual        | ⚠️ exige `auth_user_id` manual      |
| `user_permissions`                         | 21      | `p_auth_user_id uuid, p_tenant_id uuid` → setof(resource,action,description)      | Lista permissões do usuário       | ⚠️ exige `auth_user_id` manual      |
| `is_tenant_member(p_tenant_id)`            | 22      | `p_tenant_id uuid` → boolean                                                      | Helper RLS (usa `auth.uid()`)     | Interna, mas exposta                |
| `is_admin_master()`                        | 22      | — → boolean                                                                       | Helper RLS (usa `auth.uid()`)     | Interna, mas exposta                |
| `user_tenant_ids()`                        | 22      | — → setof uuid                                                                    | Tenants do usuário (`auth.uid()`) | Útil ao frontend                    |
| `domain_event_emit(...)`                   | 21      | —                                                                                 | Emissão de eventos de domínio     | Interna (trigger/outbox)            |
| `event_outbox_enqueue(p_event_id)`         | 21      | `p_event_id uuid`                                                                 | Enfileira evento                  | Interna                             |
| `event_outbox_process_next(p_destination)` | 21      | `p_destination text`                                                              | Processa outbox                   | Interna (background)                |
| `validation_upsert(...)`                   | 25      | —                                                                                 | Upsert de validações              | Interna                             |
| `validation_assert(...)`                   | 25      | —                                                                                 | Asserção de validação             | Interna                             |
| `financial_reversal(...)`                  | 27      | —                                                                                 | Reversão financeira               | Negocial                            |
| `pos_daily_closure_validate()`             | 29      | — → boolean                                                                       | Valida fechamento de caixa        | Negocial                            |
| `match_candidates_to_demand(p_demand_id)`  | 35      | `p_demand_id uuid` → setof(candidate_id,score)                                    | Matching de talent pool           | Negocial                            |
| `fiscal_emit_invoice(p_invoice_id)`        | 39      | `p_invoice_id uuid` → void                                                        | Emite NF                          | ⚠️ SEM checagem de tenant/permissão |
| `fiscal_cancel_invoice(p_invoice_id)`      | 39      | `p_invoice_id uuid` → void                                                        | Cancela NF                        | ⚠️ SEM checagem de tenant/permissão |

> Triggers (`set_updated_at`, `audit_log_insert`, `stock_movement_insert`, `purchase_receipt_confirm`, `lgpd_consent_register`, `lgpd_legal_hold_check`) são funções `SECURITY DEFINER` de uso interno e **não devem** ser invocadas diretamente pelo frontend.

### 2.2 Views (acessíveis via `/<view>` — somente leitura)

| View               | Colunas                                                  | Fonte                    |
| ------------------ | -------------------------------------------------------- | ------------------------ |
| `financial_kpis`   | `tenant_id, total_credit, total_debit, balance`          | `financial_transactions` |
| `recruitment_kpis` | `tenant_id, open_demands, closed_demands, total_demands` | `recruitment_demands`    |

### 2.3 Tabelas (acesso CRUD via PostgREST `/<tabela>`)

162 tabelas cobrindo: core (`people`, `tenants`, `tenant_memberships`, `tenant_settings`), RBAC (`roles`, `permissions`, `role_permissions`, `role_assignments`), CRM, RH/Recrutamento, Serviços/Contratos, Fornecedores/Compras, Inventário, Custódia, Tarefas, Suporte, Chat/IA, Notificações, Arquivos/Documentos, Auditoria, LGPD, Funcionários, Financeiro, Fiscal, POS, Automação, Relatórios/Dashboards.

---

## 3. Verificação de RPCs de RBAC

| RPC esperado                                  | Presente? | Avaliação                                                                                   |
| --------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `user_has_permission`                         | ✅ Sim    | OK, mas **obriga o frontend a passar `p_auth_user_id`** (não usa `auth.uid()` internamente) |
| `user_permissions`                            | ✅ Sim    | OK, mesma ressalva acima                                                                    |
| `user_roles` / `current_user_roles`           | ❌ Não    | Ausente — frontend não consegue obter os papéis do usuário logado de forma direta           |
| `current_user_permissions` (usa `auth.uid()`) | ❌ Não    | Ausente — incomoda o consumo no cliente                                                     |
| `user_has_role`                               | ❌ Não    | Ausente (uso de papel direto, não só permissão)                                             |
| `can_access_tenant` (usa `auth.uid()`)        | ❌ Não    | Ausente — frontend precisa filtrar tenant manualmente                                       |

**Conclusão:** Há RPCs RBAC **suficientes para o mínimo** (`user_has_permission` + `user_permissions`), porém **não ergonômicas**: nenhuma usa `auth.uid()` internamente, forçando o cliente a conhecer e propagar seu `auth_user_id`. Recomenda-se adicionar variantes `*_current` que leiam `auth.uid()`.

---

## 4. Problemas de Integração Encontrados

### 🔴 P1 — 47 tabelas sem Row Level Security (vazamento cross-tenant)

Tabelas críticas **sem RLS habilitado**, permitindo que qualquer usuário autenticado leia/escreva dados de outros tenants:

- **Financeiro:** `financial_transactions`, `accounts_receivable`, `accounts_payable`, `payments`, `receipts`, `bank_reconciliations`, `financial_installments` (+ pagamentos/cancelamentos), `financial_categories`, `cost_centers`.
- **Fiscal:** `fiscal_documents`, `fiscal_document_items`, `fiscal_document_status_history`, `fiscal_configurations`, `tax_rates`, `tax_calculations`, `fiscal_api_requests`, `fiscal_api_responses`, `fiscal_document_events`.
- **POS:** `pos_terminals`, `pos_cashiers`, `pos_operators`, `pos_cashier_sessions`, `pos_sales`, `pos_sale_items`, `pos_payments`, `pos_cancellations`, `pos_returns`, `pos_cash_movements`, `pos_daily_closures`.
- **Recrutamento:** `candidate_documents`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`, `candidate_skills`, `candidate_processes`, `application_profile_snapshots`, `interview_participants`, `interview_feedback`, `skills`, `job_skills`, `stage_templates`, `recruitment_processes`, `recruitment_stages`.
- **Outros:** `automation_jobs`, `automation_executions`, `webhook_deliveries`, `validation_results`.

> Impacto no contrato: o frontend **não pode confiar no backend** para isolar tenant; precisaria filtrar `tenant_id` manualmente em todo acesso — frágil e inseguro.

### 🟠 P2 — RPCs fiscais sem checagem de permissão/tenant

`fiscal_emit_invoice` e `fiscal_cancel_invoice` (39_fiscal.sql) são `SECURITY DEFINER` e atualizam `invoices` diretamente **sem validar tenant nem permissão**. Qualquer usuário autenticado pode emitir/cancelar NF de qualquer tenant.

### 🟠 P3 — Views sem `security_invoker`

`financial_kpis` e `recruitment_kpis` são views simples. Sem `WITH (security_invoker = true)` (PostgreSQL 15+), o RLS das tabelas-base pode **não** ser aplicado no contexto do usuário que consulta, expondo KPIs de todos os tenants. O frontend que consome essas views pode ver dados de terceiros.

### 🟡 P4 — RPCs RBAC exigem `auth_user_id` explícito

Como citado na seção 3, `user_has_permission`/`user_permissions` forçam o cliente a passar o id do usuário. Erros de preenchimento permitem checagem de permissão de outra identidade.

### 🟡 P5 — Ausência de RPCs de consulta "do usuário logado"

Não há `current_user_roles`, `current_user_permissions`, `current_user_tenants` (este último existe como helper interno `user_tenant_ids()`). O frontend carece de API limpa para montar menus/UI baseada em papel.

### 🟡 P6 — Funções expostas que são internas

Helpers de trigger/outbox (`domain_event_emit`, `validation_*`, `event_outbox_*`) ficam publicamente chamáveis. Recomenda-se `revoke execute` ou `set` restrito para o rol `anon`/cliente.

---

## 5. Recomendações

1. **Habilitar RLS nas 47 tabelas faltantes** (P1) e criar policies `*_member_*` seguindo o padrão existente (ex.: `is_tenant_member(tenant_id)`). Prioridade máxima para `financial_transactions`, `fiscal_documents`, `pos_sales`.
2. **Adicionar RPCs "current" baseadas em `auth.uid()`**:
   - `current_user_permissions(p_tenant_id)` → wrapper de `user_permissions(auth.uid(), p_tenant_id)`
   - `current_user_has_permission(p_resource, p_action, p_tenant_id)`
   - `current_user_roles(p_tenant_id)`
   - `current_user_tenants()` (expõe `user_tenant_ids()` ao cliente de forma nomeada).
3. **Proteger RPCs fiscais** (P2): dentro de `fiscal_emit_invoice`/`fiscal_cancel_invoice`, validar que a invoice pertence a um tenant do usuário e que este tem permissão (`user_has_permission(auth.uid(),'invoices','update', tenant)`), ou restringir `execute` ao rol de serviço.
4. **Recriar views com isolamento** (P3): `create or replace view ... with (security_invoker = true);` para herdar RLS da tabela-base, ou filtrar por `tenant_id in (select user_tenant_ids())`.
5. **Revogar `execute` de funções internas** (P6) para os roles de cliente (ex.: `revoke execute on function public.domain_event_emit(...) from anon, authenticated;`), mantendo apenas as RPCs de domínio documentadas.
6. **Contrato de API para o frontend**: documentar oficialmente o conjunto de RPCs/views liberadas (whitelist), pois hoje tudo em `public.*` é chamável — o cliente não tem um "contrato" estável e explícito.
7. **Seed/RBAC**: confirmado que `32_seed.sql` popula `roles`, `permissions`, `role_permissions` e `role_assignments` — necessário para que `user_has_permission` retorne resultados. Garantir que o seed rode antes do uso em produção.

---

### Resumo

O esquema é amplo e bem estruturado, com RBAC e RLS em grande parte das tabelas. O contrato frontend↔DB **é utilizável**, mas **não está pronto para produção** enquanto 47 tabelas (incluindo financeiro/fiscal) ficarem sem RLS e enquanto as RPCs de RBAC não usarem `auth.uid()`. Status: **WARNING**.
