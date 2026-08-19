# DATABASE-ARCHITECTURE-CONTRACT-V2.1.md

**Data:** 2026-08-18  
**Projeto:** J&S Empregos LTDA — Plataforma SaaS de RH, Recrutamento, Serviços e Gestão Operacional  
**Status:** CONGELADO — Nenhuma alteração estrutural no banco pode ser realizada sem passar por este contrato

---

## 1. Visão do Sistema

O sistema é uma **plataforma SaaS multi-tenant**, não um "site de empregos".

```text
SITE PÚBLICO
    ↓
PORTAL AUTENTICADO
    ↓
BACKOFFICE ADMINISTRATIVO
```

Cada camada tem responsabilidades distintas e regras de acesso independentes.

---

## 2. Princípios Arquiteturais

### 2.1 People-First

```text
auth.users
    ↓
people
    ↓
tenant_memberships
    ↓
role_assignments
    ↓
roles
    ↓
permissions
```

- `person_id` é a identidade de domínio.
- `auth_user_id` é apenas a referência de autenticação.
- Nenhuma regra de negócio depende diretamente de `auth.users`.

### 2.2 Domain ≠ Authorization

```text
candidate
company
employee
supplier
partner
```

são **contextos de negócio**, não roles de autorização.

Roles V2.1:

```text
admin_master
tenant_admin
rh_manager
recruiter
finance_manager
finance
administrative_manager
administrative
operations_manager
support_manager
support
commercial_manager
commercial
stock_manager
stock_operator
content_manager
viewer
member
```

### 2.3 Proibido no código

```text
❌ role = admin
❌ role = empresa
❌ role = candidato
❌ role = funcionário como autorização
❌ role = fornecedor como autorização
❌ ProfileType = 'admin' | 'candidato' | 'empresa'
❌ allowedRoles={['admin']}
❌ allowedRoles={['empresa']}
❌ allowedRoles={['candidato']}
❌ /dashboard/candidato como role
❌ /dashboard/empresa como role
❌ fallback para role 'member' quando não existe
❌ uso de profiles como identidade
```

### 2.4 Rota ≠ Role

```text
/dashboard
    ↓
ProtectedRoute + role/permission

/candidatos
    ↓
ProtectedRoute + domain context

/empresas
    ↓
ProtectedRoute + domain context
```

---

## 3. Hierarquia de Objetos do Banco

### Regra de decisão

| Necessidade | Tecnologia |
|-------------|------------|
| Dado | Table |
| Integridade | Constraint |
| Segurança/tenant | RLS |
| Operação de negócio | **Function/RPC** |
| Histórico automático | Trigger |
| Auditoria | Audit Log + Function/Trigger |
| Consulta/dashboard | View / Report Function |
| Evento | Domain Event |
| WhatsApp/e-mail/API | n8n |

### Regra de ouro

> **O banco garante a verdade. A Function executa o negócio. A auditoria registra. O evento comunica. O n8n automatiza.**

---

## 4. Estratégia por Camada

### 4.1 Tables

- Fonte da verdade para dados operacionais.
- Todo dado persistido deve ter uma tabela.
- Nenhuma regra de negócio crítica deve existir somente no frontend.

### 4.2 Constraints

- Usar sempre que o PostgreSQL puder impedir o erro sozinho.
- Exemplos: `CHECK`, `UNIQUE`, `FK`, `NOT NULL`.

### 4.3 RLS

- Toda tabela tenant-scoped deve ter RLS ativo.
- Nenhum dado de Tenant A pode ser visível para Tenant B.
- Auth no backend, nunca somente no React.

### 4.4 Functions / RPC

- Usar para operações transacionais que alteram mais de uma entidade.
- Usar para proteger invariantes de negócio.
- Exemplos:
  - `approve_candidate()`
  - `complete_service_order()`
  - `register_stock_entry()`
  - `create_contract()`
  - `schedule_interview()`

### 4.5 Triggers

