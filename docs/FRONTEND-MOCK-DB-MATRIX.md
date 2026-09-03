# Frontend × MOCK × DB Matrix

**Data:** 2026-09-03
**Status:** FASE 2 — Bloco 6 (Data Gate runtime) concluído. 4 páginas públicas validadas com Supabase remoto. UI/UX inalterada.

---

## Legenda

| Símbolo | Significado                                                    |
| ------- | -------------------------------------------------------------- |
| 🟢 DB   | Conectado ao Supabase (repository retorna do banco)            |
| 🟡 MOCK | Dados estáticos em `src/mock/*` ou `src/config/*`              |
| ⚙️ CODE | Comportamento/constante que continua no código (ex: URL, flag) |
| 🔵 CMS  | Deve ser editável pelo admin (futuro)                          |
| 🔴 BLOQ | Depende dos 4 blockers do banco (ver `FRONTEND-BLOCKERS.md`)   |
| ⚪ N/A  | Não se aplica a este domínio                                   |

---

## 1. Páginas públicas × Origem dos dados (validado em runtime, 2026-09-03)

| #   | Página           | Rota                 | Textos principais             | Imagens                                               | Listas/dados                                                      | Formulários             | Status                                                             | Validação runtime                                                                                                                                                         |
| --- | ---------------- | -------------------- | ----------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Home             | `/`                  | `COMPANY` (config), hardcoded | `IMAGES.hero.home.slides` (config)                    | `mock/home.ts`                                                    | ChatWidget, ContatoForm | 🟡 MOCK                                                            | n/a                                                                                                                                                                       |
| 2   | Clientes         | `/clientes`          | hardcoded                     | `CLIENTS_LIST.image`/`logo`                           | DB `public_companies_by_type` (4 reais) + `CLIENTS_LIST` fallback | —                       | 🟢 DB-first + mock fallback (migrado, contrato aprovado Bloco 8.1) | ✅ 4 cards premium DB-only: Abarca, Mistral Vidros, VECTOR, Vectro Engenharia. Zero "Teste". Logos, descriptions, websites e hero (Mistral) populados via seed Bloco 8.1. |
| 3   | Empresas         | `/empresas`          | hardcoded                     | `CLIENTS_LIST.logo`, `PARTNERS_LOGOS.photo`           | `CLIENTS_LIST` + `PARTNERS_LOGOS` (mock only)                     | —                       | 🟡 MOCK                                                            | n/a                                                                                                                                                                       |
| 4   | Empresa (detail) | `/empresas/:slug`    | DB `companies`                | DB `logo_url`, `relationship_metadata.hero_image_url` | DB `companiesRepository.findBySlug` + MOCK fallback               | —                       | 🟢 G12.5 concluído (DB-first + mock fallback)                      | n/a                                                                                                                                                                       |
| 5   | Vagas (lista)    | `/vagas`             | hardcoded                     | `IMAGES` (logos)                                      | DB `public_jobs_v1` (19 published)                                | filtros locais          | 🟢 DB-first (migrado, contrato aprovado Bloco 9)                   | ✅ 19 cards DB-only com todos os campos do MOCK: titulo, empresa, cidade/UF, contrato, salario range, modalidade, area, beneficios, botões Ver vaga + Candidatar-se.      |
| 6   | VagaDetalhe      | `/vagas/:slug`       | hardcoded                     | `IMAGES` (logo empresa)                               | DB `public_jobs_v1` por slug                                      | JobApplicationForm      | 🟢 DB-first (migrado)                                              | ✅ `/vagas/ajudante-geral-7e299dec` renderiza: H1 "Ajudante geral", H2 "Sobre a vaga"/"Requisitos"/"Benefícios", form "Candidatar-se".                                    |
| 7   | Servicos         | `/servicos`          | hardcoded                     | `IMAGES.services.*`                                   | DB `public_services_v1` (20 reais)                                | —                       | 🟢 DB-first (migrado — view `public_services_v1`)                  | ✅ 20 serviços seedados renderizam.                                                                                                                                       |
| 8   | ServicoDetalhe   | `/servicos/:slug`    | hardcoded                     | `IMAGES.services.*`                                   | `mock/services.ts` (pendente migração)                            | ServiceRequestForm      | 🟡 MOCK (`NotFoundState` integrado)                                | n/a                                                                                                                                                                       |
| 9   | Parceiros        | `/parceiros`         | hardcoded                     | `IMAGES`                                              | `mock/partners.ts`                                                | —                       | 🟡 MOCK intencional (sem `partner` no DB)                          | n/a                                                                                                                                                                       |
| 10  | Fornecedores     | `/fornecedores`      | hardcoded                     | `IMAGES`                                              | 4 fornecedores MOCK (Centauro, Pão de Açúcar, BB, TIM)            | FornecedorForm          | 🟡 MOCK com aviso "catálogo de demonstração"                       | ✅ Renderiza 4 cards MOCK + nota "Exibindo catálogo de demonstração. Os dados reais aparecerão automaticamente quando forem publicados."                                  |
| 11  | Candidatos       | `/candidatos`        | hardcoded                     | `IMAGES`                                              | ❓                                                                | CadastroCandidato link  | 🟡 GAP                                                             | n/a                                                                                                                                                                       |
| 12  | Sobre            | `/sobre`             | `COMPANY` (config)            | `IMAGES`                                              | `mock/company.ts`                                                 | —                       | 🟡 MOCK                                                            | n/a                                                                                                                                                                       |
| 13  | Blog             | `/blog`              | hardcoded                     | `IMAGES`                                              | ❓                                                                | —                       | 🟡 GAP                                                             | n/a                                                                                                                                                                       |
| 14  | FAQ              | `/faq`               | hardcoded                     | `IMAGES`                                              | ❓                                                                | —                       | 🟡 GAP                                                             | n/a                                                                                                                                                                       |
| 15  | Contato          | `/contato`           | `COMPANY`                     | `IMAGES.hero.contato`                                 | ❓                                                                | form local              | 🟡 MOCK                                                            | n/a                                                                                                                                                                       |
| 16  | ProcessoSeletivo | `/processo-seletivo` | hardcoded                     | `IMAGES`                                              | ❓                                                                | —                       | 🟡 GAP                                                             | n/a                                                                                                                                                                       |
| 17  | TrabalheConosco  | `/trabalhe-conosco`  | hardcoded                     | `IMAGES`                                              | `mock/testimonials.ts`                                            | TrabalheConoscoForm     | 🟡 MOCK                                                            | n/a                                                                                                                                                                       |
| 18  | Suporte          | `/suporte`           | hardcoded                     | `IMAGES`                                              | ❓                                                                | form local              | 🟡 GAP                                                             | n/a                                                                                                                                                                       |
| 19  | Termos           | `/termos`            | hardcoded (texto jurídico)    | —                                                     | —                                                                 | —                       | ⚙️ CODE (jurídico)                                                 | n/a                                                                                                                                                                       |
| 20  | Privacidade      | `/privacidade`       | hardcoded (texto jurídico)    | —                                                     | —                                                                 | —                       | ⚙️ CODE (jurídico)                                                 | n/a                                                                                                                                                                       |
| 21  | NotFound         | `/404`               | hardcoded                     | `IMAGES`                                              | —                                                                 | —                       | ⚙️ CODE                                                            | n/a                                                                                                                                                                       |

