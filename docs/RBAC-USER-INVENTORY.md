# RBAC User Inventory

**Data:** 2026-08-25  
**Atualizado em:** 2026-09-30 — seções 6 a 11 (desenho do seed de contas institucionais + auditoria read-only, **não executado**)  
**Scope:** Usuários ativos no Supabase (auth + pessoas + membros + roles + permissões)

> ⚠️ **As seções 1 a 5 são a auditoria de 2026-08-25 e contêm números
> DESATUALIZADOS.** O SELECT de 2026-09-30 (§11) mediu `tenant_admin` = **168**
> (não 86) e `finance_manager` = **41** (não 0). Não use §1–§5 para decisão.
> Use §11. As seções 6 a 11 são o desenho do seed e **não alteraram o banco**.
> Catálogo de roles referenciado: `RBAC-04-INVENTORY.md`. Nada aqui autoriza
> INSERT, UPDATE, DELETE ou migration.

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

> 🔴 **SUPERADO — ver §7.1 e §11.** A medição de 2026-08-25 abaixo registrou
> **0 permissões**. O SELECT de 2026-09-30 mediu **41 permissões**, role ativa,
> cobrindo `finance.*`, `billing`, `accounting.dashboard` e `fiscal.dashboard`.
> O alerta de "usuário não conseguirá acessar nenhum recurso" **não se aplica
> mais**. Na matriz, `financeiro@` passa a `REUTILIZAR`.

**Contexto:** Tenant `J&S Empregos LTDA`  
**Escopo:** Tenant  
**Total de permissões:** 0

> ⚠️ **ALERTA:** A role `finance_manager` **não possui permissões** cadastradas em `role_permissions`.  
> O usuário **não conseguirá acessar nenhum recurso** enquanto essa matriz não for populada.

---

## 3. Inventário de Roles no Banco

> 🔴 **SUPERADO — ver §11.2 e §11.3.** Esta tabela mediu apenas 15 roles em
> 2026-08-25. O banco tem **53 roles**, das quais **29 têm ZERO permissões**.
> `tenant_admin` = 168 (não 86) · `finance_manager` = 41 (não 0).

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

---

---

# 6. Contas institucionais — lista operacional corrigida (2026-09-30)

## 6.1 Separação humanos × técnicas

O critério **não é "possui e-mail institucional"**. É **"é uma pessoa que faz
login"**. Isso separa identidade humana de infraestrutura de comunicação, e é
pré-requisito para o futuro Dispatcher/Orchestrator/Master.

```text
                    J&S Empregos LTDA
                            │
                 ┌──────────┴──────────┐
                 │                     │
           CONTAS HUMANAS       CONTAS TÉCNICAS
                 │                     │
            auth.users        noreply@jsempregos.com.br
                 │           notificacoes@jsempregos.com.br
              people                     │
                 │              configuração de remetente
        tenant_memberships                │
                 │              (fora do schema inventariado)
        role_assignments
                 │
               role
                 │
           permissions
```

## 6.2 Contas humanas — 19

|   # | E-mail                           | Nome inicial         | Área          |
| --: | -------------------------------- | -------------------- | ------------- |
|   1 | `adm@jsempregos.com.br`          | Administração        | Administração |
|   2 | `atendimento@jsempregos.com.br`  | Atendimento          | Atendimento   |
|   3 | `candidatos@jsempregos.com.br`   | Candidatos           | Candidatos    |
|   4 | `comercial@jsempregos.com.br`    | Comercial            | Comercial     |
|   5 | `contabil@jsempregos.com.br`     | Contabilidade        | Contábil      |
|   6 | `contato@jsempregos.com.br`      | Contato              | Geral         |
|   7 | `diretoria@jsempregos.com.br`    | Diretoria            | Diretoria     |
|   8 | `dp@jsempregos.com.br`           | Departamento Pessoal | DP            |
|   9 | `empresas@jsempregos.com.br`     | Empresas             | Empresas      |
|  10 | `financeiro@jsempregos.com.br`   | Financeiro           | Financeiro    |
|  11 | `fornecedores@jsempregos.com.br` | Fornecedores         | Suprimentos   |
|  12 | `gestor@jsempregos.com.br`       | Gestor               | Gestão        |
|  13 | `juridico@jsempregos.com.br`     | Jurídico             | Jurídico      |
|  14 | `lgpd@jsempregos.com.br`         | LGPD                 | Privacidade   |
|  15 | `marketing@jsempregos.com.br`    | Marketing            | Marketing     |
|  16 | `parcerias@jsempregos.com.br`    | Parcerias            | Parcerias     |
|  17 | `rh@jsempregos.com.br`           | Recursos Humanos     | RH            |
|  18 | `selecao@jsempregos.com.br`      | Seleção              | Recrutamento  |
|  19 | `suporte@jsempregos.com.br`      | Suporte              | Suporte       |

