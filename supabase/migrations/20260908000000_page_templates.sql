-- ============================================================================
-- 20260908000000_page_templates.sql
-- ----------------------------------------------------------------------------
-- Sistema de templates de pagina com placeholders %token.path%.
-- O conteudo da pagina fica no banco, e a funcao resolve_page_template()
-- junta o template com as variaveis do contexto (pessoa, tenant, etc).
-- ============================================================================

set search_path = public, auth;

create table if not exists public.page_templates (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  title       text not null,
  body        text not null,
  is_active   boolean not null default true,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint page_templates_key_not_blank check (length(btrim(key)) > 0)
);

create index if not exists idx_page_templates_active
  on public.page_templates (key)
  where is_active = true;

drop trigger if exists trg_page_templates_updated_at on public.page_templates;
create trigger trg_page_templates_updated_at
  before update on public.page_templates
  for each row execute function public.tg_set_updated_at();

alter table public.page_templates enable row level security;

drop policy if exists page_templates_public_read on public.page_templates;
create policy page_templates_public_read on public.page_templates
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists page_templates_admin_write on public.page_templates;
create policy page_templates_admin_write on public.page_templates
  for all to authenticated
  using (public.is_admin_master())
  with check (public.is_admin_master());

grant select on public.page_templates to anon, authenticated;
grant insert, update, delete on public.page_templates to authenticated;

-- ----------------------------------------------------------------------------
-- Funcao: resolve_page_template(p_key, p_person_id, p_tenant_id)
--  - retorna jsonb com { raw, resolved, vars, missing, found }
--  - 'resolved' ja vem com tokens substituidos quando o valor existe.
--  - 'missing' lista os tokens nao encontrados.
-- ----------------------------------------------------------------------------
create or replace function public.resolve_page_template(
  p_key text,
  p_person_id uuid default null,
  p_tenant_id uuid default null
) returns jsonb
language plpgsql
stable
security invoker
set search_path = public, auth
as $$
declare
  v_row page_templates%rowtype;
  v_vars jsonb := '{}'::jsonb;
  v_missing text[] := array[]::text[];
  v_resolved text;
  v_token text;
  v_value jsonb;
  v_pattern constant text := '%([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)%';
begin
  select * into v_row
  from public.page_templates
  where key = p_key and is_active = true
  limit 1;

  if not found then
    return jsonb_build_object(
      'found', false,
      'key', p_key,
      'raw', null,
      'resolved', null,
      'vars', '{}'::jsonb,
      'missing', array[]::text[]
    );
  end if;

  -- monta bloco "person" + "user" (alias)
  if p_person_id is not null then
    select jsonb_build_object(
      'id', p.id,
      'full_name', coalesce(p.full_name, ''),
      'email', coalesce(p.email, ''),
      'phone', coalesce(p.phone, ''),
      'document', coalesce(p.document, '')
    ) into v_value
    from public.people p
    where p.id = p_person_id;

    if v_value is not null then
      v_vars := v_vars || jsonb_build_object('person', v_value, 'user', v_value);
    end if;
  end if;

  -- monta bloco "tenant"
  if p_tenant_id is not null then
    select jsonb_build_object(
      'id', t.id,
      'name', coalesce(t.name, ''),
      'slug', coalesce(t.slug, ''),
      'plan', coalesce(t.plan, '')
    ) into v_value
    from public.tenants t
    where t.id = p_tenant_id;

    if v_value is not null then
      v_vars := v_vars || jsonb_build_object('tenant', v_value);
    end if;
  end if;

  -- bloco "company" (informacoes estaticas globais)
  v_vars := v_vars || jsonb_build_object(
    'company', jsonb_build_object(
      'name', 'J&S Empregos LTDA',
      'tagline', 'Conectando pessoas, fortalecendo negócios.'
    )
  );

  -- resolucao dos tokens via expressao regular
  v_resolved := v_row.body;
  for v_token in
    select distinct m[1]
    from regexp_matches(v_row.body, v_pattern, 'g') as m
  loop
    v_value := v_vars #> string_to_array(v_token, '.');
    if v_value is null or jsonb_typeof(v_value) = 'null' then
      v_missing := array_append(v_missing, v_token);
    else
      v_resolved := replace(v_resolved, '%' || v_token || '%', v_value #>> '{}');
    end if;
  end loop;

  return jsonb_build_object(
    'found', true,
    'key', v_row.key,
    'title', v_row.title,
    'raw', v_row.body,
    'resolved', v_resolved,
    'vars', v_vars,
    'missing', to_jsonb(v_missing)
  );
end;
$$;

grant execute on function public.resolve_page_template(text, uuid, uuid) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Seed de exemplo
-- ----------------------------------------------------------------------------
insert into public.page_templates (key, title, body, metadata)
values (
  'sobre_greeting',
  'Saudacao dinamica da pagina Sobre',
  'Ola, %person.full_name%! Somos a %company.name% (%company.tagline%). Sua empresa atual: %tenant.name%.',
  '{"description": "Banner da pagina /sobre que personaliza por usuario logado."}'::jsonb
)
on conflict (key) do update set
  title = excluded.title,
  body = excluded.body,
  metadata = excluded.metadata,
  is_active = true;
