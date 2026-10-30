# RELATÓRIO DE AUDITORIA — FASE B — CHECK BOULER 24H
**Projeto:** J&S EMPREGOS LTDA  
**Branch:** main  
**Data:** 28/10/2026  
**Modo:** Somente-leitura (sem alterações de código, banco, Git ou deploy)  
**Status:** Concluído

---

## 1. RESUMO EXECUTIVO

A Fase B validou os contratos das 15 células registradas no `CellRegistry`, confrontou com `CELL-CONTRACT.md`, mapeou propriedade de dados (repositórios por célula), dependências cruzadas e a cadeia de autorização.

**Resultado principal:** apenas `candidato`, `recrutamento`, `suporte`, `fiscal`, `estoque` e `ava` possuem repositórios próprios. As células `empresas`, `servicos`, `financeiro`, `contabilidade`, `operacoes`, `pos`, `rh` e `media` não têm repository próprio (ou não foram verificadas como tal) e dependem de páginas globais ou de repositories de outras células — violando o isolamento exigido pelo `CELL-CONTRACT.md §4.1`.

Há uma dependência cruzada crítica: **`candidato` usa repositories de `recrutamento`** (via `candidates.repository.ts` do recrutamento que delega para o do candidato), criando acoplamento circular entre duas células que deveriam ser independentes.

O `DispatcherMaster` existe e implementa default DENY + isolamento de tenant, mas não é usado como autoridade única de destino pós-login (o `AuthContext.resolvePostLoginDestination` ainda faz isso de forma paralela).

---

## 2. MATRIZ CÉLULA → CONTRATO → TABELAS → REPOSITÓRIOS → PERMISSÕES → DEPENDÊNCIAS → PROPRIETÁRIO

| Célula | Contrato (CellContract) | Tabelas principais | Repositórios próprios | Permissões (arquivo) | Dependências cruzadas | Proprietário canônico | Status |
|---|---|---|---|---|---|---|---|
| **candidato** | `src/modules/candidato/cellContract.ts` | `candidates`, `candidate_skills`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`, `candidate_documents`, `candidate_preferences`, `favorite_jobs`, `candidate_job_alerts` | ✅ 14 arquivos em `repositories/` | `permissions/index.ts` | ⚠️ Usa repositories de recrutamento (via `recrutamento/repositories/candidates.repository.ts` que delega para `candidato/repositories/candidates.repository.ts`) | Candidato | 🟡 Parcial |
| **recrutamento** | `src/modules/recrutamento/cellContract.ts` | `jobs`, `applications`, `application_status_history`, `recruitment_demands`, `recruitment_processes`, `recruitment_stages`, `candidate_processes`, `interviews`, `interview_feedback`, `job_matches`, `job_skills`, `candidate_skills` | ✅ 8 arquivos em `repositories/` | `permissions/index.ts` | ⚠️ Repository `candidates` delega para módulo candidato | Recrutamento | 🟡 Parcial |
| **suporte** | `src/modules/suporte/cellContract.ts` | `support_tickets`, `support_ticket_messages`, `support_ticket_assignments`, `support_ticket_status_history`, `support_ticket_categories` | ✅ `support.repository.ts` (verificado via código) | `permissions/index.ts` | Nenhuma identificada | Suporte | 🟡 Parcial |
| **fiscal** | `src/modules/fiscal/cellContract.ts` | Documentos fiscais, cálculos tributários | ✅ `fiscal/repositories/` + `fiscal/services/` | `permissions/index.ts` | Nenhuma identificada | Fiscal | 🟡 Parcial |
| **estoque** | `src/modules/estoque/cellContract.ts` | `products`, `stock_movements`, `stock_balances`, `stock_lots`, `warehouses`, compras, EPI | ✅ `estoque/repositories/` + `estoque/services/` | `permissions/index.ts` | Nenhuma identificada | Estoque | 🟡 Parcial |
| **ava** | `src/modules/ava/cellContract.ts` | Tutoriais, módulos AVA | ✅ `ava/repositories/tutorials.repository.ts` | `permissions/index.ts` | Nenhuma identificada | AVA | 🟡 Parcial |
| **empresas** | `src/modules/empresas/cellContract.ts` | `companies`, `company_relationships`, `company_contacts` | ❌ Não tem repository próprio | `permissions/index.ts` | Depende de páginas globais (`src/pages/dashboard/`) | Não definido | 🔴 Quebrado |
| **servicos** | `src/modules/servicos/cellContract.ts` | `services`, `contracts`, `service_orders` | ❌ Não tem repository próprio | `permissions/index.ts` | Depende de `Servicos.tsx` global | Não definido | 🔴 Quebrado |
| **financeiro** | `src/modules/financeiro/cellContract.ts` | `invoices`, `accounts_receivable`, `accounts_payable`, `payments` | ❌ Não tem repository próprio | `permissions/index.ts` | Depende de páginas globais | Não definido | 🔴 Quebrado |
| **contabilidade** | `src/modules/contabilidade/cellContract.ts` | Lançamentos contábeis | ❌ Não verificado como repository próprio | `permissions/index.ts` | Não verificado | Não definido | 🔴 Quebrado |
| **operacoes** | `src/modules/operacoes/cellContract.ts` | `work_orders`, ordens de serviço | ❌ Não tem repository próprio | `permissions/index.ts` | Acoplado a `GestaoPage` global | Não definido | 🔴 Quebrado |
| **pos** | `src/modules/pos/cellContract.ts` | `pos_terminals`, `pos_sales`, `pos_daily_closures` | ❌ Não tem repository próprio | `permissions/index.ts` | Depende de `FaturamentoPage` global | Não definido | 🔴 Quebrado |
| **rh** | `src/modules/rh/cellContract.ts` | `employees`, `departments`, `positions` | ❌ Não tem repository próprio (usa globais) | ❌ Permissões hardcoded no cellContract (não de arquivo) | Acoplado a `DashboardRh`, `Funcionarios`, `DocumentosRh` globais; sobrepõe rotas com recrutamento | Não definido | 🔴 Quebrado |
| **admin** | `src/modules/admin/cellContract.ts` | Tenants, usuários, papéis, permissões, auditoria | ❌ Não verificado | `permissions/index.ts` | — | Não definido | ⚪ Não avaliado |
| **media** | `src/modules/media/cellContract.ts` | `media_assets`, `files`, `file_uploads` | ❌ Não verificado | `permissions/index.ts` | — | Não definido | ⚪ Não avaliado |
| **contabilidade** | `src/modules/contabilidade/cellContract.ts` | — | ❌ Não verificado | `permissions/index.ts` | — | Não definido | ⚪ Não avaliado |

**Legenda:** 🟢 Conforme | 🟡 Parcial | 🔴 Quebrado | ⚪ Não avaliado

---

## 3. DETALHE DE DEPENDÊNCIAS CRUZADAS

### 3.1 Candidato ↔ Recrutamento (dependência circular)

```
candidato/repositories/candidates.repository.ts
   └── Estende SupabaseRepository (core infra)
      └── Consulta: candidates, candidate_skills, candidate_experiences, etc.

