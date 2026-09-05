# Matriz P1.4 — Dashboard × DB × CRUD × RBAC × RLS

> Gerado em 2026-09-03 a partir do cruzamento de:
> - `src/components/portal/ModuleRegistry.ts` (escopo + permissões + ações)
> - `src/App.tsx` (rotas concretas + `PAGE_COMPONENTS`)
> - `public.permissions` (217 perms no banco)
> - `src/repositories/*.repository.ts` (55 repositórios)
>
> Coluna **Status**: ✅ implementado / 🟡 parcial (apenas rota ou apenas perm) / ⚪ coming_soon / ❌ falta rota ou permissão inexistente

## Legenda de cores

- **Rota**: rota HTTP exposta em `App.tsx`
- **Página**: componente em `PAGE_COMPONENTS`
- **Permissão Registry**: `MODULE_PERMISSION_MAP` e `requiredPermissions` em `ModuleRegistry.ts`
- **Permissão DB**: existe em `public.permissions`?
- **Repository**: arquivo em `src/repositories/*` cobrindo o domínio

---

## Plataforma (admin_master / platform_admin)

| Módulo | Rota | Página | Permissão Registry | Perm DB? | Repository | Status |
|---|---|---|---|---|---|---|
| admin-master | `/dashboard/global` | `GlobalDashboardPage` | `domain_events.read` | ✅ | (sem repo dedicado) | ✅ |
| tenants | `/dashboard/tenants` | `TenantsPage` | `tenants.read` | ✅ | `tenants.repository.ts` | ✅ |
| onboarding | `/dashboard/onboarding` | `OnboardingPage` | `tenants.read` | ✅ | (reusa tenants) | ✅ |
| assinaturas | `/dashboard/assinaturas` | `AssinaturasPage` | `finance.read` | ✅ | `billing.repository.ts` | ✅ |
| gestao-saas | `/dashboard/gestao-saas` | `GestaoSaaSPage` | `domain_events.read` | ✅ | (sem repo) | 🟡 só dashboard |
| usuarios | `/dashboard/usuarios` | `UsuariosPage` | `people.read` | ✅ | `users.repository.ts`, `employees.repository.ts` | ✅ |
| roles-permissoes | `/dashboard/roles-permissoes` | `RolesPermissoesPage` | `roles.read` | ✅ | `role.repository.ts`, `permission.repository.ts` | ✅ |
| auditoria | `/dashboard/auditoria` | `AuditoriaPage` | `audit.read` | ✅ | `audit.repository.ts` | ✅ |
| rbac-auditoria | `/dashboard/rbac-auditoria` | `RbacAuditPage` | `audit.read` | ✅ | (reusa audit) | ✅ |
| integracoes | `/dashboard/integracoes` | `IntegracoesPage` | `integrations.manage` | ✅ | (sem repo) | 🟡 |
| configuracoes-saas | `/dashboard/configuracoes` | `ConfiguracoesPage` | `tenant.manage` | ✅ | `tenant.repository.ts` | ✅ |

## Tenant (operação)

