# Passagem C — Matriz Banco ↔ Código ↔ Módulo (Sistema SaaS)

**Data:** 2026-10-14  
**Branch:** `main` (commit `72a99d4` - docs: Passagem C inicial)  
**Escopo:** Apenas leitura — inventário do estado atual. Site público intocado.

---

## 1. Números de Referência (Confirmar)

| Item | Referência | Status |
|------|------------|--------|
| Tabelas em `public` | 221 | A confirmar via catálogo Supabase |
| Views | 5 | A confirmar |
| Funções | 233 | A confirmar |
| Triggers | 84 | A confirmar |
| Políticas RLS | 602 | A confirmar |
| Tabelas com RLS habilitada | 221 | A confirmar |

> **Nota:** Não executar queries no banco nesta passagem. Usar migrações e documentos como referência inicial.

---

## 2. Módulos do Sistema SaaS (13 módulos em `src/modules/`)

| Módulo | Pasta | Rotas Base | Dashboard | Status |
|--------|-------|------------|-----------|--------|
| AVA | `src/modules/ava/` | `/ava` | `AvaDashboardPage` | ✅ Restaurado (baseline `c8ce3ee`) |
| Candidato | `src/modules/candidato/` | `/candidato` | `DashboardCandidato` | ✅ Restaurado (44 páginas/componentes) |
| Contabilidade | `src/modules/contabilidade/` | `/contabilidade` | `ContabilidadeDashboardPage` | ✅ Restaurado (commit `ab24d57`, 4 páginas) |
| Empresas | `src/modules/empresas/` | `/empresas` | `EmpresasListPage` | ✅ Implementado (3 páginas) |
| Estoque | `src/modules/estoque/` | `/estoque` | — | ⚠️ Apenas dashboard + sidebar (sem páginas CRUD) |
| Financeiro | `src/modules/financeiro/` | `/financeiro` | `FinanceiroDashboardPage` | ✅ 11 submódulos com páginas (21 arquivos .tsx) |
| Fiscal | `src/modules/fiscal/` | `/fiscal` | — | ⚠️ Apenas dashboard + sidebar |
| Operações | `src/modules/operacoes/` | `/operacoes` | — | ⚠️ Apenas dashboard + sidebar |
| PDV | `src/modules/pos/` | `/pos` | — | ⚠️ Apenas dashboard + sidebar |
| Recrutamento | `src/modules/recrutamento/` | `/recrutamento` | `DashboardRecrutamento` | ✅ Implementado (18 páginas/componentes) |
| RH | `src/modules/rh/` | `/rh` | `RHDashboardPage` | ⚠️ Apenas dashboard + candidates index |
| Serviços | `src/modules/servicos/` | `/servicos` | `ServicosListPage` | ✅ Implementado (3 páginas) |
| Suporte | `src/modules/suporte/` | `/suporte` | `SuporteDashboardPage` | ⚠️ Apenas dashboard + sidebar + teste |

> **Proteção:** Site público (28 rotas, `PublicLayout`) — **não alterar**.

---

## 3. Contratos Core (Extraídos de `c8ce3ee` → `src/core/`)

| Contrato | Arquivo | Função Principal | Testes |
|----------|---------|------------------|--------|
| Types | `src/core/types.ts` | Tipos canônicos (Permission, Role, Person, TenantMembership, etc.) | — |
| Identity | `src/core/identity/IdentityContract.ts` | `validatePersonLink`, `resolveActiveTenant`, `buildIdentityContext`, `canExecuteBusinessOperation` | 12 |
| Authorization | `src/core/authorization/AuthorizationContract.ts` | `computeEffectivePermissions`, `decidePermission`, `hasAnyPermission`, `hasAllPermissions`, `getPermissionScope` | 10 |
| Execution | `src/core/execution/ExecutionContract.ts` | `validateExecutionContext`, `generateCorrelationId`, `buildExecutionContext`, `assertValidContext` | 5 |
| Registry | `src/core/registry/CellRegistryContract.ts` | Classe `CellRegistry` (register, getEnabled, stats, getByModule) | 7 |
| Tenancy | `src/core/tenancy/TenantContract.ts` | `validateTenantContext`, `assertTenantMatch` | 6 |
| **Total** | | | **40 testes passando** |

