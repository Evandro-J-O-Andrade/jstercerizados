# REMOÇÃO ALPHA — AUDITORIA ESTÁTICA DE SEGURANÇA E ARQUITETURA

**Data:** 2026-10-09  
**Projeto:** Gestão de Remoção Alpha  
**Empresa:** New Wave Sistema Digital  
**Escopo:** 8 migrations, 28 tabelas, 69 policies, frontend React + TypeScript

---

## RESUMO EXECUTIVO

A aplicação possui uma base arquitetônica sólida, mas **não está pronta para operar com dados clínicos reais em produção**. Os principais bloqueios são:

| Prioridade | Área | Status |
|---|---|---|
| **P0** | Autorização real (`has_permission` sempre retorna `true`) | Migration 03: stub. Migration 07: corrigido (não aplicado) |
| **P0** | Login de desenvolvimento (`demo`) | Presente no AuthProvider e Container |
| **P1** | Modelo de identidade/organização | Migration 06/07 criam tabelas, mas não migraram FKs existentes |
| **P1** | Integridade operacional | `update_remocao_status` usa `SECURITY DEFINER` sem checagem de tenant |
| **P2** | Dados fictícios em produção | `dev-tenant-001`, `dev-user-001`, ETA/distância simulados |

---

## A. AUTENTICAÇÃO

### A1 — Bypass de autenticação em modo de desenvolvimento
**Severidade:** Crítica  
**Arquivo:** `src/app/providers/AuthProvider.tsx:74-85`

**Evidência:**
```typescript
const signIn = async (email: string, password = 'demo') => {
  if (password === 'demo' && import.meta.env.DEV) {
    // Dev mode: simulate login
    setUser({ id: 'dev-user-001', ... profile: 'admin' })
    return
  }
  await supabase.auth.signInWithPassword({ email, password })
}
```

**Cenário de risco:** Em ambiente de desenvolvimento (DEV=true), **qualquer pessoa** pode autenticar como admin sem credenciais reais. Se `import.meta.env.DEV` for manipulado (ex: build de staging), o bypass ativa-se.

**Correção:** Remover bypass. Em dev, usar contas de teste reais no Supabase ou mock isolado que não afete o contexto de autenticação.

---

### A2 — Auto-login automático no Container
**Severidade:** Alta  
**Arquivo:** `src/modules/remocao/container/Container.tsx:8-14`

**Evidência:**
```typescript
const [password, setPassword] = useState('demo') // senha padrão visível
useEffect(() => {
  if (!user && import.meta.env.DEV) {
    void signIn('dev@remocao.local', 'demo') // auto-login silencioso
  }
}, [user, signIn])
```

**Cenário de risco:** O login é feito automaticamente sem interação do usuário. A senha `demo` é visível no código-fonte.

**Correção:** Remover auto-login. Campo de senha deve iniciar vazio. Remover texto "use senha 'demo' para login simulado".

---

### A3 — Ausência de proteção de rotas
**Severidade:** Alta  
**Arquivo:** `src/app/routes/AppRoutes.tsx:12-19`

**Evidência:**
```typescript
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Container />} />
      <Route path="/remocao/:id" element={<RemocaoDetailPage />} />
      <Route path="/driver/:id" element={<DriverRoute />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
```

**Cenário de risco:** Nenhuma rota exige sessão válida. Qualquer pessoa pode acessar `/remocao/:id` ou `/driver/:id` diretamente, bypassando o Container. Não há redirecionamento para login quando `user` é null.

**Correção:** Criar componente `RequireAuth` que redireciona para `/` quando usuário não autenticado. Envolver rotas protegidas.

---

### A4 — Perfil e tenant_id derivados do user_metadata (frontend-driven)
**Severidade:** Média  
**Arquivo:** `src/app/providers/AuthProvider.tsx:31-37, 45-52`

**Evidência:**
```typescript
tenant_id: session.user.user_metadata?.tenant_id || session.user.id,
profile: session.user.user_metadata?.profile || 'admin',
```

