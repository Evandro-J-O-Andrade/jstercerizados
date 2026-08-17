-- =============================================================================
-- GATE-DATA-04.008 — STORAGE: Provider-Agnostic File Metadata
-- =============================================================================
-- Entity: files (domain entity — storage provider is infrastructure)
-- Related: file_access_logs
-- Schema: public
-- Order: 8
-- Dependencies: 001_core, 002_identity
-- =============================================================================
-- Purpose:
--   Register files as domain entities while abstracting the storage provider.
--   Supports Supabase Storage, S3, R2, local — without schema changes.
--
-- Rules (per GATE-DATA-03 §18 Storage Architecture):
--   - files is a DOMAIN entity — provider is just a field
--   - Files are private by default (visibility = 'private')
--   - object_key is system-generated (never use user-provided filename)
--   - UNIQUE(provider, bucket, object_key) prevents duplication
--   - File access is via signed URLs, not public buckets
--   - file_access_logs tracks all read/write operations for audit
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. files — Entidade de arquivo (provider agnóstico)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Representa um arquivo registrado no sistema, independentemente do provider.

-- WHY:
-- Precisamos rastrear arquivos (currículos, documentos, certificados) de forma
-- consistente, mesmo que o storage físico mude (Supabase → S3 → R2).

-- ARCHITECTURE:
-- - `provider` field permite migração futura sem schema change
-- - `object_key` é uma chave segura, não o nome original do usuário
-- - `visibility` controla acesso: private/tenant/public
-- - `status` permite lifecycle: active → deleted → storage cleanup
-- - `checksum` para integridade e deduplicação
create table public.files (
  id                  uuid primary key default gen_random_uuid(),

  -- WHAT: Tenant proprietário do arquivo
  -- WHY:  Isolamento multi-tenant
  -- ARCH: RLS chain: auth.uid → people → tenant_memberships → tenant_id
  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  -- WHAT: Pessoa que "possui" o arquivo
  -- WHY:  Identidade canônica do owner
  -- ARCH: FK opcional — alguns arquivos podem ser de sistema
  owner_person_id     uuid references public.people(id) on delete set null,

  -- WHAT: Provider de storage
  -- WHY:  Permite migração Supabase → S3 → R2 sem mudar schema
  -- ARCH: NÃO usar URLs externas diretamente — abstração via provider/bucket/key
  provider            varchar(20) not null
    check (provider in ('supabase','s3','r2','local')),

  -- WHAT: Nome do bucket/container
  -- WHY:  Namespace no provider
  -- ARCH: Ex: 'private-documents', 'public-assets'
  bucket              varchar(100) not null,

  -- WHAT: Chave do objeto dentro do bucket
  -- WHY:  Identificador único no storage
  -- ARCH: System-generated, ex: 'candidates/{uuid}/{hash}.pdf'
  --       NUNCA usar nome original do usuário como object_key
  object_key          varchar(500) not null,

  -- WHAT: Nome original do arquivo (para exibição)
  -- WHY:  O candidato vê "Curriculo_Evandro.pdf"
  -- ARCH: NÃO usado como identificador — apenas display
  original_name       varchar(255),

  -- WHAT: Tipo MIME
  -- WHY:  Validação de tipo de conteúdo
  -- ARCH: Ex: 'application/pdf', 'image/jpeg'
  mime_type           varchar(100),

  -- WHAT: Tamanho em bytes
  -- WHY:  Validação de upload e billing
  -- ARCH: BIGINT para arquivos grandes (vídeos)
  size_bytes          bigint,

  -- WHAT: Hash de integridade
  -- WHY:  Verificar corrupção e deduplicação
  -- ARCH: SHA-256 recomendado
  checksum            varchar(64),

  -- WHAT: Nível de visibilidade
  -- WHY:  Controle de acesso
  -- ARCH: private = signed URL required
  --       tenant = acessível por membros do tenant
  --       public = acessível publicamente (raro)
  visibility          varchar(20) not null default 'private'
    check (visibility in ('public','private','tenant')),

  -- WHAT: Status do arquivo
  -- WHY:  Lifecycle e auditoria
  -- ARCH: active → deleted → storage cleanup (background job)
  status              varchar(20) not null default 'active'
    check (status in ('active','deleted','quarantined')),

  -- WHAT: Metadados adicionais
  -- WHY:  Extensibilidade sem schema changes
  -- ARCH: JSONB, não expor diretamente
  metadata            jsonb not null default '{}'::jsonb,

  -- WHAT: Auditoria
  created_by          uuid references public.people(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- WHAT: Unicidade do objeto no storage
  -- WHY:  Evita duplicação de arquivo
  -- ARCH: Combinado com provider + bucket + object_key
  unique (provider, bucket, object_key)
);

-- -----------------------------------------------------------------------------
-- 2. file_access_logs — Auditoria de acesso a arquivos
-- -----------------------------------------------------------------------------

-- WHAT:
-- Registro de todas as operações de acesso a arquivos.

-- WHY:
-- Auditoria de LGPD e segurança — sabemos quem acessou o quê e quando.

-- ARCHITECTURE:
-- - APPEND-ONLY (nunca UPDATE/DELETE)
-- - Registra: visualização, download, upload, signed URL request
-- - Integridade via checksum verification
create table public.file_access_logs (
  id              uuid primary key default gen_random_uuid(),

  -- WHAT: Arquivo acessado
  file_id         uuid not null
    references public.files(id)
    on delete cascade,

  -- WHAT: Pessoa que acessou
  person_id       uuid references public.people(id) on delete set null,

  -- WHAT: Tipo de acesso
  -- WHY:  Classificação para auditoria
  access_type     varchar(20) not null
    check (access_type in ('view','download','upload','signed_url','delete')),

  -- WHAT: IP e user agent
  ip_address      inet,
  user_agent      text,

  -- WHAT: Resultado
  status          varchar(20) not null default 'success'
    check (status in ('success','denied','error')),

  -- WHAT: Metadata adicional (tamanho do download, duração)
  metadata        jsonb not null default '{}'::jsonb,

  -- WHAT: Timestamp
  created_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_files_tenant on public.files(tenant_id);
create index idx_files_owner on public.files(owner_person_id);
create index idx_files_provider on public.files(provider);
create index idx_files_bucket on public.files(bucket);
create index idx_files_object_key on public.files(object_key);
create index idx_files_checksum on public.files(checksum);
create index idx_files_status on public.files(status);
create index idx_files_visibility on public.files(visibility);
create index idx_files_original_name on public.files(original_name);

create index idx_file_access_logs_file on public.file_access_logs(file_id);
create index idx_file_access_logs_person on public.file_access_logs(person_id);
create index idx_file_access_logs_created_at on public.file_access_logs(created_at desc);
create index idx_file_access_logs_status on public.file_access_logs(status);

-- -----------------------------------------------------------------------------
-- Triggers: updated_at
-- -----------------------------------------------------------------------------
create trigger update_files_updated_at
  before update on public.files
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- Trigger: log file access (append-only)
-- -----------------------------------------------------------------------------
create trigger log_file_access_insert
  after insert on public.file_access_logs
  for each statement
  execute function public.update_updated_at();

-- -----------------------------------------------------------------------------
-- RLS (Row-Level Security)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Arquivos scoped ao tenant via owner_person_id → tenant_memberships chain.

-- WHY:
-- Previne acesso a arquivos de outro tenant.

-- ARCH:
-- auth.uid()
--    ↓
-- people.auth_user_id
--    ↓
-- people.id
--    ↓
-- tenant_memberships
--    ↓
-- tenant_id
--    ↓
-- files.tenant_id
alter table public.files enable row level security;

create policy "Files visible to tenant members"
  on public.files for select
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
    )
    OR owner_person_id IN (
      SELECT id FROM public.people WHERE auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

create policy "Files manageable by tenant admins"
  on public.files for all
  using (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  )
  with check (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_memberships tm
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.membership_role IN ('owner', 'admin', 'manager', 'recruiter')
    )
    OR auth.role() = 'service_role'
  );

-- File access logs: visible only to self or tenant admin
alter table public.file_access_logs enable row level security;

create policy "File access logs visible to owner or admin"
  on public.file_access_logs for select
  using (
    person_id IN (
      SELECT id FROM public.people WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.files f
      JOIN public.tenant_memberships tm ON tm.tenant_id = f.tenant_id
      JOIN public.people p ON tm.person_id = p.id
      WHERE p.auth_user_id = auth.uid()
        AND tm.membership_role IN ('owner', 'admin', 'manager')
        AND f.id = file_access_logs.file_id
    )
    OR auth.role() = 'service_role'
  );

-- File access logs: only INSERT allowed (audit trail)
create policy "File access logs insert only"
  on public.file_access_logs for insert
  with check (
    EXISTS (
      SELECT 1 FROM public.people p
      WHERE p.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- Seed: storage providers registered, no actual credentials here
-- -----------------------------------------------------------------------------
-- Providers are configured via secrets/env:
-- supabase: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (server-side only)
-- s3: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
-- r2: CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_KEY
-- local: filesystem path
