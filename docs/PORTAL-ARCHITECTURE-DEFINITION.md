# Architecture Definition — Three-Tier Portal

> **Status**: Definição arquitetural (Fase B)  
> **Database Master Map**: docs/DATABASE-MASTER-MAP.md (completado 2026-09-30)  
> **Empresa**: J&S Empregos LTDA  
> **Baseado em**: App.tsx, PortalShell.tsx, PortalSidebar.tsx, ModuleSidebar.tsx, ModuleWorkspace.tsx, ModuleDashboardPage.tsx, ModuleContext.tsx, ModuleRegistry.ts

---

## 1. Objetivo

Definir formalmente a arquitetura de três níveis do portal autenticado, resolvendo o conflito atual entre `PortalSidebar` e `ModuleSidebar`, antes de qualquer alteração de código.

---

## 2. Three-Tier Portal Structure

```text
┌─────────────────────────────────────────────────────────┐
│                    PORTAL (Tier 0)                       │
│  PortalShell (AccountProvider + ModuleProvider)          │
│  PortalHeader (fixo, topo)                               │
│  PortalFooter (© J&S Empregos LTDA + New Wave)           │
└─────────────────────────────────────────────────────────┘

        ┌─────────────────────────────────────────────┐
        │          PORTAL DE ENTRADA (Tier 1)         │
        │  /dashboard → DashboardHome (MetroTiles)     │
        │  → Launcher: seleciona módulo                │
        └─────────────────────────────────────────────┘
                         ↓ clique em módulo
        ┌─────────────────────────────────────────────┐
        │    DASHBOARD DE GESTÃO (Tier 2)             │
        │  Category group: analytics, KPIs             │
        │  e.g. "Suporte" container → all support data   │
        │  Visão geral do módulo                         │
        └─────────────────────────────────────────────┘
                         ↓ clique em feature
        ┌─────────────────────────────────────────────┐
        │  DASHBOARD OPERACIONAL (Tier 3)             │
        │  ModuleSidebar: feature navigation           │
        │  CRUD actions, forms, tables                 │
        └─────────────────────────────────────────────┘
```

### Tier Definitions

| Tier   | Nível       | Nome                  | Component                      | Rota                            | Responsabilidade                                            |
| ------ | ----------- | --------------------- | ------------------------------ | ------------------------------- | ----------------------------------------------------------- |
| Tier 0 | Shell       | Portal                | `PortalShell`                  | (wrapper)                       | Layout global fixo: header, footer, overflow-y-auto no body |
| Tier 1 | Launcher    | Portal de Entrada     | `DashboardHome` + `MetroTiles` | `/dashboard`                    | Metro launcher: grid de módulos disponíveis com stats       |
| Tier 2 | Hub         | Dashboard de Gestão   | `ModuleDashboardPage`          | `/dashboard/{module}`           | Visão geral do módulo: features list, analytics             |
| Tier 3 | Operational | Dashboard Operacional | `ModuleSidebar` + `Outlet`     | `/dashboard/{module}/{feature}` | Navegação contextual: CRUD, forms, tables                   |

---

## 3. Sidebar Responsibility Matrix

### PortalSidebar (Tier 1 — Global Navigation)

**Responsabilidade**: Navegação entre módulos e entre tenant accounts. Sempre visível no desktop, hamburger no mobile.

| Context                                       | PortalSidebar shows                            |
| --------------------------------------------- | ---------------------------------------------- |
| `/dashboard` (launcher)                       | "Voltar para o site" link only                 |
| `/dashboard/{module}` (module hub)            | "← Início do sistema" + module's features list |
| `/dashboard/{module}/{feature}` (operational) | Same as module hub — contextual feature nav    |

**Key behavior**: Uses `ModuleContext` to determine `currentModule`/`currentFeature` and renders appropriate nav items via `getAvailableFeatures()` / `getAvailableModuleFeatures()`.

**Classification**: **KEEP** — no changes needed to PortalSidebar itself.

### ModuleSidebar (Tier 3 — Contextual Operations Menu)

**Responsabilidade**: Ações CRUD e detalhes operacionais dentro de um módulo/feature específico.

| Context                  | ModuleSidebar shows                                                        |
| ------------------------ | -------------------------------------------------------------------------- |
| `isOnDefaultRoute=true`  | NÃO renderiza (ModuleDashboardPage shows feature cards instead)            |
| `isOnDefaultRoute=false` | Features list + CRUD actions + Permissions + Users/Roles + Settings (stub) |

**Problem 1 (current)**: `ModuleWorkspace` renders `ModuleSidebar` internally (line 77-79) when `module` + `permissions` are passed. `ModuleDashboardPage` ALSO renders `ModuleSidebar` explicitly (line 55-59). **Double sidebar.**

