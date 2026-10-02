# SaaS Portal Architecture — Final (v1.0)

> **Status:** Aprovado para implementação (2026-10-02)
> **Baseado em:** Supabase real (`okxqfyoqbhcmflpurfrw`), 221 tabelas, RBAC existente
> **Zona protegida:** Site público (`/`, `/vagas`, `/servicos`, etc.) — NÃO será alterado

---

## Índice

1. [Princípios](#1-princípios)
2. [Zonas protegidas](#2-zonas-protegidas)
3. [Banco como source of truth](#3-banco-como-source-of-truth)
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
- **Permissão única.** MODULE_PERMISSION_MAP é a fonte única.
- **Frontend não é segurança.** RBAC + RLS são as barreiras reais.
- **Site público é zona protegida.** Não tocar.

## 2. Zonas protegidas

| Zone         | Scope                               | A alterar?                   |
| ------------ | ----------------------------------- | ---------------------------- |
| Site público | `src/pages/*` públicas, `public/*`  | NÃO                          |
| Portal       | `src/components/portal/*`           | Sim (consolidação)           |
| Módulos      | `src/modules/*` ou `src/features/*` | Sim (nova estrutura)         |
| Banco        | `supabase/migrations/*.sql`         | Só com autorização explícita |

## 3. Banco como source of truth

```text
Supabase (okxqfyoqbhcmflpurfrw)
├── 221 tabelas public
├── 5 views
├── 66 triggers não internos
├── 53 roles
├── 230 permissions
├── 739 role_permissions
└── RLS: 221/221 tabelas
```

Domínios reais no banco:

- RH (candidates, jobs, applications, interviews, employees, people)
- Empresas (companies, company_relationships)
- Comercial (crm/candidates)
- Serviços (service_orders, services)
- Operações (recruitment_processes)
- Estoque (products, stock_movements, warehouses)
- Financeiro (finance.*, accounting_entries)
- Fiscal (fiscal.*)
- POS
- Dashboard (dashboard_widgets, dashboard_layouts)
- Eventos (domain_events)
- Integrações (integration_*)
- Comunicação (notifications, messages)

## 4. Identity model

```text
auth.users
   ↓ (1:1)
people
   ↓ (1:N)
tenant_memberships
   ↓ (1:N)
role_assignments
   ↓ (N:1)
roles
   ↓ (N:N)
permissions (via role_permissions)
```

## 5. Tenant/account model

- `tenant_id` no `people` ou resolvido via `tenant_memberships`
- `currentTenantId` gerenciado por `AuthContext.switchTenant()`
- Account switcher revalida tudo ao trocar de tenant

## 6. RBAC

- `admin_master` (scope: global) — 96 permissões reais
- `company_representative` (scope: tenant) — empresa
- `candidato` (scope: tenant) — portais de candidato
- Outros roles: RH, financeiro, fiscal, estoque, suporte, etc.

## 7. Permission Contract

**Regra única:** `MODULE_PERMISSION_MAP` em `ModuleRegistry.ts` é a fonte única de verdade.

```typescript
export const MODULE_PERMISSION_MAP: Record<string, string> = {
  inicio: '',
  rh: 'people.read',
  recrutamento: 'jobs.read',
  empresas: 'companies.read',
  servicos: 'service_orders.read',
  estoque: 'stock.read',
  fiscal: 'fiscal.read',
  contabilidade: 'accounting.read',
  financeiro: 'finance.read',
  suporte: 'support_tickets.read',
  // ...
};
```

**Nenhuma permissão hardcoded em App.tsx ou components.**

## 8. Module Registry

`ModuleRegistry.ts` contém:

```typescript
export interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string; // /dashboard/<id>
  category: ModuleCategory;
  scope: 'global' | 'tenant';
  requiredPermissions?: string[]; // from MODULE_PERMISSION_MAP
  features?: ModuleFeature[];
}

export interface ModuleFeature {
  id: string;
  title: string;
  description: string;
  route: string;
  requiredPermissions?: string[];
  actions?: ModuleAction[];
}
```

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
├── Módulos disponíveis (baseado em perfil)
├── Notificações
├── Configurações
└── Conta
```

Apenas módulos que o usuário tem permissão.

## 11. Contextual Sidebar

Ao entrar em um módulo, o sidebar muda:

```text
Sidebar contextual (ModuleSidebar)
├── Dashboard (módulo)
├── Entity 1
├── Entity 2
├── Entity 3
└── Relatórios
```

## 12. Router

App.tsx é minimalista:

```text
App
├── / (public routes)
├── /dashboard/* (protected + ModuleProvider + AppShell)
├── /auth/callback
├── /candidato/* (candidate portal)
└── catch-all
```

Roteamento:

```text
App
  ↓
PermissionGuard
  ↓
ModuleProvider
  ↓
AppShell (Header + Sidebar + Main + Footer)
  ↓
ModuleWorkspace + ModulePage
  ↓
Module routes (lazy)
```

## 13. Module Cell

Estrutura por módulo:

```text
src/modules/<domain>/
├── dashboard/
│   ├── <Domain>Dashboard.tsx
│   └── widgets/
├── sidebar/
│   └── <Domain>Sidebar.tsx
├── routes/
│   └── <domain>.routes.ts
├── pages/
├── components/
├── forms/
├── crud/
├── repositories/
├── hooks/
├── services/
├── permissions.ts
└── index.ts
```

## 14. Dashboard hierarchy

### Nível 1 — Portal (Metro/Bento)

```text
/dashboard
```

Launcher visual. Tiles clicáveis.

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

Global components:

```text
src/shared/crud/
├── DataTable.tsx
├── CrudFilters.tsx
├── CrudDialog.tsx
├── CrudStates.tsx
├── FormShell.tsx
├── EntityDrawer.tsx
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
Repository
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

1. **Frontend** — PermissionGuard / RouteGuard
2. **Backend** — RPC com validação de tenant
3. **Database** — RLS + tenant_id filter

Nunca confiar em parâmetros da URL/query sem validar.

## 19. Chack Bouer 24H

> Se um módulo quebra, todos os outros continuam vivos.

### Checklist de isolamento

- [ ] Module tem seu próprio index.ts
- [ ] Module não importa de outros modules
- [ ] Module não importa de `src/pages/*`
- [ ] Repository é autossuficiente
- [ ] Permissions são declaradas, não hardcodidas
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
auth.users INSERT (trigger)
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

| Function                           | Concedido a         | Risco                                         |
| ---------------------------------- | ------------------- | --------------------------------------------- |
| `bootstrap_candidate_identity`     | anon, authenticated | Médio — aceita parâmetros arbitrários         |
| `bootstrap_company_from_auth_user` | anon, authenticated | Alto — cria empresas                          |
| `repair_candidate_chain`           | anon, authenticated | Alto — recebe person_id, tenant_id, role_code |
| `is_admin_master`                  | anon, authenticated | Baixo — read only                             |
| `user_has_permission`              | anon, authenticated | Baixo — read only                             |

### Ações necessárias

1. Restringir `repair_candidate_chain` a `service_role` apenas
2. Restringir `bootstrap_company_from_auth_user` a `service_role` apenas
3. `search_path` correto em todas as funções

## 23. Migration rules

- Nenhuma migration sem autorização explícita
- Documentar antes de migrar
- Testar contra sandbox antes
- Preservar dados existentes

## 24. Git checkpoint rules

- Commit checkpoint antes de mudanças arquitetiais grandes
- Separar arquivos válidos de temporários/gerados
- Tag: `checkpoint/architecture-<versão>`
- Branch: `arch/<versão>`

## 25. Migration order

1. **Checkpoint Git** — salvar estado atual (148 arquivos)
2. **Permission Contract** — unificar todas as permissões
3. **Platform Spine** — criar `src/platform/*`
4. **RH como módulo-piloto** — migrar tudo para `src/modules/rh/`
5. **Router modular** — module-specific routes
6. **Serviços** — `src/modules/servicos/`
7. **Estoque** — `src/modules/estoque/`
8. **Suporte** — `src/modules/suporte/`
9. **Financeiro** — `src/modules/financeiro/`
10. **Dashboard Builder** — consumir `dashboard_widgets`
11. **Candidate registration E2E test**
12. **Security hardening**

## 26. Definition of Done

Para cada módulo:

- [ ] Module cell completa
- [ ] Repository autossuficiente
- [ ] Dashboard gerencial implementado
- [ ] CRUD operacional implementado
- [ ] Forms validados (Zod)
- [ ] Permissions declaradas no ModuleRegistry
- [ ] Sidebar contextual filtrando por feature
- [ ] Rota lazy-loadable
- [ ] Tests unitários + integração
- [ ] Lint, typecheck, build passam
- [ ] IDOR test passa
- [ ] Chack Bouer 24H verificado (isolamento)