**Mudança chave (commit `8e7b51e`):** Alinhamento com schema real Supabase
- `Permission`: `id`, `name`, `module`, `description`, `created_at` (sem `resource/action/granted/scope`)
- `Role`: `is_global` (boolean) substituindo `scope` (`global`/`tenant`)
- `TenantMembership`: `membership_role` (string) substituindo `role_id` (UUID)
- Autorização usa `permissionName` (ex: `"jobs.read"`) em vez de resource/action

---

## 4. Inventário de Tabelas por Módulo (Mapeamento Inicial)

### 4.1 Módulo Candidato (12 tabelas + 1 divergente)
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Estado |
|--------|----|-----|--------|-------------|-------|--------|
| `people` | `id` | `auth_user_id` → `auth.users` | Sim (via membership) | `candidates.repository.ts` | `/candidato/perfil`, `/candidato/curriculo` | Implementado |
| `candidates` | `id` | `person_id` → `people.id` | Sim | `candidates.repository.ts` | `/candidato` | Implementado |
| `candidate_educations` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-education.repository.ts` | `/candidato/formacao` | Implementado |
| `candidate_experiences` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-experiences.repository.ts` | `/candidato/experiencia` | Implementado |
| `candidate_skills` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-skills.repository.ts` | `/candidato/habilidades` | Implementado |
| `candidate_languages` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-languages.repository.ts` | `/candidato/idiomas` | Implementado |
| `candidate_documents` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-documents.repository.ts` | `/candidato/documentos` | Implementado |
| `candidate_preferences` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-preferences.repository.ts` | `/candidato/preferencias` | **Divergência: tabela não existe nos 221** |
| `candidate_courses` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-courses.repository.ts` | `/candidato/cursos` | **Divergência: colunas (`hours`/`completed_at` vs `completion_date`/`expiration_date`)** |
| `candidate_profile_views` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-profile-views.repository.ts` | — | Implementado |
| `candidate_job_alerts` | `id` | `candidate_id` → `candidates.id` | Sim | `jobAlerts.repository.ts` | `/candidato/alertas` | Implementado |
| `favorite_jobs` | `id` | `candidate_id` → `candidates.id`, `job_id` → `jobs.id` | Sim | `favoriteJobs.repository.ts` | `/candidato/favoritas` | Implementado |

**Código Candidato:** 44 arquivos `.tsx` (Container, Context, Routes, Sidebar, Dashboard com 7 componentes, 18 páginas, 7 dialogs, 7 testes)

### 4.2 Módulo Recrutamento (7 tabelas + 1 divergente)
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Estado |
|--------|----|-----|--------|-------------|-------|--------|
| `jobs` | `id` | `tenant_id`, `company_id` | Sim | `jobs.repository.ts` | `/recrutamento/vagas` | Implementado |
| `applications` | `id` | `candidate_id`, `job_id`, `tenant_id` | Sim | `applications.repository.ts` | `/recrutamento/candidaturas` | **Divergência: schema DB ≠ esperado pelo módulo** |
| `recruitment_stages` | `id` | `tenant_id` | Sim | `recruitment-stage.repository.ts` | `/recrutamento/etapas` | Implementado |
| `recruitment_processes` | `id` | `job_id`, `tenant_id` | Sim | `recruitment-process.repository.ts` | `/recrutamento/processos` | Implementado |
| `recruitment_demands` | `id` | `tenant_id`, `company_id` | Sim | `recruitment-demand.repository.ts` | `/recrutamento/demandas` | Implementado |
| `job_matches` | `id` | `job_id`, `candidate_id`, `tenant_id` | Sim | `job-matches.repository.ts` | `/recrutamento/matches` | Implementado |
| `talent_pool` | `id` | `candidate_id`, `tenant_id` | Sim | `talent-pool.repository.ts` | `/recrutamento/talent-pool` | Implementado |

**Código Recrutamento:** 18 arquivos `.tsx` (Authorization, Dashboard, Navigation, 10 páginas, Container com 3, Context, Routes, Sidebar)

