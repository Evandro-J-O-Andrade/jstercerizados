# RBAC-02 — Matriz de Capacidades por Setor

> **Fase:** Capacidades antes de roles/permissions
> **Data:** 2026-09-04
> **Status:** Aprovado após ajustes — pronto para RBAC-03

---

## 1. Níveis Funcionais de Capacidade

| Nível | Nome | Escopo | Descrição |
|-------|------|--------|-----------|
| 0 | Sistema | GLOBAL | `admin_master` — acesso total à plataforma |
| 1 | Tenant | TENANT | `tenant_admin` — acesso total ao tenant |
| 2 | Gestor | SETOR | Administra, aprova, configura, exporta |
| 3 | Supervisor | SETOR/EQUIPE | Supervisiona, aprova limitado, não configura |
| 4 | Profissional | SETOR | Executa operações do setor |
| 5 | Auxiliar | SETOR | Tarefas básicas sob supervisão |
| 6 | Aprendiz | SETOR | Consulta/execução supervisionada — **condição cadastral, NÃO role RBAC** |
| E | Especial | SELF | `candidato`, `viewer` — fora da hierarquia administrativa |

> **Importante:** Nível 6 (Aprendiz) é uma **condição funcional/cadastral**, não uma role RBAC.
> Um profissional pode ser "jovem aprendiz" no cadastro, mas sua role continua sendo `*_assistant`.

### Capacidades padrão por nível

| Ação | Gestor | Supervisor | Profissional | Auxiliar | Aprendiz |
|------|:------:|:----------:|:------------:|:--------:|:--------:|
| Visualizar | ✅ | ✅ | ✅ | ✅ | ✅ limitado |
| Criar | ✅ | ✅ | ✅ | ⚠️ limitado | ❌ |
| Editar | ✅ | ✅ | ✅ | ⚠️ limitado | ❌ |
| Excluir | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Aprovar | ✅ | ⚠️ limitado | ❌ | ❌ | ❌ |
| Publicar | ✅ | ✅ | ❌ | ❌ | ❌ |
| Exportar | ✅ | ⚠️ limitado | ❌ | ❌ | ❌ |
| Administrar | ✅ | ❌ | ❌ | ❌ | ❌ |
| Configurar | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 2. Regras de Escopo

| Escopo | Aplicação | Exemplo |
|--------|-----------|---------|
| GLOBAL | Toda a plataforma | `admin_master` |
| TENANT | Todo o tenant | `tenant_admin`, gestores |
| SETOR | Apenas seu setor | `rh_manager` vê apenas RH |
| EQUIPE | Apenas sua equipe | `supervisor` vê sua equipe |
| PRÓPRIO REGISTRO | Apenas seus dados | `candidato` vê apenas seus dados |

> **Nota:** Não existe escopo `HYBRID` como atributo de role.
> Uma role pode ter permissões com diferentes escopos:
> ```text
> finance_manager
>   finance.read      → SETOR
>   finance.approve   → SETOR
>   reports.read      → TENANT
>   reports.export    → TENANT
> ```
> O escopo efetivo é determinado pela combinação **Role × Permission × Contexto**.

---

## 3. Matriz de Capacidades por Setor

A matriz completa foi detalhada por setor nas seções 3.1 a 3.12.
Aqui está o resumo executivo:

### 3.1 RH (15 recursos, 48 ações)
- **Gestor:** CRUD completo em pessoas, funcionários, candidatos, vagas, processos, relatórios
- **Supervisor:** CRUD operacional, aprovação limitada, sem exclusão nem configuração
- **Profissional:** Leitura, criação, edição; sem exclusão nem aprovação
- **Auxiliar:** Leitura e criação limitada
- **Aprendiz:** Leitura limitada

### 3.2 Financeiro (8 recursos, 35 ações)
- **Gestor:** CRUD financeiro, aprovação, exportação, reconciliação, forecast
- **Supervisor:** Operações financeiras, relatórios; sem exclusão nem configuração
- **Profissional:** Execução financeira básica
- **Auxiliar:** Consulta e registro limitado

### 3.3 Faturamento (7 recursos, 25 ações)
- **Gestor:** CRUD faturas, cancelamento, exportação, relatórios
- **Supervisor:** Operações de faturamento
- **Profissional:** Execução básica
- **Auxiliar:** Consulta e registro limitado

### 3.4 Contabilidade (8 recursos, 22 ações)
- **Gestor:** Plano de contas, lançamentos, fechamento, relatórios
- **Supervisor:** Operações contábeis
- **Profissional:** Execução contábil básica
- **Auxiliar:** Consulta limitada

### 3.5 Fiscal (8 recursos, 18 ações)
- **Gestor:** Notas fiscais, emissão, cancelamento, relatórios
- **Supervisor:** Operações fiscais
- **Profissional:** Consulta e registro
- **Auxiliar:** Consulta limitada

### 3.6 Operações (12 recursos, 42 ações)
- **Gestor:** Ordens de serviço, tarefas, empresas, contratos, produtos, compras, estoque, tickets, relatórios
- **Supervisor:** Operações gerais
- **Profissional:** Execução operacional
- **Auxiliar:** Tarefas básicas

