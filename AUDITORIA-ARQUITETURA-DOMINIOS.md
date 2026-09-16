# AUDITORIA ARQUITETURAL DE DOMÍNIOS

> **Fase 1.5 — Mapeamento Arquitetural de Domínios**
> **Empresa:** J&S Empregos LTDA
> **Modo:** READ-ONLY — nenhum arquivo movido, alterado ou commitado
> **Data:** 2026-09-10

---

## 📊 RESUMO EXECUTIVO

| Métrica                                    | Valor                                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| Total de páginas TSX (auditado)            | 134 arquivos                                                                            | <!-- 134 em src/pages/ recursivamente (PowerShell: Get-ChildItem -Recurse *.tsx = 134) --> |
| Páginas em `src/pages/` (recursivo)        | 134 arquivos TSX                                                                        |
| Páginas em `src/pages/dashboard/`          | 94 arquivos TSX                                                                         | <!-- 76 diretas + 7 subpasta financeiro + 11 subpasta relatorios -->                       |
| Páginas em `src/pages/auth/`               | 5 arquivos TSX                                                                          |
| Páginas em `src/features/candidato/pages/` | 9 arquivos TSX                                                                          | <!-- CAMINHO CORRETO: era src/pages/features/candidato/pages/ (incorreto) -->              |
| Páginas em `src/pages/finance/`            | 2 arquivos TSX                                                                          |
| Páginas em `src/pages/primeiro-acesso/`    | 2 arquivos TSX                                                                          |
| Páginas raiz (`src/pages/*.tsx`)           | 31 arquivos TSX                                                                         |
| Repositories existentes                    | 62 arquivos                                                                             | <!-- 58 implementations + index.ts + 3 test files -->                                      |
| Hooks existentes (`src/hooks/`)            | 23 arquivos                                                                             | <!-- 22 hooks + 1 barrel index.ts -->                                                      |
| Contexts existentes                        | 5 (`AuthContext`, `CandidateContext`, `ThemeContext`, `IntroContext`, `AccountContext`) |

> **Nota sobre contagem:** A auditoria prévia (`AUDITORIA-ESTRUTURA-FRONTEND.md`) citava 88 páginas (68 em dashboard). A contagem real hoje é **134** (135 no relatório original — off-by-1 corrigido após auditoria de evidências). A estrutura foi ampliada com `src/features/candidato/pages/` (9 páginas — caminho original citado incorretamente como `src/pages/features/candidato/pages/`) e subpastas `financeiro/` e `relatorios/` dentro de `dashboard/`. Também foram adicionados componentes de placeholder (`UnderConstruction.tsx`, `ComingSoonPage.tsx`).

---

## 🔒 DIRETRIZES PERMANENTES APLICADAS

Conforme `AGENTS.md` e `.kilo/agent/00-diretriz-permanente.md`:

- ✅ Empresa mantida como **"J&S Empregos LTDA"** em todos os arquivos
- ✅ Footer preservado — nenhuma alteração
- ✅ Auth, SMTP, RBAC, RLS, triggers, migrations — **não alterados**
- ✅ Supabase — fonte da verdade (schema V2.1)
- ✅ Cadeia de dados: Interface → Hook/Context → Repository → RPC/Query → Supabase → Dados reais

---

## 📚 DOCUMENTAÇÃO — CLASSIFICAÇÃO (Gate 1)

Documentos lidos e classificados:

| Documento                                  | Classificação   | Observação                                             |
| ------------------------------------------ | --------------- | ------------------------------------------------------ |
| `AGENTS.md`                                | **CANÔNICO**    | Regras permanentes vigentes — fonte principal          |
| `.kilo/agent/00-diretriz-permanente.md`    | **CANÔNICO**    | Regra máxima de leitura obrigatória                    |
| `docs/V21-FRONTEND-DATABASE-MASTER-MAP.md` | **CANÔNICO**    | Mapa completo frontend ↔ DB, domínios, gaps            |
| `docs/V21-DOMAIN-MAP.md`                   | **CANÔNICO**    | Mapa de tabelas/domínios V2.1                          |
| `docs/V21-ROUTE-MAP.md`                    | **CANÔNICO**    | Proposta de estrutura de rotas por RBAC                |
| `docs/V21-RE-AUDIT-FINAL-GATES.md`         | **CANÔNICO**    | Status de gates pós-Fase 1 (todos PASS/WARNING)        |
| `docs/V21-FRONTEND-DATABASE-CONTRACT.md`   | **CONFLITANTE** | 47 tabelas sem RLS — problema conhecido, não resolvido |
| `docs/V21-GAP-CLOSURE-MATRIX.md`           | **CANÔNICO**    | Gaps entre mock e DB                                   |
| `supabase/PREFLIGHT-20260902.md`           | **CANÔNICO**    | P0 resolvers validados no Supabase real                |
| `supabase/P0-RECONCILIATION-SPEC.md`       | **CANÔNICO**    | Spec das 4 correções P0                                |
| `supabase/MOCK-DB-INVENTORY-20260902.md`   | **CANÔNICO**    | Inventário mock × DB — 6 GAPs                          |
| `auditoria-portal-candidato.md`            | **CANÔNICO**    | Auditoria portal candidato — 8 páginas novo worktree   |
| `CHECKPOINT_2026-08-09.md`                 | **CANÔNICO**    | Ponto de restauração — layout/responsividade           |
| `AUDITORIA-ESTRUTURA-FRONTEND.md`          | **CANÔNICO**    | Estrutura frontend — 88 páginas, 63 repos              |
| `audit-master-*.md`                        | **CANÔNICO**    | Audits mestres de DB, RBAC, candidato                  |
| `docs/V21-STATIC-RECONCILIATION.md`        | **CANÔNICO**    | Reconciliação de conteúdo estático                     |

**Conflito documentado:** `docs/V21-FRONTEND-DATABASE-CONTRACT.md` reporta 47 tabelas sem RLS (CRÍTICO). Este é um gap de segurança conhecido, não implementado.

---

## 🗺️ MAPA DE DOMÍNIOS (Gate 2 — Inventário de Páginas e Rotas)

### Estrutura atual de diretórios

```text
src/pages/
├── (raiz)                    → 24 páginas (Home, Vagas, Login, etc.)
├── auth/                     → 5 páginas (Login, Entrar, Cadastro, etc.)
├── dashboard/                → 83 páginas (.tsx) + 1 .ts (model)
│   ├── (raiz)                → 63 páginas diretas
│   ├── financeiro/           → 7 páginas
│   └── relatorios/           → 11 páginas
├── features/candidato/
│   └── pages/                → 9 páginas
├── finance/                  → 2 páginas
├── primeiro-acesso/          → 2 páginas
```

### Apps identificados

1. **App público** (`PublicLayout`): raiz de `src/pages/` — landing, vagas, empresas, etc.
2. **App SaaS dashboard** (`/dashboard/*`): `AppShell` — área logada de admin/empresa/gestão
3. **App candidato** (`/candidato/*`): `CandidateShell` — área exclusiva do candidato
4. **App auth** (`/login`, `/entrar/*`, `/cadastro`): `AuthRoute`
5. **App primeiro-acesso** (`/primeiro-acesso/*`): `FirstAccessRoute`

### Módulos do `ModuleRegistry.ts` (21 módulos)

| ID                   | Título             | Rota                                    | Scope    | Permission                      |
| -------------------- | ------------------ | --------------------------------------- | -------- | ------------------------------- |
| `admin-master`       | Visão Global       | `/dashboard/global`                     | platform | `domain_events.read`            |
| `inicio`             | Início             | `/dashboard`                            | tenant   | —                               |
| `tenants`            | Tenants            | `/dashboard/tenants`                    | platform | `tenants.read`                  |
| `onboarding`         | Onboarding         | `/dashboard/onboarding`                 | platform | `tenants.read`                  |
| `assinaturas`        | Assinaturas        | `/dashboard/assinaturas`                | platform | `finance.read`                  |
| `gestao-saas`        | Gestão SaaS        | `/dashboard/gestao-saas`                | platform | `domain_events.read`            |
| `usuarios`           | Usuários           | `/dashboard/usuarios`                   | platform | `people.read`                   |
| `roles-permissoes`   | Roles & Permissões | `/dashboard/roles-permissoes`           | platform | `roles.read`                    |
| `auditoria`          | Auditoria          | `/dashboard/auditoria`                  | platform | `audit.read`                    |
| `contratos`          | Contratos          | `/dashboard/contratos`                  | tenant   | `contracts.read`                |
| `rh`                 | Recursos Humanos   | `/dashboard/rh`                         | tenant   | `people.read`                   |
| `recrutamento`       | Recrutamento       | `/dashboard/recrutamento`               | tenant   | `jobs.read`, `candidates.read`  |
| `crm`                | CRM                | `/dashboard/crm`                        | tenant   | `companies.read`                |
| `financeiro`         | Financeiro         | `/dashboard/financeiro`                 | tenant   | `finance.dashboard.read`        |
| `faturamento`        | Faturamento        | `/dashboard/faturamento`                | tenant   | `finance.read`                  |
| `fiscal`             | Fiscal             | `/dashboard/fiscal`                     | tenant   | `fiscal.dashboard.read`         |
| `contabilidade`      | Contabilidade      | `/dashboard/contabilidade`              | tenant   | `accounting.dashboard.read`     |
| `estoque`            | Estoque            | `/dashboard/estoque`                    | tenant   | `stock_movements.read`          |
| `almoxarifado`       | Almoxarifado       | `/dashboard/almoxarifado`               | tenant   | `stock_movements.read`          |
| `servicos`           | Serviços           | `/dashboard/servicos`                   | tenant   | `service_orders.dashboard.read` |
| `suporte`            | Suporte            | `/dashboard/suporte`                    | tenant   | `support_tickets.read`          |
| `relatorios`         | Relatórios         | `/dashboard/relatorios`                 | tenant   | `reports.read`                  |
| `ia`                 | IA & Automação     | `/dashboard/ia`                         | tenant   | —                               |
| `integracoes`        | Integrações        | `/dashboard/integracoes`                | platform | `integrations.manage`           |
| `configuracoes-saas` | Configurações SaaS | `/dashboard/configuracoes`              | platform | `tenant.manage`                 |
| `preferencias`       | Preferências       | `/dashboard/configuracoes/preferencias` | tenant   | —                               |
| `minha-conta`        | Minha conta        | `/dashboard/configuracoes/conta`        | tenant   | —                               |
| `seguranca-conta`    | Segurança          | `/dashboard/configuracoes/seguranca`    | tenant   | —                               |

