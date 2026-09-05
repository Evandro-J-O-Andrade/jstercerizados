-- ============================================================================
-- 20260906000000_candidate_portal_navigation.sql
-- ----------------------------------------------------------------------------
-- Torna a navegação do portal do candidato (e, no futuro, dos outros roles)
-- 100% dinâmica, configurável via banco, com links globais (suporte, ajuda,
-- acessibilidade, logout, site público) que aparecem para qualquer role.
--
-- Padrões:
--  - permission_key NULL = visível para qualquer um do target_audience.
--  - permission_key preenchido = exige `user_has_permission(uid, key, ...)`.
--  - target_audience usa os nomes canônicos de role em public.roles.
-- ============================================================================

set search_path = public, auth;

-- ----------------------------------------------------------------------------
-- 1. candidate_portal_modules (substitui o array NAV_ITEMS hardcoded)
-- ----------------------------------------------------------------------------
create table if not exists public.candidate_portal_modules (
  id               uuid primary key default gen_random_uuid(),
  key              text not null unique,
  label            text not null,
  route            text not null,
  icon             text not null,
  permission_key   text null,
  show_in_sidebar  boolean not null default true,
  show_in_bottom_nav boolean not null default true,
  sort_order       integer not null default 0,
  is_active        boolean not null default true,
  target_audience  text[] not null default array['candidato']::text[],
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint candidate_portal_modules_key_not_blank check (length(btrim(key)) > 0),
  constraint candidate_portal_modules_label_not_blank check (length(btrim(label)) > 0),
  constraint candidate_portal_modules_route_not_blank check (length(btrim(route)) > 0)
);

create index if not exists idx_cpm_active_sort
  on public.candidate_portal_modules (is_active, sort_order)
  where is_active = true;

-- ----------------------------------------------------------------------------
-- 2. global_navigation_links (links que existem em qualquer shell)
-- ----------------------------------------------------------------------------
create table if not exists public.global_navigation_links (
  id               uuid primary key default gen_random_uuid(),
  key              text not null unique,
  label            text not null,
  href             text not null,
  icon             text not null,
  action           text not null default 'link', -- link | accessibility | chat | logout | site_home
  permission_key   text null,
  show_in_sidebar  boolean not null default true,
  show_in_bottom_nav boolean not null default false,
  show_in_footer   boolean not null default false,
  sort_order       integer not null default 0,
  is_active        boolean not null default true,
  target_audience  text[] not null default array[]::text[], -- vazio = todos
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint global_nav_key_not_blank check (length(btrim(key)) > 0),
  constraint global_nav_label_not_blank check (length(btrim(label)) > 0),
  constraint global_nav_action_valid check (action in ('link','accessibility','chat','logout','site_home'))
);

create index if not exists idx_gnl_active_sort
  on public.global_navigation_links (is_active, sort_order)
  where is_active = true;

-- ----------------------------------------------------------------------------
-- 3. Trigger genérico de updated_at
-- ----------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_cpm_updated_at on public.candidate_portal_modules;
create trigger trg_cpm_updated_at
  before update on public.candidate_portal_modules
  for each row execute function public.tg_set_updated_at();

drop trigger if exists trg_gnl_updated_at on public.global_navigation_links;
create trigger trg_gnl_updated_at
  before update on public.global_navigation_links
  for each row execute function public.tg_set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. RLS
-- ----------------------------------------------------------------------------
alter table public.candidate_portal_modules enable row level security;
alter table public.global_navigation_links enable row level security;

-- Qualquer pessoa (anon ou autenticada) pode ler o que está ativo.
drop policy if exists cpm_public_read on public.candidate_portal_modules;
create policy cpm_public_read on public.candidate_portal_modules
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists cpm_admin_write on public.candidate_portal_modules;
create policy cpm_admin_write on public.candidate_portal_modules
  for all to authenticated
  using (public.is_admin_master())
  with check (public.is_admin_master());

drop policy if exists gnl_public_read on public.global_navigation_links;
create policy gnl_public_read on public.global_navigation_links
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists gnl_admin_write on public.global_navigation_links;
create policy gnl_admin_write on public.global_navigation_links
  for all to authenticated
  using (public.is_admin_master())
  with check (public.is_admin_master());

-- ----------------------------------------------------------------------------
-- 5. Grants
-- ----------------------------------------------------------------------------
grant select on public.candidate_portal_modules to anon, authenticated;
grant select on public.global_navigation_links to anon, authenticated;
grant insert, update, delete on public.candidate_portal_modules to authenticated;
grant insert, update, delete on public.global_navigation_links to authenticated;

-- ----------------------------------------------------------------------------
-- 6. Seed: NAV_ITEMS atual + links globais
-- ----------------------------------------------------------------------------
insert into public.candidate_portal_modules
  (key, label, route, icon, show_in_sidebar, show_in_bottom_nav, sort_order, permission_key)
values
  ('home',         'Início',            '/candidato',              'Home',      true,  true,  10, null),
  ('jobs',         'Vagas',             '/candidato/vagas',        'Briefcase', true,  true,  20, 'jobs.read'),
  ('applications', 'Minhas candidaturas','/candidato/candidaturas', 'FileText',  true,  false, 30, 'applications.read'),
  ('favorites',    'Vagas favoritas',   '/candidato/favoritas',    'Heart',     true,  false, 40, 'candidate_favorite_jobs.manage'),
  ('alerts',       'Alertas de vagas',  '/candidato/alertas',      'Bell',      true,  false, 50, 'candidate_job_alerts.manage'),
  ('resume',       'Meu currículo',     '/candidato/curriculo',    'FileText',  true,  true,  60, 'candidates.self.read'),
  ('profile',      'Meu perfil',        '/candidato/perfil',       'User',      true,  false, 70, 'candidates.self.read'),
  ('notifications','Notificações',      '/candidato/notificacoes', 'Bell',      true,  false, 80, 'notifications.read'),
  ('settings',     'Configurações',     '/candidato/configuracoes','Settings',  true,  false, 90, 'account.manage')
on conflict (key) do update set
  label = excluded.label,
  route = excluded.route,
  icon = excluded.icon,
  show_in_sidebar = excluded.show_in_sidebar,
  show_in_bottom_nav = excluded.show_in_bottom_nav,
  sort_order = excluded.sort_order,
  permission_key = excluded.permission_key,
  is_active = true;

insert into public.global_navigation_links
  (key, label, href, icon, action, show_in_sidebar, show_in_bottom_nav, show_in_footer, sort_order, permission_key)
values
  ('site_home',     'Site público',       '/',                       'Home',        'site_home',     true,  false, false, 10, null),
  ('support',       'Suporte',            '/suporte',                'LifeBuoy',    'link',          true,  true,  true,  20, null),
  ('help',          'Precisa de ajuda?',  '/contato',                'MessageCircle','chat',         true,  true,  true,  30, null),
  ('accessibility', 'Acessibilidade',     '#accessibility',          'Accessibility','accessibility', true,  false, true,  40, null),
  ('logout',        'Sair',               '#logout',                 'LogOut',      'logout',        true,  false, false, 99, null)
on conflict (key) do update set
  label = excluded.label,
  href = excluded.href,
  icon = excluded.icon,
  action = excluded.action,
  show_in_sidebar = excluded.show_in_sidebar,
  show_in_bottom_nav = excluded.show_in_bottom_nav,
  show_in_footer = excluded.show_in_footer,
  sort_order = excluded.sort_order,
  permission_key = excluded.permission_key,
  is_active = true;