| Módulo | Rota | Página | Permissão Registry | Perm DB? | Repository | Status |
|---|---|---|---|---|---|---|
| rh | `/dashboard/rh` | `DashboardRhPage` | `people.read` | ✅ | `employees.repository.ts` | ✅ |
| funcionarios | `/dashboard/funcionarios` | `FuncionariosPage` | `people.read` | ✅ | `employees.repository.ts` | ✅ |
| experiencias | `/dashboard/experiencias` | `ExperienciasPage` | `employees.read` | ✅ | `employee-experiences.repository.ts` | ✅ |
| formacao | `/dashboard/formacao` | `FormacaoPage` | `employees.read` | ✅ | `employee-education.repository.ts` | ✅ |
| cursos | `/dashboard/cursos` | `CursosPage` | `employees.read` | ✅ | `employee-courses.repository.ts` | ✅ |
| idiomas | `/dashboard/idiomas` | `IdiomasPage` | `employees.read` | ✅ | `employee-languages.repository.ts` | ✅ |
| habilidades | `/dashboard/habilidades` | `HabilidadesPage` | `employees.read` | ✅ | `employee-skills.repository.ts` | ✅ |
| documentos-rh | `/dashboard/documentos-rh` | `DocumentosRhPage` | `employees.read` | ✅ | `employee-documents.repository.ts` | ✅ |
| banco-de-talentos | `/dashboard/banco-de-talentos` | `BancoDeTalentosPage` | `candidates.read` | ✅ | `talent-pool.repository.ts` | ✅ |
| recrutamento | `/dashboard/recrutamento` | (Vagas) | `jobs.read` | ✅ | `jobs.repository.ts` | ✅ |
| vagas | `/dashboard/vagas` | `VagasPage` | `jobs.read` | ✅ | `jobs.repository.ts` | ✅ |
| candidatos | `/dashboard/candidatos` | `CandidatosPage` | `candidates.read` | ✅ | `candidates.repository.ts` | ✅ |
| candidatos/:id | `/dashboard/candidatos/:id` | `CandidatoDetalhe` | `candidates.read` | ✅ | `candidates.repository.ts` | ✅ |
| candidatos/habilidades | `/dashboard/candidatos/habilidades` | `CandidatoHabilidades` | `candidates.read` | ✅ | `candidate-skills.repository.ts` | ✅ |
| candidatos/formacao | `/dashboard/candidatos/formacao` | `CandidatoFormacao` | `candidates.read` | ✅ | `candidate-education.repository.ts` | ✅ |
| candidatos/experiencias | `/dashboard/candidatos/experiencias` | `CandidatoExperiencias` | `candidates.read` | ✅ | `candidate-experiences.repository.ts` | ✅ |
| candidatos/idiomas | `/dashboard/candidatos/idiomas` | `CandidatoIdiomas` | `candidates.read` | ✅ | `candidate-languages.repository.ts` | ✅ |
| candidatos/documentos | `/dashboard/candidatos/documentos` | `CandidatoDocumentos` | `candidates.read` | ✅ | `candidate-documents.repository.ts` | ✅ |
| candidatos/preferencias | `/dashboard/candidatos/preferencias` | `CandidatoPreferencias` | `candidates.read` | ✅ | `candidate-preferences.repository.ts` | ✅ |
| candidatos/visualizacoes | `/dashboard/candidatos/visualizacoes` | `CandidatoVisualizacoes` | `candidates.read` | ✅ | `candidate-profile-views.repository.ts` | ✅ |
| matches | `/dashboard/matches` | `JobMatches` | `jobs.read` | ✅ | `job-matches.repository.ts` | ✅ |
| candidaturas | `/dashboard/candidaturas` | `CandidaturasPage` | `applications.read` | ✅ | `applications.repository.ts` | ✅ |
| processos-seletivos | `/dashboard/processos-seletivos` | `ProcessosSeletivosPage` | `recruitment.read` | ✅ | `recruitment-processes.repository.ts` | ✅ |
| etapas | `/dashboard/etapas` | `EtapasPage` | `recruitment.stage.manage` | ✅ | `recruitment-stages.repository.ts` | ✅ |
| crm | `/dashboard/crm` | `ClientesPage` | `companies.read` | ✅ | `companies.repository.ts` | ✅ |
| empresas | `/dashboard/empresas` | `EmpresasPage` | `companies.read` | ✅ | `companies.repository.ts` | ✅ |
| relacionamentos | `/dashboard/relacionamentos` | `CompanyRelationshipsPage` | `companies.read` | ✅ | (sem repo) | 🟡 rota + perm, sem CRUD |
| financeiro | `/dashboard/financeiro` | `FinanceiroPage` | `finance.dashboard.read` | ✅ | `finance.repository.ts` | ✅ |
| contas-pagar | `/dashboard/financeiro/contas-pagar` | `FinanceiroPage` | `finance.accounts_payable.read` | ✅ | `accounts-payable.repository.ts` | ✅ |
| contas-receber | `/dashboard/financeiro/contas-receber` | `ContasReceberPage` | `finance.accounts_receivable.read` | ✅ | `accounts-receivable.repository.ts` | ✅ |
| fluxo-caixa | `/dashboard/financeiro/fluxo-caixa` | `FluxoDeCaixaPage` | `finance.cashflow.read` | ✅ | `cash-flow.repository.ts` | ✅ |
| bancos | `/dashboard/financeiro/bancos` | `BancosPage` | `finance.read` | ✅ | `bank-account.repository.ts` | ✅ |
| centro-custos | `/dashboard/financeiro/centro-custos` | `CentroCustosPage` | `finance.read` | ✅ | `cost-center.repository.ts` | ✅ |
| faturamento | `/dashboard/faturamento` | `FaturamentoPage` | `finance.read` | ✅ | `billing.repository.ts`, `invoice.repository.ts` | ✅ |
| fiscal | `/dashboard/fiscal` | `FiscalPage` | `fiscal.dashboard.read` | ✅ | `fiscal.repository.ts` | ✅ |
| contabilidade | `/dashboard/contabilidade` | `ContabilidadePage` | `accounting.dashboard.read` | ✅ | `accounting.repository.ts` | ✅ |
| estoque | `/dashboard/estoque` | `EstoquePage` | `stock.dashboard.read` (App) / `stock_movements.read` (Registry) | ✅ (divergência!) | `stock.repository.ts` | 🟡 divergência perm |
| almoxarifado | `/dashboard/almoxarifado` | `Almoxarifado` | `warehouse.dashboard.read` (App) / `stock_movements.read` (Registry) | ✅ (divergência!) | `warehouse.repository.ts` | 🟡 divergência perm |
| servicos | `/dashboard/servicos` | `Servicos` | `service_orders.dashboard.read` (App) / vazio (Registry) | ✅ (Registry está vazio) | `services.repository.ts` | 🟡 divergência perm |
| suporte | `/dashboard/suporte` | `Suporte` | `support.dashboard.read` (App) / `support_tickets.read` (Registry) | ✅ (divergência!) | `support.repository.ts` | 🟡 divergência perm |
| relatorios | `/dashboard/relatorios` | `RelatoriosPage` | `reports.read` | ✅ | (sem repo) | 🟡 |
| relatorios/{dominio} | 10 rotas | 10 pages | `reports.read` | ✅ | (sem repo) | 🟡 |
| ia | `/dashboard/ia` | `IaPage` | vazio | n/a | (sem repo) | 🟡 |
| gestao/indicadores | `/dashboard/gestao/indicadores` | (não roteado) | `domain_events.read` | ✅ | n/a | ❌ **falta rota** |
| gestao/equipes | `/dashboard/gestao/equipes` | (não roteado) | `people.read` | ✅ | n/a | ❌ **falta rota** |
| gestao/contratos | `/dashboard/gestao/contratos` | (não roteado) | `companies.read` | ✅ | n/a | ❌ **falta rota** |
| servicos-gestao (catálogo) | `/dashboard/servicos` | `Servicos` | (sobrepõe) | n/a | (duplicado) | ⚪ registry tem 2 entradas |

