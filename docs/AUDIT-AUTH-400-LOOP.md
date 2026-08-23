# DIAGNÓSTICO — AUTH 400 + NAVIGATION LOOP

**Data:** 2026-08-23  
**Empresa:** J&S Empregos LTDA  
**Escopo:** Somente leitura. Nenhum arquivo alterado.

---

## PARTE 1 — AUTH 400

### Sintoma

```
POST /auth/v1/token?grant_type=password
400 Bad Request
```

### Causas possíveis (em ordem de probabilidade)

#### 1. ❌ Variável de ambiente incorreta

**Arquivos:** `.env`, `.env.local`  
**Código:** `src/lib/supabase.ts:9`

```env
# .env e .env.local usam:
VITE_SUPABASE_PUBLISHABLE_KEY=...

# Código espera:
VITE_SUPABASE_ANON_KEY
```

**Impacto:** `getSupabaseClient()` retorna `null` se `VITE_SUPABASE_ANON_KEY` não estiver definida.

**Observação:** Se o client fosse realmente `null`, o erro exibido seria:

```
Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
```

O fato de estar vendo `400` do Supabase Auth sugere que **o client está sendo criado**, o que pode indicar:

- Está sendo testado com código do PC de ontem (que usava `VITE_SUPABASE_PUBLISHABLE_KEY`)
- Cache do Vite antigo
- Variável definida em outro lugar (ex: `.env` de worktree)

#### 2. ⚠️ Sessão antiga no localStorage

**Arquivo:** `src/contexts/AuthContext.tsx:192-194`

```tsx
const {
  data: { session: initialSession },
} = await supabase.auth.getSession();
```

Se houver uma sessão expirada/inválida armazenada, o `getSession()` pode retornar uma sessão que causa comportamento inesperado no fluxo de login.

#### 3. ⚠️ Usuário não confirmado

**Arquivo:** `src/contexts/AuthContext.tsx:354-375`

```tsx
const { data, error } = await supabase.auth.signUp({...});

if (!data.user.email_confirmed_at) {
  return { error: 'Verifique seu e-mail para confirmar a conta.' };
}
```

Se o usuário foi criado via `signUp` mas não confirmou o email, o login falha com 400.

#### 4. ⚠️ Senha não corresponde ao banco

Apesar de ter sido redefinida, pode haver:

- Erro de digitação
- Senha alterada em outro ambiente
- Usuário diferente sendo usado

#### 5. ℹ️ Email/senha incorretos

Causa mais comum de 400 no Supabase Auth.

### Como confirmar a causa exata

1. **Verificar logs do Supabase:**
   - Dashboard > Authentication > Logs
   - Procurar tentativa de login no horário do erro
   - Ver `error_code` e `message`

2. **Verificar variável de ambiente no build:**

   ```tsx
   console.log(
     'ANON_KEY:',
     import.meta.env.VITE_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'AUSENTE',
   );
   console.log(
     'PUBLISHABLE_KEY:',
     import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'DEFINIDA' : 'AUSENTE',
   );
   ```

3. **Verificar sessão no localStorage:**
   ```js
   localStorage.getItem('sb-' + projectRef + '-auth-token');
   ```

---

## PARTE 2 — NAVIGATION LOOP

### Sintoma

```
react-router-dom:
"Throttling navigation to prevent the browser from hanging"
```

### Ciclo identificado

```text
Login.tsx
  │
  │ isAuthenticated = true
  │ tenantMemberships = [] (estado inicial)
  ▼
navigate('/dashboard')  ← sem esperar person carregar
  │
  ▼
ProtectedRoute
  │
  │ isAuthenticated = true ✅
  │ person = null ❌  (loadAuthData ainda carregando)
  ▼
Navigate to="/login"
  │
  ▼
Login.tsx
  │
  │ isAuthenticated = true (ainda)
  ▼
navigate('/dashboard')
  │
  ▼
... loop infinito
```

### Arquivos e linhas envolvidos

