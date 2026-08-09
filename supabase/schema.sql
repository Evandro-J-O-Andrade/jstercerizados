-- Chat rooms table
create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  agent_id uuid references public.profiles(id) on delete set null,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'closed')),
  subject text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chat messages table
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  role text not null check (role in ('visitor', 'agent', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_chat_messages_room_id on public.chat_messages(room_id);
create index if not exists idx_chat_messages_created_at on public.chat_messages(created_at);
create index if not exists idx_chat_rooms_visitor_id on public.chat_rooms(visitor_id);

-- Enable RLS
alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;

-- Policies
create policy "Visitors can create rooms"
  on public.chat_rooms for insert
  with check (true);

create policy "Visitors can view own rooms"
  on public.chat_rooms for select
  using (visitor_id = current_setting('app.visitor_id', true));

create policy "Agents can view all rooms"
  on public.chat_rooms for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'agent'
    )
  );

create policy "Visitors can insert messages in own rooms"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.chat_rooms
      where chat_rooms.id = room_id
      and chat_rooms.visitor_id = current_setting('app.visitor_id', true)
    )
  );

create policy "Visitors can view messages in own rooms"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_rooms
      where chat_rooms.id = room_id
      and chat_rooms.visitor_id = current_setting('app.visitor_id', true)
    )
  );

create policy "Agents can view messages in all rooms"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'agent'
    )
  );

create policy "Agents can insert messages in all rooms"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'agent'
    )
  );

-- Realtime
alter publication supabase_realtime add table public.chat_rooms;
alter publication supabase_realtime add table public.chat_messages;
