# DIAGNÓSTICO RBAC — ESTADO ATUAL DO BANCO E CÓDIGO

**Data:** 2026-10-30  
**Escopo:** SaaS J&S Empregos LTDA — todos os domínios funcionais  
**Status:** Diagnóstico apenas — nenhuma alteração aplicada  
**Conformidade:** AGENTS.md (empresa J&S Empregos LTDA, footer intocado)

---

## 1. Resumo Executivo

O modelo de autorização atual está fragmentado e inconsistente. Existem três camadas de resolução de permissão que não se alinham:

1. **Frontend (`AuthContext.tsx`)**: `admin_master` recebe **todas** as permissões da tabela `permissions` via bypass explícito (linhas 353-363), independentemente do que está em `role_permissions`.
2. **Contrato de autorização (`AuthorizationContract.ts`)**: `computeEffectivePermissions()` **não** faz nenhum caso especial para `admin_master` — só retorna permissões explicitamente listadas em `role_permissions`.
3. **Banco (`user_has_permission()`)**: faz bypass global para qualquer role com `scope = 'global'`, não apenas `admin_master`.

Não há hierarquia funcional completa. Faltam os papéis `owner`, `gestor`, `recrutador_master` e `funcionario`. O `recrutador` (`recruiter`) existe mas tem 0 permissões vinculadas.

---

## 2. Tabelas de Identidade e RBAC (Supabase)

### 2.1 Modelagem atual

| Tabela                      | Colunas-chave                                                                                          | Comentário                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `public.roles`              | id, name, description, scope, status, slug, level, sector, replacement_role_id, created_at, updated_at | `scope`: 'global' \| 'tenant'. Sem coluna de hierarquia/pai.                                                             |
| `public.permissions`        | id, code, resource, action, description, created_at, updated_at                                        | Permissão = `resource.action`. Uso inconsistente de `code` vs `name`.                                                    |
| `public.role_permissions`   | role_id, permission_id, created_at                                                                     | Sem coluna `granted`. A existência da linha = grant.                                                                     |
| `public.role_assignments`   | id, role_id, person_id, tenant_id, assigned_by, expires_at, created_at, updated_at                     | `expires_at` referenciado em funções mas não existe na tabela implantada (migração 20260909000000 removeu a referência). |
| `public.tenant_memberships` | id, tenant_id, person_id, membership_role, status, joined_at, left_at, created_at, updated_at          | `membership_role` é texto livre, não FK para `roles`.                                                                    |

### 2.2 Roles confirmadas no banco (fonte: docs/V21-RBAC-MATRIX.md)

| #   | Role               | Scope  | Permissions | Status                                           |
| --- | ------------------ | ------ | ----------- | ------------------------------------------------ |
| 1   | admin_master       | global | 63          | Ativa                                            |
| 2   | tenant_admin       | tenant | 53          | Ativa (renomeada de admin_tenant na migração 47) |
| 3   | operations_manager | tenant | 33          | Ativa                                            |
| 4   | operator           | tenant | 21          | Depreciada (migração rbac03)                     |
| 5   | commercial         | tenant | 19          | Ativa                                            |
| 6   | finance            | tenant | 19          | Ativa                                            |
| 7   | viewer             | tenant | 14          | Ativa                                            |
| 8   | facilities_manager | tenant | 11          | Ativa                                            |
| 9   | it_admin           | tenant | 10          | Depreciada (migração rbac03)                     |
| 10  | stock_manager      | tenant | 9           | Ativa                                            |
| 11  | lawyer             | tenant | 8           | Ativa                                            |
| 12  | security_manager   | tenant | 5           | Ativa                                            |
| 13  | support            | tenant | 5           | Ativa                                            |
| 14  | finance_manager    | tenant | 0           | Ativa, sem permissões                            |
| 15  | recruiter          | tenant | 0           | Ativa, sem permissões                            |
| 16  | rh_manager         | tenant | 0           | Ativa, sem permissões                            |

### 2.3 Papéis AUSENTES (obrigatórios pela proposta)

