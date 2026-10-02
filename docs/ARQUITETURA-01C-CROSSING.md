# ARQUITETURA-01C — Cruzamento Página ↕ Tabela ↕ Rota

> Documento gerado por medição direta. Banco lido em modo **read-only**
> (`SET default_transaction_read_only = on`). Nenhuma escrita, nenhuma migration.
> Frontend lido do working tree. Nenhum arquivo de código foi alterado.

- Projeto: `okxqfyoqbhcmflpurfrw`
- Servidor: PostgreSQL 17.6
- Gerado em: 2026-09-30 11:38:49 UTC

---

## 1. Números do banco (verificados agora)

| Objeto          | Total |
| --------------- | ----: |
| Tabelas + views |   226 |
| Colunas         |  2358 |
| Primary keys    |   221 |
| Foreign keys    |   535 |
| Policies (RLS)  |   600 |
| Triggers        |    84 |
| Functions       |   233 |
| Enums           |    15 |
| Índices         |   713 |

**RBAC (confere com o 01B, números exatos):**

- `roles` = **53** · `permissions` = **230** · `role_permissions` = **739**
- `role_assignments` = 37 · `people` = 41 · `tenants` = 3 · `tenant_memberships` = 43

### 1.1 RLS desligado

- `financial_kpis` (view)
- `public_companies_by_type` (view)
- `public_jobs_v1` (view)
- `public_services_v1` (view)
- `recruitment_kpis` (view)

> Todas são views. Views não são protegidas por RLS da mesma forma que tabelas:
> sem `security_invoker`, a view executa com os privilégios do dono.
> `financial_kpis` e `recruitment_kpis` são as que exigem revisão de exposição.

---

## 2. Correção ao 01B — policies permissivas

| Métrica                                  | Informado no 01B | Verificado agora |
| ---------------------------------------- | ---------------: | ---------------: |
| Tabelas com >1 policy PERMISSIVE         |               37 |          **201** |
| Tabelas com policy pública + autenticada |  (não informado) |            **1** |

A discrepância é de **5.4x**. As duas métricas não são
a mesma coisa, mas nenhuma delas produz 37. **O número do 01B precisa ser
reconciliado antes de virar GAP de segurança.** Usar 37 levaria a subnotificar.

---

## 3. `people` como espinha central — confirmado

O banco tem **117 foreign keys apontando para `people`**.
Confirma a decisão de tratar Identity como infraestrutura (`src/app/identity/`)
e não como CRUD de módulo.

| Tabela que referencia `people` | Coluna                       |
| ------------------------------ | ---------------------------- |
| `chat_handoffs`                | from_person_id, to_person_id |
| `legal_acceptances`            | person_id, actor_person_id   |
| `consents`                     | person_id, actor_person_id   |
| `privacy_requests`             | person_id, actor_person_id   |
| `data_export_requests`         | person_id, actor_person_id   |
| `data_deletion_requests`       | person_id, actor_person_id   |
| `candidate_profile_views`      | candidate_id, viewed_by      |
| `pos_cash_movements`           | approved_by, actor_person_id |
| `pos_daily_closures`           | approved_by, actor_person_id |
| `pos_cancellations`            | requested_by, approved_by    |
| `work_order_occurrences`       | reported_by, resolved_by     |
| `service_occurrences`          | reported_by, resolved_by     |
| `tenant_memberships`           | person_id                    |
| `employees`                    | id                           |
| `role_assignments`             | person_id                    |
| `candidates`                   | person_id                    |
| `application_status_history`   | actor_person_id              |
| `contract_status_history`      | actor_person_id              |

_... e mais 87 tabelas._

---

## 4. Cruzamento: página ↕ dado

- Páginas de dashboard importadas pelo `App.tsx`: **62**
- Acessam tabela/RPC real: **51**
- Sem **nenhum** acesso a dados: **11**
- Consultam objeto **inexistente no banco**: **8**