---

## 2. Mocks estáticos em `src/mock/*` (alvo de migração)

| Arquivo                    | Linhas | Quem importa                                          | Conteúdo principal                                          | Entidade DB alvo                                                | Status migração                              |
| -------------------------- | ------ | ----------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| `src/mock/home.ts`         | 68     | (importação dinâmica em `Home.tsx`)                   | Hero slides, métricas, showcases, CTAs                      | `services`, `companies`, `media_assets`, página `home` (futuro) | ⏸ pendente                                   |
| `src/mock/clients.ts`      | 47     | `Clientes.tsx` (fallback), `Empresas.tsx`, `Home.tsx` | Lista de empresas-cliente                                   | `companies` (relationship_type='client')                        | ✅ Migrado (DB-first + fallback)             |
| `src/mock/partners.ts`     | 45     | `Empresas.tsx`                                        | Lista de parceiros                                          | `companies` (relationship_type='partner')                       | ⏸ pendente (sem dados no DB)                 |
| `src/mock/services.ts`     | 124    | `Servicos.tsx` (parcial), `ServicoDetalhe.tsx`        | Catálogo de serviços                                        | `services` (já existe no DB!)                                   | 🟡 Parcial (lista migrada, detalhe pendente) |
| `src/mock/vagas.ts`        | ?      | (preservado como fallback)                            | Lista de vagas                                              | `jobs` (já migrado para DB)                                     | ✅ Migrado (DB-first + fallback)             |
| `src/mock/company.ts`      | 93     | `Sobre.tsx`                                           | Texto institucional, história, missão/visão/valores, equipe | `companies` (registro J&S) + `pages` ou `about_content`         | ⏸ pendente                                   |
| `src/mock/testimonials.ts` | 48     | (importação local em `TrabalheConosco`)               | Depoimentos                                                 | `testimonials` (não existe) → GAP                               | ⏸ pendente                                   |

---

## 3. Configs estáticas em `src/config/*`

| Arquivo                          | Linhas | Uso                                                                                      | Status                   | Entidade DB alvo                                        |
| -------------------------------- | ------ | ---------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| `src/config/company.ts`          | 50     | Footer, Navbar, Home, Sobre, Contato (CNPJ, endereço, redes sociais, telefone, métricas) | 🟡 MOCK                  | `companies` (registro J&S)                              |
| `src/config/contacts.ts`         | ?      | Telefones, e-mails, WhatsApp                                                             | 🟡 MOCK                  | `companies` + `company_social_links` (já tem migration) |
| `src/config/navigation.ts`       | 12     | Tipos de navegação                                                                       | ⚙️ CODE                  | —                                                       |
| `src/config/images.ts`           | 122    | **TODAS** as imagens SVG/PNG/WebP/JPG do site                                            | 🟡 MOCK                  | `media_assets` (entity_type)                            |
| `src/config/imageFallbacks.ts`   | ?      | Imagens de fallback por seção                                                            | 🟡 MOCK                  | `media_assets`                                          |
| `src/config/seo.ts`              | ?      | SEO defaults                                                                             | ⚙️ CODE (pode virar CMS) | `seo_settings` (futuro)                                 |
| `src/config/seoPages.ts`         | ?      | SEO por página                                                                           | 🟡 GAP                   | `pages.seo_*`                                           |
| `src/config/whatsappMessages.ts` | ?      | Mensagens pré-formatadas WhatsApp                                                        | ⚙️ CODE                  | —                                                       |
| `src/config/app.ts`              | ?      | Configuração geral (env, feature flags)                                                  | ⚙️ CODE                  | —                                                       |

---

## 4. Repositories já conectadas ao DB (🟢) — 60+

