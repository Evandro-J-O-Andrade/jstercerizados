# Passagem C — Matriz Banco ↔ Código ↔ Módulo (Sistema SaaS)

**Data:** 2026-10-14  
**Branch:** `governance/checkpoint-20261014` (commits `ae8e317`, `8e7b51e`)  
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
| Candidato | `src/modules/candidato/` | `/candidato` | `DashboardCandidato` | ✅ Restaurado |
| Contabilidade | `src/modules/contabilidade/` | `/contabilidade` | `ContabilidadeDashboardPage` | ✅ Restaurado (commit `ab24d57`) |
| Empresas | `src/modules/empresas/` | `/empresas` | `EmpresasListPage` | ✅ Implementado |
| Estoque | `src/modules/estoque/` | `/estoque` | — | ⚠️ Rotas compartilham telas legadas |
| Financeiro | `src/modules/financeiro/` | `/financeiro` | `FinanceiroDashboardPage` | ✅ 4 submódulos restaurados (`a69d00b`) |
| Fiscal | `src/modules/fiscal/` | `/fiscal` | — | ⚠️ Estrutura mínima |
| Operações | `src/modules/operacoes/` | `/operacoes` | — | ⚠️ Estrutura mínima |
| PDV | `src/modules/pos/` | `/pos` | — | ⚠️ Estrutura mínima |
| Recrutamento | `src/modules/recrutamento/` | `/recrutamento` | `DashboardRecrutamento` | ✅ Implementado (stash `{4}`) |
| RH | `src/modules/rh/` | `/rh` | `RHDashboardPage` | ⚠️ Rotas apontam para dashboards legados |
| Serviços | `src/modules/servicos/` | `/servicos` | `ServicosListPage` | ✅ Implementado |
| Suporte | `src/modules/suporte/` | `/suporte` | `SuporteDashboardPage` | ✅ Implementado |

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

## 4. Inventário de Tabelas por Módulo (A Construir)

