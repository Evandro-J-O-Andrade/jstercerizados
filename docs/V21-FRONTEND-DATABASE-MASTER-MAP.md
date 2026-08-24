# V2.1 — Frontend / Database Master Map

> **Propósito**: único documento de referência para conectar cada página/componente do frontend
> às tabelas, mocks, seeds, repositories e hooks do ecossistema V2.1.
>
> **Regra**: não apagar UI existente. Substituir apenas a **fonte de dados**.

---

## 1. Identidade / Segurança (não é módulo de RH)

```text
auth.users
   ↓
people
   ↓
tenant_memberships
   ↓
role_assignments
   ↓
roles
   ↓
permissions
```

**Páginas que consomem identidade**:

| Página                     | O que consome                                       | Permission                   |
| -------------------------- | --------------------------------------------------- | ---------------------------- |
| `/login`                   | `AuthContext` → Supabase Auth                       | pública                      |
| `/cadastro`                | `AuthContext` → sign up                             | pública                      |
| `/cadastro/candidato`      | `AuthContext` + `candidates`                        | pública                      |
| `/cadastro/empresa`        | `AuthContext` + `companies`                         | pública                      |
| `/recuperar-senha`         | `AuthContext` → reset                               | pública                      |
| `/dashboard/usuarios`      | `usersRepository` → `people` + `tenant_memberships` | `people.read`                |
| `/dashboard/configuracoes` | `settingsRepository` → `tenant_settings`            | `tenants.read`, `roles.read` |

---

## 2. Rotas Públicas (SaaS landing + recrutamento)

