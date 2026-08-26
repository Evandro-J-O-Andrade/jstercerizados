# RBAC Inventory — ADMIN_MASTER

**Usuário**: Evandro Andrade  
**Email**: evandro_j.o.a@hotmail.com  
**Username**: evandro.andrade  
**Auth UID**: a78ddef1-5659-404f-9c7c-940c5df0abf1  
**Person ID**: 5959468c-ce89-474a-a277-a1eef6ff1731  
**Status**: active  
**Role**: admin_master  
**Scope**: global (`is_global = TRUE`)  
**Role Assignment ID**: 5e79f69b-9b31-44e8-a464-4144f31add0b  
**Tenant ID**: NULL (global)  
**Assigned At**: 2026-08-17T11:28:36.58+00:00

---

## 1. Identidade

| Campo             | Valor                                                      |
| ----------------- | ---------------------------------------------------------- |
| auth_user_id      | a78ddef1-5659-404f-9c7c-940c5df0abf1                       |
| person_id         | 5959468c-ce89-474a-a277-a1eef6ff1731                       |
| full_name         | Evandro Andrade                                            |
| email             | evandro_j.o.a@hotmail.com                                  |
| username          | evandro.andrade                                            |
| status            | active                                                     |
| tenant_membership | J&S Empregos LTDA (`a1b2c3d4-e5f6-7890-abcd-ef1234567890`) |
| membership_role   | owner                                                      |
| membership_status | active                                                     |

---

## 2. Roles

| ID                                   | Name         | Scope  | Description                                          |
| ------------------------------------ | ------------ | ------ | ---------------------------------------------------- |
| 82c33a22-b8d4-4711-b003-53c11b0d0be8 | admin_master | global | Plataforma — acesso global com auditoria obrigatória |
| 21127dd1-554a-4549-9949-f543574770eb | tenant_admin | tenant | Administração do tenant                              |
| 45caca9c-307c-4d5a-bef7-0767283947ea | recruiter    | tenant | Recrutamento e triagem                               |
| b02f5261-727c-454a-b294-27f3e0db8825 | rh_manager   | tenant | Gestão de RH                                         |
| 4bba6601-c137-4307-beb1-2995a5e4f6b7 | finance      | tenant | Financeiro                                           |
| 5aa8e768-5317-4a7e-9e1e-42902334ab49 | viewer       | tenant | Apenas leitura                                       |

> **Nota**: Evandro possui role assignments para múltiplas roles, incluindo `admin_master` (global) e roles tenant-scoped. Isso permite a funcionalidade de "Trocar conta" sem logout.

---

## 3. Role Assignments

| ID                                   | Person ID    | Role ID      | Role Name    | Tenant ID | Assigned At                  |
| ------------------------------------ | ------------ | ------------ | ------------ | --------- | ---------------------------- |
| 5e79f69b-9b31-44e8-a464-4144f31add0b | 5959468c-... | 82c33a22-... | admin_master | NULL      | 2026-08-17T11:28:36.58+00:00 |

---

## 4. Permissões

### 4.1 Permissions Canônicas (tabela `permissions`)