Todas as 60+ repositories em `src/repositories/*.repository.ts` usam `SupabaseRepository` (cliente Supabase injetado). **Infraestrutura de fetch está pronta.** Pontos de atenção:

- Muitas repositories verificam `if (!this.supabase) return []` — fallback silencioso para ambiente dev sem Supabase configurado. **Manter**.
- Algumas têm testes em `*.test.ts` (`companies.repository.test.ts`) — **não regredir**.
- Nenhuma repository usa mock local como fonte primária — a estrutura está pronta para DB-only.

---

## 5. Páginas de dashboard × Origem dos dados

> 80+ páginas em `src/pages/dashboard/*`. Resumo por módulo:

| Módulo               | Páginas                                                                                                                                                                                                            | Repository                                                                                              | Status          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------- |
| Visão Geral          | `VisaoGeral`, `GlobalDashboardPage`                                                                                                                                                                                | (vários agregados)                                                                                      | 🟢 DB           |
| Vagas                | `Vagas`, `ApplicationDetailPage`, `ProcessosSeletivos`                                                                                                                                                             | `jobs.repository`, `applications.repository`                                                            | 🟢 DB           |
| Candidatos           | `Candidatos`, `CandidatoDetalhe`, `Candidato*` (7 páginas)                                                                                                                                                         | `candidates.repository` + 6 repositories de filhos                                                      | 🟢 DB           |
| Empresas/CRM         | `Fornecedores`, `Parceiros`                                                                                                                                                                                        | `companies.repository`                                                                                  | 🟢 DB           |
| Financeiro           | `Financeiro`, `FinanceiroPage`, `FluxoDeCaixaPage`, `FiscalPage`, `BancosPage`, `ContasFinanceiras`, `Transacoes`, `Parcelamentos`, `NotasFiscais`, `Conciliacao`, `AccountsReceivableList`, `AccountsPayableList` | 8 repositories financeiros                                                                              | 🟢 DB           |
| Estoque/Almoxarifado | `Almoxarifado`, `Fornecedores`                                                                                                                                                                                     | `warehouse.repository`, `stock.repository`                                                              | 🟢 DB           |
| RH                   | `RhPage`, `Funcionarios`, `FuncionarioDetalhe`                                                                                                                                                                     | `employees.repository` + 7 repositories filhos                                                          | 🟢 DB           |
| Suporte              | `Suporte`, `LgpdPage`, `IntegracoesPage`, `IaPage`, `AuditoriaPage`                                                                                                                                                | `support.repository`                                                                                    | 🟢 DB           |
| Admin                | `TenantsPage`, `Usuarios`, `RolesPermissoesPage`, `RbacAuditPage`, `SegurancaPage`, `SessoesPage`, `MonitoramentoPage`, `OnboardingPage`, `SkillsPage`, `GestaoPage`, `GestaoSaaSPage`, `AssinaturasPage`          | `tenant.repository`, `users.repository`, `role.repository`, `permission.repository`, `audit.repository` | 🟢 DB           |
| Relatórios           | `Relatorios`, `relatorios/*` (12 páginas)                                                                                                                                                                          | agregados de outros                                                                                     | 🟢 DB           |
| Util                 | `UnderConstruction`                                                                                                                                                                                                | —                                                                                                       | ⚙️ CODE         |
| Config               | `TermosPage`, `NotificationsPage`                                                                                                                                                                                  | `notification.repository`                                                                               | 🟢 DB (parcial) |

---

## 6. Tipos de domínio × Repository × DB table

| Tipo (`src/types/domain/*`)        | Repository                 | Tabela DB               | Status  |
| ---------------------------------- | -------------------------- | ----------------------- | ------- |
| `application.ts`                   | `applications.repository`  | `applications`          | 🟢      |
| `billing.ts`                       | `billing.repository`       | ❓ (não auditado ainda) | 🟡 GAP  |
| `candidate.ts`                     | `candidates.repository`    | `candidates`            | 🟢      |
| `chat.ts`                          | (realtime direto)          | `chat_*`                | 🟢      |
| `company.ts`                       | `companies.repository`     | `companies`             | 🟢      |
| `employee*.ts` (7)                 | `employees.repository` + 6 | `employees` + filhos    | 🟢      |
| `finance.ts`                       | `finance.repository` + 7   | `financial_*`           | 🟢      |
| `fiscal.ts`                        | `fiscal.repository`        | ❓                      | 🟡 GAP  |
| `job.ts`                           | `jobs.repository`          | `jobs`                  | 🟢      |
| `notification.ts`                  | `notification.repository`  | `notifications`         | 🟢      |
| `permission.ts`                    | `permission.repository`    | `permissions`           | 🟢      |
| `person.ts`                        | (via AuthContext)          | `people`                | 🟢      |
| `recruitment*.ts` (4)              | `recruitment-*.repository` | `recruitment_*`         | 🟢      |
| `role.ts`                          | `role.repository`          | `roles`                 | 🟢      |
| `security.ts`                      | `security.repository`      | ❓                      | 🟡 GAP  |
| `service.ts`                       | `services.repository`      | `services`              | 🟢      |
| `stock.ts`                         | `stock.repository`         | ❓                      | 🟡 GAP  |
| `support.ts`                       | `support.repository`       | ❓                      | 🟡 GAP  |
| `tenant.ts`                        | `tenant.repository`        | `tenants`               | 🟢      |
| `warehouse.ts`                     | `warehouse.repository`     | ❓                      | 🟡 GAP  |
| `accounting.ts`                    | `accounting.repository`    | ❓                      | 🟡 GAP  |
| `database.ts`                      | (gerado)                   | `supabase` types        | 🟢      |
| `common.ts`, `auth.ts`, `index.ts` | (helpers)                  | —                       | ⚙️ CODE |

