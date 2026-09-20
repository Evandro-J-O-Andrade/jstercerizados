# KILO — IMPLEMENTAÇÃO BANCO CANÔNICO V2.1

## Objetivo

Reconstruir o banco Supabase do projeto J&S Empregos/SaaS em V2.1, alinhando:

- banco atual (AS-IS)
- regras de negócio
- frontend
- Auth
- RBAC
- multi-tenancy
- Functions/RPC
- Triggers
- RLS
- Views
- Storage
- Audit
- Domain Events
- Outbox
- n8n

**Regra principal:** NÃO executar DROP em produção antes de todos os gates de validação.

---

# FASE 1 — INVENTÁRIO AS-IS

Levantar o banco atual e o repositório.

Inventariar:

- tables
- columns
- PK/FK
- unique/check constraints
- indexes
- enums/types
- extensions
- views/materialized views
- functions/RPC
- triggers
- RLS/policies
- storage buckets/policies
- audit
- security events
- domain events
- outbox
- webhooks
- queues/automations
- cron/jobs

Criar:

`docs/DATABASE-ASIS-INVENTORY-V2.1.md`

Nenhum objeto importante pode ser descartado sem classificação.

---

# FASE 2 — AUDITORIA FRONTEND ↔ DATABASE

Mapear:

- routes
- AuthProvider
- contexts
- role guards
- tenant selection
- hooks
- services
- Supabase calls
- RPC calls
- Storage
- types TS/TSX
- forms
- chat
- notifications
- dashboards

Verificar especialmente:

```text
auth.users
people
tenant_memberships
profiles.role
tenant_memberships.user_id
tenant_memberships.person_id
```

Resolver qualquer divergência antes do build.

Criar:

`docs/FRONTEND-DATABASE-CONTRACT-V2.1.md`

---

# FASE 3 — INVENTÁRIO DA LÓGICA DO BANCO

Para cada Function/RPC registrar:

- nome
- parâmetros
- retorno
- finalidade
- caller
- tabelas utilizadas
- tenant validation
- authorization
- SECURITY DEFINER
- dependências
- status

Classificar:

```text
PRESERVE
REWRITE
CONSOLIDATE
DEPRECATE
CONFLICT
```

Para cada Trigger registrar:

- tabela
- evento
- timing
- function
- efeito
- dependências
- necessidade no V2.1

Criar:

`docs/DATABASE-LOGIC-INVENTORY-V2.1.md`

**Não apagar Functions/RPC/Triggers sem análise.**

---

# FASE 4 — GAP ANALYSIS

Cruzar:

```text
AS-IS
+
REGRAS DE NEGÓCIO
+
FRONTEND
+
V2.1
```

Classificar:

- 🟢 EXISTS
- 🟡 REWRITE
- 🔵 NEW
- 🟠 LEGACY
- 🟣 CONFLICT

Qualquer `CONFLICT` impede o SQL definitivo até ser resolvido.

Criar:

`docs/V21-DATABASE-GAP-ANALYSIS.md`

---

# FASE 5 — FECHAR MATRIZ CANÔNICA

Para cada entidade definir:

- tabela
- domínio
- tenant scoped
- PK
- FK
- constraints
- indexes
- RLS
- policies
- audit
- history
- Function/RPC
- Trigger
- Event
- Outbox
- Storage
- View

Domínios mínimos:

```text
core
tenancy
rbac
crm
rh
recruitment
employees
services
contracts
suppliers
inventory
custody
purchasing
tasks
support
notifications
chat
storage
finance
fiscal
documents
events
outbox
audit
security
lgpd
```

---

# FASE 6 — RESPONSABILIDADE ARQUITETURAL

Usar esta regra:

| Necessidade | Camada |
|---|---|
| Dado | Table |
| Integridade | Constraint |
| Segurança | RLS |
| Regra transacional | Function/RPC |
| Histórico automático | Trigger |
| Auditoria | Audit |
| Consulta | View |
| Comunicação | Domain Event |
| Entrega confiável | Outbox |
| WhatsApp/E-mail | n8n |
| Arquivos | Storage |

**n8n não é autoridade da regra de negócio.**

**Trigger não deve chamar serviço externo diretamente.**

---

