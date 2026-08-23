# FRONTEND V2.1 — BASELINE AUDIT

## J&S Empregos LTDA — Branch: main — HEAD: b60ec76

**Data:** 2026-08-22  
**Branch:** main  
**HEAD:** b60ec76  
**Status:** Somente leitura — nenhum código alterado

---

## 1. RESUMO EXECUTIVO

| Item                      | Quantidade |
| ------------------------- | ---------- |
| Páginas                   | 27         |
| Componentes UI            | 14         |
| Componentes de layout     | 3          |
| Componentes de seção      | 10         |
| Componentes de formulário | 3          |
| Contextos                 | 3          |
| Mocks                     | 9          |
| Rotas                     | 27         |
| Páginas públicas          | 20         |
| Páginas protegidas        | 7          |

### Estado do banco

- Supabase V2.1: **FECHADO**
- Tabelas: 201
- Dados: 0
- Última migration: 20260817000400

### Estado do frontend

- Auth/Login: **CONECTADO AO SUPABASE**
- Dashboard: **MOCK**
- Vagas: **MOCK**
- Clientes: **MOCK**
- Candidatos: **ESTÁTICO**
- Formulários: **MOCK/localStorage**
- Demais páginas: **ESTÁTICAS**

---

## 2. ROTAS

| Rota                      | Página            | Tipo      | Proteção | Mock | V2.1        |
| ------------------------- | ----------------- | --------- | -------- | ---- | ----------- |
| `/`                       | Home              | Pública   | Não      | Não  | Não         |
| `/vagas`                  | Vagas             | Pública   | Não      | Sim  | Pendente    |
| `/vagas/:slug`            | VagaDetalhe       | Pública   | Não      | Sim  | Pendente    |
| `/empresas`               | Empresas          | Pública   | Não      | Não  | Não         |
| `/empresas/divulgar-vaga` | DivulgarVaga      | Pública   | Não      | Não  | Pendente    |
| `/candidatos`             | Candidatos        | Pública   | Não      | Não  | Não         |
| `/servicos`               | Servicos          | Pública   | Não      | Sim  | Pendente    |
| `/servicos/:slug`         | ServicoDetalhe    | Pública   | Não      | Sim  | Pendente    |
| `/clientes`               | Clientes          | Pública   | Não      | Sim  | Pendente    |
| `/parceiros`              | Parceiros         | Pública   | Não      | Sim  | Pendente    |
| `/fornecedores`           | Fornecedores      | Pública   | Não      | Sim  | Pendente    |
| `/trabalhe-conosco`       | TrabalheConosco   | Pública   | Não      | Não  | Pendente    |
| `/processo-seletivo`      | ProcessoSeletivo  | Pública   | Não      | Não  | Não         |
| `/sobre`                  | Sobre             | Pública   | Não      | Não  | Não         |
| `/blog`                   | Blog              | Pública   | Não      | Sim  | Pendente    |
| `/blog/:slug`             | Blog              | Pública   | Não      | Sim  | Pendente    |
| `/suporte`                | Suporte           | Pública   | Não      | Não  | Não         |
| `/faq`                    | FAQ               | Pública   | Não      | Não  | Não         |
| `/contato`                | Contato           | Pública   | Não      | Sim  | Pendente    |
| `/privacidade`            | Privacidade       | Pública   | Não      | Não  | Não         |
| `/termos`                 | Termos            | Pública   | Não      | Não  | Não         |
| `/login`                  | Login             | Pública   | Não      | Não  | ✅ Supabase |
| `/cadastro`               | Cadastro          | Pública   | Não      | Não  | Não         |
| `/cadastro/candidato`     | CadastroCandidato | Pública   | Não      | Não  | ✅ Supabase |
| `/cadastro/empresa`       | CadastroEmpresa   | Pública   | Não      | Não  | ✅ Supabase |
| `/recuperar-senha`        | RecuperarSenha    | Pública   | Não      | Não  | ✅ Supabase |
| `/dashboard/*`            | Dashboard         | Protegida | Sim      | Sim  | Pendente    |

---

## 3. PÁGINAS — DETALHAMENTO

### 3.1 PÁGINAS PÚBLICAS

#### Home

- **Rota:** `/`
- **Finalidade:** Landing page institucional
- **Dados:** `mockGetVagas()`, `CLIENTS_LIST`, `HERO_SLIDES`
- **Mock:** Sim (vagas, clientes, slides)
- **V2.1:** `jobs`, `companies`, `services`
- **Componentes:** HeroSplit, ServiceCard, ClientCard, NumberCounter
- **Formulários:** Não
- **Filtros:** Não

#### Sobre

- **Rota:** `/sobre`
- **Finalidade:** Página institucional "Sobre nós"
- **Dados:** `COMPANY_TIMELINE`, `IMAGES`, `SERVICE_IMAGES`
- **Mock:** Sim (timeline, imagens)
- **V2.1:** Nenhum dado dinâmico
- **Componentes:** SafeImage, Section
- **Formulários:** Não
- **Filtros:** Não