---

## 7. GAPs identificados

| #   | GAP                                                              | Origem frontend                                                                                     | Origem desejada                                                                                                      | Status (2026-09-03)                                                                                                                                                     |
| --- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | `testimonials` (depoimentos)                                     | `mock/testimonials.ts`                                                                              | nova tabela `testimonials` ou `media_assets` + `testimonials`                                                        | ⏸ pendente                                                                                                                                                              |
| G2  | `pages` (conteúdo de páginas estáticas: Sobre, FAQ, Blog, etc)   | `mock/company.ts`, hardcoded                                                                        | `pages` (tabela) com `content` jsonb                                                                                 | ⏸ pendente                                                                                                                                                              |
| G3  | `blog_posts` (lista + detalhe)                                   | hardcoded                                                                                           | `blog_posts` (já existe)                                                                                             | ⏸ pendente                                                                                                                                                              |
| G4  | `home_hero` (slides + CTAs)                                      | `mock/home.ts`                                                                                      | tabela `home_sections` ou config em `pages`                                                                          | ⏸ pendente                                                                                                                                                              |
| G5  | `metrics` (15 anos, 200 clientes, 500 profissionais, 50 cidades) | `COMPANY.businessAreas`/`clientsServed` etc                                                         | `companies.metadata` jsonb ou `site_settings` table                                                                  | ⏸ pendente                                                                                                                                                              |
| G6  | `seo_pages` (SEO por página)                                     | `config/seoPages.ts`                                                                                | `pages.seo_title`/`seo_description`                                                                                  | ⏸ pendente                                                                                                                                                              |
| G7  | `contact_form_submissions`                                       | form local (estado React)                                                                           | `contact_submissions` table                                                                                          | ⏸ pendente                                                                                                                                                              |
| G8  | `service_inquiries` (form de "Contratar Serviço")                | `ServiceRequestForm` (estado React)                                                                 | `service_inquiries` table                                                                                            | ⏸ pendente                                                                                                                                                              |
| G9  | `divulgar_vaga_submissions`                                      | `DivulgarVagaForm`                                                                                  | `job_posting_requests` table                                                                                         | ⏸ pendente                                                                                                                                                              |
| G10 | `trabalhe_conosco_submissions`                                   | `TrabalheConosco` form                                                                              | `talent_pool` ou `candidates`                                                                                        | ⏸ pendente                                                                                                                                                              |
| G11 | `images.*` (mapa de URLs hardcoded)                              | `config/images.ts`                                                                                  | `media_assets` (entity_type='home_hero'/'service'/'company' etc.)                                                    | ⏸ pendente (Bloco Media/Storage futuro — ver Seção 10.1)                                                                                                                |
| G12 | `site_settings` (nome, CNPJ, endereço, redes sociais, telefone)  | `config/company.ts`                                                                                 | `companies` (registro J&S) + `company_social_links`                                                                  | ⏸ pendente (já existe migration `company_social_links`)                                                                                                                 |
| G13 | `socials` em cards de `Clientes` e `Empresas`                    | `CLIENTS_LIST` (sem `socials`), `mapPublicCompanyByTypeToClientVisual` (`socials: null` hardcoding) | `company_social_links` (existe) + `loadSocials` (só usado em `findAllPublic`, não em `findPublicByRelationshipType`) | N/A no baseline — nenhum card mostra ícones sociais. Se adicionar, `loadSocials` precisa ser chamado no hook `useCompaniesByType` ou na view `public_companies_by_type` |
| G14 | `image` (hero image) em cards de `Clientes`                      | `CLIENTS_LIST.image`, `relationship_metadata.hero_image_url`                                        | `relationship_metadata.hero_image_url` (mapeia `ClientVisual.image`)                                                 | ✅ Resolvido — `buildClientFallback` e `mapPublicCompanyByTypeToClientVisual` ambos mapeiam `hero_image_url`                                                            |

---

## 8. Migrations Supabase aplicadas (Bloco 5, 2026-09-02)

| Arquivo                                                      | Status                  | Notas                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `20260902150001_backend_gate_final.sql`                      | ✅ aplicada             | Schema base, RLS, seeds                                                                                                                                                                                                                                                                                                  |
| `20260902160001_g12_companies_public_read.sql`               | ✅ aplicada             | View `public_companies`                                                                                                                                                                                                                                                                                                  |
| `20260902170001_bloco1_public_companies_by_type.sql`         | ✅ aplicada (corrigida) | Removido `c.is_active`; JOIN via `crt.code = cr.relationship_type`                                                                                                                                                                                                                                                       |
| `20260902170002_bloco2_public_jobs_v1.sql`                   | ✅ aplicada             | View `public_jobs_v1` com JOIN de empresa                                                                                                                                                                                                                                                                                |
| `20260902170003_bloco3_public_services_v1.sql`               | ✅ aplicada (corrigida) | Removido `s.metadata`                                                                                                                                                                                                                                                                                                    |
| `20260902170004_bloco5c_public_service_gallery_v1.sql`       | ✅ aplicada (corrigida) | Removido `s.metadata`; `DROP VIEW + CREATE VIEW` por causa de mudança de ordem de colunas                                                                                                                                                                                                                                |
| `20260902170005_bloco7_data_quality.sql`                     | ✅ aplicada             | `metadata->>'is_test'='true'` em 5 empresas; view filtra                                                                                                                                                                                                                                                                 |
| `20260902170006_bloco8_company_full_contract.sql`            | ✅ aplicada             | `media_assets` + `company_social_links` agregados em `public_companies_by_type`; `public_jobs_v1` ganha `company_logo_url`                                                                                                                                                                                               |
| `20260903000001_bloco8_1_seed_clientes_content_contract.sql` | ✅ aplicada             | Seed: 4 logos + 4 descriptions + 4 websites + 1 hero (Mistral) em `companies` e `company_relationships.metadata`. Reproduz visualmente o MOCK aprovado.                                                                                                                                                                  |
| `20260903000002_bloco9_seed_vagas_contract.sql`              | ✅ aplicada             | View `public_jobs_v1` estendida (seniority, work_hours, area, work_schedule, city, state, applications_count, company_logo_url via media_assets). Seed: 19 vagas published populadas com seniority/work_hours/work_mode/city/state/responsibilities/salary_min/area. Reproduz visualmente o MOCK de 17 + 2 extras do DB. |

