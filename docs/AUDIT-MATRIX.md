# Matriz Factual — Auditoria de Domínios

**Projeto:** `Evandro-J-O-Andrade/jstercerizados`
**Supabase:** `okxqfyoqbhcmflpurfrw`
**Data:** 2026-08-29

## Classificação

- 🟢 **PRESERVAR** — já funciona, não mexer
- 🟡 **UPGRADE** — existe, mas está incompleto/fraco
- 🔴 **CORRIGIR** — existe, mas há erro real
- ⚪ **IMPLEMENTAR** — não existe ou é apenas placeholder

---

## Matriz Consolidada

| Domínio       | Banco real | Canonical V2.1 | RLS/RBAC | Repository | CRUD | Forms | Página/Rota | Registry | Classificação  |
| ------------- | ---------- | -------------- | -------- | ---------- | ---- | ----- | ----------- | -------- | -------------- |
| Candidatos    | ✅         | ✅             | ✅       | ✅         | ✅   | ✅    | ✅          | ✅       | 🟢 PRESERVAR   |
| RH            | ✅         | ✅             | ✅       | ✅         | ✅   | 🟡    | 🔴          | ✅       | 🟡 UPGRADE     |
| CRM           | ❌         | ❌             | ❌       | ❌         | ❌   | ❌    | 🟡          | 🟡       | 🟡 UPGRADE     |
| Empresas      | ✅         | ✅             | ✅       | 🟡         | 🔴   | ❌    | 🟡          | 🟡       | 🔴 CORRIGIR    |
| Serviços      | ❌         | ❌             | ❌       | 🟡         | 🔴   | ❌    | 🟡          | 🟡       | 🔴 CORRIGIR    |
| Estoque       | ❌         | ❌             | ❌       | 🟡         | 🔴   | ❌    | 🟡          | 🟡       | 🔴 CORRIGIR    |
| Almoxarifado  | ❌         | ❌             | ❌       | 🟡         | 🔴   | ❌    | 🟡          | 🟡       | 🔴 CORRIGIR    |
| Faturamento   | ❌         | ❌             | ❌       | 🟡         | 🔴   | ❌    | 🟡          | 🟡       | 🔴 CORRIGIR    |
| Financeiro    | 🟡         | 🟡             | 🔴       | 🟡         | 🟡   | ❌    | 🟡          | 🟡       | 🟡 UPGRADE     |
| Fiscal        | ❌         | 🟡             | ❌       | 🟡         | 🔴   | ❌    | 🟡          | 🟡       | 🔴 CORRIGIR    |
| Contabilidade | ❌         | ❌             | ❌       | 🟡         | 🔴   | ❌    | 🟡          | 🟡       | 🔴 CORRIGIR    |
| Relatórios    | 🟡         | 🟡             | 🟡       | ❌         | 🟡   | 🟡    | 🟡          | 🟢       | 🟡 UPGRADE     |
| Suporte       | 🟡         | 🟡             | 🟡       | 🟡         | 🟡   | 🟡    | 🟡          | 🟡       | 🟡 UPGRADE     |
| Manutenção    | ❌         | ❌             | ❌       | ❌         | ❌   | ❌    | ❌          | ❌       | ⚪ IMPLEMENTAR |
| PDV           | ❌         | 🟡             | ❌       | ❌         | ❌   | ❌    | ❌          | ❌       | ⚪ IMPLEMENTAR |
| IA            | ❌         | ❌             | ❌       | ❌         | ❌   | ❌    | 🟡          | 🟡       | ⚪ IMPLEMENTAR |
| Integrações   | ❌         | ❌             | ❌       | ❌         | ❌   | ❌    | 🟡          | 🟡       | ⚪ IMPLEMENTAR |

---

## Legenda

| Símbolo | Significado                        |
| ------- | ---------------------------------- |
| ✅      | Existe e é funcional               |
| 🟡      | Existe parcialmente ou é funcional |
| 🔴      | Existe mas está quebrado           |
| ❌      | Não existe                         |
| 🔎      | Em auditoria / não confirmado      |

---

## Evidências Factuais por Domínio

### 🟢 PRESERVAR