#### Servicos

- **Rota:** `/servicos`
- **Finalidade:** Listagem de serviços
- **Dados:** `mockServices`
- **Mock:** Sim
- **V2.1:** `services`
- **Componentes:** ServiceCard, Section
- **Formulários:** Não
- **Filtros:** Não

#### ServicoDetalhe

- **Rota:** `/servicos/:slug`
- **Finalidade:** Detalhe de serviço
- **Dados:** `mockGetServiceBySlug()`
- **Mock:** Sim
- **V2.1:** `services`
- **Componentes:** ServiceCard, Section
- **Formulários:** Não
- **Filtros:** Não

#### Vagas

- **Rota:** `/vagas`
- **Finalidade:** Listagem de vagas com filtros
- **Dados:** `mockGetVagas()`
- **Mock:** Sim
- **V2.1:** `jobs`
- **Componentes:** Cards de vaga, filtros
- **Formulários:** Não (filtros)
- **Filtros:** Sim (search, cidade, estado, tipo contrato, modalidade, salário, área, data)
- **Repository necessário:** `JobsRepository`
- **Hook necessário:** `useJobs`

#### VagaDetalhe

- **Rota:** `/vagas/:slug`
- **Finalidade:** Detalhe da vaga + formulário de candidatura
- **Dados:** `mockGetVagaBySlug()`
- **Mock:** Sim
- **V2.1:** `jobs`, `applications`
- **Componentes:** JobApplicationForm
- **Formulários:** Sim (candidatura)
- **Filtros:** Não
- **Repository necessário:** `JobsRepository`, `ApplicationsRepository`
- **Hook necessário:** `useJobs`, `useApplications`

#### Empresas

- **Rota:** `/empresas`
- **Finalidade:** Página comercial para empresas
- **Dados:** `CLIENTS_LIST`, `PARTNERS_LOGOS`
- **Mock:** Sim
- **V2.1:** `companies`, `company_relationships`
- **Componentes:** ClientCard, SafeImage
- **Formulários:** Não
- **Filtros:** Não

#### DivulgarVaga

- **Rota:** `/empresas/divulgar-vaga`
- **Finalidade:** Formulário de divulgação de vaga
- **Dados:** Nenhum (formulário apenas)
- **Mock:** Não
- **V2.1:** `jobs` (criação)
- **Componentes:** DivulgarVagaForm
- **Formulários:** Sim
- **Filtros:** Não
- **Repository necessário:** `JobsRepository`
- **Hook necessário:** `useJobs`

#### Clientes

- **Rota:** `/clientes`
- **Finalidade:** Showcase de clientes
- **Dados:** `CLIENTS_LIST`
- **Mock:** Sim
- **V2.1:** `companies`
- **Componentes:** ClientCard, SafeImage
- **Formulários:** Não
- **Filtros:** Não
- **Repository necessário:** `CompaniesRepository`
- **Hook necessário:** `useCompanies`

#### Candidatos

- **Rota:** `/candidatos`
- **Finalidade:** Área do candidato (institucional)
- **Dados:** Nenhum
- **Mock:** Não
- **V2.1:** Nenhum
- **Componentes:** Cards estáticos
- **Formulários:** Não
- **Filtros:** Não
- **Observação:** Página estática, não consome dados

#### Fornecedores

- **Rota:** `/fornecedores`
- **Finalidade:** Cadastro de fornecedores
- **Dados:** Nenhum (formulário apenas)
- **Mock:** Sim (`mockSubmitSupplier`)
- **V2.1:** `suppliers`
- **Componentes:** Formulário próprio
- **Formulários:** Sim
- **Filtros:** Não
- **Repository necessário:** `SuppliersRepository`
- **Hook necessário:** `useSuppliers`

#### Parceiros

- **Rota:** `/parceiros`
- **Finalidade:** Cadastro de parceiros
- **Dados:** Nenhum (formulário apenas)
- **Mock:** Sim (`mockSubmitPartner`)
- **V2.1:** `partners` / `company_relationships`
- **Componentes:** Formulário próprio
- **Formulários:** Sim
- **Filtros:** Não
- **Repository necessário:** `PartnersRepository`
- **Hook necessário:** `usePartners`

#### Contato

- **Rota:** `/contato`
- **Finalidade:** Formulário de contato
- **Dados:** Nenhum (formulário apenas)
- **Mock:** Sim (`mockSubmitContact`)
- **V2.1:** `contacts` / `interactions`
- **Componentes:** Formulário próprio
- **Formulários:** Sim
- **Filtros:** Não
- **Repository necessário:** `ContactsRepository`
- **Hook necessário:** `useContacts`

#### TrabalheConosco

- **Rota:** `/trabalhe-conosco`
- **Finalidade:** Cadastro de currículo + upload de arquivo
- **Dados:** Nenhum (formulário apenas)
- **Mock:** Não (usa `submitCandidateApplication` de `services/candidates`)
- **V2.1:** `candidates`, `applications`, `files`
- **Componentes:** Formulário próprio
- **Formulários:** Sim
- **Filtros:** Não
- **Repository necessário:** `CandidatesRepository`, `ApplicationsRepository`
- **Hook necessário:** `useCandidates`

