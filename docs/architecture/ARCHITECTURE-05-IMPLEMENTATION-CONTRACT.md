# Implementation Contract — Module Cell System

> **Baseado em:** ARCHITECTURE-03-SAAS-SPINE.md + ARCHITECTURE-04-RECONCILIATION.md
> **Supabase:** `okxqfyoqbhcmflpurfrw` — 221 tabelas, 221/221 RLS
> **Site público:** PROTEGIDO — não alterar

## Ordem de Execução (imutável)

```text
FASE 00 ✅  Checkpoint Git local (bb02e33 → 102f3ef)
FASE 01 ✅  Reconciliação DB ↔ Frontend (ARCHITECTURE-04)
FASE 02 ✅  Platform Spine (src/platform/*)
FASE 03 ✅  Auth + Identity + Tenant + Context (src/contexts/*)
FASE 04    Account Switcher + revalidação
FASE 05    Permission Contract (MODULE_PERMISSION_MAP)
FASE 06    Portal global dinâmico
FASE 07    Module Cell contract (index.ts barrel)
FASE 08 →  RH cell completion
FASE 09 →  Serviços cell completion
FASE 10 →  Estoque cell completion
FASE 11 →  Fiscal cell completion
FASE 12 →  Financeiro cell completion
FASE 13 →  Suporte cell completion
FASE 14 →  Operações cell completion
FASE 15 →  Empresas/Comercial cell completion
FASE 16 →  POS cell completion
FASE 17 →  Plataforma transversal (comunicação, calendário, arquivos, eventos)
FASE 18 →  Dashboard Engine (dashboard_widgets, dashboard_layouts)
FASE 19 →  CRUD/Form Engine
FASE 20 →  IDOR E2E test
FASE 21 →  Security hardening (34 SD functions)
FASE 22 →  Reconciliação final
FASE 23 →  Migrations (somente com autorização)
FASE 24 →  Produção (somente com autorização)
```

## Module Cell Contract

**Cada módulo obrigatoriamente seguirá:**

```text
src/modules/<module>/
├── index.ts              # barrel export: metainfo, routes, permissions
├── types/
│   └── index.ts          # re-export domain types + ModuleMeta
├── routes/
│   └── index.ts          # ModuleRoute[] — lazy imports ONLY
├── permissions/
│   └── index.ts          # <MODULE>_PERMISSIONS constant
├── dashboard/
│   ├── index.tsx         # DashboardPage re-export
│   └── widgets/          # opcional
├── sidebar/
│   └── index.tsx         # ModuleSidebar — filtra por permissão
├── services/
│   └── index.ts          # business logic
├── repositories/
│   └── index.ts          # re-export repository (NEVER new client code)
├── pages/                # re-exports from src/pages/dashboard/* DURANTE migração
├── components/           # module-specific components
├── forms/                # Zod + react-hook-form
├── crud/                 # module CRUD bindings
├── hooks/                # module hooks
└── assets/               # opcional
```

### Regras de isolamento

1. **Module não importa de outros modules** (exceto `shared/`, `platform/`)
2. **Module pode referenciar `src/pages/dashboard/*` durante transição** (façade)
3. **Module não pode recriar repository** — deve re-exportar
4. **Module não pode redefinir permissões** — deve usar strings reais do banco

## ModuleRoute Contract

```typescript
interface ModuleRoute {
  path: string; // relativo ao módulo (não começa com /dashboard)
  label: string; // texto para sidebar
  icon?: string; // lucide icon name
  element: ComponentType; // lazy-loaded page
  requiredPermissions: string[]; // do banco (resource.action)
  children?: ModuleRoute[];
  implementationStatus?:
    'implemented' | 'coming_soon' | 'beta' | 'disabled' | 'deprecated';
}
```

## Permission Contract

- Fonte única: `MODULE_PERMISSION_MAP` em `ModuleRegistry.ts`
- Módulo-specific: `<MODULE>_PERMISSIONS` em `permissions/index.ts`
- Formato: `resource.action` (ex: `service_orders.read`)
- Nenhuma string literal em App.tsx para rotas de módulo

## IDOR Contract

Cada repository query deve:

1. Filter por `tenant_id` (contexto atual)
2. Filter por `person_id` onde aplicável (owner)
3. Confiar em RLS como última barreira