**Data fix aplicado:**

```sql
UPDATE company_relationships SET relationship_type='client' WHERE relationship_type='customer';
-- 5 rows
```

`company_relationship_types.code='client'` é o canônico. Tipo `RelationshipType` no frontend migrado de `'customer'` para `'client'`.

---

## 9. Blocker cruzados com o banco (P0)

| ID        | Blocker                                           | Origem                   | Impacto no frontend                                                 |
| --------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------------------- |
| **P0-01** | Collision de versão `20260902000001`              | Supabase real            | nenhuma direta, mas impede aplicar `01_schema_reconciliation`       |
| **P0-02** | `roles.code` × `roles.name/scope`                 | `repair_candidate_chain` | nenhuma direta                                                      |
| **P0-03** | `domain_events` schema real × `emit_domain_event` | `emit_domain_event`      | nenhuma direta                                                      |
| **P0-04** | `tenants` RLS com dependência de membership       | `01_*`/`06_*`            | 🔴 **direto** — pode bloquear `is_tenant_member` para `AuthContext` |

**Decisão:** não tocar em frontend até P0 = 0.

---

## 10. Regra de migração (Fase 2+)

> **Banco controla conteúdo e dados. Código controla comportamento e apresentação.**

Por domínio (prioridade):

1. **P0-04 `tenants` RLS** — corrigir policy no banco, não no frontend
2. **G12 site_settings** — `COMPANY` em `config/company.ts` → `companies` (registro J&S) + `company_social_links`
3. **G11 images** — `IMAGES.services.*` → `media_assets` (entity_type='service')
4. **G2/G3 pages/blog** — `mock/company.ts` e `Blog.tsx` → `pages` e `blog_posts`
5. **G1 testimonials** — `mock/testimonials.ts` → `testimonials` (criar)
6. **G5 metrics** — `COMPANY.clientsServed` etc → `site_settings` (key/value)
7. **G7/G8/G9/G10 forms** — forms locais → tabelas `*_submissions`
8. **G6 seo_pages** — `config/seoPages.ts` → `pages.seo_*`

---

## 10.1 Regra arquitetural de mídias (consolidada 2026-09-03, Bloco 11)

> **Assets estáticos aprovados pertencem ao frontend/deploy. Uploads administráveis pertencem ao Supabase Storage. O banco guarda os metadados/referências. Arquivos privados são organizados logicamente por `tenant_id` + entidade + finalidade.**

### Três categorias de mídia

| Categoria                      | Onde mora                                                                       | Quem decide                           | Exemplos                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Assets estáticos aprovados** | `/public/images/*` servido pelo deploy                                          | Equipe de produto (curadoria)         | Logo institucional, fotos dos serviços, imagens dos parceiros, fotos dos clientes já aprovados, banners institucionais |
| **Conteúdo administrável**     | Supabase Storage (`public-assets` ou `tenant-files`)                            | Admin / RH / candidatos via dashboard | Logo novo de cliente, foto de vaga, currículo de candidato, certificado, documentação de fornecedor, contrato PDF      |
| **Metadados/referências**      | PostgreSQL (`media_assets`, `company_social_links`, `candidate_documents`, etc) | Schema canônico                       | `storage_path`, `mime_type`, `size_bytes`, `entity_id`, `entity_type`                                                  |

### Storage layout (multi-tenant)

```
Supabase Storage
├── public-assets            ← assets públicos do produto (futuro)
└── tenant-files             ← arquivos privados, isolados por tenant
      ├── tenant-{tenant_id}/
      │     ├── branding/
      │     ├── clientes/
      │     ├── servicos/
      │     ├── parceiros/
      │     ├── fornecedores/
      │     ├── vagas/
      │     ├── candidatos/
      │     │     ├── documents/
      │     │     └── certificates/
      │     ├── documentos/
      │     └── ...
      └── tenant-{outro}/
```

### Decisões arquiteturais (Bloco 11)

1. **NÃO criar um bucket por tenant** — escala mal operacionalmente. Usar `tenant-files` com `tenant_id` como prefixo de path.
2. **NÃO usar `bytea` no PostgreSQL** para arquivos normais — storage binário é responsabilidade do Storage.
3. **NÃO misturar `/public/images`** com arquivos privados de candidatos/documentos.
4. **NÃO migrar imagens existentes sem necessidade** — assets estáticos continuam em `/public`. A migração para `media_assets`/Storage é feita quando houver administração dinâmica real.
5. **RLS do Storage** garante que `Tenant A` não acessa arquivo privado de `Tenant B` (path-prefixed policy).
6. **View pública** `public_companies_by_type` (Bloco 8) já tem `COALESCE(media_assets.file_url, companies.logo_url)` — funciona em ambos os cenários sem migração de dados.