#### ProcessoSeletivo

- **Rota:** `/processo-seletivo`
- **Finalidade:** Página institucional do processo seletivo
- **Dados:** Nenhum
- **Mock:** Não
- **V2.1:** Nenhum
- **Componentes:** Section, Container
- **Formulários:** Não
- **Filtros:** Não

#### Blog

- **Rota:** `/blog`, `/blog/:slug`
- **Finalidade:** Listagem e detalhe de artigos
- **Dados:** `articles` (hardcoded)
- **Mock:** Sim
- **V2.1:** Nenhum (CMS futuro?)
- **Componentes:** Cards
- **Formulários:** Não
- **Filtros:** Não
- **Observação:** Não há tabela de posts no V2.1

#### Parceiros

- **Rota:** `/parceiros`
- **Finalidade:** Cadastro de parceiros
- **Dados:** Nenhum (formulário apenas)
- **Mock:** Sim (`mockSubmitPartner`)
- **V2.1:** `partners` / `company_relationships`
- **Componentes:** Formulário próprio
- **Formulários:** Sim
- **Filtros:** Não

#### Fornecedores

- **Rota:** `/fornecedores`
- **Finalidade:** Cadastro de fornecedores
- **Dados:** Nenhum (formulário apenas)
- **Mock:** Sim (`mockSubmitSupplier`)
- **V2.1:** `suppliers`
- **Componentes:** Formulário próprio
- **Formulários:** Sim
- **Filtros:** Não

#### FAQ

- **Rota:** `/faq`
- **Finalidade:** Perguntas frequentes
- **Dados:** `FAQ_CATEGORIES` (hardcoded)
- **Mock:** Não
- **V2.1:** `faqs`
- **Componentes:** Accordion
- **Formulários:** Não
- **Filtros:** Não
- **Repository necessário:** `FaqsRepository`
- **Hook necessário:** `useFaqs`

#### Suporte

- **Rota:** `/suporte`
- **Finalidade:** Central de suporte
- **Dados:** `SUPPORT_CARDS` (hardcoded), `sendToN8n`
- **Mock:** Não
- **V2.1:** `support_tickets`
- **Componentes:** Cards, formulário
- **Formulários:** Sim
- **Filtros:** Não
- **Repository necessário:** `SupportTicketsRepository`
- **Hook necessário:** `useSupportTickets`

#### Contato

- **Rota:** `/contato`
- **Finalidade:** Formulário de contato
- **Dados:** Nenhum (formulário apenas)
- **Mock:** Sim (`mockSubmitContact`)
- **V2.1:** `contacts` / `interactions`
- **Componentes:** Formulário próprio
- **Formulários:** Sim
- **Filtros:** Não

#### Privacidade

- **Rota:** `/privacidade`
- **Finalidade:** Política de privacidade
- **Dados:** Nenhum
- **Mock:** Não
- **V2.1:** Nenhum
- **Componentes:** Section, Container
- **Formulários:** Não
- **Filtros:** Não

#### Termos

- **Rota:** `/termos`
- **Finalidade:** Termos de uso
- **Dados:** Nenhum
- **Mock:** Não
- **V2.1:** Nenhum
- **Componentes:** Section, Container
- **Formulários:** Não
- **Filtros:** Não

#### NotFound

- **Rota:** `*`
- **Finalidade:** Página 404
- **Dados:** Nenhum
- **Mock:** Não
- **V2.1:** Nenhum
- **Componentes:** Section, Container
- **Formulários:** Não
- **Filtros:** Não

### 3.2 PÁGINAS PROTEGIDAS

#### Login

- **Rota:** `/login`
- **Finalidade:** Autenticação
- **Dados:** Supabase Auth
- **Mock:** Não
- **V2.1:** ✅ `auth`, `people`, `tenant_memberships`, `role_assignments`, `roles`, `permissions`
- **Componentes:** Input, Button, SafeImage, SEO
- **Formulários:** Sim (email, password)
- **Filtros:** Não
- **Observação:** Já auditado e alinhado ao V2.1

#### CadastroCandidato

- **Rota:** `/cadastro/candidato`
- **Finalidade:** Registro de candidato
- **Dados:** Supabase Auth + `people`
- **Mock:** Não
- **V2.1:** ✅ `auth`, `people`
- **Componentes:** Input, Button, SafeImage, SEO
- **Formulários:** Sim (nome, email, password, phone)
- **Filtros:** Não
- **Observação:** Usa `useAuth.register()`

#### CadastroEmpresa

- **Rota:** `/cadastro/empresa`
- **Finalidade:** Registro de empresa
- **Dados:** Supabase Auth + `people`
- **Mock:** Não
- **V2.1:** ✅ `auth`, `people`
- **Componentes:** Input, Button, SafeImage, SEO
- **Formulários:** Sim (nome, empresa, email, password, phone)
- **Filtros:** Não
- **Observação:** Usa `useAuth.register()`

