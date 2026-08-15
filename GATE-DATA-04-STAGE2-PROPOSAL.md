# GATE-DATA-04 — Stage 2: Proposta de Schema

> **Fase:** Proposta (somente leitura / planejamento)
> **Data:** 2026-08-15
> **Regra:** Nenhuma alteração no banco até aprovação explícita.

---

## 1. Contexto

O frontend já consome `chat_rooms` e `chat_messages` via Supabase Realtime:

- `HumanChatWidget.tsx`: cria sala, insere mensagens, fecha sala.
- `useRealtimeChat.ts`: carrega histórico, escuta INSERT em `chat_messages`.

Precisamos adicionar essas tabelas ao schema canônico, com suporte a:

- Multi-tenancy
- 5 áreas de atendimento (Central, RH, Financeiro, Comercial, Suporte)
- Handoff automático da IA para humano
- RLS
- Histórico imutável

---

## 2. Proposta de Schema — Chat Humano

### 2.1 `chat_rooms`

```sql
create table public.chat_rooms (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  visitor_id      text not null,
  subject         text,
  status          text not null default 'waiting' check (status in ('waiting','active','closed')),
  area            text check (area in ('central','rh','financeiro','comercial','suporte')),
  assigned_to     uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.chat_rooms enable row level security;

create policy "Chat rooms visible within tenant"
  on public.chat_rooms for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Chat rooms manageable within tenant"
  on public.chat_rooms for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Chat rooms updatable within tenant"
  on public.chat_rooms for update
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
        and tm.membership_role in ('owner','admin','manager')
    )
  );

create index idx_chat_rooms_tenant on public.chat_rooms(tenant_id);
create index idx_chat_rooms_visitor on public.chat_rooms(visitor_id);
create index idx_chat_rooms_status on public.chat_rooms(status);
create index idx_chat_rooms_area on public.chat_rooms(area);
```

### 2.2 `chat_messages`

```sql
create table public.chat_messages (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  room_id         uuid not null references public.chat_rooms(id) on delete cascade,
  role            text not null check (role in ('user','assistant','system','agent')),
  content         text not null,
  created_at      timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "Chat messages visible within tenant"
  on public.chat_messages for select
  using (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create policy "Chat messages insertable within tenant"
  on public.chat_messages for insert
  with check (
    tenant_id in (
      select tm.tenant_id from public.tenant_memberships tm
      where tm.user_id = auth.uid()
    )
  );

create index idx_chat_messages_tenant on public.chat_messages(tenant_id);
create index idx_chat_messages_room on public.chat_messages(room_id);
create index idx_chat_messages_created on public.chat_messages(created_at);
```

---

## 3. Modelo de Dados — Chat Humano

### 3.1 Fluxo esperado

```
Visitante
   │
   ├── cria chat_room (status='waiting', area='central')
   │
   ├── envia chat_messages (role='user')
   │
   ├── IA classifica intenção e área
   │
   ├── handoff para atendente (status='active', assigned_to=user_id)
   │
   └── atendente responde (role='agent')
```

### 3.2 Áreas de atendimento

| Área         | Uso                                    |
| ------------ | -------------------------------------- |
| `central`    | Atendimento geral                      |
| `rh`         | Vagas, currículos, processos seletivos |
| `financeiro` | Orçamentos, contratos, pagamentos      |
| `comercial`  | Vendas, parcerias, fornecedores        |
| `suporte`    | Suporte técnico, tickets               |

### 3.3 Compatibilidade com frontend

O frontend espera:

```typescript
// chat_rooms
{
  id: string;
  visitor_id: string;
  status: 'waiting' | 'active' | 'closed';
  subject: string | null;
  created_at: string;
  updated_at: string;
}

// chat_messages
{
  id: string;
  room_id: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  created_at: string;
}
```

A proposta **é compatível** com o que o frontend consome.

---

## 4. Proposta de Schema — Storage + RLS

### 4.1 Buckets

| Bucket       | Finalidade               | Acesso                  |
| ------------ | ------------------------ | ----------------------- |
| `curriculos` | PDFs de currículos       | Privado, RLS por tenant |
| `documents`  | Documentos de candidatos | Privado, RLS por tenant |

### 4.2 RLS para Storage

```sql
-- Bucket: curriculos
insert into storage.buckets (id, name, public)
values ('curriculos', 'curriculos', false)
on conflict (id) do nothing;

-- Bucket: documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- RLS policies para storage.objects
create policy "Curriculos visible within tenant"
  on storage.objects for select
  using (
    bucket_id = 'curriculos'
    and (
      select tenant_id from public.candidates c
      where c.id = (storage.foldername(name))[1]::uuid
      and c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );

create policy "Curriculos insertable within tenant"
  on storage.objects for insert
  with check (
    bucket_id = 'curriculos'
    and (
      select tenant_id from public.candidates c
      where c.id = (storage.foldername(name))[1]::uuid
      and c.tenant_id in (
        select tm.tenant_id from public.tenant_memberships tm
        where tm.user_id = auth.uid()
      )
    )
  );
```

