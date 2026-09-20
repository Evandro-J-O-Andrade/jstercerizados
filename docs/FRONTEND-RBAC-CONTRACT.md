# FRONTEND-RBAC-CONTRACT

> Status: DRAFT — READ-ONLY
> Baseline: DATABASE-BASELINE-JS-EMPREGOS-V2.md
> Build Spec: DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md
> Regra: nenhuma alteração no Supabase, migrations, RLS, RBAC, frontend ou dados até aprovação formal.

---

## 1. Objetivo

Definir o contrato entre autenticação, autorização, rotas e domínios do frontend, garantindo que o frontend não reintroduza roles legadas nem confunda autorização com identidade de negócio.

---

## 2. Princípios

### 2.1 Role = autorização

```text
ROLE
├── admin_master
├── tenant_admin
├── rh_manager
├── recruiter
├── finance_manager
├── finance
├── administrative_manager
├── administrative
├── operations_manager
├── support_manager
├── support
├── commercial_manager
├── commercial
├── stock_manager
├── stock_operator
├── content_manager
├── viewer
└── member
```

### 2.2 Domínio = identidade/contexto de negócio

```text
DOMAIN
├── candidate
├── employee
├── company_contact
├── supplier
├── partner
└── ...
```

### 2.3 Proibido no frontend

```text
❌ role = admin
❌ role = empresa
❌ role = candidato
❌ role = funcionário como autorização
❌ role = fornecedor como autorização
```

### 2.4 Separação obrigatória

```text
AUTHORIZATION
    ↓
role / permission

DOMAIN CONTEXT
    ↓
candidate / employee / company_contact / supplier
```

---

## 3. Fluxo canônico

```text
Browser
  ↓
supabase.auth.signInWithPassword()
  ↓
session
  ↓
AuthContext
  ↓
people
  ↓
tenant_memberships
  ↓
role_assignments
  ↓
roles / permissions
  ↓
ProtectedRoute
  ↓
App routes
```

### 3.1 AuthContext

Deve expor:

```text
person
tenant_id
memberships
roles
permissions
is_admin_master
tenant_access
```

Não deve:
- usar `profiles`
- usar RPC fantasma
- usar `tenant_membership_id` em `role_assignments`
- usar `actor_person_id`

### 3.2 ProtectedRoute

Deve validar:

```text
autenticação
  ↓
tenant access
  ↓
role
  ↓
permission
  ↓
route/page
```

Não deve:
- aceitar `admin`, `empresa`, `candidato` como roles válidas
- criar fallback para role inexistente

### 3.3 App routes

Rotas administrativas devem usar apenas roles canônicas:

```text
allowedRoles={['admin_master']}
allowedRoles={['tenant_admin']}
allowedRoles={['rh_manager', 'recruiter']}
allowedRoles={['finance_manager', 'finance']}
allowedRoles={['support_manager', 'support']}
allowedRoles={['stock_manager', 'stock_operator']}
allowedRoles={['commercial_manager', 'commercial']}
allowedRoles={['administrative_manager', 'administrative']}
allowedRoles={['member']}
```

---

## 4. Contexto de domínio no frontend

Áreas funcionais podem existir, mas não como roles:

```text
/candidatos
/empresas
/vagas
/funcionarios
/estoque
/financeiro
/fiscal
/administrativo
/suporte
/chat
```

Acesso a essas áreas deve ser controlado por:

```text
role + permission
```

e, quando necessário, por contexto de domínio:

```text
requireCandidateContext
requireCompanyContext
requireEmployeeContext
```

sem transformar o contexto em role.

---

## 5. Matriz de autorização sugerida

| Rota / Área | Roles permitidas | Observação |
|---|---|---|
| `/admin/*` | `admin_master` | acesso global |
| `/tenant/*` | `tenant_admin` | administração do tenant |
| `/rh/*` | `rh_manager`, `recruiter`, `tenant_admin` | RH e recrutamento |
| `/financeiro/*` | `finance_manager`, `finance`, `tenant_admin` | financeiro |
| `/fiscal/*` | `finance_manager`, `finance`, `tenant_admin` | fiscal |
| `/administrativo/*` | `administrative_manager`, `administrative`, `tenant_admin` | administrativo |
| `/estoque/*` | `stock_manager`, `stock_operator`, `tenant_admin` | estoque |
| `/comercial/*` | `commercial_manager`, `commercial`, `tenant_admin` | comercial |
| `/suporte/*` | `support_manager`, `support`, `tenant_admin` | suporte |
| `/gestao/*` | `tenant_admin`, `rh_manager`, `finance_manager`, `administrative_manager`, `operations_manager` | gestão |
| `/candidatos/*` | `rh_manager`, `recruiter`, `tenant_admin` | domínio: candidato |
| `/empresas/*` | `commercial_manager`, `commercial`, `tenant_admin` | domínio: empresa |
| `/funcionarios/*` | `rh_manager`, `administrative_manager`, `tenant_admin` | domínio: employee |
| `/chat/*` | `support`, `support_manager`, `tenant_admin` | chat humano |
| `/chat-ia/*` | `support`, `support_manager`, `tenant_admin` | chat IA |
| `/dashboard/*` | `member`, roles tenant-scoped` | dashboard genérico |

---

## 6. Regras de implementação

### 6.1 AuthContext

- deve carregar `people`, `tenant_memberships`, `role_assignments`, `roles`
- não deve confiar em `profiles`
- não deve usar roles legadas
- deve expor `is_admin_master` como booleano canônico
- deve expor `tenant_access` como lista de tenants ativos

### 6.2 ProtectedRoute

- deve receber `allowedRoles` como lista de roles canônicas
- deve receber `requireAdminMaster` como flag opcional
- deve receber `requireTenantAccess` como flag opcional
- não deve aceitar fallback para role inexistente
- não deve criar rota baseada em domínio como se fosse role

### 6.3 Login

- deve autenticar via `signInWithPassword()`
- não deve redirecionar por role legada
- redirecionamento deve usar:

```text
is_admin_master → /admin
tenant_admin → /tenant
rh_manager / recruiter → /rh
finance → /financeiro
support → /suporte
stock → /estoque
commercial → /comercial
administrative → /administrativo
member → /dashboard
```

### 6.4 Dashboards

- `/dashboard` genérico pode existir para `member`
- `/dashboard/candidato` e `/dashboard/empresa` devem ser removidos como rotas baseadas em role
- manter áreas funcionais como `/candidatos`, `/empresas`, `/vagas` como domínio, não como role

---

## 7. Itens proibidos no frontend

```text
❌ allowedRoles={['admin']}
❌ allowedRoles={['empresa']}
❌ allowedRoles={['candidato']}
❌ ProfileType = 'admin' | 'candidato' | 'empresa'
❌ /dashboard/candidato
❌ /dashboard/empresa
❌ fallback para role 'member' quando não existe
❌ uso de profiles como identidade
❌ uso de get_user_roles RPC
```

---

## 8. Critérios de aprovação

```text
✅ todas as rotas usam roles canônicas
✅ nenhuma role legada no frontend
✅ AuthContext não depende de RPC fantasma
✅ ProtectedRoute valida tenant + role + permission
✅ login redireciona por role canônica
✅ domínio separado de autorização
✅ dashboards legados removidos ou migrados
✅ nenhum fallback para role inexistente
```

Somente após aprovação:
```text
FRONTEND CONTRACT APPROVED
       ↓
CROSS-REVIEW
       ↓
DRY-RUN
       ↓
REBUILD
```
