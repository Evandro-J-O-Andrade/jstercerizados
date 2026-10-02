# Portal Architecture Rules

Regras estruturais obrigatórias para o Portal. Nenhuma implementação futura pode violar estas regras.

## 1. Fonte única de verdade

`ModuleRegistry` é a única fonte de verdade para:

- módulos
- features
- permissões requeridas
- ações CRUD
- rotas
- páginas

Nenhum outro arquivo pode duplicar essa definição.

## 2. RBAC real, sem bypass

- `admin_master` não é bypass. Ele funciona porque possui 96 permissões reais no Supabase.
- Nunca usar `isAdminMaster` como condição de autorização na UI.
- Nunca usar `[]` como fallback de permissões.
- A permissão efetiva do usuário vem de:
  - `AuthContext` → `permissions`
  - derivadas de `role_assignments` → `roles` → `role_permissions` → `permissions`

## 3. Separação produto / runtime / autorização

### Produto (estático)

- Sidebar
- Dashboard
- Cards
- Ícones
- Layout
- Módulos
- Textos

### Runtime (sempre Supabase/AuthContext)

- Nome do usuário (`people.full_name`)
- Email
- Tenant
- Role
- Permissões
- Contexto ativo

### Autorização (sempre RBAC real)

- role
  - permissions
    - features
      - ações CRUD

## 4. Identidade real do usuário

Nunca usar nomes hardcoded. Sempre derivar de `people.full_name` via `AuthContext`.

Exemplo correto:

```tsx
const { person } = useAuth();
const firstName = person?.full_name?.split(' ')[0] || 'Usuário';
```

Exemplo incorreto:

```tsx
'Bom dia, Evandro';
```

## 5. Navegação dinâmica por permissão

Sidebar e Dashboard devem exibir apenas módulos/features que o usuário pode acessar.

Filtro granular:

- Módulo: se usuário não tiver `module.requiredPermissions`, módulo não aparece
- Feature: se usuário não tiver `feature.requiredPermissions`, feature não aparece
- Ação: se usuário não tiver `action.permission`, ação não aparece

## 6. Autorização em 4 níveis

1. Módulo: `finance.dashboard.read`
2. Feature: `finance.accounts_payable.read`
3. Ação: `finance.accounts_payable.create`
4. Backend/RLS: Supabase nega acesso se permissão não existir

Frontend não é segurança. Backend/RLS é obrigatório.

## 7. Permissão efetiva por página

Cada página deve receber o conjunto de permissões efetivas do usuário e cada ação CRUD deve verificar sua respectiva permissão.

Sidebar, Dashboard, rotas, páginas e ações devem consumir a mesma matriz.

## 8. Contexto Global vs Tenant

- `admin_master` (scope: `global`) acessa módulos `platform`
- Roles tenant (scope: `tenant`) acessam módulos `tenant`
- `AccountContext` deriva o scope a partir de `identity.roleScope`

## 9. Sem componentes paralelos

Código legado em `src/components/dashboard/` não deve ser usado:

- `DashboardShell`
- `DashboardSidebar`
- `DashboardHeader`
- `DashboardRouter`
- `Breadcrumb`
- `NavigationResolver`

Usar apenas:

- `src/components/portal/PortalSidebar.tsx`
- `src/components/portal/PortalHeader.tsx`
- `src/components/portal/ModuleRegistry.ts`
- `src/components/portal/AccountContext.tsx`
- `src/App.tsx`

## 10. Rotas dinâmicas

> **Status desta regra: PARCIALMENTE CUMPRIDA — ver reconciliação 02C.2.**
> A formulação anterior citava `MODULE_PAGE_MAP`, que **não existe no código** (removido no checkpoint D1). Substituída pelo mecanismo real, descrito abaixo.

### 10.1 Mecanismo real (verificado em `src/App.tsx`)

As rotas do dashboard são produzidas por **três mecanismos coexistindo**:

| #   | Mecanismo                                                             | Local                                        | Quantidade         |
| --- | --------------------------------------------------------------------- | -------------------------------------------- | ------------------ |
| 1   | `launcherRoutes` gerado de `PORTAL_MODULES` + `MODULE_PERMISSION_MAP` | `App.tsx:187-198`, renderizado em `:738-765` | 28 rotas de módulo |
| 2   | `<Route>` escritos à mão, cada um com `<PermissionGuard>`             | `App.tsx:236-737`                            | 106 rotas          |
| 3   | Catch-all `"Em breve"` dentro de cada módulo gerado                   | `App.tsx:751-762`                            | filha de (1)       |

O módulo gerado (1) monta `createModuleDashboardPage(moduleId)` com duas rotas filhas: `<Route index element={null} />` e `<Route path="*">` → `EmptyState` "Em breve".

### 10.2 Regra vigente