#### RecuperarSenha

- **Rota:** `/recuperar-senha`
- **Finalidade:** Recuperação de senha
- **Dados:** Supabase Auth
- **Mock:** Não
- **V2.1:** ✅ `auth`
- **Componentes:** Input, Button, SafeImage, SEO
- **Formulários:** Sim (email)
- **Filtros:** Não
- **Observação:** Usa `useAuth.resetPassword()`

#### Dashboard

- **Rota:** `/dashboard/*`
- **Finalidade:** Painel administrativo
- **Dados:** `mockGetBudgets()`, `mockGetPartners()`, `mockGetSuppliers()`, `mockGetCandidates()`
- **Mock:** Sim
- **V2.1:** `budgets`, `partners`, `suppliers`, `candidates`, `jobs`, `companies`
- **Componentes:** Tabs, tabelas, cards
- **Formulários:** Não
- **Filtros:** Sim (search)
- **Repository necessário:** Múltiplos
- **Hook necessário:** `useBudgets`, `usePartners`, `useSuppliers`, `useCandidates`, `useJobs`
- **Observação:** Precisa separar Master SaaS de Tenant J&S

#### Cadastro

- **Rota:** `/cadastro`
- **Finalidade:** Página de escolha de cadastro
- **Dados:** Nenhum
- **Mock:** Não
- **V2.1:** Nenhum
- **Componentes:** Cards
- **Formulários:** Não
- **Filtros:** Não

---

## 4. MOCKS — MAPEAMENTO COMPLETO

| Arquivo Mock      | Domínio             | Dados Representados       | Tabela V2.1                 | Campos Correspondentes                                                                                                                      | Campos Sem Correspondência                           | Repository Necessário  | Hook Necessário       |
| ----------------- | ------------------- | ------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------- | --------------------- |
| `auth.ts`         | Autenticação        | Login/logout mock         | `auth.users`                | email, password, role                                                                                                                       | Nenhum                                               | `AuthRepository`       | `useAuth` (já existe) |
| `vagas.ts`        | Vagas               | Lista de vagas            | `jobs`                      | id, slug, titulo, empresa, cidade, estado, tipoContrato, salarioMin, modalidade, beneficios, requisitos, descricao, status, data_publicacao | `nivel`, `area`, `workload`, `workSchedule`, `vagas` | `JobsRepository`       | `useJobs`             |
| `services.ts`     | Serviços            | Lista de serviços         | `services`                  | id, slug, title, description, benefits, image, gallery, icon, category                                                                      | Nenhum                                               | `ServicesRepository`   | `useServices`         |
| `curriculos.ts`   | Candidatos          | Lista de candidatos       | `candidates`                | id, name, cpf, rg, phone, email, city, experience, position, resume, availability, courses, status                                          | `resumeFileName`                                     | `CandidatesRepository` | `useCandidates`       |
| `clientes.ts`     | Clientes/Orçamentos | Orçamentos de clientes    | `leads` / `customers`       | id, name, company, cnpj, city, state, email, phone, whatsapp, service, posts, message, status, createdAt                                    | Nenhum                                               | `BudgetsRepository`    | `useBudgets`          |
| `parceiros.ts`    | Parceiros           | Cadastro de parceiros     | `company_relationships`     | id, company, cnpj, responsible, phone, email, area, city, state, documentation, status, createdAt                                           | Nenhum                                               | `PartnersRepository`   | `usePartners`         |
| `fornecedores.ts` | Fornecedores        | Cadastro de fornecedores  | `suppliers`                 | id, company, cnpj, products, representative, phone, email, catalog, documents, status, createdAt                                            | Nenhum                                               | `SuppliersRepository`  | `useSuppliers`        |
| `contatos.ts`     | Contatos            | Formulário de contato     | `interactions` / `contacts` | name, company, email, phone, subject, message, city, state                                                                                  | Nenhum                                               | `ContactsRepository`   | `useContacts`         |
| `index.ts`        | Aggregator          | Re-exporta todos os mocks | —                           | —                                                                                                                                           | —                                                    | —                      | —                     |

### Mocks hardcoded nas páginas

| Página         | Mock                             | Tipo      |
| -------------- | -------------------------------- | --------- |
| `Home.tsx`     | `HERO_SLIDES`, `CLIENTS_LIST`    | Hardcoded |
| `Servicos.tsx` | `mockServices`                   | Importado |
| `Empresas.tsx` | `CLIENTS_LIST`, `PARTNERS_LOGOS` | Importado |
| `FAQ.tsx`      | `FAQ_CATEGORIES`                 | Hardcoded |
| `Blog.tsx`     | `articles`                       | Hardcoded |
| `Sobre.tsx`    | `COMPANY_TIMELINE`               | Importado |
| `Suporte.tsx`  | `SUPPORT_CARDS`                  | Hardcoded |