**Problem 2 (SUPERADO)**: `ModuleSidebar` chegou a ter seções hardcoded "Usuários & Roles" e "Configurações do Módulo" com handlers `console.log`. **Esse código não existe mais**: o componente foi restaurado ao estado do `HEAD` (commit-base), que contém apenas a lista de features com `NavLink` + `isActive` via `useLocation`. A descrição abaixo descreve um estado que **não está mais no código**.

> Verificação: `src/components/portal/ModuleSidebar.tsx` (65 linhas) não contém `console.log`, nem "Usuários & Roles", nem "Configurações do Módulo".

**Resolution**:

- **ModuleWorkspace**: remover renderização interna de `ModuleSidebar`. Workspace becomes pure layout (breadcrumb + header + content grid).
- **ModuleDashboardPage**: mantém renderização explícita de `ModuleSidebar` na posição correta (coluna lateral esquerda dentro do workspace).
- **ModuleSidebar stub sections**: marcar como `CONNECT` — precisam de routes reais para `/dashboard/{module}/usuarios`, `/dashboard/{module}/configuracoes`, etc. até lá, manter como `EmptyState`/coming-soon.

---

## 4. Layout Composition (After Fix)

```text
AppShell (App.tsx:205-233 wrapper)
  → PortalShell
    → PortalSidebar  (global, fixed, Tier 1 navigation)
    → PortalHeader   (global, fixed, top)
    → main (overflow-y-auto)
        → AppShell inner padding
        → Outlet
            → DashboardHome (MetroTiles)  [Tier 1]
            OU
            → ModuleDashboardPage  [Tier 2 → Tier 3]
                → ModuleWorkspace  (breadcrumb + header only, NO internal ModuleSidebar)
                    → ModuleSidebar  (contextual, Tier 3)  ← rendered explicitly by ModuleDashboardPage
                    → div.flex-1 (content area)
                        → Outlet  (nested routes → feature pages or EmptyState)
```

### ModuleWorkspace Fix

**ANTES** (`ModuleWorkspace.tsx:76-79`):

```tsx
<div className="flex min-h-0 flex-1 gap-6">
  {module && permissions.length > 0 && (
    <ModuleSidebar module={module} permissions={permissions} /> // ← PROBLEM: double render
  )}
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    {children} // ← ModuleDashboardPage also passes ModuleSidebar as child
  </div>
</div>
```

**DEPOIS**:

```tsx
<div className="flex min-h-0 flex-1 gap-6">
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    {children} // ← Caller controls sidebar rendering
  </div>
</div>
```

Remove the `module` and `permissions` props from `ModuleWorkspace` — it becomes a pure presentational layout component.

### ModuleDashboardPage Fix

```tsx
<ModuleWorkspace
  title={module.title}
  description={module.description}
  icon={LayoutDashboard}
  breadcrumbItems={[{ label: module.title }]}
  // REMOVER: module={module} permissions={activePermissions}
>
  {!isOnDefaultRoute && (
    <ModuleSidebar module={module} permissions={activePermissions} />
  )}
  <div className="flex-1 min-w-0">
    {!isOnDefaultRoute ? <Outlet /> : /* feature cards */ }
  </div>
</ModuleWorkspace>
```

---

## 5. Three-Tier Module Hub Pattern

The user described: "Suporte" container → context of all support data → click → mini-CRUD dashboard with its own sidebar.

This maps to the architecture:

```
Tier 1: /dashboard                        → MetroTiles (all modules)
Tier 2: /dashboard/suporte                → ModuleDashboardPage (feature cards)
Tier 3: /dashboard/suporte/chamados       → ModuleSidebar + FeaturePage (CRUD table)
Tier 3: /dashboard/suporte/chamados/:id    → ModuleSidebar + FeatureDetailPage
Tier 3: /dashboard/suporte/faq            → ModuleSidebar + FAQPage
```

**Container pattern**: Each module hub (Tier 2) groups features by category. Example: "Suporte" module contains `chamados`, `faq`, `feedback`, `solicitacoes` — all with `support_tickets.read` permission.

This is **already supported** by `PORTAL_MODULES` structure (nested features in `ModuleRegistry.ts`).

---

## 6. What NOT to change