- Usar para comportamentos automáticos e determinísticos.
- Excelentes para: `updated_at`, histórico, auditoria, eventos internos.
- **Proibido:** Trigger chamando API externa, WhatsApp, n8n.

### 4.6 Views

- Usar para leitura agregada e dashboards.
- Evitar duplicar lógica de agregação no frontend.
- Exemplos:
  - `vw_recruitment_dashboard`
  - `vw_company_360`
  - `vw_financial_summary`

### 4.7 Domain Events

- Registrar o fato de que algo importante aconteceu.
- Não executar ações externas.
- Exemplos:
  - `job.published`
  - `candidate.hired`
  - `contract.expiring`
  - `stock.minimum_reached`

### 4.8 n8n

- Responsável por integrações e automações externas.
- Reage a domain events.
- Nunca altera regras críticas do banco diretamente.

---

## 5. Inventário de Domínios

### 5.1 Gestão

| Domínio | Objetos | Status |
|---------|---------|--------|
| KPIs / Dashboards | Views, Report Functions | 🔵 |
| Tarefas | `tasks`, `task_comments`, `task_attachments`, `task_status_history` | 🔵 |
| Auditoria | `audit_log` ou similar | 🔵 |
| Exportações | Funções de relatório | 🔵 |

### 5.2 RH

| Domínio | Objetos | Status |
|---------|---------|--------|
| Vagas | `jobs`, `job_skills` | ✅ |
| Candidatos | `candidates`, `candidate_skills` | ✅ |
| Candidaturas | `applications`, `application_status_history`, `application_profile_snapshots` | ✅ |
| Entrevistas | `interviews`, `interview_participants`, `interview_feedback` | 🔵 |
| Processos | `recruitment_processes`, `recruitment_stages`, `candidate_processes` | 🔵 |
| Contratações | `employees`, `employee_contracts`, `employee_documents`, `employee_status_history` | 🔵 |

### 5.3 Comercial

| Domínio | Objetos | Status |
|---------|---------|--------|
| Leads | `companies` + `interactions` | 🟡 |
| Empresas | `companies`, `company_relationships`, `company_relationship_types`, `company_contacts` | ✅ |
| Clientes | relacionamento `CUSTOMER` em `company_relationships` | ✅ |
| Parceiros | relacionamento `PARTNER` em `company_relationships` | ✅ |
| Fornecedores | `suppliers` (derivado de `companies`) | 🔵 |
| Contratos | `contracts`, `contract_parties`, `contract_services`, `contract_documents`, `contract_events` | 🔵 |

### 5.4 Operação

| Domínio | Objetos | Status |
|---------|---------|--------|
| Serviços | `services`, `service_orders`, `service_order_items` | 🔵 |
| Estoque | `products`, `product_categories`, `warehouses`, `warehouse_locations`, `stock_balances`, `stock_movements`, `stock_entries`, `stock_exits`, `stock_inventory`, `stock_inventory_items`, `stock_adjustments` | 🔵 |
| Almoxarifado | `stock_movements` (tipo), requisições | 🔵 |
| Atendimento | `support_tickets`, `support_ticket_categories`, `support_ticket_messages`, `support_ticket_assignments`, `support_ticket_status_history` | 🔵 |

### 5.5 Financeiro

| Domínio | Objetos | Status |
|---------|---------|--------|
| Receitas | `revenues`, `accounts_receivable` | 🔵 |
| Despesas | `expenses`, `accounts_payable` | 🔵 |
| Contas | `financial_accounts`, `financial_categories`, `cost_centers` | 🔵 |
| Documentos fiscais | `fiscal_documents`, `fiscal_document_items`, `fiscal_document_events`, `fiscal_document_status_history`, `fiscal_configurations`, `fiscal_integrations`, `fiscal_api_requests`, `fiscal_api_responses` | 🔵 |
| Notas | `invoices`, `invoice_items`, `payments` | 🔵 |

### 5.6 Plataforma