`MODULE_PAGE_MAP` mapeia 25 módulos → componentes de página. 6 módulos não têm mapeamento direto no `MODULE_PAGE_MAP` (features aninhadas resolvidas inline em `App.tsx`).

---

## 📊 ANÁLISE DE DASHBOARDS (Gate 3)

### Critério: dashboards devem falar com o banco, não ser páginas estáticas

#### Dashboards conectadas ao Banco (REAL ou PARCIAL) — 65 telas

| Dashboard                        | Repository                                                         | Conexão         | Observação                                                                                |
| -------------------------------- | ------------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------- |
| `DashboardHome.tsx`              | `jobsRepository`, `candidatesRepository`, `companiesRepository`    | REAL            | KPIs via consultas Supabase                                                               |
| `VisaoGorel.tsx`                 | `jobsRepository`, `candidatesRepository`, `companiesRepository`    | REAL            | Visão geral de recrutamento (importado no App.tsx L119 como VisaoGoverPage)               | <!-- Nome corrigido de "VisaoGovel" (typo) para "VisaoGorel"; status REAL confirmado via import de 3 repositories -->     |
| `GlobalDashboardPage.tsx`        | `global-dashboard-model.ts`                                        | REAL            | Dashboard global admin_master                                                             |
| `DashboardCandidato.tsx`         | `candidatesRepository`, `applicationsRepository`                   | REAL            | Área do candidato (HEAD)                                                                  |
| `DashboardRh.tsx`                | múltiplos repositories                                             | REAL            | Dashboard RH                                                                              |
| `DashboardFinanceiro.tsx`        | múltiplos                                                          | REAL            | Dashboard financeiro                                                                      |
| `BancoDeTalentos.tsx`            | `candidatesRepository`                                             | REAL            | Banco de talentos                                                                         |
| `Vagas.tsx`                      | `jobsRepository`                                                   | REAL            | Lista de vagas                                                                            |
| `Candidaturas.tsx`               | `applicationsRepository`, `jobsRepository`, `candidatesRepository` | REAL            | Candidaturas                                                                              |
| `Candidatos.tsx`                 | `candidatesRepository`                                             | REAL            | Cadastro de candidatos                                                                    |
| `CandidatoDetalhe.tsx`           | `candidatesRepository`                                             | REAL            | Detalhe candidato                                                                         |
| `CandidatoHabilidades.tsx`       | `candidatesRepository`                                             | REAL            | Habilidades                                                                               |
| `CandidatoFormacao.tsx`          | `candidatesRepository`                                             | REAL            | Formação                                                                                  |
| `CandidatoExperiencias.tsx`      | `candidatesRepository`                                             | REAL            | Experiências                                                                              |
| `CandidatoIdiomas.tsx`           | `candidatesRepository`                                             | REAL            | Idiomas                                                                                   |
| `CandidatoDocumentos.tsx`        | `candidatesRepository`                                             | REAL            | Documentos                                                                                |
| `CandidatoPreferencias.tsx`      | `candidatesRepository`                                             | REAL            | Preferências                                                                              |
| `CandidatoVisualizacoes.tsx`     | `candidatesRepository`                                             | REAL            | Visualizações                                                                             |
| `JobMatches.tsx`                 | `candidatesRepository`                                             | REAL            | Matches                                                                                   |
| `Empresas.tsx`                   | `companiesRepository`                                              | REAL            | Empresas                                                                                  |
| `Clientes.tsx`                   | `companiesRepository`                                              | REAL            | Clientes                                                                                  |
| `ClientesPage.tsx`               | `companiesRepository`                                              | REAL            | Clientes (page)                                                                           |
| `Parceiros.tsx`                  | `partnersRepository`                                               | REAL            | Conectado ao DB via `company_relationships` (tabela EXISTENTE no schema V2.1; não há gap) | <!-- DIVERGENTE no relatório original: afirmava "tabela partners não existe" mas repository usa company_relationships --> |
| `Fornecedores.tsx`               | `suppliersRepository`                                              | REAL            | Conectado ao DB via `company_relationships` (tabela EXISTENTE; não há gap)                | <!-- DIVERGENTE: afirmava "tabela suppliers não existe" mas repository existe e usa company_relationships -->             |
| `Usuarios.tsx`                   | `usersRepository`                                                  | REAL            | Usuários/Pessoas                                                                          |
| `ProcessosSeletivos.tsx`         | `jobsRepository`                                                   | REAL            | Processos seleivos                                                                        |
| `Etapas.tsx`                     | `recruitmentStagesRepository`, `recruitmentProcessesRepository`    | REAL            | CRUD completo (create, read, update, delete)                                              | <!-- DIVERGENTE: classificado como PLACEHOLDER no relatório, mas usa repositories reais -->                               |
| `Funcionarios.tsx`               | `employeesRepository`                                              | REAL            | Funcionários                                                                              |
| `FuncionarioDetalhe.tsx`         | `employeesRepository`                                              | REAL            | Detalhe funcionário                                                                       |
| `Experiencias.tsx`               | —                                                                  | **GAP**         | employee-experiences → table não existe                                                   |
| `Formacao.tsx`                   | —                                                                  | **GAP**         | employee-education → table não existe                                                     |
| `Cursos.tsx`                     | —                                                                  | **GAP**         | employee-courses → table não existe                                                       |
| `Idiomas.tsx`                    | —                                                                  | **GAP**         | employee-languages → table não existe                                                     |
| `Habilidades.tsx`                | —                                                                  | **GAP**         | employee-skills → table não existe                                                        |
| `DocumentosRh.tsx`               | —                                                                  | **GAP**         | employee-documents → table não existe                                                     |
| `DocumentosPage.tsx`             | —                                                                  | **PLACEHOLDER** | EmptyState, sem repository call                                                           |
| `Relatorios.tsx`                 | `jobsRepository`, `companiesRepository`, `servicesRepository`      | REAL            | Dashboard de relatórios                                                                   |
| `RelatorioFinanceiroPage.tsx`    | financeiro repositories                                            | REAL            | Relatório financeiro                                                                      |
| `RelatorioRhPage.tsx`            | `employeesRepository`                                              | REAL            | Relatório RH                                                                              |
| `RelatorioRecrutamentoPage.tsx`  | `jobsRepository`                                                   | REAL            | Relatório recrutamento                                                                    |
| `RelatorioCrmPage.tsx`           | `companiesRepository`                                              | REAL            | Relatório CRM                                                                             |
| `RelatorioFaturamentoPage.tsx`   | faturamento                                                        | REAL            | Relatório faturamento                                                                     |
| `RelatorioFiscalPage.tsx`        | fiscal                                                             | REAL            | Relatório fiscal                                                                          |
| `RelatorioContabilidadePage.tsx` | contábil                                                           | REAL            | Relatório contábil                                                                        |
| `RelatorioEstoquePage.tsx`       | estoque                                                            | REAL            | Relatório estoque                                                                         |
| `RelatorioAlmoxarifadoPage.tsx`  | almoxarifado                                                       | REAL            | Relatório almoxarifado                                                                    |
| `RelatorioServicosPage.tsx`      | serviços                                                           | REAL            | Relatório serviços                                                                        |
| `RelatorioSuportePage.tsx`       | suporte                                                            | REAL            | Relatório suporte                                                                         |
| `Financeiro.tsx`                 | —                                                                  | **PLACEHOLDER** | Usa `UnderConstruction`                                                                   |
| `FinanceiroPage.tsx`             | `financialTransactionsRepository`                                  | REAL            | Contas a pagar                                                                            |
| `FaturamentoPage.tsx`            | `financeRepository`                                                | REAL            | Faturamento                                                                               |
| `ContasReceberPage.tsx`          | `accountsReceivableRepository`                                     | REAL            | Contas a receber                                                                          |
| `FluxoDeCaixaPage.tsx`           | `cashFlowRepository`                                               | REAL            | Fluxo de caixa                                                                            |
| `BancosPage.tsx`                 | `bankAccountRepository`                                            | REAL            | Bancos                                                                                    |
| `CentroCustosPage.tsx`           | `costCenterRepository`                                             | REAL            | Centro de custos                                                                          |
| `FiscalPage.tsx`                 | `fiscalRepository`                                                 | REAL            | Fiscal                                                                                    |
| `ContabilidadePage.tsx`          | `accountingRepository`                                             | REAL            | Contabilidade                                                                             |
| `Estoque.tsx`                    | `warehouseRepository` / `stockRepository`                          | REAL            | Estoque                                                                                   |
| `Almoxarifado.tsx`               | `warehouseRepository`                                              | REAL            | Almoxarifado                                                                              |
| `Servicos.tsx`                   | `servicesRepository`                                               | REAL            | Serviços                                                                                  |
| `Suporte.tsx`                    | `supportRepository`                                                | REAL            | Suporte                                                                                   |
| `RolesPermissoesPage.tsx`        | `roleRepository`, `permissionRepository`                           | REAL            | RBAC                                                                                      |
| `RbacAuditPage.tsx`              | audit                                                              | REAL            | Auditoria RBAC                                                                            |
| `AuditoriaPage.tsx`              | `auditRepository`                                                  | REAL            | Auditoria                                                                                 |
| `SegurancaPage.tsx`              | security                                                           | REAL            | Segurança                                                                                 |
| `TenantsPage.tsx`                | `tenantRepository`                                                 | REAL            | Tenants                                                                                   |
| `Configuracoes.tsx`              | **MOCK**                                                           | MOCK            | Hardcoded settingsGroups                                                                  |
| `OnboardingPage.tsx`             | `tenantsRepository`                                                | REAL            | Consulta tabela `tenants` via Supabase direto (L27-43)                                    | <!-- DIVERGENTE: classificado como PLACEHOLDER, mas conectado ao DB real -->                                              |
| `DocumentosPage.tsx`             | —                                                                  | **PLACEHOLDER** | EmptyState                                                                                |
| `CompanyRelationshipsPage.tsx`   | `companiesRepository`                                              | REAL            | Relacionamentos                                                                           |
| `NotificationsPage.tsx`          | `notificationRepository`                                           | REAL            | Notificações                                                                              |
| `SessoesPage.tsx`                | security                                                           | REAL            | Sessões                                                                                   |
| `SkillsPage.tsx`                 | —                                                                  | **GAP**         | Sem repository (skills)                                                                   |
| `GestaoPage.tsx`                 | `useGlobalDashboardStats` (DB queries reais)                       | REAL            | Conectada ao DB via hook (companies, people, jobs)                                        | <!-- DIVERGENTE: classificado como MOCK, mas faz queries reais -->                                                        |
| `GestaoSaaSPage.tsx`             | `useGlobalDashboardStats` (DB queries reais)                       | REAL            | Conectada ao DB (tenants, companies, people, domain_events)                               | <!-- DIVERGENTE: classificado como MOCK, mas faz queries reais -->                                                        |
| `CatalogoPage.tsx`               | —                                                                  | **PLACEHOLDER** | Usa `UnderConstruction`                                                                   |
| `ContratosPage.tsx`              | —                                                                  | **PLACEHOLDER** | EmptyState, sem repository                                                                |
| `LgpdPage.tsx`                   | —                                                                  | **PLACEHOLDER** | Sem repository (tabela LGPD não implementada)                                             |
| `DashboardForbidden.tsx`         | —                                                                  | **PLACEHOLDER** | Página técnica                                                                            |