## Conta

| Módulo | Rota | Página | Permissão | Status |
|---|---|---|---|---|
| minha-conta | `/dashboard/configuracoes/conta` | `ConfiguracoesPage` (tab) | (sem perm) | ✅ |
| preferencias | `/dashboard/configuracoes/preferencias` | `ConfiguracoesPage` (tab) | (sem perm) | ✅ |
| seguranca-conta | `/dashboard/configuracoes/seguranca` | `SegurancaPage` | (sem perm) | ✅ |
| sessoes | `/dashboard/configuracoes/seguranca/sessoes` | `SessoesPage` | `sessions.read` | ✅ |
| notificacoes | `/dashboard/notificacoes` | `NotificationsPage` | `notifications.read` | ✅ |

---

## Achados

### A) Divergência Registry × App.tsx (BUGS)

| Rota | App.tsx pede | Registry pede | Recomendação |
|---|---|---|---|
| `/dashboard/estoque` | `stock.dashboard.read` | `stock_movements.read` | App.tsx está mais granular → manter App, alinhar Registry |
| `/dashboard/almoxarifado` | `warehouse.dashboard.read` | `stock_movements.read` | mesmo caso |
| `/dashboard/servicos` | `service_orders.dashboard.read` | `''` (vazio) | App.tsx está mais granular → manter App, corrigir Registry |
| `/dashboard/suporte` | `support.dashboard.read` | `support_tickets.read` | mesmo caso |