| Papel             | Escopo esperado | Status                    |
| ----------------- | --------------- | ------------------------- |
| owner             | tenant          | **AUSENTE**               |
| gestor            | tenant          | **AUSENTE**               |
| recrutador_master | tenant          | **AUSENTE**               |
| funcionario       | tenant          | **AUSENTE**               |
| admin_master      | global          | Presente                  |
| tenant_admin      | tenant          | Presente (via renomeação) |
| recrutador        | tenant          | Presente (sem permissões) |
| candidato         | tenant          | Presente                  |

---

## 3. Inconsistências Críticas Identificadas

### 3.1 admin_master: sem ROOT explícito no contrato de autorização

`AuthorizationContract.computeEffectivePermissions()` (src/core/authorization/AuthorizationContract.ts:35-63) documenta explicitamente:

> "admin_master is NOT special-cased: it receives only the permissions explicitly listed in role_permissions for that role."

Isso contradiz o comportamento do `AuthContext.tsx` (linhas 353-363), que carrega **todas** as permissões do banco quando `adminMaster === true`.

Consequência: o frontend acredita que `admin_master` tem acesso total, mas o contrato de autorização usado pelas células e pelo Dispatcher Master não concede nada além do que está cadastrado em `role_permissions`. Se `admin_master` tem 113 de 247 permissões cadastradas, ele não tem autoridade ROOT efetiva no backend.

### 3.2 tenant_admin tem mais role_permissions que admin_master

Per relato do usuário:

- `admin_master`: 113 vínculos em `role_permissions`
- `tenant_admin`: 185 vínculos em `role_permissions`
- Catálogo: 247 permissões

Isso é inverso ao esperado: o ROOT global deveria ter o maior (ou completo) conjunto de permissões, e o tenant_admin deveria ter um subconjunto limitado ao tenant.

### 3.3 Duas fontes de verdade para permissões (sistema dual)

| Fonte                                           | Tabela usada                | Comportamento admin_master                               | Status                            |
| ----------------------------------------------- | --------------------------- | -------------------------------------------------------- | --------------------------------- |
| Frontend AuthContext                            | `permissions` (todas)       | Carrega TODAS as permissões da tabela `permissions`      | Ativo                             |
| AuthorizationContract                           | `role_permissions`          | Só o que está explicitamente vinculado                   | Ativo                             |
| DB `user_has_permission()` (mig 20260816001200) | `role_resource_permissions` | Matriz canônica, `is_global = true` para admin_master    | Aplicada em 12/08/2026            |
| DB `user_has_permission()` (mig 20260909000000) | `role_permissions`          | Sobrescreve a versão anterior; `scope='global'` = bypass | Aplicada em 09/09/2026 (DESPOSAL) |

A migration `20260909000000_fix_user_has_permission_expires_at.sql` redefiniu `user_has_permission()` para usar a tabela antiga `role_permissions` (não `role_resource_permissions`), criando divergência com a matriz canônica da migração `20260816001200`. Além disso, essa migration usa `BEGIN;`/`COMMIT;`, o que o runner do Supabase já faz implicitamente — conforme nota do time, `BEGIN` é ignorado e `ROLLBACK` pode abortar a transação do runner.

Não há consistência entre essas quatro camadas.

### 3.4 `membership_role` não é FK para `roles`

`tenant_memberships.membership_role` é `text` livre. Não há integridade referencial entre o papel da membership e a tabela `roles`. Isso permite inconsistências entre `membership_role`, `role_assignments` e `roles`.

### 3.5 RLS existe em tabelas de dados, mas não nas tabelas de identidade RBAC

Migration `20260816001200_rls_consolidation.sql` já aplica RLS nas tabelas de dados (`people`, `companies`, `candidates`, `jobs`, `applications`, `files`, `notifications`, etc.) com políticas por tenant e `admin_master` global. No entanto, as tabelas de identidade RBAC (`public.roles`, `public.permissions`, `public.role_permissions`, `public.role_assignments`, `public.role_resource_permissions`) não possuem políticas RLS próprias — dependem apenas do controle de aplicação. Além disso, a migration `20260817000200_enable_rls_role_resource_permissions.sql` habilita RLS apenas em `role_resource_permissions`, sem definir políticas de leitura/escrita.