| Rota                      | Página              | Layout         | Domínio               | Tabela(s)                                             | Fonte atual                            | Repository                 | Hook            | Permission        | Tipo          |
| ------------------------- | ------------------- | -------------- | --------------------- | ----------------------------------------------------- | -------------------------------------- | -------------------------- | --------------- | ----------------- | ------------- |
| `/`                       | `Home`              | `PublicLayout` | Institucional         | —                                                     | conteúdo estático                      | —                          | —               | pública           | Mini-landpage |
| `/vagas`                  | `Vagas`             | `PublicLayout` | Recrutamento          | `jobs`                                                | **mock** `mockGetVagas()`              | `jobsRepository`           | `useJobs`       | `jobs.read`       | Pública       |
| `/vagas/:slug`            | `VagaDetalhe`       | `PublicLayout` | Recrutamento          | `jobs`                                                | **mock** `mockGetVagaBySlug()`         | `jobsRepository`           | `useJobs`       | `jobs.read`       | Pública       |
| `/empresas`               | `Empresas`          | `PublicLayout` | Negócios              | `companies` + `company_relationships`                 | **mock** `mockGetCompanies()`          | `companiesRepository`      | `useCompanies`  | `companies.read`  | Pública       |
| `/empresas/divulgar-vaga` | `DivulgarVaga`      | `PublicLayout` | Negócios/Recrutamento | `companies` + `jobs`                                  | **mock** formulário                    | —                          | —               | pública           | Formulário    |
| `/candidatos`             | `Candidatos`        | `PublicLayout` | Recrutamento          | `candidates` + `people`                               | **mock** `mockGetCandidates()`         | `candidatesRepository`     | `useCandidates` | `candidates.read` | Pública       |
| `/servicos`               | `Servicos`          | `PublicLayout` | Institucional         | —                                                     | **mock** `mockServices[]`              | —                          | —               | pública           | Mini-landpage |
| `/servicos/:slug`         | `ServicoDetalhe`    | `PublicLayout` | Institucional         | —                                                     | **mock** `mockGetServiceBySlug()`      | —                          | —               | pública           | Mini-landpage |
| `/clientes`               | `Clientes`          | `PublicLayout` | Negócios              | `companies` + `company_relationships` (type=client)   | **mock** `mockGetBudgets()`            | `companiesRepository`      | `useCompanies`  | `companies.read`  | Pública       |
| `/parceiros`              | `Parceiros`         | `PublicLayout` | Negócios              | `companies` + `company_relationships` (type=partner)  | **mock** `mockGetPartners()`           | `partnersRepository`       | `usePartners`   | `companies.read`  | Pública       |
| `/fornecedores`           | `Fornecedores`      | `PublicLayout` | Negócios/CRM          | `companies` + `company_relationships` (type=supplier) | **mock** `mockGetSuppliers()`          | `suppliersRepository`      | `useSuppliers`  | `companies.read`  | Pública       |
| `/trabalhe-conosco`       | `TrabalheConosco`   | `PublicLayout` | Recrutamento          | `candidates`                                          | formulário → `mockSubmitCandidate()`   | `candidatesRepository`     | —               | pública           | Formulário    |
| `/processo-seletivo`      | `ProcessoSeletivo`  | `PublicLayout` | Recrutamento          | `applications` + `application_status_history`         | —                                      | —                          | —               | pública           | Mini-landpage |
| `/sobre`                  | `Sobre`             | `PublicLayout` | Institucional         | —                                                     | conteúdo estático                      | —                          | —               | pública           | Mini-landpage |
| `/blog`                   | `Blog`              | `PublicLayout` | Institucional         | —                                                     | **mock**                               | —                          | —               | pública           | Mini-landpage |
| `/suporte`                | `Suporte`           | `PublicLayout` | Suporte               | `support_tickets`                                     | **mock** `mockGetContacts()`           | `supportTicketsRepository` | —               | pública           | Formulário    |
| `/faq`                    | `FAQ`               | `PublicLayout` | Institucional         | —                                                     | conteúdo estático                      | —                          | —               | pública           | Mini-landpage |
| `/contato`                | `Contato`           | `PublicLayout` | Suporte               | `contacts`                                            | **mock** `mockSubmitContact()`         | —                          | —               | pública           | Formulário    |
| `/privacidade`            | `Privacidade`       | `PublicLayout` | Institucional         | —                                                     | conteúdo estático                      | —                          | —               | pública           | Mini-landpage |
| `/termos`                 | `Termos`            | `PublicLayout` | Institucional         | —                                                     | conteúdo estático                      | —                          | —               | pública           | Mini-landpage |
| `/login`                  | `Login`             | `PublicLayout` | Auth                  | `auth.users`                                          | **mock** `mockLogin()` → Supabase Auth | —                          | `useAuth`       | pública           | Auth          |
| `/cadastro`               | `Cadastro`          | `PublicLayout` | Auth                  | `auth.users` + `people`                               | **mock** → Supabase Auth               | —                          | `useAuth`       | pública           | Auth          |
| `/recuperar-senha`        | `RecuperarSenha`    | `PublicLayout` | Auth                  | `auth.users`                                          | Supabase Auth                          | —                          | `useAuth`       | pública           | Auth          |
| `/cadastro/candidato`     | `CadastroCandidato` | `PublicLayout` | Recrutamento          | `people` + `candidates`                               | formulário                             | `candidatesRepository`     | —               | pública           | Formulário    |
| `/cadastro/empresa`       | `CadastroEmpresa`   | `PublicLayout` | Negócios              | `companies` + `company_relationships`                 | formulário                             | `companiesRepository`      | —               | pública           | Formulário    |
| `/onboarding`             | `Onboarding`        | `PublicLayout` | Onboarding            | —                                                     | **mock**                               | —                          | —               | pública           | Mini-landpage |

---

## 3. Rotas SaaS (Dashboard — protegidas por RBAC)