| Domínio | Objetos | Status |
|---------|---------|--------|
| Auth | `auth.users`, `people` | ✅ |
| Tenants | `tenants`, `tenant_settings` | ✅/🔵 |
| RBAC | `roles`, `permissions`, `role_assignments`, `role_permissions`, `role_resource_permissions` | ✅ |
| Notifications | `notifications`, `notification_deliveries`, `notification_preferences` | ✅ |
| Chat | `chat_rooms`, `chat_participants`, `chat_messages`, `ai_conversations`, `ai_messages`, `ai_usage`, `chat_assignments`, `chat_handoffs`, `chat_events` | 🟡/🔵 |
| Automations | `domain_events`, `automation_jobs`, `automation_executions`, `webhook_deliveries` | 🟡/🔵 |
| Events | `domain_events` | ✅ |
| Storage | `files`, `file_access_logs`, `document_versions`, `document_links` | ✅/🔵 |
| LGPD | `privacy_requests`, `data_export_requests`, `data_deletion_requests`, `data_retention_policies` | 🔵 |
| Audit | `security_events` | 🔵 |

---

## 6. Regras de Transformação

### 6.1 Tabelas PRESERVAR (sem mudança estrutural)

| Tabela | Justificativa |
|--------|---------------|
| `tenants` | Core multi-tenant |
| `people` | Identidade base |
| `tenant_memberships` | Associação tenant/pessoa |
| `roles` | RBAC base |
| `permissions` | RBAC base |
| `role_assignments` | RBAC base |
| `role_permissions` | RBAC base |
| `role_resource_permissions` | RBAC base |
| `company_types` | Catálogo |
| `company_relationship_types` | Catálogo |
| `skills` | Catálogo |
| `candidate_skills` | Relacionamento |
| `job_skills` | Relacionamento |
| `files` | Storage |
| `file_access_logs` | Audit |
| `domain_events` | Eventos |
| `talent_pool_memberships` | Talent pool |
| `candidate_preferences` | Candidato |
| `candidate_profile_views` | Candidato |
| `job_matches` | Matching |
| `notifications` | Notificações (após transform) |
| `notification_deliveries` | Notificações |
| `notification_preferences` | Notificações |
| `application_status_history` | Candidaturas |
| `application_profile_snapshots` | Candidaturas |
| `candidates` | Candidatos |
| `jobs` | Vagas |
| `applications` | Candidaturas |

### 6.2 Tabelas TRANSFORM

| Tabela | Transformação |
|--------|--------------|
| `companies` | Adicionar `tenant_id NOT NULL` |
| `jobs` | `company_relationship_id` → `company_id` |
| `notifications` | `user_id` → `recipient_person_id` |
| `domain_events` | Ajustar campos para V2.1 |

### 6.3 Tabelas NEW

Ver seção 5 para lista completa por domínio.

### 6.4 Tabelas REMOVER

| Tabela | Motivo |
|--------|--------|
| `profiles` (schema.sql) | Legado. Identity é `people` |
| `leads` | Não existe na V2.1 |
| `contact_requests` | Não existe na V2.1 |
| `webhooks` | Substituído por `domain_events` + n8n |
| `automation_queue` | Substituído por `domain_events` + n8n |
| `whatsapp_messages` | Logging deve ir para tabela de integração |
| `emails` | Logging deve ir para tabela de integração |
| `services` | Não existe na V2.1 |
| `tickets` | Substituído por `support_tickets` |

---

## 7. Invariantes