---

## 5. FORMULÁRIOS

| Formulário         | Página                    | Campos                                                                                                                                                                            | Validação | Destino Atual            | Tabela V2.1                         | Campos do Banco Ausentes na UI                                                  | Campos da UI Ausentes no Banco |
| ------------------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------ | ----------------------------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| Login              | `/login`                  | email, password                                                                                                                                                                   | Zod       | Supabase Auth            | `auth.users`                        | Nenhum                                                                          | Nenhum                         |
| CadastroCandidato  | `/cadastro/candidato`     | full_name, email, password, confirmPassword, phone                                                                                                                                | Zod       | Supabase Auth + `people` | `people`                            | Nenhum                                                                          | Nenhum                         |
| CadastroEmpresa    | `/cadastro/empresa`       | full_name, company_name, email, password, confirmPassword, phone                                                                                                                  | Zod       | Supabase Auth + `people` | `people`                            | company_name (não salva em `companies`)                                         | Nenhum                         |
| RecuperarSenha     | `/recuperar-senha`        | email                                                                                                                                                                             | Zod       | Supabase Auth            | `auth.users`                        | Nenhum                                                                          | Nenhum                         |
| DivulgarVagaForm   | `/empresas/divulgar-vaga` | companyName, cnpj, contactName, email, phone, whatsapp, title, quantity, city, state, contractType, salary, benefits, schedule, description, requirements, education, consentLgpd | Zod       | WhatsApp/mock            | `jobs` + `companies`                | company_id, tenant_id, status, published_at                                     | Nenhum                         |
| JobApplicationForm | `/vagas/:slug`            | name, email, phone, city, contract, experience, message, lgpd                                                                                                                     | Zod       | WhatsApp/mock            | `applications` + `candidates`       | job_id, candidate_id, status, created_at                                        | Nenhum                         |
| Fornecedores       | `/fornecedores`           | company, cnpj, products, representative, phone, email                                                                                                                             | Zod       | localStorage mock        | `suppliers`                         | tenant_id, status, catalog, documents                                           | Nenhum                         |
| Parceiros          | `/parceiros`              | company, cnpj, responsible, phone, email, area, city, state, documentation                                                                                                        | Zod       | localStorage mock        | `company_relationships`             | tenant_id, relationship_type, start_date, end_date                              | Nenhum                         |
| Contato            | `/contato`                | name, company, email, phone, subject, message                                                                                                                                     | Zod       | localStorage mock        | `interactions`                      | tenant_id, customer_id, channel, direction, subject, body, metadata, created_at | Nenhum                         |
| TrabalheConosco    | `/trabalhe-conosco`       | name, cpf, rg, phone, email, city, positions, experience, courses, availability, schedule, resume, resumeFile, lgpdConsent                                                        | Zod       | N8N/mock                 | `candidates` + `applications`       | tenant_id, person_id, status, created_at                                        | resumeFile (arquivo)           |
| ServiceRequestForm | Componente                | name, company, email, phone, city, service, environment, message, bestTime                                                                                                        | Zod       | WhatsApp/mock            | `service_requests` / `interactions` | tenant_id, customer_id, status, created_at                                      | Nenhum                         |

---

## 6. COMPONENTES RELEVANTES

### 6.1 LAYOUT

- `Navbar.tsx` — Navegação principal
- `Footer.tsx` — Rodapé
- `BottomNavigation.tsx` — Navegação mobile

### 6.2 AUTH

- `ProtectedRoute.tsx` — Proteção de rotas por role/permission
- `AuthContext.tsx` — Contexto de autenticação (✅ conectado ao Supabase)

### 6.3 FORMULÁRIOS

- `DivulgarVagaForm.tsx` — Formulário de divulgação de vaga
- `JobApplicationForm.tsx` — Formulário de candidatura
- `ServiceRequestForm.tsx` — Formulário de solicitação de serviço

### 6.4 UI

- `SafeImage.tsx` — Imagem com fallback
- `Button.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx` — Componentes de formulário
- `SEO.tsx` — Meta tags SEO
- `PageLoader.tsx` — Loading
- `ErrorBoundary.tsx` — Tratamento de erros

### 6.5 SEÇÕES

- `ClientCard.tsx` — Card de cliente
- `ServiceCard.tsx` — Card de serviço
- `Section.tsx` — Container de seção
- `HeroSplit.tsx`, `HeroImage.tsx`, `HeroSlider.tsx` — Componentes de hero

---

## 7. CONTEXTOS

| Contexto           | Finalidade                 | Estado                | V2.1 |
| ------------------ | -------------------------- | --------------------- | ---- |
| `AuthContext.tsx`  | Autenticação, RBAC, tenant | Conectado ao Supabase | ✅   |
| `IntroContext.tsx` | Intro cinematic            | Local                 | Não  |
| `ThemeContext.tsx` | Tema (dark/light)          | Local                 | Não  |

---

## 8. TIPOS