| ID                                   | Name                 | Module      | Description                   |
| ------------------------------------ | -------------------- | ----------- | ----------------------------- |
| 2b564a9c-4850-4bfe-85a6-ebfc6c021ab6 | people.read          | core        | Visualizar pessoas            |
| fbe5e651-c9dc-438b-b22b-b8ed8088125b | people.create        | core        | Criar pessoas                 |
| 87924acf-08e8-468e-a0b4-7927120ff6f0 | people.update        | core        | Atualizar pessoas             |
| a6f1d19f-0dba-4e7e-adae-45aa18ff2c5c | people.disable       | core        | Desativar pessoas             |
| f77fbea6-b3c7-48d2-9128-fdc614eecc41 | candidates.read      | recruitment | Visualizar candidatos         |
| 9a77db30-5bca-4637-8b28-2ef0d3f92349 | candidates.create    | recruitment | Criar candidatos              |
| 0e582ca4-8982-45e2-8751-36cf7b607079 | candidates.update    | recruitment | Atualizar candidatos          |
| 1cc0258b-c8f7-4630-9f2d-22ec7fec8fe6 | jobs.read            | recruitment | Visualizar vagas              |
| 2739e104-ae27-4707-ab5f-265500101d2f | jobs.create          | recruitment | Criar vagas                   |
| 95d60bfe-87dd-404e-b5a0-67fb975143c2 | jobs.update          | recruitment | Editar vagas                  |
| 3b9d2744-dc69-4eef-8059-f83e7014a2ac | jobs.publish         | recruitment | Publicar vagas                |
| 6fe7829c-3031-450e-869e-dcb9ce640c70 | jobs.delete          | recruitment | Arquivar vagas                |
| caeb5fcc-3216-44a5-9a6a-691543665ca3 | applications.read    | recruitment | Visualizar candidaturas       |
| 1dc06367-3581-4715-8977-59a6b9306407 | applications.update  | recruitment | Atualizar candidaturas        |
| 5c36db6f-e367-446d-a109-c40fc51e0b89 | applications.reject  | recruitment | Rejeitar candidaturas         |
| dbf4d230-b29e-437b-94f1-ab9257edd02c | applications.approve | recruitment | Aprovar candidaturas          |
| fb820838-fff9-4e66-bea3-66f461b87fe2 | companies.read       | core        | Visualizar empresas           |
| 2af04dc8-8f5d-4850-9bef-8ab3a3e28352 | companies.create     | core        | Criar empresas                |
| 10d21657-8260-47c9-8b0d-4d89e736ab13 | companies.update     | core        | Editar empresas               |
| 8e2acdf4-b1ec-405f-8bd9-3f671bf45a41 | finance.read         | finance     | Acessar dados financeiros     |
| b960c956-9414-4e89-b594-3a222c9657b3 | finance.create       | finance     | Criar lançamentos financeiros |
| b0747958-2d4c-4b1d-98a9-c3ce300dddf7 | finance.update       | finance     | Atualizar financeiro          |
| 28cadad8-1bc9-44a8-aa66-407bb43529b7 | audit.read           | platform    | Visualizar logs de auditoria  |
| cdab5a10-5049-402c-8318-ae4e771f17fc | roles.manage         | platform    | Gerenciar papéis e permissões |
| e5af9ea7-7053-48d6-a2c7-f7f6b7649035 | tenant.manage        | platform    | Administrar tenant            |
| 52ba740f-db21-42c1-a7c4-db835016ee0e | integrations.manage  | platform    | Gerenciar integrações         |

### 4.2 Permissions via Role Resource Permissions (modelo legado)

O banco de produção também possui `role_resource_permissions` com 114 permissões para `admin_master`:

| Recurso                 | Ação   | Permitido |
| ----------------------- | ------ | --------- |
| people                  | create | TRUE      |
| people                  | read   | TRUE      |
| people                  | update | TRUE      |
| people                  | delete | TRUE      |
| tenants                 | create | TRUE      |
| tenants                 | read   | TRUE      |
| tenants                 | update | TRUE      |
| tenants                 | delete | TRUE      |
| tenant_memberships      | create | TRUE      |
| tenant_memberships      | read   | TRUE      |
| tenant_memberships      | update | TRUE      |
| tenant_memberships      | delete | TRUE      |
| candidates              | create | TRUE      |
| candidates              | read   | TRUE      |
| candidates              | update | TRUE      |
| candidates              | delete | TRUE      |
| jobs                    | create | TRUE      |
| jobs                    | read   | TRUE      |
| jobs                    | update | TRUE      |
| jobs                    | delete | TRUE      |
| applications            | create | TRUE      |
| applications            | read   | TRUE      |
| applications            | update | TRUE      |
| applications            | delete | TRUE      |
| companies               | create | TRUE      |
| companies               | read   | TRUE      |
| companies               | update | TRUE      |
| companies               | delete | TRUE      |
| files                   | create | TRUE      |
| files                   | read   | TRUE      |
| files                   | update | TRUE      |
| files                   | delete | TRUE      |
| domain_events           | read   | TRUE      |
| domain_events           | create | TRUE      |
| notifications           | read   | TRUE      |
| notifications           | create | TRUE      |
| notifications           | update | TRUE      |
| notification_deliveries | read   | TRUE      |
| notification_deliveries | create | TRUE      |
| notification_deliveries | update | TRUE      |
| talent_pool_memberships | create | TRUE      |
| talent_pool_memberships | read   | TRUE      |
| talent_pool_memberships | update | TRUE      |
| talent_pool_memberships | delete | TRUE      |
| candidate_preferences   | read   | TRUE      |
| candidate_preferences   | update | TRUE      |
| job_matches             | read   | TRUE      |
| job_matches             | create | TRUE      |
| job_matches             | update | TRUE      |
| candidate_skills        | create | TRUE      |
| candidate_skills        | read   | TRUE      |
| candidate_skills        | update | TRUE      |
| candidate_skills        | delete | TRUE      |
| skills                  | read   | TRUE      |
| role_assignments        | create | TRUE      |
| role_assignments        | read   | TRUE      |
| role_assignments        | update | TRUE      |
| role_assignments        | delete | TRUE      |
| roles                   | read   | TRUE      |
| company_relationships   | create | TRUE      |
| company_relationships   | read   | TRUE      |
| company_relationships   | update | TRUE      |
| company_relationships   | delete | TRUE      |

---

## 5. Scopes

| Scope  | Origem                                               | Permissions                      |
| ------ | ---------------------------------------------------- | -------------------------------- |
| global | admin_master (`is_global = TRUE`)                    | Acesso total a todos os recursos |
| tenant | tenant_admin, rh_manager, recruiter, finance, viewer | Acesso scoped ao tenant          |

**Observação**: O banco não possui uma coluna `scope` explícita em `permissions`. O scope é definido pela role:

- `admin_master` → global
- Outras roles → tenant

---

## 6. Resources

| Resource                | Actions                               | Module      |
| ----------------------- | ------------------------------------- | ----------- |
| people                  | read, create, update, delete          | core        |
| candidates              | read, create, update, delete          | recruitment |
| jobs                    | read, create, update, publish, delete | recruitment |
| applications            | read, update, reject, approve         | recruitment |
| companies               | read, create, update                  | core        |
| finance                 | read, create, update                  | finance     |
| tenants                 | read, create, update, delete          | platform    |
| tenant_memberships      | read, create, update, delete          | platform    |
| files                   | read, create, update, delete          | core        |
| domain_events           | read, create                          | core        |
| notifications           | read, create, update                  | core        |
| notification_deliveries | read, create, update                  | core        |
| talent_pool_memberships | read, create, update, delete          | recruitment |
| candidate_preferences   | read, update                          | recruitment |
| job_matches             | read, create, update                  | recruitment |
| candidate_skills        | read, create, update, delete          | recruitment |
| skills                  | read                                  | recruitment |
| role_assignments        | read, create, update, delete          | platform    |
| roles                   | read, manage                          | platform    |
| company_relationships   | read, create, update, delete          | core        |
| audit                   | read                                  | platform    |
| integrations            | manage                                | platform    |

---

## 7. Actions

| Action  | Recurso                                                                   | Descrição             |
| ------- | ------------------------------------------------------------------------- | --------------------- |
| read    | people, candidates, jobs, applications, companies, finance, tenants, etc. | Visualizar            |
| create  | people, candidates, jobs, applications, companies, finance, etc.          | Criar                 |
| update  | people, candidates, jobs, applications, companies, finance, etc.          | Atualizar             |
| delete  | people, candidates, jobs, companies, files, etc.                          | Excluir/Arquivar      |
| publish | jobs                                                                      | Publicar vaga         |
| reject  | applications                                                              | Rejeitar candidatura  |
| approve | applications                                                              | Aprovar candidatura   |
| manage  | roles                                                                     | Gerenciar papéis      |
| manage  | integrations                                                              | Gerenciar integrações |

---

## 8. Permission → Module Mapping