### 4.3 Módulo Financeiro (9 tabelas + 2 divergentes)
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Estado |
|--------|----|-----|--------|-------------|-------|--------|
| `accounts_payable` | `id` | `tenant_id`, `supplier_id`, `cost_center_id` | Sim | `accounts-payable.repository.ts` | `/financeiro/contas-pagar` | Implementado (restaurado `a69d00b`) |
| `accounts_receivable` | `id` | `tenant_id`, `client_id` | Sim | `accounts-receivable.repository.ts` | `/financeiro/contas-receber` | Implementado |
| `bank_accounts` | `id` | `tenant_id` | Sim | `bank-account.repository.ts` | `/financeiro/bancos` | **Divergência: declarada em migration `20260827001200_finance.sql` mas ausente em prod** |
| `cash_flows` | `id` | `tenant_id`, `bank_account_id` | Sim | `cash-flow.repository.ts` | `/financeiro/fluxo-caixa` | **Divergência: declarada em migration mas ausente em prod** |
| `financial_categories` | `id` | `tenant_id` | Sim | `financial-category.repository.ts` | `/financeiro/categoria` | Implementado (precisa 4 fixes) |
| `cost_centers` | `id` | `tenant_id` | Sim | `cost-center.repository.ts` | `/financeiro/centros-custo` | Implementado (restaurado) |
| `financial_transactions` | `id` | `tenant_id`, `account_id` | Sim | `financial-transaction.repository.ts` | `/financeiro/transacoes` | Implementado |
| `invoices` | `id` | `tenant_id`, `client_id` | Sim | `invoice.repository.ts` | `/financeiro/faturamento` | Implementado |
| `payments` | `id` | `tenant_id` | Sim | `payment.repository.ts` | `/financeiro/parcelamentos` | Implementado |
| `receipts` | `id` | `tenant_id` | Sim | `receipt.repository.ts` | — | Implementado |

**Código Financeiro:** 21 arquivos `.tsx` (11 submódulos com páginas, Dashboard, Sidebar, 1 hook `useFaturamento`)

### 4.4 Módulo Contabilidade (4 tabelas)
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Estado |
|--------|----|-----|--------|-------------|-------|--------|
| `accounting_journals` | `id` | `tenant_id`, `period_id` | Sim | `accounting.repository.ts` | `/contabilidade/lancamentos` | Implementado (restaurado `ab24d57`) |
| `accounting_entries` | `id` | `journal_id`, `account_id` | Sim | `accounting.repository.ts` | `/contabilidade/lancamentos` | Implementado |
| `chart_of_accounts` | `id` | `tenant_id` | Sim | `accounting.repository.ts` | `/contabilidade/plano-contas` | Implementado |
| `accounting_periods` | `id` | `tenant_id` | Sim | `accounting.repository.ts` | — | Implementado |

**Código Contabilidade:** 4 páginas (Balancete, Dashboard, Lancamentos, PlanoContas)

### 4.5 Módulo Empresas (3 tabelas)
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Estado |
|--------|----|-----|--------|-------------|-------|--------|
| `companies` | `id` | `tenant_id` | Sim | `companies.repository.ts` | `/empresas` | Implementado |
| `company_relationships` | `id` | `company_id`, `related_company_id`, `type_id` | Sim | — | `/empresas/relacionamentos` | Parcial (página existe, repo faltando) |
| `company_relationship_types` | `id` | — | Não (global) | — | — | Parcial |
| `company_types` | `id` | — | Não (global) | — | — | Parcial |
| `company_contacts` | `id` | `company_id` | Sim | — | — | Parcial |
| `company_social_links` | `id` | `company_id` | Sim | — | — | Parcial |

**Código Empresas:** 3 páginas (List, Detail, Form)

### 4.6 Módulo Serviços (Público + Admin)
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Estado |
|--------|----|-----|--------|-------------|-------|--------|
| `services` | `id` | `tenant_id` | Sim | `services.repository.ts` | `/servicos` (público), `/dashboard/servicos` (admin) | **Divergência: `public_services_v1` retorna 0 para `anon` (security_invoker=true em prod vs false na migration)** |
| `service_categories` | `id` | — | Não (global) | — | — | Implementado |
| `service_images` | `id` | `service_id` | Sim | — | — | Implementado |

**Código Serviços:** 3 páginas (List, Detail, Form)