### Páginas candidato (`src/features/candidato/pages/`) — 9 telas

| Página              | Repository                                          | Status          | Observação             |
| ------------------- | --------------------------------------------------- | --------------- | ---------------------- |
| `Dashboard.tsx`     | `CandidateContext` (com repositories)               | REAL            | Usa `CandidateContext` |
| `Vagas.tsx`         | `CandidateContext` → `publicJobsRepository`         | REAL            | Vagas públicas         |
| `Candidaturas.tsx`  | `CandidateContext` → `applicationsRepository`       | REAL            | Candidaturas           |
| `Favoritas.tsx`     | `CandidateContext` → `favoriteJobsRepository`       | REAL            | Favoritas              |
| `Curriculo.tsx`     | `CandidateContext` (CRUD)                           | REAL            | Currículo              |
| `Perfil.tsx`        | `candidatesRepository`                              | REAL            | Perfil                 |
| `Notificacoes.tsx`  | Supabase direto (`notifications`)                   | REAL            | Notificações           |
| `Configuracoes.tsx` | —                                                   | **PLACEHOLDER** | Sem repository         |
| `Alertas.tsx`       | `CandidateContext` → `candidateJobAlertsRepository` | REAL            | Alertas                |

### Páginas `src/pages/finance/` — 2 telas (provavelmente órfãs)

| Página                       | Observação                              |
| ---------------------------- | --------------------------------------- |
| `AccountsPayableList.tsx`    | Não referenciada no App.tsx — **ÓRFÃO** |
| `AccountsReceivableList.tsx` | Não referenciada no App.tsx — **ÓRFÃO** |

### Páginas raiz (`src/pages/*.tsx`) — 24 telas

| Página                  | Tipo    | Repository                                                        | Status                 | Observação                                        |
| ----------------------- | ------- | ----------------------------------------------------------------- | ---------------------- | ------------------------------------------------- |
| `Home.tsx`              | Pública | `usePublicJobsAsVagas` + fallback mock                            | REAL/PARTIAL           | Jobs do DB, fallback mock                         |
| `Vagas.tsx`             | Pública | `usePublicJobsAsVagas`                                            | REAL                   | Conectada ao DB (via `public_jobs_v1` view)       |
| `VagaDetalhe.tsx`       | Pública | `usePublicJobBySlugAsVaga`                                        | REAL                   | Conectada ao DB                                   |
| `Empresas.tsx`          | Pública | `companiesRepository`                                             | REAL                   | Conectada ao DB                                   |
| `EmpresaDetalhe.tsx`    | Pública | —                                                                 | **PLACEHOLDER/ÓRFÃO?** | Verificar se referenciada                         |
| `Servicos.tsx`          | Pública | `useServices` + fallback mock                                     | PARTIAL                | Service mock + DB                                 |
| `ServicoDetalhe.tsx`    | Pública | `useServiceBySlug` + fallback                                     | PARTIAL                |                                                   |
| `Sobre.tsx`             | Pública | —                                                                 | **ESTÁTICA**           | Conteúdo institucional                            |
| `Blog.tsx`              | Pública | —                                                                 | **ESTÁTICA/MOCK**      | Hardcoded articles                                |
| `ProcessoSeletivo.tsx`  | Pública | —                                                                 | **ESTÁTICA**           | Conteúdo institucional                            |
| `TrabalheConosco.tsx`   | Pública | `submitCandidateApplication` (service real)                       | REAL                   | Formulário conectado ao DB via serviço candidates | <!-- DIVERGENTE: classificado como MOCK, mas usa service real -->  |
| `Suporte.tsx`           | Pública | `sendToN8n` (integração real)                                     | REAL                   | Envio real via N8N                                | <!-- DIVERGENTE: classificado como MOCK, mas integração real -->   |
| `Contato.tsx`           | Pública | `mockSubmitContact`                                               | MOCK                   | Formulário com mock                               | <!-- CONFIRMADO -->                                                |
| `Parceiros.tsx`         | Pública | `mockSubmitPartner` + `usePublicPartnersAsPartnerVisuals` (DB)    | PARTIAL                | Listing DB + submit mock                          | <!-- DIVERGENTE: não usa mockGetPartners, usa DB + mockSubmit -->  |
| `Fornecedores.tsx`      | Pública | `mockSubmitSupplier` + `usePublicSuppliersAsSupplierVisuals` (DB) | PARTIAL                | Listing DB + submit mock                          | <!-- DIVERGENTE: não usa mockGetSuppliers, usa DB + mockSubmit --> |
| `Clientes.tsx`          | Pública | `usePublicCompanies` + mock                                       | PARTIAL                | Hardcoded clients                                 |
| `DivulgarVaga.tsx`      | Pública | —                                                                 | **PLACEHOLDER/MOCK**   | Formulário mock                                   |
| `FAQ.tsx`               | Pública | —                                                                 | **ESTÁTICA**           | Hardcoded FAQ                                     |
| `Privacidade.tsx`       | Pública | —                                                                 | **ESTÁTICA**           | Conteúdo jurídico                                 |
| `Termos.tsx`            | Pública | —                                                                 | **ESTÁTICA**           | Conteúdo jurídico                                 |
| `Login.tsx`             | Auth    | `AuthContext`                                                     | REAL                   | Supabase Auth                                     |
| `Cadastro.tsx`          | Auth    | `AuthContext`                                                     | REAL                   | Supabase Auth                                     |
| `CadastroCandidato.tsx` | Auth    | `candidatesRepository`                                            | REAL                   | Cadastro + DB                                     |
| `CadastroEmpresa.tsx`   | Auth    | `companiesRepository`                                             | REAL                   | Cadastro + DB                                     |
| `RecuperarSenha.tsx`    | Auth    | `AuthContext`                                                     | REAL                   | Supabase Auth                                     |
| `RedefinirSenha.tsx`    | Auth    | `AuthContext`                                                     | REAL                   | Supabase Auth                                     |
| `AlterarSenha.tsx`      | Auth    | `AuthContext`                                                     | REAL                   | Supabase Auth                                     |
| `Onboarding.tsx`        | Pública | —                                                                 | MOCK                   | Conteúdo mock                                     |

### Páginas `src/pages/auth/` — 5 telas

| Página               | Tipo | Status                |
| -------------------- | ---- | --------------------- |
| `Login.tsx`          | Auth | REAL (Supabase Auth)  |
| `Entrar.tsx`         | Auth | REAL (Supabase Auth)  |
| `EntrarContexto.tsx` | Auth | REAL (Supabase Auth)  |
| `BoasVindas.tsx`     | Auth | REAL                  |
| `Termos.tsx`         | Auth | ESTÁTICA              |
| `AuthCallback.tsx`   | Auth | REAL (callback OAuth) |

### Páginas `src/pages/primeiro-acesso/` — 2 telas

