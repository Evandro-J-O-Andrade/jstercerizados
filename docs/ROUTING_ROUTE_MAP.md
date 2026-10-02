# Portal Routing & Module Layout — Route Map

**Status:** ✅ CONCLUÍDO  
**Data:** 2026-09-30  
**Escopo:** Contrato de roteamento entre `App.tsx`, `ModuleRegistry.ts` e `ModuleDashboardPage.tsx`  
**Fora de escopo:** site público, Supabase, `MetroTiles`, footers

---

## 1. Arquitetura de Roteamento (D1 — Contract Decision)

**Decisão (Opção 3 — Fonte C como roteador real):** `<Route>` explícitos em `App.tsx` são a única fonte de verdade para rotas. `PORTAL_MODULES[].features` é **metadado** de navegação (sidebar, permissões, ordem). `MODULE_PAGE_MAP` e `PAGE_COMPONENTS` são código morto e podem ser removidos em uma futura fase de limpeza (P2.1-C).

```text
Fonte A — PORTAL_MODULES[].features  →  METADADOS (permissões, sidebar, ordem)
Fonte C — <Route> explícitos em App   →  ÚNICO ROTEADOR (páginas reais)
MODULE_PAGE_MAP                      →  INERTE (nunca consultado no roteamento)
PAGE_COMPONENTS                      →  INERTE (nunca consultado no roteamento)
```

---

## 2. Rotas Ativas (49 rotas /dashboard/*)

### 2.1 Rotas Explícitas (páginas reais)

| Rota                               | Componente            | Módulo            | Status                          |
| ---------------------------------- | --------------------- | ----------------- | ------------------------------- |
| `/dashboard`                       | `DashboardHome`       | `inicio`          | ✅ Start screen com Metro tiles |
| `/dashboard/global`                | `GlobalDashboardPage` | `admin-master`    | ✅ Admin master                 |
| `/dashboard/analitico`             | `VisaoGeral`          | —                 | ✅ Dashboard analítico          |
| `/dashboard/faturamento`           | `FaturamentoPage`     | `faturamento`     | ✅                              |
| `/dashboard/fiscal`                | `FiscalPage`          | `fiscal`          | ✅                              |
| `/dashboard/contabilidade`         | `ContabilidadePage`   | `contabilidade`   | ✅                              |
| `/dashboard/relatorios`            | `Relatorios`          | `relatorios`      | ✅                              |
| `/dashboard/estoque`               | `Estoque`             | `estoque`         | ✅ (launcher vence)             |
| `/dashboard/servicos`              | `Servicos`            | `servicos`        | ✅ (launcher vence)             |
| `/dashboard/almoxarifado`          | `Almoxarifado`        | `almoxarifado`    | ✅ (launcher vence)             |
| `/dashboard/suporte`               | `Suporte`             | `suporte`         | ✅ (launcher vence)             |
| `/dashboard/configuracoes/sessoes` | `SessaoPage`          | `seguranca-conta` | ✅                              |

### 2.2 Rotas via `launcherRoutes` (módulos com launcher)

Estes módulos usam `ModuleDashboardPage` como hub de cards, com `<Outlet>` para rotas aninhadas de features.

| Módulo               | Rota                       | Features | Página real?                           |
| -------------------- | -------------------------- | -------- | -------------------------------------- |
| `rh`                 | `/dashboard/rh`            | 5        | Launcher → cards navegam para features |
| `recrutamento`       | `/dashboard/recrutamento`  | 14       | Launcher → cards navegam para features |
| `crm`                | `/dashboard/crm`           | 12       | Launcher → cards navegam para features |
| `financeiro`         | `/dashboard/financeiro`    | 6        | Launcher → cards navegam para features |
| `configuracoes-saas` | `/dashboard/configuracoes` | 2        | Launcher                               |
| `preferencias`       | (sub-rota configuracoes)   | 1        | Launcher                               |
| `minha-conta`        | (sub-rota configuracoes)   | 1        | Launcher                               |

### 2.3 Rotas de Features (aninhadas dentro do launcher)