### Bloco 11 — gaps reportados e status

| Gap                                               | Status real                                                                                                                                                                                                                           | Origem provável                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `GET /rest/v1/services?status=eq.published` → 401 | **Não reproduz** no código atual. Único consumidor de `services` raw é o dashboard autenticado (`findServices`, `createService`, etc). Frontend público usa `public_services_v1` (validado: 200 em `/servicos/recrutamento-selecao`). | Cache do navegador, requisição manual no DevTools, ou logs de sessão anterior.            |
| `/images/global/fallbacks/default.svg` 404        | **Arquivo existe** em `public/images/global/fallbacks/default.svg` (SVG válido, 6 linhas). `SafeImage.tsx` + `imageFallbacks.ts` configuram o caminho corretamente.                                                                   | Build/deploy antigo, cache do navegador, ou `vite preview` reiniciando no momento do log. |
| `VagaFull` inexistente                            | **Não existe** no repositório. Único arquivo é `src/pages/VagaDetalhe.tsx`.                                                                                                                                                           | Nomenclatura antiga ou componente planejado nunca implementado.                           |
| Auth/login                                        | ✅ funcional. Sequência `start → people loaded → signIn success → identity loaded → redirect` completa.                                                                                                                               | —                                                                                         |

**Validação runtime (2026-09-03, Playwright + `pnpm preview`):**

| Página                                      | Endpoint Supabase                                                        | Status | Console errors |
| ------------------------------------------- | ------------------------------------------------------------------------ | ------ | -------------- |
| `/servicos/recrutamento-selecao`            | `GET /rest/v1/public_services_v1?slug=eq.recrutamento-selecao`           | 200    | 0              |
| `/vagas/eletricista-de-instala-ao-08404295` | `GET /rest/v1/public_jobs_v1?slug=eq.eletricista-de-instala-ao-08404295` | 200    | 0              |

Nenhuma requisição a `services?` ou `global/fallbacks/` foi disparada nessas navegações. Os 3 gaps reportados **não reproduzem** no estado atual do código.

### Próximos passos (Bloco 11.1+, sem implementar ainda)

1. Auditar Supabase Logs (PostgREST) para confirmar origem do 401 em `services` (se ainda recorrente).
2. Adicionar comentário em `services.repository.ts:48` impedindo regressão pública (rotular `findServices` como **admin only**).
3. Estender `assets-integrity.test.ts` para cobrir todos os caminhos em `IMAGE_FALLBACKS` e `IMAGES`.
4. Quando chegar o Bloco Media/Storage (G11), fazer auditoria específica do que já existe em `/public` e migrar somente o que fizer sentido.
5. Confirmar origem do nome `VagaFull` (issue/doc/código antigo) antes de qualquer ação.

---

## 11. O que **NÃO** fazer

- ❌ Apagar `src/mock/*` antes de existir a tabela correspondente
- ❌ Apagar `src/config/company.ts` antes do registro J&S existir em `companies`
- ❌ Apagar `src/config/images.ts` antes de cada asset existir em `media_assets`
- ❌ Redesenhar UI
- ❌ Quebrar `companies.repository.test.ts`
- ❌ Trocar `if (!this.supabase) return []` por erro fatal (manter fallback dev)

---

## 12. Validação runtime — Data Gate (2026-09-03)

| Página          | Origem real                                    | Cards renderizados                        | Marcador DB-only                                                                                                                                                                                                    | Observações                                                                            |
| --------------- | ---------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `/clientes`     | DB (4 empresas via `public_companies_by_type`) | 4                                         | Abarca, Mistral Vidros, VECTOR, Vectro Engenharia                                                                                                                                                                   | Nenhuma "Teste" visível. View filtra por `status='active'` em `company_relationships`. |
| `/vagas`        | DB (10 vagas via `public_jobs_v1`)             | 10                                        | Ajudante geral, Eletricista, Mecânico industrial, Assistente de compras, Líder de produção, Auxiliar de expedição, Desenvolvedor React, Assistente Administrativo, Analista de Sistemas Sênior, Consultor de Vendas | View filtra `status='published'`.                                                      |
| `/vagas/:slug`  | DB (via `public_jobs_v1` por slug)             | 1 (testado com `ajudante-geral-7e299dec`) | H1, Sobre a vaga, Requisitos, Benefícios, Candidatar-se                                                                                                                                                             | Mini landing page funcional.                                                           |
| `/servicos`     | DB (20 serviços via `public_services_v1`)      | 20                                        | (lista seedada)                                                                                                                                                                                                     | —                                                                                      |
| `/parceiros`    | MOCK (intencional)                             | (mock)                                    | —                                                                                                                                                                                                                   | Sem `partner` em `company_relationships`.                                              |
| `/fornecedores` | MOCK (com aviso)                               | 4 (Centauro, Pão de Açúcar, BB, TIM)      | "Exibindo catálogo de demonstração. Os dados reais aparecerão automaticamente quando forem publicados."                                                                                                             | Sem `supplier` em `company_relationships`.                                             |