| Módulo         | Permissions                                                                                            | Scope    |
| -------------- | ------------------------------------------------------------------------------------------------------ | -------- |
| **PLATAFORMA** | tenants.read/create/update/delete, tenant_memberships.*, roles.manage, audit.read, integrations.manage | platform |
| **NEGÓCIO**    | people._, candidates._, jobs._, applications._, companies._, finance._, files._, notifications._, etc. | tenant   |
| **CONTA**      | people.read (próprio perfil)                                                                           | tenant   |

---

## 9. Permission → Feature Mapping

### PLATAFORMA

| Feature            | Permissions                                                  | Scope    |
| ------------------ | ------------------------------------------------------------ | -------- |
| Tenants            | tenants.read, tenants.create, tenants.update, tenants.delete | platform |
| Clientes           | companies.read, companies.create, companies.update           | platform |
| Usuários           | people.read, people.create, people.update, people.delete     | platform |
| Roles & Permissões | roles.manage, roles.read                                     | platform |
| Auditoria          | audit.read                                                   | platform |
| Integrações        | integrations.manage                                          | platform |
| Tenant Memberships | tenant_memberships.*                                         | platform |

### NEGÓCIO

| Feature      | Permissions                                                | Scope  |
| ------------ | ---------------------------------------------------------- | ------ |
| RH           | people.read, people.create, people.update, people.delete   | tenant |
| Recrutamento | jobs._, candidates._, applications._, recruitment._        | tenant |
| Financeiro   | finance.read, finance.create, finance.update               | tenant |
| Gestão       | companies.read, companies.update, files._, notifications._ | tenant |
| Estoque      | (não mapeado ainda)                                        | —      |
| Suporte      | (não mapeado ainda)                                        | —      |
| IA           | (não mapeado ainda)                                        | —      |

---

## 10. Recommended Portal Navigation

```text
PLATAFORMA
├── Tenants
│   ├── Visualizar (tenants.read)
│   ├── Criar (tenants.create)
│   └── Editar (tenants.update)
├── Clientes
│   ├── Visualizar (companies.read)
│   ├── Criar (companies.create)
│   └── Editar (companies.update)
├── Usuários
│   ├── Visualizar (people.read)
│   ├── Criar (people.create)
│   └── Editar (people.update)
├── Roles & Permissões
│   ├── Visualizar (roles.read)
│   └── Gerenciar (roles.manage)
├── Auditoria
│   └── Visualizar (audit.read)
└── Integrações
    └── Gerenciar (integrations.manage)

NEGÓCIO
├── RH
│   ├── Visualizar pessoas (people.read)
│   ├── Criar pessoas (people.create)
│   └── Editar pessoas (people.update)
├── Recrutamento
│   ├── Vagas (jobs.*)
│   ├── Candidatos (candidates.*)
│   ├── Candidaturas (applications.*)
│   └── Processos Seletivos (recruitment.*)
├── Financeiro
│   ├── Visualizar (finance.read)
│   ├── Criar (finance.create)
│   └── Editar (finance.update)
├── Gestão
│   ├── Empresas (companies.read)
│   ├── Contratos (files.*)
│   └── Relatórios (notifications.*)
└── Estoque / Suporte / IA
    └── (pendente mapeamento)

CONTA
├── Meu perfil (people.read — próprio)
├── Segurança
└── Preferências
```

---

## 11. Auditoria do Código Atual

### 11.1 NavigationResolver

**Arquivo**: `src/components/portal/NavigationResolver.ts`

| Item                                      | Status | Observação                                                |
| ----------------------------------------- | ------ | --------------------------------------------------------- |
| `scope` em módulos                        | ✅     | Implementado (`platform` / `tenant`)                      |
| `category` em módulos                     | ✅     | Implementado (`inicio`, `plataforma`, `negocio`, `conta`) |
| `requiredPermissions`                     | ✅     | Implementado                                              |
| `getAvailableModules(permissions, scope)` | ✅     | Implementado                                              |
| `groupModulesByCategory`                  | ✅     | Implementado                                              |

**Problemas identificados**:

- Alguns módulos possuem `requiredPermissions` que não correspondem exatamente às permissions do banco
- Módulo `ia` usa `ai.read` e `automation.read` que não existem no banco atual
- Módulo `configuracoes` usa `settings.read` que não existe no banco atual

### 11.2 PortalSidebar

**Arquivo**: `src/components/portal/PortalSidebar.tsx`

| Item               | Status | Observação                         |
| ------------------ | ------ | ---------------------------------- |
| Categorias visuais | ✅     | INÍCIO, PLATAFORMA, NEGÓCIO, CONTA |
| Submenus           | ✅     | Features por módulo                |
| Modo collapsed     | ✅     | Implementado                       |
| Troca de conta     | ✅     | Modal com memberships              |
| Tema               | ✅     | Light/Dark                         |
| Acessibilidade     | ✅     | Botão na sidebar                   |
| Atendente          | ✅     | Botão na sidebar                   |

**Problemas identificados**:

- `isAdminMaster` é usado como bypass em `hasModulePermission` — **não deveria**
- Alguns ícones não estão mapeados corretamente

### 11.3 PortalHeader

**Arquivo**: `src/components/portal/PortalHeader.tsx`

| Item              | Status | Observação                                  |
| ----------------- | ------ | ------------------------------------------- |
| Saudação dinâmica | ✅     | `Bom dia, {firstName}`                      |
| Site público      | ✅     | Botão no header                             |
| Menu usuário      | ✅     | Perfil, Segurança, Trocar conta, Tema, Sair |
| Troca de conta    | ✅     | Modal com memberships                       |

### 11.4 DashboardHome

**Arquivo**: `src/pages/dashboard/DashboardHome.tsx`

| Item                     | Status | Observação                                  |
| ------------------------ | ------ | ------------------------------------------- |
| Métricas ADMIN_MASTER    | ✅     | Tenants, Usuários, Auditoria, Monitoramento |
| Métricas TENANT_ADMIN    | ✅     | Vagas, Candidatos, Financeiro, Suporte      |
| Métricas FINANCE_MANAGER | ✅     | Contas, Fluxo, Faturamento                  |
| Módulos disponíveis      | ✅     | Derivados de permissões                     |

---

## 12. Sidebars Duplicadas

| Componente         | Status  | Ação                      |
| ------------------ | ------- | ------------------------- |
| `DashboardShell`   | legado  | Não utilizado após Fase 2 |
| `DashboardSidebar` | legado  | Não utilizado após Fase 2 |
| `DashboardHeader`  | legado  | Não utilizado após Fase 2 |
| `DashboardRouter`  | legado  | Não utilizado após Fase 2 |
| `PortalShell`      | ativo   | ✅                        |
| `PortalSidebar`    | ativo   | ✅                        |
| `PortalHeader`     | ativo   | ✅                        |
| `AppShell`         | wrapper | ✅                        |

**Ação recomendada**: Remover `DashboardShell`, `DashboardSidebar`, `DashboardHeader` e `DashboardRouter` após validação completa do Portal.

---

## 13. Correções Recomendadas

1. **Remover bypass `isAdminMaster`** em `hasModulePermission`
2. **Alinhar `requiredPermissions`** com permissions reais do banco
3. **Remover módulos com permissions inventadas** (`ia.read`, `automation.read`, `settings.read`)
4. **Adicionar mapeamento de modules** para recursos sem módulo definido (estoque, suporte, IA)
5. **Unificar modelo de permissions**: migrar `role_resource_permissions` para `role_permissions` + `permissions`
6. **Criar permissões faltantes** para módulos não mapeados (estoque, suporte, IA)
7. **Documentar scope explicitamente** em cada permission
8. **Remover componentes legados** (`DashboardShell`, `DashboardSidebar`, `DashboardHeader`, `DashboardRouter`)

---

## 14. Próximos Passos

1. Aprovar este inventário
2. Alinhar `NavigationResolver` com permissions reais
3. Remover bypass `isAdminMaster`
4. Criar permissões faltantes
5. Reconstruir sidebar/base de dados
6. Validar com produção
