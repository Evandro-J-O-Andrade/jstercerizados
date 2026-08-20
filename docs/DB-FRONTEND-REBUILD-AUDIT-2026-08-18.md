# J&S Empregos — Auditoria Pré-Reconstrução do Banco e Frontend

**Data:** 2026-08-18  
**Status:** PRÉ-DROP / SOMENTE AUDITORIA  
**Branch de auditoria:** `audit/db-frontend-before-rebuild-20260818`  
**Repositório:** `Evandro-J-O-Andrade/jstercerizados`

> **REGRA ABSOLUTA:** nenhum `DROP`, `TRUNCATE`, reset do projeto Supabase ou reconstrução destrutiva deve ser executado antes da conclusão desta auditoria e da validação do schema remoto no Supabase.

---

## 1. Objetivo

Este documento congela o conhecimento necessário para reconstruir o banco da J&S Empregos sem repetir as divergências encontradas entre:

- migrations históricas;
- schema legado;
- modelo People-First;
- RBAC/RLS;
- chat humano/IA;
- Supabase remoto;
- frontend React/TSX;
- rotas e `ProtectedRoute`;
- `AuthContext`;
- provisionamento do `admin_master`.

A reconstrução somente poderá começar quando o estado remoto do Supabase for comparado com este baseline.

---

# PARTE A — ANTES DA RECONSTRUÇÃO

## 2. Estado arquitetural atual do repositório

O `main` está congelado no commit `708d9c5d36c4723a6b5c9ce1b15445776942765f` com a mensagem `chore: freeze project state - remove debug scripts, preserve provision-admin in history`.

O repositório possui uma sequência canônica People-First em `supabase/migrations/`, além de migrations antigas mantidas em `_legacy`.

### Migrations canônicas presentes no repositório

| Ordem | Migration                                                 | Papel                                                        |
| ----- | --------------------------------------------------------- | ------------------------------------------------------------ |
| 001   | `20260816000100_core_people_tenants.sql`                  | `people`, `tenants`, `tenant_memberships`, base multi-tenant |
| 002   | `20260816000200_identity_people_auth.sql`                 | sincronização `auth.users` ↔ `people`                        |
| 003   | `20260816000300_companies.sql`                            | empresas/organizações                                        |
| 004   | `20260816000400_candidates.sql`                           | candidatos                                                   |
| 005   | `20260816000500_jobs.sql`                                 | vagas                                                        |
| 006   | `20260816000600_applications.sql`                         | candidaturas/processo                                        |
| 007   | `20260816000700_rbac.sql`                                 | roles, permissions, role assignments                         |
| 008   | `20260816000800_storage.sql`                              | arquivos/storage                                             |
| 009   | `20260816000900_domain_events.sql`                        | eventos de domínio                                           |
| 010   | `20260816001000_notifications.sql`                        | notificações                                                 |
| 011   | `20260816001100_talent_pool.sql`                          | banco de talentos                                            |
| 012   | `20260816001200_rls_consolidation.sql`                    | consolidação de RLS/autorização                              |
| 013   | `20260817000100_seed.sql`                                 | seed canônico                                                |
| 014   | `20260817000200_enable_rls_role_resource_permissions.sql` | RLS complementar                                             |
| 016   | `20260817000400_fix_role_assignments_recursion.sql`       | correção de recursão RBAC                                    |

### GAP identificado

Não existe no diretório atual uma migration `015` correspondente ao histórico de scripts de correção citado durante a operação. Também não existe atualmente uma migration canônica de chat humano/IA no mesmo nível das migrations 001–016.

**Conclusão:** o histórico de chat não pode ser simplesmente recolocado na sequência sem reconciliação arquitetural.

---

## 3. Evolução por GATE / STAGE

### GATE-DATA-03 — definição arquitetural

Estabeleceu as regras de dados, multi-tenancy, RBAC, segurança e portabilidade.

### GATE-DATA-04 — auditoria e proposta

A auditoria inicial documentava um schema PostgreSQL anterior baseado em `profiles`. Esse documento é histórico e **não deve ser tratado como schema final**, porque a arquitetura posterior migrou para People-First.

### GATE-DATA-04 Stage 2A — Chat Humano

Foi criado historicamente como `20250101_chat.sql` com:

- `chat_rooms`;
- `chat_messages`;
- multi-tenancy;
- áreas `central`, `rh`, `financeiro`, `comercial`, `suporte`;
- RLS;
- Realtime;
- histórico de mensagens.

Esse arquivo hoje está em:

`supabase/migrations/_legacy/20250101_chat.sql`

O motivo é arquitetural: a versão histórica referencia estruturas antigas, incluindo `tenant_memberships.user_id` e `auth.users` em pontos que precisam ser reconciliados com o modelo People-First.

### GATE-DATA-04.001–012 — baseline People-First

Foi construída a espinha dorsal canônica:

```text
auth.users
    ↓
people.auth_user_id
    ↓
people.id
    ↓
tenant_memberships.person_id
    ↓
role_assignments.person_id
```

A migration 001 declara explicitamente `people` como entidade de negócio e não cria `profiles`. A migration 002 também declara explicitamente que não deve existir tabela `profiles`.

### GATE-DATA-04.007 — RBAC

Modelo atual:

```text
roles
permissions
role_permissions
role_assignments
```

`admin_master` é global. Roles como `tenant_admin`, `rh_manager`, `recruiter`, `finance`, `support`, `content_manager` e `viewer` são tenant-scoped.

### GATE-DATA-04.012 — RLS consolidation

A consolidação de RLS foi corrigida várias vezes para alinhar nomes e relacionamentos ao RBAC canônico. Entre as correções históricas estão:

- `actor_person_id` → `person_id`;
- `tenant_membership_id` → `tenant_id`;
- correção de referência ambígua em applications;
- correção de `application_profile_snapshots`;
- correção de `files.owner_person_id`;
- correção de sintaxe de `REVOKE`;
- idempotência de seeds RBAC.

### Seed 013

O seed preserva a estrutura de dados canônica e não armazena senhas, service-role keys ou credenciais reais.

### Correção 016 — RBAC recursion

O histórico registra correção de recursão em `roles`/`role_assignments`, com helper `SECURITY DEFINER` e nova política de RLS. O commit correspondente relata teste de login e carregamento do `admin_master` sem recursão.

---

# 4. Modelo People-First CANÔNICO

## Identidade

```text
auth.users.id
     │
     │ auth_user_id
     ▼
people.id
     │
     ├── tenant_memberships.person_id
     ├── role_assignments.person_id
     ├── candidates.person_id
     └── demais entidades de negócio
```

### Regras

1. `auth.users` é infraestrutura de autenticação.
2. `people` é a identidade de negócio.
3. `profiles` NÃO faz parte do modelo final.
4. `tenant_memberships` usa `person_id`.
5. `role_assignments` usa `person_id`.
6. Não reintroduzir `user_id` como substituto de `person_id`.
7. Não reintroduzir roles dentro de `profiles`.

---

# 5. RBAC CANÔNICO

## Global

- `admin_master`
- `platform_admin`
- `support_engineer`

## Tenant

- `tenant_admin`
- `rh_manager`
- `recruiter`
- `finance`
- `support`
- `content_manager`
- `viewer`

### Observação crítica

`member` aparece como fallback no `AuthContext`, mas **não existe como role canônica no seed RBAC**. Nesse caso, `member` deve ser tratado como fallback de aplicação ou o modelo precisa decidir explicitamente se ele será uma role real.

---

# 6. AUDITORIA DO FRONTEND

## 6.1 Providers

`src/main.tsx` atualmente monta:

```text
HelmetProvider
  └── BrowserRouter
      └── ThemeProvider
          └── AuthProvider
              └── IntroProvider
                  └── App
```

Portanto, **AuthProvider existe e está montado corretamente no entrypoint**.

## 6.2 AuthContext

`src/contexts/AuthContext.tsx` já foi migrado para People-First.

Ele consulta:

```text
people
tenant_memberships
role_assignments
roles
```

e não `profiles`.

Também existe prioridade explícita para:

```text
admin_master global
    ↓
role tenant
    ↓
member fallback
```

## 6.3 Supabase client

`src/lib/supabase.ts` usa:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Não deve existir chave `service_role` no frontend.

## 6.4 ProtectedRoute

`ProtectedRoute.tsx` já trabalha com:

- `isAuthenticated`;
- `isLoading`;
- `profile`;
- `profile.role`;
- `profile.is_admin_master`;
- `profile.tenant_id`;
- `allowedRoles`;
- `requireAdminMaster`;
- `requireTenantAccess`.