# FASE 7 — BUILD SQL V2.1

Usar o contrato:

`supabase/specs/V2.1-BASELINE-DEFINITIVE.sql`

Manter SQL modular.

Ordem recomendada:

```text
00 extensions
01 core
02 tenancy
03 rbac
04 crm
05 rh
06 recruitment
07 employees
08 services
09 contracts
10 suppliers
11 inventory
12 custody
13 purchasing
14 tasks
15 support
16 notifications
17 chat
18 storage
19 finance
20 fiscal
21 documents
22 domain_events
23 outbox
24 audit
25 security
26 lgpd
27 functions
28 triggers
29 indexes
30 views
31 rls
32 seed
33 validation
```

Se a estrutura atual dos arquivos V2.1 usar outra numeração, preservar a estrutura existente e apenas aplicar a ordem correta de dependências.

---

# FASE 8 — REGRAS CRÍTICAS

## People-First

Fonte canônica:

```text
people
 ↓
tenant_memberships
 ↓
role_assignments
 ↓
permissions
```

Não usar `profiles.role` como fonte principal de autorização.

## Multi-tenant

Todo acesso precisa respeitar tenant.

Teste obrigatório:

```text
tenant A → vê A
tenant A → NÃO vê B
```

## RH

```text
candidate
 ↓
job
 ↓
application
 ↓
interview
 ↓
process
 ↓
hire
```

Histórico de candidatura deve ser imutável.

Consentimento LGPD deve ser rastreável.

Currículos/documentos sensíveis devem ficar em Storage privado.

## Empresas

Uma `company` pode possuir múltiplos relacionamentos:

```text
CUSTOMER
PARTNER
SUPPLIER
PROVIDER
```

Não duplicar empresa por tipo.

## Contratos

```text
company
 ↓
contract
 ↓
service
 ↓
service_order
 ↓
financial
```

## Estoque/Custódia

Operações críticas devem ser atômicas.

Exemplo:

```text
register_asset_delivery()
```

deve garantir consistência entre estoque, movimentação, custódia e evento.

## Chat

Separar:

```text
AI conversation
Human chat
Handoff
```

## Financeiro x Fiscal

Manter os domínios separados.

## First Login

Fluxo:

```text
login
 ↓
first_login_state
 ↓
legal acceptance
 ↓
password change
 ↓
security setup
 ↓
access
```

Não permitir bypass apenas alterando a URL.

---

# FASE 9 — EVENTOS E OUTBOX

Fluxo:

```text
Function/RPC
 ↓
transaction
 ├─ state change
 ├─ audit/history
 └─ domain_event
       ↓
     outbox
       ↓
      n8n
       ↓
WhatsApp / E-mail / integração
```

Eventos precisam de idempotência.

Não permitir:

```text
evento duplicado
→ operação financeira duplicada
→ estoque duplicado
→ WhatsApp duplicado
```

---

# FASE 10 — STORAGE

Validar buckets e policies para:

- currículos
- contratos
- documentos
- anexos
- arquivos fiscais

Documentos sensíveis não devem usar URL pública.

Validar:

- tenant isolation
- signed URLs
- policies
- permissões
- limites

---

# FASE 11 — DRY-RUN

Aplicar o banco V2.1 em ambiente descartável.

Executar:

1. extensions
2. types/enums
3. tables
4. constraints
5. functions
6. triggers
7. indexes
8. views
9. RLS
10. policies
11. storage
12. seed
13. validation

O dry-run precisa ser reproduzível do zero.

---

# FASE 12 — DATABASE VALIDATION SUITE

Criar:

`docs/DATABASE-VALIDATION-SUITE-V2.1.md`

Validar:

### Identity
- people/auth
- memberships
- roles
- permissions

### Tenant
- isolamento entre tenants

### RH
- candidate
- job
- application
- interview
- hiring

### CRM
- companies
- relationships
- contacts

### Contracts
- criação
- ativação
- vencimento
- renovação
- histórico

### Inventory
- entrada
- saída
- transferência
- custódia
- devolução

### Support
- ticket
- assignment
- SLA
- resolution

### Chat
- AI
- handoff
- human assignment

### Events
- emissão
- outbox
- retry
- idempotência

### Audit
- actor
- tenant
- entity
- action
- before/after
- timestamp

