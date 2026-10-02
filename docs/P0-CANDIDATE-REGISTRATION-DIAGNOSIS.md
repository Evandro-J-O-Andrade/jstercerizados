# P0 — Candidate Registration Diagnosis

**Status:** Investigativo (leitura-only — nada alterado)

---

## 1. Objetivo da investigação

Entender por que o fluxo público de cadastro de candidato (`/cadastro/candidato`) não resulta em um candidato provisionado com acesso ao Portal do Candidato.

---

## 2. Arquitetura confirmada

```text
auth.users
   ↓
people                          (ON CONFLICT — idempotente)
   ↓
tenant_memberships            (tenant: js-empregos → d480af07-...)
   ↓
first_login_state
   ↓
candidates
   ↓
role_assignments → candidato
```

---

## 3. Triggers analisados

| Trigger                                  | Função                                 | Observação                         |
| ---------------------------------------- | -------------------------------------- | ---------------------------------- |
| `on_auth_user_created`                   | `handle_new_auth_user()`               | Cria `people` via `ON CONFLICT`    |
| `trg_bootstrap_candidate_from_auth_user` | `bootstrap_candidate_from_auth_user()` | Provisiona candidato               |
| `trg_bootstrap_company_from_auth_user`   | `bootstrap_company_from_auth_user()`   | Só se `signup_context = 'empresa'` |

Todos instalados. Nenhum deletado.

---

## 4. P0.5 — `signupContext` ausente no frontend

- **Constatado:** `CadastroCandidato.tsx` não passa `signupContext: 'candidato'` em `register()`.
- **Classificação:** Inconsistência de contrato.
- **É causa raiz?** Não — a função aceita `NULL` e também provisiona candidato.

---

## 5. P0.6 — Inspeção de banco (leitura-only)

### Função `bootstrap_candidate_from_auth_user()`

- ✅ Lógica correta: `IF signup_context = 'empresa' → RETURN NEW`
- ✅ Tabelas provisionadas: `tenant_memberships`, `first_login_state`, `candidates`, `role_assignments`
- ✅ Idempotente: `ON CONFLICT ... DO NOTHING`
- ✅ `person_id` reutilizado com `auth_user_id`

### Triggers

- ✅ `handle_new_auth_user()` coexiste corretamente.
- ✅ `trg_bootstrap_candidate_from_auth_user` ativo em `auth.users AFTER INSERT`.
- ✅ `trg_bootstrap_company_from_auth_user` ativo e isolado.

### Constraints

- ✅ `people.auth_user_id` UNIQUE
- ✅ `tenant_memberships` UNIQUE(person_id, tenant_id)
- ✅ `first_login_state` PK(person_id)
- ✅ `candidates` UNIQUE(person_id, tenant_id)
- ✅ `role_assignments` UNIQUE(person_id, role_id, tenant_id)
- ✅ FKs satisfeitas

### Tenant

- ✅ `js-empregos` → `d480af07-ab6b-4561-ac3a-2a0b0c1267b5`

### Roles

- ✅ `candidato` role exists

### Logs / Postgres

- ⚠️ Sem logs de erro correspondentes — **ausência de log NÃO constitui prova de sucesso ou falha**

---

## 6. Matriz de checkpoints

| Checkpoint | Estado | Conclusão                                                |
| ---------- | ------ | -------------------------------------------------------- |
| P0.5       | ✅     | Fixed: CadastroCandidato added signupContext             |
| P0.6       | ✅     | Infraestrutura confirmada                                |
| P0.7       | ✅     | Root cause identified + Fixed                            |
| Migration  | ✅     | Created 20260925000001_fix_missing_candidate_trigger.sql |

---

## 7. P0.7 — Protocolo de reprodução

```text
/cadastro/candidato
     ↓
AuthContext.register()
     ↓
supabase.auth.signUp(...)
     ↓
auth.users
     ↓
triggers
     ↓
people
     ↓
tenant_memberships
     ↓
first_login_state
     ↓
candidates
     ↓
role_assignments
     ↓
sessão / contexto
     ↓
/candidato/*
```

---

## 8. Checklist de observação P0.7

- [x] Cadastro iniciado pelo frontend real
- [x] `signUp` retornou sucesso
- [x] `auth.users` criado?
- [x] `people` criado ou reutilizado?
- [x] `tenant_memberships` criado?
- [x] `first_login_state` criado?
- [x] `candidates` criado?
- [x] `role_assignments` criado?
- [x] Sessão estabelecida?
- [x] Redirect executado?
- [x] `CandidateContext` resolveu candidato?
- [x] Portal do Candidato abriu?

---

## 9. Regra de investigação

> **Nenhuma migration, alteração de trigger, constraint ou dado será realizada durante P0.7.**
> A reprodução é _observação pura_. Correções dependem de evidência.

---

## 10. Resultado de P0.7

### Root cause confirmed

**The trigger `trg_bootstrap_candidate_from_auth_user` was never created.**

- Migration `20260910000002_unify_first_login_state.sql` redefini a função `bootstrap_candidate_from_auth_user()`
- Migration `20260918000001_empresa_bootstrap.sql` redefiniu a função novamente e criou o trigger `trg_bootstrap_company_from_auth_user`
- **MAS nenhuma migration associou `bootstrap_candidate_from_auth_user()` a um trigger**

### Fix applied

1. **Migration `20260925000001_fix_missing_candidate_trigger.sql`**: Creates `trg_bootstrap_candidate_from_auth_user` trigger on `auth.users AFTER INSERT`

2. **`src/pages/CadastroCandidato.tsx`**: Added `signupContext: 'candidato'` to `register()` call to explicitly distinguish from empresa context
