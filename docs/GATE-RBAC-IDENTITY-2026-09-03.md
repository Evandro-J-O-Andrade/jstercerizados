# Gate RBAC/Identity — Fechamento de Investigação

> **Data:** 2026-09-03
> **Status:** 🟢 GREEN (validado)
> **Próxima ação:** apenas mediante reprodução concreta de tela preta com evidência (URL, usuário, horário, screenshot, Console)

---

## TL;DR

Investigação de causa-raiz para `is_admin_master()` e `is_tenant_member()` foi **encerrada sem causa de tela preta identificada**. As funções estão corretas no contexto real de execução (PostgREST + JWT). O teste inicial via `pg` direto foi descartado como evidência por não reproduzir o contexto JWT/PostgREST utilizado pela aplicação.

---

## TL;DR técnico

| Função | admin_master JWT | candidato JWT | Esperado |
|---|---|---|---|
| `is_admin_master()` | `true` | `false` | ✓ |
| `is_tenant_member(J&S)` | `true` | `true` | ✓ |
| `people` (self) | visível | visível | ✓ |
| `tenant_memberships` (própria) | visível | visível | ✓ |
| `role_assignments` (própria) | visível | visível | ✓ |

---

## Fechamento técnico

| Área | Resultado | Decisão |
|---|---|---|
| `is_admin_master()` | 🟢 Validado via PostgREST + JWT | **Fechar** |
| `is_tenant_member()` | 🟢 Validado via PostgREST + JWT | **Fechar** |
| RLS ↔ `SECURITY DEFINER` | 🟢 Ciclo resolvido via dono `postgres` | **Fechar** |
| Candidate Bootstrap | 🟢 Trigger `bootstrap_candidate_from_auth_user()` valida `raw_user_meta_data.full_name` | **Fechar** |
| `people` / identidade | 🟢 RLS `people_member_read` libera self, admin_master e tenant-member | **Fechar** |

---

## Itens fora de escopo (backlog)

| Item | Severidade | Status |
|---|---|---|
| Tela preta | 🟡 Não reproduzida | Não diagnosticar por hipótese |
| `AuthContext.tsx:275-276` `setIsCandidate(false)` duplicado | 🟡 Cosmético | Não tocar |
| `people.auth_user_id` sem índice | 🟡 Performance | Backlog |
| `is_admin_master()` poderia ser `STABLE` | 🟡 Otimização | Backlog |
| `loadAuthData` resiliência | 🟡 Melhoria futura | Não tocar |
| Rotas / nomenclatura (`/dashboard/candidato` vs `/candidato/*`) | 🟡 Débito arquitetural | Não tocar |

---

## Decisão registrada

> **Investigação de RBAC encerrada sem causa de tela preta identificada.**
>
> As funções `is_admin_master()` e `is_tenant_member()` foram validadas no contexto real de execução do aplicativo, utilizando PostgREST + JWT. Ambas retornaram os valores esperados para usuários `admin_master` e candidato. A interação entre `SECURITY DEFINER` e RLS também foi validada e não apresenta falha funcional.
>
> O teste anterior realizado diretamente via `pg` foi descartado como evidência de runtime por não reproduzir corretamente o contexto de autenticação utilizado pelo PostgREST.
>
> Não há, portanto, justificativa técnica para alterar as funções, as policies ou o mecanismo RBAC neste momento.
>
> A tela preta permanece **não reproduzida e sem causa raiz confirmada**. Qualquer alteração em `AuthContext`, `App`, rotas ou providers baseada exclusivamente nessa hipótese está bloqueada.
>
> O próximo passo somente deverá ocorrer mediante reprodução concreta contendo **URL, usuário, horário, screenshot e Console do navegador**.

---

## Metodologia de validação (para auditoria futura)

### Por que o teste via `pg` direto não é evidência de runtime

`auth.uid()` no Supabase é injetado pelo **PostgREST/GoTrue** a partir do **token JWT validado na conexão HTTP**. Conexão `pg` direta com `set_config('request.jwt.claim.sub', '<uuid>', true)` **NÃO** popula `auth.uid()`, que permanece `NULL`. Portanto, qualquer função que dependa de `auth.uid()` retorna `false` nesse contexto, mesmo que esteja semanticamente correta.

### Forma correta de validar funções RBAC

Usar `supabase-js` com `createClient(url, ANON_KEY, { global: { headers: { Authorization: \`Bearer <jwt>\` } } })` e chamar a função via `rpc()`:

```js
const { data } = await u.rpc('is_admin_master');
// ou com args:
const { data } = await u.rpc('is_tenant_member', { p_tenant_id: '<uuid>' });
```

PostgREST injeta o JWT, valida-o, popula `auth.uid()` e executa a função no contexto correto. Esse é o runtime real da aplicação.

### Cadeia validada

```
auth.uid() (do JWT)
   ↓
public.people.auth_user_id
   ↓
public.role_assignments.person_id → roles.id (scope='global', name='admin_master')
   ↓
public.is_admin_master() = true
```

```
auth.uid() (do JWT)
   ↓
public.people.auth_user_id
   ↓
public.tenant_memberships.person_id (status='active', tenant_id=<X>)
   ↓
public.is_tenant_member(<X>) = true
```

---

## Regra para próximos Gates

**Não criar repository, rota, módulo ou abstração apenas porque apareceu na matriz.**

Primeiro verificar se existe. Depois avaliar estado/reuso. Somente então implementar se houver necessidade comprovada.

A mesma regra vale para investigar bugs: **não corrigir por hipótese**. Esperar evidência reproduzível antes de tocar em `AuthContext`, `App.tsx`, providers ou rotas críticas.