### 4.1 Módulo Candidato
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Permissões | RLS | Estado |
|--------|----|-----|--------|-------------|-------|------------|-----|--------|
| `people` | `id` | `auth_user_id` → `auth.users` | Sim (via membership) | `candidates.repository.ts` | `/candidato/perfil`, `/candidato/curriculo` | `candidate.profile.read`, `candidate.profile.write` | ✅ | Implementado |
| `candidates` | `id` | `person_id` → `people.id` | Sim | `candidates.repository.ts` | `/candidato` | `candidate.read` | ✅ | Implementado |
| `candidate_educations` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-education.repository.ts` | `/candidato/formacao` | `candidate.education.*` | ✅ | Implementado |
| `candidate_experiences` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-experiences.repository.ts` | `/candidato/experiencia` | `candidate.experience.*` | ✅ | Implementado |
| `candidate_skills` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-skills.repository.ts` | `/candidato/habilidades` | `candidate.skill.*` | ✅ | Implementado |
| `candidate_languages` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-languages.repository.ts` | `/candidato/idiomas` | `candidate.language.*` | ✅ | Implementado |
| `candidate_documents` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-documents.repository.ts` | `/candidato/documentos` | `candidate.document.*` | ✅ | Implementado |
| `candidate_preferences` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-preferences.repository.ts` | `/candidato/preferencias` | `candidate.preference.*` | ❓ | **Divergência: tabela não existe nos 221** |
| `candidate_courses` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-courses.repository.ts` | `/candidato/cursos` | `candidate.course.*` | ✅ | **Divergência: colunas (`hours`/`completed_at` vs `completion_date`/`expiration_date`)** |
| `candidate_profile_views` | `id` | `candidate_id` → `candidates.id` | Sim | `candidate-profile-views.repository.ts` | — | `candidate.profile_view.read` | ✅ | Implementado |
| `candidate_job_alerts` | `id` | `candidate_id` → `candidates.id` | Sim | `jobAlerts.repository.ts` | `/candidato/alertas` | `candidate.alert.*` | ✅ | Implementado |
| `favorite_jobs` | `id` | `candidate_id` → `candidates.id`, `job_id` → `jobs.id` | Sim | `favoriteJobs.repository.ts` | `/candidato/favoritas` | `candidate.favorite.*` | ✅ | Implementado |

### 4.2 Módulo Recrutamento
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Permissões | RLS | Estado |
|--------|----|-----|--------|-------------|-------|------------|-----|--------|
| `jobs` | `id` | `tenant_id`, `company_id` | Sim | `jobs.repository.ts` | `/recrutamento/vagas` | `recruitment.job.*` | ✅ | Implementado |
| `applications` | `id` | `candidate_id`, `job_id`, `tenant_id` | Sim | `applications.repository.ts` | `/recrutamento/candidaturas` | `recruitment.application.*` | ✅ | **Divergência: schema DB ≠ esperado pelo módulo** |
| `recruitment_stages` | `id` | `tenant_id` | Sim | `recruitment-stage.repository.ts` | `/recrutamento/etapas` | `recruitment.stage.*` | ✅ | Implementado |
| `recruitment_processes` | `id` | `job_id`, `tenant_id` | Sim | `recruitment-process.repository.ts` | `/recrutamento/processos` | `recruitment.process.*` | ✅ | Implementado |
| `recruitment_demands` | `id` | `tenant_id`, `company_id` | Sim | `recruitment-demand.repository.ts` | `/recrutamento/demandas` | `recruitment.demand.*` | ✅ | Implementado |
| `job_matches` | `id` | `job_id`, `candidate_id`, `tenant_id` | Sim | `job-matches.repository.ts` | `/recrutamento/matches` | `recruitment.match.*` | ✅ | Implementado |
| `talent_pool` | `id` | `candidate_id`, `tenant_id` | Sim | `talent-pool.repository.ts` | `/recrutamento/talent-pool` | `recruitment.talent_pool.*` | ✅ | Implementado |

### 4.3 Módulo Financeiro
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Permissões | RLS | Estado |
|--------|----|-----|--------|-------------|-------|------------|-----|--------|
| `accounts_payable` | `id` | `tenant_id`, `supplier_id`, `cost_center_id` | Sim | `accounts-payable.repository.ts` | `/financeiro/contas-pagar` | `financeiro.contas-pagar.*` | ✅ | Implementado (restaurado `a69d00b`) |
| `accounts_receivable` | `id` | `tenant_id`, `client_id` | Sim | `accounts-receivable.repository.ts` | `/financeiro/contas-receber` | `financeiro.contas-receber.*` | ✅ | Implementado |
| `bank_accounts` | `id` | `tenant_id` | Sim | `bank-account.repository.ts` | `/financeiro/bancos` | `financeiro.banco.*` | ❓ | **Divergência: declarada em migration `20260827001200_finance.sql` mas ausente em prod** |
| `cash_flows` | `id` | `tenant_id`, `bank_account_id` | Sim | `cash-flow.repository.ts` | `/financeiro/fluxo-caixa` | `financeiro.fluxo-caixa.*` | ❓ | **Divergência: declarada em migration mas ausente em prod** |
| `financial_categories` | `id` | `tenant_id` | Sim | `financial-category.repository.ts` | `/financeiro/categoria` | `financeiro.categoria.*` | ✅ | Implementado (precisa 4 fixes) |
| `cost_centers` | `id` | `tenant_id` | Sim | `cost-center.repository.ts` | `/financeiro/centros-custo` | `financeiro.centro-custo.*` | ✅ | Implementado (restaurado) |
| `financial_transactions` | `id` | `tenant_id`, `account_id` | Sim | `financial-transaction.repository.ts` | `/financeiro/transacoes` | `financeiro.transacao.*` | ✅ | Implementado |
| `invoices` | `id` | `tenant_id`, `client_id` | Sim | `invoice.repository.ts` | `/financeiro/faturamento` | `financeiro.faturamento.*` | ✅ | Implementado |

### 4.4 Módulo Contabilidade
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Permissões | RLS | Estado |
|--------|----|-----|--------|-------------|-------|------------|-----|--------|
| `accounting_journals` | `id` | `tenant_id`, `period_id` | Sim | `accounting.repository.ts` | `/contabilidade/lancamentos` | `contabilidade.lancamento.*` | ✅ | Implementado (restaurado `ab24d57`) |
| `accounting_entries` | `id` | `journal_id`, `account_id` | Sim | `accounting.repository.ts` | `/contabilidade/lancamentos` | `contabilidade.lancamento.*` | ✅ | Implementado |
| `chart_of_accounts` | `id` | `tenant_id` | Sim | `accounting.repository.ts` | `/contabilidade/plano-contas` | `contabilidade.plano-contas.*` | ✅ | Implementado |
| `accounting_periods` | `id` | `tenant_id` | Sim | `accounting.repository.ts` | — | `contabilidade.periodo.*` | ✅ | Implementado |

### 4.5 Módulo Empresas
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Permissões | RLS | Estado |
|--------|----|-----|--------|-------------|-------|------------|-----|--------|
| `companies` | `id` | `tenant_id` | Sim | `companies.repository.ts` | `/empresas` | `empresas.*` | ✅ | Implementado |
| `company_relationships` | `id` | `company_id`, `related_company_id`, `type_id` | Sim | — | `/empresas/relacionamentos` | `empresas.relacionamento.*` | ✅ | Parcial (página existe, repo faltando) |
| `company_relationship_types` | `id` | — | Não (global) | — | — | `empresas.tipo-relacionamento.read` | ✅ | Parcial |

### 4.6 Módulo Serviços (Público + Admin)
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Permissões | RLS | Estado |
|--------|----|-----|--------|-------------|-------|------------|-----|--------|
| `services` | `id` | `tenant_id` | Sim | `services.repository.ts` | `/servicos` (público), `/dashboard/servicos` (admin) | `servicos.read`, `servicos.write` | ✅ | **Divergência: `public_services_v1` retorna 0 para `anon` (security_invoker=true em prod vs false na migration)** |
| `service_categories` | `id` | — | Não (global) | — | — | `service_category.read` | ✅ | Implementado |
| `service_images` | `id` | `service_id` | Sim | — | — | `service_image.*` | ✅ | Implementado |

### 4.7 Identidade e Autorização (Transversal)
| Tabela | PK | FKs | Tenant | Repositório | Rotas | Permissões | RLS | Estado |
|--------|----|-----|--------|-------------|-------|------------|-----|--------|
| `people` | `id` | `auth_user_id` → `auth.users` | Sim (via membership) | — | — | — | ✅ | Core |
| `tenants` | `id` | — | Não (global) | `tenant.repository.ts` | `/dashboard/tenants` | `tenant.*` | ✅ | Core |
| `tenant_memberships` | `id` | `person_id` → `people.id`, `tenant_id` → `tenants.id` | Sim | — | — | `tenant_membership.*` | ✅ | Core |
| `roles` | `id` | — | Não (global) | `role.repository.ts` | `/dashboard/roles` | `role.*` | ✅ | Core (`is_global` boolean) |
| `role_assignments` | `id` | `person_id` → `people.id`, `role_id` → `roles.id`, `tenant_id` | Sim | `role.repository.ts` | — | `role_assignment.*` | ✅ | Core |
| `permissions` | `id` | — | Não (global) | `permission.repository.ts` | — | `permission.*` | ✅ | Core |
| `role_permissions` | `id` | `role_id` → `roles.id`, `permission_id` → `permissions.id` | Não (global) | — | — | — | ✅ | Core (sem coluna `granted`) |

---

## 5. Divergências Críticas Identificadas (do Levantamento Estrutural §12)

| # | Item | Código Espera | Banco Real | Impacto | Ação |
|---|------|---------------|------------|---------|------|
| 1 | `applications` | `person_id`, `process_id`, `current_stage_id`, `last_activity_at`, `current_stage` | `id`, `candidate_id`, `job_id`, `status`, `created_at`, `updated_at`, `tenant_id`, `metadata`, `created_by`, `applied_at` | Recrutamento não consegue ler/escrever candidaturas corretamente | Alinhar schema OU adaptar repositório |
| 2 | `candidate_preferences` | Tabela existe | **Não existe nos 221** | Candidato não salva preferências | Criar tabela OU remover código |
| 3 | `candidate_courses` | `hours`, `completed_at` | `completion_date`, `expiration_date` (sem `hours`) | Currículo mostra dados incorretos | Migrar colunas OU adaptar repositório |
| 4 | Chat humano | `visitor_id`, `subject` em `chat_rooms`; `role` em `chat_messages` | `tenant_id`, `type`, `title`, `created_by_person_id`; `sender_type`, `sender_person_id` | Chat não funciona | Alinhar código com schema real |
| 5 | n8n `handoff` | Função chamada | **Não implantada** (só `noop-doc-check`, `turnstile-siteverify`) | Automação falha | Implantar Edge Function OU remover chamada |

---

## 6. Módulo ↔ Rota ↔ Permissão (Ma Atual)

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

## 7. Próximos Passos da Passagem C

1. **Confirmar inventário real** — Consultar catálogo Supabase (221 tabelas, 233 functions, 602 RLS) via MCP ou CLI read-only
2. **Completar mapeamento tabelas → módulos** — Preencher todas as 221 tabelas
3. **Validar repositórios existentes** — Listar todos `*.repository.ts` e mapear para tabelas
4. **Validar hooks existentes** — Listar todos `use*.ts` e mapear para repositórios
5. **Validar páginas/CRUDs** — Listar todas páginas em `src/modules/*/pages/` e `src/pages/dashboard/`
6. **Mapear permissões → RLS** — Cruzar `permissions` table com políticas RLS
7. **Classificar cada entidade** — `REAL`, `PARCIAL`, `MOCK`, `ESPECIFICADO`, `NÃO IMPLEMENTADO`, `ÓRFÃO`, `OBSOLETO`, `CONFLITANTE`
8. **Documentar matriz final** — Arquivo único fonte de verdade para Passagem D/E

---

## 8. Observações Importantes

- **Site público**: 28 rotas, `PublicLayout`, `Navbar`, `PublicBottomNavigation`/`PortalBottomNavigation` (`lg:hidden`), `Footer` — **NÃO ALTERAR**
- **AuthContext**: Tenant isolation implementado (commit `8e7b51e`) — filtra `role_assignments` por tenant + expiração, valida global vs tenant roles, limpa estado no `switchTenant`
- **Core Contracts**: 40 testes isolados passando — prontos para integração
- **Financeiro**: 4 submódulos restaurados (`bancos`, `categoria`, `centros-custo`, `contas-pagar`) — commit `a69d00b`
- **AVA/Contabilidade**: Restaurados do baseline `c8ce3ee`/`5759a0b`
- **Recrutamento**: Implementado via stash `{4}` (não commitado no main original)

---

**Status da Passagem C:** Em andamento — inventário inicial documentado. Próximo: confirmação de catálogo Supabase e completamento da matriz.