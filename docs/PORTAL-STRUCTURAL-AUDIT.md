# Portal Structural Audit

**Data:** 2026-08-25  
**Escopo:** Auditoria estrutural do fluxo RBAC → navegação no frontend  
**Método:** Somente leitura estática do código e documentos  
**Status:** Sem alterações no código

---

## Resumo executivo

| Camada                               | Status | Achados críticos                                           |
| ------------------------------------ | ------ | ---------------------------------------------------------- |
| 1. Rotas                             | ⚠️     | Rotas duplicadas, allowedRoles hardcoded, rotas sem módulo |
| 2. Permissões                        | ⚠️     | Permissões inexistentes no banco, `[]` como fallback       |
| 3. Fluxo Auth→Account→ModuleRegistry | ❌     | Bugs em PortalSidebar, PortalHeader, DashboardHome         |
| 4. Contrato RBAC→navegação           | ❌     | admin_master pode estar perdendo módulos tenant            |

---

## Camada 1 — Rotas

### 1.1 Rotas do App.tsx

| Rota                             | Página                   | ModuleRegistry       | Permission Guard            | Status        |
| -------------------------------- | ------------------------ | -------------------- | --------------------------- | ------------- |
| `/dashboard`                     | `DashboardHome`          | `inicio`             | —                           | ✅            |
| `/dashboard/tenants`             | `TenantsPage`            | `tenants`            | `tenants.read`              | ✅            |
| `/dashboard/clientes`            | `ClientesPage`           | `clientes`           | `companies.read`            | ✅            |
| `/dashboard/onboarding`          | `OnboardingPage`         | `onboarding`         | `tenants.read`              | ✅            |
| `/dashboard/assinaturas`         | `AssinaturasPage`        | `assinaturas`        | `finance.read`              | ❌ GAP        |
| `/dashboard/gestao-saas`         | `GestaoSaaSPage`         | `gestao-saas`        | `domain_events.read`        | ✅            |
| `/dashboard/usuarios`            | `UsuariosPage`           | `usuarios`           | `people.read`               | ✅            |
| `/dashboard/roles-permissoes`    | `ConfiguracoesPage`      | `roles-permissoes`   | `roles.read`                | ✅            |
| `/dashboard/auditoria`           | `VisaoGeralPage`         | `auditoria`          | `audit.read`                | ✅            |
| `/dashboard/documentos`          | `DocumentosPage`         | `documentos`         | `files.read`                | ✅            |
| `/dashboard/contratos`           | `ContratosPage`          | `contratos`          | `contracts.read`            | ❌ GAP        |
| `/dashboard/termos`              | `TermosPage`             | `termos`             | `documents.read`            | ✅            |
| `/dashboard/lgpd`                | `LgpdPage`               | —                    | —                           | ⚠️ sem módulo |
| `/dashboard/seguranca`           | `SegurancaPage`          | —                    | —                           | ⚠️ sem módulo |
| `/dashboard/monitoramento`       | `MonitoramentoPage`      | —                    | —                           | ⚠️ sem módulo |
| `/dashboard/integracoes`         | `IntegracoesPage`        | `integracoes`        | `integrations.manage`       | ✅            |
| `/dashboard/fiscal`              | `FiscalPage`             | `fiscal`             | `fiscal.dashboard.read`     | ✅            |
| `/dashboard/contabilidade`       | `ContabilidadePage`      | `contabilidade`      | `accounting.dashboard.read` | ✅            |
| `/dashboard/rh`                  | `VisaoGeralPage`         | `rh`                 | `people.read`               | ✅            |
| `/dashboard/recrutamento`        | `VagasPage`              | `recrutamento`       | `jobs.read`                 | ✅            |
| `/dashboard/vagas`               | `VagasPage`              | `recrutamento`       | `jobs.read`                 | ✅            |
| `/dashboard/candidatos`          | `CandidatosPage`         | `recrutamento`       | `candidates.read`           | ✅            |
| `/dashboard/candidaturas`        | `CandidatosPage`         | `recrutamento`       | `applications.read`         | ✅            |
| `/dashboard/processos-seletivos` | `ProcessosSeletivosPage` | `recrutamento`       | `jobs.read`                 | ✅            |
| `/dashboard/gestao`              | `EmpresasPage`           | `gestao`             | `companies.read`            | ✅            |
| `/dashboard/estoque`             | `EstoquePage`            | `estoque`            | `stock_movements.read`      | ✅            |
| `/dashboard/servicos`            | `CatalogoPage`           | `servicos`           | `service_orders.read`       | ❌ GAP        |
| `/dashboard/suporte`             | `SuportePage`            | `suporte`            | `support_tickets.read`      | ❌ GAP        |
| `/dashboard/relatorios`          | `RelatoriosPage`         | `relatorios`         | `reports.read`              | ❌ GAP        |
| `/dashboard/ia`                  | sem página               | `ia`                 | —                           | ⚠️ sem página |
| `/dashboard/configuracoes`       | `ConfiguracoesPage`      | `configuracoes-saas` | `tenant.manage`             | ✅            |

### 1.2 Rotas duplicadas/legadas

