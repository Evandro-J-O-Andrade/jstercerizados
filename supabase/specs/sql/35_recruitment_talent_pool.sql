-- 35_recruitment_talent_pool.sql
-- Talent pool, job matching, and recruitment KPIs

create table if not exists public.talent_pool_memberships (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  source text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_talent_pool_memberships unique (tenant_id, person_id)
);

create table if not exists public.job_matches (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.people(id),
  demand_id uuid not null references public.recruitment_demands(id),
  score numeric,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_job_matches unique (candidate_id, demand_id)
);

create table if not exists public.candidate_profile_views (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  candidate_id uuid not null references public.people(id),
  viewed_by uuid not null references public.people(id),
  viewed_at timestamptz not null default now()
);

create or replace view public.recruitment_kpis as
select
  tenant_id,
  count(*) filter (where status = 'open') as open_demands,
  count(*) filter (where status = 'closed') as closed_demands,
  count(*) as total_demands
from public.recruitment_demands
where tenant_id in (select public.user_tenant_ids())
group by tenant_id;

create or replace function public.match_candidates_to_demand(
  p_demand_id uuid
)
returns table (
  candidate_id uuid,
  score numeric
) as $$
declare
  v_actor uuid;
  v_demand public.recruitment_demands%rowtype;
begin
  select auth.uid() into v_actor;

  if not public.is_tenant_member((select tenant_id from public.recruitment_demands where id = p_demand_id)) then
    raise exception 'not allowed';
  end if;

  if not public.user_has_permission(v_actor, 'recruitment.read') then
    raise exception 'not allowed';
  end if;

  select * into v_demand from public.recruitment_demands where id = p_demand_id;

  return query
  select
    tp.person_id as candidate_id,
    0 as score
  from public.talent_pool_memberships tp
  where tp.tenant_id = v_demand.tenant_id
    and tp.status = 'active'
  order by tp.created_at desc;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;
