# V2.1 — Route Map (proposta)

**Data:** 2026-08-23  
**Branch:** main  
**Commit base:** ae735a7 / 2bb4128  
**Fonte:** `docs/V21-RBAC-MATRIX.md` + `docs/V21-DOMAIN-MAP.md`

---

## 1. Objetivo

Definir a estrutura de rotas do SaaS a partir do RBAC real, sem inventar áreas ou permissões. Cada rota deve ser protegida por permissions efetivas, não por nomes de roles.

---

## 2. Regras de roteamento

1. **Login é único:** `/login`
2. **Destino pós-login** é decidido por:
   - `isAdminMaster` → área administrativa global
   - permissões efetivas → área do tenant/portal
   - ausência de identidade de domínio válida → onboarding
3. **Não há rotas `/admin`, `/empresa`, `/candidato` inventadas.**
4. Cada área é derivada de permissões reais (`resource.action`).

---

## 3. Mapa de áreas/rotas

### 3.1 Administração / SaaS

**Destino:** `/dashboard`  
**Roles alvo:** `admin_master`  
**Permissions:** derivadas de `role_permissions`

**Módulos:**

| Rota                       | Módulo        | Permission base    |
| -------------------------- | ------------- | ------------------ |
| `/dashboard`               | Visão Geral   | `dashboard.read`   |
| `/dashboard/tenants`       | Tenants       | `tenants.read`     |
| `/dashboard/usuarios`      | Usuários      | `people.read`      |
| `/dashboard/roles`         | Roles         | `roles.read`       |
| `/dashboard/permissions`   | Permissões    | `permissions.read` |
| `/dashboard/auditoria`     | Auditoria     | `audit.read`       |
| `/dashboard/seguranca`     | Segurança     | `security.read`    |
| `/dashboard/configuracoes` | Configurações | `settings.read`    |

### 3.2 RH / CRM

**Destino:** `/dashboard/rh`  
**Roles alvo:** `tenant_admin`, `rh_manager`, `recruiter`, `commercial`  
**Permissions:** `candidates.*`, `jobs.*`, `applications.*`, `companies.*`

**Módulos:**

| Rota                        | Módulo              | Permission base   |
| --------------------------- | ------------------- | ----------------- |
| `/dashboard/rh`             | Visão Geral RH      | `dashboard.read`  |
| `/dashboard/rh/vagas`       | Vagas               | `jobs.read`       |
| `/dashboard/rh/candidatos`  | Candidatos          | `candidates.read` |
| `/dashboard/rh/processos`   | Processos Seletivos | `processes.read`  |
| `/dashboard/rh/entrevistas` | Entrevistas         | `interviews.read` |
| `/dashboard/rh/empresas`    | Empresas            | `companies.read`  |
| `/dashboard/rh/contratos`   | Contratos           | `contracts.read`  |
| `/dashboard/rh/documentos`  | Documentos          | `documents.read`  |

### 3.3 Financeiro

**Destino:** `/dashboard/financeiro`  
**Roles alvo:** `tenant_admin`, `finance_manager`, `finance`  
**Permissions:** `finance.*`, `accounts_payable.*`, `accounts_receivable.*`, `financial_transactions.*`

**Módulos:**

| Rota                                   | Módulo                 | Permission base            |
| -------------------------------------- | ---------------------- | -------------------------- |
| `/dashboard/financeiro`                | Visão Geral Financeiro | `dashboard.read`           |
| `/dashboard/financeiro/transacoes`     | Transações             | `finance.read`             |
| `/dashboard/financeiro/contas-pagar`   | Contas a Pagar         | `accounts_payable.read`    |
| `/dashboard/financeiro/contas-receber` | Contas a Receber       | `accounts_receivable.read` |
| `/dashboard/financeiro/fiscal`         | Fiscal                 | `fiscal.read`              |
| `/dashboard/financeiro/relatorios`     | Relatórios Financeiros | `reports.read`             |

### 3.4 Compras