### 4.7 Identidade e Autorização (Transversal - 7 tabelas core)
| Tabela | PK | FKs | Tenant | Repositório | Estado |
|--------|----|-----|--------|-------------|--------|
| `people` | `id` | `auth_user_id` → `auth.users` | Sim (via membership) | — | Core |
| `tenants` | `id` | — | Não (global) | `tenant.repository.ts` | Core |
| `tenant_memberships` | `id` | `person_id` → `people.id`, `tenant_id` → `tenants.id` | Sim | — | Core |
| `roles` | `id` | — | Não (global) | `role.repository.ts` | Core (`is_global` boolean) |
| `role_assignments` | `id` | `person_id` → `people.id`, `role_id` → `roles.id`, `tenant_id` | Sim | `role.repository.ts` | Core |
| `permissions` | `id` | — | Não (global) | `permission.repository.ts` | Core |
| `role_permissions` | `id` | `role_id` → `roles.id`, `permission_id` → `permissions.id` | Não (global) | — | Core (sem coluna `granted`) |

### 4.8 Módulos com Estrutura Mínima (sem CRUD completo)
| Módulo | Tabelas Declaradas nas Migrations | Código Atual |
|--------|-----------------------------------|--------------|
| Estoque | `stock`, `warehouse` | Apenas dashboard + sidebar |
| Fiscal | (via migrations fiscais) | Apenas dashboard + sidebar |
| Operações | `domain_events`, etc. | Apenas dashboard + sidebar |
| PDV | (via migrations POS) | Apenas dashboard + sidebar |
| Suporte | `support_tickets`, `support_ticket_messages` | Dashboard + sidebar + 1 teste |

### 4.9 Outras Tabelas do Sistema (Migrations)
| Tabela | Módulo Relacionado | Estado |
|--------|-------------------|--------|
| `files`, `file_access_logs` | Storage/Mídia | Implementado |
| `notifications`, `notification_deliveries`, `notification_preferences` | Notificações | Implementado |
| `domain_events`, `event_outbox`, `event_deliveries` | Eventos/Automação | Implementado |
| `chat_rooms`, `chat_messages`, `chat_participants`, `chat_handoffs` | Chat | **Divergência: schema ≠ código** |
| `ai_conversations`, `ai_messages` | IA/Chat | Implementado |
| `automation_jobs`, `automation_executions` | Automação/n8n | Parcial |
| `email_templates`, `email_messages` | Email | Implementado |
| `webhook_deliveries`, `integration_webhooks`, `integration_credentials`, `integration_connections` | Integrações | Implementado |
| `first_login_state`, `legal_acceptances` | Auth/Onboarding | Implementado |
| `candidate_portal_modules` | Candidato (config portal) | Implementado |
| `global_navigation_links` | Navegação | Implementado |
| `footer_configs`, `page_templates` | CMS/Site | Implementado |
| `providers`, `provider_configs` | Integrações | Implementado |
| `skills`, `job_skills` | Candidato/Vagas | Implementado |
| `employees`, `employee_documents`, `employee_education`, `employee_experiences`, `employee_skills`, `employee_languages`, `employee_courses` | RH/Funcionários | Implementado |
| `application_status_history`, `application_profile_snapshots` | Recrutamento | Implementado |
| `talent_pool_memberships` | Recrutamento | Implementado |
| `role_resource_permissions` | RBAC legado | Órfão/Obsoleto |

---

## 5. Repositórios (Total: 53 arquivos)

### Raiz `src/repositories/` (35 arquivos)
- `accounting.repository.ts`, `accounts-payable.repository.ts`, `accounts-receivable.repository.ts`
- `applications.repository.ts`, `audit.repository.ts`, `bank-account.repository.ts`, `bank-reconciliation.repository.ts`
- `billing.repository.ts`, `cash-flow.repository.ts`, `companies.repository.ts`, `companies.repository.test.ts`
- `cost-center.repository.ts`, `employee-documents.repository.ts`, `employee-documents.repository.test.ts`
- `employees.repository.ts`, `finance.repository.ts`, `financial-account.repository.ts`
- `financial-category.repository.ts`, `financial-installment.repository.ts`, `financial-transaction.repository.ts`
- `fiscal.repository.ts`, `footer.repository.ts`, `index.ts`, `invoice.repository.ts`
- `job-matches.repository.ts`, `media-assets.repository.ts`, `navigation.repository.ts`
- `notification.repository.ts`, `page-template.repository.ts`, `partners.repository.ts`
- `payment.repository.ts`, `permission.repository.ts`, `receipt.repository.ts`
- `recruitment-demands.repository.ts`, `recruitment-processes.repository.ts`, `recruitment-stages.repository.ts`
- `role.repository.ts`, `security.repository.ts`, `services.repository.ts`, `services.repository.test.ts`
- `stock.repository.ts`, `supabase.repository.ts`, `suppliers.repository.ts`, `support.repository.ts`
- `talent-pool.repository.ts`, `tenant.repository.ts`, `users.repository.ts`, `warehouse.repository.ts`