`DashboardRouter.tsx` define rotas fixas que duplicam as rotas dinâmicas do `App.tsx`:

- `/dashboard/vagas`
- `/dashboard/candidatos`
- `/dashboard/empresas`
- `/dashboard/processos-seletivos`
- `/dashboard/servicos`
- `/dashboard/financeiro`
- `/dashboard/estoque`
- `/dashboard/suporte`
- `/dashboard/relatorios`
- `/dashboard/configuracoes`
- `/dashboard/usuarios`
- `/dashboard/clientes`
- `/dashboard/parceiros`
- `/dashboard/fornecedores`

**Impacto:** Duplicação de rotas pode causar conflitos ou comportamento indefinido.

### 1.3 ProtectedRoute com allowedRoles hardcoded

```tsx
<ProtectedRoute
  allowedRoles={[
    'admin_master',
    'tenant_admin',
    'operations_manager',
    'operator',
    'commercial',
    'finance',
    'finance_manager',
    'recruiter',
    'rh_manager',
    'stock_manager',
    'security_manager',
    'facilities_manager',
    'lawyer',
    'it_admin',
    'support',
    'viewer',
  ]}
>
```

**Problema:** Se nova role for criada no banco, não entra aqui. Deveria ser dinâmico via `AccountContext` ou `AuthContext`.

---

## Camada 2 — Permissões

### 2.1 Permissões no ModuleRegistry que não existem no banco

| Permission usada no frontend | Existe no banco? | Impacto                                                                                                                      |
| ---------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `finance.read`               | ❌               | `assinaturas`, `financeiro/conciliacao`, `financeiro/bancos`, `financeiro/centro-custos`, `gestao-saas/mrr` ficam bloqueadas |
| `reports.read`               | ❌               | `relatorios`, `rh/relatorios-rh`, `gestao/relatorios` ficam bloqueadas                                                       |
| `service_orders.read`        | ❌               | `servicos/catalogo`, `servicos/ordens` ficam bloqueados                                                                      |
| `support_tickets.read`       | ❌               | `suporte/chamados`, `suporte/faq`, `suporte/feedback`, `suporte/solicitacoes`, `servicos/chamados` ficam bloqueados          |
| `contracts.read`             | ❌               | `contratos` fica bloqueado                                                                                                   |
| `domain_events.read`         | ✅               | OK                                                                                                                           |
| `integrations.manage`        | ✅               | OK                                                                                                                           |
| `tenant.manage`              | ✅               | OK                                                                                                                           |
| `audit.read`                 | ✅               | OK                                                                                                                           |
| `security_events.read`       | ✅               | OK                                                                                                                           |
| `files.read`                 | ✅               | OK                                                                                                                           |
| `people.read`                | ✅               | OK                                                                                                                           |
| `companies.read`             | ✅               | OK                                                                                                                           |
| `jobs.read`                  | ✅               | OK                                                                                                                           |
| `candidates.read`            | ✅               | OK                                                                                                                           |
| `applications.read`          | ✅               | OK                                                                                                                           |
| `finance.dashboard.read`     | ✅               | OK                                                                                                                           |
| `fiscal.dashboard.read`      | ✅               | OK                                                                                                                           |
| `accounting.dashboard.read`  | ✅               | OK                                                                                                                           |

### 2.2 Permissões usadas em actions que não existem no banco

| Permission usada             | Existe no banco? | Impacto |
| ---------------------------- | ---------------- | ------- |
| `finance.reports.export`     | ✅               | OK      |
| `finance.collections.manage` | ✅               | OK      |
| `jobs.archive`               | ✅               | OK      |
| `jobs.publish`               | ✅               | OK      |
| `jobs.export`                | ✅               | OK      |
| `candidates.export`          | ✅               | OK      |
| `applications.approve`       | ✅               | OK      |
| `applications.interview`     | ✅               | OK      |
| `applications.reject`        | ✅               | OK      |
| `talent_pool.match`          | ✅               | OK      |
| `recruitment.close`          | ✅               | OK      |

### 2.3 getAvailableModules e getAvailableFeatures com []

**Problema crítico:** Em vários lugares, `getAvailableModules([], scope)` é chamado com array vazio, o que significa "sem permissões". Dependendo da implementação, isso pode mostrar tudo ou nada.

Locais com `[]`:

- `PortalSidebar.tsx:284` — `getAvailableFeatures([], module, scope)`
- `DashboardHome.tsx:177` — `getAvailableModules([], scope)`

**Impacto:** Sidebar e Dashboard podem não refletir as permissões reais do usuário.

---

## Camada 3 — Fluxo Auth → Account → ModuleRegistry

### 3.1 AuthContext

**Pontos positivos:**

- Carrega RBAC real: `role_assignments` → `roles` → `role_permissions` → `permissions`
- Normaliza permissões como `resource.action`
- `hasPermission(permissionKey)` compara corretamente
- `isAdminMaster` é derivado de `roles`, não hardcoded

**Problemas:**

- `resolvePostLoginDestination` usa `isAdminMaster` como bypass para retornar `/dashboard`
- Fallback para `role_resource_permissions` pode mascarar permissões faltando

### 3.2 AccountContext