**Conclusão do Bloco 6:** 4 páginas migradas (Clientes, Vagas, VagaDetalhe, Servicos) consomem dados reais do Supabase remoto. Nenhum dado de teste (`Teste`/`Empresa E2E Teste`) está visível para o usuário público, apesar de existirem na tabela `companies` — a view filtra `status='active'` em `company_relationships`. A regra "UI/UX existente é o contrato" foi respeitada: zero mudanças de layout/copy além da integração dos feedbacks (Empty/NotFound/Skeleton).

**Conclusão do Bloco 8 (2026-09-03):** O contrato visual aprovado de `/clientes` está fechado. A migration `20260903000001_bloco8_1_seed_clientes_content_contract.sql` populou:

- `companies.logo_url` (4 logos com paths relativos servidos pelo Vite)
- `companies.description` (4 textos institucionais)
- `companies.website` (4 URLs reais)
- `company_relationships.metadata.hero_image_url` (apenas Mistral, fiel ao MOCK)

Validação runtime: 4 cards premium renderizados (logos reais, gradient overlay, hero para Mistral, CTA "Conhecer empresa" para todos). `ClientCaseFallback` não é mais acionado. O MOCK `CLIENTS_LIST` permanece intocado como referência. Quando o G11 migrar imagens para Supabase Storage + `media_assets`, a view `public_companies_by_type` já tem `COALESCE(media_assets.file_url, companies.logo_url)` que vai pegar automaticamente.

---

## 14. Data Contract Audit — `/clientes` (2026-09-03)

### Objetivo

Determinar por que `/clientes` renderiza **4** empresas e não **10**, e validar se o frontend está consumindo corretamente a view `public_companies_by_type`.

### Estado atual do banco (companies)

| Empresa                   | `is_test` | Relationship | Aparece em `/clientes`? | Razão                                   |
| ------------------------- | --------- | ------------ | ----------------------- | --------------------------------------- |
| Teste                     | `true`    | nenhuma      | ❌                      | Excluído: `is_test = true`              |
| Global Services S.A.      | `true`    | nenhuma      | ❌                      | Excluído: `is_test = true`              |
| Parceiro Consultoria      | `true`    | `client`     | ❌                      | Excluído: `is_test = true`              |
| Fornecedor Tech           | `true`    | nenhuma      | ❌                      | Excluído: `is_test = true`              |
| Empresa E2E Teste Editada | `true`    | `client`     | ❌                      | Excluído: `is_test = true`              |
| TechSolutions Ltda        | —         | **nenhuma**  | ❌                      | Excluído: INNER JOIN exige relationship |
| Vectro Engenharia         | —         | `client`     | ✅                      | Real + relacionamento ativo             |
| Abarca Móveis             | —         | `client`     | ✅                      | Real + relacionamento ativo             |
| VECTOR                    | —         | `client`     | ✅                      | Real + relacionamento ativo             |
| Mistral Vidros            | —         | `client`     | ✅                      | Real + relacionamento ativo             |

### Contrato da view `public_companies_by_type`

A view aplica **três filtros que explicam exatamente 4 resultados**:

1. **`c.status = 'active'`** — todas as 10 empresas são `active` → não exclui nenhuma
2. **`cr.status = 'active'`** — todos os relacionamentos `client` são `active` → não exclui nenhuma
3. **`coalesce(c.metadata->>'is_test', 'false') <> 'true'`** — exclui as 5 empresas marcadas como teste
4. **`INNER JOIN company_relationships`** — TechSolutions Ltda não possui relacionamento → excluído

A view é **correta**. Ela implementa a decisão: "dados de teste não aparecem no site público, e empresas sem relacionamento comercial ativo também não aparecem."

### Gap de `tenant_id` em `companies`

A view referencia `c.tenant_id` (para lookup de `media_assets`), mas a migration original `20260816000300_companies.sql` declara a tabela `companies` como **global (sem `tenant_id`)**. A `database.types.ts` inclui `tenant_id: string` na interface `Company.Row`.

**Status:** `tenant_id` existe no banco real (confirmado via query) mas não está documentado na migration original. As empresas real possuem `tenant_id = d480af07-ab6b-4561-ac3a-2a0b0c1267b5`, enquanto empresas de teste têm `tenant_id = NULL`.

**Ação:** Documentar — não alterar até resolver as migrations de companies (fora do escopo deste bloco).

### Frontend ↔ DB type alignment

A view retorna colunas `image_url` (JSONB/text de `media_assets` ou `company_relationships.metadata.hero_image_url`) e `socials` (JSONB agregado de `company_social_links`). O frontend mapeia corretamente:

| Campo DB view                          | Frontend path                                                | Status |
| -------------------------------------- | ------------------------------------------------------------ | ------ |
| `logo_url`                             | `PublicCompanyByType.logo_url` → `ClientVisual.logo`         | ✅     |
| `image_url`                            | `PublicCompanyByType.image_url` → `ClientVisual.image`       | ✅     |
| `relationship_metadata.hero_image_url` | Fallback em `pickString(row.image_url, meta.hero_image_url)` | ✅     |
| `socials` (jsonb)                      | `PublicCompanyByType.socials` → `ClientVisual.socials`       | ✅     |

**Conclusão:** O frontend está **corretamente alinhado** com o contrato da view. Nenhuma alteração de TSX é necessária. O problema é exclusivamente de **dados/master data**: `TechSolutions Ltda` precisa de um registro em `company_relationships` para aparecer em `/clientes`.

---

## 14. Data Contract Audit — `/vagas` (2026-09-03)

### Estado atual do banco (jobs)

| Status      | Quantidade |
| ----------- | ---------: |
| `published` |     **19** |
| `draft`     |      **1** |
| Total       |     **20** |