#### Candidatos

- **Banco real**: `candidates`, `candidate_skills`, `candidate_education`, `candidate_experiences`, `candidate_languages`, `candidate_documents`, `candidate_preferences`, `candidate_profile_views`, `job_matches`, `applications`, `application_status_history` — todas em `supabase/migrations/20260816000400_candidates.sql`, `20260816000600_applications.sql`, `20260816001100_talent_pool.sql`
- **V2.1**: Specs em `supabase/specs/sql/04_rh_recruitment.sql`
- **RLS/RBAC**: RLS ativo em todas as tabelas com policies tenant-scoped
- **Repository**: `src/repositories/candidates.repository.ts`, `applications.repository.ts`, `talent-pool.repository.ts`
- **CRUD**: Create/read/update/delete reais via Supabase
- **Forms**: `src/pages/TrabalheConosco.tsx` (zod + react-hook-form), `src/components/forms/JobApplicationForm.tsx`
- **Página/Rota**: `/dashboard/candidatos`, `/dashboard/candidatos/:id`, `/dashboard/candidatos/habilidades`, etc.
- **Registry**: `ModuleRegistry.ts` — módulo `recrutamento` com features `candidatos`, `candidatos-habilidades`, etc.

---

### 🟡 UPGRADE

#### RH

- **Banco real**: `employees`, `employee_documents`, `employee_education`, `employee_experiences`, `employee_skills`, `employee_languages`, `employee_courses` — `supabase/migrations/20260827000100_employees.sql`
- **V2.1**: `supabase/specs/sql/33_employees.sql`
- **RLS/RBAC**: RLS ativo em todas as 7 tabelas com policies tenant-scoped
- **Repository**: `src/repositories/employees.repository.ts` + 6 sub-repositories
- **CRUD**: Create/read/update/delete reais via Supabase
- **Forms**: Inline nos componentes de página, sem schema validation (HTML5 required apenas)
- **Página/Rota**: 🔴 Key mismatch — `MODULE_PAGE_MAP` mapeia `rh: 'RhPage'`, mas `PAGE_COMPONENTS` tem `DashboardRhPage`. `/dashboard/rh` renderiza `ComingSoonPage`
- **Registry**: ✅ Módulo `rh` com features `dashboard-rh`, `funcionarios`, `experiencias`, `formacao`, `cursos`, `idiomas`, `habilidades`, `documentos-rh`

#### CRM

- **Banco real**: ❌ Sem tabelas `leads`, `opportunities`, `pipeline` em migrations. Apenas `companies` existe.
- **V2.1**: ❌ Sem correspondência em `supabase/specs/sql/03_crm.sql`
- **RLS/RBAC**: ❌ Sem RLS para entidades CRM
- **Repository**: ❌ Sem `LeadsRepository`, `OpportunitiesRepository`, `PipelineRepository`
- **CRUD**: ❌ Sem operações de persistência
- **Forms**: ❌ Sem formulários CRM
- **Página/Rota**: 🟡 `ClientesPage.tsx` existe (read-only companies), `RelatorioCrmPage.tsx` existe. Sem rotas para `/dashboard/crm`, `/dashboard/clientes/leads`, etc.
- **Registry**: 🟡 Módulo `crm` registrado com features `dashboard-crm`, `leads`, `prospects`, `pipeline`, `clientes-ativos`, `relacionamentos`

#### Financeiro

- **Banco real**: 🟡 7 tabelas em `20260827001200_finance.sql`: `accounts_payable`, `accounts_receivable`, `cash_flows`, `bank_accounts`, `cost_centers`, `payments`, `receipts`
- **V2.1**: 🟡 Specs em `supabase/specs/sql/27_finance.sql`
- **RLS/RBAC**: 🔴 Nenhuma das 7 tabelas tem RLS habilitado
- **Repository**: 🟡 13 repositórios existem, mas alguns (`financial-transaction`, `invoice`, `financial-installment`, `financial-category`, `financial-account`, `bank-reconciliation`) queryam tabelas não migradas
- **CRUD**: 🟡 Create/read/update/delete reais para as 7 tabelas migradas; quebrado para entidades não migradas
- **Forms**: ❌ Sem formulários reais (apenas modal inline com `parseFloat` + `alert`)
- **Página/Rota**: 🟡 `FinanceiroPage.tsx`, `FluxoDeCaixaPage.tsx`, `ContasReceberPage.tsx` + rotas funcionais
- **Registry**: 🟡 Módulo `financeiro` com features `contas-pagar`, `contas-receber`, `fluxo-caixa`, `bancos`, `centro-custos`