| Arquivo                                  | Linha   | Papel no loop                                                                     |
| ---------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `src/pages/Login.tsx`                    | 43-48   | Navega para `/dashboard` quando `isAuthenticated` fica true, sem esperar `person` |
| `src/contexts/AuthContext.tsx`           | 234-236 | `onAuthStateChange` dispara `loadAuthData` assincronamente                        |
| `src/contexts/AuthContext.tsx`           | 67-169  | `loadAuthData` carrega `person`, `tenantMemberships`, `roles`, `permissions`      |
| `src/components/auth/ProtectedRoute.tsx` | 85-87   | Redireciona para `/login` se `person` for null                                    |
| `src/pages/Dashboard.tsx`                | —       | Carrega durante o loop                                                            |

### Condição exata do loop

O loop ocorre quando:

1. `signInWithPassword` retorna sucesso
2. `onAuthStateChange` dispara `SIGNED_IN`
3. `setUser` atualiza `user` → `isAuthenticated = true`
4. `loadAuthData` inicia mas NÃO terminou
5. `person` ainda é `null`
6. Login.tsx useEffect dispara: `navigate('/dashboard')`
7. Dashboard carrega
8. ProtectedRoute: `!person` → `Navigate to="/login"`
9. Login.tsx monta novamente
10. `isAuthenticated` ainda é `true`
11. Volta para passo 6

### Por que o React Router throttling aparece

O React Router detecta múltiplos `navigate()`/`<Navigate>` em rápida sequência e aplica throttling para evitar travar a aba. O warning é uma **consequência** do loop, não a causa.

### Estado após as correções aplicadas hoje

Com as alterações feitas:

- Login.tsx agora navega para `/onboarding` se `tenantMemberships.length === 0`
- `/onboarding` foi criado
- Dashboard.tsx usa `isAdminMaster` do contexto

Mas o problema de race condition permanece:

- Login.tsx ainda navega baseado em `isAuthenticated` sem esperar `person`
- `tenantMemberships` está vazio no momento da decisão (estado inicial)
- Mesmo que o usuário tenha tenant, Login.tsx navega para `/onboarding` primeiro

Isso **não causa loop**, mas causa uma navegação "desperdiçada".

O loop só é eliminado se Login.tsx esperar `person` carregar antes de navegar.

---

## PARTE 3 — VARIÁVEL DE AMBIENTE (DESCOBERTA ADICIONAL)

### Arquivo: `.env` e `.env.local`

```env
VITE_SUPABASE_URL=https://okxqfyoqbhcmflpurfrw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_8BqjHyGkcIvLYeOjKg4q8g_WT8l3xqE
```

### Arquivo: `src/lib/supabase.ts`

```tsx
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### Problema

Os arquivos `.env` usam `VITE_SUPABASE_PUBLISHABLE_KEY`, mas o código espera `VITE_SUPABASE_ANON_KEY`.

**Resultado:** `import.meta.env.VITE_SUPABASE_ANON_KEY` é `undefined`.

**Esperado:** `getSupabaseClient()` retorna `null`.

**Observação:** Se o erro fosse realmente "Supabase não configurado", isso explicaria o 400 (ou melhor, a ausência de requisição). Mas como você está vendo `400` do Supabase Auth, isso sugere que o client está sendo criado de outra forma.

---

## CONCLUSÃO

### A) Causa do Auth 400

**INCONCLUSIVO** sem acesso aos logs do Supabase.

Causas prováveis:

1. Variável de ambiente `VITE_SUPABASE_ANON_KEY` ausente (mas contradiz o sintoma de 400)
2. Sessão antiga/inválida no localStorage
3. Usuário não confirmado
4. Senha não corresponde ao banco

**Próximo passo para confirmar:** verificar logs do Supabase Dashboard > Authentication > Logs.

### B) Causa do Navigation Loop

**CONFIRMADA** por análise de código.

Causa raiz:

- Login.tsx navega para dashboard quando `isAuthenticated = true`
- ProtectedRoute bloqueia acesso se `person = null`
- `person` só é populado após `loadAuthData` assíncrono
- Resultado: `/login` → `/dashboard` → `/login` → `/dashboard` → ... loop

**Correção mínima:** Login.tsx deve esperar `person` carregar antes de navegar.

---

## PRÓXIMOS PASSOS (APÓS SUA APROVAÇÃO)

1. Corrigir variável de ambiente: `.env` → `VITE_SUPABASE_ANON_KEY`
2. Corrigir navigation loop: Login.tsx aguarda `person` antes de navegar
3. Testar login com usuário real
4. Verificar logs do Supabase para confirmar causa do 400