| Rota                             | Página               | Módulo          | Domínio         | Tabela(s)                                            | Repository                                                      | Hook | Permission                   |
| -------------------------------- | -------------------- | --------------- | --------------- | ---------------------------------------------------- | --------------------------------------------------------------- | ---- | ---------------------------- |
| `/dashboard`                     | `VisaoGeral`         | Gestão          | múltiplos       | `jobs`, `candidates`, `companies`                    | `jobsRepository`, `candidatesRepository`, `companiesRepository` | —    | `dashboard.read`             |
| `/dashboard/vagas`               | `Vagas`              | Recrutamento    | RH/Recrutamento | `jobs`                                               | `jobsRepository`                                                | —    | `jobs.read`                  |
| `/dashboard/candidatos`          | `Candidatos`         | Recrutamento    | RH/Recrutamento | `candidates` + `people`                              | `candidatesRepository`                                          | —    | `candidates.read`            |
| `/dashboard/empresas`            | `Empresas`           | CRM/Negócios    | Negócios        | `companies` + `company_relationships`                | `companiesRepository`                                           | —    | `companies.read`             |
| `/dashboard/clientes`            | `Clientes`           | CRM/Negócios    | Negócios        | `companies` + `company_relationships` (client)       | `companiesRepository`                                           | —    | `companies.read`             |
| `/dashboard/parceiros`           | `Parceiros`          | CRM/Negócios    | Negócios        | `companies` + `company_relationships` (partner)      | `partnersRepository`                                            | —    | `companies.read`             |
| `/dashboard/fornecedores`        | `Fornecedores`       | Suprimentos/CRM | Negócios        | `companies` + `company_relationships` (supplier)     | `suppliersRepository`                                           | —    | `companies.read`             |
| `/dashboard/usuarios`            | `Usuarios`           | Suporte/Admin   | Identidade      | `people` + `tenant_memberships` + `role_assignments` | `usersRepository`                                               | —    | `people.read`                |
| `/dashboard/processos-seletivos` | `ProcessosSeletivos` | Recrutamento    | RH/Recrutamento | `recruitment_processes`                              | `recruitmentProcessesRepository`                                | —    | `recruitment.read`           |
| `/dashboard/servicos`            | `Servicos`           | CRM/Negócios    | Negócios        | `service_orders`                                     | `servicesRepository`                                            | —    | `service_orders.read`        |
| `/dashboard/financeiro`          | `Financeiro`         | Financeiro      | Financeiro      | `financial_transactions`                             | `financialTransactionsRepository`                               | —    | `finance.read`               |
| `/dashboard/estoque`             | `Estoque`            | Suprimentos     | Suprimentos     | `stock_movements` + `products`                       | `stockMovementsRepository`                                      | —    | `stock_movements.read`       |
| `/dashboard/suporte`             | `Suporte`            | Suporte         | Suporte         | `support_tickets`                                    | `supportTicketsRepository`                                      | —    | `support_tickets.read`       |
| `/dashboard/relatorios`          | `Relatorios`         | Gestão          | múltiplos       | `reports`                                            | `reportsRepository`                                             | —    | `reports.read`               |
| `/dashboard/configuracoes`       | `Configuracoes`      | Admin           | Plataforma      | `tenants` + `roles` + `permissions`                  | `settingsRepository`                                            | —    | `tenants.read`, `roles.read` |

---

## 4. Tabelas V2.1 (Schema canônico)

### 4.1 Core / Identity

| Tabela               | Domínio | Scope         | Descrição                                          |
| -------------------- | ------- | ------------- | -------------------------------------------------- |
| `tenants`            | core    | global        | Organizações/SaaS tenants                          |
| `people`             | core    | global        | Entidade de identidade canônica (NÃO é auth.users) |
| `tenant_memberships` | core    | tenant        | Pessoa ↔ Tenant (muitos-para-muitos)               |
| `role_assignments`   | core    | global/tenant | Pessoa ↔ Role (global ou scoped)                   |

### 4.2 RBAC

| Tabela                      | Domínio  | Scope         | Descrição                                         |
| --------------------------- | -------- | ------------- | ------------------------------------------------- |
| `roles`                     | platform | global/tenant | Papéis (admin_master global, tenant roles scoped) |
| `permissions`               | platform | global        | Permissões canônicas `resource.action`            |
| `role_permissions`          | platform | global        | Role ↔ Permission                                 |
| `role_resource_permissions` | platform | global        | Matrix de autorização por recurso/ação            |

### 4.3 Negócios (CRM)

| Tabela                       | Domínio | Scope  | Descrição                                             |
| ---------------------------- | ------- | ------ | ----------------------------------------------------- |
| `companies`                  | core    | global | Entidade jurídica/empresa (global, não tenant-scoped) |
| `company_types`              | core    | global | Natureza jurídica (corporation, mei, etc.)            |
| `company_relationship_types` | core    | global | Tipo: client, partner, supplier                       |
| `company_relationships`      | core    | tenant | Empresa ↔ Tenant + tipo de relacionamento             |
| `company_contacts`           | core    | tenant | Contatos da empresa (via people)                      |

### 4.4 Recrutamento / RH