### 4.1 🔴 Objetos consultados que não existem em nenhum schema

Confirmado em `pg_class` varrendo **todos** os schemas. Estas consultas retornam
erro em runtime (`PGRST205`), nãosilenciosamente vazio.

| Página                                   | Objeto inexistente                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Almoxarifado.tsx`                       | `warehouse_entries`, `warehouse_issues`, `warehouse_returns`, `warehouse_custodies`, `epis` |
| `BancosPage.tsx`                         | `bank_accounts`                                                                             |
| `CandidatoPreferencias.tsx`              | `candidate_preferences`                                                                     |
| `ContabilidadePage.tsx`                  | `accounting_entries`, `chart_of_accounts`                                                   |
| `FluxoDeCaixaPage.tsx`                   | `cash_flows`                                                                                |
| `Relatorios.tsx`                         | `cash_flows`, `support_faqs`                                                                |
| `relatorios/RelatorioFinanceiroPage.tsx` | `cash_flows`                                                                                |
| `Suporte.tsx`                            | `support_faqs`                                                                              |

### 4.2 ⚫ Páginas sem nenhum acesso a dados

| Linhas | Página                                      | Leitura                                   |
| -----: | ------------------------------------------- | ----------------------------------------- |
|     84 | `IaPage.tsx`                                | UI sem camada de dados                    |
|     81 | `IntegracoesPage.tsx`                       | UI sem camada de dados                    |
|     45 | `ComingSoonPage.tsx`                        | placeholder de rota                       |
|     26 | `relatorios/RelatorioAlmoxarifadoPage.tsx`  | stub de relatório — 26 linhas, sem lógica |
|     26 | `relatorios/RelatorioContabilidadePage.tsx` | stub de relatório — 26 linhas, sem lógica |
|     26 | `relatorios/RelatorioEstoquePage.tsx`       | stub de relatório — 26 linhas, sem lógica |
|     26 | `relatorios/RelatorioFaturamentoPage.tsx`   | stub de relatório — 26 linhas, sem lógica |
|     26 | `relatorios/RelatorioFiscalPage.tsx`        | stub de relatório — 26 linhas, sem lógica |
|     26 | `relatorios/RelatorioServicosPage.tsx`      | stub de relatório — 26 linhas, sem lógica |
|     26 | `relatorios/RelatorioSuportePage.tsx`       | stub de relatório — 26 linhas, sem lógica |
|     12 | `AssinaturasPage.tsx`                       | quase vazio                               |

### 4.3 Inventário completo

| Página                                      | Tabelas | RPCs | Linhas | Direto no Supabase |
| ------------------------------------------- | ------: | ---: | -----: | ------------------ |
| `Almoxarifado.tsx`                          |      11 |    0 |    769 | via repository     |
| `ApplicationDetailPage.tsx`                 |      12 |    0 |    153 | via repository     |
| `AssinaturasPage.tsx`                       |       0 |    0 |     12 | via repository     |
| `AuditoriaPage.tsx`                         |      12 |    0 |    186 | via repository     |
| `BancoDeTalentos.tsx`                       |      11 |    0 |    650 | via repository     |
| `BancosPage.tsx`                            |      10 |    0 |    113 | via repository     |
| `CandidatoDetalhe.tsx`                      |      10 |    0 |    370 | via repository     |
| `CandidatoDocumentos.tsx`                   |      11 |    0 |    415 | via repository     |
| `CandidatoExperiencias.tsx`                 |      11 |    0 |    432 | via repository     |
| `CandidatoFormacao.tsx`                     |      11 |    0 |    418 | via repository     |
| `CandidatoHabilidades.tsx`                  |      11 |    0 |    399 | via repository     |
| `CandidatoIdiomas.tsx`                      |      11 |    0 |    372 | via repository     |
| `CandidatoPreferencias.tsx`                 |      10 |    0 |    541 | via repository     |
| `Candidatos.tsx`                            |      10 |    0 |    530 | via repository     |
| `CandidatoVisualizacoes.tsx`                |      10 |    0 |    184 | via repository     |
| `Candidaturas.tsx`                          |      14 |    0 |    646 | via repository     |
| `CentroCustosPage.tsx`                      |      11 |    0 |    102 | via repository     |
| `ClientesPage.tsx`                          |      11 |    0 |    165 | 🟣 sim             |
| `ComingSoonPage.tsx`                        |       0 |    0 |     45 | via repository     |
| `CompanyRelationshipsPage.tsx`              |      11 |    0 |    178 | 🟣 sim             |
| `ContabilidadePage.tsx`                     |      10 |    0 |    463 | via repository     |
| `ContasReceberPage.tsx`                     |      11 |    0 |    273 | via repository     |
| `DashboardHome.tsx`                         |      18 |    0 |    146 | via repository     |
| `DocumentosRh.tsx`                          |      12 |    0 |    434 | via repository     |
| `Empresas.tsx`                              |      14 |    0 |    302 | via repository     |
| `Estoque.tsx`                               |      12 |    0 |    130 | via repository     |
| `Etapas.tsx`                                |      12 |    0 |    469 | via repository     |
| `FaturamentoPage.tsx`                       |      14 |    0 |    577 | via repository     |
| `FinanceiroPage.tsx`                        |      10 |    0 |   1681 | via repository     |
| `FiscalPage.tsx`                            |      12 |    0 |    411 | via repository     |
| `FluxoDeCaixaPage.tsx`                      |      11 |    0 |    272 | via repository     |
| `FuncionarioDetalhe.tsx`                    |      12 |    0 |    241 | via repository     |
| `Funcionarios.tsx`                          |      11 |    0 |    449 | via repository     |
| `GestaoSaaSPage.tsx`                        |      11 |    0 |    166 | via repository     |
| `GlobalDashboardPage.tsx`                   |      11 |    0 |    276 | via repository     |
| `IaPage.tsx`                                |       0 |    0 |     84 | via repository     |
| `IntegracoesPage.tsx`                       |       0 |    0 |     81 | via repository     |
| `JobMatches.tsx`                            |      11 |    1 |    218 | 🟣 sim             |
| `NotificationsPage.tsx`                     |      11 |    0 |    139 | via repository     |
| `OnboardingPage.tsx`                        |      10 |    0 |    115 | 🟣 sim             |
| `ProcessosSeletivos.tsx`                    |      13 |    0 |    410 | via repository     |
| `RbacAuditPage.tsx`                         |      10 |    0 |    427 | 🟣 sim             |
| `Relatorios.tsx`                            |      28 |    0 |    422 | via repository     |
| `relatorios/RelatorioAlmoxarifadoPage.tsx`  |       0 |    0 |     26 | via repository     |
| `relatorios/RelatorioContabilidadePage.tsx` |       0 |    0 |     26 | via repository     |
| `relatorios/RelatorioCrmPage.tsx`           |      14 |    0 |    199 | via repository     |
| `relatorios/RelatorioEstoquePage.tsx`       |       0 |    0 |     26 | via repository     |
| `relatorios/RelatorioFaturamentoPage.tsx`   |       0 |    0 |     26 | via repository     |
| `relatorios/RelatorioFinanceiroPage.tsx`    |      13 |    0 |    451 | via repository     |
| `relatorios/RelatorioFiscalPage.tsx`        |       0 |    0 |     26 | via repository     |
| `relatorios/RelatorioRecrutamentoPage.tsx`  |      12 |    0 |    154 | via repository     |
| `relatorios/RelatorioRhPage.tsx`            |      11 |    0 |    151 | via repository     |
| `relatorios/RelatorioServicosPage.tsx`      |       0 |    0 |     26 | via repository     |
| `relatorios/RelatorioSuportePage.tsx`       |       0 |    0 |     26 | via repository     |
| `RolesPermissoesPage.tsx`                   |       2 |    0 |    446 | via repository     |
| `SegurancaPage.tsx`                         |      11 |    0 |    214 | 🟣 sim             |
| `Servicos.tsx`                              |      14 |    0 |    475 | via repository     |
| `SessoesPage.tsx`                           |      11 |    0 |    172 | 🟣 sim             |
| `Suporte.tsx`                               |      12 |    0 |    193 | via repository     |
| `TenantsPage.tsx`                           |      10 |    0 |    358 | via repository     |
| `Vagas.tsx`                                 |      11 |    0 |    714 | via repository     |
| `VisaoGeral.tsx`                            |      16 |    0 |    378 | via repository     |

---

## 5. O banco está mais rico que o Portal — confirmado em números

**170 tabelas do banco não têm nenhum consumidor no frontend.**

| Colunas | Tabela                     |
| ------: | -------------------------- |
|      21 | `media_assets`             |
|      19 | `work_orders`              |
|      17 | `epi_delivery_items`       |
|      16 | `automation_jobs`          |
|      16 | `candidate_job_alerts`     |
|      16 | `data_deletion_requests`   |
|      16 | `event_deliveries`         |
|      16 | `fiscal_document_items`    |
|      16 | `pos_sales`                |
|      16 | `webhook_deliveries`       |
|      15 | `blog_posts`               |
|      15 | `consents`                 |
|      15 | `fiscal_api_requests`      |
|      15 | `global_navigation_links`  |
|      15 | `integration_events`       |
|      15 | `pos_cashier_sessions`     |
|      14 | `automation_executions`    |
|      14 | `data_export_requests`     |
|      14 | `financial_installments`   |
|      14 | `notification_deliveries`  |
|      14 | `privacy_requests`         |
|      14 | `sale_items`               |
|      13 | `bank_reconciliations`     |
|      13 | `calendar_events`          |
|      13 | `candidate_portal_modules` |
|      13 | `payments`                 |
|      13 | `pos_daily_closures`       |
|      13 | `pos_payments`             |
|      13 | `quote_items`              |
|      13 | `receipts`                 |

_... e mais 140 tabelas._

Confirma a tese do 01B: **construir a partir do domínio real do banco**, e não
reorganizar `pages/dashboard` em pastas. Um terço do banco não tem tela.`