### LGPD
- consent
- legal acceptance
- acesso/retention

### First Login
- password change
- legal acceptance
- no bypass

---

# FASE 13 — FRONTEND CONTRACT TEST

Com o banco descartável funcionando:

Testar:

```text
AuthProvider
 ↓
PortalRuntimeProvider
 ↓
EnterpriseShell
 ↓
Tenant
 ↓
RBAC
 ↓
Routes
 ↓
CRUD
 ↓
RPC
 ↓
Storage
```

Nenhuma rota pode depender de tabela/coluna/RPC legacy que não esteja no contrato V2.1.

---

# FASE 14 — GATE DE PRODUÇÃO

Só prosseguir quando todos estiverem verdes:

```text
AS-IS              ✅
Frontend mapping   ✅
Logic inventory    ✅
GAP                ✅
TO-BE              ✅
SQL                ✅
Dry-run            ✅
Validation         ✅
Frontend contract  ✅
```

Criar:

`docs/PRODUCTION-REBUILD-CHECKLIST-V2.1.md`

---

# FASE 15 — BACKUP

Antes do DROP:

1. gerar backup completo;
2. verificar se o backup é válido;
3. registrar timestamp;
4. guardar referência segura;
5. confirmar possibilidade de restore.

Sem backup verificável, NÃO executar DROP.

---

# FASE 16 — DROP + BUILD

Somente após aprovação explícita.

Ordem:

```text
BACKUP
 ↓
VERIFY BACKUP
 ↓
DROP
 ↓
BUILD V2.1
 ↓
SEED
 ↓
PROVISION
 ↓
VALIDATION
```

O DROP é um gate manual e nunca deve ser executado automaticamente pelo Kilo.

---

# FASE 17 — PROVISIONAMENTO

Após schema validado:

- tenants
- people
- memberships
- roles
- admin
- first-login
- Storage
- policies

Credenciais não podem entrar no Git.

---

# FASE 18 — PÓS-BUILD

Validar:

```text
Frontend
Auth
Tenant
RBAC
CRUD
RPC
RLS
Storage
Events
Outbox
n8n
Chat
Notifications
RH
CRM
Contracts
Services
Inventory
Reports
Audit
LGPD
```

---

# ENTREGÁVEIS

Criar/manter:

```text
docs/
├── DATABASE-ASIS-INVENTORY-V2.1.md
├── FRONTEND-DATABASE-CONTRACT-V2.1.md
├── DATABASE-LOGIC-INVENTORY-V2.1.md
├── V21-DATABASE-GAP-ANALYSIS.md
├── V21-DATABASE-FINAL-MATRIX.md
├── V21-DATABASE-ARCHITECTURE-DECISIONS.md
├── DATABASE-VALIDATION-SUITE-V2.1.md
└── PRODUCTION-REBUILD-CHECKLIST-V2.1.md

supabase/specs/
└── V2.1-BASELINE-DEFINITIVE.sql
```

---

# INSTRUÇÃO FINAL AO KILO

Não tente construir tudo de uma vez.

Execute **uma fase por vez**.

Ao terminar cada fase:

1. executar validações;
2. registrar resultado;
3. listar erros;
4. corrigir;
5. apresentar o gate;
6. somente então avançar.

## Proibições

```text
NÃO INVENTAR
NÃO APAGAR SEM REGISTRAR
NÃO DUPLICAR ENTIDADES
NÃO ALTERAR PRODUÇÃO ANTES DOS GATES
NÃO PERDER FUNCTIONS/RPC/TRIGGERS
NÃO CONFIAR NO FRONTEND PARA SEGURANÇA
NÃO USAR n8n COMO REGRA DE NEGÓCIO
NÃO USAR TRIGGER PARA HTTP EXTERNO
NÃO EXECUTAR DROP AUTOMATICAMENTE
```

## Resultado esperado

Um único banco canônico:

```text
AS-IS
  +
BUSINESS RULES
  +
FRONTEND
  +
V2.1
     ↓
CANONICAL DATABASE
     ↓
SUPABASE
```

**O objetivo é reconstruir o banco sem perder o que já existe, corrigindo conflitos e deixando o frontend e o backend sob o mesmo contrato.**