**Destino:** `/dashboard/compras`  
**Roles alvo:** `tenant_admin`, `operations_manager`, `stock_manager`  
**Permissions:** `purchase_orders.*`, `purchase_requests.*`, `purchase_receipts.*`

**Módulos:**

| Rota                              | Módulo              | Permission base          |
| --------------------------------- | ------------------- | ------------------------ |
| `/dashboard/compras`              | Visão Geral Compras | `dashboard.read`         |
| `/dashboard/compras/solicitacoes` | Solicitações        | `purchase_requests.read` |
| `/dashboard/compras/pedidos`      | Pedidos             | `purchase_orders.read`   |
| `/dashboard/compras/recebimentos` | Recebimentos        | `purchase_receipts.read` |

### 3.5 Estoque

**Destino:** `/dashboard/estoque`  
**Roles alvo:** `tenant_admin`, `stock_manager`, `operator`  
**Permissions:** `products.*`, `stock_movements.*`, `stock_inventory.*`

**Módulos:**

| Rota                               | Módulo              | Permission base        |
| ---------------------------------- | ------------------- | ---------------------- |
| `/dashboard/estoque`               | Visão Geral Estoque | `dashboard.read`       |
| `/dashboard/estoque/produtos`      | Produtos            | `products.read`        |
| `/dashboard/estoque/movimentacoes` | Movimentações       | `stock_movements.read` |
| `/dashboard/estoque/inventario`    | Inventário          | `stock_inventory.read` |

### 3.6 Operações / Serviços

**Destino:** `/dashboard/operacoes`  
**Roles alvo:** `tenant_admin`, `operations_manager`, `operator`  
**Permissions:** `service_orders.*`, `work_orders.*`, `tasks.*`

**Módulos:**

| Rota                            | Módulo                | Permission base       |
| ------------------------------- | --------------------- | --------------------- |
| `/dashboard/operacoes`          | Visão Geral Operações | `dashboard.read`      |
| `/dashboard/operacoes/servicos` | Serviços              | `service_orders.read` |
| `/dashboard/operacoes/ordens`   | Ordens de Serviço     | `work_orders.read`    |
| `/dashboard/operacoes/tarefas`  | Tarefas               | `tasks.read`          |

### 3.7 Facilities / Segurança / EPI

**Destino:** `/dashboard/facilities`  
**Roles alvo:** `tenant_admin`, `facilities_manager`, `security_manager`  
**Permissions:** `facilities.*`, `security.*`, `epi_deliveries.*`

**Módulos:**

| Rota                              | Módulo                 | Permission base       |
| --------------------------------- | ---------------------- | --------------------- |
| `/dashboard/facilities`           | Visão Geral Facilities | `dashboard.read`      |
| `/dashboard/facilities/epi`       | EPI                    | `epi_deliveries.read` |
| `/dashboard/facilities/seguranca` | Segurança              | `security.read`       |

### 3.8 Suporte

**Destino:** `/dashboard/suporte`  
**Roles alvo:** `tenant_admin`, `support`  
**Permissions:** `support_tickets.*`

**Módulos:**

| Rota                         | Módulo              | Permission base        |
| ---------------------------- | ------------------- | ---------------------- |
| `/dashboard/suporte`         | Visão Geral Suporte | `dashboard.read`       |
| `/dashboard/suporte/tickets` | Tickets             | `support_tickets.read` |
| `/dashboard/suporte/chat`    | Chat                | `chat.read`            |

### 3.9 Documentos / Comunicação

**Destino:** `/dashboard/comunicacao`  
**Roles alvo:** `tenant_admin`, `commercial`, `rh_manager`, `recruiter`  
**Permissions:** `documents.*`, `chat.*`, `notifications.*`

**Módulos:**

| Rota                                  | Módulo                  | Permission base      |
| ------------------------------------- | ----------------------- | -------------------- |
| `/dashboard/comunicacao`              | Visão Geral Comunicação | `dashboard.read`     |
| `/dashboard/comunicacao/documentos`   | Documentos              | `documents.read`     |
| `/dashboard/comunicacao/chat`         | Chat                    | `chat.read`          |
| `/dashboard/comunicacao/notificacoes` | Notificações            | `notifications.read` |