> Nota: A política acima assume path `{tenant_id}/{candidate_id}/{filename}`. O path exato deve ser definido na aplicação.

---

## 5. Proposta de Mapping — MySQL Legado → PostgreSQL Canônico

### 5.1 Tabelas migráveis

| MySQL legado          | PostgreSQL canônico         | Status                       |
| --------------------- | --------------------------- | ---------------------------- |
| `empresa`             | `tenants` + `companies`     | ✅ Mapeável                  |
| `usuarios`            | `profiles` + `auth.users`   | ✅ Mapeável (sem senha_hash) |
| `permissoes`          | `tenant_memberships`        | ✅ Mapeável                  |
| `candidatos`          | `candidates`                | ✅ Mapeável                  |
| `curriculos`          | `curricula`                 | ✅ Mapeável                  |
| `experiencias`        | `experiences`               | ✅ Mapeável                  |
| `formacoes`           | `education`                 | ✅ Mapeável                  |
| `cursos`              | `courses`                   | ✅ Mapeável                  |
| `idiomas`             | `languages`                 | ✅ Mapeável                  |
| `habilidades`         | `skills`                    | ✅ Mapeável                  |
| `vagas`               | `jobs`                      | ✅ Mapeável                  |
| `candidaturas`        | `applications`              | ✅ Mapeável                  |
| `processos_seletivos` | `recruitment_processes`     | ✅ Mapeável                  |
| `entrevistas`         | `interviews`                | ✅ Mapeável                  |
| `avaliacoes`          | `evaluations`               | ✅ Mapeável                  |
| `vaga_favoritos`      | `favorite_jobs`             | ✅ Mapeável                  |
| `clientes`            | `companies` (type='client') | ✅ Mapeável                  |
| `servicos`            | `services`                  | ✅ Mapeável                  |
| `leads`               | `leads`                     | ✅ Mapeável                  |
| `tickets`             | `tickets`                   | ✅ Mapeável                  |
| `notificacoes`        | `notifications`             | ✅ Mapeável                  |
| `logs`                | `audit_logs`                | ✅ Mapeável                  |
| `webhooks`            | `webhooks`                  | ✅ Mapeável                  |
| `fila_automacao`      | `automation_queue`          | ✅ Mapeável                  |
| `mensagens`           | `whatsapp_messages`         | ✅ Mapeável                  |
| `emails_enviados`     | `emails`                    | ✅ Mapeável                  |
| `conversas_ia`        | `ai_conversations`          | ✅ Mapeável                  |
| `documentos`          | `candidate_documents`       | ✅ Mapeável                  |

### 5.2 Tabelas sem mapeamento direto

| MySQL legado         | Motivo                                            | Ação                   |
| -------------------- | ------------------------------------------------- | ---------------------- |
| `cliente_servicos`   | Substituído por `services` + `companies.type`     | Não migrar             |
| `contratos`          | Não existe no canônico                            | Avaliar criação futura |
| `colaboradores`      | Substituído por `profiles` + `tenant_memberships` | Não migrar             |
| `alocacoes`          | Sem equivalente no canônico                       | Avaliar criação futura |
| `eventos_automacao`  | Eventos são strings em `automation_queue`         | Não migrar             |
| `fluxos_automacao`   | Sem equivalente direto                            | Não migrar             |
| `templates_email`    | Sem equivalente direto                            | Não migrar             |
| `templates_whatsapp` | Sem equivalente direto                            | Não migrar             |

### 5.3 Regras de migração

1. **Não executar DROP** em tabelas legadas.
2. **Script idempotente**: `INSERT ... ON CONFLICT DO NOTHING`.
3. **Tenant fixo**: migrar para tenant `js-empregos`.
4. **Auth**: `auth.users` não pode ser populado diretamente; usar `profiles` + trigger.
5. **Senhas**: não migrar `senha_hash`; usuários devem fazer reset de senha.

---

## 6. Próximos passos (após aprovação)

1. Aprovar proposta de `chat_rooms` + `chat_messages`.
2. Aprovar proposta de Storage + RLS.
3. Aprovar mapping de migração legado.
4. Criar `supabase/migrations/20260101_chat.sql`.
5. Criar `supabase/migrations/20260102_storage.sql`.
6. Criar `supabase/migrations/20260103_migrate_legacy.sql` (somente leitura/insert).
7. Testes de integração.
8. Apenas depois: `GATE-CHAT-REALTIME-01`.

---

## 7. Bloqueadores mantidos

| Bloqueador      | Status | Ação pendente                        |
| --------------- | ------ | ------------------------------------ |
| Chat humano     | 🔴     | Criar `chat_rooms` + `chat_messages` |
| Storage/RLS     | 🟠     | Criar buckets + políticas            |
| Migração legado | 🟡     | Definir mapping + script idempotente |

---

**Fim da proposta.**