| Página       | Tipo       | Status               |
| ------------ | ---------- | -------------------- |
| `Senha.tsx`  | Onboarding | REAL (Supabase Auth) |
| `Termos.tsx` | Onboarding | ESTÁTICA             |

### Páginas placeholder / órfãs / mock

| Página                       | Tipo        | Observação                                                             |
| ---------------------------- | ----------- | ---------------------------------------------------------------------- |
| `Dashboard.tsx` (raiz)       | ?           | Verificar — pode ser órfão                                             |
| `UnderConstruction.tsx`      | Componente  | Usado por 4 páginas (Assinaturas, Catalogo, Financeiro, Monitoramento) |
| `ComingSoonPage.tsx`         | Componente  | Fallback para módulos sem page map                                     |
| `DashboardForbidden.tsx`     | Placeholder | Página técnica de acesso negado                                        |
| `AccountsPayableList.tsx`    | Órfão       | Não referenciado no App.tsx                                            |
| `AccountsReceivableList.tsx` | Órfão       | Não referenciado no App.tsx                                            |
| `EmpresaDetalhe.tsx`         | Órfão?      | Não referenciado no App.tsx                                            |

---

## 🏗️ MAPEAMENTO DE DOMÍNIOS (Gate 4)

### Domínios propostos

```text
src/pages/
├── public/        → páginas públicas, landing, auth, formulários
├── candidato/     → área exclusiva do candidato
├── empresa/       → área da empresa (CRM, vagas, candidatos)
├── gestao/        → dashboards operacionais e relatórios
└── admin/         → configurações, usuários, RBAC, sistema
```

> **Nota:** A proposta abaixo é uma sugestão de reorganização. **Nenhum arquivo foi movido.** A decisão final de mover/arquivar/deletar é do usuário após revisão.

### Tabela de mapeamento (página → domínio → subdomínio → repository → rota → proposta → risco)

#### Páginas públicas (root `src/pages/*.tsx`) → Domínio `public`

| Página                  | Subdomínio    | Repository                                        | Rota                      | Proposta                | Risco                   |
| ----------------------- | ------------- | ------------------------------------------------- | ------------------------- | ----------------------- | ----------------------- |
| `Home.tsx`              | Institucional | `usePublicJobsAsVagas` + fallback mock            | `/`                       | `public/home/`          | BAIXO                   |
| `Vagas.tsx`             | Recrutamento  | `jobsRepository` (via `usePublicJobsAsVagas`)     | `/vagas`                  | `public/vagas/`         | BAIXO                   |
| `VagaDetalhe.tsx`       | Recrutamento  | `jobsRepository` (via `usePublicJobBySlugAsVaga`) | `/vagas/:slug`            | `public/vagas/`         | BAIXO                   |
| `Empresas.tsx`          | Negócios      | `companiesRepository` (via `usePublicCompanies`)  | `/empresas`               | `public/empresas/`      | BAIXO                   |
| `EmpresaDetalhe.tsx`    | Negócios      | —                                                 | —                         | `public/empresas/`      | ALTO (órfão)            |
| `Servicos.tsx`          | Institucional | `useServices` + fallback mock                     | `/servicos`               | `public/servicos/`      | BAIXO                   |
| `ServicoDetalhe.tsx`    | Institucional | `useServiceBySlug` + fallback                     | `/servicos/:slug`         | `public/servicos/`      | BAIXO                   |
| `Sobre.tsx`             | Institucional | —                                                 | `/sobre`                  | `public/institucional/` | BAIXO                   |
| `Blog.tsx`              | Institucional | —                                                 | `/blog`, `/blog/:slug`    | `public/blog/`          | MÉDIO (mock)            |
| `ProcessoSeletivo.tsx`  | Recrutamento  | —                                                 | `/processo-seletivo`      | `public/recrutamento/`  | MÉDIO (estática)        |
| `TrabalheConosco.tsx`   | Recrutamento  | `submitCandidateApplication` (service real)       | `/trabalhe-conosco`       | `public/recrutamento/`  | BAIXO (REAL)            | <!-- DIVERGENTE: classificado MÉDIO (mock), mas usa service real --> |
| `Suporte.tsx`           | Suporte       | `sendToN8n` (integração real)                     | `/suporte`                | `public/suporte/`       | BAIXO (REAL)            | <!-- DIVERGENTE: classificado MÉDIO (mock), mas integração real -->  |
| `Contato.tsx`           | Suporte       | `mockSubmitContact`                               | `/contato`                | `public/suporte/`       | MÉDIO (mock)            |
| `Parceiros.tsx`         | Negócios      | `mockSubmitPartner` + DB listing                  | `/parceiros`              | `public/negocios/`      | BAIXO (PARTIAL)         | <!-- DIVERGENTE: não mockGetPartners -->                             |
| `Fornecedores.tsx`      | Negócios      | `mockSubmitSupplier` + DB listing                 | `/fornecedores`           | `public/negocios/`      | BAIXO (PARTIAL)         | <!-- DIVERGENTE: não mockGetSuppliers -->                            |
| `Clientes.tsx`          | Negócios      | `usePublicCompanies` + mock                       | `/clientes`               | `public/negocios/`      | BAIXO                   |
| `DivulgarVaga.tsx`      | Recrutamento  | —                                                 | `/empresas/divulgar-vaga` | `public/recrutamento/`  | MÉDIO (mock)            |
| `FAQ.tsx`               | Institucional | —                                                 | `/faq`                    | `public/institucional/` | BAIXO                   |
| `Privacidade.tsx`       | Institucional | —                                                 | `/privacidade`            | `public/institucional/` | BAIXO                   |
| `Termos.tsx`            | Institucional | —                                                 | `/termos`                 | `public/institucional/` | BAIXO                   |
| `Login.tsx`             | Auth          | `AuthContext`                                     | `/login`                  | `public/auth/`          | BAIXO                   |
| `Cadastro.tsx`          | Auth          | `AuthContext`                                     | `/cadastro`               | `public/auth/`          | BAIXO                   |
| `CadastroCandidato.tsx` | Auth          | `candidatesRepository`                            | `/cadastro/candidato`     | `public/auth/`          | BAIXO                   |
| `CadastroEmpresa.tsx`   | Auth          | `companiesRepository`                             | `/cadastro/empresa`       | `public/auth/`          | BAIXO                   |
| `RecuperarSenha.tsx`    | Auth          | `AuthContext`                                     | `/recuperar-senha`        | `public/auth/`          | BAIXO                   |
| `RedefinirSenha.tsx`    | Auth          | `AuthContext`                                     | `/redefinir-senha`        | `public/auth/`          | BAIXO                   |
| `AlterarSenha.tsx`      | Auth          | `AuthContext`                                     | `/alterar-senha`          | `public/auth/`          | BAIXO                   |
| `Onboarding.tsx`        | Onboarding    | —                                                 | `/onboarding`             | `public/onboarding/`    | MÉDIO (mock)            |
| `Dashboard.tsx` (raiz)  | —             | —                                                 | —                         | **ARQUIVAR?**           | ALTO (não referenciado) |

#### Páginas auth (`src/pages/auth/`) → Domínio `public/auth`

| Página               | Subdomínio | Repository    | Rota                                                    | Proposta       | Risco |
| -------------------- | ---------- | ------------- | ------------------------------------------------------- | -------------- | ----- |
| `Login.tsx`          | Auth       | `AuthContext` | —                                                       | `public/auth/` | BAIXO |
| `Entrar.tsx`         | Auth       | `AuthContext` | `/entrar`                                               | `public/auth/` | BAIXO |
| `EntrarContexto.tsx` | Auth       | `AuthContext` | `/entrar/admin`, `/entrar/candidato`, `/entrar/empresa` | `public/auth/` | BAIXO |
| `BoasVindas.tsx`     | Auth       | —             | `/auth/welcome`                                         | `public/auth/` | BAIXO |
| `Termos.tsx`         | Auth       | —             | `/auth/terms`                                           | `public/auth/` | BAIXO |
| `AuthCallback.tsx`   | Auth       | —             | `/auth/callback`                                        | `public/auth/` | BAIXO |

#### Páginas primeiro-acesso (`src/pages/primeiro-acesso/`) → Domínio `public/auth`

| Página       | Subdomínio | Repository | Rota                      | Proposta       | Risco |
| ------------ | ---------- | ---------- | ------------------------- | -------------- | ----- |
| `Senha.tsx`  | Onboarding | —          | `/primeiro-acesso/senha`  | `public/auth/` | BAIXO |
| `Termos.tsx` | Onboarding | —          | `/primeiro-acesso/termos` | `public/auth/` | BAIXO |

#### Páginas dashboard (`src/pages/dashboard/`) → Domínios `admin`, `empresa`, `gestao`