Isso significa que o frontend **já possui a estrutura necessária para RBAC**, mas precisa ser validado contra o conjunto exato de roles do banco.

---

# 7. PROBLEMA REAL ENCONTRADO NO FRONTEND

O `App.tsx` possui duas rotas que ainda utilizam roles que não pertencem ao RBAC canônico:

```tsx
/dashboard/candidato
allowedRoles={['candidato', 'admin']}
```

```tsx
/dashboard/empresa
allowedRoles={['empresa', 'admin']}
```

Essas roles não aparecem no seed canônico 007.

Ao mesmo tempo, a rota `/dashboard/*` utiliza o conjunto canônico:

```text
admin_master
 tenant_admin
 rh_manager
 recruiter
 finance
 support
 content_manager
 viewer
 member
```

### Diagnóstico

Isso demonstra que **não podemos culpar o banco antes de corrigir o contrato de autorização do frontend**.

A arquitetura correta deve separar:

```text
ROLE
    ↓
autorização

TIPO DE USUÁRIO / ÁREA
    ↓
roteamento e UX
```

`candidato` e `empresa` não devem ser inventados como roles RBAC se o banco não os trata como roles.

---

# 8. OUTRO PONTO A AUDITAR NO AuthContext

O código atual consulta `role_assignments` com filtro de expiração equivalente a:

```text
expires_at IS NULL
OR expires_at > now()
```

A implementação do PostgREST deve ser validada no runtime para garantir que o operador utilizado pelo client realmente produza a comparação temporal esperada.

Não alterar o banco por causa desse ponto antes de reproduzir o comportamento no frontend e no Supabase.

---

# 9. ROTAS ATUAIS

O `App.tsx` possui, entre outras:

```text
/
/vagas
/vagas/:slug
/empresas
/empresas/divulgar-vaga
/candidatos
/servicos
/servicos/:slug
/clientes
/parceiros
/fornecedores
/trabalhe-conosco
/processo-seletivo
/sobre
/blog
/blog/:slug
/suporte
/faq
/contato
/privacidade
/termos
/login
/cadastro
/recuperar-senha
/dashboard/*
/dashboard/candidato
/dashboard/empresa
/cadastro/candidato
/cadastro/empresa
```

As rotas públicas não devem depender de RBAC.

As rotas privadas devem depender de autenticação e, quando necessário, de autorização.

---

# 10. CHAT — ESTADO HISTÓRICO

O frontend já possui:

- `ChatWidget` para IA;
- `HumanChatWidget` para atendimento humano;
- fluxo IA → humano;
- Realtime/histórico no frontend.

A arquitetura histórica de chat humano foi criada como Stage 2A, mas a migration original foi movida para `_legacy`.

## Regra para reconstrução

Não copiar a migration histórica literalmente.

O novo chat deve ser refeito em People-First:

```text
chat_rooms
 ├── tenant_id
 ├── visitor/person reference conforme caso de uso
 ├── assigned_person_id
 ├── status
 ├── area
 └── timestamps

chat_messages
 ├── room_id
 ├── tenant_id
 ├── sender_person_id quando aplicável
 ├── role
 ├── content
 └── created_at
```

Para visitantes anônimos, manter um identificador de visitante que não force criação de `people` antes da necessidade.

Para agentes autenticados, preferir `person_id` para a entidade de negócio.

---

# 11. O QUE É HISTÓRICO E NÃO PODE SER REINTRODUZIDO

Não reintroduzir no baseline final:

- `profiles` como identidade principal;
- `tenant_memberships.user_id`;
- `role_assignments.user_id`;
- roles `admin`, `candidato`, `empresa` apenas para satisfazer o frontend;
- migration de chat antiga sem reconciliação;
- secrets no SQL;
- service-role key no frontend;
- scripts de debug como mecanismo de produção;
- schema MySQL legado como fonte de verdade.

---

# PARTE B — VALIDAÇÃO DO SUPABASE REMOTO ANTES DO DROP

## 12. Regra de ouro

O GitHub informa o que **deveria** existir.

O Supabase remoto informa o que **realmente** existe.

Essas duas coisas precisam ser comparadas antes de qualquer destruição.