## Frontend inventory (read-only)

### Contextos existentes (Phase 03 concluída)

| Arquivo                           | Responsabilidade                                     |
| --------------------------------- | ---------------------------------------------------- |
| `src/contexts/AuthContext.tsx`    | Auth, user, person, roles, permissions, switchTenant |
| `src/contexts/AccountContext.tsx` | Consolida identidade, modules, features, scopes      |
| `src/contexts/ModuleContext.tsx`  | Detecta módulo da URL                                |
| `src/contexts/UserIdentity.ts`    | Derivador de identidade                              |
| `src/contexts/IntroContext.tsx`   | Intro cinematográfico                                |

### Platform Spine (Phase 02 concluída)

| Arquivo                                | Responsabilidade                         |
| -------------------------------------- | ---------------------------------------- |
| `src/platform/index.ts`                | Barrel export                            |
| `src/platform/modules/index.ts`        | Re-export ModuleRegistry                 |
| `src/platform/permissions/index.ts`    | PermissionGuard, usePermissionCheck      |
| `src/platform/context/index.ts`        | Re-export AccountProvider/ModuleProvider |
| `src/platform/router/ModuleRouter.tsx` | Dynamic router                           |
| `src/platform/router/types.ts`         | ModuleRoute interface                    |
| `src/platform/router/module-routes.ts` | Registry de todas as rotas               |

### Module cells ativas (até 2026-10-02)

| Module     | Routes |  Cell   | Dashboard | Sidebar | Permissions |
| :--------- | :----: | :-----: | :-------: | :-----: | :---------: |
| rh         |   20   | parcial |    ✅     |   ✅    |     ✅      |
| servicos   |   8    |   ✅    |    ✅     |   ✅    |     ✅      |
| estoque    |   8    |   ✅    |    ✅     |   ✅    |     ✅      |
| fiscal     |   6    |   ✅    |    ✅     |   ✅    |     ✅      |
| suporte    |   5    |   ✅    |    ✅     |   ✅    |     ✅      |
| financeiro |   7    |   ✅    |    ✅     |   ✅    |     ✅      |
| operacoes  |   7    |   ✅    |    ✅     |   ✅    |     ✅      |
| empresas   |   8    |   ✅    |    ✅     |   ✅    |     ✅      |
| pos        |   6    |   ✅    |    ✅     |   ✅    |     ✅      |

### Repositories existentes (não duplicar)

```text
candidates.repository.ts
candidate-*.repository.ts (8 arquivos)
companies.repository.ts
jobs.repository.ts
applications.repository.ts
services.repository.ts
stock.repository.ts
suppliers.repository.ts
fiscal.repository.ts
finance.repository.ts
accounts-payable.repository.ts
accounts-receivable.repository.ts
financial-*.repository.ts (4 arquivos)
invoice.repository.ts
payment.repository.ts
receipt.repository.ts
support.repository.ts
role.repository.ts
tenant.repository.ts
users.repository.ts
permission.repository.ts
audit.repository.ts
notification.repository.ts
```

### Páginas de dashboard existentes (mapear → module routes)

```text
DashboardRh.tsx          → rh
Servicos.tsx             → servicos
Estoque.tsx              → estoque
FiscalPage.tsx           → fiscal
Suporte.tsx              → suporte
FinanceiroPage.tsx       → financeiro
FaturamentoPage.tsx      → financeiro / pos
GestaoPage.tsx           → operacoes
Empresas.tsx             → empresas
ClientesPage.tsx         → empresas
ContratosPage.tsx        → empresas
Fornecedores.tsx         → estoque
Almoxarifado.tsx         → estoque
ContasReceberPage.tsx    → financeiro
FluxoDeCaixaPage.tsx     → financeiro
ContabilidadePage.tsx    → financeiro
Candidatos.tsx           → rh
Funcionarios.tsx         → rh
FuncionarioDetalhe.tsx   → rh
Vagas.tsx                → rh
```

## Validação por fase

```text
Cada fase deve passar em:
1. tsc —no-emit
2. eslint --max-warnings=0 (escopo: arquivos modificados)
3. vitest (testes existentes não quebrem)
4. npm run build
5. Commit com SHA registrado
```