| Rota Feature                         | Componente   | Módulo         | Status         |
| ------------------------------------ | ------------ | -------------- | -------------- |
| `/dashboard/recrutamento/vagas`      | `Vagas`      | `recrutamento` | ✅ Real        |
| `/dashboard/recrutamento/candidatos` | `Candidatos` | `recrutamento` | ✅ Real        |
| `/dashboard/recrutamento/empresas`   | `Empresas`   | `recrutamento` | ✅ Real        |
| `/dashboard/recrutamento/estagios`   | `Estagios`   | `recrutamento` | ✅ Real        |
| `/dashboard/recrutamento/feedbacks`  | `Feedbacks`  | `recrutamento` | ✅ Real        |
| `/dashboard/financeiro/movimentos`   | `Financeiro` | `financeiro`   | ✅ Real (stub) |

---

## 3. Contrato de Roteamento Aninhado

### 3.1 ModuleDashboardPage.tsx

```text
<ModuleWorkspace>              → título, descrição, breadcrumb, sidebar
  <ModuleSidebar />           → navegação contextual por feature
  <div className="flex-1">    → conteúdo principal
    {isOnDefaultRoute ? (
      features.length > 1 ?   → grid de cards de features
      :                       → mensagem "acesse pelo menu lateral"
    ) : (
      <Outlet />              → rota aninhada da feature
    )}
  </div>
</ModuleWorkspace>
```

### 3.2 Catch-all de Features (App.tsx:743)

Quando uma feature não tem `<Route>` explícito, cai no `path="*"` dentro do launcher:

```tsx
<Route
  path="*"
  element={
    <div className="min-w-0 flex-1 py-8">
      <EmptyState
        title="Em breve"
        description="Esta funcionalidade está em desenvolvimento e estará disponível em breto."
        icon={Clock}
      />
    </div>
  }
/>
```

**Importante:** O `EmptyState` é renderizado inline (não como `ComingSoonPage`), evitando a dupla camada de `ModuleWorkspace` + `ModuleSidebar` que ocorria quando `ComingSoonPage` era usado como fallback.

---

## 4. Resolução de Conflitos de Rota (D1.1)

| Conflito                                                                               | Resolução                                               | Evidência                                                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `estoque` vs `almoxarifado` vs `suporte` vs `servicos` — 4 módulos concorrem por rotas | Launcher vence; `<Route>` explícitos recebem prioridade | `launcherRoutes` filtra módulos com features, mas `<Route>` explícitos são declarados antes |
| `DashboardHome` redirect candidato                                                     | `/candidato` é uma rota separada (`/candidato/*`)       | `DashboardHome.tsx:67-69`                                                                   |

---

## 5. Cadena de Autorização

```text
Permissão do usuário
  → AccountContext.availableModules      (filtra módulos por permission + scope)
  → AccountContext.availableFeatures     (filtra features por permission + scope)
  → ModuleContext.currentModule          (resolve módulo da URL)
  → ModuleSidebar.getAvailableFeatures   (filtra features do módulo na sidebar)
  → <Route> explícito renderiza Componente real
  → Permissão é verificada novamente por ProtectedRoute/PermissionGuard no componente
```

---

## 6. Próximos Passos

1. **Classificar as 64 features sem rota:** criar rota real | ComingSoon | remover card
2. **Desdobrar Configuracoes** em 3-4 páginas (admin-saas, minha-conta, preferencias, seguranca-conta)
3. **Remover MODULE_PAGE_MAP e PAGE_COMPONENTS** (código morto) — fase P2.1-C
4. **Conectar DashboardHome stats** — substituir `fetchAllModuleStats` por repositórios reais por módulo

---

## 7. Arquivos Alterados

| Arquivo                                       | Alteração                                                                                                                     |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/App.tsx`                                 | Substituído `ComingSoonPage` por inline `EmptyState` no catch-all de features; adicionado `<Outlet>` em `ModuleDashboardPage` |
| `src/pages/dashboard/ModuleDashboardPage.tsx` | Adicionado `<Outlet>` para rotas aninhadas de features; `EmptyState` importado; remoção de variáveis não usadas               |
| `src/pages/dashboard/VisaoGeral.tsx`          | Rota `/dashboard/analitico` adicionada em `App.tsx:42`                                                                        |
| `src/components/fallback/EmptyState.tsx`      | Componente existente reutilizado (não criado)                                                                                 |

**Arquivos NÃO alterados:** `PortalShell.tsx`, `PortalSidebar.tsx`, `ModuleWorkspace.tsx`, `MetroTiles.tsx`, `ModuleRegistry.ts` (exceto leitura), footers, site público, Supabase.
