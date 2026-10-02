# SaaS Portal Architecture — Final (v1.0)

> **Status:** Aprovado para implementação (2026-10-02)
> **Baseado em:** Supabase real (`okxqfyoqbhcmflpurfrw`), 221 tabelas, RBAC existente
> **Zona protegida:** Site público (`/`, `/vagas`, `/servicos`, etc.) — NÃO será alterado

---

## Índice

1. [Princípios](#1-princípios)
2. [Zonas protegidas](#2-zonas-protegidas)
3. [Estado atual do código](#3-estado-atual-do-código)
4. [Identity model](#4-identity-model)
5. [Tenant/account model](#5-tenantaccount-model)
6. [RBAC](#6-rbac)
7. [Permission Contract](#7-permission-contract)
8. [Module Registry](#8-module-registry)
9. [Portal](#9-portal)
10. [Global Sidebar](#10-global-sidebar)
11. [Contextual Sidebar](#11-contextual-sidebar)
12. [Router](#12-router)
13. [Module Cell](#13-module-cell)
14. [Dashboard hierarchy](#14-dashboard-hierarchy)
15. [CRUD architecture](#15-crud-architecture)
16. [Forms architecture](#16-forms-architecture)
17. [Repository/Service/Hook](#17-repositoryservicehook)
18. [IDOR model](#18-idor-model)
19. [Chack Bouer 24H](#19-chack-bouer-24h)
20. [Candidate registration](#20-candidate-registration)
21. [Dashboard Builder](#21-dashboard-builder)
22. [Security hardening](#22-security-hardening)
23. [Migration rules](#23-migration-rules)
24. [Git checkpoint rules](#24-git-checkpoint-rules)
25. [Migration order](#25-migration-order)
26. [Definition of Done](#26-definition-of-done)

---

## 1. Princípios

- **Banco é fonte de verdade.** Frontend consome, não recria.
- **Cada módulo é uma célula independente.** Chack Bouer 24H.
- **Um Portal global.** Não há PortalRH, PortalEstoque, etc.
- **Permissão única.** `MODULE_PERMISSION_MAP` é a fonte única.
- **Frontend não é segurança.** RBAC + RLS são as barreiras reais.
- **Site público é zona protegida.** Não tocar.

## 2. Zonas protegidas

| Zone         | Scope                               | A alterar?                   |
| ------------ | ----------------------------------- | ---------------------------- |
| Site público | `src/pages/*` públicas, `public/*`  | NÃO                          |
| Portal       | `src/components/portal/*`           | Sim (consolidação)           |
| Módulos      | `src/modules/*` ou `src/features/*` | Sim (nova estrutura)         |
| Banco        | `supabase/migrations/*.sql`         | Só com autorização explícita |

## 3. Estado atual do código

### Estrutura existente

```text
src/
├── App.tsx                    # Router principal (926 lines)
├── components/
│   ├── auth/                  # ProtectedRoute, AuthRoute, PermissionGuard
│   ├── layout/                # AppShell, PublicLayout, Footer
│   ├── portal/                # ModuleRegistry, ModuleWorkspace, PortalShell, etc.
│   ├── sections/              # CinematicShowcase, HeroImage, etc.
│   ├── shared/crud/           # DataTable, CrudFilters, ModulePage (8 componentes)
│   ├── feedback/              # ToastProvider
│   └── fallback/              # EmptyState, RouteLoadingFallback
├── contexts/
│   ├── AuthContext.tsx        # Fonte de verdade: auth.users, people, roles, permissions
│   ├── AccountContext.tsx     # Consolida identidade, tenant, módulos, permissões
│   ├── ModuleContext.tsx      # Detecta módulo/feature da URL atual
│   ├── CandidateContext.tsx   # Contexto específico de candidato
│   ├── UserIdentity.ts        # Derivador de identidade (people + roles + tenant)
│   └── IntroContext.tsx       # Intro cinematográfico
├── modules/rh/                # Façade de transição (não autossuficiente ainda)
│   ├── dashboard/             # RHDashboardPage.tsx (reativa para src/pages/dashboard/DashboardRh)
│   ├── candidates/            # Re-exporta páginas existentes
│   ├── types/                 # Tipos de domínio
│   ├── repositories/          # Re-exporta repositórios existentes
│   ├── services/              # Re-exporta services existentes
│   └── routes/                # Definição de rotas (incompleta: apenas dashboard stub)
├── features/candidato/        # Portal de candidato (separado do módulo principal)
│   └── pages/                 # CandidateMetroDashboard, Vagas, Candidaturas, etc.
├── pages/
│   ├── dashboard/             # ~50 páginas de dashboard (Candidatos, Funcionarios, etc.)
│   ├── auth/                  # Login, Cadastro, Callback, Termos, BoasVindas
│   └── [públicas]             # Home, Sobre, Vagas, Servicos, etc. (PROTETIDAS)
├── repositories/              # ~30 repositórios Supabase
├── services/                  # Services de negócio
├── hooks/                     # Hooks React
└── types/                     # Tipos globais
```

### Router

App.tsx usa padrão híbrido:

- **Rotas fixas:** DashboardHome, analitico, global, rbac-auditoria, etc. (hardcoded)
- **Rotas dinâmicas:** `launcherRoutes` geram rotas a partir de `PORTAL_MODULES.filter()` + `createModuleDashboardPage()` — mas ainda faltam as sub-rotas dos features.

### ModuleRegistry (2498 lines)

- `PORTAL_MODULES`: 26 módulos com `ModuleFeature[]` aninhados, `requiredPermissions`, `implementationStatus`
- `MODULE_PERMISSION_MAP`: 30 entradas mapeando module ID → permissão top-level
- Funções helper: `hasModulePermission`, `getAvailableModules`, `getAvailableFeatures`, `getModuleById`, `groupModulesByCategory`

### Contextos

- `AuthContext` → fonte de verdade (person, roles, permissions, tenant, switchTenant)
- `AccountContext` → `AccountProvider` consolida identidade + availableModules + switchAccount
- `ModuleContext` → `ModuleProvider` detecta módulo/feature da URL
- App.tsx envolve tudo com `AuthRoute → ProtectedRoute → ModuleProvider → AppShell`

### Problemas conhecidos

1. **Permissões literais espalhados** — App.tsx ainda tem 20+ `PermissionGuard permission="string"` literais
2. **AppShell fixo** — ainda não filtra sidebar por feature
3. **Module façade não autossuficiente** — `src/modules/rh/` re-exporta de `src/pages/dashboard/`
4. **Module routes incompleto** — `rhRoutes` tem apenas um stub
5. **CRUD não unificado** — `src/shared/crud/` existe mas não é usado por todos os módulos

## 4. Identity model

```text
auth.users
   ↓ (1:1 via auth.uid())
people
   ↓ (1:N via tenant_memberships)
tenants
   ↓ (N:1 via role_assignments)
roles
   ↓ (N:N via role_permissions)
permissions
```

### Flow de boot

```text
Supabase client
  ↓
AuthContext (on_auth_state_change)
  ↓
fetchPerson() → people via auth.uid()
  ↓
fetchRoles() → role_assignments join roles
  ↓
fetchPermissions() → role_permissions join permissions
  ↓
switchTenant() → atualiza currentTenantId
  ↓
RLS usa auth.uid() + current_setting('app.tenant_id')
```

## 5. Tenant/account model

- `tenant_id` resolvido via `tenant_memberships`
- `currentTenantId` em `AuthContext`
- Account switcher via `AccountContext.switchAccount()` → `AuthContext.switchTenant()`

## 6. RBAC

- `admin_master` (scope: global) — 96 permissões reais
- `company_representative` (scope: tenant) — empresa
- `candidato` (scope: tenant) — portal de candidato
- Outros: RH, financeiro, fiscal, estoque, suporte, etc.

## 7. Permission Contract

**Regra única:** `MODULE_PERMISSION_MAP` em `ModuleRegistry.ts` é a fonte única de verdade.

```typescript
export const MODULE_PERMISSION_MAP: Record<string, string> = {
  inicio: '',
  'admin-master': 'domain_events.read',
  tenants: 'tenants.read',
  rh: 'people.read',
  recrutamento: 'jobs.read',
  servicos: 'service_orders.read',
  estoque: 'stock.read',
  fiscal: 'fiscal.read',
  contabilidade: 'accounting.read',
  financeiro: 'finance.read',
  suporte: 'support_tickets.read',
  // ...
};
```

**Nenhuma permissão hardcoded em App.tsx.** Todas as rotas novas usam `MODULE_PERMISSION_MAP[moduleId]`.

## 8. Module Registry

O `ModuleRegistry.ts` já define:

```typescript
export interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string; // /dashboard/<id>
  category: ModuleCategory;
  scope: 'global' | 'tenant';
  requiredPermissions?: string[]; // do banco
  features?: ModuleFeature[];
}

export interface ModuleFeature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  route: string;
  requiredPermissions?: string[];
  actions?: ModuleAction[];
  features?: ModuleFeature[]; // sub-features aninhadas
  implementationStatus?:
    'implemented' | 'coming_soon' | 'beta' | 'disabled' | 'deprecated';
}
```

**Funcionalidades helper existentes:**

- `getAvailableModules(permissions, scope)` — filtra módulos por permissão
- `getAvailableFeatures(permissions, module, scope)` — filtra features de um módulo
- `getModuleById(id)` — lookup O(1)
- `groupModulesByCategory(modules)` — agrupa para o Portal

## 9. Portal

```text
/dashboard
  ↓
Portal (DashboardHome)
  ↓
MetroTileGrid — tiles dinâmicos baseados em perfil
```

O Portal é **um só lugar**. Ele consulta `getAvailableModules()` e mostra os tiles.

## 10. Global Sidebar

```text
Sidebar global (PortalSidebar)
├── Início
├── Módulos disponíveis (baseado em perfil)
├── Notificações
├── Minha Conta
└── Sair
```

Apenas módulos que o usuário tem permissão.

## 11. Contextual Sidebar

Ao entrar em um módulo, o sidebar muda para:

```text
Sidebar contextual (ModuleSidebar)
├── Dashboard (módulo)
├── Feature 1
├── Feature 2
├── Entity 1
├── Entity 2
└── Relatórios
```

Filtrado por: `getAvailableFeatures(permissions, module, scope)`

**Sidebar nunca é segurança.** É UX filtering apenas.

## 12. Router

### Estado atual

App.tsx é o router principal:

```text
App
├── / (public routes) — PROTEGIDO
├── /dashboard/* (AuthRoute → ProtectedRoute → ModuleProvider → AppShell)
├── /auth/callback
├── /onboarding
├── /candidato/* (CandidateRoute → CandidateProvider → CandidatePortal)
├── /auth/* (login, cadastro, etc.)
└── catch-all
```

### Roteamento dinâmico

```tsx
const launcherRoutes = PORTAL_MODULES.filter(
  (module) =>
    module.route !== '/dashboard' &&
    (MODULE_PERMISSION_MAP[module.id] || !module.requiredPermissions?.length),
).map((module) => ({
  key: module.id,
  path: module.route.replace('/dashboard/', ''),
  moduleId: module.id,
  permission: MODULE_PERMISSION_MAP[module.id],
}));
```

### Objetivo Phase 2

Migrar para **module-specific routes** — cada módulo define suas próprias rotas via `ModuleRoute[]`. O App.tsx consome dinamicamente.

## 13. Module Cell

Estrutura alvo:

```text
src/modules/<domain>/
├── routes/              # ModuleRoute[] — rotas do módulo
├── dashboard/           # Dashboard gerencial (Level 2)
├── sidebar/             # Sidebar contextual do módulo
├── pages/               # Páginas do módulo
├── components/          # Componentes específicos do módulo
├── forms/               # Forms com Zod validation
├── crud/                # CRUD operations
├── repositories/        # Repository wrapper (Supabase)
├── hooks/               # React hooks
├── services/            # Business logic
├── types/               # Domain types
├── permissions.ts       # Permissões específicas do módulo
└── index.ts             # Public API do módulo
```

### Módulo piloto: RH

```text
src/modules/rh/
├── routes/index.ts      # rhRoutes: ModuleRoute[]
├── dashboard/
│   ├── RHDashboardPage.tsx
│   └── index.ts
├── sidebar/
│   └── RHSidebar.tsx
├── pages/
│   ├── CandidatosPage.tsx
│   ├── VagasPage.tsx
│   ├── FuncionariosPage.tsx
│   └── ...
├── crud/
├── forms/
├── repositories/        # (exists - re-exports)
├── services/            # (exists - re-exports)
├── types/               # (exists - domain types)
├── permissions.ts       # RH-specific permissions
└── index.ts
```

## 14. Dashboard hierarchy

### Nível 1 — Portal

```text
/dashboard
```

Launcher visual (Metro/Bento). Tiles clicáveis.

### Nível 2 — Dashboard gerencial

```text
/dashboard/<module>
```

KPIs, gráficos, indicadores.

### Nível 3 — Operacional

```text
/dashboard/<entity>
```

Tabela, formulário, CRUD. Foco em densidade e legibilidade.

## 15. CRUD architecture

Shared components em `src/shared/crud/`:

```text
src/shared/crud/
├── DataTable.tsx
├── CrudFilters.tsx
├── CrudDialog.tsx
├── CrudStates.tsx
├── ModulePage.tsx
├── CrudAlerts.tsx
├── types.ts
└── index.ts
```

Cada módulo instancia o CRUD com seus próprios repositórios e schemas.

## 16. Forms architecture

- Validação: Zod
- Hook form: react-hook-form
- Forms vivem **dentro do módulo**
- Shared: apenas componentes genéricos de input

## 17. Repository/Service/Hook

```text
Repository (Supabase wrapper)
  ↓
Service (business logic)
  ↓
Hook (React integration)
  ↓
Component
```

Repository é grosso modo um wrapper do Supabase client.

Service contém validações de negócio.

Hook é o ponto de entrada no React.

## 18. IDOR model

3 barreiras:

1. **Frontend** — PermissionGuard / RouteGuard / ProtectedRoute
2. **Backend** — Repository queries filtered by tenant_id
3. **Database** — RLS com `current_setting('app.tenant_id')` + `auth.uid()`

Exemplo: candidate 123 não pode ser acessado sem validação de tenant + person_id.

## 19. Chack Bouer 24H

> Se um módulo quebra, todos os outros continuam vivos.

### Checklist de isolamento

- [ ] Module tem seu próprio `index.ts`
- [ ] Module não importa de outros modules (exceto platform/shared)
- [ ] Module não importa de `src/pages/*` (exceto durante migração)
- [ ] Repository é autossuficiente
- [ ] Permissions são declaradas no `permissions.ts`, não hardcodidas
- [ ] Module test suite passa independentemente dos outros
- [ ] Module build chunk é independente

## 20. Candidate registration

```text
/cadastro/candidato
  ↓
AuthContext.register({ signupContext: 'candidato' })
  ↓
supabase.auth.signUp()
  ↓
auth.users INSERT (trigger AFTER INSERT)
  ↓
handle_new_auth_user() → people
  ↓
bootstrap_candidate_from_auth_user() → tenant_memberships + candidates + role_assignments + first_login_state
  ↓
session estabelecida
  ↓
redirect → /auth/welcome → /candidato
  ↓
CandidateRoute (verifica isCandidate)
  ↓
CandidateProvider → CandidateContext
  ↓
CandidatePortal
```

### Fix aplicado

- Migration `20260925000001_fix_missing_candidate_trigger.sql`
- `CadastroCandidato.tsx` now passes `signupContext: 'candidato'`

## 21. Dashboard Builder

Banco já possui:

- `dashboard_widgets` — definição de widgets
- `dashboard_layouts` — layout por role/tenant

Frontend precisa consumir estas tabelas para construir dashboards dinâmicos.

## 22. Security hardening

### Security Definer functions expostas

| Function                           | Concedido a         | Risco |
| ---------------------------------- | ------------------- | ----- |
| `bootstrap_candidate_identity`     | anon, authenticated | Médio |
| `bootstrap_company_from_auth_user` | anon, authenticated | Alto  |
| `repair_candidate_chain`           | anon, authenticated | Alto  |
| `set_primary_media`                | anon, authenticated | Médio |
| `is_admin_master`                  | anon, authenticated | Baixo |
| `user_has_permission`              | anon, authenticated | Baixo |

### Ações necessárias

1. Restringir funções de write a `service_role` apenas
2. `search_path` correto em todas as funções SECURITY DEFINER

## 23. Migration rules

- Nenhuma migration sem autorização explícita
- Documentar antes de migrar
- Testar contra sandbox antes
- Preservar dados existentes

## 24. Git checkpoint rules

- Commit checkpoint antes de mudanças arquитектurais grandes
- Separar arquivos válidos de temporários/gerados
- Tag: `checkpoint/architecture-<versão>`
- Branch: `arch/<versão>`

## 25. Migration order

1. ✅ **Checkpoint Git** — salvar estado atual
2. ✅ **Fixes críticos** — candidate trigger, signupContext, permission contract
3. ✅ **ARCHITECTURE-03-SAAS-SPINE** — documento esta sendo criado
4. **Phase 2-A: Platform Spine** — `src/platform/*`
5. **Phase 2-B: Router modular** — module-specific routes
6. **Phase 2-C: RH como célula piloto** — migrar pages → modules/rh/pages
7. **Phase 2-D: Candidate portal** — migrar features → modules
8. **Phase 2-E: Security hardening** — Supabase functions
9. **Phase 2-F: Dashboard Builder** — consumir dashboard_widgets
10. **Phase 2-G: Serviços, Estoque, Suporte** — novos módulos

## 26. Definition of Done

Para cada módulo:

- [ ] Module cell completa (routes, dashboard, sidebar, pages, crud, forms, repositories, hooks, services, types)
- [ ] Permissions declaradas no `permissions.ts`
- [ ] Router modular integrado
- [ ] Tests unitários + integração passam
- [ ] Lint, typecheck, build passam
- [ ] IDOR test passa
- [ ] Chack Bouer 24H verificado (isolamento)