| Página                    | Domínio proposto | Subdomínio   | Repository                                                                                  | Rota                                         | Proposta            | Risco              |
| ------------------------- | ---------------- | ------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------- | ------------------ |
| `DashboardHome.tsx`       | gestao           | Visão Geral  | `useGlobalDashboardStats` (hook: jobsRepository, candidatesRepository, companiesRepository) | `/dashboard`                                 | `gestao/`           | BAIXO              |
| `VisaoGeral.tsx`          | gestao           | Visão Geral  | múltiplos                                                                                   | `/dashboard`                                 | `gestao/`           | BAIXO              |
| `GlobalDashboardPage.tsx` | admin            | Platform     | `global-dashboard-model.ts`                                                                 | `/dashboard/global`                          | `admin/`            | BAIXO              |
| `GestaoPage.tsx`          | admin            | SaaS         | `useGlobalDashboardStats` (DB real)                                                         | —                                            | `admin/`            | BAIXO (REAL)       | <!-- DIVERGENTE: classificado MOCK, mas DB real -->                      |
| `GestaoSaaSPage.tsx`      | admin            | SaaS         | `useGlobalDashboardStats` (DB real)                                                         | `/dashboard/gestao-saas`                     | `admin/`            | BAIXO (REAL)       | <!-- DIVERGENTE: classificado MOCK, mas DB real -->                      |
| `TenantsPage.tsx`         | admin            | Platform     | `tenantRepository`                                                                          | `/dashboard/tenants`                         | `admin/`            | BAIXO              |
| `OnboardingPage.tsx`      | admin            | Platform     | `tenantsRepository`                                                                         | `/dashboard/onboarding`                      | `admin/`            | BAIXO (REAL)       | <!-- DIVERGENTE: classificado PLACEHOLDER, mas usa tenantsRepository --> |
| `AssinaturasPage.tsx`     | admin            | Platform     | —                                                                                           | `/dashboard/assinaturas`                     | `admin/`            | ALTO (placeholder) |
| `CatalogoPage.tsx`        | admin            | Platform     | —                                                                                           | `/dashboard/catalogo`                        | `admin/`            | ALTO (placeholder) |
| `Usuarios.tsx`            | admin            | Identidade   | `usersRepository`                                                                           | `/dashboard/usuarios`                        | `admin/identidade/` | BAIXO              |
| `RolesPermissoesPage.tsx` | admin            | Segurança    | `roleRepository`, `permissionRepository`                                                    | `/dashboard/roles-permissoes`                | `admin/seguranca/`  | BAIXO              |
| `RbacAuditPage.tsx`       | admin            | Auditoria    | audit                                                                                       | `/dashboard/rbac-auditoria`                  | `admin/seguranca/`  | BAIXO              |
| `AuditoriaPage.tsx`       | admin            | Auditoria    | `auditRepository`                                                                           | `/dashboard/auditoria`                       | `admin/seguranca/`  | BAIXO              |
| `SegurancaPage.tsx`       | admin            | Segurança    | security                                                                                    | `/dashboard/configuracoes/seguranca`         | `admin/seguranca/`  | BAIXO              |
| `LgpdPage.tsx`            | admin            | LGPD         | —                                                                                           | `/dashboard/lgpd`                            | `admin/`            | ALTO (placeholder) |
| `Configuracoes.tsx`       | admin            | Config       | MOCK                                                                                        | `/dashboard/configuracoes`                   | `admin/`            | MÉDIO (mock)       |
| `IntegracoesPage.tsx`     | admin            | Integrações  | MOCK                                                                                        | `/dashboard/integracoes`                     | `admin/`            | MÉDIO (mock)       |
| `IaPage.tsx`              | admin            | IA           | MOCK                                                                                        | `/dashboard/ia`                              | `admin/`            | MÉDIO (mock)       |
| `MonitoramentoPage.tsx`   | admin            | Sistema      | —                                                                                           | —                                            | `admin/`            | ALTO (placeholder) |
| `SessoesPage.tsx`         | admin            | Segurança    | security                                                                                    | `/dashboard/configuracoes/seguranca/sessoes` | `admin/seguranca/`  | BAIXO              |
| `NotificationsPage.tsx`   | admin            | Notificações | `notificationRepository`                                                                    | `/dashboard/notificacoes`                    | `admin/`            | BAIXO              |

| Página                   | Domínio proposto | Subdomínio | Repository            | Rota                          | Proposta      | Risco      |
| ------------------------ | ---------------- | ---------- | --------------------- | ----------------------------- | ------------- | ---------- |
| `DashboardRh.tsx`        | empresa          | RH         | múltiplos             | `/dashboard/rh`               | `empresa/rh/` | BAIXO      |
| `Funcionarios.tsx`       | empresa          | RH         | `employeesRepository` | `/dashboard/funcionarios`     | `empresa/rh/` | BAIXO      |
| `FuncionarioDetalhe.tsx` | empresa          | RH         | `employeesRepository` | `/dashboard/funcionarios/:id` | `empresa/rh/` | BAIXO      |
| `Experiencias.tsx`       | empresa          | RH         | —                     | `/dashboard/experiencias`     | `empresa/rh/` | ALTO (gap) |
| `Formacao.tsx`           | empresa          | RH         | —                     | `/dashboard/formacao`         | `empresa/rh/` | ALTO (gap) |
| `Cursos.tsx`             | empresa          | RH         | —                     | `/dashboard/cursos`           | `empresa/rh/` | ALTO (gap) |
| `Idiomas.tsx`            | empresa          | RH         | —                     | `/dashboard/idiomas`          | `empresa/rh/` | ALTO (gap) |
| `Habilidades.tsx`        | empresa          | RH         | —                     | `/dashboard/habilidades`      | `empresa/rh/` | ALTO (gap) |
| `DocumentosRh.tsx`       | empresa          | RH         | —                     | `/dashboard/documentos-rh`    | `empresa/rh/` | ALTO (gap) |

| Página                    | Domínio proposto | Subdomínio | Repository                        | Rota                                   | Proposta              | Risco              |
| ------------------------- | ---------------- | ---------- | --------------------------------- | -------------------------------------- | --------------------- | ------------------ |
| `DashboardFinanceiro.tsx` | gestao           | Financeiro | —                                 | —                                      | `gestao/financeiro/`  | MÉDIO              |
| `FaturamentoPage.tsx`     | empresa          | Financeiro | `financeRepository`               | `/dashboard/faturamento`               | `empresa/financeiro/` | BAIXO              |
| `Financeiro.tsx`          | empresa          | Financeiro | —                                 | `/dashboard/financeiro/contas-pagar`   | `empresa/financeiro/` | ALTO (placeholder) |
| `FinanceiroPage.tsx`      | empresa          | Financeiro | `financialTransactionsRepository` | `/dashboard/financeiro/contas-pagar`   | `empresa/financeiro/` | BAIXO              |
| `ContasReceberPage.tsx`   | empresa          | Financeiro | `accountsReceivableRepository`    | `/dashboard/financeiro/contas-receber` | `empresa/financeiro/` | BAIXO              |
| `FluxoDeCaixaPage.tsx`    | empresa          | Financeiro | `cashFlowRepository`              | `/dashboard/financeiro/fluxo-caixa`    | `empresa/financeiro/` | BAIXO              |
| `BancosPage.tsx`          | empresa          | Financeiro | `bankAccountRepository`           | `/dashboard/financeiro/bancos`         | `empresa/financeiro/` | BAIXO              |
| `CentroCustosPage.tsx`    | empresa          | Financeiro | `costCenterRepository`            | `/dashboard/financeiro/centro-custos`  | `empresa/financeiro/` | BAIXO              |

| Página                         | Domínio proposto | Subdomínio  | Repository                              | Rota                         | Proposta                | Risco                 |
| ------------------------------ | ---------------- | ----------- | --------------------------------------- | ---------------------------- | ----------------------- | --------------------- |
| `FiscalPage.tsx`               | empresa          | Fiscal      | `fiscalRepository`                      | `/dashboard/fiscal`          | `empresa/fiscal/`       | BAIXO                 |
| `ContabilidadePage.tsx`        | empresa          | Contábil    | `accountingRepository`                  | `/dashboard/contabilidade`   | `empresa/contabil/`     | BAIXO                 |
| `Estoque.tsx`                  | empresa          | Estoque     | `warehouseRepository`/`stockRepository` | `/dashboard/estoque`         | `empresa/estoque/`      | BAIXO                 |
| `Almoxarifado.tsx`             | empresa          | Suprimentos | `warehouseRepository`                   | `/dashboard/almoxarifado`    | `empresa/almoxarifado/` | BAIXO                 |
| `Servicos.tsx`                 | empresa          | Serviços    | `servicesRepository`                    | `/dashboard/servicos`        | `empresa/servicos/`     | BAIXO                 |
| `Suporte.tsx`                  | empresa          | Suporte     | `supportRepository`                     | `/dashboard/suporte`         | `empresa/suporte/`      | BAIXO                 |
| `DocumentosPage.tsx`           | empresa          | Documentos  | —                                       | `/dashboard/documentos`      | `empresa/documentos/`   | ALTO (placeholder)    |
| `ContratosPage.tsx`            | empresa          | Contratos   | —                                       | `/dashboard/contratos`       | `empresa/contratos/`    | ALTO (placeholder)    |
| `SkillsPage.tsx`               | empresa          | Habilidades | —                                       | `/dashboard/habilidades`     | `empresa/recrutamento/` | ALTO (sem repository) |
| `CompanyRelationshipsPage.tsx` | empresa          | CRM         | `companiesRepository`                   | `/dashboard/relacionamentos` | `empresa/crm/`          | BAIXO                 |