O repositório não possui atualmente `supabase/config.toml` e o `package.json` não possui scripts oficiais de migration do Supabase CLI. Portanto, **não assumir que todas as migrations do Git foram aplicadas no projeto remoto**.

---

## 13. Inventário remoto obrigatório

Executar no SQL Editor do Supabase e salvar o resultado antes do DROP.

### Tabelas

```sql
select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

### Colunas

```sql
select
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;
```

### Foreign keys

```sql
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
order by tc.table_name, kcu.column_name;
```

### RLS

```sql
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

### Policies

```sql
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

### Functions

```sql
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;
```

### Triggers

```sql
select
  event_object_table,
  trigger_name,
  event_manipulation,
  action_statement
from information_schema.triggers
where event_object_schema = 'public'
order by event_object_table, trigger_name;
```

### Enums

```sql
select
  n.nspname as schema_name,
  t.typname as enum_name,
  e.enumlabel
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
order by t.typname, e.enumsortorder;
```

### Migration history

```sql
select *
from supabase_migrations.schema_migrations
order by version;
```

> Se essa tabela não estiver acessível no projeto, usar o Supabase CLI autenticado para obter a lista de migrations remotas.

---

# 14. Verificações críticas do admin_master

Antes de qualquer DROP, validar:

```sql
select
  p.id,
  p.auth_user_id,
  p.email,
  p.full_name,
  p.status
from public.people p
where p.email = 'evandro_j.o.a@hotmail.com';
```

Depois:

```sql
select
  ra.id,
  ra.person_id,
  ra.role_id,
  r.name as role_name,
  r.is_global,
  ra.tenant_id,
  ra.expires_at
from public.role_assignments ra
join public.roles r on r.id = ra.role_id
join public.people p on p.id = ra.person_id
where p.email = 'evandro_j.o.a@hotmail.com';
```

Resultado obrigatório esperado:

```text
people.auth_user_id = auth.users.id
role = admin_master
is_global = true
tenant_id = null para a atribuição global
```

---

# PARTE C — DECISÃO SOBRE DROP

## 15. Critério de decisão

### Se houver dados importantes

Não executar DROP.

Fazer migração controlada/exportação/importação.

### Se o banco remoto for somente ambiente de desenvolvimento/teste

Pode ser considerado:

```text
backup
↓
inventário
↓
confirmação de ausência de dados necessários
↓
DROP/reset
↓
rebuild canônico
```

### Em qualquer caso

Nunca apagar o banco antes de guardar:

- dump/schema remoto;
- lista de migrations aplicadas;
- tabelas;
- policies;
- functions;
- triggers;
- enums;
- storage buckets;
- configuração de Auth;
- usuários Auth necessários;
- variáveis de ambiente fora do Git.

---

# PARTE D — DEPOIS DA RECONSTRUÇÃO

## 16. Ordem canônica de rebuild

```text
001 Core
 ↓
002 Identity
 ↓
003 Companies
 ↓
004 Candidates
 ↓
005 Jobs
 ↓
006 Applications
 ↓
007 RBAC
 ↓
008 Storage
 ↓
009 Domain Events
 ↓
010 Notifications
 ↓
011 Talent Pool
 ↓
012 RLS Consolidation
 ↓
013 Seed
 ↓
014 RLS complementar
 ↓
016 RBAC recursion fix
 ↓
CHAT PEOPLE-FIRST
 ↓
CHAT IA
 ↓
CHAT HANDOFF
 ↓
SEEDS FINAIS
```

A sequência final deve ser renumerada/normalizada antes da execução definitiva para não manter um buraco sem justificativa entre 014 e 016.

---

# 17. Contrato banco ↔ frontend

## Auth

```text
Supabase Auth
    ↓
AuthProvider
    ↓
people
    ↓
role_assignments
    ↓
roles
    ↓