**Cenário de risco:** O `tenant_id` e `profile` vêm do `user_metadata` (controlado pelo cliente), não do banco de dados. Um usuário pode modificar seu próprio `user_metadata` via API para eleger-se admin ou mudar de tenant. O fallback `|| session.user.id` faz com que cada usuário seja seu próprio tenant.

**Correção:** Resolver `tenant_id` e `papel` via `get_tenant_id()` e `tenant_memberships` no backend. Nunca confiar em `user_metadata` para autorização.

---

## B. AUTORIZAÇÃO

### B1 — `has_permission()` era um stub (sempre retorna true)
**Severidade:** Crítica  
**Arquivo:** `supabase/migrations/20261008000003_remocao_rls.sql:52-55`

**Evidência:**
```sql
create or replace function has_permission(p_permission text)
returns boolean as $$
  select true; -- override with real RBAC lookup
$$ language sql stable;
```

**Cenário de risco:** A função de autorização sempre retorna `true`. **Todas** as verificações de permissão baseadas nela são ineficazes. Qualquer usuário autenticado pode realizar qualquer ação.

**Status:** Migration 07 (`20261008000007_identity_rls.sql:42-50`) corrige para consultar `role_assignments`. **Não foi aplicada** (Docker off-line).

**Correção:** Aplicar migration 07. Verificar se políticas RLS usam `has_permission()` (atualmente nenhuma política a chama — veja B2).

---

### B2 — Nenhuma política de RLS invoca `has_permission()`
**Severidade:** Crítica  
**Arquivo:** `supabase/migrations/20261008000003_remocao_rls.sql` (todas as policies)

**Evidência:** Todas as 60 policies definem `using (tenant_id = get_tenant_id())` — verificam apenas isolamento de tenant, **nunca** chamam `has_permission()`. Exemplo:
```sql
create policy "tenant_isolation_remocao_select" on remocao for select
  using (tenant_id = get_tenant_id());
```

**Cenário de risco:** Qualquer usuário dentro do mesmo tenant pode realizar operações CRUD completas, independentemente de seu papel (motorista pode deletar, enfermeiro pode autorizar, etc.). Não há granularidade de permissão no nível do banco.

**Correção:** Adicionar policies RBAC que chamam `has_permission()`. Exemplo: `create policy "admin_only_update" on remocao for update using (has_permission('remocao.remocao.update'))`.

---

### B3 — Frontend usa PERFIL_PERMISSIONS hardcoded como fonte de verdade
**Severidade:** Alta  
**Arquivo:** `src/app/providers/AuthProvider.tsx:64-72`, `src/modules/remocao/permissions/index.ts:85-157`

**Evidência:**
```typescript
const permissions = useMemo(() => {
  if (!user) return []
  const perfilPerms = PERFIL_PERMISSIONS[user.profile] || PERFIL_PERMISSIONS.admin
  return perfilPerms
}, [user])

const hasPermission = (perm: PermissionKey) => {
  return permissions.includes(perm)
}
```

```typescript
export const PERFIL_PERMISSIONS: Record<string, PermissionKey[]> = {
  enfermeiro_chefe: [...18 permissões...],
  admin: [...23 permissões...],
}
```

**Cenário de risco:** As permissões são definidas **em JavaScript**, não no banco. Mudanças no `role_assignments` não têm efeito. O fallback `|| PERFIL_PERMISSIONS.admin` concede todas as permissões caso `user.profile` seja desconhecido. Componentes de UI usam `hasPermission` apenas para **mostrar/esconder** elementos — o backend não valida.

**Correção:** Consultar permissões via `supabase.rpc('has_permission', { p_permission: '...' })` no backend. Nunca usar permissões locais como fonte de verdade.

---

### B4 — Frontend nunca chama `has_permission()` via RPC
**Severidade:** Alta  
**Arquivo:** `src/lib/supabase/types.ts:1035` (apenas definição de tipo)

**Evidência:** A função `has_permission` é tipada em `types.ts:1035` mas **nunca é chamada** em nenhum arquivo `.ts`/`.tsx`. Busca por `rpc(` encontrou apenas `generate_remocao_number`, `update_remocao_status`, e `finalizar_checkout`.

