-- 32_seed.sql
-- Reproducible bootstrap seed for V2.1 SaaS
-- Idempotent, transactional, no hardcoded passwords
-- Uses ON CONFLICT / conditional inserts to support re-execution

begin;

-- ============================================================
-- ROLES GLOBAL
-- ============================================================

insert into public.roles (name, description, scope)
values
  ('admin_master', 'Administrador global do sistema', 'global'),
  ('admin_tenant', 'Administrador do tenant', 'tenant'),
  ('manager', 'Gerente operacional', 'tenant'),
  ('operator', 'Operador', 'tenant')
on conflict (name) do update set
  description = excluded.description,
  scope = excluded.scope;

-- ============================================================
-- PERMISSIONS
-- ============================================================

insert into public.permissions (resource, action, description)
values
  ('tenants', 'create', 'Criar tenant'),
  ('tenants', 'read', 'Ler tenant'),
  ('tenants', 'update', 'Atualizar tenant'),
  ('tenants', 'delete', 'Remover tenant'),
  ('people', 'create', 'Criar pessoa'),
  ('people', 'read', 'Ler pessoa'),
  ('people', 'update', 'Atualizar pessoa'),
  ('people', 'delete', 'Remover pessoa'),
  ('roles', 'create', 'Criar role'),
  ('roles', 'read', 'Ler role'),
  ('roles', 'update', 'Atualizar role'),
  ('roles', 'delete', 'Remover role'),
  ('companies', 'create', 'Criar empresa'),
  ('companies', 'read', 'Ler empresa'),
  ('companies', 'update', 'Atualizar empresa'),
  ('companies', 'delete', 'Remover empresa'),
  ('products', 'create', 'Criar produto'),
  ('products', 'read', 'Ler produto'),
  ('products', 'update', 'Atualizar produto'),
  ('products', 'delete', 'Remover produto'),
  ('stock_movements', 'create', 'Criar movimentação'),
  ('stock_movements', 'read', 'Ler movimentação'),
  ('purchase_orders', 'create', 'Criar pedido de compra'),
  ('purchase_orders', 'read', 'Ler pedido de compra'),
  ('purchase_orders', 'update', 'Atualizar pedido de compra'),
  ('purchase_orders', 'confirm', 'Confirmar pedido de compra'),
  ('purchase_receipts', 'create', 'Criar recebimento'),
  ('purchase_receipts', 'read', 'Ler recebimento'),
  ('purchase_receipts', 'confirm', 'Confirmar recebimento'),
  ('service_orders', 'create', 'Criar ordem de serviço'),
  ('service_orders', 'read', 'Ler ordem de serviço'),
  ('service_orders', 'update', 'Atualizar ordem de serviço'),
  ('service_orders', 'complete', 'Concluir ordem de serviço'),
  ('contracts', 'create', 'Criar contrato'),
  ('contracts', 'read', 'Ler contrato'),
  ('contracts', 'update', 'Atualizar contrato'),
  ('contracts', 'renew', 'Renovar contrato'),
  ('tasks', 'create', 'Criar tarefa'),
  ('tasks', 'read', 'Ler tarefa'),
  ('tasks', 'update', 'Atualizar tarefa'),
  ('tasks', 'assign', 'Atribuir tarefa'),
  ('support_tickets', 'create', 'Criar ticket'),
  ('support_tickets', 'read', 'Ler ticket'),
  ('support_tickets', 'update', 'Atualizar ticket'),
  ('support_tickets', 'resolve', 'Resolver ticket'),
  ('chat', 'create', 'Criar conversa'),
  ('chat', 'read', 'Ler conversa'),
  ('chat', 'handoff', 'Transferir atendimento'),
  ('notifications', 'create', 'Criar notificação'),
  ('notifications', 'read', 'Ler notificação'),
  ('files', 'upload', 'Enviar arquivo'),
  ('files', 'read', 'Ler arquivo'),
  ('files', 'delete', 'Remover arquivo'),
  ('documents', 'create', 'Criar documento'),
  ('documents', 'read', 'Ler documento'),
  ('documents', 'version', 'Criar versão de documento'),
  ('audit_logs', 'read', 'Ler auditoria'),
  ('security_events', 'read', 'Ler eventos de segurança'),
  ('lgpd', 'read', 'Ler dados LGPD'),
  ('lgpd', 'manage_consent', 'Gerenciar consentimento'),
  ('lgpd', 'manage_retention', 'Gerenciar retenção'),
  ('reports', 'read', 'Ler relatórios'),
  ('dashboard', 'read', 'Ler dashboard')