1. `PORTAL_MODULES` + `MODULE_PERMISSION_MAP` são a fonte de verdade para **módulos e permissões**. `MODULE_PAGE_MAP` **não** faz mais parte do sistema.
2. Toda rota de dashboard deve ser protegida por `<PermissionGuard>` ou pela permissão do módulo gerado.
3. Nenhuma rota de dashboard deve apontar para um componente inexistente.

### 10.3 Violação conhecida (registrada, não corrigida no 02C.2)

A afirmação anterior _"Nenhuma rota do dashboard deve ser hardcoded no `App.tsx` exceto o catch-all"_ **não é cumprida**: existem 106 rotas escritas à mão.

Além disso, **22 das 28 rotas de módulo estão declaradas das duas formas** — explicitamente em `App.tsx` e via `launcherRoutes`. Nesses casos a rota explícita é declarada antes (linhas 236-737) e a gerada depois (738-765), de modo que a **rota explícita prevalece** e a gerada fica sombreada para o hub do módulo.

| Módulos com rota de módulo duplicada (22 de 28)                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `almoxarifado`, `assinaturas`, `auditoria`, `configuracoes`, `configuracoes/seguranca`, `contabilidade`, `crm`, `estoque`, `faturamento`, `financeiro`, `fiscal`, `gestao-saas`, `global`, `ia`, `integracoes`, `onboarding`, `relatorios`, `rh`, `roles-permissoes`, `servicos`, `suporte`, `tenants` |

**Efeito prático:** o hub desses 22 módulos renderiza a página escrita à mão (ex.: `rh` → `RHDashboardPage`, `estoque` → `Estoque`, `suporte` → `Suporte`) em vez de `ModuleDashboardPage`. O fallback `"Em breve"` permanece alcançável apenas para sub-rotas.

**Classificação: CONTRADIÇÃO — decisão pendente.** Consolidar em um único mecanismo é mudança de código e **não** foi feita no 02C.2.

## 11. Teste por usuário

Cada role seedada deve ser testada individualmente para validar:

- Sidebar: módulos/features corretos
- Dashboard: KPIs e cards corretos
- Rotas: acessíveis conforme permissão
- CRUD: botões habilitados conforme permissão

Usuários seedados:

- Evandro (`admin_master`, 96 permissões)
- Gestor (`tenant_admin`, 162 permissões)
- Financeiro (`finance_manager`, 41 permissões)
- Demais roles: próprias permissões

## 12. Inventário primeiro, implementação depois

Nenhuma alteração de código pode ser feita antes do inventário estar completo e validado.

Fases obrigatórias:

1. Inventário
2. RBAC matrix
3. Pages matrix
4. Navigation matrix
5. Reconstrução

---

## 13. Registro de execução P0 (2026-09-30)

### Inspeção técnica do worktree local concluída

Arquivos inspecionados diretamente no worktree `C:\NewWaveProjetos\jrtercerisados`:

| Arquivo                                       | Linhas     | Status                                                                                            |
| --------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `src/components/portal/PortalShell.tsx`       | 88         | ✅ Fonte única de layout (100dvh, fixed header/sidebar/footer, body scroll lock, internal scroll) |
| `src/components/portal/PortalHeader.tsx`      | 354        | ✅ Header fixo com account switcher                                                               |
| `src/components/portal/PortalSidebar.tsx`     | 630        | ✅ Sidebar global com permissions (não module-specific)                                           |
| `src/components/portal/ModuleSidebar.tsx`     | 66         | ✅ Sidebar contextual baseada em `getAvailableFeatures`                                           |
| `src/components/portal/ModuleWorkspace.tsx`   | 101        | ✅ Breadcrumb + page header layout                                                                |
| `src/components/portal/ModuleRegistry.ts`     | 2498+      | ✅ Fonte única + `getModuleById()` adicionado                                                     |
| `src/components/portal/MetroTiles.tsx`        | 1263       | ✅ Metro grid (DashboardHome launcher)                                                            |
| `src/components/portal/CandidateContent.tsx`  | 59         | ✅ Candidate portal content                                                                       |
| `src/components/portal/CandidateHeader.tsx`   | 36         | ✅ Candidate portal header                                                                        |
| `src/components/portal/CandidatePortal.tsx`   | 43         | ✅ Candidate portal shell                                                                         |
| `src/components/portal/CandidateSidebar.tsx`  | 234        | ✅ Candidate portal sidebar                                                                       |
| `src/components/portal/NavigationResolver.ts` | 7          | ⚠️ Inalcançável (0 consumers) — registrado no migration-map                                       |
| `src/components/portal/PortalFooter.tsx`      | 84         | ⚠️ Inalcançável no build atual (0 consumers) — protegido                                          |
| `src/components/portal/ModuleCard.tsx`        | 105        | ✅ Card do módulo                                                                                 |
| `src/components/modules/ModulePage.tsx`       | 43         | ✅ Adapter do `shared/crud/ModulePage.tsx` (256→43)                                               |
| `src/contexts/ModuleContext.tsx`              | 117        | ✅ ModuleProvider + `useModuleContext()` (route matching)                                         |
| `src/contexts/AccountContext.tsx`             | 194        | ✅ AccountProvider + `useAccount()` (identity, permissions, modules)                              |
| `src/pages/dashboard/Candidatos.tsx`          | 529        | ✅ Código existente de RH — reutilizar, não duplicar                                              |
| `src/shared/crud/*.ts` (8 arquivos)           | ~743 total | ✅ Infra CRUD global (DataTable, CrudFilters, ModulePage, types, etc.)                            |
| `src/repositories/candidates.repository.ts`   | 203        | ✅ Repository real com queries Supabase                                                           |