> **Decisão registrada:** `candidatos@jsempregos.com.br` é o endereço definitivo.
> A grafia anterior `canditatos@` foi descartada e **não** é mais candidata nem
> pendência de revisão.

**Estado:** 2 já existentes (`financeiro@`, `gestor@`) · 17 potencialmente novas.

## 6.3 Contas técnicas — 2, fora do seed de usuários

| E-mail                           | Classificação        | `auth.users` | `people` | membership | role_assignment |
| -------------------------------- | -------------------- | ------------ | -------- | ---------- | --------------- |
| `noreply@jsempregos.com.br`      | Remetente de sistema | ❌ não criar | ❌       | ❌         | ❌              |
| `notificacoes@jsempregos.com.br` | Remetente de sistema | ❌ não criar | ❌       | ❌         | ❌              |

**GAP arquitetural aberto:** não existe, no schema inventariado, tabela ou
configuração que hospeda remetentes de sistema. Hoje
`notificacoes@jsempregos.com.br` é SMTP Sender definido em
`docs/AUTH-EMAIL-SMTP.md` via variável de ambiente — fora do banco. **Nenhuma
tabela nova é criada nesta etapa**; o GAP fica registrado para o desenho do
Dispatcher/Orchestrator/Master.

---

---

# 7. Matriz de role — contas humanas

> **Números abaixo confirmados por SELECT direto em 2026-09-30** (§11).
> Substituem qualquer valor `n/d` ou contagem herdada de 2026-08-25.

**Regra de decisão aplicada** (4 condições cumulativas):

```text
role existe  ∧  role ativa  ∧  role_permissions > 0  ∧  semanticamente compatível
    → CRIAR / REUTILIZAR
senão → GAP / RECONCILIAR
```

Legenda: `REUTILIZAR` (conta existe) · `CRIAR` (conta não existe, role
adequada) · `RECONCILIAR` (divergência semântica, decisão humana) ·
`GAP` (role inexistente, inativa ou com **0 permissões**).

|   # | E-mail          | Role              | Perms | Status | Tenant | Ação                                                                                                                           |
| --: | --------------- | ----------------- | ----: | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
|   1 | `adm@`          | `tenant_admin`    |   168 | active | J&S    | **RECONCILIAR** — role válida e populada, mas disputada com `gestor@` e `diretoria@`. Decisão: role compartilhada é aceitável? |
|   2 | `atendimento@`  | `support_agent`   |    11 | active | J&S    | **CRIAR** — cobre `support_tickets`, `chat`, `people`                                                                          |
|   3 | `candidatos@`   | `recruiter`       |    29 | active | J&S    | **CRIAR** — mesma role de `selecao@`; roles são compartilháveis, decidir se são o mesmo perfil                                 |
|   4 | `comercial@`    | `commercial`      |    24 | active | J&S    | **CRIAR** — cobre `companies`, `contracts`, `purchase_orders`                                                                  |
|   5 | `contabil@`     | `accountant`      |    25 | active | J&S    | **CRIAR** — cobertura contábil completa (`accounting.*`)                                                                       |
|   6 | `contato@`      | —                 |     — | —      | J&S    | **GAP** — área "Geral" não mapeia em setor. `viewer` (14) é a única alternativa populada                                       |
|   7 | `diretoria@`    | `tenant_admin`    |   168 | active | J&S    | **RECONCILIAR** — 3 contas disputando 1 role                                                                                   |
|   8 | `dp@`           | —                 |     — | —      | J&S    | **GAP** — `rh` e `rh_assistant` existem mas têm **0 permissões**. `rh_manager` (51) é nível gestor                             |
|   9 | `empresas@`     | `commercial`      |    24 | active | J&S    | **CRIAR** — `companies` está no escopo; role compartilhada com `comercial@`                                                    |
|  10 | `financeiro@`   | `finance_manager` |    41 | active | J&S    | **REUTILIZAR** — ⚠️ ver §7.1: a premissa "0 permissões" do 08/25 **está errada**                                               |
|  11 | `fornecedores@` | —                 |     — | —      | J&S    | **GAP** — não existe setor `procurement`. `stock_manager` (12) controla estoque, não compras                                   |
|  12 | `gestor@`       | `tenant_admin`    |   168 | active | J&S    | **REUTILIZAR** — existe e opera (último login 2026-08-27)                                                                      |
|  13 | `juridico@`     | `lawyer`          |    10 | active | J&S    | **CRIAR** — cobre `contracts`, `documents`                                                                                     |
|  14 | `lgpd@`         | —                 |     — | —      | J&S    | **GAP** — não existe setor `privacy`. `security_manager` tem 7 permissões e é segurança, não privacidade                       |
|  15 | `marketing@`    | —                 |     — | —      | J&S    | **GAP** — não existe setor `marketing`                                                                                         |
|  16 | `parcerias@`    | —                 |     — | —      | J&S    | **GAP** — não existe setor `partnerships`                                                                                      |
|  17 | `rh@`           | `rh_manager`      |    51 | active | J&S    | **CRIAR** — cobertura RH completa                                                                                              |
|  18 | `selecao@`      | `recruiter`       |    29 | active | J&S    | **CRIAR**                                                                                                                      |
|  19 | `suporte@`      | —                 |     — | —      | J&S    | **GAP** — `support_manager` existe mas tem **0 permissões**. Só `support_agent` (11) é populada, e é a de `atendimento@`       |