on conflict (resource, action) do update set
  description = excluded.description;

-- ============================================================
-- ROLE PERMISSIONS
-- ============================================================

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on true
where r.name = 'admin_master'
on conflict (role_id, permission_id) do nothing;

with tenant_perms as (
  select r.id as role_id, p.id as permission_id
  from public.roles r
  join public.permissions p on true
  where r.name = 'admin_tenant'
    and p.resource not in ('tenants', 'roles', 'permissions', 'role_permissions', 'reports', 'dashboard')
)
insert into public.role_permissions (role_id, permission_id)
select role_id, permission_id from tenant_perms
on conflict (role_id, permission_id) do nothing;

with manager_perms as (
  select r.id as role_id, p.id as permission_id
  from public.roles r
  join public.permissions p on true
  where r.name = 'manager'
    and p.resource in (
      'people', 'companies', 'products', 'stock_movements',
      'purchase_orders', 'purchase_receipts', 'service_orders',
      'contracts', 'tasks', 'support_tickets', 'files', 'documents', 'reports', 'dashboard'
    )
    and p.action in ('read', 'create', 'update')
)
insert into public.role_permissions (role_id, permission_id)
select role_id, permission_id from manager_perms
on conflict (role_id, permission_id) do nothing;

with operator_perms as (
  select r.id as role_id, p.id as permission_id
  from public.roles r
  join public.permissions p on true
  where r.name = 'operator'
    and p.resource in (
      'companies', 'products', 'stock_movements',
      'purchase_orders', 'purchase_receipts', 'service_orders',
      'contracts', 'tasks', 'support_tickets', 'files', 'documents'
    )
    and p.action in ('read', 'create')
)
insert into public.role_permissions (role_id, permission_id)
select role_id, permission_id from operator_perms
on conflict (role_id, permission_id) do nothing;

-- ============================================================
-- TENANT INICIAL
-- ============================================================

insert into public.tenants (name, slug, status)
values
  ('J&S Empregos LTDA', 'js-empregos', 'active')
on conflict (slug) do update set
  name = excluded.name,
  status = excluded.status;

-- ============================================================
-- TENANT SETTINGS
-- ============================================================

insert into public.tenant_settings (tenant_id, key, value)
select t.id, k.key, k.value
from public.tenants t
cross join (
  values
     ('notifications.email.enabled', 'true'::jsonb),
     ('notifications.whatsapp.enabled', 'false'::jsonb),
     ('notifications.push.enabled', 'false'::jsonb),
     ('inventory.min_stock_alert', 'true'::jsonb),
     ('inventory.expiry_alert_days', '30'::jsonb),
     ('support.sla_hours', '24'::jsonb),
     ('billing.currency', '"BRL"'::jsonb),
     ('lgpd.retention_default_days', '365'::jsonb)
) as k(key, value)
left join public.tenant_settings ts on ts.tenant_id = t.id and ts.key = k.key
where t.slug = 'js-empregos'
  and ts.id is null;

-- ============================================================
-- PEOPLE INICIAIS
-- ============================================================

insert into public.people (id, auth_user_id, full_name, email, phone, status)
values
  (
    '00000000-0000-0000-0000-000000000001',
    null,
    'Admin Master',
    'admin@jsempregos.com.br',
    null,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    null,
    'Admin Tenant',
    'admin.tenant@jsempregos.com.br',
    null,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    null,
    'Gerente Operacional',
    'gerente@jsempregos.com.br',
    null,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    null,
    'Operador',
    'operador@jsempregos.com.br',
    null,
    'active'
  )
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone,
  status = excluded.status;

-- ============================================================
-- TENANT MEMBERSHIPS
-- ============================================================

insert into public.tenant_memberships (person_id, tenant_id, status)
select p.id, t.id, 'active'
from public.people p
join public.tenants t on t.slug = 'js-empregos'
where p.email in (
  'admin@jsempregos.com.br',
  'admin.tenant@jsempregos.com.br',
  'gerente@jsempregos.com.br',
  'operador@jsempregos.com.br'
)
on conflict (person_id, tenant_id) do update set
  status = excluded.status;

-- ============================================================
-- ROLE ASSIGNMENTS
-- ============================================================

