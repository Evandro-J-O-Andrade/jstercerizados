# AUTH-400-INCIDENT-ANALYSIS

> Status: ANALYSIS DRAFT — READ-ONLY
> Baseline: DATABASE-BASELINE-JS-EMPREGOS-V2.md
> Build Spec: DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md
> Regra: nenhuma alteração no Supabase, migrations, RLS, RBAC, frontend ou dados até aprovação formal.

---

## 1. Objetivo

Documentar a investigação do erro HTTP 400 retornado por `supabase.auth.signInWithPassword()` sem realizar workarounds, reset de senha, criação de usuário ou alteração de configuração.

---

## 2. Sintoma confirmado

```text
POST /auth/v1/token?grant_type=password
HTTP/1.1 400
Body: invalid_grant | invalid_credentials | validation_failed | ...
```

Esse erro acontece **antes** do fluxo People-First:

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
```

Portanto, a causa está na **etapa de autenticação do Supabase Auth**, não em RLS, RBAC, `people`, `tenant_memberships` ou `role_assignments`.

---

## 3. O que já foi confirmado

| Item | Status |
|---|---|
| `auth.users` existe | ✅ |
| Usuário `evandro_j.o.a@hotmail.com` existe | ✅ |
| Usuário confirmado (`email_confirmed_at`) | ✅ |
| `people` existe e vincula `auth_user_id` | ✅ |
| `tenant_memberships` existe | ✅ |
| `role_assignments` existe | ✅ |
| `admin_master` existe | ✅ |
| Cadeia People-First íntegra | ✅ |

---

## 4. O que NÃO explica o 400

```text
❌ RLS
❌ role_assignments vazia
❌ tenant_memberships vazia
❌ roles ausentes
❌ frontend usando roles legadas
❌ ProtectedRoute
❌ migração 012 quebrada
❌ seed não executado
❌ dados corrompidos
```

Esses itens são **incompatibilidades funcionais ou de autorização**, mas não causam `400 Invalid login credentials` no endpoint `/auth/v1/token`.

---

## 5. Hipóteses prováveis

### 5.1 Credencial incorreta

A senha enviada no `signInWithPassword()` não corresponde à senha armazenada em `auth.users`.

Características:
- não altera estrutura do banco
- não altera RLS/RBAC
- resolve-se com senha correta

### 5.2 Usuário não confirmado

Características:
- `email_confirmed_at` seria `NULL`
- contradiz a auditoria remota que mostrou usuário confirmado

### 5.3 Provider email/password desabilitado

Características:
- configuração do projeto Supabase
- não depende de banco local
- depende de painel Supabase / CLI

### 5.4 Cliente Supabase mal configurado

Características:
- `VITE_SUPABASE_URL` incorreta
- `VITE_SUPABASE_PUBLISHABLE_KEY` incorreta
- versão do client incompatível
- configuração de Auth diferente no client

### 5.5 Payload inválido

Características:
- request fora do formato esperado
- encoding incorreto
- cabeçalhos ausentes
- body malformado

### 5.6 Rate limit / proteção do Supabase

Características:
- bloqueio temporário após tentativas
- não depende de banco local
- depende de configuração do projeto

---

## 6. O que NÃO faremos nesta fase

```text
❌ resetar senha
❌ recriar usuário
❌ executar seed
❌ alterar RLS
❌ alterar RBAC
❌ alterar Auth
❌ criar RPC
❌ alterar frontend
❌ executar login repetidamente
```

---

## 7. Evidências necessárias para confirmar a causa

### 7.1 Response body do Network

```text
POST /auth/v1/token?grant_type=password
```

Precisamos de:
- status HTTP
- corpo da resposta
- campos `error`, `error_description`, `message`

### 7.2 Supabase Dashboard → Auth Logs

Precisamos de:
- timestamp do erro
- código do erro
- email utilizado
- resultado da tentativa

### 7.3 Configuração do projeto

Precisamos confirmar:
- Provider **Email/Password** habilitado
- `VITE_SUPABASE_URL` corresponde ao projeto correto
- `VITE_SUPABASE_PUBLISHABLE_KEY` corresponde ao projeto correto
- não há configuração de Auth divergente (MFA, OTP, etc.)

### 7.4 Teste pontual autorizado

Somente após coleta das evidências acima, e mediante autorização explícita, pode-se executar **uma** tentativa controlada de autenticação para confirmar hipótese.

---

## 8. Separação de responsabilidades

```text
AUTH-400
    ↓
Supabase Auth / credentials / client config
```

é diferente de:

```text
FRONTEND RBAC
    ↓
roles legadas / rotas / autorização
```

e diferente de:

```text
DATABASE
    ↓
schema / RLS / dados
```

Essas três camadas são independentes. Corrigir uma não resolve a outra automaticamente.

---

## 9. Critérios de aprovação da análise

```text
✅ causa raiz documentada com evidência
✅ separação clara: autenticação ≠ autorização ≠ banco
✅ nenhum workaround aplicado
✅ nenhuma alteração no Supabase
✅ nenhuma alteração no frontend
✅ nenhuma alteração no banco
✅ recomendações documentadas para correção
```

Somente após aprovação:
```text
AUTH-400 ANALYSIS APPROVED
       ↓
CROSS-REVIEW
       ↓
PLANO DE CORREÇÃO
       ↓
EXECUÇÃO CONTROLADA
       ↓
VALIDAÇÃO
```