**Resumo:** 2 `REUTILIZAR` · 8 `CRIAR` · 2 `RECONCILIAR` · 7 `GAP`.

## 7.1 Correção material: `finance_manager` não tem 0 permissões

O inventário de 2026-08-25 (§2.3, §3) registrava `finance_manager` com
**0 permissões**. O SELECT de 2026-09-30 mediu **41**. A premissa "0 permissões"
**não se sustenta** e a decisão muda:

```text
antes:  finance_manager = 0  →  não reutilizar  →  RECONCILIAR / GAP
agora:  finance_manager = 41, active, cobre finance + accounting.dashboard
                             + fiscal.dashboard + billing  →  REUTILIZAR
```

Os recursos efetivamente cobertos: `accounting.dashboard`, `billing`,
`companies`, `dashboard`, `files`, `finance`, `finance.accounts_payable`,
`finance.accounts_receivable`, `finance.billing`, `finance.cashflow`,
`finance.dashboard`, `finance.reports`, `finance.suppliers`,
`fiscal.dashboard`, `fiscal.invoices`, `people`, `reports`.

O mesmo vale para `tenant_admin`: **168**, não 86. A divergência apontada na
solicitação está **confirmada e explicada** — o inventário de 08/25 é anterior a
um repovoamento de `role_permissions`.

**Nenhuma linha de `role_permissions` foi alterada.** Apenas medida.

## 7.2 Achado de maior impacto: 29 das 53 roles estão vazias

```text
53 roles · 24 com permissões · 29 com ZERO permissões (55%)
```

Todas as famílias `*_assistant` e `*_supervisor` (24 roles) estão vazias, além
de `commercial_manager`, `it_manager`, `rh`, `rh_assistant` e `support_manager`.

Consequência: **`rh` e `support_manager` — as duas roles que a matriz anterior
propunha para `dp@` e `suporte@` — não são utilizáveis.** Isso converteu 2
`CRIAR` em `GAP`.

## 7.3 Roles compartilhadas: é permitido pelo schema

`uq_role_assignment_person_role_tenant` é única por
`(person_id, role_id, tenant_id)`. Isso impede a **mesma pessoa** de receber a
mesma role duas vezes no mesmo tenant, mas **não** impede várias pessoas de
compartilhar uma role. O banco já comprova: `gestor@` e `teste.tenantadmin@`
possuem ambos `tenant_admin`.

Portanto, para `adm@` / `diretoria@` / `gestor@` a pergunta **não é técnica** —
o schema permite. A questão é se a **semântica** de "administração", "diretoria"
e "gestão" podem realmente recair na mesma role. Isso é decisão de negócio,
mantida como `RECONCILIAR`.

---

---

# 8. Algoritmo idempotente — nível de projeto

Pseudo-contrato. **Não é código executável. Não executar.**

### 8.1 Entrada