| Tabela                          | Domínio     | Scope  | Descrição                                                  |
| ------------------------------- | ----------- | ------ | ---------------------------------------------------------- |
| `jobs`                          | recruitment | tenant | Vagas de emprego                                           |
| `job_skills`                    | recruitment | tenant | Habilidades requeridas pela vaga                           |
| `candidates`                    | recruitment | tenant | Contexto de candidato (pessoa no contexto de recrutamento) |
| `candidate_skills`              | recruitment | tenant | Habilidades do candidato                                   |
| `candidate_experiences`         | recruitment | tenant | Experiências profissionais                                 |
| `candidate_education`           | recruitment | tenant | Formação acadêmica                                         |
| `candidate_courses`             | recruitment | tenant | Cursos                                                     |
| `candidate_languages`           | recruitment | tenant | Idiomas                                                    |
| `candidate_documents`           | recruitment | tenant | Documentos (currículo, certidões)                          |
| `candidate_availability`        | recruitment | tenant | Disponibilidade (também JSONB em candidates)               |
| `candidate_preferences`         | recruitment | tenant | Preferências de matching                                   |
| `candidate_profile_views`       | recruitment | tenant | Tracking de visualizações                                  |
| `applications`                  | recruitment | tenant | Candidatura ↔ Vaga                                         |
| `application_status_history`    | recruitment | tenant | Histórico imutável de status                               |
| `application_profile_snapshots` | recruitment | tenant | Snapshot do perfil na candidatura                          |
| `talent_pool_memberships`       | recruitment | tenant | Banco de talentos (estado de disponibilidade)              |
| `job_matches`                   | recruitment | tenant | Score de compatibilidade candidato↔vaga                    |
| `recruitment_processes`         | recruitment | tenant | Processos seletivos                                        |
| `recruitment_demands`           | recruitment | tenant | Demandas de recrutamento                                   |
| `interview_feedback`            | recruitment | tenant | Feedback de entrevistas                                    |
| `skills`                        | recruitment | global | Catálogo global de habilidades                             |

### 4.5 Serviços / Operações

| Tabela                | Domínio    | Scope  | Descrição                 |
| --------------------- | ---------- | ------ | ------------------------- |
| `service_orders`      | operations | tenant | Ordens de serviço         |
| `service_order_items` | operations | tenant | Itens da ordem de serviço |

### 4.6 Financeiro

| Tabela                   | Domínio | Scope  | Descrição         |
| ------------------------ | ------- | ------ | ----------------- |
| `financial_transactions` | finance | tenant | Receitas/Despesas |
| `purchase_orders`        | finance | tenant | Pedidos de compra |
| `invoices`               | finance | tenant | Notas fiscais     |

### 4.7 Suprimentos / Estoque

| Tabela            | Domínio | Scope  | Descrição                |
| ----------------- | ------- | ------ | ------------------------ |
| `stock_movements` | supply  | tenant | Movimentações de estoque |
| `products`        | supply  | tenant | Produtos                 |

### 4.8 Suporte

| Tabela            | Domínio | Scope  | Descrição           |
| ----------------- | ------- | ------ | ------------------- |
| `support_tickets` | support | tenant | Chamados de suporte |

### 4.9 Storage / Arquivos

| Tabela             | Domínio | Scope  | Descrição                    |
| ------------------ | ------- | ------ | ---------------------------- |
| `files`            | storage | tenant | Arquivos (provider-agnostic) |
| `file_access_logs` | storage | tenant | Auditoria de acesso          |

### 4.10 Eventos / Notificações

| Tabela                     | Domínio  | Scope  | Descrição                                 |
| -------------------------- | -------- | ------ | ----------------------------------------- |
| `domain_events`            | platform | tenant | Eventos de domínio (Transactional Outbox) |
| `notifications`            | platform | tenant | Notificações                              |
| `notification_deliveries`  | platform | tenant | Entregas por canal                        |
| `notification_preferences` | platform | tenant | Preferências de notificação               |

---

## 5. Mocks → Seeds → Repositories → Hooks → UI

### 5.1 Vagas (17 vagas — público + dashboard)