**Risco**: `MODULE_PERMISSION_MAP[module.id]` é usado pelo `App.tsx` para gerar o `PermissionGuard`. Como o Registry gera o mapa e o `PermissionGuard` aceita o valor do Registry, hoje o que vale é a permissão do Registry, mas o usuário **vê** apenas o `requiredPermissions` do feature. Inconsistência: o Registry não bloqueia a rota, mas o `PermissionGuard` usa `MODULE_PERMISSION_MAP` (que vem do Registry, mas as rotas estão hardcoded em `App.tsx` com permissões próprias).

Lendo o código: `App.tsx` **não usa** `MODULE_PERMISSION_MAP` para as rotas de estoque/almoxarifado/servicos/suporte — usa `PermissionGuard permission="stock.dashboard.read"` etc. diretamente. O Registry só afeta o menu lateral. Ou seja, **a divergência é só no menu** (texto de "permissão requerida"). Não bloqueia funcionalmente, mas pode confundir o usuário.

### B) Rotas faltando no App.tsx (CRÍTICO)

- `/dashboard/gestao/indicadores` — `indicadores` está em `ModuleRegistry` mas não há rota em `App.tsx`. Cai em `*` → `ComingSoonPage`.
- `/dashboard/gestao/equipes` — idem.
- `/dashboard/gestao/contratos` — idem.
- `/dashboard/candidatos/candidatos-habilidades` (registry usa `candidatos-habilidades` mas rota é `candidatos/habilidades`).

### C) Repositories faltando (MÉDIO)

- `gestao-saas`: sem repo (apenas `domain_events`).
- `relacionamentos`: rota + página existem, mas sem repository dedicado (precisa ler de `company_relationships`).
- `integracoes`: sem repository.
- `relatorios`: sem repository (gera client-side).
- `ia`: sem repository.
- `gestao/contratos`, `gestao/equipes`, `gestao/indicadores`: sem rota, sem repo.

### D) Permissões "fantasma" no Registry

`ModuleRegistry` exige `domain_events.read` para `gestao-saas`, `crm/indicadores` e `relatorios`. Real no DB, mas o conceito "domain_events" é genérico — pode estar sendo usado como catch-all. Verificar se as features realmente consultam `domain_events` ou se é permissão "decorativa".

### E) RLS (próxima checagem)

Ainda não validei `pg_policies` no banco. Próximo passo: cruzar cada tabela com sua policy.

---

## Próximas ações (P1.5 → P2)

1. **Bloqueante**: corrigir as 3 rotas `gestao/*` faltando ou removê-las do `ModuleRegistry`.
2. **Médio**: alinhar `MODULE_PERMISSION_MAP` com as permissões hardcoded em `App.tsx` para estoque/almoxarifado/servicos/suporte (manter o mais granular: `*.dashboard.read`).
3. **Médio**: criar `relacionamentos.repository.ts` e `relatorios.repository.ts` (mesmo que stub), e validar `integracoes` / `ia`.
4. **P2.1**: auditar formulários dos 4 módulos com `?`/`!` (Estoque, Servicos, Suporte, Almoxarifado).
5. **P2.2**: validar páginas de domínio que existem como rota mas faltam UI (ex.: `relatorios/servicos`, `relatorios/suporte`).
6. **P3**: TDD dos repositories críticos, forced errors, E2E.

---

## Validação RLS (segundo round, 2026-09-03)

Total de policies inspecionadas: **~180**, em **~110 tabelas**. Padrão geral é `is_tenant_member(tenant_id)` para SELECT/UPDATE/INSERT, com DELETE coberto nas tabelas onde faz sentido. Alguns achados críticos:

### 🔴 BUGS BLOQUEANTES (RLS ↔ Permissões)

#### B1. Tabela `services` exige permissões inexistentes

A RLS de `services` exige:

```sql
EXISTS (
  SELECT 1 FROM role_assignments ra
  JOIN role_permissions rp ON rp.role_id = ra.role_id
  JOIN permissions p ON p.id = rp.permission_id
  JOIN people pe ON pe.id = ra.person_id
  WHERE pe.auth_user_id = auth.uid()
    AND p.resource = 'services'
    AND p.action IN ('create','update','delete')
)
```