```text
contas_humanas[19]  (email, nome_inicial, área)
role_alvo[email]    (§7 — pode ser null quando GAP)
tenant_alvo         = "J&S Empregos LTDA"
```

### 8.2 Invariante

> Executar o seed N vezes sobre o mesmo banco produz o mesmo estado.
> Nenhuma execução duplica `auth.users`, `people`, `tenant_memberships` ou
> `role_assignments`. Nenhuma execução altera uma linha existente sem que a
> divergência seja classificada como `RECONCILIAR` e bloqueada.

### 8.3 Fluxo por conta

```text
para cada conta em contas_humanas:

  1. NORMALIZAR
     email := lower(trim(email))

  2. role := role_alvo[email]
     se role == null:
         registrar GAP
         proximo                       ← sem escrita
     se role.status == 'deprecated':
         role := role.replacement_role_id
     se role não existe em `roles`:
         registrar GAP
         proximo                       ← sem escrita

  3. VERIFICAR auth.users
     u := select em auth.users por email
     se u existe:
         ir para 5 (REUTILIZAR)
     se u não existe:
         ir para 4

  4. CRIAR identidade
     criar auth.users(u)              ← senha por cofre, nunca no seed
     p := upsert people(auth_user_id = u.id, email, full_name = nome_inicial)
         se people já existe com email e auth_user_id ≠ u.id:
             registrar RECONCILIAR     ← humanouve collision
             proximo                   ← sem escrita
     upsert tenant_memberships(p, tenant_alvo)
     ir para 6

  5. RECONCILIAR identidade existente
     p := select people por auth_user_id = u.id
     se p não existe:
         registrar RECONCILIAR
         proximo
     se p.email ≠ email:
         registrar RECONCILIAR         ← e-mail divergente em people
         proximo
     se membership(p, tenant_alvo) não existe:
         registrar RECONCILIAR
         proximo

  6. RESOLVER role_assignment
     m := select tenant_memberships(p, tenant_alvo)
     a := select role_assignments(person = p, tenant = tenant_alvo)
     se a existe com role_id = role.id:
         REUTILIZAR                    ← nada a fazer
     se a existe com role_id ≠ role.id:
         registrar RECONCILIAR         ← nunca sobrescrever
         proximo
     se a não existe:
         inserir role_assignments(p, role, tenant_alvo)

  7. PRIMEIRO ACESSO
     se account acabou de ser criado:
         upsert first_login_state(
             person_id, must_change_password = true,
             first_login_completed = false)
```

### 8.4 Saída obrigatória por conta

Uma das cinco: `REUTILIZAR` · `CRIAR` · `RECONCILIAR` · `GAP` · `PULADO`.
Nunca "nenhuma" — conta sem resultado é erro de seed.

### 8.5 Garantias

- **Chave de idempotência é `auth.users.email`.** Nunca o nome.
- Toda escrita é precedida por leitura na mesma transação.
- Divergência **nunca** é resolvida sobrescrevendo. Sempre `RECONCILIAR` + parada.
- Role inexistente, deprecated sem replacement ou sem permissão real ⇒ `GAP`.
- Nenhuma role nova é criada por este seed.
- Nenhuma migration é criada por este seed.
- Nenhuma senha trafega no seed, no log, no banco ou no dashboard.
- Contas técnicas não entram no laço.

---

---

# 9. Pendências