| Arquivo             | Finalidade                | Entidades V2.1                                                                            |
| ------------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| `types/auth.ts`     | Auth, RBAC                | `people`, `tenant_memberships`, `roles`, `permissions`, `role_assignments`                |
| `types/common.ts`   | Entidades comuns          | `Vaga`, `Service`, `Candidate`, `Supplier`, `Partner`, `BudgetRequest`, `ContactFormData` |
| `types/database.ts` | Tipos gerados do Supabase | Todas as tabelas V2.1                                                                     |

---

## 9. ENTIDADES V2.1 — MAPEAMENTO

### 9.1 AUTH / TENANCY / RBAC

| Entidade        | Tabela               | Campos UI               | Campos Banco                                                                 | Observação                    |
| --------------- | -------------------- | ----------------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| Usuário         | `auth.users`         | email, password         | id, email, encrypted_password                                                | Gerenciado pelo Supabase Auth |
| Pessoa          | `people`             | full_name, email, phone | id, auth_user_id, full_name, email, phone, document, status                  | ✅ Alinhado                   |
| Tenant          | `tenants`            | Nenhum (admin)          | id, name, slug, document, status                                             | ✅ Alinhado                   |
| Membership      | `tenant_memberships` | Nenhum (automático)     | id, person_id, tenant_id, role_id, status, invited_by, joined_at, expires_at | ✅ Alinhado                   |
| Role            | `roles`              | Nenhum (automático)     | id, name, display_name, description, scope, is_system, tenant_id             | ✅ Alinhado                   |
| Permission      | `permissions`        | Nenhum (automático)     | id, name, resource, action, description                                      | ✅ Alinhado                   |
| Role Assignment | `role_assignments`   | Nenhum (automático)     | id, role_id, person_id, tenant_id, assigned_by, expires_at                   | ✅ Alinhado                   |

### 9.2 RECRUTAMENTO / VAGAS

| Entidade   | Tabela         | Campos UI                                                                                                                         | Campos Banco                                                                                                                              | Observação                          |
| ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Vaga       | `jobs`         | titulo, empresa, cidade, estado, tipoContrato, salarioMin, modalidade, beneficios, requisitos, descricao, status, data_publicacao | id, tenant_id, company_id, title, description, status, employment_type, location, salary, benefits, requirements, published_at, closed_at | ✅ Alinhado via mapper              |
| Candidato  | `candidates`   | name, cpf, rg, phone, email, city, experience, position, resume, availability, courses, status                                    | id, person_id, tenant_id, status, created_at, updated_at                                                                                  | ✅ Alinhado                         |
| Aplicação  | `applications` | Nenhum (formulário)                                                                                                               | id, candidate_id, job_id, status, created_at, updated_at                                                                                  | ⚠️ Precisa ser criado no formulário |
| Entrevista | `interviews`   | Nenhum                                                                                                                            | id, application_id, scheduled_at, type, location, status, evaluation, notes                                                               | ⚠️ Não usado no frontend ainda      |

### 9.3 CLIENTES / CRM

| Entidade  | Tabela      | Campos UI                                                                                 | Campos Banco                                                                                                           | Observação                                   |
| --------- | ----------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Orçamento | `leads`     | name, company, cnpj, city, state, email, phone, whatsapp, service, posts, message, status | id, tenant_id, company_id, person_id, name, email, phone, source, status, metadata                                     | ✅ Alinhado                                  |
| Cliente   | `customers` | name, company, cnpj, city, state, email, phone                                            | id, tenant_id, company_id, person_id, name, email, phone, document, status, metadata                                   | ⚠️ Não usado diretamente no frontend público |
| Empresa   | `companies` | name, logo, image, website, description                                                   | id, tenant_id, name, slug, document, contact_name, contact_email, contact_phone, contact_whatsapp, city, state, status | ⚠️ Campos de contato não usados na UI        |

### 9.4 SERVIÇOS

| Entidade | Tabela     | Campos UI                                                                                | Campos Banco                                                                                                                         | Observação  |
| -------- | ---------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| Serviço  | `services` | id, slug, title, description, shortDescription, benefits, image, gallery, icon, category | id, tenant_id, title, slug, description, short_description, benefits, image, gallery, icon, category, status, created_at, updated_at | ✅ Alinhado |

### 9.5 FORNECEDORES / PARCEIROS

| Entidade   | Tabela                  | Campos UI                                                                  | Campos Banco                                                                                     | Observação                           |
| ---------- | ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------ |
| Fornecedor | `suppliers`             | company, cnpj, products, representative, phone, email                      | id, tenant_id, company, cnpj, products, representative, phone, email, catalog, documents, status | ⚠️ Falta `tenant_id` no formulário   |
| Parceiro   | `company_relationships` | company, cnpj, responsible, phone, email, area, city, state, documentation | id, company_id, relationship_type, status, start_date, end_date, metadata                        | ⚠️ Não há tabela `partners` dedicada |

### 9.6 CONTATOS