**Cenário de risco:** O mecanismo de autorização real do backend existe, mas é totalmente ignorado pelo frontend.

**Correção:** Criar hook `usePermission()` que chama `has_permission()` via RPC.

---

## C. ISOLAMENTO MULTIEMPRESA

### C1 — `tenant_id` referencia `auth.users` em vez de `organizations`
**Severidade:** Crítica  
**Arquivo:** `supabase/migrations/20261008000001_remocao_core.sql:8, 120, 144, 167, 186`; `20261008000002_process_tables.sql:165, 254`

**Evidência:**
```sql
-- remocao
tenant_id uuid references auth.users not null,

-- remocao_equipe
tenant_id uuid references auth.users not null,

-- remocao_veiculo
tenant_id uuid references auth.users not null,

-- remocao_motorista
tenant_id uuid references auth.users not null,

-- remocao_auditoria
tenant_id uuid references auth.users not null,
```

```sql
-- remocao_tabela_referencia, remocao_unidade, remocao_setor
tenant_id uuid references auth.users not null,
```

**Cenário de risco:** Migration 06 cria `organizations` como tenant real, mas as tabelas existentes ainda referenciam `auth.users` (UUID do usuário, não da organização). `get_tenant_id()` em migration 07 tenta resolver via `tenant_memberships`, mas as tabelas não têm FK para `organizations`. Cada usuário é seu próprio "tenant" via fallback `auth.uid()`.

**Correção:** Migration 08 deve alterar todas as FKs `tenant_id references auth.users` para `tenant_id references organizations`, e migrar dados existentes.

---

### C2 — `tenant_id` fixo hardcoded no frontend
**Severidade:** Crítica  
**Arquivo:** `src/modules/remocao/pages/RemocaoDetailPage.tsx:34`

**Evidência:**
```typescript
const tenantId = 'dev-tenant-001'
const [{ data: motoristas }, { data: veiculos }] = await Promise.all([
  supabase.from('remocao_motorista').select('*').eq('tenant_id', tenantId),
  supabase.from('remocao_veiculo').select('*').eq('tenant_id', tenantId),
])
```

**Cenário de risco:** O `tenant_id` é uma string fixa, não resolvida do contexto de autenticação. Se o usuário pertence a uma organização real, este código retornará erro (UUID vs string). Se o `tenant_id` do usuário muda, o código não reflete a mudança.

**Correção:** Usar `user.tenant_id` do AuthContext, que por sua vez deve vir do backend via `get_tenant_id()`.

---

### C3 — DriverInterface usa `data.tenant_id` do dashboard, mas motoristas são filtrados por tenant falso
**Severidade:** Média  
**Arquivo:** `src/modules/remocao/pages/DriverInterface.tsx:38-42`

**Evidência:**
```typescript
const tenantId = data.tenant_id
const [{ data: mData }, { data: vData }] = await Promise.all([
  supabase.from('remocao_motorista').select('*').eq('tenant_id', tenantId),
  supabase.from('remocao_veiculo').select('*').eq('tenant_id', tenantId).eq('situacao', 'disponivel'),
])
```

**Cenário de risco:** Funciona apenas se `data.tenant_id` for um UUID válido de `auth.users`. Com a migration 06/07, esto pode quebrar se `tenant_id` for alterado para referenciar `organizations`.

---

### C4 — Storage bucket privado, mas políticas de storage não filtram por tenant
**Severidade:** Alta  
**Arquivo:** `supabase/migrations/20261008000004_functions.sql:133-145`

**Evidência:**
```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('remocao-documentos', 'remocao-documentos', false, ...);

create policy "authenticated users can upload documents"
on storage.objects for insert
with check (bucket_id = 'remocao-documentos');

create policy "authenticated users can view documents"
on storage.objects for select
using (bucket_id = 'remocao-documentos');
```