|   # | Pendência                                                                                                                                                                                                                    | Tipo          | Bloqueia                              |
| --: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------- |
|   1 | 7 GAPs sem role utilizável: `contato@`, `dp@`, `fornecedores@`, `lgpd@`, `marketing@`, `parcerias@`, `suporte@`                                                                                                              | Decisão       | Criação dessas 7 contas               |
|   2 | **29 das 53 roles com 0 permissões** — decidir se popular ou depreciar                                                                                                                                                       | Banco         | `dp@`, `suporte@` e futuras           |
|   3 | `people.email` **não tem unique** — precondição de idempotência não satisfeita                                                                                                                                               | Schema        | Todo o seed                           |
|   4 | 9 `people` de `@jsempregos.com.br` sem `auth_user_id` (órfãos)                                                                                                                                                               | Banco         | `RECONCILIAR` no seed                 |
|   5 | `bootstrap_candidate_from_auth_user` dispara em todo INSERT em `auth.users`                                                                                                                                                  | Comportamento | Criação de `auth.users`               |
|   6 | 3 contas disputam `tenant_admin` (`adm@`, `diretoria@`, `gestor@`)                                                                                                                                                           | Decisão       | Atribuição dessas contas              |
|   7 | `candidatos@` e `selecao@` com a mesma `recruiter`                                                                                                                                                                           | Decisão       | Vínculo das 2 contas                  |
|   8 | `empresas@` e `comercial@` com a mesma `commercial`                                                                                                                                                                          | Decisão       | Vínculo das 2 contas                  |
|   9 | Onde os remetentes de sistema serão configurados                                                                                                                                                                             | GAP           | Dispatcher/Orchestrator/Master        |
|  10 | 🔴 **P0.6 NÃO CONCLUÍDO** — credencial de homologação comprometida: 1 ocorrência em `scripts/seed-homologation.ts` + 1 em `scripts/seed-homologation-full.ts` (working tree), e 1 em cada um dos 3 arquivos no histórico Git | Segurança     | **Rotacionar as 10 contas `teste.*`** |
|  11 | Senha que ficou em texto puro no disco: **não reutilizar**                                                                                                                                                                   | Segurança     | Primeiro acesso real                  |

### 9.1 Detalhamento da pendência 10 — P0.6

A credencial permanece alcançável no histórico pelo commit `52f0306`
(`feat: module pages, dashboard analytics, auth flow, and 404 fixes`):

| Arquivo                             | Working tree | HEAD / histórico | Versionado |
| ----------------------------------- | -----------: | ---------------: | ---------- |
| `docs/SEED-HOMOLOGACAO-USUARIOS.md` |            0 |                1 | sim        |
| `scripts/seed-homologation.ts`      |            1 |                1 | sim        |
| `scripts/seed-homologation-full.ts` |            1 |                1 | sim        |

Saneamento no working tree **não** remove a exposição histórica. A credencial é
compartilhada entre as 10 contas `teste.*`, que **existem no banco de
produção**; 4 delas nunca logaram.

Sequência correta:

```text
P0.6
├── tratar a credencial como comprometida
├── rotacionar a credencial (10 contas teste.*)
├── remover a credencial dos arquivos atuais
└── decidir / executar remoção do histórico Git
```

> O valor da credencial **não é reproduzido** neste documento, por decisão de
> segurança.

---

---

# 10. Registro de execução

| Data       | Etapa                                       | Resultado                                   |
| ---------- | ------------------------------------------- | ------------------------------------------- |
| 2026-08-25 | Auditoria de usuários (§1 a §5)             | 3 usuários · 15 roles medidas               |
| 2026-09-04 | Inventário RBAC (`RBAC-04-INVENTORY.md`)    | 52 roles · 49 ativas · 3 deprecated         |
| 2026-09-30 | Correção da lista: `candidatos@` definitivo | `canditatos@` descartado                    |
| 2026-09-30 | Separação humanos × técnicas                | 19 humanas · 2 técnicas                     |
| 2026-09-30 | Desenho da matriz de role e do algoritmo    | **DESENHO — nada executado**                |
| 2026-09-30 | **SELECT read-only consolidado** (§11)      | Números confirmados · matriz reclassificada |

**Nenhuma escrita no banco foi realizada.** Sem INSERT, UPDATE, DELETE,
migration, criação de usuário, alteração de role, permission, membership, RLS ou
grants.

## 10.1 Sequência de fases

```text
P0.6  Segurança de artefatos locais .............. 🔴 NÃO CONCLUÍDO (§9.1)
P0.7  Inventário RBAC read-only .................. ✅ concluído (§11)
P0.8  Consolidar matriz de roles ................. ⏸️ aguardando autorização
P0.9  Resolver GAPs institucionais ............... ⏸️
P1.x  Resolver identidade people ↔ auth.users .... ⏸️
P1.x  Definir contrato dos triggers .............. ⏸️
P1.x  Definir seed idempotente ................... ⏸️
P2    Seed das 19 contas humanas ................. ⏸️
```

**Regra permanente:** nenhuma migration deve ser criada apenas para fazer os
números da auditoria fecharem. Primeiro o modelo correto, depois a implementação.

**Escopo do seed: 19 contas humanas.** As 2 contas técnicas estão fora por
decisão de arquitetura (§6.1) e não devem ser referidas como "21 contas".

## 10.2 Estado das operações