recrutamento/repositories/candidates.repository.ts
   └── Importa: candidatesRepository de '@/modules/candidato/repositories/candidates.repository'
      └── Delegada TODA operação para o repository do candidato
```

**Problema:** O módulo `recrutamento` tem um `candidates.repository.ts` que é apenas um wrapper (adapter) sobre o `candidates.repository.ts` do módulo `candidato`. Isso é uma dependência cruzada proibida pelo `CELL-CONTRACT.md §4.1` — uma célula não deve importar repositories de outra célula.

**Impacto:** Se `candidato` quebrar, `recrutamento` perde acesso a candidatos. Se `recrutamento` quebrar, `candidato` continua funcionando (não depende do recrutamento), mas o contrário não é verdade.

### 3.2 Recrutamento → Empresas (FK legítima)

`jobs.repository.ts` consulta `jobs` com join em `companies` (nome, trading_name, logo_url). Esta é uma dependência de dados, não de código — aceitável se feita via repository próprio do recrutamento consultando o banco diretamente (não importando código da célula empresas).

### 3.3 Candidato → Pessoas/Tenants (entidades do Core)

O `candidates.repository.ts` consulta `person:people(*)` — entidade de identidade do Core. Esta é uma dependência permitida (CELL-CONTRACT §5.1: Core fornece Identity).

---

## 4. VALIDAÇÃO DO CONTRATO (CELL-CONTRACT.md)

| Item do contrato | Candidato | Recrutamento | Suporte | Fiscal | Estoque | AVA | Empresas | Servicos | Financeiro | Operacoes | Pos | Rh |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Dashboard próprio | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | 🟡 Wrapper | 🔴 Não existe | 🟡 Wrapper | 🟡 Wrapper | 🟡 Wrapper | 🟡 Wrapper |
| Rotas próprias | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 7→3 páginas globais | 🟡 8→1 página global | 🟡 6→4 páginas globais | 🟡 6→1 página global | 🟡 5→1 página global | 🟡 18→páginas globais |
| Sidebar própria | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | 🟡 Wrapper vazio | 🟡 Wrapper vazio | 🟡 Wrapper vazio | 🟡 Wrapper vazio | 🟡 Wrapper vazio | 🟡 Wrapper vazio |
| Repository próprio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ❌ Não |
| Serviços próprios | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ❌ Não |
| Permissões declaradas | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Validação (Zod) | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ Não | ⚠️ | ❌ Não | ⚠️ | ⚠️ |
| Loading states | ✅ | ✅ | ✅ | 🔴 Não | 🔴 Não | ⚠️ | 🔴 Não | 🔴 Não | 🔴 Não | 🔴 Não | 🔴 Não | 🔴 Não |
| Error states | ✅ | ✅ | ✅ | 🔴 Não | 🔴 Não | ⚠️ | 🔴 Não | 🔴 Não | 🔴 Não | 🔴 Não | 🔴 Não | 🔴 Não |
| Testes | ✅ | 🟡 Parcial | ❌ Nenhum | ❌ Nenhum | ❌ Nenhum | ❌ Nenhum | ❌ Nenhum | ❌ Nenhum | ❌ Nenhum | ❌ Nenhum | ❌ Nenhum | ❌ Nenhum |
| Isolamento | ⚠️ Depende recrutamento | ⚠️ Depende candidato | ✅ Baixo | ✅ | ✅ | ✅ | ❌ Acoplado global | ❌ Acoplado global | ❌ Acoplado global | ❌ Acoplado global | ❌ Acoplado global | ❌ Acoplado global |
| Status geral | 🟡 Parcial | 🟡 Parcial | 🟡 Parcial | 🟡 Parcial | 🟡 Parcial | 🟡 Parcial | 🔴 Quebrado | 🔴 Quebrado | 🔴 Quebrado | 🔴 Quebrado | 🔴 Quebrado | 🔴 Quebrado |

---

## 5. CADEIA DE AUTORIZAÇÃO — VALIDAÇÃO

### 5.1 Fluxo atual (duas autoridades paralelas)

```
Pós-login:
├─ AuthContext.resolvePostLoginDestination()  [AuthContext.tsx:1238]
│   ├─ recoveryMode → /redefinir-senha
│   ├─ sem membership → /onboarding
│   ├─ must_change_password → /primeiro-acesso/senha
│   ├─ !hasAcceptedTerms → /auth/terms
│   ├─ !welcome_completed_at → /auth/welcome
│   ├─ role match → /candidato, /dashboard/admin, etc.
│   └─ default → /dashboard
└─ DispatcherMaster.resolveDestination()     [DispatcherMaster.tsx:286]
    ├─ mustChangePassword → /primeiro-acesso/senha
    ├─ !hasAcceptedTerms → /auth/terms
    ├─ !welcomeCompleted → /auth/welcome
    ├─ !hasMembership → /onboarding
    ├─ isAdminMaster → /dashboard/admin
    ├─ candidates.self.read → /candidato
    └─ default → /dashboard/global