### 3.7 Estoque (9 recursos, 22 ações)
- **Gestor:** Produtos, movimentações, compras, recebimentos, relatórios
- **Supervisor:** Controle de estoque
- **Profissional:** Operações de almoxarifado
- **Auxiliar:** Consulta e registro limitado

### 3.8 Segurança (4 recursos, 8 ações)
- **Gestor:** Eventos de segurança, pessoas, documentos, relatórios
- **Supervisor:** Monitoramento básico
- **Profissional:** Consulta de eventos

### 3.9 Facilities (4 recursos, 13 ações)
- **Gestor:** Ordens de serviço, tarefas, documentos, relatórios
- **Supervisor:** Operações de facilities
- **Profissional:** Execução de serviços

### 3.10 Comercial (9 recursos, 27 ações)
- **Gestor:** Empresas, contratos, pedidos, recebimentos, ordens, tickets, relatórios
- **Supervisor:** Operações comerciais
- **Profissional:** Execução comercial

### 3.11 TI (7 recursos, 23 ações)
- **Gestor:** Roles, pessoas, arquivos, integrações, eventos de segurança
- **Supervisor:** Operações de TI
- **Profissional:** Suporte técnico básico

### 3.12 Suporte (4 recursos, 12 ações)
- **Gestor:** Tickets, chat, dashboard
- **Supervisor:** Atendimento supervisionado
- **Profissional:** Suporte ao usuário

---

## 4. Gaps Consolidados

### 4.1 Resumo

| Categoria | Quantidade | Descrição |
|-----------|-----------|-----------|
| 🔴 Roles novas efetivas | 28 | Funções organizacionais que precisam existir como roles canônicas |
| 🟡 Permissões órfãs | 13 | Existem no banco mas não atribuídas — **tratar no RBAC-04** |
| 🟡 Permissões perigosas | 3 | Atribuições indevidas em roles existentes — **tratar no RBAC-04** |
| 🔵 Cargos não mapeados | 8 | `auxiliar_limpeza`, `zelador`, `controlador_acesso`, etc. |
| 🟣 Regras especiais | 2 | `candidato` (self-scope), `admin_master` (global-scope) |

### 4.2 Roles Novas Efetivas (28)

**Gestores (3):**
| Setor | Role Nova |
|-------|-----------|
| Comercial | `commercial_manager` |
| TI | `it_manager` |
| Suporte | `support_manager` |

**Supervisores (12):**
| Setor | Role Nova |
|-------|-----------|
| RH | `rh_supervisor` |
| Financeiro | `finance_supervisor` |
| Faturamento | `billing_supervisor` |
| Contabilidade | `accounting_supervisor` |
| Fiscal | `fiscal_supervisor` |
| Operações | `operations_supervisor` |
| Estoque | `stock_supervisor` |
| Segurança | `security_supervisor` |
| Facilities | `facilities_supervisor` |
| Comercial | `commercial_supervisor` |
| TI | `it_supervisor` |
| Suporte | `support_supervisor` |

**Profissionais novas ou rename:**
| Setor | Role | Tipo |
|-------|------|------|
| RH | `rh` | Nova |
| TI | `it_operator` | Rename de `it_admin` |
| Suporte | `support_agent` | Rename de `support` |
| Operações | `operations_operator` | Rename de `operator` |

**Resumo de contagem:**
- Roles novas efetivas: **28** (3 gestores + 12 supervisores + 1 profissional + 12 auxiliares)
- Roles por rename/depreciação: **3** (`it_operator`, `support_agent`, `operations_operator`)
- Roles existentes mantidas: **2** (`commercial`, `lawyer`)

**Auxiliares (12):**
| Setor | Role Nova |
|-------|-----------|
| RH | `rh_assistant` |
| Financeiro | `finance_assistant` |
| Faturamento | `billing_assistant` |
| Contabilidade | `accounting_assistant` |
| Fiscal | `fiscal_assistant` |
| Estoque | `stock_assistant` |
| Operações | `operations_assistant` |
| Facilities | `facilities_assistant` |
| Segurança | `security_assistant` |
| Comercial | `commercial_assistant` |
| TI | `it_assistant` |
| Suporte | `support_assistant` |

**Total: 28 roles novas efetivas** (3 gestores + 12 supervisores + 1 profissional + 12 auxiliares)

### 4.3 Roles que Precisam de Rename/Depreciação

| Role Atual | Nova Role | Motivo | Estratégia |
|------------|-----------|--------|------------|
| `it_admin` | `it_operator` | É operacional, não gestor | Criar `it_manager` + depreciar `it_admin` |
| `support` | `support_agent` | Nome correto, mas falta gestor | Criar `support_manager` + depreciar `support` |
| `operator` | `operations_operator` | Muito genérico | Criar `operations_supervisor` + `operations_assistant` + depreciar `operator` |

**Ciclo de depreciação:**
```text
ACTIVE → DEPRECATED → LEGACY/RETIRED
```
- Role depreciada não recebe novos assignments
- Mantém histórico existente
- Permite migração gradual