### 3.10 IA / Automação

**Destino:** `/dashboard/automacao`  
**Roles alvo:** `tenant_admin`, `it_admin`  
**Permissions:** `automation.*`, `ai_conversations.*`

**Módulos:**

| Rota                        | Módulo                | Permission base         |
| --------------------------- | --------------------- | ----------------------- |
| `/dashboard/automacao`      | Visão Geral Automação | `dashboard.read`        |
| `/dashboard/automacao/ia`   | IA                    | `ai_conversations.read` |
| `/dashboard/automacao/jobs` | Jobs                  | `automation_jobs.read`  |

### 3.11 Agenda

**Destino:** `/dashboard/agenda`  
**Roles alvo:** `tenant_admin`, `operations_manager`, `commercial`  
**Permissions:** `calendar_events.*`, `meeting_rooms.*`

**Módulos:**

| Rota                        | Módulo             | Permission base        |
| --------------------------- | ------------------ | ---------------------- |
| `/dashboard/agenda`         | Visão Geral Agenda | `dashboard.read`       |
| `/dashboard/agenda/eventos` | Eventos            | `calendar_events.read` |
| `/dashboard/agenda/salas`   | Salas de Reunião   | `meeting_rooms.read`   |

### 3.12 Relatórios

**Destino:** `/dashboard/relatorios`  
**Roles alvo:** `tenant_admin`, `operations_manager`, `commercial`, `stock_manager`, `viewer`  
**Permissions:** `reports.read`, `reports.export`

**Módulos:**

| Rota                               | Módulo                 | Permission base  |
| ---------------------------------- | ---------------------- | ---------------- |
| `/dashboard/relatorios`            | Visão Geral Relatórios | `dashboard.read` |
| `/dashboard/relatorios/definicoes` | Definições             | `reports.read`   |
| `/dashboard/relatorios/execucoes`  | Execuções              | `reports.read`   |

### 3.13 LGPD / Privacidade

**Destino:** `/dashboard/lgpd`  
**Roles alvo:** `tenant_admin`, `lawyer`, `security_manager`  
**Permissions:** `consents.*`, `privacy_requests.*`, `data_deletion_requests.*`, `data_export_requests.*`

**Módulos:**

| Rota                             | Módulo           | Permission base         |
| -------------------------------- | ---------------- | ----------------------- |
| `/dashboard/lgpd`                | Visão Geral LGPD | `dashboard.read`        |
| `/dashboard/lgpd/consentimentos` | Consentimentos   | `consents.read`         |
| `/dashboard/lgpd/solicitacoes`   | Solicitações     | `privacy_requests.read` |

---

## 4. Redirecionamento pós-login

```text
login
  ↓
AuthContext
  ↓
resolvePostLoginDestination()
  ↓
┌─────────────────┐
│ isAdminMaster?  │ → /dashboard
├─────────────────┤
│ tenant_membership + role tenant? │ → /dashboard/<area por permission>
├─────────────────┤
│ candidate?      │ → /dashboard/rh/candidatos (se aplicável)
├─────────────────┤
│ sem identidade  │ → /onboarding
└─────────────────┘
```

---

## 5. Sidebar dinâmica

A sidebar será construída a partir das permissions efetivas do usuário:

```text
permissions
   ↓
agrupar por módulo
   ↓
montar itens de menu
   ↓
ordenar por área
   ↓
renderizar sidebar
```

---

## 6. Próximos passos

1. Aprovar este mapa de rotas
2. Implementar `resolvePostLoginDestination()` no `AuthContext`
3. Implementar sidebar dinâmica por permission
4. Implementar `PermissionGuard` nas rotas
5. Construir mini-landings dos módulos com KPIs + filtros + tabelas

---

**Fim do documento.**
