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
- `src/components/portal/ModuleRegistry.tsx`
- `src/components/portal/AccountContext.tsx`
- `src/App.tsx`

## 10. Rotas dinâmicas

Rotas do dashboard devem ser geradas dinamicamente a partir de `PORTAL_MODULES` + `MODULE_PAGE_MAP` + `MODULE_PERMISSION_MAP`.

Nenhuma rota do dashboard deve ser hardcoded no `App.tsx` exceto o catch-all.

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