### 4.4 Gaps de Role × Permission (RBAC-04)

Estes gaps **não são do RBAC-02**. Eles serão tratados no RBAC-04:

**Permissões órfãs (13):**
| Permissão | Recurso | Ação | Possível Role |
|-----------|---------|------|---------------|
| `permissions.create` | permissions | create | `tenant_admin` |
| `permissions.update` | permissions | update | `tenant_admin` |
| `permissions.delete` | permissions | delete | `tenant_admin` |
| `people.disable` | people | disable | `tenant_admin`, `rh_manager` |
| `jobs.export` | jobs | export | `rh_manager` |
| `recruitment.close` | recruitment | close | `rh_manager` |
| `contracts.export` | contracts | export | `commercial_manager` |
| `companies.convert` | companies | convert | `commercial_manager` |
| `finance.collections.manage` | finance | collections.manage | `finance_manager` |
| `stock_movements.export` | stock_movements | export | `stock_manager` |
| `audit.filter` | audit | filter | `tenant_admin` |
| `security_events.export` | security_events | export | `it_manager` |
| `documents.export` | documents | export | `tenant_admin` |

**Permissões perigosas (3):**
| Permissão | Role Atual | Risco | Recomendação RBAC-04 |
|-----------|------------|-------|---------------------|
| `finance.delete` | `finance` | Exclusão por analista | Remover de `finance`, manter em `finance_manager` |
| `accounting.entries.delete` | `accountant` | Exclusão de lançamento por profissional | Remover de `accountant`, manter em `accounting_manager` |
| `people.disable` | Não atribuída | N/A | Atribuir a `tenant_admin` e `rh_manager` apenas |

> **Nota:** Não removeremos estas permissões do banco.
> Apenas removeremos a atribuição indevida da role.
> A permissão permanece disponível para role autorizada.

---

## 5. Decisões Tomadas

### 5.1 Aprendiz é condição cadastral, não role RBAC
Tratado como nível funcional. Um profissional pode ser "jovem aprendiz" no cadastro, mas sua role continua sendo `*_assistant`.

### 5.2 `candidato` e `viewer` são roles especiais
Fora da hierarquia administrativa:
- `candidato` → escopo `SELF`
- `viewer` → escopo `SELF` ou conforme contrato atual

### 5.3 Estratégia de rename: criar nova + depreciar antiga
- Preserva rastreabilidade
- Não quebra assignments existentes
- Não apaga histórico/auditoria
- Role depreciada não recebe novos assignments

### 5.4 Não automatizar atribuição de permissões órfãs
Cada permissão órfã será avaliada individualmente no RBAC-04.

### 5.5 RBAC-03 será estritamente canônico
Somente definição de roles:
- `role_name`, `slug`, `level`, `sector`, `scope`, `status`
- `legacy_role` / `replacement_role` quando houver depreciação

**Não atribuir permissões no RBAC-03.**
**Não alterar RLS no RBAC-03.**
**Não mexer no frontend no RBAC-03.**
**Não migrar assignments no RBAC-03**, salvo mínimo indispensável para depreciação.

---

## 6. Compatibilidade com Gates Anteriores

| Gate | Status | Compatibilidade |
|------|--------|----------------|
| RBAC-01 | ✅ Concluído | `admin_master` global com `tenant_id = NULL` |
| RBAC-02 | ✅ Aprovado | Capacidades definidas por setor/nível |
| RBAC-03 | ⏭️ Próximo | Roles canônicas — sem permissões |
| RBAC-04 | 🔒 | Role × Permission × Scope |
| RBAC-05 | 🔒 | Migration idempotente |
| RBAC-06 | 🔒 | Runtime + RLS |

---

## 7. Próximos Passos

### RBAC-03 — Canonical Roles
**Estrutura:**
```text
role_name
slug
level
sector
scope
status
legacy_role (opcional)
replacement_role (opcional)
```

**Ações:**
- Criar 28 roles novas efetivas
- Depreciar 3 roles antigas (`it_admin` → `it_operator`, `support` → `support_agent`, `operator` → `operations_operator`)
- Definir ciclo: `ACTIVE → DEPRECATED → LEGACY/RETIRED`
- Não atribuir permissões
- Não alterar RLS
- Não migrar assignments (salvo depreciação mínima)

### RBAC-04 — Role × Permission × Scope
- Atribuir permissões existentes às novas roles
- Remover atribuições perigosas
- Atribuir permissões órfãs prioritárias
- Definir escopo por permissão, não por role

### RBAC-05 — Migration Idempotente
- Migration que pode ser executada múltiplas vezes
- Preserva assignments existentes
- Não apaga histórico

### RBAC-06 — Runtime
- Validar login → AuthContext → membership → role → permissions → menu → route → ação
- Atualizar frontend
- Validar RLS

---

**Documento fechado em:** 2026-09-04
**Ajustes aplicados:** 4 (contagem de roles, separação role/permission gap, remoção de HYBRID, aprendiz como condição cadastral)
**Próximo gate:** RBAC-03 — Canonical Roles
