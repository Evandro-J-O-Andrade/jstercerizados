-- 18_storage_documents.sql
-- Storage and documents

create table if not exists public.files (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  uploaded_by_person_id uuid not null references public.people(id),
  entity_type text,
  entity_id uuid,
  file_name text not null,
  mime_type text,
  size integer,
  storage_path text not null,
  bucket text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_files_storage_path unique (tenant_id, bucket, storage_path)
);

create table if not exists public.file_access_logs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  file_id uuid not null references public.files(id),
  person_id uuid references public.people(id),
  action text not null,
  ip text,
  user_agent text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_versions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  entity_type text not null,
  entity_id uuid not null,
  version integer not null,
  storage_path text not null,
  bucket text not null,
  changed_by_person_id uuid references public.people(id),
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_document_versions_entity_version unique (tenant_id, entity_type, entity_id, version)
);

create table if not exists public.document_links (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  file_id uuid not null references public.files(id),
  entity_type text not null,
  entity_id uuid not null,
  relation_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.administrative_requests (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  requester_person_id uuid not null references public.people(id),
  type text not null,
  subject text not null,
  description text,
  status text not null default 'pending',
  priority text not null default 'normal',
  requested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.administrative_tasks (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  request_id uuid references public.administrative_requests(id),
  assignee_person_id uuid references public.people(id),
  title text not null,
  description text,
  status text not null default 'pending',
  due_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.administrative_approvals (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  task_id uuid not null references public.administrative_tasks(id),
  approver_person_id uuid not null references public.people(id),
  decision text not null,
  notes text,
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.administrative_documents (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  request_id uuid references public.administrative_requests(id),
  file_id uuid references public.files(id),
  type text not null,
  file_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