### Distribuição atual

| Empresa              | `is_test` | Jobs publicados | Aparece em `/vagas`? | Razão                           |
| -------------------- | --------- | --------------: | -------------------- | ------------------------------- |
| Teste                | ✅        |               3 | ❌                   | Empresa é teste                 |
| Global Services S.A. | ✅        |               2 | ❌                   | Empresa é teste                 |
| Parceiro Consultoria | ✅        |               2 | ❌                   | Empresa é teste                 |
| Fornecedor Tech      | ✅        |               2 | ❌                   | Empresa é teste                 |
| Empresa E2E Teste    | ✅        |               0 | ❌                   | Empresa é teste                 |
| Vectro Engenharia    | ❌        |               2 | ✅                   | Empresa real                    |
| Abarca Móveis        | ❌        |               2 | ✅                   | Empresa real                    |
| VECTOR               | ❌        |               2 | ✅                   | Empresa real                    |
| Mistral Vidros       | ❌        |               2 | ✅                   | Empresa real                    |
| TechSolutions Ltda   | ❌        |               2 | ✅                   | Empresa real (sem relationship) |

### Contrato da view `public_jobs_v1` — evolução histórica

| Version | Migration                                         | Filtro `is_test`? | LEFT JOIN company? | Jobs retornados      |
| ------- | ------------------------------------------------- | ----------------- | ------------------ | -------------------- |
| Bloco 2 | `20260902170002_bloco2_public_jobs_v1.sql`        | ❌                | ✅                 | 19 (todas published) |
| Bloco 7 | `20260902170005_bloco7_data_quality.sql`          | ✅ **ADICIONADO** | ✅                 | 10 (9 filtradas)     |
| Bloco 8 | `20260902170006_bloco8_company_full_contract.sql` | ✅                | ✅                 | 10 (9 filtradas)     |
| Bloco 9 | `20260903000002_bloco9_seed_vagas_contract.sql`   | ✅                | ✅                 | 10 (9 filtradas)     |

**Root cause encontrada:** o filtro `coalesce(c.metadata->>'is_test', 'false') <> 'true'` foi adicionado à view `public_jobs_v1` no **Bloco 7**, não no Bloco 2 original. Isso transformou o número de vagas públicas de 19 → 10.

### Decisão arquitetural

O filtro `is_test` em `public_jobs_v1` é **incorreto** para o contrato de vagas. Uma vaga é uma entidade editorial independente:

```text
jobs.status = 'published'
    → vaga é pública

jobs.company_id → opcional (LEFT JOIN)
    → empresa é enriquecimento
    → empresa de teste não deve matar a vaga
```

O `is_test` deve filtrar **empresas/clientes** (`public_companies_by_type`), não **vagas**.

### Ação correta (pendente de aprovação editorial)

1. Remover `AND coalesce(c.metadata->>'is_test', 'false') <> 'true'` de `public_jobs_v1`
2. Manter `LEFT JOIN companies` (empresa opcional)
3. Manter `WHERE j.status = 'published'`
4. Frontend já lida com `company_name = NULL` via fallback `'J&S Empregos LTDA'`

Isso faz com que as 19 vagas publicadas apareçam (10 + 9 da empresa de teste). Decisão editorial sobre quais das 9 reter/mover/draft deve seguir.

---

## 15. Próximos passos

1. ✅ **Fase 0** Restore point — concluída (tag `pre-frontend-audit-2026-09-02`)
2. ✅ **Fase 1** Inventário páginas públicas + GAPs — concluída
3. ✅ **Gate 0** Baseline Restoration — concluída
4. ✅ **Gate 1** Feedback layer (17 testes) — concluída
5. ✅ **Gate 2** Auditar `/vagas` — concluída (NÃO MIGRAR inicialmente, depois migrado)
6. ✅ **Gate 3** Empty/NotFound states — concluída
7. ✅ **Bloco 1** `/clientes` DB-first — concluída
8. ✅ **Bloco 2** `/vagas` + `/vagas/:slug` DB-first — concluída
9. ✅ **Bloco 3** `/servicos` DB-first (lista) — concluída
10. ✅ **Bloco 5** Migrations + data fix — concluída
11. ✅ **Bloco 6** Data Gate runtime — concluída
12. ✅ **Bloco 6.1** Re-validação runtime com Playwright — concluída
13. ✅ **Bloco 6.2** Atualização desta matriz — concluída
14. ✅ **Bloco 8** Contrato de conteúdo aprovado de `/clientes` — seed Bloco 8.1 aplicado no remoto, 4 cards premium DB-driven
15. ✅ **Bloco 9** Contrato de conteúdo aprovado de `/vagas` (cards) — seed Bloco 9 aplicado, 19 vagas published DB-driven com MOCK-equivalent fields
16. ✅ **Bloco 10** Data Contract Audit — concluída (dois relatórios: `/clientes` e `/vagas`)
17. ⏸ **Bloco 10A** Corrigir view `public_jobs_v1` — remover `is_test` filter (jobs ≠ companies)
18. ⏸ **Bloco 10B** Re-classificar `TechSolutions Ltda` (cliente real sem relationship)
19. ⏸ **Bloco 10C** Re-classificar 9 vagas de empresas de teste (reter / mover / draft)
20. ⏸ **Bloco 11** Auditoria de contrato de `/vagas/:slug` e `/empresas/:slug`
21. ⏸ **Aguardar** correção dos 4 blockers (P0-01..04) no banco
22. ⏸ **Fase 3** CMS admin