insert into public.role_assignments (person_id, role_id, tenant_id)
select p.id, r.id, t.id
from public.people p
join public.tenants t on t.slug = 'js-empregos'
join public.roles r on r.name in ('admin_master', 'admin_tenant', 'manager', 'operator')
where (p.email = 'admin@jsempregos.com.br' and r.name = 'admin_master')
   or (p.email = 'admin.tenant@jsempregos.com.br' and r.name = 'admin_tenant')
   or (p.email = 'gerente@jsempregos.com.br' and r.name = 'manager')
   or (p.email = 'operador@jsempregos.com.br' and r.name = 'operator')
on conflict (person_id, role_id, tenant_id) do nothing;

-- ============================================================
-- FIRST LOGIN STATE
-- ============================================================

insert into public.first_login_state (person_id, must_change_password, terms_version, privacy_version, lgpd_consent_version, first_login_completed)
select p.id, true, 'v1', 'v1', 'v1', false
from public.people p
where p.email in (
  'admin@jsempregos.com.br',
  'admin.tenant@jsempregos.com.br',
  'gerente@jsempregos.com.br',
  'operador@jsempregos.com.br'
)
on conflict (person_id) do update set
  must_change_password = excluded.must_change_password,
  terms_version = excluded.terms_version,
  privacy_version = excluded.privacy_version,
  lgpd_consent_version = excluded.lgpd_consent_version;

-- ============================================================
-- TENANT-SCOPED STATUS / CONFIGURATION SEEDS
-- ============================================================

-- Categories for products (example)
insert into public.tenant_settings (tenant_id, key, value)
select t.id, k.key, k.value
from public.tenants t
cross join (
  values
     ('inventory.categories.EPIs', '"EPI"'::jsonb),
     ('inventory.categories.ferramentas', '"Ferramentas"'::jsonb),
     ('inventory.categories.materiais', '"Materiais"'::jsonb),
     ('inventory.categories.uniformes', '"Uniformes"'::jsonb),
     ('inventory.units.unidade', '"unidade"'::jsonb),
     ('inventory.units.caixa', '"caixa"'::jsonb),
     ('inventory.units.par', '"par"'::jsonb),
     ('inventory.units.kit', '"kit"'::jsonb)
) as k(key, value)
left join public.tenant_settings ts on ts.tenant_id = t.id and ts.key = k.key
where t.slug = 'js-empregos'
  and ts.id is null;

-- ============================================================
-- LGPD DEFAULT POLICIES
-- ============================================================

insert into public.data_retention_policies (tenant_id, data_domain, retention_days, legal_basis, action_after_expiry, enabled)
select t.id, k.data_domain, k.retention_days::integer, k.legal_basis, k.action_after_expiry, true
from public.tenants t
cross join (
  values
    ('audit_logs', '730', 'Legislação tributária e trabalhista', 'archive'),
    ('security_events', '730', 'Legislação tributária e trabalhista', 'archive'),
    ('stock_movements', '1825', 'Controle patrimonial e fiscal', 'archive'),
    ('contracts', '3650', 'Contratos e obrigações legais', 'archive'),
    ('privacy_requests', '3650', 'LGPD e direitos do titular', 'archive'),
    ('consents', '3650', 'LGPD e direitos do titular', 'archive'),
    ('support_tickets', '1095', 'Controle de qualidade', 'archive'),
    ('documents', '3650', 'Contratos e obrigações legais', 'archive')
) as k(data_domain, retention_days, legal_basis, action_after_expiry)
left join public.data_retention_policies drp on drp.tenant_id = t.id and drp.data_domain = k.data_domain
where t.slug = 'js-empregos'
  and drp.id is null;

-- ============================================================
-- EVENT TYPE DEFAULTS
-- ============================================================

insert into public.tenant_settings (tenant_id, key, value)
select t.id, k.key, k.value
from public.tenants t
cross join (
  values
    ('events.channels.n8n', 'true'::jsonb),
    ('events.channels.email', 'true'::jsonb),
    ('events.channels.whatsapp', 'false'::jsonb),
    ('events.retry.max_attempts', '5'::jsonb),
    ('events.retry.backoff_base_minutes', '1'::jsonb)
) as k(key, value)
left join public.tenant_settings ts on ts.tenant_id = t.id and ts.key = k.key
where t.slug = 'js-empregos'
  and ts.id is null;

-- ============================================================
-- FINANCE DEFAULT CATEGORIES
-- ============================================================