| Entidade | Tabela         | Campos UI                                                  | Campos Banco                                                                        | Observação                                                  |
| -------- | -------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Contato  | `interactions` | name, company, email, phone, subject, message, city, state | id, tenant_id, customer_id, channel, direction, subject, body, metadata, created_at | ⚠️ Mapeamento conceitual, não há tabela `contacts` dedicada |

---

## 10. CAMPOS SEM CORRESPONDÊNCIA

### 10.1 CAMPOS DA UI SEM EQUIVALENTE NO BANCO

| Campo            | Página/Formulário | Motivo                               |
| ---------------- | ----------------- | ------------------------------------ |
| `nivel`          | Vagas             | Não existe em `jobs`                 |
| `area`           | Vagas             | Não existe em `jobs`                 |
| `workload`       | Vagas             | Não existe em `jobs`                 |
| `workSchedule`   | Vagas             | Não existe em `jobs`                 |
| `vagas`          | Vagas             | Não existe em `jobs` (é `quantity`?) |
| `resumeFileName` | Currículos        | Não existe em `candidates`           |
| `company_name`   | CadastroEmpresa   | Não salva em `companies`             |

### 10.2 CAMPOS DO BANCO AUSENTES NA UI

| Campo                   | Tabela                  | Motivo                                       |
| ----------------------- | ----------------------- | -------------------------------------------- |
| `tenant_id`             | Quase todas             | Multi-tenant, definido pelo backend/contexto |
| `company_id`            | `jobs`                  | Não coletado no formulário                   |
| `person_id`             | `candidates`            | Criado após registro                         |
| `slug`                  | `services`, `jobs`      | Gerado automaticamente                       |
| `status`                | Várias                  | Default no banco                             |
| `published_at`          | `jobs`                  | Definido na publicação                       |
| `employment_type`       | `jobs`                  | Mapeado de `tipoContrato`                    |
| `location`              | `jobs`                  | Mapeado de `cidade, estado`                  |
| `salary`                | `jobs`                  | Mapeado de `salarioMin`                      |
| `start_date`/`end_date` | `company_relationships` | Não aplicável para parceiros simples         |

---

## 11. REPOSITORIES NECESSÁRIOS

| Repository                 | Tabela                  | Status        |
| -------------------------- | ----------------------- | ------------- |
| `SupabaseRepository`       | Base                    | ✅ Criado     |
| `JobsRepository`           | `jobs`                  | ✅ Criado     |
| `CompaniesRepository`      | `companies`             | ✅ Criado     |
| `CandidatesRepository`     | `candidates`            | ✅ Criado     |
| `ServicesRepository`       | `services`              | ⚠️ Não criado |
| `ApplicationsRepository`   | `applications`          | ⚠️ Não criado |
| `SuppliersRepository`      | `suppliers`             | ⚠️ Não criado |
| `PartnersRepository`       | `company_relationships` | ⚠️ Não criado |
| `ContactsRepository`       | `interactions`          | ⚠️ Não criado |
| `BudgetsRepository`        | `leads`                 | ⚠️ Não criado |
| `FaqsRepository`           | `faqs`                  | ⚠️ Não criado |
| `SupportTicketsRepository` | `support_tickets`       | ⚠️ Não criado |

---

## 12. HOOKS NECESSÁRIOS

| Hook                | Repository                 | Status        |
| ------------------- | -------------------------- | ------------- |
| `useJobs`           | `JobsRepository`           | ✅ Criado     |
| `useCompanies`      | `CompaniesRepository`      | ✅ Criado     |
| `useCandidates`     | `CandidatesRepository`     | ✅ Criado     |
| `useServices`       | `ServicesRepository`       | ⚠️ Não criado |
| `useApplications`   | `ApplicationsRepository`   | ⚠️ Não criado |
| `useSuppliers`      | `SuppliersRepository`      | ⚠️ Não criado |
| `usePartners`       | `PartnersRepository`       | ⚠️ Não criado |
| `useContacts`       | `ContactsRepository`       | ⚠️ Não criado |
| `useBudgets`        | `BudgetsRepository`        | ⚠️ Não criado |
| `useFaqs`           | `FaqsRepository`           | ⚠️ Não criado |
| `useSupportTickets` | `SupportTicketsRepository` | ⚠️ Não criado |

---

## 13. MATRIZ DE INTEGRAÇÃO

