# Frontend × MOCK × DB Matrix

**Data:** 2026-09-02
**Restore point:** tag `pre-frontend-audit-2026-09-02` (em `65064f4`)
**Status:** FASE 1 — inventário. Nenhuma alteração de código.

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

## 1. Páginas públicas (sites) × Origem dos dados

| #   | Página           | Rota                 | Textos principais             | Imagens                            | Listas/dados                   | Formulários             | Status                                |
| --- | ---------------- | -------------------- | ----------------------------- | ---------------------------------- | ------------------------------ | ----------------------- | ------------------------------------- |
| 1   | Home             | `/`                  | `COMPANY` (config), hardcoded | `IMAGES.hero.home.slides` (config) | `mock/home.ts`                 | ChatWidget, ContatoForm | 🟡 MOCK                               |
| 2   | Vagas (lista)    | `/vagas`             | hardcoded                     | `IMAGES` (logos)                   | `repositories/jobs.repository` | filtros locais          | 🟢 DB (parcial — filtros client-side) |
| 3   | VagaDetalhe      | `/vagas/:id`         | hardcoded                     | `IMAGES` (logo empresa)            | `repositories/jobs.repository` | JobApplicationForm      | 🟢 DB                                 |
| 4   | Empresas         | `/empresas`          | hardcoded                     | `IMAGES`                           | `mock/clients.ts`              | —                       | 🟡 MOCK                               |
| 5   | Clientes         | `/clientes`          | hardcoded                     | `IMAGES`                           | `mock/clients.ts`              | —                       | 🟡 MOCK                               |
| 6   | Parceiros        | `/parceiros`         | hardcoded                     | `IMAGES`                           | `mock/partners.ts`             | —                       | 🟡 MOCK                               |
| 7   | Fornecedores     | `/fornecedores`      | hardcoded                     | `IMAGES`                           | ❓ nenhum mock local           | —                       | 🟡 GAP                                |
| 8   | Candidatos       | `/candidatos`        | hardcoded                     | `IMAGES`                           | ❓                             | CadastroCandidato link  | 🟡 GAP                                |
| 9   | Serviços         | `/servicos`          | hardcoded                     | `IMAGES.services.*`                | `mock/services.ts`             | —                       | 🟡 MOCK                               |
| 10  | ServicoDetalhe   | `/servicos/:slug`    | hardcoded                     | `IMAGES.services.*`                | `mock/services.ts`             | ServiceRequestForm      | 🟡 MOCK                               |
| 11  | Sobre            | `/sobre`             | `COMPANY` (config)            | `IMAGES`                           | `mock/company.ts`              | —                       | 🟡 MOCK                               |
| 12  | Blog             | `/blog`              | hardcoded                     | `IMAGES`                           | ❓                             | —                       | 🟡 GAP                                |
| 13  | FAQ              | `/faq`               | hardcoded                     | `IMAGES`                           | ❓                             | —                       | 🟡 GAP                                |
| 14  | Contato          | `/contato`           | `COMPANY`                     | `IMAGES.hero.contato`              | ❓                             | form local              | 🟡 MOCK                               |
| 15  | ProcessoSeletivo | `/processo-seletivo` | hardcoded                     | `IMAGES`                           | ❓                             | —                       | 🟡 GAP                                |
| 16  | TrabalheConosco  | `/trabalhe-conosco`  | hardcoded                     | `IMAGES`                           | `mock/testimonials.ts`         | TrabalheConoscoForm     | 🟡 MOCK                               |
| 17  | Suporte          | `/suporte`           | hardcoded                     | `IMAGES`                           | ❓                             | form local              | 🟡 GAP                                |
| 18  | Termos           | `/termos`            | hardcoded (texto jurídico)    | —                                  | —                              | —                       | ⚙️ CODE (jurídico)                    |
| 19  | Privacidade      | `/privacidade`       | hardcoded (texto jurídico)    | —                                  | —                              | —                       | ⚙️ CODE (jurídico)                    |
| 20  | NotFound         | `/404`               | hardcoded                     | `IMAGES`                           | —                              | —                       | ⚙️ CODE                               |

---

## 2. Mocks estáticos em `src/mock/*` (alvo de migração)

| Arquivo                    | Linhas | Quem importa                               | Conteúdo principal                                                    | Entidade DB alvo                                                |
| -------------------------- | ------ | ------------------------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| `src/mock/home.ts`         | 68     | (importação dinâmica em `Home.tsx`)        | Hero slides, métricas, showcases, CTAs                                | `services`, `companies`, `media_assets`, página `home` (futuro) |
| `src/mock/clients.ts`      | 47     | `Clientes.tsx`, `Empresas.tsx`, `Home.tsx` | Lista de empresas-cliente                                             | `companies` (tipo='client')                                     |
| `src/mock/partners.ts`     | 45     | `Empresas.tsx`                             | Lista de parceiros                                                    | `companies` (tipo='partner')                                    |
| `src/mock/services.ts`     | 124    | `Servicos.tsx`, `ServicoDetalhe.tsx`       | Catálogo de serviços (título, descrição, ícone, benefícios, processo) | `services` (já existe no DB!)                                   |
| `src/mock/company.ts`      | 93     | `Sobre.tsx`                                | Texto institucional, história, missão/visão/valores, equipe           | `companies` (registro J&S) + `pages` ou `about_content`         |
| `src/mock/testimonials.ts` | 48     | (importação local em `TrabalheConosco`)    | Depoimentos                                                           | `testimonials` (não existe) → GAP                               |

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

