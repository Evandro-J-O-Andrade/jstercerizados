# RBAC User Inventory

**Data:** 2026-08-25  
**Scope:** Usuários ativos no Supabase (auth + pessoas + membros + roles + permissões)

---

## 1. Usuários no Sistema

| Usuário         | Email                          | Auth      | Person    | Tenant            | Role              | must_change_password | first_login_completed |
| --------------- | ------------------------------ | --------- | --------- | ----------------- | ----------------- | -------------------- | --------------------- |
| Evandro Andrade | `evandro_j.o.a@hotmail.com`    | existente | existente | Global            | `admin_master`    | — (não aplica)       | — (não aplica)        |
| Gestor J&S      | `gestor@jsempregos.com.br`     | existente | existente | J&S Empregos LTDA | `tenant_admin`    | true                 | false                 |
| Financeiro J&S  | `financeiro@jsempregos.com.br` | existente | existente | J&S Empregos LTDA | `finance_manager` | true                 | false                 |

> **Observação:** `ADMIN_MASTER` não possui registro em `first_login_state`. Ele não entra no fluxo de primeiro acesso.

---

## 2. Matriz RBAC por Usuário

### 2.1 Evandro Andrade — `admin_master` (Global)

**Contexto:** Global (tenant_id = null na role_assignments)  
**Escopo:** Global  
**Total de permissões:** 96

| Recurso              | Ações                                                                      |
| -------------------- | -------------------------------------------------------------------------- |
| tenants              | activate, create, delete, read, update                                     |
| people               | create, delete, disable, export, read, update                              |
| roles                | create, delete, read, update                                               |
| companies            | convert, create, delete, read, update                                      |
| products             | create, delete, read, update                                               |
| finance              | approve, create, delete, export, forecast, read, reconcile, reject, update |
| audit                | export, filter, read                                                       |
| audit_logs           | read                                                                       |
| auth                 | change_password, revoke_session                                            |
| automations          | create, toggle, update                                                     |
| billing              | cancel, create, export, read, update                                       |
| candidates           | create, delete, export, read, update                                       |
| candidates.documents | manage, read                                                               |
| candidates.profile   | read                                                                       |
| chat                 | create, handoff, read                                                      |
| contracts            | create, delete, export, read, renew, update                                |
| dashboard            | read                                                                       |
| documents            | create, publish, read, update, version                                     |
| domain_events        | read                                                                       |
| files                | create, delete, read, update, upload                                       |
| integrations         | create, delete, manage, test, update                                       |
| jobs                 | archive, close, create, delete, export, publish, read, update              |
| lgpd                 | manage_consent, manage_retention, read                                     |
| notifications        | create, read                                                               |
| permissions          | create, delete, read, update                                               |
| purchase_orders      | confirm, create, read, update                                              |
| purchase_receipts    | confirm, create, read                                                      |
| recruitment          | advance, close, create, delete, read, reject, update                       |
| recruitment_demands  | create, delete, read, update                                               |
| recruitment.stage    | manage                                                                     |
| reports              | export, generate, read                                                     |
| security_events      | export, read                                                               |
| service_orders       | cancel, complete, create, read, update                                     |
| stock_movements      | create, export, read                                                       |
| support_tickets      | close, create, read, resolve, update                                       |
| talent_pool          | manage, match, read                                                        |
| tasks                | assign, create, read, update                                               |
| tenant               | manage, update                                                             |
| applications         | advance, approve, create, interview, read, reject, update                  |
| applications.history | read                                                                       |
| ai                   | configure, test                                                            |

---

### 2.2 Gestor J&S — `tenant_admin` (J&S Empregos LTDA)

**Contexto:** Tenant `J&S Empregos LTDA`  
**Escopo:** Tenant  
**Total de permissões:** 86

