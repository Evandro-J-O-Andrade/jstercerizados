-- =============================================================================
-- GATE-DATA-04 Stage 2A — Chat Humano
-- =============================================================================
-- Cria tabelas chat_rooms e chat_messages com multi-tenancy, areas de
-- atendimento, RLS e indexes.
-- Nenhuma tabela existente é alterada ou removida.
-- =============================================================================

-- =============================================================================
-- 01 — CHAT ROOMS
-- =============================================================================
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

-- =============================================================================
-- 02 — CHAT MESSAGES
-- =============================================================================
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

-- =============================================================================
-- 03 — UPDATED_AT TRIGGERS
-- =============================================================================

create or replace function public.update_chat_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger update_chat_rooms_updated_at
  before update on public.chat_rooms
  for each row execute procedure public.update_chat_updated_at();