| Component/File                                          | Reason                                                                                                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PortalShell.tsx`                                       | ✅ Footer text exact, h-dvh, AccountProvider/ModuleProvider — PROTECTED                                                                                                  |
| `PortalHeader.tsx`                                      | ✅ Already refined, AccountSwitcherModal extracted — KEEP                                                                                                                |
| `PortalFooter.tsx`                                      | ✅ Footer exact text — PROTECTED                                                                                                                                         |
| `PortalSidebar.tsx`                                     | ⚠️ **Bug conhecido**: `:266` usa `fixed top-0 left-0 z-40 h-full transform` **sem `lg:`**, causando transbordo horizontal no desktop. **Não corrigir neste checkpoint.** | **MANTER COM RESSALVA**   |
| `MetroTiles.tsx`                                        | ✅ Virtualization implemented, real stats — KEEP                                                                                                                         |
| `ModuleRegistry.ts`                                     | ⚠️ **2479 linhas** (não 221) — ver §11. Registro correto; concentration é GAP aberto, não corrigir aqui                                                                  | **MANTER** — com ressalva |
| `ModuleContext.tsx`                                     | ✅ Provides currentModule/currentFeature — KEEP                                                                                                                          |
| `main.tsx:9-27`                                         | ✅ Global providers — DO NOT MODIFY                                                                                                                                      |
| Public site (`src/pages/`, `src/components/Footer.tsx`) | ✅ Out of scope — IGNORED                                                                                                                                                |
| Footer text "© J&S Empregos LTDA"                       | ✅ Company name MUST NEVER change                                                                                                                                        |

---

## 7. Module × Tier Mapping

| Module ID            | Tier 2 Route                         | Dashboard Page             | Tier 3 Features (examples)                                                                                                                         |
| -------------------- | ------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inicio`             | `/dashboard`                         | `DashboardHome`            | N/A (launcher)                                                                                                                                     |
| `admin-master`       | `/dashboard/global`                  | `GlobalDashboardPage`      | Global KPIs                                                                                                                                        |
| `gestao-saas`        | `/dashboard/gestao-saas`             | `GestaoSaaSPage`           | `/dashboard/gestao-saas/mrr`, `/dashboard/gestao-saas/uso`, `/dashboard/gestao-saas/crescimento`                                                   |
| `analitico`          | `/dashboard/analitico`               | `VisaoGeral`               | Analytics views                                                                                                                                    |
| `tenants`            | `/dashboard/tenants`                 | `TenantsPage`              | Listar, Configurações                                                                                                                              |
| `usuarios`           | `/dashboard/usuarios`                | `UsuariosPage`             | Listar, Convidar                                                                                                                                   |
| `roles-permissoes`   | `/dashboard/roles-permissoes`        | `RolesPermissoesPage`      | Listar, Permissões                                                                                                                                 |
| `auditoria`          | `/dashboard/auditoria`               | `AuditoriaPage`            | Logs, Eventos, RBAC                                                                                                                                |
| `contratos`          | `/dashboard/contratos`               | `ContratosPage`            | Listar, Modelos                                                                                                                                    |
| `rh`                 | `/dashboard/rh`                      | (uses ModuleDashboardPage) | Dashboard RH, Funcionários, Experiências, Formação, Cursos, Idiomas, Habilidades, Documentos                                                       |
| `recrutamento`       | `/dashboard/recrutamento`            | (uses ModuleDashboardPage) | Vagas, Candidatos, Habilidades, Formação, Experiências, Idiomas, Documentos, Preferências, Visualizações, Matches, Candidaturas, Processos, Etapas |
| `crm`                | `/dashboard/crm`                     | `ClientesPage`             | Dashboard CRM, Leads, Prospects, Empresas, Pipeline, Clientes ativos, Relacionamentos, Indicadores, Equipes, Contratos, Serviços                   |
| `financeiro`         | `/dashboard/financeiro`              | `FinanceiroPage`           | Contas a pagar, Contas a receber, Fluxo de caixa, Bancos, Centro de custos                                                                         |
| `faturamento`        | `/dashboard/faturamento`             | `FaturamentoPage`          | Dashboard, Faturas, Vendas, Orçamentos                                                                                                             |
| `fiscal`             | `/dashboard/fiscal`                  | `FiscalPage`               | Notas fiscais, Notas recebidas, Retenções, Relatórios                                                                                              |
| `contabilidade`      | `/dashboard/contabilidade`           | `ContabilidadePage`        | Plano de contas, Lançamentos, Balancetes, Fechamento, Relatórios                                                                                   |
| `estoque`            | `/dashboard/estoque`                 | `Estoque`                  | Produtos, Movimentações                                                                                                                            |
| `almoxarifado`       | `/dashboard/almoxarifado`            | `Almoxarifado`             | Dashboard, Entradas, Saídas, Devoluções, Custódia, EPI                                                                                             |
| `servicos`           | `/dashboard/servicos`                | `Servicos`                 | Catálogo, Ordens de serviço                                                                                                                        |
| `suporte`            | `/dashboard/suporte`                 | `Suporte`                  | Chamados, FAQ, Feedback, Solicitações                                                                                                              |
| `relatorios`         | `/dashboard/relatorios`              | `RelatoriosPage`           | Relatório Geral                                                                                                                                    |
| `ia`                 | `/dashboard/ia`                      | `IaPage`                   | Assistente, Automações, Conversas, Integrações                                                                                                     |
| `integracoes`        | `/dashboard/integracoes`             | `IntegracoesPage`          | Supabase, n8n, WhatsApp, E-mail                                                                                                                    |
| `configuracoes-saas` | `/dashboard/configuracoes`           | `ConfiguracoesPage`        | Geral, Módulos                                                                                                                                     |
| `seguranca-conta`    | `/dashboard/configuracoes/seguranca` | `SegurancaPage`            | Senha, Sessões                                                                                                                                     |
| `preferencias`       | `/dashboard/notificacoes`            | `NotificationsPage`        | Notificações                                                                                                                                       |
| `minha-conta`        | `/dashboard/configuracoes/conta`     | (module hub)               | Perfil                                                                                                                                             |