#### Relatórios

- **Banco real**: ❌ Sem tabelas `reports`, `report_templates`, `report_executions` em migrations. Apenas agregação read-only de outros domínios.
- **V2.1**: 🟡 Tipos existem em `src/types/database.ts` (linhas 1717-1742)
- **RLS/RBAC**: ❌ Sem RLS para entidades de relatório
- **Repository**: ❌ Sem `reports.repository.ts`
- **CRUD**: 🟡 Read-only aggregation de outros domínios; sem persistência própria
- **Forms**: ❌ Sem formulários
- **Página/Rota**: 🟡 `Relatorios.tsx` + 10 sub-pages; rotas funcionais
- **Registry**: 🟡 Módulo `relatorios` registrado; `MODULE_PERMISSION_MAP` usa `domain_events.read`, mas rotas usam `reports.read` (divergência)

#### Suporte

- **Banco real**: ❌ Sem tabelas `support_tickets`, `support_ticket_messages`, `support_faqs` em migrations
- **V2.1**: 🟡 Specs em `supabase/specs/sql/14b_support_tickets.sql`
- **RLS/RBAC**: ❌ Sem RLS para suporte
- **Repository**: 🟡 `src/repositories/support.repository.ts` com CRUD completo, mas sem tabelas
- **CRUD**: 🟡 Repository implementado; dashboard read-only; forms são `alert()` placeholders ou webhook externo (n8n)
- **Forms**: 🟡 `src/pages/Suporte.tsx` (form público com validação, persiste via n8n)
- **Página/Rota**: 🟡 Dashboard `/dashboard/suporte` (read-only) + pública `/suporte`
- **Registry**: 🟡 Módulo `suporte` com features `chamados`, `faq`, `feedback`, `solicitacoes` (todas `coming_soon`)

---

### 🔴 CORRIGIR

#### Empresas

- **Banco real**: ✅ Tabelas `companies`, `company_types`, `company_relationship_types`, `company_relationships`, `company_contacts` em `20260816000300_companies.sql`
- **V2.1**: ✅ `supabase/specs/sql/34_crm_services.sql` (relacionamentos)
- **RLS/RBAC**: ✅ RLS ativo em todas as 5 tabelas com policies tenant-scoped
- **Repository**: 🟡 `src/repositories/companies.repository.ts` existe, mas CRUD quebrado: querya `.eq('tenant_id', ...)` em tabela `companies` que **não tem `tenant_id`** (é global, scoped via `company_relationships`)
- **CRUD**: 🔴 Create/update/delete quebrados por coluna inexistente; apenas read parcial funciona
- **Forms**: ❌ Sem forms de dashboard CRUD; apenas `CadastroEmpresa.tsx` (público)
- **Página/Rota**: 🟡 Páginas existem mas com queries quebradas
- **Registry**: 🟡 Módulos `empresas`, `relacionamentos`, `clientes` registrados

#### Serviços

- **Banco real**: ❌ Sem tabelas `services`, `service_orders`, `service_executions` em migrations
- **V2.1**: ❌ Sem correspondência em `supabase/specs/sql/05_services_contracts.sql`
- **RLS/RBAC**: ❌ Sem RLS
- **Repository**: 🟡 `src/repositories/services.repository.ts` com CRUD implementado, mas sem tabelas
- **CRUD**: 🔴 Repository existe, mas tabelas não existem → runtime error
- **Forms**: ❌ Forms são `alert('Formulário de novo serviço')` placeholders
- **Página/Rota**: 🟡 `Servicos.tsx` + rotas funcionais, mas com actions quebradas
- **Registry**: 🟡 Módulo `servicos` registrado

#### Estoque