## 7. GAPs identificados (resumo executivo)

| #   | GAP                                                              | Origem frontend                             | Origem desejada                                                   | Ação                                       |
| --- | ---------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| G1  | `testimonials` (depoimentos)                                     | `mock/testimonials.ts`                      | nova tabela `testimonials` ou `media_assets` + `testimonials`     | criar migration se necessário              |
| G2  | `pages` (conteúdo de páginas estáticas: Sobre, FAQ, Blog, etc)   | `mock/company.ts`, hardcoded                | `pages` (tabela) com `content` jsonb                              | criar `pages` table                        |
| G3  | `blog_posts` (lista + detalhe)                                   | hardcoded                                   | `blog_posts` (já existe)                                          | conectar                                   |
| G4  | `home_hero` (slides + CTAs)                                      | `mock/home.ts`                              | tabela `home_sections` ou config em `pages`                       | avaliar                                    |
| G5  | `metrics` (15 anos, 200 clientes, 500 profissionais, 50 cidades) | `COMPANY.businessAreas`/`clientsServed` etc | `companies.metadata` jsonb ou `site_settings` table               | criar `site_settings` (key/value)          |
| G6  | `seo_pages` (SEO por página)                                     | `config/seoPages.ts`                        | `pages.seo_title`/`seo_description`                               | usar `pages` (quando criar)                |
| G7  | `contact_form_submissions`                                       | form local (estado React)                   | `contact_submissions` table                                       | criar tabela                               |
| G8  | `service_inquiries` (form de "Contratar Serviço")                | `ServiceRequestForm` (estado React)         | `service_inquiries` table                                         | criar tabela                               |
| G9  | `divulgar_vaga_submissions`                                      | `DivulgarVagaForm`                          | `job_posting_requests` table                                      | criar tabela                               |
| G10 | `trabalhe_conosco_submissions`                                   | `TrabalheConosco` form                      | `talent_pool` ou `candidates`                                     | usar `candidates` existente                |
| G11 | `images.*` (mapa de URLs hardcoded)                              | `config/images.ts`                          | `media_assets` (entity_type='home_hero'/'service'/'company' etc.) | migrar gradualmente                        |
| G12 | `site_settings` (nome, CNPJ, endereço, redes sociais, telefone)  | `config/company.ts`                         | `companies` (registro J&S) + `company_social_links`               | já existe migration `company_social_links` |

---

## 8. Blocker cruzados com o banco (P0)

| ID        | Blocker                                           | Origem                   | Impacto no frontend                                                 |
| --------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------------------- |
| **P0-01** | Collision de versão `20260902000001`              | Supabase real            | nenhuma direta, mas impede aplicar `01_schema_reconciliation`       |
| **P0-02** | `roles.code` × `roles.name/scope`                 | `repair_candidate_chain` | nenhuma direta                                                      |
| **P0-03** | `domain_events` schema real × `emit_domain_event` | `emit_domain_event`      | nenhuma direta                                                      |
| **P0-04** | `tenants` RLS com dependência de membership       | `01_*`/`06_*`            | 🔴 **direto** — pode bloquear `is_tenant_member` para `AuthContext` |

**Decisão:** não tocar em frontend até P0 = 0.

---

## 9. Regra de migração (Fase 2+)

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

## 10. O que **NÃO** fazer

- ❌ Apagar `src/mock/*` antes de existir a tabela correspondente
- ❌ Apagar `src/config/company.ts` antes do registro J&S existir em `companies`
- ❌ Apagar `src/config/images.ts` antes de cada asset existir em `media_assets`
- ❌ Redesenhar UI
- ❌ Quebrar `companies.repository.test.ts`
- ❌ Trocar `if (!this.supabase) return []` por erro fatal (manter fallback dev)

---

## 11. Próximos passos (após sua aprovação)

1. ✅ **Fase 0** Restore point — concluído (tag `pre-frontend-audit-2026-09-02`)
2. ✅ **Fase 1a** Inventário páginas — concluído (este doc)
3. ⏳ **Fase 1b** Cruzar `mock/*` × entidades (acima) — concluído
4. ⏳ **Fase 1c** Cruzar `config/*` × entidades (acima) — concluído
5. ⏳ **Fase 1d** Cruzar tipos de domínio × repositories × tabelas — concluído
6. ⏳ **Fase 1e** Listar GAPs explícitos (acima G1–G12) — concluído
7. ⏸ **Aguardar** correção dos 4 blockers (P0-01..04) no banco
8. ⏸ **Fase 2** Conexão MOCK → DB, na ordem de G12 → G11 → G2/G3 → ...
9. ⏸ **Fase 3** CMS admin para os mesmos dados
