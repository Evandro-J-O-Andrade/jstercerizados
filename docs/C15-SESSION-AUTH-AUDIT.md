# C1.5 — Auditoria de sessão e autenticação

## Objetivo

Mapear como a sessão, autenticação, persistência e eventos de segurança funcionam hoje, sem inventar tabela ou página.

## Estado atual

### Código

- `src/contexts/AuthContext.tsx` gerencia sessão via `useState<Session | null>`
- `supabase.auth.getSession()` usado na inicialização
- `supabase.auth.onAuthStateChange` usado para eventos SIGNED_IN/SIGNED_OUT/SESSION_EXPIRED/TOKEN_REFRESH_FAILED
- logout chama `supabase.auth.signOut()`
- `legal_acceptances` e `first_login_state` usados para onboarding
- `changePassword` chama `supabase.auth.updateUser({ password })` sem reautenticação

### ModuleRegistry

- Módulo `seguranca-conta` registrado com permissões:
  - `auth.change_password`
  - `auth.revoke_session`
- Rota: `/dashboard/configuracoes/seguranca` e `/dashboard/configuracoes/seguranca/sessoes`
- Página mapeada: `SegurancaPage`

### Banco

Tabelas confirmadas no inventário:

- `sessions` — existe no Supabase
- `security_events` — existe no Supabase
- `audit_logs` — existe no Supabase

### Comportamento de sessão

- Sessão Supabase Auth é persistida no storage do navegador
- Login com "lembrar" é comportamento padrão
- Logout encerra sessão atual via `signOut()`
- Não há implementação atual de:
  - listagem de sessões ativas
  - revogação de sessão específica
  - logout de todas as sessões
  - rastreamento de dispositivos

## Perguntas a responder antes de implementar

1. O `sessions` do Supabase Auth é suficiente ou precisamos de tabela própria?
2. `security_events` já registra login/logout?
3. `audit_logs` já registra eventos de segurança?
4. Qual a política de expiração/refresh token?
5. Usuário pode ver suas próprias sessões?
6. admin_master pode ver/revogar sessões de outros usuários?

## Regra

- Não criar tabela `active_sessions` sem confirmar que `sessions`/`security_events`/`audit_logs` não cobrem o caso
- Não duplicar mecanismo de autenticação do Supabase
- Implementar "Sessões Ativas" em cima da estrutura real

## Status

- inventário: feito
- implementação: pendente até C1.5 fechar completamente