| Recurso              | Ações                                         |
| -------------------- | --------------------------------------------- |
| jobs                 | close, read, create, update, delete, publish  |
| candidates           | delete, read, create, update                  |
| candidates.documents | read, manage                                  |
| candidates.profile   | read                                          |
| recruitment          | read, create, update, delete, advance, reject |
| recruitment.stage    | manage                                        |
| applications         | advance, reject, read, create, update         |
| applications.history | read                                          |
| talent_pool          | read, manage, match                           |
| recruitment_demands  | read, create, update, delete                  |
| people               | create, read, update, delete                  |
| companies            | create, read, update, delete                  |
| products             | create, read, update, delete                  |
| stock_movements      | create, read                                  |
| purchase_orders      | create, read, update, confirm                 |
| purchase_receipts    | create, read, confirm                         |
| service_orders       | create, read, update, complete                |
| contracts            | create, read, update, renew                   |
| tasks                | create, read, update, assign                  |
| support_tickets      | create, read, update, resolve                 |
| chat                 | create, read, handoff                         |
| notifications        | create, read                                  |
| files                | upload, read, delete                          |
| documents            | create, read, version                         |
| audit_logs           | read                                          |
| security_events      | read                                          |
| lgpd                 | read, manage_consent, manage_retention        |

---

### 2.3 Financeiro J&S — `finance_manager` (J&S Empregos LTDA)

**Contexto:** Tenant `J&S Empregos LTDA`  
**Escopo:** Tenant  
**Total de permissões:** 0

> ⚠️ **ALERTA:** A role `finance_manager` **não possui permissões** cadastradas em `role_permissions`.  
> O usuário **não conseguirá acessar nenhum recurso** enquanto essa matriz não for populada.

---

## 3. Inventário de Roles no Banco

| Role                | Scope      | Permissões |
| ------------------- | ---------- | ---------- |
| admin_master        | global     | 96         |
| tenant_admin        | tenant     | 86         |
| operations_manager  | tenant     | 33         |
| rh_manager          | tenant     | 33         |
| recruiter           | tenant     | 23         |
| finance             | tenant     | 19         |
| commercial          | tenant     | 19         |
| operator            | tenant     | 21         |
| it_admin            | tenant     | 10         |
| facilities_manager  | tenant     | 11         |
| lawyer              | tenant     | 8          |
| viewer              | tenant     | 14         |
| support             | tenant     | 5          |
| security_manager    | tenant     | 5          |
| stock_manager       | tenant     | 9          |
| **finance_manager** | **tenant** | **0**      |

---

## 4. Fluxo de Primeiro Acesso

```text
Usuário criado/provisionado
        ↓
Senha temporária do seed
        ↓
Login
        ↓
first_login_state.must_change_password = true
        ↓
Aceite dos Termos + Troca obrigatória de senha
        ↓
must_change_password = false
        ↓
first_login_completed = true
        ↓
Dashboard do tenant
```

**Status atual:**

| Usuário    | must_change_password | first_login_completed | Próximo passo                        |
| ---------- | -------------------- | --------------------- | ------------------------------------ |
| Evandro    | — (não aplica)       | — (não aplica)        | Acesso direto ao dashboard           |
| Gestor     | true                 | false                 | Deve trocar senha no primeiro acesso |
| Financeiro | true                 | false                 | Deve trocar senha no primeiro acesso |

> **Regra:** A senha temporária **nunca** é exibida no dashboard, banco, logs ou frontend. Ela existe apenas no momento do provisionamento.

---

## 5. Próximos Passos

1. **Corrigir gap de permissões:** atribuir permissões à role `finance_manager`
2. **Refatorar Portal:**
   - `/dashboard` → Gestão Analítica (KPIs, indicadores, alertas, atividades)
   - Sidebar e conteúdo central derivados da mesma matriz de módulos/permissões
   - "Acessar meus módulos" → catálogo de aplicações do contexto
   - `Configuração Geral` como aplicação de administração
   - CRUD controlado por permissão para todas as roles, incluindo `ADMIN_MASTER`
3. **Validar fluxo** com `gestor@jsempregos.com.br` e `financeiro@jsempregos.com.br`
