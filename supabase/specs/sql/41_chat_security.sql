-- 41_chat_security.sql
-- Chat, AI usage, sessions, and password policies

create table if not exists public.ai_usage (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  model text not null,
  tokens integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.password_policies (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  min_length integer not null default 8,
  require_uppercase boolean not null default true,
  require_lowercase boolean not null default true,
  require_number boolean not null default true,
  require_special boolean not null default true,
  expiration_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_password_policies_tenant unique (tenant_id)
);