| Página                           | Domínio proposto | Subdomínio | Repository                                                                  | Rota                                  | Proposta             | Risco |
| -------------------------------- | ---------------- | ---------- | --------------------------------------------------------------------------- | ------------------------------------- | -------------------- | ----- |
| `Empresas.tsx`                   | empresa          | CRM        | `companiesRepository`                                                       | `/dashboard/empresas`                 | `empresa/crm/`       | BAIXO |
| `Clientes.tsx`                   | empresa          | CRM        | `companiesRepository`                                                       | `/dashboard/clientes`                 | `empresa/crm/`       | BAIXO |
| `ClientesPage.tsx`               | empresa          | CRM        | `companiesRepository`                                                       | `/dashboard/clientes`                 | `empresa/crm/`       | BAIXO |
| `Parceiros.tsx`                  | empresa          | CRM        | `companiesRepository` (via `partnersRepository` → `company_relationships`)  | `/dashboard/parceiros`                | `empresa/crm/`       | BAIXO | <!-- DIVERGENTE: afirmava gap, mas company_relationships EXISTE --> |
| `Fornecedores.tsx`               | empresa          | CRM        | `companiesRepository` (via `suppliersRepository` → `company_relationships`) | `/dashboard/fornecedores`             | `empresa/crm/`       | BAIXO | <!-- DIVERGENTE: afirmava gap, mas company_relationships EXISTE --> |
| `Relatorios.tsx`                 | gestao           | Relatórios | múltiplos                                                                   | `/dashboard/relatorios`               | `gestao/relatorios/` | BAIXO |
| `RelatorioFinanceiroPage.tsx`    | gestao           | Relatórios | financeiro                                                                  | `/dashboard/relatorios/financeiro`    | `gestao/relatorios/` | BAIXO |
| `RelatorioRhPage.tsx`            | gestao           | Relatórios | RH                                                                          | `/dashboard/relatorios/rh`            | `gestao/relatorios/` | BAIXO |
| `RelatorioRecrutamentoPage.tsx`  | gestao           | Relatórios | Recrutamento                                                                | `/dashboard/relatorios/recrutamento`  | `gestao/relatorios/` | BAIXO |
| `RelatorioCrmPage.tsx`           | gestao           | Relatórios | CRM                                                                         | `/dashboard/relatorios/crm`           | `gestao/relatorios/` | BAIXO |
| `RelatorioFaturamentoPage.tsx`   | gestao           | Relatórios | Financeiro                                                                  | `/dashboard/relatorios/faturamento`   | `gestao/relatorios/` | BAIXO |
| `RelatorioFiscalPage.tsx`        | gestao           | Relatórios | Fiscal                                                                      | `/dashboard/relatorios/fiscal`        | `gestao/relatorios/` | BAIXO |
| `RelatorioContabilidadePage.tsx` | gestao           | Relatórios | Contábil                                                                    | `/dashboard/relatorios/contabilidade` | `gestao/relatorios/` | BAIXO |
| `RelatorioEstoquePage.tsx`       | gestao           | Relatórios | Estoque                                                                     | `/dashboard/relatorios/estoque`       | `gestao/relatorios/` | BAIXO |
| `RelatorioAlmoxarifadoPage.tsx`  | gestao           | Relatórios | Almoxarifado                                                                | `/dashboard/relatorios/almoxarifado`  | `gestao/relatorios/` | BAIXO |
| `RelatorioServicosPage.tsx`      | gestao           | Relatórios | Serviços                                                                    | `/dashboard/relatorios/servicos`      | `gestao/relatorios/` | BAIXO |
| `RelatorioSuportePage.tsx`       | gestao           | Relatórios | Suporte                                                                     | `/dashboard/relatorios/suporte`       | `gestao/relatorios/` | BAIXO |

| Página                       | Domínio proposto | Subdomínio   | Repository               | Rota                                  | Proposta                | Risco |
| ---------------------------- | ---------------- | ------------ | ------------------------ | ------------------------------------- | ----------------------- | ----- |
| `Candidaturas.tsx`           | empresa          | Recrutamento | `applicationsRepository` | `/dashboard/candidaturas`             | `empresa/recrutamento/` | BAIXO |
| `Vagas.tsx` (dashboard)      | empresa          | Recrutamento | `jobsRepository`         | `/dashboard/vagas`                    | `empresa/recrutamento/` | BAIXO |
| `Candidatos.tsx`             | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/candidatos`               | `empresa/recrutamento/` | BAIXO |
| `CandidatoDetalhe.tsx`       | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/candidatos/:id`           | `empresa/recrutamento/` | BAIXO |
| `CandidatoHabilidades.tsx`   | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/candidatos/habilidades`   | `empresa/recrutamento/` | BAIXO |
| `CandidatoFormacao.tsx`      | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/candidatos/formacao`      | `empresa/recrutamento/` | BAIXO |
| `CandidatoExperiencias.tsx`  | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/candidatos/experiencias`  | `empresa/recrutamento/` | BAIXO |
| `CandidatoIdiomas.tsx`       | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/candidatos/idiomas`       | `empresa/recrutamento/` | BAIXO |
| `CandidatoDocumentos.tsx`    | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/candidatos/documentos`    | `empresa/recrutamento/` | BAIXO |
| `CandidatoPreferencias.tsx`  | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/candidatos/preferencias`  | `empresa/recrutamento/` | BAIXO |
| `CandidatoVisualizacoes.tsx` | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/candidatos/visualizacoes` | `empresa/recrutamento/` | BAIXO |
| `JobMatches.tsx`             | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/matches`                  | `empresa/recrutamento/` | BAIXO |
| `ProcessosSeletivos.tsx`     | empresa          | Recrutamento | `jobsRepository`         | `/dashboard/processos-seletivos`      | `empresa/recrutamento/` | BAIXO |
| `BancoDeTalentos.tsx`        | empresa          | Recrutamento | `candidatesRepository`   | `/dashboard/banco-de-talentos`        | `empresa/recrutamento/` | BAIXO |

| Página                             | Domínio proposto | Subdomínio   | Repository | Rota                   | Proposta                | Risco |
| ---------------------------------- | ---------------- | ------------ | ---------- | ---------------------- | ----------------------- | ----- |
| `DashboardCandidato.tsx`           | empresa          | Recrutamento | múltiplos  | `/dashboard/candidato` | `empresa/recrutamento/` | BAIXO |
| `financeiro/Categorias.tsx`        | gestao           | Financeiro   | —          | —                      | `gestao/financeiro/`    | MÉDIO |
| `financeiro/CentrosCusto.tsx`      | gestao           | Financeiro   | —          | —                      | `gestao/financeiro/`    | MÉDIO |
| `financeiro/Conciliacao.tsx`       | gestao           | Financeiro   | —          | —                      | `gestao/financeiro/`    | MÉDIO |
| `financeiro/ContasFinanceiras.tsx` | gestao           | Financeiro   | —          | —                      | `gestao/financeiro/`    | MÉDIO |
| `financeiro/NotasFiscais.tsx`      | gestao           | Financeiro   | —          | —                      | `gestao/financeiro/`    | MÉDIO |
| `financeiro/Parcelamentos.tsx`     | gestao           | Financeiro   | —          | —                      | `gestao/financeiro/`    | MÉDIO |
| `financeiro/Transacoes.tsx`        | gestao           | Financeiro   | —          | —                      | `gestao/financeiro/`    | MÉDIO |

#### Páginas candidato (`src/features/candidato/pages/`) → Domínio `candidato`

| Página              | Subdomínio | Repository                     | Rota                       | Proposta     | Risco                 |
| ------------------- | ---------- | ------------------------------ | -------------------------- | ------------ | --------------------- |
| `Dashboard.tsx`     | Candidato  | `CandidateContext`             | `/candidato`               | `candidato/` | BAIXO                 |
| `Vagas.tsx`         | Candidato  | `publicJobsRepository`         | `/candidato/vagas`         | `candidato/` | BAIXO                 |
| `Candidaturas.tsx`  | Candidato  | `applicationsRepository`       | `/candidato/candidaturas`  | `candidato/` | BAIXO                 |
| `Favoritas.tsx`     | Candidato  | `favoriteJobsRepository`       | `/candidato/favoritas`     | `candidato/` | BAIXO                 |
| `Curriculo.tsx`     | Candidato  | `candidatesRepository` (CRUD)  | `/candidato/curriculo`     | `candidato/` | BAIXO                 |
| `Perfil.tsx`        | Candidato  | `candidatesRepository`         | `/candidato/perfil`        | `candidato/` | BAIXO                 |
| `Notificacoes.tsx`  | Candidato  | Supabase direto                | `/candidato/notificacoes`  | `candidato/` | MÉDIO                 |
| `Configuracoes.tsx` | Candidato  | —                              | `/candidato/configuracoes` | `candidato/` | ALTO (sem repository) |
| `Alertas.tsx`       | Candidato  | `candidateJobAlertsRepository` | `/candidato/alertas`       | `candidato/` | BAIXO                 |

#### Páginas finance (`src/pages/finance/`) → Domínio `gestao/financeiro` (ÓRFÃOS)

| Página                       | Subdomínio | Repository | Rota | Proposta             | Risco        |
| ---------------------------- | ---------- | ---------- | ---- | -------------------- | ------------ |
| `AccountsPayableList.tsx`    | Financeiro | —          | —    | `gestao/financeiro/` | ALTO (órfão) |
| `AccountsReceivableList.tsx` | Financeiro | —          | —    | `gestao/financeiro/` | ALTO (órfão) |

---

## 🗃️ Domínio 5: Recrutamento (jobs, applications, recruitment_processes, recruitment_stages, recruitment_demands, job_matches)

### Estado real do schema e repositories