### Findings críticos

1. **`temp-auth.json`** (62 bytes, untracked) — ⚠️ **SECURITY BLOCKER**: contém credenciais plaintext (`evandro_j.o.a@hotmail.com` / `@An29070818`). Não commitar. Documentar em `docs/SECURITY-BLOCKERS.md`.
2. **`MODULE_PERMISSION_MAP`** — 6 de 28 módulos têm permission string vazia (`inicio`, `servicos`, `ia`, `preferencias`, `minha-conta`, `seguranca-conta`). RH (`people.read`) e Recrutamento (`jobs.read`) já estão mapeados. Detalhes em `docs/architecture/02C.2-DOCUMENTATION-RECONCILIATION.md` §10.
3. **`src/modules/rh/`** — 8 arquivos (index.ts, types/_, repositories/_, services/_, routes/_, candidates/_, dashboard/_) — façade de transição, CONGELADO, não expandir ou apagar.
4. **60 repositórios** em `src/repositories/` implementados com queries Supabase reais — fonte de dados viva.
5. **22/28 rotas de módulo** declaradas tanto explicitamente quanto via launcher — rota explícita prevalece sobre gerada.

### Decisões do P0

- `PORTAL_MODULES` + `MODULE_PERMISSION_MAP` mantidos como fonte única (12 regras).
- AppShell contract (02C.1) está completo e aprovado — spec formal pronto para implementação.
- Nenhum código alterado no P0 — apenas inspeção, mapeamento e documentação.

---

## 23. Correção P0 → P1 (2026-10-02)

### 23.1 Migration: Missing candidate trigger

**Problem:** The `bootstrap_candidate_from_auth_user()` function was correctly defined
in migrations (`20260826000001`, `20260909000001`, `20260910000002`, `20260918000001`) but
**never associated to a trigger**. When a candidate signs up via
`supabase.auth.signUp()`, the trigger `on_auth_user_created` → `handle_new_auth_user()`
fires and creates `people`, but `tenant_memberships`, `candidates`, `role_assignments`, and
`first_login_state` are **never provisioned**, so:

- `isCandidate` remains `false` (no `role_assignments` for `candidato` role)
- Candidate cannot access `/candidato/*` (redirected to `/dashboard`)
- `CandidateContext` resolution returns `null` (no `candidates` row)

**Fix:** Created `20260925000001_fix_missing_candidate_trigger.sql` that creates
`trg_bootstrap_candidate_from_auth_user` trigger on `auth.users AFTER INSERT`,
calling `public.bootstrap_candidate_from_auth_user()`. The function has a GUARD:
if `signup_context = 'empresa'`, it returns early — so empresa signups are unaffected.

### 23.2 Frontend: signupContext on CadastroCandidato

`src/pages/CadastroCandidato.tsx` was not passing `signupContext: 'candidato'`
to `register()`. Added the explicit context to distinguish from empresa flow.
While not the root cause (the function accepts NULL), it is a contract
inconsistency that should be explicit.

### 23.3 Authorization contract unification

Eliminated permission duplication between `MODULE_PERMISSION_MAP` and
hardcoded `<PermissionGuard>` permissions in `App.tsx`:

- All dashboard routes now use `MODULE_PERMISSION_MAP` as the single source of truth
- Fixed divergent permissions:
  - `servicos`: was `''` → `service_orders.read`
  - `estoque`: was `stock_movements.read` → `stock.read`
  - `fiscal`: was `fiscal.dashboard.read` → `fiscal.read`
  - `contabilidade`: was `accounting.dashboard.read` → `accounting.read`
  - `financeiro`: was `finance.dashboard.read` → `finance.read`
  - `relatorios`: was `domain_events.read` → `reports.read`
  - `suporte`: unchanged `support_tickets.read` (was correct)
- Added `notificacoes: ''` to MODULE_PERMISSION_MAP

### 23.4 Validation

- `tsc --no-emit` ✅
- ESLint ✅
- All 549 tests passed ✅
- `npm run build` ✅