### Módulos `src/modules/*/repositories/` (20 arquivos)
- AVA: `tutorials.repository.ts`
- Candidato: 10 repositórios (candidates, education, experiences, skills, languages, documents, preferences, profile_views, portal/*)
- Recrutamento: 7 repositórios (applications, candidates, job-matches, jobs, recruitment-demand, recruitment-process, recruitment-stage, talent-pool)

---

## 6. Hooks (Total: 24 arquivos)

### Raiz `src/hooks/` (23 arquivos)
- `useAccessibility.ts`, `useAsync.ts`, `useCandidates.ts`, `useCompanies.ts`, `useCrud.ts`
- `useFocusTrap.ts`, `useFooterConfig.ts`, `useGlobalDashboardStats.ts`, `useIsPortalRoute.ts`
- `useJobs.ts`, `useMediaUpload.ts`, `useMediaUpload.test.ts`, `useNavigation.ts`
- `useNavigationContext.ts`, `usePageTemplate.ts`, `usePartners.ts`, `usePublicCompanies.ts`
- `usePublicPartners.ts`, `usePublicSuppliers.ts`, `useRealtimeChat.ts`, `useServices.ts`
- `useSuppliers.ts`, `useTheme.ts`, `useTurnstileToken.ts`

### Módulos `src/modules/*/` (1 arquivo)
- Financeiro: `useFaturamento.ts`

---

## 7. Páginas/CRUDs por Módulo

| Módulo | Páginas em `src/modules/*/pages/` | Páginas em `src/pages/dashboard/` | Total |
|--------|-----------------------------------|-----------------------------------|-------|
| Candidato | 18 | — | 18 |
| Recrutamento | 10 | — | 10 |
| Empresas | 3 | — | 3 |
| Financeiro | 11 (submódulos) | 7 (financeiro/) | 18 |
| Contabilidade | 4 | — | 4 |
| Serviços | 3 | — | 3 |
| AVA | 2 | — | 2 |
| RH | — | 7 (RhPage, DashboardRh, Funcionarios, FuncionarioDetalhe, ProcessosSeletivos, Etapas, DocumentosRh) | 7 |
| Estoque | — | 2 (Estoque, Almoxarifado) | 2 |
| Fiscal | — | 1 (FiscalPage) | 1 |
| PDV | — | 0 | 0 |
| Operações | — | 0 | 0 |
| Suporte | — | 1 (Suporte) | 1 |
| Relatórios | — | 17 (Relatorio*Page) | 17 |
| Global/Admin | — | 22 (VisaoGeral, Tenants, Usuarios, Roles, etc.) | 22 |

---

## 8. Divergências Críticas Identificadas

| # | Item | Código Espera | Banco Real | Impacto | Ação |
|---|------|---------------|------------|---------|------|
| 1 | `applications` | `person_id`, `process_id`, `current_stage_id`, `last_activity_at`, `current_stage` | `id`, `candidate_id`, `job_id`, `status`, `created_at`, `updated_at`, `tenant_id`, `metadata`, `created_by`, `applied_at` | Recrutamento não consegue ler/escrever candidaturas corretamente | Alinhar schema OU adaptar repositório |
| 2 | `candidate_preferences` | Tabela existe | **Não existe nos 221** | Candidato não salva preferências | Criar tabela OU remover código |
| 3 | `candidate_courses` | `hours`, `completed_at` | `completion_date`, `expiration_date` (sem `hours`) | Currículo mostra dados incorretos | Migrar colunas OU adaptar repositório |
| 4 | Chat humano | `visitor_id`, `subject` em `chat_rooms`; `role` em `chat_messages` | `tenant_id`, `type`, `title`, `created_by_person_id`; `sender_type`, `sender_person_id` | Chat não funciona | Alinhar código com schema real |
| 5 | n8n `handoff` | Função chamada | **Não implantada** (só `noop-doc-check`, `turnstile-siteverify`) | Automação falha | Implantar Edge Function OU remover chamada |
| 6 | `bank_accounts` | Tabela existe | **Ausente em prod** (declarada em `20260827001200_finance.sql`) | Financeiro/bancos não persiste | Investigar drift (remoção, rename, manual alter) |
| 7 | `cash_flows` | Tabela existe | **Ausente em prod** (declarada em `20260827001200_finance.sql`) | Financeiro/fluxo-caixa não persiste | Investigar drift |
| 8 | `public_services_v1` | Retorna 20 serviços | Retorna 0 para `anon` | Site público sem serviços | Reconciliar `security_invoker` (prod=true vs migration=false) + gallery field |

---

## 9. Módulo ↔ Rota ↔ Permissão (Ma Atual)

| Módulo | Rota Base | Dashboard | Permissão Mínima | Middleware |
|--------|-----------|-----------|------------------|------------|
| Candidato | `/candidato` | `DashboardCandidato` | `candidate_portal_modules.read` | `CandidateRoute` |
| Recrutamento | `/recrutamento` | `DashboardRecrutamento` | `recruitment.dashboard.read` | `ProtectedRoute` + `PermissionGuard` |
| Empresas | `/empresas` | `EmpresasListPage` | `empresas.read` | `ProtectedRoute` |
| Financeiro | `/financeiro` | `FinanceiroDashboardPage` | `financeiro.dashboard.read` | `ProtectedRoute` |
| Contabilidade | `/contabilidade` | `ContabilidadeDashboardPage` | `contabilidade.dashboard.read` | `ProtectedRoute` |
| Serviços | `/servicos` (público) / `/dashboard/servicos` (admin) | `ServicosListPage` | `servicos.read` / `servicos.write` | Público: `PublicLayout`; Admin: `ProtectedRoute` |
| Suporte | `/suporte` | `SuporteDashboardPage` | `suporte.dashboard.read` | `ProtectedRoute` |
| AVA | `/ava` | `AvaDashboardPage` | `ava.dashboard.read` | `ProtectedRoute` |

---

## 10. Próximos Passos da Passagem C

1. **Confirmar inventário real** — Consultar catálogo Supabase (221 tabelas, 233 functions, 602 RLS) via MCP ou CLI read-only
2. **Completar mapeamento tabelas → módulos** — Preencher todas as 221 tabelas (até aqui ~60 mapeadas)
3. **Validar repositórios existentes** — Listar todos `*.repository.ts` e mapear para tabelas (53 feitos)
4. **Validar hooks existentes** — Listar todos `use*.ts` e mapear para repositórios (24 feitos)
5. **Validar páginas/CRUDs** — Listar todas páginas em `src/modules/*/pages/` e `src/pages/dashboard/` (105+ mapeadas)
5. **Mapear permissões → RLS** — Cruzar `permissions` table com políticas RLS
6. **Classificar cada entidade** — `REAL`, `PARCIAL`, `MOCK`, `ESPECIFICADO`, `NÃO IMPLEMENTADO`, `ÓRFÃO`, `OBSOLETO`, `CONFLITANTE`
7. **Documentar matriz final** — Arquivo único fonte de verdade para Passagem D/E

---

## 11. Observações Importantes

- **Site público**: 28 rotas, `PublicLayout`, `Navbar`, `PublicBottomNavigation`/`PortalBottomNavigation` (`lg:hidden`), `Footer` — **NÃO ALTERAR**
- **AuthContext**: Tenant isolation implementado (commit `8e7b51e`) — filtra `role_assignments` por tenant + expiração, valida global vs tenant roles, limpa estado no `switchTenant`
- **Core Contracts**: 40 testes isolados passando — prontos para integração
- **Financeiro**: 11 submódulos restaurados (`bancos`, `categoria`, `centros-custo`, `contas-pagar`, `contas-receber`, `conciliacao`, `faturamento`, `fluxo-caixa`, `parcelamentos`, `transacoes`, `dashboard`) — commit `a69d00b`
- **AVA/Contabilidade**: Restaurados do baseline `c8ce3ee`/`5759a0b`
- **Recrutamento**: Implementado via stash `{4}` (não commitado no main original)
- **Qualidade**: 611 testes passando, TypeScript limpo, Build OK, Lint OK (warnings apenas)

---

**Status da Passagem C:** Inventário inicial completo documentado. Próximo: confirmação de catálogo Supabase (read-only) e completamento da matriz para todas as 221 tabelas.