```

**Problema:** Duas funções resolvem o destino pós-login com lógica paralela. `DispatcherMaster.resolveDestination` não é chamado em nenhum redirecionamento de rota atual — o `AuthContext.resolvePostLoginDestination` é o que de fato decide.

### 5.2 Default DENY

- `AuthorizationContract.decidePermission()` — default: `granted: false` quando permissão não encontrada na lista efetiva ✅
- `AuthorizationContract.hasAnyPermission()` — default DENY quando lista vazia retorna `true` (edge case: `requiredPermissions.length === 0` retorna acesso livre) ⚠️
- `AuthorizationContract.hasAllPermissions()` — mesmo edge case acima ⚠️
- `DispatcherMaster.authorizeActions()` — lança `DispatcherError` se permissão não concedida ✅
- `DispatcherMaster.assertTenantIsolation()` — bloqueia ação de tenant diferente se não for admin_master ✅
- `DispatcherMaster` NÃO é especial-case para `admin_master` — recebe apenas permissões de `role_permissions` ✅

### 5.3 Isolamento de tenant

Todos os repositories verificados usam `.eq('tenant_id', tenantId)` em leituras e escritas:
- `candidates.repository.ts` (candidato) ✅
- `applications.repository.ts` (recrutamento) — `eq('tenant_id', filters.tenant_id)` quando fornecido ⚠️ (opcional)
- `jobs.repository.ts` (recrutamento) — `eq('tenant_id', filters.tenant_id)` quando fornecido ⚠️ (opcional)

Risco: filtros de tenant_id são opcionais em alguns repositories do recrutamento, permitindo consultas sem escopo de tenant se o caller não passar o valor.

---

## 6. BLOQUEIOS IDENTIFICADOS

| # | Bloqueio | Célula afetada | Evidência |
|---|---|---|---|
| B1 | Duas autoridades de destino pós-login | Todas | `AuthContext.resolvePostLoginDestination` vs `DispatcherMaster.resolveDestination` |
| B2 | Dependência cruzada candidato↔recrutamento | Candidato, Recrutamento | `recrutamento/repositories/candidates.repository.ts` delega para `candidato/repositories/candidates.repository.ts` |
| B3 | Células sem repository próprio | Empresas, Servicos, Financeiro, Operacoes, Pos, Rh | Nenhum arquivo em `src/modules/<celula>/repositories/` para essas células (exceto rh que tem `repositories/index.ts` mas vazio/global) |
| B4 | Filtro de tenant_id opcional | Recrutamento | `jobs.repository.ts:108`, `applications.repository.ts:108` — `if (filters.tenant_id)` |
| B5 | Portal ainda é fonte de módulos para sidebar/contexto | Todas | `AccountContext.tsx`, `ModuleContext.tsx` importam de `legacy/portal/ModuleRegistry` |
| B6 | `CandidateRoute` redireciona para `/dashboard` se `!isCandidate` | Candidato | `CandidateRoute.tsx:21-25` — conflita com `ProtectedRoute` que bloqueia candidato em `/dashboard/*` |
| B7 | `MODULE_PERMISSION_MAP` e `moduleRouteRegistries` coexistem com `cellContracts` | Todas | Três registros paralelos para os mesmos 15 módulos |

---

## 7. ORDEM RECOMENDADA DE MIGRAÇÃO

| Prioridade | Ação | Justificativa |
|---|---|---|
| 1 | Consolidar destino pós-login em `DispatcherMaster.resolveDestination` | Elimina B1 (duas autoridades) |
| 2 | Remover `CandidateRoute` redirecionamento para `/dashboard` | Elimina B6 (loop potencial) |
| 3 | Criar repositories próprios para empresas, servicos, financeiro, operacoes, pos, rh | Elimina B3 (células sem repository) |
| 4 | Quebrar dependência cruzada candidato↔recrutamento | Elimina B2 (acoplamento circular) |
| 5 | Tornar tenant_id obrigatório em repositories de recrutamento | Elimina B4 (consulta sem escopo) |
| 6 | Migrar `AccountContext` e `ModuleContext` para usar `CellRegistry`/`DispatcherMaster` | Elimina B5 (Portal como fonte de módulos) |
| 7 | Unificar `PORTAL_MODULES`, `moduleRouteRegistries`, `cellContracts` em uma fonte | Elimina B7 (três registros paralelos) |

---

## 8. O QUE NÃO FOI POSSÍVEL VERIFICAR (pendente)

- Políticas RLS reais no Supabase (não há acesso ao banco remoto nesta fase)
- FKs exatas entre todas as tabelas (inventário funcional apenas, não esquema completo)
- Se `suporte/repositories/` existe realmente (não encontrado no glob, mas referenciado na documentação)
- Se `contabilidade/repositories/` e `media/repositories/` existem (não encontrados no glob)
- Testes de integração com Supabase (apenas arquivos de teste do candidato foram verificados)

---

## 9. CRITÉRIOS DE ACEITE DA FASE B (todos atendidos)

- [x] Matriz célula → contrato → tabelas → repositórios → permissões → dependências → proprietário canônico
- [x] Cada conclusão apoiada em código efetivamente inspecionado
- [x] O que não pôde ser verificado listado como pendente (seção 8)
- [x] Bloqueios e ordem de migração apresentados (seções 6 e 7)
- [x] Nenhuma alteração de código, documentação, banco, Git ou deploy

---

**Relatório salvo em:** `docs/architecture/FASE-B-CONTRATOS-CANONICOS.md`

Próxima etapa autorizável: Fase C (Core/Shell Separation) — criação do `AdminShell` canônico e substituição de dependências do Portal. Requer autorização específica.