```text
Migration ........ ❌ não criada
RBAC write ....... ❌ nenhuma alteração
INSERT/UPDATE/DELETE ❌ nenhum
Seed ............. ❌ não executado
Commit ........... ❌
Push ............. ❌
```

---

---

# 11. Auditoria read-only consolidada — 2026-09-30

Conexão direta com `default_transaction_read_only = on`, verificado em runtime
(`transaction_read_only = on`). **Somente SELECT.** Nenhuma credencial
consultada ou retornada.

## 11.1 Totais

| Objeto               | Total |
| -------------------- | ----: |
| `roles`              |    53 |
| `permissions`        |   230 |
| `role_permissions`   |   739 |
| `role_assignments`   |    37 |
| `people`             |    41 |
| `tenant_memberships` |    43 |
| `tenants`            |     3 |
| `auth.users`         |    23 |

## 11.2 `role_permissions` por role — 24 com permissões

| Role                 | Perms |     | Role                      | Perms |
| -------------------- | ----: | --- | ------------------------- | ----: |
| `tenant_admin`       |   168 |     | `operations_operator`     |    21 |
| `admin_master`       |    96 |     | `operator` _(deprecated)_ |    21 |
| `rh_manager`         |    51 |     | `fiscal_manager`          |    18 |
| `finance_manager`    |    41 |     | `candidato`               |    15 |
| `finance`            |    40 |     | `viewer`                  |    14 |
| `operations_manager` |    36 |     | `it_admin` _(deprecated)_ |    13 |
| `recruiter`          |    29 |     | `it_operator`             |    13 |
| `billing_manager`    |    28 |     | `facilities_manager`      |    12 |
| `accountant`         |    25 |     | `stock_manager`           |    12 |
| `commercial`         |    24 |     | `support` _(deprecated)_  |    11 |
| `accounting_manager` |    23 |     | `support_agent`           |    11 |
|                      |       |     | `lawyer`                  |    10 |
|                      |       |     | `security_manager`        |     7 |

## 11.3 `role_permissions` por role — 29 com ZERO

`accounting_assistant` · `accounting_supervisor` · `billing_assistant` ·
`billing_supervisor` · `commercial_assistant` · `commercial_manager` ·
`commercial_supervisor` · `company_representative` · `facilities_assistant` ·
`facilities_supervisor` · `finance_assistant` · `finance_supervisor` ·
`fiscal_assistant` · `fiscal_supervisor` · `it_assistant` · `it_manager` ·
`it_supervisor` · `operations_assistant` · `operations_supervisor` · `rh` ·
`rh_assistant` · `rh_supervisor` · `security_assistant` · `security_supervisor` ·
`stock_assistant` · `stock_supervisor` · `support_assistant` · `support_manager` ·
`support_supervisor`

Todas marcadas `active` no catálogo, nenhuma com uma única permissão.

## 11.4 Confirmação das contas da matriz

| E-mail                         | `auth.users` | `people` | Tenant            | Role              | Perms | Último login | `first_login_completed` |
| ------------------------------ | ------------ | -------- | ----------------- | ----------------- | ----: | ------------ | ----------------------- |
| `financeiro@jsempregos.com.br` | existe       | ativo    | J&S Empregos LTDA | `finance_manager` |    41 | nunca        | false                   |
| `gestor@jsempregos.com.br`     | existe       | ativo    | J&S Empregos LTDA | `tenant_admin`    |   168 | 2026-08-27   | true                    |

Ambas confirmadas nas 4 camadas: `auth.users` → `people` → `tenant_memberships`
→ `role_assignments`.

## 11.5 Pré-condições de idempotência

|   # | Pré-condição                   | Veredito       | Evidência                                                                                                 |
| --: | ------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------- |
|   1 | `handle_new_auth_user`         | ✅ **ATIVO**   | `AFTER INSERT ON auth.users` → `handle_new_auth_user()`; trigger `on_auth_user_created` habilitado (`O`)  |
|   2 | `first_login_state`            | ✅ **OK**      | PK `(person_id)`; 36 linhas; colunas `must_change_password` e `first_login_completed` com default `false` |
|   3 | unique de `people.email`       | ❌ **AUSENTE** | Unique só em `people.auth_user_id`. `email` é `NOT NULL` mas **sem constraint de unicidade**              |
|   4 | unique de `tenant_memberships` | ✅ **OK**      | `uq_tenant_membership_person_tenant` UNIQUE `(person_id, tenant_id)`                                      |
|   5 | unique de `role_assignments`   | ✅ **OK**      | `uq_role_assignment_person_role_tenant` UNIQUE `(person_id, role_id, tenant_id)`                          |