---

## 8. Implementation Plan for Portal Recovery (Fase C)

### Step 1: Fix ModuleWorkspace double sidebar — ✅ IMPLEMENTADO E VALIDADO

1. ~~Remove `module` and `permissions` props from `ModuleWorkspace`~~ — **feito**
2. ~~Remove internal `ModuleSidebar` rendering from `ModuleWorkspace`~~ — **feito**
3. **Impact**: Only affects internal layout — ModuleDashboardPage already passes ModuleSidebar as child

Executado no checkpoint 02A.1. `ModuleWorkspace` hoje é layout puro: `cn(base, className)` + `flex flex-1 min-h-0 gap-6`, sem import de `ModuleSidebar`. Validado com `tsc` 0 erros, ESLint 0 erros, 549 testes verdes, build OK.

### Step 2: Confirm ModuleDashboardPage handles sidebar — ✅ CONFIRMADO

1. Keep explicit `<ModuleSidebar>` render in ModuleDashboardPage
2. Guard with `!isOnDefaultRoute` so sidebar only shows on Tier 3 routes, not module hubs

### Step 3: ModuleSidebar stub sections cleanup — ⛔ OBSOLETO

1. ~~Mark "Usuários & Roles" and "Configurações do Módulo" as coming-soon/EmptyState~~
2. ~~Remove `console.log` handlers~~
3. ~~No real routes to connect yet — defer to CONNECT phase~~

**Cancelado**: as seções stub nunca foram commitadas. O componente foi restaurado ao `HEAD`, onde não existem. Nada a limpar.

### Step 4: Verify no 404 regressions

- All existing routes in App.tsx must continue to work
- ModuleDashboardPage's `path="*"` EmptyState handles unimplemented sub-routes

---

## 9. Checkpoint 24H Rules

After Portal Recovery:

1. `npm run lint` — 0 errors
2. `npm run typecheck` — 0 errors
3. `npm test` — all tests green (currently 549 passing, 0 failures)
4. `npm run build` — succeeds
5. **Diff audit**: `git diff --stat` — no changes to public site files, no footer changes
6. **Commit**: only after user explicit authorization

---

## 10. Decision Log

| #   | Decision                                                           | Rationale                                                                                                              |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| D1  | `ModuleWorkspace` becomes pure layout (no internal ModuleSidebar)  | Eliminates double-sidebar bug, caller controls sidebar                                                                 |
| D2  | `ModuleDashboardPage` controls ModuleSidebar rendering             | Centralizes sidebar logic at the route level                                                                           |
| D3  | `PortalSidebar` permanece intocado                                 | ⚠️ **Revisto no 02C.2**: existe bug de transbordo horizontal em `:266` (`fixed` sem `lg:`). Registrado, não corrigido. |
| D4  | ModuleSidebar stub sections → coming_soon                          | ⛔ **SUPERADO (02C.2)**: os stubs nunca foram commitados; componente restaurado ao `HEAD`, que não os contém.          |
| D5  | `MODULE_PAGE_MAP`/`PAGE_COMPONENTS` = dead code                    | ✅ Confirmado: removidos no D1, zero imports. `PORTAL-ARCHITECTURE-RULES.md` §10 foi reconciliada no 02C.2.            |
| D6  | `partnersRepository.ts` → DEPRECATE                                | Table `partners` doesn't exist in DB                                                                                   |
| D7  | `suppliers` table EXISTS — verify suppliersRepository              | Existing doc said non-existent, but live DB has it                                                                     |
| D8  | Mecanismo de rotas: 3 coexistem (gerado + 106 manuais + catch-all) | Registrado no 02C.2. 22 de 28 módulos têm rota duplicada. **Decisão pendente.**                                        |

---

**Documento gerado em**: 2026-09-30  
**Empresa**: J&S Empregos LTDA  
**Base**: docs/DATABASE-MASTER-MAP.md + código atual (App.tsx, PortalShell.tsx, ModuleDashboardPage.tsx)  
**Próximo checkpoint**: Após Portal Recovery (estimated 2-3 small file changes)