| Tabela                  | Status no schema V2.1       | Repository                          | Consumer frontend                                                  | Observação                                                                   |
| ----------------------- | --------------------------- | ----------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `jobs`                  | ✅ REAL (persistência)      | `jobsRepository.ts`                 | `Vagas.tsx`, `JobMatches.tsx`, `DashboardRh.tsx`, `VisaoGorel.tsx` | Source of Truth                                                              |
| `applications`          | ✅ REAL (persistência)      | `candidatesRepository.ts`           | `Candidaturas.tsx`, `DashboardRh.tsx`                              | Source of Truth                                                              |
| `recruitment_processes` | ✅ REAL (persistência)      | `recruitmentProcessesRepository.ts` | `Etapas.tsx`, `ProcessosSeletivos.tsx`                             | Objeto real do banco; repository funcional                                   |
| `recruitment_stages`    | ✅ REAL (persistência + FK) | `recruitmentStagesRepository.ts`    | `Etapas.tsx`                                                       | Objeto real + FK para `recruitment_processes`; repository funcional          |
| `recruitment_demands`   | ✅ REAL (persistência)      | —                                   | —                                                                  | Persistência real, mas **sem repository nem consumer frontend identificado** |
| `job_matches`           | ✅ REAL (persistência)      | `jobMatchesRepository.ts`           | `JobMatches.tsx`, `DashboardCandidato.tsx`                         | Persistência real + consumer identificado                                    |

### Duplicação de repositories (jobs)

| Repository               | Status       | Observação                                                                          |
| ------------------------ | ------------ | ----------------------------------------------------------------------------------- |
| `jobsRepository.ts`      | ✅ Exist     | Exporta `jobsRepository` (companiesRepository.ts L276)                              |
| `JobRepository` (classe) | ⚠️ DUPLICADO | Referência alternativa à mesma tabela `jobs` — **consolidar para `jobsRepository`** |

### Observações sobre o Domínio 5

- **Não retroceder** para a classificação simplificada de "órfão" para `recruitment_demands` / `job_matches`.
  - `recruitment_demands`: persistência real, mas **sem consumer frontend** — é um gap de **feature**, não um gap de dados.
  - `job_matches`: persistência real + consumer (`JobMatches.tsx`) — está completo.

---

## 📁 ESTRUTURA PROPOSTA — ANTES × DEPOIS (Gate 5)

### ANTES (atual — não alterado)

```text
src/pages/
├── Home.tsx
├── Vagas.tsx
├── Login.tsx
├── Cadastro.tsx
├── ... (24 páginas raiz)
├── auth/
│   ├── Login.tsx
│   ├── Entrar.tsx
│   ├── EntrarContexto.tsx
│   ├── BoasVindas.tsx
│   ├── Termos.tsx
│   └── AuthCallback.tsx
├── dashboard/
│   ├── (63 páginas diretas)
│   ├── financeiro/
│   │   └── (7 páginas)
│   └── relatorios/
│       └── (11 páginas)
├── features/candidato/
│   └── pages/
│       └── (9 páginas)
├── finance/
│   └── (2 páginas — órfãs)
└── primeiro-acesso/
    └── (2 páginas)
```

### DEPOIS — PROPOSTA

```text
src/pages/
├── public/
│   ├── Home.tsx
│   ├── Sobre.tsx
│   ├── Blog.tsx
│   ├── FAQ.tsx
│   ├── Privacidade.tsx
│   ├── Termos.tsx
│   ├── Contato.tsx
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Entrar.tsx
│   │   ├── EntrarContexto.tsx
│   │   ├── BoasVindas.tsx
│   │   ├── AuthCallback.tsx
│   │   ├── Termos.tsx
│   │   ├── Cadastro.tsx
│   │   ├── CadastroCandidato.tsx
│   │   ├── CadastroEmpresa.tsx
│   │   ├── RecuperarSenha.tsx
│   │   ├── RedefinirSenha.tsx
│   │   └── AlterarSenha.tsx
│   ├── onboarding/
│   │   └── Onboarding.tsx
│   ├── primeiro-acesso/
│   │   ├── Senha.tsx
│   │   └── Termos.tsx
│   ├── vagas/
│   │   ├── Vagas.tsx
│   │   └── VagaDetalhe.tsx
│   ├── empresas/
│   │   ├── Empresas.tsx
│   │   └── EmpresaDetalhe.tsx
│   ├── negocios/
│   │   ├── Clientes.tsx
│   │   ├── Parceiros.tsx
│   │   └── Fornecedores.tsx
│   ├── servicos/
│   │   ├── Servicos.tsx
│   │   └── ServicoDetalhe.tsx
│   ├── recrutamento/
│   │   ├── ProcessoSeletivo.tsx
│   │   ├── TrabalheConosco.tsx
│   │   └── DivulgarVaga.tsx
│   └── suporte/
│       ├── Suporte.tsx
│       └── Contato.tsx
├── candidato/
│   ├── Dashboard.tsx
│   ├── Vagas.tsx
│   ├── Candidaturas.tsx
│   ├── Favoritas.tsx
│   ├── Curriculo.tsx
│   ├── Perfil.tsx
│   ├── Notificacoes.tsx
│   ├── Configuracoes.tsx
│   └── Alertas.tsx
├── empresa/
│   ├── rh/
│   │   ├── DashboardRh.tsx
│   │   ├── Funcionarios.tsx
│   │   ├── FuncionarioDetalhe.tsx
│   │   ├── Experiencias.tsx
│   │   ├── Formacao.tsx
│   │   ├── Cursos.tsx
│   │   ├── Idiomas.tsx
│   │   ├── Habilidades.tsx
│   │   └── DocumentosRh.tsx
│   ├── recrutamento/
│   │   ├── DashboardCandidato.tsx
│   │   ├── Vagas.tsx
│   │   ├── Candidatos.tsx
│   │   ├── CandidatoDetalhe.tsx
│   │   ├── CandidatoHabilidades.tsx
│   │   ├── CandidatoFormacao.tsx
│   │   ├── CandidatoExperiencias.tsx
│   │   ├── CandidatoIdiomas.tsx
│   │   ├── CandidatoDocumentos.tsx
│   │   ├── CandidatoPreferencias.tsx
│   │   ├── CandidatoVisualizacoes.tsx
│   │   ├── JobMatches.tsx
│   │   ├── Candidaturas.tsx
│   │   ├── ProcessosSeletivos.tsx
│   │   └── BancoDeTalentos.tsx
│   ├── crm/
│   │   ├── Empresas.tsx
│   │   ├── Clientes.tsx
│   │   ├── ClientesPage.tsx
│   │   ├── Parceiros.tsx
│   │   ├── Fornecedores.tsx
│   │   └── CompanyRelationshipsPage.tsx
│   ├── financeiro/
│   │   ├── DashboardFinanceiro.tsx
│   │   ├── FinanceiroPage.tsx
│   │   ├── ContasReceberPage.tsx
│   │   ├── FluxoDeCaixaPage.tsx
│   │   ├── BancosPage.tsx
│   │   ├── CentroCustosPage.tsx
│   │   ├── FaturamentoPage.tsx
│   │   ├── financeiro/
│   │   │   ├── Categorias.tsx
│   │   │   ├── CentrosCusto.tsx
│   │   │   ├── Conciliacao.tsx
│   │   │   ├── ContasFinanceiras.tsx
│   │   │   ├── NotasFiscais.tsx
│   │   │   ├── Parcelamentos.tsx
│   │   │   └── Transacoes.tsx
│   │   └── AccountsPayableList.tsx (órfão)
│   │   └── AccountsReceivableList.tsx (órfão)
│   ├── fiscal/
│   │   └── FiscalPage.tsx
│   ├── contabil/
│   │   └── ContabilidadePage.tsx
│   ├── estoque/
│   │   └── Estoque.tsx
│   ├── almoxarifado/
│   │   └── Almoxarifado.tsx
│   ├── servicos/
│   │   └── Servicos.tsx
│   ├── suporte/
│   │   └── Suporte.tsx
│   ├── documentos/
│   │   └── DocumentosPage.tsx
│   ├── contratos/
│   │   └── ContratosPage.tsx
│   └── SkillsPage.tsx
├── gestao/
│   ├── DashboardHome.tsx ↔ VisaoGeral.tsx
│   ├── relatorios/
│   │   ├── Relatorios.tsx
│   │   ├── RelatorioFinanceiroPage.tsx
│   │   ├── RelatorioRhPage.tsx
│   │   ├── RelatorioRecrutamentoPage.tsx
│   │   ├── RelatorioCrmPage.tsx
│   │   ├── RelatorioFaturamentoPage.tsx
│   │   ├── RelatorioFiscalPage.tsx
│   │   ├── RelatorioContabilidadePage.tsx
│   │   ├── RelatorioEstoquePage.tsx
│   │   ├── RelatorioAlmoxarifadoPage.tsx
│   │   ├── RelatorioServicosPage.tsx
│   │   └── RelatorioSuportePage.tsx
│   └── DashboardFinanceiro.tsx
└── admin/
    ├── GlobalDashboardPage.tsx
    ├── GestaoPage.tsx
    ├── GestaoSaaSPage.tsx
    ├── TenantsPage.tsx
    ├── OnboardingPage.tsx
    ├── AssinaturasPage.tsx
    ├── CatalogoPage.tsx
    ├── identidade/
    │   ├── Usuarios.tsx
    │   └── RolesPermissoesPage.tsx
    ├── seguranca/
    │   ├── AuditoriaPage.tsx
    │   ├── RbacAuditPage.tsx
    │   ├── SegurancaPage.tsx
    │   └── SessoesPage.tsx
    ├── configuracoes/
    │   ├── Configuracoes.tsx
    │   ├── IntegracoesPage.tsx
    │   ├── IaPage.tsx
    │   ├── LgpdPage.tsx
    │   └── MonitoramentoPage.tsx
    ├── notificacoes/
    │   └── NotificationsPage.tsx
    └── utilitarios/
        ├── UnderConstruction.tsx
        ├── ComingSoonPage.tsx
        ├── DashboardForbidden.tsx
        └── Dashboard.tsx (raiz — órfão?)
```

---