### 3.6 Role assignments para múltiplas roles simultâneas

O usuário admin_master (Evandro Andrade) possui role assignment para `admin_master` (global, tenant_id NULL) e também pode ter roles tenant-scoped. Isso permite "trocar conta" mas mistura escopos globais e de tenant no mesmo contexto de sessão, sem isolamento claro.

### 3.7 Permissões de domínio sem vínculo

`finance_manager`, `recruiter` e `rh_manager` existem como roles mas têm 0 permissões. Qualquer frontend que libere rota baseado apenas no nome da role concede acesso sem autorização real.

### 3.8 Inconsistência de nomenclatura de permissão

- Tabela `permissions`: colunas `resource` + `action` (ex: `('jobs', 'read')`)
- Tipos TypeScript (`Permission`): campo `name` (ex: `'jobs.read'`)
- `normalizePermission()` (src/utils/rbac-normalize.ts:62) converte entre formatos, mas há risco de desalinhamento entre o que é criado no banco e o que é consultado no frontend.

---

## 4. Funções SQL de Autorização

### 4.1 `user_has_permission(p_auth_user_id, p_resource, p_action, p_tenant_id)`

Arquivo: `supabase/migrations/20260909000000_fix_user_has_permission_expires_at.sql`

- Faz bypass global para `r.scope = 'global'` (qualquer role global, não apenas admin_master)
- Verifica `role_assignments → roles → role_permissions → permissions`
- Não distingue `admin_master` de outras roles globais

### 4.2 `is_admin_master()`

Arquivo: `supabase/migrations/20260903230000_fix_roles_scope_functions.sql`

- Verifica `r.name = 'admin_master' AND r.scope = 'global'`
- Usado por RLS policies e Dispatcher Master para bypass de isolamento de tenant

### 4.3 `can_manage_role_assignment(target_tenant_id)`

- Permite `admin_master` (global) ou `tenant_admin` (mesmo tenant) gerenciar atribuições

---

## 5. Conclusão do Diagnóstico

O modelo atual **não atende** aos critérios de aceite propostos:

| Critério                                        | Status     | Evidência                                                                                                                                                                              |
| ----------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| admin_master com ROOT explícito e auditável     | ❌         | AuthorizationContract não special-cases; depende de 113/247 vínculos                                                                                                                   |
| Owner não administra outros tenants             | ❌         | Papel `owner` não existe                                                                                                                                                               |
| Gestor sem privilégios de ROOT                  | ❌         | Papel `gestor` não existe                                                                                                                                                              |
| Recrutador_master com escopo limitado ao tenant | ❌         | Papel `recrutador_master` não existe                                                                                                                                                   |
| Recrutador sem privilégios administrativos      | ⚠️         | Existe como `recruiter` mas sem permissões                                                                                                                                             |
| Funcionário com acesso por atribuição           | ❌         | Papel `funcionario` não existe                                                                                                                                                         |
| Candidato isolado aos próprios dados            | ⚠️         | Existe como `candidato`; RLS candidate_self_exists                                                                                                                                     |
| Nenhum usuário comum com autoridade global      | ⚠️         | Depende de `scope='global'` em qualquer role, não apenas admin_master                                                                                                                  |
| RLS impede acesso indevido                      | ⚠️ Parcial | RLS existe em tabelas de dados (mig 20260816001200) mas não nas tabelas de identidade RBAC; `role_resource_permissions` tem RLS habilitado mas sem políticas de leitura                |
| Dois sistemas de permissão paralelos            | ❌         | `role_permissions` (mig 20260909000000) vs `role_resource_permissions` (mig 20260816001200) — `user_has_permission()` foi redefinido para usar o antigo, divergindo da matriz canônica |

---

**Próximo entregável:** `02-MATRIZ-PAPEIS-PERMICOES-ESCOS.md` (matriz atual vs proposta).
