begin;

create or replace function public.register_company_interest(
  p_name text,
  p_cnpj text,
  p_email text,
  p_phone text,
  p_contact_name text,
  p_contact_phone text,
  p_contact_email text,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_tenant_id uuid;
  v_company_id uuid;
  v_name text := btrim(p_name);
  v_cnpj text := public.normalize_cnpj(p_cnpj);
  v_email text := lower(btrim(p_email));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_contact_name text := btrim(p_contact_name);
  v_contact_phone text := regexp_replace(coalesce(p_contact_phone, ''), '[^0-9]', '', 'g');
  v_contact_email text := lower(btrim(p_contact_email));
  v_message text := nullif(btrim(p_message), '');
  v_ip text := nullif(split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1), '');
  v_user_agent text := nullif(current_setting('request.headers', true)::json->>'user-agent', '');
begin
  if v_name is null or length(v_name) < 2 or length(v_name) > 200 then
    raise exception using errcode = 'P0001', message = 'Dados da empresa inválidos.';
  end if;
  if v_cnpj is null or length(v_cnpj) <> 14 or not public.is_valid_cnpj(v_cnpj) then
    raise exception using errcode = 'P0001', message = 'CNPJ inválido.';
  end if;
  if v_email is null or length(v_email) > 320 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = 'P0001', message = 'E-mail inválido.';
  end if;
  if length(v_phone) < 8 or length(v_phone) > 15 then
    raise exception using errcode = 'P0001', message = 'Telefone inválido.';
  end if;
  if v_contact_name is null or length(v_contact_name) < 2 or length(v_contact_name) > 200 then
    raise exception using errcode = 'P0001', message = 'Dados do contato inválidos.';
  end if;
  if length(v_contact_phone) < 8 or length(v_contact_phone) > 15 then
    raise exception using errcode = 'P0001', message = 'Telefone do contato inválido.';
  end if;
  if v_contact_email is null or length(v_contact_email) > 320 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = 'P0001', message = 'E-mail do contato inválido.';
  end if;
  if v_message is not null and length(v_message) > 2000 then
    raise exception using errcode = 'P0001', message = 'Mensagem excede o limite permitido.';
  end if;
  select t.id into v_tenant_id from public.tenants t where t.slug = 'js-empregos' and t.status = 'active' limit 1;
  if v_tenant_id is null then
    raise exception using errcode = 'P0001', message = 'Serviço temporariamente indisponível.';
  end if;
  if exists (select 1 from public.companies c where c.cnpj = v_cnpj and c.status = 'pending') then
    raise exception using errcode = '23505', message = 'Já existe uma solicitação pendente para este CNPJ.';
  end if;
  insert into public.companies (tenant_id, name, cnpj, status, created_by, created_at, updated_at, email, phone, metadata)
  values (v_tenant_id, v_name, v_cnpj, 'pending', null, now(), now(), v_email, v_phone,
    jsonb_build_object('source','public_company_interest','contact_name',v_contact_name,'contact_phone',v_contact_phone,'contact_email',v_contact_email,'interest_message',v_message))
  returning id into v_company_id;
  insert into public.activity_logs (tenant_id,user_id,action,entity_type,entity_id,changes,metadata,ip_address,user_agent,created_at)
  values (v_tenant_id,null,'company_interest_registered','company',v_company_id,
    jsonb_build_object('status','pending','source','public_company_interest'),
    jsonb_build_object('source','public_company_interest'),v_ip,v_user_agent,now());
  perform public.domain_event_emit(v_tenant_id,'company.interest_registered','company',v_company_id,
    jsonb_build_object('source','public_company_interest'),'company-interest:' || v_company_id::text);
  return v_company_id;
exception
  when unique_violation then
    raise exception using errcode = '23505', message = 'Já existe uma solicitação pendente para este CNPJ.';
end;
$$;

revoke execute on function public.register_company_interest(text,text,text,text,text,text,text,text) from public;
revoke execute on function public.register_company_interest(text,text,text,text,text,text,text,text) from anon, authenticated;
grant execute on function public.register_company_interest(text,text,text,text,text,text,text,text) to anon, authenticated;

commit;