### 11.5.1 Impacto da pré-condição 3

`people.email` não é único no schema. Hoje há **0 duplicados** por coincidência
de dados, não por garantia. Um seed que interpole `people` por `email` **não tem
proteção contra corrida**. Combinado com `auth_user_id` ser `NULLABLE` e haver
**9 pessoas `@jsempregos.com.br` sem `auth_user_id`**, o seed precisa checar por
`email` explicitamente — e nunca confiar em `INSERT ... ON CONFLICT`.

### 11.5.2 Triggers adicionais em `auth.users`

Além de `handle_new_auth_user`, existem mais dois `AFTER INSERT` em `auth.users`:

```text
trg_bootstrap_candidate_from_auth_user  → bootstrap_candidate_from_auth_user()
trg_bootstrap_company_from_auth_user    → bootstrap_company_from_auth_user()
```

**Estes disparam automaticamente em todo INSERT em `auth.users`.** O seed precisa
saber que criar `auth.users` para `candidatos@` pode criar um registro em
`candidates` como efeito colateral, e que criar para `empresas@` pode criar em
`companies`. Não é idempotente do ponto de vista do seed.

Também existem `on_auth_user_deleted` e `on_auth_user_updated OF email`.

## 11.6 Auditoria das contas `teste.*` — metadados

10 contas, todas no tenant **J&S Empregos LTDA**, todas com `person_status = active`.

| E-mail               | Pessoa             | Role                 | Perms | Último login | `must_change_pw` | `first_login_completed` |
| -------------------- | ------------------ | -------------------- | ----: | ------------ | ---------------- | ----------------------- |
| `teste.adminmaster@` | Admin Master Teste | `admin_master`       |    96 | 2026-09-03   | true             | false                   |
| `teste.tenantadmin@` | Tenant Admin Teste | `tenant_admin`       |   168 | 2026-08-26   | false            | true                    |
| `teste.rh@`          | RH Teste           | `rh_manager`         |    51 | 2026-08-25   | true             | false                   |
| `teste.financeiro@`  | Financeiro Teste   | `finance_manager`    |    41 | nunca        | true             | false                   |
| `teste.fiscal@`      | Fiscal Teste       | `fiscal_manager`     |    18 | 2026-08-26   | false            | **false**               |
| `teste.contador@`    | Contador Teste     | `accountant`         |    25 | nunca        | true             | false                   |
| `teste.operacional@` | Operacional Teste  | `operations_manager` |    36 | nunca        | true             | false                   |
| `teste.recrutador@`  | Recrutador Teste   | `recruiter`          |    29 | 2026-08-27   | false            | true                    |
| `teste.suporte@`     | Suporte Teste      | `support_agent`      |    11 | nunca        | true             | false                   |
| `teste.viewer@`      | Viewer Teste       | `viewer`             |    14 | 2026-08-26   | false            | true                    |

Nenhum `banned_until` preenchido. Nenhuma senha, hash ou token consultado.

### 11.6.1 Divergências encontradas nas contas de teste

1. **`teste.suporte@` tem `support_agent`**, mas
   `SEED-HOMOLOGACAO-USUARIOS.md` documenta `support` (role deprecated). O seed
   já aplicou a replacement — **documentação desatualizada**.
2. **`teste.fiscal@` está inconsistente**: `must_change_password = false` com
   `first_login_completed = false`. Nunca trocou a senha, mas o estado diz que
   não precisa.
3. **4 contas nunca logaram**: `teste.financeiro@`, `teste.contador@`,
   `teste.operacional@`, `teste.suporte@`.
4. **Senha de homologação em texto puro** em `SEED-HOMOLOGACAO-USUARIOS.md`
   (§4 e throughout), compartilhada entre as 10 contas. É credencial em
   documentação versionada — recomenda-se remoção e rotação.

## 11.7 Nada foi alterado

```text
INSERT ........ 0
UPDATE ........ 0
DELETE ........ 0
DDL/migration .. 0
RLS ............ 0
grants ......... 0
```

Sessão aberta com `default_transaction_read_only = on` e confirmada por
`SHOW transaction_read_only` → `on`.