**Mas** `public.permissions` NÃO contém nenhuma permissão com `resource = 'services'` (somente `service_orders.*`). Consequência: **ninguém consegue criar/editar/excluir em `services` via PostgREST**, mesmo o `admin_master`.

- **Caminho do bug**: `ModuleRegistry` exige `service_orders.*` no app; a RLS exige `services.*` no banco; desalinhamento total.
- **Decisão recomendada**: a `services.repository.ts` precisa usar `service_orders` OU a policy precisa ser corrigida para `resource = 'service_orders'`. Como a tabela chama `services` mas o conceito é "ordens de serviço", a tabela deveria ser `service_orders` (já existe) e a tabela `services` é o **catálogo**. **Risco de produto**: mudar isso requer decisão arquitetural.

#### B2. Tabela `stock_movements` sem UPDATE/DELETE policy explícita

Apenas `SELECT` (`stock_movements_member_read`) e `INSERT` (`stock_movements_member_write`) — `WITH CHECK = is_tenant_member(tenant_id)`. **Sem DELETE policy**, então DELETE é bloqueado por padrão (RLS sem policy = deny). Consistente com log append-only, mas a permissão `stock_movements.export` no Registry não bate com nenhuma policy (export não tem policy porque export é client-side).

#### B3. `service_orders` SELECT/INSERT/UPDATE — sem DELETE policy

DELETE é bloqueado por padrão. Mas a permissão `service_orders.cancel` existe no Registry e o repository provavelmente faz UPDATE de `status='cancelled'`, o que é OK. **OK**.

#### B4. `support_tickets` SELECT/UPDATE/INSERT — sem DELETE policy

DELETE bloqueado. Consistente.

### 🟡 Divergências já mapeadas (revisitar)

A `MODULE_PERMISSION_MAP` do Registry usa `stock_movements.read`, `service_orders.read`, `support_tickets.read`, mas `App.tsx` (PermissionGuard) usa `*.dashboard.read`. Em RLS, nenhuma dessas tabelas tem policy que consulta `permissions` — todas usam só `is_tenant_member()`. Logo, o **defeso real é o `is_tenant_member()`**, e o `PermissionGuard` é apenas UX. **OK funcionalmente**.

### 🟢 Tabelas com RLS especial

- `services`: policy ALL `services_member_write` com EXISTS em `permissions.resource = 'services'` → **BLOQUEADO (B1)**.
- `permissions`: SELECT `USING: true` (todos leem) — público.
- `providers`: SELECT `is_active = true` — leitura pública.
- `job_skills`: 2 SELECT (público para published + member).
- `jobs`: 4 policies (public SELECT para published + member CRUD).
- `role_permissions` / `roles`: SELECT com `is_admin_master()` ou `scope = 'tenant'`.
- `tenant_memberships` / `tenant_settings` / `role_assignments`: admin_master OU member do tenant.
- `interview_followups`: policy ALL só admin_master + policy SELECT que permite member ver.
- `security_events`: ALL só admin_master.
- `people`: SELECT admin_master OU próprio auth_user_id OU member do tenant onde a pessoa tem membership ativa.
- `integration_credentials`: `USING: false` (nenhum acesso direto) — correto, é coberto via `integration_connections`.

---

## Próxima ação (P0/P1)

**P0 crítico**: corrigir B1 (`services` ↔ permissões `service_orders`). Duas opções:
1. Corrigir a policy `services_member_write` para `resource = 'service_orders'`. **(recomendada)** — alinha com Registry, app e produto.
2. Adicionar permissões `services.create/update/delete` ao DB e ao Registry.

**Risco da opção 1**: pode quebrar algum cliente que esteja usando `services.create` esperando que isso controle a tabela `services`. Mas a RLS está em DRAFT (a policy usa `EXISTS` com permissão específica), então provavelmente é um work-in-progress.

**Decisão**: parar e perguntar (mudança de policy RLS = mudança de contrato de banco = decisão destrutiva conforme AGENTS.md).