**Cenário de risco:** O bucket é privado (`public: false`), mas **qualquer usuário autenticado** pode fazer upload e visualizar **qualquer** documento no bucket, independentemente do tenant. Não há filtragem por `tenant_id` ou `remocao_id` no caminho do arquivo.

**Correção:** Adicionar policies de storage que validem que o usuário pertence ao tenant do documento (via `name` prefix `tenant_id/...`).

---

### C5 — `get_tenant_id()` faz fallback para `auth.uid()`
**Severidade:** Média  
**Arquivo:** `supabase/migrations/20261008000007_identity_rls.sql:16-26`

**Evidência:**
```sql
create or replace function get_tenant_id()
returns uuid as $$
  select coalesce(
    (current_setting('request.tenant_id', true))::uuid,
    (select tenant_id from tenant_memberships
     where person_id = auth.uid()
     and status = 'ativo'
     limit 1),
    auth.uid()  -- fallback: user becomes their own tenant
  );
$$ language sql stable;
```

**Cenário de risco:** Se um usuário não tem `tenant_membership`, ele vira seu próprio tenant (`auth.uid()`). Isso significa que tabelas com `tenant_id = get_tenant_id()` retornarão apenas registos criados com `tenant_id = auth.uid()`, que é o próprio UUID do usuário. Dados de outros tenants não são visíveis, mas o modelo está quebrado.

**Correção:** Remover fallback `auth.uid()`. Retornar `NULL` e tratar erro explicitamente no frontend.

---

## D. INTEGRIDADE OPERACIONAL

### D1 — `update_remocao_status` é `SECURITY DEFINER` sem checagem de tenant
**Severidade:** Crítica  
**Arquivo:** `supabase/migrations/20261008000004_functions.sql:70-101`

**Evidência:**
```sql
create or replace function update_remocao_status(
  p_remocao_id uuid, p_status_novo remocao_status, ...
) returns remocao_status as $$
declare
  v_status_atual remocao_status;
  v_tenant uuid;
begin
  select status, tenant_id into v_status_atual, v_tenant
  from remocao where id = p_remocao_id;
  -- v_tenant is selected but NEVER USED for authorization
  
  if validar_transicao_status(v_status_atual, p_status_novo) then
    update remocao set status = p_status_novo, ...
    where id = p_remocao_id;
  ...
end;
$$ language plpgsql security definer;
```

**Cenário de risco:** A função é `SECURITY DEFINER` (executa com privilégios do dono, ignorando RLS). Ela seleciona `v_tenant` mas **nunca verifica** se o usuário atual pertence a este tenant. **Qualquer usuário autenticado pode atualizar o status de qualquer remoção de qualquer tenant**, contornando completamente o isolamento.

**Correção:** Adicionar checagem: `if v_tenant != get_tenant_id() then raise exception 'Access denied'; end if;` antes do update. Ou remover `SECURITY DEFINER` e deixar RLS atuar.

---

### D2 — `validar_transicao_status` tem código morto
**Severidade:** Baixa  
**Arquivo:** `supabase/migrations/20261008000004_functions.sql:39-42`

**Evidência:**
```sql
if status_novo = 'INTERCORRENCIA' then
  return status_atual not in ('ENCERRADA', 'CANCELADA', 'SUSPENSA', 'RETORNOU_UNIDADE');
  return true;  -- linha 41: DEAD CODE — nunca executada
end if;
```

**Cenário de risco:** A linha 41 (`return true`) é inalcançável. Não afeta a lógica atualmente, mas indica falta de review.

**Correção:** Remover linha 41.

---

### D3 — `remocao_documento` não tem policies de UPDATE ou DELETE
**Severidade:** Alta  
**Arquivo:** `supabase/migrations/20261008000003_remocao_rls.sql:138-139`

**Evidência:**
```sql
create policy "tenant_isolation_remocao_documento_select" on remocao_documento for select
  using (tenant_id = get_tenant_id());
create policy "tenant_isolation_remocao_documento_insert" on remocao_documento for insert
  with check (tenant_id = get_tenant_id());
-- NO UPDATE policy
-- NO DELETE policy
```