| ID | Regra | Validação |
|----|-------|-----------|
| INVARIANT-001 | `COUNT(people)_after = COUNT(people)_before` | `SELECT count(*) FROM people` |
| INVARIANT-002 | `COUNT(tenant_memberships)_after = COUNT(tenant_memberships)_before` | `SELECT count(*) FROM tenant_memberships` |
| INVARIANT-003 | `admin_master` continua global | `SELECT tenant_id FROM role_assignments WHERE role_id = (SELECT id FROM roles WHERE name = 'admin_master')` |
| INVARIANT-004 | Nenhuma FK aponta para entidade inexistente | `SELECT * FROM ... WHERE NOT EXISTS (SELECT 1 FROM ...)` |
| INVARIANT-005 | Nenhum dado de Tenant A é visível para Tenant B | RLS policies |
| INVARIANT-006 | `notifications` não possui dependência de `auth.users` | `SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id'` deve retornar 0 |
| INVARIANT-007 | `jobs.company_id` corresponde ao `company_id` derivado de `company_relationship_id` | `SELECT count(*) FROM jobs WHERE company_id NOT IN (SELECT company_id FROM company_relationships WHERE id = jobs.company_relationship_id)` |
| INVARIANT-008 | Nenhuma role legacy: `admin`, `empresa`, `candidato` | `SELECT count(*) FROM roles WHERE name IN ('admin', 'empresa', 'candidato')` |
| INVARIANT-009 | `people.auth_user_id` é único e não nulo para usuários autenticados | `SELECT count(*) FROM people WHERE auth_user_id IS NOT NULL GROUP BY auth_user_id HAVING count(*) > 1` |
| INVARIANT-010 | Todos os `tenant_id` em tabelas tenant-scoped referenciam tenant existente | `SELECT count(*) FROM X WHERE tenant_id NOT IN (SELECT id FROM tenants)` |

---

## 8. Fluxo Canônico de Autorização

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

### 8.1 AuthContext

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

### 8.2 ProtectedRoute

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

### 8.3 App routes

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

## 9. Domínio no Frontend

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

Acesso controlado por:

```text
role + permission
```

e, quando necessário, por contexto de domínio:

```text
requireCandidateContext
requireCompanyContext
requireEmployeeContext
requireSupplierContext
```

sem transformar o contexto em role.

---

## 10. First Login + LGPD

### 10.1 Fluxo

```text
Conta criada
    ↓
Primeiro login
    ↓
Terms of Use
    ↓
Privacy Policy
    ↓
Required Legal Acceptances
    ↓
Mandatory Password Change
    ↓
Security Configuration
    ↓
Application
```

### 10.2 Registro de Aceites

```text
person_id
document_type
version
accepted_at
ip
user_agent
```

Cada termo tem sua própria versão e aceite.

### 10.3 Documentos

- Termos de Uso
- Política de Privacidade
- Consentimentos LGPD aplicáveis

---

## 11. Matriz de Autorização Sugerida

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

## 12. Critérios de Aprovação

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

---

## 13. Estado Arquitetural Atual

```text
PRODUÇÃO js-empregos
├── Supabase       🔒 INTACTO
├── Dados          🔒 PRESERVADOS
├── Auth           🔒 INTACTO
├── DROP/RESET     ❌ BLOQUEADO
└── DB PUSH        ❌ BLOQUEADO

V2.1
├── Baseline                  ✅
├── Build Spec                ✅
├── AS-IS Inventory           ✅
├── Migration Reconciliation  ✅
├── AS-IS → V2.1 Mapping      ✅
├── Migration Contract        ✅
├── Business Rules            ✅
├── Architecture Contract     ✅ FECHADO AGORA
├── Migrator --analyze        ✅ 10/10
└── Frontend Contract         ⚠️ ainda há legado

DRY-RUN
└── ❌ BLOQUEADO
```

---

## 14. Próximos Passos

1. Inventário completo de objetos do banco (Tables, Functions, Triggers, Views, RLS, Constraints, Events)
2. Gap Analysis por domínio
3. Corrigir frontend authorization (sem mexer no banco)
4. Atualizar FRONTEND-BACKEND-CONTRACT-VALIDATION.md
5. Liberar frontend contract
6. Preparar dry-run descartável
7. Validação final
8. Autorização explícita para DROP

---

*Documento gerado para fins de contrato arquitetural. Não alterar nome da empresa "J&S Empregos LTDA" nem conteúdo do footer.*