insert into public.financial_categories (tenant_id, name, type, description)
select t.id, k.name, k.type, k.description
from public.tenants t
cross join (
  values
    ('receita_servicos', 'Receita de Serviços', 'revenue', 'Receita proveniente de serviços prestados'),
    ('receita_produtos', 'Receita de Produtos', 'revenue', 'Receita proveniente de venda de produtos'),
    ('despesa_operacional', 'Despesa Operacional', 'expense', 'Despesas gerais de operação'),
    ('despesa_administrativa', 'Despesa Administrativa', 'expense', 'Despesas administrativas'),
    ('transferencia_interna', 'Transferência Interna', 'transfer', 'Transferências entre contas internas')
) as k(internal_name, name, type, description)
left join public.financial_categories fc on fc.tenant_id = t.id and fc.name = k.name
where t.slug = 'js-empregos'
  and fc.id is null;

-- ============================================================
-- COST CENTERS DEFAULT
-- ============================================================

insert into public.cost_centers (tenant_id, name, code, description)
select t.id, k.name, k.code, k.description
from public.tenants t
cross join (
  values
    ('Administração Central', 'ADM', 'Centro de custo administrativo'),
    ('Recursos Humanos', 'RH', 'Centro de custo de RH'),
    ('Estoque/Almoxarifado', 'EST', 'Centro de custo de estoque'),
    ('Financeiro', 'FIN', 'Centro de custo financeiro'),
    ('Operações', 'OP', 'Centro de custo operacional')
) as k(name, code, description)
left join public.cost_centers cc on cc.tenant_id = t.id and cc.code = k.code
where t.slug = 'js-empregos'
  and cc.id is null;

-- ============================================================
-- FISCAL CONFIGURATION DEFAULT
-- ============================================================

insert into public.fiscal_configurations (tenant_id, regime_tributario, ambiente, serie_nf, serie_nfce)
select t.id, 'simples_nacional', 'homologacao', '1', '1'
from public.tenants t
left join public.fiscal_configurations fc on fc.tenant_id = t.id
where t.slug = 'js-empregos'
  and fc.id is null;

-- ============================================================
-- TAX RATES DEFAULT
-- ============================================================

insert into public.tax_rates (tenant_id, name, type, rate, effective_date)
select t.id, k.name, k.type, k.rate, current_date
from public.tenants t
cross join (
  values
    ('ICMS Padrão', 'icms', 18),
    ('IPI Padrão', 'ipi', 0),
    ('PIS Padrão', 'pis', 1.65),
    ('COFINS Padrão', 'cofins', 7.6),
    ('ISS Padrão', 'iss', 5)
) as k(name, type, rate)
left join public.tax_rates tr on tr.tenant_id = t.id and tr.type = k.type and tr.effective_date = current_date
where t.slug = 'js-empregos'
  and tr.id is null;

-- ============================================================
-- RECRUITMENT STAGE TEMPLATES DEFAULT
-- ============================================================

insert into public.stage_templates (tenant_id, name, description, order_index, is_mandatory)
select t.id, k.name, k.description, k.order_index, k.is_mandatory
from public.tenants t
cross join (
  values
    ('Triagem de Currículo', 'Análise inicial do currículo', 1, true),
    ('Entrevista com RH', 'Entrevista com recursos humanos', 2, true),
    ('Entrevista com Gestor', 'Entrevista com gestor da área', 3, true),
    ('Teste Técnico', 'Avaliação técnica específica', 4, false),
    ('Proposta', 'Apresentação de proposta', 5, true)
) as k(name, description, order_index, is_mandatory)
left join public.stage_templates st on st.tenant_id = t.id and st.name = k.name
where t.slug = 'js-empregos'
  and st.id is null;

-- ============================================================
-- AUTOMATION JOB DEFAULTS
-- ============================================================

insert into public.automation_jobs (tenant_id, name, description, trigger_type, trigger_config, action_type, action_config, is_active)
select t.id, k.name, k.description, k.trigger_type, k.trigger_config::jsonb, k.action_type, k.action_config::jsonb, k.is_active
from public.tenants t
cross join (
  values
    ('Enviar notificação de vaga publicada', 'Dispara notificação quando uma vaga é publicada', 'event', '{"event_type": "job.published"}', 'notification', '{"channel": "email"}', true),
    ('Criar tarefa de follow-up', 'Cria tarefa de follow-up após candidatura recebida', 'event', '{"event_type": "application.received"}', 'function', '{"function": "create_follow_up_task"}', true)
) as k(name, description, trigger_type, trigger_config, action_type, action_config, is_active)
left join public.automation_jobs aj on aj.tenant_id = t.id and aj.name = k.name
where t.slug = 'js-empregos'
  and aj.id is null;

-- ============================================================
-- DONE
-- ============================================================

commit;