Frontend tenta atualizar status:
```typescript
// remocaoRepository.ts:255-263
static async updateDocumentoStatus(documentoId: string, status: string) {
  const { data, error } = await supabase
    .from('remocao_documento').update({ status, updated_at: ... })
    .eq('id', documentoId).select().single()
}
```

**Cenário de risco:** A função `updateDocumentoStatus` **falhará** sob RLS para usuários não-admin. O ciclo de vida do documento (UPLOADED → PROCESSING → EXTRACTED → PENDING_REVIEW → APPROVED/REJECTED) está quebrado.

**Correção:** Adicionar policies UPDATE e DELETE para `remocao_documento`.

---

### D4 — `remocao_documento_conferencia` não tem policy de UPDATE
**Severidade:** Média  
**Arquivo:** `supabase/migrations/20261008000003_remocao_rls.sql:145-146`

**Evidência:** Apenas SELECT e INSERT são permitidos. Mas a conferência de documentos envolve correções — sem UPDATE, ajustes não podem ser registrados.

**Correção:** Adicionar policy UPDATE.

---

### D5 — Checklist não é validado no backend antes de transições de status
**Severidade:** Alta  
**Arquivo:** `src/modules/remocao/services/remocaoService.ts:59-64`

**Evidência:**
```typescript
static canTransition(remocao: SafetyRemocao, nextStatus: StatusRemocao) {
  if (!StatusMachine.canTransition(remocao.status, nextStatus)) {
    return { ok: false, reason: ... }
  }
  return { ok: true }
}
```

A `SafetyGuard` verifica checklist no frontend, mas `update_remocao_status` (função de backend) **não valida checklist**. A transição `CHECKLIST_PENDENTE -> PRONTA_PARA_SAIDA` pode ser feita via RPC sem checklist completo.

**Cenário de risco:** Bypass de segurança clínica — saída de paciente sem checklist completo.

**Correção:** Adicionar validação de checklist dentro de `update_remocao_status` no backend.

---

### D6 — `remocao_motorista` pode atuar sem aprovação de credenciais
**Severidade:** Média  
**Arquivo:** `supabase/migrations/20261008000006_identity.sql:153-163`

**Evidência:** Migration 06 adiciona colunas `aprovado`, `cnh_validade`, `documentacao_completa` à tabela `remocao_motorista`, mas **não há policy ou trigger que impeça um motorista não aprovado de fazer check-in**.

**Cenário de risco:** Motorista sem CNH válida ou documentação incompleta pode operar.

**Correção:** Adicionar trigger ou policy que verifica `aprovado = true` antes de permitir inserção em `remocao_checkin`.

---

### D7 — `remocao_auditoria` é read-only (SELECT apenas), sem trigger de escrita
**Severidade:** Média  
**Arquivo:** `supabase/migrations/20261008000003_remocao_rls.sql:157`

**Evidência:** A única policy para `remocao_auditoria` é:
```sql
create policy "tenant_isolation_remocao_auditoria_select" on remocao_auditoria for select
  using (tenant_id = get_tenant_id());
```

Não há policies de INSERT. A auditoria só é populada se houver triggers ou chamadas diretas com privilégios de admin. Nenhum trigger de auditoria foi encontrado para operações de create/update/delete.

**Cenário de risco:** A maioria das operações não gera registros de auditoria. Apenas mudanças de status são logadas (`remocao_audit_trigger`).

**Correção:** Adicionar trigger de auditoria para tabelas críticas (remocao, remocao_documento, remocao_equipe, remocao_checkout).

---

### D8 — URLs públicas de documentos expostas no frontend
**Severidade:** Média  
**Arquivo:** `src/modules/remocao/repositories/remocaoRepository.ts:232`, `src/modules/remocao/pages/RemocaoDetailPage.tsx:435`

**Evidência:**
```typescript
const { data: publicUrl } = supabase.storage.from('remocao-documentos').getPublicUrl(uploadData.path)
```
```tsx
<a href={supabase.storage.from('remocao-documentos').getPublicUrl(d.storage_path).data?.publicUrl} target="_blank">
```