## ⚠️ GAPS E RISCOS IDENTIFICADOS

### Gaps críticos de dados (NÃO implementados)

| Gap                                                 | Descrição                                                                                               | Impacto                                                    | Status                                                                                                                                                                                                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. `partners` e `suppliers` tables inexistentes** | ~~`partnersRepository`~~ e ~~`suppliersRepository`~~ referenciam tabelas que não existem no schema V2.1 | ~~`Parceiros.tsx` e `Fornecedores.tsx`~~ travam em runtime | **REFUTADO pelo evidence audit** — repositories usam `company_relationships` (tabela EXISTENTE em `20260816000300_companies.sql` L87,104). Nenhum gap.                                                                                                     |
| **2. `employee_*` tables inexistentes**             | ~~5 repositories~~ referenciam tabelas inexistentes                                                     | Páginas de RH travam                                       | **REFUTADO pelo evidence audit** — migração `20260827000100_employees.sql` criou `employees`, `employee_documents`, `employee_education`, `employee_experiencias`, `employee_skills`, `employee_languages`, `employee_courses`. Todas EXISTEM. Nenhum gap. |
| **3. 47 tabelas sem RLS**                           | Conforme `V21-FRONTEND-DATABASE-CONTRACT.md`                                                            | Risco de vazamento cross-tenant — CRÍTICO para produção    |
| **4. 6 GAPs de mock → DB**                          | Empresas, Serviços, Blog/Páginas, Depoimentos, Métricas, Formulários ainda usam mock                    | 6 páginas públicas com dados estáticos                     |

### Páginas placeholder / órfãs

| Página                              | Status                      | Ação sugerida                                         |
| ----------------------------------- | --------------------------- | ----------------------------------------------------- |
| `Dashboard.tsx` (raiz `src/pages/`) | Não referenciada no App.tsx | Investigar ou remover                                 |
| `AccountsPayableList.tsx`           | Não referenciada no App.tsx | Consolidar em `empresa/financeiro/` ou arquivar       |
| `AccountsReceivableList.tsx`        | Não referenciada no App.tsx | Consolidar em `empresa/financeiro/` ou arquivar       |
| `EmpresaDetalhe.tsx`                | Não referenciada no App.tsx | Verificar se é usado via router dinâmico              |
| `UnderConstruction.tsx`             | Componente wrapper          | Usado por 4 páginas — mover para `admin/utilitarios/` |
| `ComingSoonPage.tsx`                | Componente wrapper          | Fallback do ModuleRegistry — manter no dashboard      |
| `DashboardForbidden.tsx`            | Placeholder                 | Manter                                                |

### Duplicações identificadas

| Duplicação   | Páginas                                                               | Observação           |
| ------------ | --------------------------------------------------------------------- | -------------------- |
| Clientes     | `src/pages/Clientes.tsx` + `src/pages/dashboard/Clientes.tsx`         | Público vs Dashboard |
| Parceiros    | `src/pages/Parceiros.tsx` + `src/pages/dashboard/Parceiros.tsx`       | Público vs Dashboard |
| Fornecedores | `src/pages/Fornecedores.tsx` + `src/pages/dashboard/Fornecedores.tsx` | Público vs Dashboard |
| Servicos     | `src/pages/Servicos.tsx` + `src/pages/dashboard/Servicos.tsx`         | Público vs Dashboard |
| Suporte      | `src/pages/Suporte.tsx` + `src/pages/dashboard/Suporte.tsx`           | Público vs Dashboard |
| Vagas        | `src/pages/Vagas.tsx` + `src/pages/dashboard/Vagas.tsx`               | Público vs Dashboard |
| Onboarding   | `src/pages/Onboarding.tsx` + `src/pages/dashboard/OnboardingPage.tsx` | Público vs Dashboard |

---

## 🎯 PRÓXIMOS PASSOS (sem mover arquivos)

1. **Usuário revisa este relatório** — `AUDITORIA-ARQUITETURA-DOMINIOS.md`
2. **Decisão: mover ou não?** — arquivo por arquivo / grupo por grupo
3. **Se aprovado**: Fase 2 — Movimentação controlada (read-only → write)
4. **Corrigir gaps de dados primeiro**:
   - `partners`/`suppliers` → usar `companies` + `company_relationships` (conforme V21 spec)
   - `employee_*` → usar `people` + employee tables (conforme V21 domain map)
5. **Conectar mocks restantes** ao Supabase (G1-G12 do MOCK-DB-INVENTORY)

---

## ✅ VALIDAÇÃO

- ✅ Nenhum arquivo movido
- ✅ Nenhum código alterado
- ✅ Nenhuma migration criada ou aplicada
- ✅ Auth / SMTP / RBAC / RLS preservados
- ✅ Footer preservado
- ✅ Empresa: "J&S Empregos LTDA" mantido em todo o documento
- ✅ Nenhum commit, push ou deploy

---

## 📋 MATRIZ DE CONFORMIDADE (Audit de Evidências — 2026-09-11)

Conforme `AGENTS.md` §7 (DOCUMENTAÇÃO PRIMEIRO), este relatório sofreu auditoria de evidências comparando cada conclusão com o estado real do código e schema.

### Classificação de conformidade

| Seção do relatório         | % Conformidade | Classificação geral |
| -------------------------- | -------------- | ------------------- |
| Contagens (§1-2)           | ~30%           | **DIVERGENTE**      |
| Documentação e Schema (§4) | ~90%           | **CONFIRMADO**      |
| Dashboards (§3)            | ~60%           | **DIVERGENTE**      |
| Órfãos                     | ~50%           | **PARCIAL**         |
| Módulos (ModuleRegistry)   | ~0%            | **DIVERGENTE**      |
| Mock público               | ~45%           | **DIVERGENTE**      |

### Divergências críticas corrigidas

| Item                          | Relatório original                    | Evidência real                                                          | Correção              |
| ----------------------------- | ------------------------------------- | ----------------------------------------------------------------------- | --------------------- |
| Total de páginas              | 135                                   | 134 (PowerShell `Get-ChildItem -Recurse *.tsx = 134`)                   | Ajustado              |
| `src/pages/dashboard/`        | 103                                   | 94 (76 + 7 + 11)                                                        | Ajustado              |
| Path candidato                | `src/pages/features/candidato/pages/` | `src/features/candidato/pages/`                                         | Caminho corrigido     |
| Repositories                  | 63                                    | 62 (`ls src/repositories/*.ts = 62`)                                    | Ajustado              |
| Hooks                         | 25                                    | 23 (`ls src/hooks/*.ts = 23`)                                           | Ajustado              |
| Contexts                      | 4                                     | 5 (inclui `AccountContext`)                                             | Ajustado              |
| `partners`/`suppliers` tables | Gap inexistente                       | `company_relationships` EXISTE (`20260816000300_companies.sql` L87,104) | Gap refutado          |
| `employee_*` tables           | Gap inexistente                       | Migração `20260827000100_employees.sql` cria todas                      | Gap refutado          |
| `Etapas.tsx`                  | PLACEHOLDER                           | Usa `recruitmentStagesRepository` + `recruitmentProcessesRepository`    | REAL                  |
| `OnboardingPage.tsx`          | PLACEHOLDER                           | Usa `tenantsRepository` (consultas `tenants` via Supabase)              | REAL                  |
| `GestaoPage.tsx`              | MOCK                                  | Usa `useGlobalDashboardStats` (queries reais)                           | REAL                  |
| `GestaoSaaSPage.tsx`          | MOCK                                  | Usa `useGlobalDashboardStats` (queries reais)                           | REAL                  |
| `TrabalheConosco.tsx`         | MOCK (`mockSubmitCandidate`)          | `submitCandidateApplication` (service real)                             | REAL                  |
| `Suporte.tsx`                 | MOCK (`mockSubmitContact`)            | `sendToN8n` (integração real N8N)                                       | REAL                  |
| `Parceiros.tsx` (púb.)        | MOCK (`mockGetPartners`)              | `mockSubmitPartner` + `usePublicPartnersAsPartnerVisuals` (DB)          | PARTIAL               |
| `Fornecedores.tsx` (púb.)     | MOCK (`mockGetSuppliers`)             | `mockSubmitSupplier` + `usePublicSuppliersAsSupplierVisuals` (DB)       | PARTIAL               |
| `VisaoGovel.tsx`              | (typo)                                | `VisaoGorel.tsx` (fonético correto)                                     | Nome corrigido        |
| `DashboardHome.tsx`           | 3 repositórios diretos                | Usa hook `useGlobalDashboardStats` (queries via hook)                   | Classif. ajustada     |
| `EmpresaDetalhe.tsx`          | PLACEHOLDER/órfão                     | Órfão **mas** usa `companiesRepository` via `useCompanyPublic` (REAL)   | Classif. corrigida    |
| `SkillsPage.tsx`              | GAP (sem repository)                  | Consulta `skills` via Supabase direto                                   | REAL (DB via cliente) |
| Módulos (ModuleRegistry)      | "21 módulos"                          | `PORTAL_MODULES` contém 28 `id:`                                        | Contagem ajustada     |
| "25 mapeados"                 | 25                                    | `MODULE_PAGE_MAP` contém 29 entradas                                    | Contagem ajustada     |

### Conclusão

Classificação geral do relatório original: **PARCIAL com divergências estruturais** — a classificação REAL/MOCK/PLACEHOLDER era correta em ~50-60% dos casos. As tabelas de gaps `partners`/`suppliers`/`employee_*` eram falsas positivas (tabelas existem/usos reais).

---

Fim da auditoria — aguardando revisão do usuário.