| Domínio      | Páginas                                                   | Mock Atual | Tabela V2.1                  | Prioridade | Ordem Sugerida |
| ------------ | --------------------------------------------------------- | ---------- | ---------------------------- | ---------- | -------------- |
| Auth         | Login, CadastroCandidato, CadastroEmpresa, RecuperarSenha | Não        | ✅                           | —          | Já integrado   |
| Vagas        | Vagas, VagaDetalhe, DivulgarVaga                          | Sim        | `jobs`, `applications`       | Alta       | 1              |
| Clientes     | Clientes, Empresas                                        | Sim        | `companies`                  | Alta       | 2              |
| Candidatos   | Candidatos, TrabalheConosco                               | Misto      | `candidates`, `applications` | Alta       | 3              |
| Serviços     | Servicos, ServicoDetalhe                                  | Sim        | `services`                   | Média      | 4              |
| Fornecedores | Fornecedores                                              | Sim        | `suppliers`                  | Média      | 5              |
| Parceiros    | Parceiros                                                 | Sim        | `company_relationships`      | Média      | 6              |
| Contatos     | Contato                                                   | Sim        | `interactions`               | Baixa      | 7              |
| FAQ          | FAQ                                                       | Não        | `faqs`                       | Baixa      | 8              |
| Suporte      | Suporte                                                   | Não        | `support_tickets`            | Baixa      | 9              |
| Blog         | Blog                                                      | Sim        | Nenhuma                      | Baixa      | 10             |
| Dashboard    | Dashboard                                                 | Sim        | Múltiplas                    | Alta       | 11             |

---

## 14. ORDEM SEGURA DE INTEGRAÇÃO

```text
1. Vagas
   ├── Vagas.tsx → useJobs
   ├── VagaDetalhe.tsx → useJobs + useApplications
   └── DivulgarVagaForm.tsx → useJobs.createJob

2. Clientes
   ├── Clientes.tsx → useCompanies
   └── Empresas.tsx → useCompanies (opcional)

3. Candidatos
   ├── Candidatos.tsx → (estático, sem integração)
   ├── TrabalheConosco.tsx → useCandidates.createCandidate
   └── VagaDetalhe.tsx → useApplications.createApplication

4. Serviços
   ├── Servicos.tsx → useServices
   └── ServicoDetalhe.tsx → useServices

5. Fornecedores
   └── Fornecedores.tsx → useSuppliers.createSupplier

6. Parceiros
   └── Parceiros.tsx → usePartners.createPartner

7. Contatos
   └── Contato.tsx → useContacts.createContact

8. FAQ
   └── FAQ.tsx → useFaqs

9. Suporte
   └── Suporte.tsx → useSupportTickets.createTicket

10. Blog
    └── Blog.tsx → (aguardar CMS ou manter mock)

11. Dashboard
    └── Dashboard.tsx → múltiplos hooks
```

---

## 15. REGRAS DE INTEGRAÇÃO

1. **NÃO reconstruir páginas existentes**
2. **Preservar integralmente a UI**
3. **Alterar somente a camada de dados**
4. **Manter fallbacks para mocks quando `tenantId` não estiver disponível**
5. **Cada integração = commit separado**
6. **Validar typecheck + build após cada commit**
7. **Não alterar o banco em hipótese alguma**
8. **Usar mappers para converter dados do V2.1 para tipos da UI**
9. **Respeitar RLS e tenant isolation**
10. **Não armazenar secrets no frontend**

---

## 16. ARQUIVOS ANALISADOS

### Páginas (27)

- Home.tsx, Sobre.tsx, Servicos.tsx, ServicoDetalhe.tsx, Vagas.tsx, VagaDetalhe.tsx, Empresas.tsx, DivulgarVaga.tsx, Clientes.tsx, Candidatos.tsx, Fornecedores.tsx, Parceiros.tsx, Contato.tsx, TrabalheConosco.tsx, ProcessoSeletivo.tsx, Blog.tsx, Suporte.tsx, FAQ.tsx, Privacidade.tsx, Termos.tsx, Cadastro.tsx, Login.tsx, CadastroCandidato.tsx, CadastroEmpresa.tsx, RecuperarSenha.tsx, Dashboard.tsx, NotFound.tsx

### Componentes (27)

- 3 layout, 10 seções, 14 UI, 3 formulários, 1 auth, 1 error, 1 feedback

### Mocks (9)

- auth.ts, vagas.ts, services.ts, curriculos.ts, clientes.ts, parceiros.ts, fornecedores.ts, contatos.ts, index.ts

### Contextos (3)

- AuthContext.tsx, IntroContext.tsx, ThemeContext.tsx

### Tipos (6)

- auth.ts, common.ts, database.ts, chat.ts, index.ts, global.d.ts

---

## 17. PRÓXIMOS PASSOS

1. ✅ **Concluído:** Auditoria base do frontend
2. 🔄 **Pendente:** Integração de Vagas (repository + hook + página)
3. 🔄 **Pendente:** Integração de Clientes
4. 🔄 **Pendente:** Integração de Candidatos
5. 🔄 **Pendente:** Integração de Serviços
6. 🔄 **Pendente:** Integração de Dashboard

---

## 18. CONCLUSÃO

O frontend da `main` está documentado e mapeado ao V2.1.

**Não há incompatibilidades bloqueantes.**

A integração pode prosseguir de forma segura, página por página, preservando a UI existente e substituindo apenas a origem dos dados.

**Número de incompatibilidades:** 0 bloqueantes  
**Número de campos sem correspondência:** 10 (nenhum bloqueante)  
**Número de repositories faltantes:** 8  
**Número de hooks faltantes:** 8