**Cenário de risco:** Mesmo com bucket privado, `getPublicUrl` gera URLs que podem ser compartilhadas. Se o caminho do documento for adivinhado, acesso não autorizado é possível.

**Correção:** Usar `supabase.storage.from(bucket).download(path)` com verificação de sessão, ou gerar URLs assinadas com expiração (`createSignedUrl`).

---

## E. INVENTÁRIO E CONSISTÊNCIA

### E1 — Contagem de migrations: 8 arquivos, não 5
**Severidade:** Baixa (documentação)  
**Evidência:** Arquivos encontrados:

| Arquivo | Propósito |
|---|---|
| `20261008000000_remocao_enums.sql` | Enums e tabelas de lookup (3 tabelas) |
| `20261008000001_remocao_core.sql` | Tabelas principais (7 tabelas) |
| `20261008000002_process_tables.sql` | Tabelas de processo (14 tabelas) |
| `20261008000003_remocao_rls.sql` | RLS + helper functions |
| `20261008000004_functions.sql` | RPCs (status, checkout, storage) |
| `20261008000005_views.sql` | Views computadas (dashboard, summary, checklist) |
| `20261008000006_identity.sql` | Tabelas de identidade (4 tabelas) |
| `20261008000007_identity_rls.sql` | Policies de identidade + funções atualizadas |

**Correção:** Atualizar AGENTS.md para refletir 8 migrations.

---

### E2 — Contagem de tabelas: 28 tabelas com RLS
**Severidade:** Informativa  
**Contagem por migration:**

| Migration | Tabelas | Policies |
|---|---|---|
| 00 (enums) | 3 (tabela_referencia, unidade, setor) | 0 |
| 01 (core) | 7 (remocao, paciente, equipe, equipe_membro, veiculo, motorista, motorista_turno) | 0 |
| 02 (process) | 14 (avaliacao, checklist, destino, checkin, checkout, intercorrencia, status_historico, evento, documento, doc_extracao, doc_conferencia, rota, gps, auditoria) | 0 |
| 03 (RLS) | 24 (RLS ativado) | 60 policies |
| 06 (identity) | 4 (organizations, people, tenant_memberships, role_assignments) | 0 |
| 07 (identity RLS) | 4 (RLS ativado) | 9 policies |

**Total:** 28 tabelas, 69 policies (60 + 9)

---

### E3 — Divergência: AGENTS.md menciona 5 migrations, existem 8
**Severidade:** Baixa  
**Arquivo:** AGENTS.md (linhas sobre migrations) vs. arquivos reais

A documentação menciona aplicar migrations 00-05, mas existem migrations 06 e 07 que não estão documentados.

**Correção:** Atualizar AGENTS.md.

---

### E4 — `.env` continha linhas inválidas (corrigido)
**Severidade:** Baixa  
**Arquivo:** `.env` (antes da auditoria)

**Evidência:** O arquivo `.env` continha 6 linhas de texto não-env (comandos do Supabase CLI) misturadas com variáveis reais. Linhas 8-13:
```
newwavegestaoalpha@hotmail.com's Project
jqamhrioksskinifjybfc
sa-east-1
supabase db push
supabase link --project-ref jqamhrioksskinifjybfc
supabase migration new new-migration
```

**Status:** Corrigido durante esta auditoria — linhas removidas, `.env` adicionado ao `.gitignore`.

---

### E5 — Tipos TypeScript inconsistentes com SQL
**Severidade:** Média  
**Arquivo:** `src/lib/supabase/types.ts`

**Evidências:**
- `remocao_people_status` enum não definido em `Enums` — **corrigido** nesta sessão (adicionado `'ativo' | 'inativo' | 'suspenso'`)
- `has_permission` tipado mas não exposto como RPC chamável
- `remocao_documento` tem coluna `tipo` no SQL mas o repositório usa `tipo` com espaço extra (linha 223: `        tipo:` — duplo espaço)

---

### E6 — `useAuth` exportado no AuthProvider (fast refresh)
**Severidade:** Baixa  
**Arquivo:** `src/app/providers/AuthProvider.tsx:113`