## 6. Regra confirmada: tabela ≠ módulo

Os dados sustentam a regra. Exemplo:

- `people` → consumida pelo frontend → pertence a `app/`, não a um card de módulo
- `audit_logs` → consumida pelo frontend → pertence a `app/`, não a um card de módulo
- `notification_deliveries` → **sem tela** → pertence a `app/`, não a um card de módulo
- `role_assignments` → consumida pelo frontend → pertence a `app/`, não a um card de módulo
- `permissions` → consumida pelo frontend → pertence a `app/`, não a um card de módulo
- `sessions` → consumida pelo frontend → pertence a `app/`, não a um card de módulo
- `event_deliveries` → **sem tela** → pertence a `app/`, não a um card de módulo

---

## 7. Lacunas que o 01C precisa decidir (não resolvidas aqui)

1. **11 objetos inexistentes.** Criar tabela ou remover a consulta? Hoje é erro de runtime.
2. **11 páginas sem dado.** São placeholders intencionais (`ComingSoonPage`, stubs de 26 linhas)
   ou funcionalidades prometidas e nunca entregues?
3. **170 tabelas sem tela.** Viram módulo, virar `app/`, ou ficar aguardando?
4. **Policies permissivas.** Reconciliar 37 vs 201 antes de qualquer ação.
5. **Views sem RLS.** `financial_kpis` e `recruitment_kpis` — avaliar `security_invoker`.

Nada foi alterado. Este documento é medição, não decisão.
