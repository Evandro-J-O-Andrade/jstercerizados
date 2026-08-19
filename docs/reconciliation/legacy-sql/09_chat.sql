-- 09_chat.sql
-- Human chat, AI chat and handoff

create table if not exists public.chat_rooms (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_participants (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.chat_rooms(id),
  person_id uuid references public.people(id),
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.chat_rooms(id),
  sender_type text not null,
  sender_person_id uuid references public.people(id),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  model text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.ai_conversations(id),
  role text not null,
  content text not null,
  tokens integer,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_handoffs (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.chat_rooms(id),
  from_person_id uuid references public.people(id),
  to_person_id uuid references public.people(id),
  reason text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