ProtectedRoute
```

## Dashboard

O dashboard só deve ser liberado quando:

1. sessão existir;
2. `people` existir;
3. membership for resolvido quando necessário;
4. roles forem carregadas;
5. `admin_master` for reconhecido antes do fallback;
6. `ProtectedRoute` validar autorização.

## Public pages

Não dependem de role.

## Candidate / Company UX

Não criar roles RBAC artificiais apenas para representar área de negócio.

Se necessário, usar atributos/perfis de domínio separados do RBAC.

---

# 18. Testes obrigatórios pós-rebuild

## Banco

- [ ] Todas as migrations executam em banco vazio.
- [ ] Nenhuma migration depende de tabela histórica removida.
- [ ] `people` existe.
- [ ] `profiles` não existe no modelo canônico.
- [ ] `tenant_memberships.person_id` existe.
- [ ] `role_assignments.person_id` existe.
- [ ] `admin_master` existe e é global.
- [ ] RLS está habilitado.
- [ ] Policies não entram em recursão.
- [ ] Storage funciona.
- [ ] Chat possui RLS.
- [ ] Chat Realtime funciona.

## Auth

- [ ] Login com usuário válido.
- [ ] Logout.
- [ ] Refresh de sessão.
- [ ] Expiração de sessão.
- [ ] Criação automática de `people` após signup.
- [ ] Sincronização de e-mail.
- [ ] `admin_master` reconhecido.

## Frontend

- [ ] `/login` funciona.
- [ ] `/dashboard/*` bloqueia usuário não autenticado.
- [ ] Role não autorizada é redirecionada.
- [ ] `admin_master` não cai em `member`.
- [ ] `/dashboard/candidato` não depende de role inexistente.
- [ ] `/dashboard/empresa` não depende de role inexistente.
- [ ] Cadastro candidato funciona.
- [ ] Cadastro empresa funciona.
- [ ] Upload de currículo funciona.
- [ ] Candidatura funciona.
- [ ] Chat IA funciona.
- [ ] Handoff IA → humano funciona.
- [ ] Chat humano funciona.

## Build

```text
npm run typecheck
npm run test:run
npm run lint
npm run build
```

---

# 19. Definição de pronto

A reconstrução somente é considerada concluída quando este fluxo estiver verde:

```text
DATABASE
  ↓
AUTH
  ↓
PEOPLE
  ↓
TENANT
  ↓
RBAC
  ↓
RLS
  ↓
FRONTEND AUTH
  ↓
PROTECTED ROUTES
  ↓
DASHBOARD
  ↓
CANDIDATES
  ↓
JOBS
  ↓
APPLICATIONS
  ↓
STORAGE
  ↓
NOTIFICATIONS
  ↓
CHAT IA
  ↓
CHAT HUMANO
  ↓
HANDOFF
  ↓
E2E
```

---

# 20. Instrução direta para Kilo

**Kilo deve seguir este documento como contrato de reconstrução.**

### Kilo NÃO deve:

- executar DROP antes da auditoria remota;
- inventar tabelas;
- inventar roles;
- reintroduzir `profiles`;
- usar `user_id` onde o modelo canônico determina `person_id`;
- copiar migrations `_legacy` diretamente;
- colocar credenciais no SQL;
- colocar service-role key no frontend;
- considerar `supabase/schema.sql` histórico como autoridade superior às migrations People-First mais recentes;
- corrigir um problema de frontend alterando o banco sem evidência.

### Kilo DEVE:

1. auditar o Supabase remoto;
2. comparar remoto × migrations Git;
3. comparar banco × frontend;
4. corrigir primeiro divergências de contrato frontend/RBAC;
5. consolidar o chat no modelo People-First;
6. normalizar a sequência de migrations;
7. gerar baseline de banco vazio reproduzível;
8. executar testes em banco limpo;
9. somente depois considerar reset/drop do ambiente de desenvolvimento;
10. registrar cada mudança em migration versionada.

---

# 21. Conclusão da auditoria atual

**Não existe evidência suficiente para afirmar que o problema é exclusivamente o banco.**

Há evidência clara de que:

1. o repositório possui uma arquitetura People-First mais nova que documentos históricos baseados em `profiles`;
2. o frontend já possui `AuthProvider`, `AuthContext`, `ProtectedRoute` e integração Supabase People-First;
3. o RBAC canônico não contém `candidato`, `empresa` ou `admin`, enquanto duas rotas atuais ainda dependem desses nomes;
4. o chat humano existe historicamente, mas sua migration está em `_legacy` e precisa ser reconciliada;
5. a árvore atual possui um gap de migration entre `014` e `016`;
6. o repositório não comprova sozinho quais migrations estão efetivamente aplicadas no Supabase remoto;
7. portanto, o próximo passo correto é **inventário remoto + reconciliação frontend/banco**, e não DROP imediato.

**Estado:** `NO-DROP — AUDIT REQUIRED`.