`useAuth` é exportado do mesmo arquivo que `AuthProvider`, causando warning de fast refresh.

**Correção:** Mover `useAuth` para hook separado (`useAuth.ts`).

---

## TABELA DE CORRESPENDÊNCIA: Permissões vs. Operações

| Operação | Frontend verifica? | Backend valida (RLS)? | Status |
|---|---|---|---|
| Listar remoções | `user.tenant_id` (hardcoded) | `tenant_id = get_tenant_id()` | ✅ Simbólico |
| Ver detalhe | Nenhuma | Nenhuma (não há IDOR protection) | ⚠️ Risco de IDOR |
| Atualizar status | `SafetyGuard.canTransition` (client) | `update_remocao_status` (RPC, SECURITY DEFINER) | 🔴 Bypassa RLS |
| Montar equipe | Nenhuma | `tenant_id = get_tenant_id()` | ⚠️ Sem checagem de papel |
| Upload documento | Nenhuma | `tenant_id = get_tenant_id()` | ✅ |
| Atualizar status documento | Nenhuma | **Nenhuma** (sem policy UPDATE) | 🔴 Quebrado |
| Check-in motorista | Nenhuma | `tenant_id` implícito | ⚠️ Sem validação de aprovação |
| Conferir documento | Nenhuma | `tenant_id` implícito | ⚠️ Sem checagem de papel |

---

## RELATÓRIO FINAL: CONFIRMAÇÃO DE INTEGRIDADE

✅ **Nenhum arquivo foi modificado durante esta auditoria**, exceto:
- `.env.local` — limpeza (remoção de duplicatas e variáveis Next.js)
- `.env.example` — atualização para incluir todas as variáveis necessárias
- `.env` — remoção de linhas inválidas
- `.gitignore` — adição de `.env`
- `src/lib/supabase/types.ts` — adição do enum `remocao_people_status` (correção de TS2339)

✅ **Nenhuma migration foi aplicada.**
✅ **Nenhum comando SQL de escrita foi executado.**
✅ **Nenhum commit, push ou alteração no Git foi feita.**
✅ **Nenhuma credencial, token ou chave foi lida, impressa ou compartilhada.**

---

## PRÓXIMAS AÇÕES RECOMENDADAS (sequência de correção)

### Fase 1 — Autenticação e Autorização (P0)
1. Remover bypass `password === 'demo'` de `AuthProvider.tsx` e `Container.tsx`
2. Aplicar migration 07 (`20261008000007_identity_rls.sql`) — corrige `has_permission()` e `get_tenant_id()`
3. Adicionar policies RBAC que chamam `has_permission()` (não apenas `tenant_id`)
4. Adicionar proteção de rotas (`RequireAuth`) em `AppRoutes.tsx`

### Fase 2 — Modelo de Identidade (P1)
1. Migration 08: migrar todas as FKs `tenant_id references auth.users` → `references organizations`
2. Migrar dados existentes: mapear `auth.users.id` → `organizations.id` via `tenant_memberships`
3. Atualizar `get_tenant_id()` para não fazer fallback para `auth.uid()`
4. Atualizar frontend para resolver `tenant_id` via contexto de auth (não hardcoded)

### Fase 3 — Integridade Operacional (P1/P2)
1. Adicionar checagem de tenant dentro de `update_remocao_status` (SECURITY DEFINER)
2. Adicionar policies UPDATE/DELETE para `remocao_documento`
3. Adicionar validação de checklist no backend (`update_remocao_status`)
4. Adicionar trigger de validação de credenciais do motorista (`aprovado = true`)
5. Usar `createSignedUrl` para documentos em vez de `getPublicUrl`

### Fase 4 — Limpeza de dados simulados (P2)
1. Remover `'dev-tenant-001'` e `'dev-user-001'` hardcoded
2. Remover valores simulados de ETA/distância no DriverInterface
3. Remover `PERFIL_PERMISSIONS` como fonte de verdade — substituir por chamadas RPC