**Pontos positivos:**

- `identity` derivado de `person.full_name`
- `availableModules` = `getAvailableModules(permissions, scope)`
- `modulesByCategory` = `groupModulesByCategory(availableModules)`

**Problemas:**

- `tenantName` vem de `localStorage` (`tenant_cache`), não do banco
- `availableFeatures` usa `availableModules` já filtrado, mas `PortalSidebar` ignora e chama `getAvailableFeatures([], ...)`

### 3.3 PortalSidebar

```tsx
const features = getAvailableFeatures([], module, scope);
```

**Problema:** Passa `[]` como permissões, ignorando completamente as permissões reais do usuário. Features sempre serão filtradas como "nenhuma permissão".

### 3.4 PortalHeader

```tsx
const { activeTenantId, availableMemberships, switchAccount, activeRole } =
  useAccount();
```

**Problema:** `activeRole` não existe em `AccountContext`. Isso causa erro em runtime.

```tsx
const contextLabel =
  activeRole?.scope === 'system' ? 'Painel Administrativo' : 'Área do Usuário';
```

### 3.5 DashboardHome

```tsx
const availableModuleIds = useMemo(
  () => getAvailableModules([], scope).map((m) => m.id),
  [scope],
);
```

**Problema:** Usa `[]` como permissões, ignorando permissões reais.

---

## Camada 4 — Contrato RBAC → Navegação

### 4.1 admin_master perde módulos tenant

```tsx
const scope = identity.roleScope === 'system' ? 'platform' : 'tenant';
const availableModules = getAvailableModules(permissions, scope);
```

Se `admin_master` tem `scope: 'system'`, ele recebe `scope: 'platform'` e vê apenas módulos platform.

Mas `admin_master` tem 96 permissões que incluem permissões tenant (ex: `jobs.read`, `candidates.read`).

**Resultado:** `admin_master` não vê módulos tenant como `recrutamento`, `financeiro`, `rh`, etc.

Isso é um **bug crítico de escopo**.

### 4.2 tenant_admin com 162 permissões

Precisamos investigar:

- Tem permissões de plataforma? Se sim, por quê?
- Tem permissões duplicadas?
- Tem permissões que não deveriam estar vinculadas a tenant_admin?

### 4.3 Módulos sem permissão mínima

| Módulo        | requiredPermissions    | Existe no banco?                               |
| ------------- | ---------------------- | ---------------------------------------------- |
| `contratos`   | `contracts.read`       | ❌                                             |
| `servicos`    | `service_orders.read`  | ❌                                             |
| `suporte`     | `support_tickets.read` | ❌                                             |
| `relatorios`  | `reports.read`         | ❌                                             |
| `assinaturas` | `finance.read`         | ❌                                             |
| `ia`          | `[]`                   | ✅ (mas actions usam permissions inexistentes) |

**Impacto:** Esses módulos nunca aparecerão para qualquer usuário, mesmo que ele tenha as permissões reais.

---

## Conclusão

### O que está quebrado

1. **admin_master scope bug:** perde módulos tenant porque scope é forçado para 'platform'
2. **PortalSidebar:** `getAvailableFeatures([], ...)` ignora permissões reais
3. **PortalHeader:** `activeRole` não existe em `AccountContext`
4. **DashboardHome:** `getAvailableModules([], ...)` ignora permissões reais
5. **Permissões inexistentes no banco:** `finance.read`, `reports.read`, `service_orders.read`, `support_tickets.read`, `contracts.read`
6. **Rotas duplicadas:** `DashboardRouter.tsx` vs `App.tsx`
7. **ProtectedRoute allowedRoles hardcoded:** não reflete RBAC real

### O que precisa ser corrigido antes de testar

1. **Scope de admin_master:** permitir que admin_master veja módulos platform + tenant
2. **PortalSidebar:** usar `permissions` reais de `AccountContext` ou `AuthContext`
3. **PortalHeader:** remover `activeRole` ou adicionar em `AccountContext`
4. **DashboardHome:** usar `availableModules` de `AccountContext` ao invés de `getAvailableModules([], ...)`
5. **Criar permissões faltantes** OU ajustar `MODULE_PERMISSION_MAP` para usar permissões existentes
6. **Remover rotas duplicadas** de `DashboardRouter.tsx`
7. **Tornar `allowedRoles` dinâmico** via RBAC

### Validação esperada após correção

Para `admin_master` (96 permissões):

- Sidebar: todos os módulos platform + tenant que ele tem permissão
- Dashboard: Gestão Analítica + "Acessar meus módulos" com módulos reais
- Rotas: todas as rotas protegidas acessíveis conforme permissão

Para `tenant_admin` (162 permissões):

- Sidebar: módulos tenant conforme permissão
- Dashboard: Gestão Analítica + "Acessar meus módulos"
- Rotas: rotas tenant acessíveis

Para `finance_manager` (41 permissões):

- Sidebar: apenas Financeiro + módulos permitidos
- Dashboard: indicadores financeiros
- Rotas: apenas rotas financeiras

---

## Próximo passo

Corrigir os 7 itens quebrados **antes** de qualquer teste funcional.
