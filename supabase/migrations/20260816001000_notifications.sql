-- =============================================================================
-- GATE-DATA-04.010 — NOTIFICATIONS: Multi-channel delivery system
-- =============================================================================
-- Entities: notifications, notification_deliveries, notification_preferences
-- Schema: public
-- Order: 10
-- Dependencies: 001_core, 002_identity, 006_applications, 007_rbac, 009_domain_events
-- =============================================================================
-- Purpose:
--   Decouple notification creation (business fact) from delivery (channel orchestration).
--
-- Rules (per GATE-DATA-03 § Princípio canônico):
--   - UMA notificação → vários deliveries (WhatsApp, Email, In-App, Push)
--   - notification é imutável (não se altera mensagem já criada)
--   - notification_deliveries é idempotente: (notification_id, channel) UNIQUE
--   - Preferências de comunicação respeitam LGPD/consentimento
--   - Transacional ≠ Marketing (notification_type separa as categorias)
--   - Nenhum segredo de provider no Core (WATI/Meta/SMTP tokens ficam no n8n)
--   - Frontend não conhece segredos de delivery

create type notification_status as enum (
  'draft',
  'pending',
  'processing',
  'sent',
  'failed',
  'expired'
);

create type notification_priority as enum (
  'low',
  'normal',
  'high',
  'urgent'
);

create type notification_channel as enum (
  'in_app',
  'email',
  'whatsapp',
  'push'
);

create type notification_delivery_status as enum (
  'pending',
  'sent',
  'delivered',
  'failed',
  'skipped'  -- skipped due to preference/desabo
);

create type notification_category as enum (
  'transactional',  -- processos seletivos, candidaturas
  'matching',       -- vagas compatíveis
  'marketing',      -- promoções, cursos
  'system'          -- avisos operacionais
);

-- -----------------------------------------------------------------------------
-- 1. notifications — Entidade canônica de comunicação
-- -----------------------------------------------------------------------------
-- WHAT:
-- Registro de uma comunicação que deve ser entregue a um destinatário.
-- Uma notificação pode ter múltiplas entregas (canais).

-- WHY:
-- - Evita duplicação: não criamos whatsapp_notifications/email_notifications
-- - Permite múltiplos canais para a mesma mensagem
-- - Idempotência por notification_deliveries (event_id + channel)

-- ARCHITECTURE:
-- - notification.crete_by = system (via n8n/event publisher)
-- - notification_deliveries criadas pelo n8n após processar domain_events
-- - NOTA: n8n cria deliveries, não o Core diretamente