```text
Mock: src/services/mock/vagas.ts (mockVagas[], mockGetVagas(), mockGetVagaBySlug())
  ↓
Seed: supabase/migrations/20260817000100_seed.sql (ou nova migration específica)
  ↓
Tabela: jobs (17 registros)
  ↓
Repository: src/repositories/jobs.repository.ts (findAll, findBySlug, findById, create, update, delete)
  ↓
Hook: src/hooks/useJobs.ts (CRIAR)
  ↓
UI Pública: src/pages/Vagas.tsx (já existe — trocar mockGetVagas por hook)
UI Pública: src/pages/VagaDetalhe.tsx (já existe — trocar mockGetVagaBySlug por hook)
UI SaaS: src/pages/dashboard/Vagas.tsx (já usa jobsRepository)
```

**Ação necessária**:

1. Criar migration de seed com as 17 vagas do mock
2. Criar `useJobs.ts`
3. Atualizar `Vagas.tsx` e `VagaDetalhe.tsx` para usar `useJobs()` ao invés de `mockGetVagas()`

### 5.2 Candidatos / Currículos

```text
Mock: src/services/mock/curriculos.ts (mockGetCandidates, mockSubmitCandidate, etc.)
  ↓
Seed: supabase/migrations (criar se necessário)
  ↓
Tabelas: candidates + candidate_skills + candidate_experiences + candidate_education + candidate_courses + candidate_languages + candidate_documents
  ↓
Repository: src/repositories/candidates.repository.ts (CRUD básico — EXISTS)
  ↓
Hook: src/hooks/useCandidates.ts (CRIAR)
  ↓
UI Pública: src/pages/Candidatos.tsx (trocar mock)
UI SaaS: src/pages/dashboard/Candidatos.tsx (já usa candidatesRepository)
```

**Ação necessária**:

1. Verificar se `candidates.repository.ts` cobre subentidades (skills, experiences, etc.)
2. Criar `useCandidates.ts`
3. Atualizar `Candidatos.tsx` público

### 5.3 Empresas / Clientes / Parceiros / Fornecedores

```text
Mock: src/services/mock/clientes.ts, parceiros.ts, fornecedores.ts
  ↓
Tabelas: companies + company_relationships (type=client/partner/supplier) + company_contacts
  ↓
Repository: src/repositories/companies.repository.ts (EXISTS), partners.repository.ts (EXISTS), suppliers.repository.ts (EXISTS)
  ↓
Hook: src/hooks/useCompanies.ts, usePartners.ts, useSuppliers.ts (CRIAR)
  ↓
UI Pública: src/pages/Empresas.tsx, Clientes.tsx, Parceiros.tsx, Fornecedores.tsx (trocar mocks)
UI SaaS: src/pages/dashboard/* (já usam repositories)
```

**Ação necessária**:

1. `partnersRepository` e `suppliersRepository` usam tabelas `partners`/`suppliers` que **NÃO existem no schema V2.1**
2. Precisam ser reescritos para usar `companies` + `company_relationships`
3. Criar hooks correspondentes

### 5.4 Serviços

```text
Mock: src/services/mock/services.ts (mockServices[], mockGetServices(), mockGetServiceBySlug())
  ↓
Tabela: service_orders (ou tabela específica de serviços)
  ↓
Repository: src/repositories/services.repository.ts (EXISTS — usa service_orders)
  ↓
Hook: src/hooks/useServices.ts (CRIAR)
  ↓
UI Pública: src/pages/Servicos.tsx, ServicoDetalhe.tsx (trocar mock)
UI SaaS: src/pages/dashboard/Servicos.tsx (já usa servicesRepository)
```

### 5.5 Contatos / Suporte

```text
Mock: src/services/mock/contatos.ts (mockSubmitContact, mockGetContacts)
  ↓
Tabela: support_tickets
  ↓
Repository: src/repositories/support-tickets.repository.ts (EXISTS)
  ↓
Hook: — (criar se necessário)
  ↓
UI Pública: src/pages/Suporte.tsx, Contato.tsx (trocar mock)
UI SaaS: src/pages/dashboard/Suporte.tsx (já usa supportTicketsRepository)
```

### 5.6 Auth