- **Banco real**: ❌ Sem tabelas `products`, `stock_movements` em migrations
- **V2.1**: ❌ Sem correspondência em `supabase/specs/sql/36_inventory.sql`
- **RLS/RBAC**: ❌ Sem RLS
- **Repository**: 🟡 `src/repositories/stock.repository.ts` com CRUD implementado, mas sem tabelas
- **CRUD**: 🔴 Repository existe, mas tabelas não existem → runtime error
- **Forms**: ❌ Forms são `alert('Formulário de novo produto')` placeholders
- **Página/Rota**: 🟡 `Estoque.tsx` + rota funcional, mas com actions quebradas
- **Registry**: 🟡 Módulo `estoque` registrado

#### Almoxarifado

- **Banco real**: ❌ Sem tabelas `warehouses`, `warehouse_entries`, `warehouse_issues`, `warehouse_returns`, `warehouse_custodies`, `epis` em migrations
- **V2.1**: ❌ Sem correspondência em specs
- **RLS/RBAC**: ❌ Sem RLS
- **Repository**: 🟡 `src/repositories/warehouse.repository.ts` com CRUD implementado, mas sem tabelas
- **CRUD**: 🔴 Repository existe, mas tabelas não existem → runtime error
- **Forms**: ❌ Forms são `alert()` placeholders
- **Página/Rota**: 🟡 `Almoxarifado.tsx` + rota funcional, mas com actions quebradas
- **Registry**: 🟡 Módulo `almoxarifado` registrado

#### Faturamento

- **Banco real**: ❌ Sem tabelas `invoices`, `sales`, `quotes` em migrations
- **V2.1**: ❌ Sem correspondência em specs
- **RLS/RBAC**: ❌ Sem RLS
- **Repository**: 🟡 `src/repositories/billing.repository.ts` e `invoice.repository.ts` com CRUD implementado, mas sem tabelas
- **CRUD**: 🔴 Repository existe, mas tabelas não existem → runtime error
- **Forms**: ❌ Forms são `alert()` placeholders
- **Página/Rota**: 🟡 `FaturamentoPage.tsx` + rota funcional, mas com actions quebradas
- **Registry**: 🟡 Módulo `faturamento` registrado

#### Fiscal

- **Banco real**: ❌ Sem tabelas `fiscal_documents`, `fiscal_configurations` em migrations
- **V2.1**: 🟡 Specs em `supabase/specs/sql/39_fiscal.sql`
- **RLS/RBAC**: ❌ Sem RLS
- **Repository**: 🟡 `src/repositories/fiscal.repository.ts` com CRUD implementado, mas sem tabelas
- **CRUD**: 🔴 Repository existe, mas tabelas não existem → página sempre em ErrorState
- **Forms**: ❌ Forms são `alert()` placeholders
- **Página/Rota**: 🟡 `FiscalPage.tsx` + rota funcional, mas sempre em ErrorState
- **Registry**: 🟡 Módulo `fiscal` registrado

#### Contabilidade

- **Banco real**: ❌ Sem tabelas `accounting_entries`, `chart_of_accounts` em migrations
- **V2.1**: ❌ Sem correspondência em specs
- **RLS/RBAC**: ❌ Sem RLS
- **Repository**: 🟡 `src/repositories/accounting.repository.ts` com CRUD implementado, mas sem tabelas
- **CRUD**: 🔴 Repository existe, mas tabelas não existem → página sempre em ErrorState
- **Forms**: ❌ Forms são `alert()` placeholders
- **Página/Rota**: 🟡 `ContabilidadePage.tsx` + rota funcional, mas sempre em ErrorState
- **Registry**: 🟡 Módulo `contabilidade` registrado

---

### ⚪ IMPLEMENTAR

#### Manutenção

- **Banco real**: ❌ Sem tabelas `maintenance_requests`, `work_orders`
- **V2.1**: ❌ Sem specs
- **RLS/RBAC**: ❌
- **Repository**: ❌ Sem `maintenance.repository.ts`
- **CRUD**: ❌
- **Forms**: ❌
- **Página/Rota**: ❌ Sem página, sem rota
- **Registry**: ❌ Sem entrada em ModuleRegistry