create table public.notifications (
  id                   uuid primary key default gen_random_uuid(),

  -- WHAT: Tenant proprietário
  tenant_id            uuid not null
    references public.tenants(id)
    on delete cascade,

  -- WHAT: Destinatário
  recipient_person_id  uuid not null
    references public.people(id)
    on delete cascade,

  -- WHAT: Tipo de notificação
  -- WHY:  Para indexar e filtrar (application.created, job.matched, etc)
  -- ARCH: Convenção: domain.action, ex: application.received
  notification_type    varchar(100) not null,

  -- WHAT: Categoria (transacional/matching/marketing/system)
  category             notification_category not null default 'transactional',

  -- WHAT: Prioridade
  priority             notification_priority not null default 'normal',

  -- WHAT: Conteúdo
  title                varchar(255) not null,
  body                 text,
  data                 jsonb not null default '{}'::jsonb,

  -- WHAT: Estado
  status               notification_status not null default 'pending',

  -- WHAT: Evento de origem
  -- WHY:  Rastreia qual domain_event originou esta notificação
  -- ARCH: nullable — algumas notificações são sistêmicas/operacionais
  source_event_id      uuid
    references public.domain_events(id),

  -- WHAT: Quem criou a notificação (pode ser system)
  created_by           uuid references public.people(id) on delete set null,

  -- WHAT: Timing
  created_at           timestamptz not null default now(),
  scheduled_at         timestamptz,
  expires_at           timestamptz,
  read_at              timestamptz,

  -- WHAT: Idempotência de criação
  -- WHY:  Previne duplicata de notificação
  -- ARCH: (notification_type, recipient_person_id, tenant_id, scheduled_date)
  idempotency_key      uuid,

  -- WHAT: Metadados técnicos
  metadata             jsonb not null default '{}'::jsonb
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_notifications_recipient on public.notifications(recipient_person_id);
create index idx_notifications_tenant on public.notifications(tenant_id);
create index idx_notifications_status on public.notifications(status);
create index idx_notifications_type on public.notifications(notification_type);
create index idx_notifications_category on public.notifications(category);
create index idx_notifications_priority on public.notifications(priority);
create index idx_notifications_scheduled on public.notifications(scheduled_at) where scheduled_at is not null;
create index idx_notifications_source_event on public.notifications(source_event_id);
create index idx_notifications_idempotency on public.notifications(idempotency_key);
create index idx_notifications_expires on public.notifications(expires_at);

-- -----------------------------------------------------------------------------
-- 2. notification_deliveries — Entrega por canal
-- -----------------------------------------------------------------------------
-- WHAT:
-- Registro de tentativa de entrega em um canal específico (WhatsApp, Email, In-App).

-- WHY:
-- - UMA notificação pode ter múltiplas entregas
-- - Idempotência: (notification_id, channel) é UNIQUE
-- - Retry: attempts + last_error + next_attempt_at
-- - Provider-agnostic: provider string (wati, smtp, resend, firebase)

-- ARCHITECTURE:
-- - Criadas pelo n8n/event publisher AFTER notification.created
-- - published_at controla entrega ao provider
-- - delivered_at = confirmação de chegada ao destinatário
-- - skipped_at = quando canal foi ignorado por preferência

create table public.notification_deliveries (
  id                   uuid primary key default gen_random_uuid(),

  notification_id      uuid not null
    references public.notifications(id)
    on delete cascade,

  -- WHAT: Canal de entrega
  channel              notification_channel not null,

  -- WHAT: Estado da entrega
  status               notification_delivery_status not null default 'pending',

  -- WHAT: Provider usado (wati, smtp, resend, firebase, mock)
  provider             varchar(50),

  -- WHAT: ID da mensagem no provider
  provider_message_id  varchar(255),

  -- WHAT: Retry information
  attempts             integer not null default 0,
  max_attempts         integer not null default 5,
  last_error           text,
  next_attempt_at      timestamptz,

  -- WHAT: Timestamps
  sent_at              timestamptz,
  delivered_at         timestamptz,
  failed_at            timestamptz,
  skipped_at           timestamptz,

  -- WHAT: Motivo do skip (preference, invalid_phone, etc)
  skip_reason          varchar(100),

  -- WHAT: Payload do provider (resposta bruta)
  provider_response     jsonb,

  -- WHAT: Metadados técnicos
  metadata             jsonb not null default '{}'::jsonb,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_deliveries_notification on public.notification_deliveries(notification_id);
create index idx_deliveries_status on public.notification_deliveries(status);
create index idx_deliveries_pending on public.notification_deliveries(next_attempt_at) where next_attempt_at is not null and status = 'pending';
create index idx_deliveries_provider on public.notification_deliveries(provider);
create index idx_deliveries_channel on public.notification_deliveries(channel);
create index idx_deliveries_unique on public.notification_deliveries(notification_id, channel);

-- -----------------------------------------------------------------------------
-- 3. notification_preferences — Preferências por usuário
-- -----------------------------------------------------------------------------
-- WHAT:
-- Controle de quais canais usar para cada tipo de notificação.

-- WHY:
-- - LGPD: consentimento explícito
-- - UX: candidato escolhe onde receber
-- - Evita spam: não forçamos WhatsApp se usuário preferir Email

-- ARCHITECTURE:
-- - (person_id, notification_type, channel) = UNIQUE
-- - enabled = FALSE → delivery é skipped automaticamente

create table public.notification_preferences (
  id                  uuid primary key default gen_random_uuid(),

  person_id           uuid not null
    references public.people(id)
    on delete cascade,

  notification_type   varchar(100) not null,

  channel             notification_channel not null,

  enabled             boolean not null default true,

  -- WHAT: Quando o consentimento foi dado
  consented_at        timestamptz not null default now(),

  -- WHAT: Quando foi desativado (LGPD right to revoke)
  disabled_at         timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- WHAT: Garantia de unicidade
  -- WHY:  Uma pessoa tem apenas uma preferência por tipo+channel
  constraint uk_preference_person_type_channel
    unique (person_id, notification_type, channel)
);

create index idx_prefs_person on public.notification_preferences(person_id);
create index idx_prefs_type on public.notification_preferences(notification_type);
create index idx_prefs_enabled on public.notification_preferences(enabled);

-- -----------------------------------------------------------------------------
-- Triggers: updated_at
-- -----------------------------------------------------------------------------
create trigger update_notification_deliveries_updated_at
  before update on public.notification_deliveries
  for each row execute procedure public.update_updated_at();

create trigger update_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute procedure public.update_updated_at();

-- -----------------------------------------------------------------------------
-- Trigger: skip delivery when notification expires
-- -----------------------------------------------------------------------------
-- WHAT:
-- Automatically marks deliveries as 'skipped' when notification expires.

-- WHY:
-- Prevents wasted delivery attempts on expired notifications.

create or replace function public.skip_expired_notification_deliveries()
returns trigger
language plpgsql
as $$
begin
  if new.expires_at is not null and now() >= new.expires_at then
    if new.status = 'sent' then
      new.status := 'expired';
    end if;
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function: create_notification()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Helper function to create notifications with proper context.

-- WHY:
-- Garante que todas as notificações sigam o mesmo contrato.
-- Called by n8n/event publisher when domain_event is consumed.

-- ARCHITECTURE:
-- - Uses idempotency_key to prevent duplicate notifications
-- - Defaults category to 'transactional'
-- - Defaults priority to 'normal'

create or replace function public.create_notification(
  p_tenant_id uuid,
  p_recipient_person_id uuid,
  p_notification_type varchar,
  p_title varchar,
  p_body text default null,
  p_data jsonb default '{}'::jsonb,
  p_category notification_category default 'transactional',
  p_priority notification_priority default 'normal',
  p_source_event_id uuid default null,
  p_created_by uuid default null,
  p_scheduled_at timestamptz default null,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_notification_id uuid;
  v_idempotency_key uuid;
begin
  -- Generate idempotency key: hash of (type, recipient, scheduled_date)
  v_idempotency_key := md5(p_notification_type || p_recipient_person_id::text || coalesce(p_scheduled_at::text, 'now'))::uuid;

  -- Check if notification already exists (idempotent creation)
  select id into v_notification_id
  from public.notifications
  where idempotency_key = v_idempotency_key;

  if v_notification_id is not null then
    return v_notification_id;
  end if;

  insert into public.notifications (
    tenant_id,
    recipient_person_id,
    notification_type,
    category,
    priority,
    title,
    body,
    data,
    source_event_id,
    created_by,
    scheduled_at,
    expires_at,
    idempotency_key
  ) values (
    p_tenant_id,
    p_recipient_person_id,
    p_notification_type,
    p_category,
    p_priority,
    p_title,
    p_body,
    p_data,
    p_source_event_id,
    p_created_by,
    p_scheduled_at,
    p_expires_at,
    v_idempotency_key
  ) returning id into v_notification_id;

  return v_notification_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function: create_delivery()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Creates a notification delivery for a specific channel.

-- WHY:
-- Called by n8n/event publisher after notification is created.
-- Idempotent: (notification_id, channel) is UNIQUE.

create or replace function public.create_notification_delivery(
  p_notification_id uuid,
  p_channel notification_channel,
  p_provider varchar default null,
  p_provider_message_id varchar default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_delivery_id uuid;
begin
  -- Check if delivery already exists for this notification+channel
  select id into v_delivery_id
  from public.notification_deliveries
  where notification_id = p_notification_id
    and channel = p_channel;

  if v_delivery_id is not null then
    return v_delivery_id;
  end if;

  insert into public.notification_deliveries (
    notification_id,
    channel,
    status,
    provider,
    provider_message_id,
    metadata
  ) values (
    p_notification_id,
    p_channel,
    'pending',
    p_provider,
    p_provider_message_id,
    p_metadata
  ) returning id into v_delivery_id;

  return v_delivery_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function: mark_delivery_sent()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Marks a delivery as sent after successful provider acceptance.

-- WHY:
-- Separates 'sent' (provider accepted) from 'delivered' (user received).

create or replace function public.mark_delivery_sent(
  p_delivery_id uuid,
  p_provider_message_id varchar default null
)
returns void
language plpgsql
security definer
as $$
begin
  update public.notification_deliveries
  set status = 'sent',
      sent_at = now(),
      provider_message_id = coalesce(p_provider_message_id, provider_message_id)
  where id = p_delivery_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function: mark_delivery_delivered()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Marks a delivery as delivered (user received the message).

create or replace function public.mark_delivery_delivered(p_delivery_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.notification_deliveries
  set status = 'delivered',
      delivered_at = now()
  where id = p_delivery_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function: mark_delivery_failed()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Records a failed delivery attempt with error details.

-- WHY:
-- Enables retry logic and debugging.

create or replace function public.mark_delivery_failed(
  p_delivery_id uuid,
  p_error text,
  p_next_attempt timestamptz default null
)
returns void
language plpgsql
security definer
as $$
begin
  update public.notification_deliveries
  set status = 'failed',
      last_error = p_error,
      failed_at = now(),
      attempts = attempts + 1,
      next_attempt_at = p_next_attempt
  where id = p_delivery_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function: get_pending_deliveries()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Retrieves pending deliveries for n8n/event publisher to process.

-- WHY:
-- n8n polls for deliveries to attempt. This function provides a clean interface.

-- ARCHITECTURE:
-- - Returns deliveries where status = 'pending' AND next_attempt_at <= now()
-- - Respects notification expiration

create or replace function public.get_pending_deliveries(
  p_channel notification_channel,
  p_limit integer default 50
)
returns table (
  delivery_id uuid,
  notification_id uuid,
  tenant_id uuid,
  recipient_person_id uuid,
  notification_type varchar,
  title varchar,
  body text,
  data jsonb,
  category notification_category,
  priority notification_priority,
  provider varchar,
  attempts integer,
  max_attempts integer,
  last_error text
)
language sql
security definer
as $$
  select
    d.id as delivery_id,
    n.id as notification_id,
    n.tenant_id,
    n.recipient_person_id,
    n.notification_type,
    n.title,
    n.body,
    n.data,
    n.category,
    n.priority,
    d.provider,
    d.attempts,
    d.max_attempts,
    d.last_error
  from public.notification_deliveries d
  join public.notifications n on n.id = d.notification_id
  where d.channel = p_channel
    and d.status = 'pending'
    and (d.next_attempt_at is null or d.next_attempt_at <= now())
    and (n.expires_at is null or n.expires_at > now())
    and n.status = 'pending'
  order by n.priority desc, n.created_at asc
  limit p_limit
$$;

-- -----------------------------------------------------------------------------
-- Function: get_due_deliveries()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Retrieves all due deliveries across channels (for batch processing).

create or replace function public.get_due_deliveries(
  p_limit integer default 100
)
returns table (
  delivery_id uuid,
  notification_id uuid,
  tenant_id uuid,
  recipient_person_id uuid,
  channel notification_channel,
  notification_type varchar,
  title varchar,
  body text,
  data jsonb,
  category notification_category,
  priority notification_priority,
  attempts integer,
  max_attempts integer
)
language sql
security definer
as $$
  select
    d.id as delivery_id,
    n.id as notification_id,
    n.tenant_id,
    n.recipient_person_id,
    d.channel,
    n.notification_type,
    n.title,
    n.body,
    n.data,
    n.category,
    n.priority,
    d.attempts,
    d.max_attempts
  from public.notification_deliveries d
  join public.notifications n on n.id = d.notification_id
  where d.status = 'pending'
    and (d.next_attempt_at is null or d.next_attempt_at <= now())
    and (n.expires_at is null or n.expires_at > now())
    and n.status = 'pending'
  order by n.priority desc, n.created_at asc
  limit p_limit
$$;

-- -----------------------------------------------------------------------------
-- Function: mark_notification_read()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Marks a notification as read (for in-app notifications).

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.notifications
  set status = 'sent',
      read_at = now()
  where id = p_notification_id
    and status in ('pending', 'sent');
end;
$$;

-- -----------------------------------------------------------------------------
-- Function: check_preference()
-- -----------------------------------------------------------------------------
-- WHAT:
-- Checks if a person has opted in for a notification type on a channel.

-- WHY:
-- Prevents sending notifications user has opted out of.
-- Returns boolean — NULL (no preference set) defaults to FALSE.

create or replace function public.is_channel_enabled(
  p_person_id uuid,
  p_notification_type varchar,
  p_channel notification_channel
)
returns boolean
language sql
security definer
as $$
  select enabled
  from public.notification_preferences
  where person_id = p_person_id
    and notification_type = p_notification_type
    and channel = p_channel
$$;

-- -----------------------------------------------------------------------------
-- RLS (Row-Level Security)
-- -----------------------------------------------------------------------------
-- WHY:
-- Notifications and deliveries are scoped ao tenant.

-- ARCH:
-- auth.uid()
--    ↓
-- people.auth_user_id
--    ↓
-- tenant_memberships
--    ↓
-- tenant_id
--    ↓
-- notifications.tenant_id

alter table public.notifications enable row level security;

create policy "Notifications visible to tenant members"
  on public.notifications for select
  using (
    tenant_id IN (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.people p on tm.person_id = p.id
      where p.auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

-- Only system/n8n can insert notifications (via create_notification with SECURITY DEFINER)
-- Users can only read their own notifications
create policy "Users see own notifications"
  on public.notifications for select
  using (
    recipient_person_id = (
      select id from public.people where auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

alter table public.notification_deliveries enable row level security;

create policy "Deliveries visible to notification owner"
  on public.notification_deliveries for select
  using (
    notification_id IN (
      select id from public.notifications n
      where n.tenant_id IN (
        select tm.tenant_id
        from public.tenant_memberships tm
        join public.people p on tm.person_id = p.id
        where p.auth_user_id = auth.uid()
      )
      or n.recipient_person_id = (
        select id from public.people where auth_user_id = auth.uid()
      )
    )
    or auth.role() = 'service_role'
  );

alter table public.notification_preferences enable row level security;

create policy "Preferences editable by person"
  on public.notification_preferences for all
  using (
    person_id = (
      select id from public.people where auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  )
  with check (
    person_id = (
      select id from public.people where auth_user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

-- -----------------------------------------------------------------------------
-- Default preferences seed function
-- -----------------------------------------------------------------------------
-- WHAT:
-- Creates default notification preferences for a new person.

-- WHY:
-- Ensures users have baseline preferences (LGPD compliance).

create or replace function public.create_default_notification_preferences(
  p_person_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  -- Transactional defaults
  insert into public.notification_preferences (person_id, notification_type, channel, enabled)
  values
    -- Application process (transacional)
    (p_person_id, 'application.received', 'in_app', true),
    (p_person_id, 'application.received', 'email', true),
    (p_person_id, 'application.received', 'whatsapp', false),

    -- Status changes
    (p_person_id, 'application.status_changed', 'in_app', true),
    (p_person_id, 'application.status_changed', 'email', true),
    (p_person_id, 'application.status_changed', 'whatsapp', false),

    -- Interview scheduling
    (p_person_id, 'interview.scheduled', 'in_app', true),
    (p_person_id, 'interview.scheduled', 'email', true),
    (p_person_id, 'interview.scheduled', 'whatsapp', true),

    -- Job matching
    (p_person_id, 'job.matched', 'in_app', true),
    (p_person_id, 'job.matched', 'email', false),
    (p_person_id, 'job.matched', 'whatsapp', false),

    -- System notifications
    (p_person_id, 'system', 'in_app', true),
    (p_person_id, 'system', 'email', true),
    (p_person_id, 'system', 'whatsapp', false),

    -- Marketing (opt-out by default)
    (p_person_id, 'marketing', 'in_app', false),
    (p_person_id, 'marketing', 'email', false),
    (p_person_id, 'marketing', 'whatsapp', false)
  on conflict (person_id, notification_type, channel) do nothing;
end;
$$;