```text
Mock: src/services/mock/auth.ts (mockLogin, mockLogout)
  ↓
Tabela: auth.users (Supabase Auth) + people
  ↓
Repository: N/A (usa Supabase Auth SDK)
  ↓
Context: src/contexts/AuthContext.tsx (já integrado com Supabase)
  ↓
UI: Login.tsx, Cadastro.tsx, etc.
```

**Status**: ✅ Auth já está conectado ao Supabase. O mock é fallback apenas.

---

## 6. Gaps Críticos (o que NÃO existe ainda)

| #   | Gap                                                                                | Impacto                                         | Prioridade |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------------------- | ---------- |
| 1   | **Deploy não realizado**                                                           | Site publicado é PHP legado, não o React app    | 🔴 CRÍTICO |
| 2   | `partnersRepository` / `suppliersRepository` usam tabelas inexistentes             | Erro em tempo de execução                       | 🔴 CRÍTICO |
| 3   | Hooks `useJobs`, `useCandidates`, `useCompanies`, etc. não existem                 | Páginas públicas não podem consumir dados reais | 🔴 CRÍTICO |
| 4   | Seeds das 17 vagas não aplicadas                                                   | `jobs` vazio no banco                           | 🟡 ALTA    |
| 5   | Seeds de empresas/parceiros/fornecedores não criadas                               | `companies` + `company_relationships` vazios    | 🟡 ALTA    |
| 6   | `recruitment_processes` e `recruitment_demands` não têm repository/hook/UI         | Funcionalidade inacessível                      | 🟡 MÉDIA   |
| 7   | `support_tickets` no público usa mock, não repository                              | Dados não persistidos                           | 🟡 MÉDIA   |
| 8   | `financial_transactions`, `stock_movements`, `products` sem seeds                  | Dashboards vazios                               | 🟡 MÉDIA   |
| 9   | Páginas públicas (Servicos, Blog, Sobre, FAQ) são mini-landpages com conteúdo mock | Conteúdo não gerenciável                        | 🟢 BAIXA   |
| 10  | `.env` e `.env.local` tracked no Git                                               | Risco de segurança                              | 🔴 CRÍTICO |

---

## 7. Fluxo de Dados Canônico (V2.1)

```text
Banco (Supabase)
   ↓
Migration (schema + seed)
   ↓
Repository (acesso tipado, RLS)
   ↓
Hook (estado local + cache)
   ↓
Página/Componente (UI existente)
   ↓
RBAC (PermissionGuard filtra por permissão)
```

**Nunca**:

- ❌ Frontend decide segurança → RLS + backend decidem
- ❌ Dados mockados substituem dados reais → substituir fonte, não UI
- ❌ Credenciais no código → variáveis de ambiente + secret manager

---

## 8. Próximos Passos (ordem sugerida)

1. **Fazer deploy do React app** — sem isso, nada do resto é visível para usuários
2. **Corrigir `partnersRepository` / `suppliersRepository`** — usar `companies` + `company_relationships`
3. **Criar migration de seed das 17 vagas** — exatamente os dados do mock
4. **Criar hooks** (`useJobs`, `useCandidates`, `useCompanies`, `usePartners`, `useSuppliers`, `useServices`)
5. **Conectar páginas públicas** — substituir mock por hook, mantendo a UI intacta
6. **Criar seeds de empresas/parceiros/fornecedores** — dados de exemplo para o CRM
7. **Criar seeds de candidatos** — currículos de exemplo
8. **Implementar `recruitment_processes`** — tela + repository + hook
9. **Remover `.env` / `.env.local` do tracking** — segurança
10. **Configurar CI/CD** — deploy automático no push para main

---

## 9. Regras de Ouro

1. **People é identidade canônica** — não criar tabelas de usuário duplicadas
2. **companies é global** — clientes/parceiros/fornecedores são `company_relationships`
3. **jobs é tenant-scoped** — slug único por tenant, não global
4. **candidates é contexto de recrutamento** — pessoa pode ser candidata em múltiplos tenants
5. **RLS protege tudo** — frontend não decide acesso, RLS + role_assignments decidem
6. **Seed é idempotente** — `ON CONFLICT DO NOTHING`
7. **UI é reaproveitada** — trocar dados, não telas
8. **Sem credenciais no Git** — nunca

---

_Documento gerado em: 2026-08-24_
_Versão: V2.1_
_Empresa: J&S Empregos LTDA_