#### PDV

- **Banco real**: ❌ Sem tabelas `pos_sessions`, `pos_orders`, `pos_payments`, etc.
- **V2.1**: 🟡 Spec em `supabase/specs/sql/29_pos.sql` (não migrado)
- **RLS/RBAC**: ❌
- **Repository**: ❌
- **CRUD**: ❌
- **Forms**: ❌
- **Página/Rota**: ❌
- **Registry**: ❌

#### IA

- **Banco real**: ❌ Sem tabelas `ai_prompts`, `automations`
- **V2.1**: ❌
- **RLS/RBAC**: ❌
- **Repository**: ❌
- **CRUD**: ❌
- **Forms**: ❌
- **Página/Rota**: 🟡 `IaPage.tsx` existe mas é placeholder estático
- **Registry**: 🟡 Módulo `ia` registrado (features `assistente`, `automacoes` como `coming_soon`)

#### Integrações

- **Banco real**: ❌ Sem tabelas `integrations`, `webhooks`, `api_keys`
- **V2.1**: ❌
- **RLS/RBAC**: ❌
- **Repository**: ❌
- **CRUD**: ❌
- **Forms**: ❌
- **Página/Rota**: 🟡 `IntegracoesPage.tsx` existe mas é shell estático
- **Registry**: 🟡 Módulo `integracoes` registrado

---

## Blocos de Execução

### A. Não tocar

- **Candidatos** — domínio fully functional, DB/RLS/CRUD/Forms/Rotas/Registry operacionais
- **Funcionalidades comprovadamente funcionais de RH, Empresas (read), etc.**

### B. Upgrade sem reconstrução

- **RH** — consolidar rota `/dashboard/rh` → `DashboardRhPage`, extrair forms inline para schema validation
- **CRM** — expandir `ClientesPage` com leads/opportunities/pipeline, criar migrations correspondentes
- **Financeiro** — habilitar RLS nas 7 tabelas, corrigir repositórios quebrados, criar forms reais
- **Relatórios** — criar tabela `reports` + repositório + RLS, corrigir divergência de permissão
- **Suporte** — migrar tabelas de suporte, habilitar RLS, converter forms placeholders para CRUD real

### C. Correção/implementação

- **Empresas** — corrigir repositório para respeitar escopo global + `company_relationships`
- **Serviços** — criar migrations para `services`, `service_orders`, `service_executions` + RLS + forms
- **Estoque** — criar migrations completas (products, stock_movements, warehouses, etc.) + RLS + forms + scanner/inventory
- **Almoxarifado** — criar migrations para entidades de almoxarifado + RLS + forms
- **Faturamento** — criar migrations para `invoices`, `sales`, `quotes` + RLS + forms
- **Fiscal** — criar migrations para `fiscal_documents`, `fiscal_configurations` + RLS + forms
- **Contabilidade** — criar migrations para `accounting_entries`, `chart_of_accounts` + RLS + forms
- **Manutenção** — implementar completo (DB + RLS + Repository + Forms + Página + Rota + Registry)
- **PDV** — migrar spec `29_pos.sql` + habilitar RLS + implementar CRUD + UI
- **IA** — definir schema + implementar CRUD + conectar MCP/n8n
- **Integrações** — definir schema + implementar CRUD + UI de gestão

---

## Regras de Execução

1. **Nenhuma migration, exclusão, rename ou alteração de código deve ser executada nesta etapa.**
2. **Primeiro fechamos o inventário factual; depois usamos essa matriz como baseline para o TDD + rollback por domínio.**
3. **Trabalho em vertical slices:** um domínio → banco → segurança → backend → CRUD → UI → testes → validação → só então próximo domínio.
4. **Antes de cada migration:** reconciliar com `V2.1-BASELINE-DEFINITIVE.sql` + schema real do Supabase para evitar duplicar entidades.
5. **Não criar telas isoladas:** cada módulo deve nascer completo (Schema → Migration → Constraints → Indexes → RLS → Functions/Triggers → Repository → Types → Service → Form → CRUD → Loading → Empty state → Error state → Feedback → Audit → RBAC → TDD → Rollback → UI/UX).
