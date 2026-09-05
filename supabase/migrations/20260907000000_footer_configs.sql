-- ============================================================================
-- 20260907000000_footer_configs.sql
-- ----------------------------------------------------------------------------
-- Footers por escopo (role) de forma dinamica, configuravel via banco.
--  - global_public: rodape IMUTAVEL do site publico, exibido quando nao ha
--    sessao. Mantem as regras do AGENTS.md (footer nao muda).
--  - candidate, company, provider, manager, admin_master: rodape customizado
--    por tipo de login, configurado pelo admin master.
--
-- Cada config possui um array de links (jsonb) com key, label, href, icon,
-- target_blank e is_active. O componente resolve em runtime e renderiza.
-- ============================================================================

set search_path = public, auth;

-- ----------------------------------------------------------------------------
-- 1. Tabela
-- ----------------------------------------------------------------------------
create table if not exists public.footer_configs (
  id           uuid primary key default gen_random_uuid(),
  scope        text not null unique,
  links        jsonb not null default '[]'::jsonb,
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint footer_configs_scope_valid check (
    scope in (
      'global_public',
      'candidate',
      'company',
      'provider',
      'manager',
      'admin_master'
    )
  )
);

create index if not exists idx_footer_configs_active_scope
  on public.footer_configs (scope)
  where is_active = true;

-- ----------------------------------------------------------------------------
-- 2. updated_at trigger (reusa o ja criado na E1 se existir)
-- ----------------------------------------------------------------------------
drop trigger if exists trg_footer_configs_updated_at on public.footer_configs;
create trigger trg_footer_configs_updated_at
  before update on public.footer_configs
  for each row execute function public.tg_set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. RLS
-- ----------------------------------------------------------------------------
alter table public.footer_configs enable row level security;

drop policy if exists footer_configs_public_read on public.footer_configs;
create policy footer_configs_public_read on public.footer_configs
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists footer_configs_admin_write on public.footer_configs;
create policy footer_configs_admin_write on public.footer_configs
  for all to authenticated
  using (public.is_admin_master())
  with check (public.is_admin_master());

-- ----------------------------------------------------------------------------
-- 4. Grants
-- ----------------------------------------------------------------------------
grant select on public.footer_configs to anon, authenticated;
grant insert, update, delete on public.footer_configs to authenticated;

-- ----------------------------------------------------------------------------
-- 5. Seed
-- ----------------------------------------------------------------------------
-- global_public mantem o conteudo do Footer.tsx atual, organizado por grupos.
insert into public.footer_configs (scope, links, sort_order, metadata)
values (
  'global_public',
  '[
    {"group": "Empresa", "links": [
      {"label": "Sobre Nos", "href": "/sobre"},
      {"label": "Clientes", "href": "/clientes"},
      {"label": "Parceiros", "href": "/parceiros"},
      {"label": "Fornecedores", "href": "/fornecedores"},
      {"label": "Blog", "href": "/blog"},
      {"label": "Politica de Privacidade", "href": "/privacidade"},
      {"label": "Termos de Uso", "href": "/termos"}
    ]},
    {"group": "Servicos", "links": [
      {"label": "Todos os Servicos", "href": "/servicos"},
      {"label": "Assessoria em RH", "href": "/servicos/assessoria-rh"},
      {"label": "Recrutamento e Selecao", "href": "/servicos/recrutamento-selecao"},
      {"label": "Mao de Obra Temporaria", "href": "/servicos/mao-de-obra-temporaria"},
      {"label": "Mao de Obra Efetiva", "href": "/servicos/mao-de-obra-efetiva"},
      {"label": "Facilities", "href": "/servicos/facilities"},
      {"label": "Limpeza", "href": "/servicos/limpeza"},
      {"label": "Jardinagem", "href": "/servicos/jardinagem"},
      {"label": "Terceirizacao", "href": "/servicos/terceirizacao"}
    ]},
    {"group": "Candidatos", "links": [
      {"label": "Vagas", "href": "/vagas"},
      {"label": "Cadastrar Curriculo", "href": "/trabalhe-conosco"},
      {"label": "Processo Seletivo", "href": "/processo-seletivo"}
    ]},
    {"group": "Empresas", "links": [
      {"label": "Empresas", "href": "/empresas"},
      {"label": "Divulgar Vaga", "href": "/empresas/divulgar-vaga"}
    ]},
    {"group": "Contato", "links": [
      {"label": "Fale Conosco", "href": "/contato"},
      {"label": "Suporte", "href": "/suporte"},
      {"label": "FAQ", "href": "/faq"},
      {"label": "Entrar", "href": "/login"}
    ]}
  ]'::jsonb,
  0,
  '{"immutable": true, "description": "Footer publico do site (regra AGENTS.md - nao alterar)"}'::jsonb
)
on conflict (scope) do update set
  links = excluded.links,
  metadata = excluded.metadata,
  is_active = true;

-- candidate: links uteis para quem esta logado como candidato.
insert into public.footer_configs (scope, links, sort_order, metadata)
values (
  'candidate',
  '[
    {"group": "Area do Candidato", "links": [
      {"label": "Inicio", "href": "/candidato"},
      {"label": "Vagas", "href": "/candidato/vagas"},
      {"label": "Minhas candidaturas", "href": "/candidato/candidaturas"},
      {"label": "Vagas favoritas", "href": "/candidato/favoritas"},
      {"label": "Alertas de vagas", "href": "/candidato/alertas"},
      {"label": "Meu curriculo", "href": "/candidato/curriculo"},
      {"label": "Meu perfil", "href": "/candidato/perfil"}
    ]},
    {"group": "Ajuda", "links": [
      {"label": "Suporte", "href": "/suporte"},
      {"label": "FAQ", "href": "/faq"},
      {"label": "Contato", "href": "/contato"}
    ]}
  ]'::jsonb,
  10,
  '{}'::jsonb
)
on conflict (scope) do update set links = excluded.links;

-- company: empresas clientes (divulgam vagas, gerenciam candidatos)
insert into public.footer_configs (scope, links, sort_order, metadata)
values (
  'company',
  '[
    {"group": "Area da Empresa", "links": [
      {"label": "Painel", "href": "/dashboard"},
      {"label": "Vagas publicadas", "href": "/dashboard/vagas"},
      {"label": "Candidatos", "href": "/dashboard/candidatos"},
      {"label": "Candidaturas", "href": "/dashboard/candidaturas"}
    ]},
    {"group": "Ajuda", "links": [
      {"label": "Suporte", "href": "/suporte"},
      {"label": "FAQ", "href": "/faq"}
    ]}
  ]'::jsonb,
  20,
  '{}'::jsonb
)
on conflict (scope) do update set links = excluded.links;

-- provider: fornecedores / prestadores
insert into public.footer_configs (scope, links, sort_order, metadata)
values (
  'provider',
  '[
    {"group": "Area do Fornecedor", "links": [
      {"label": "Painel", "href": "/dashboard"},
      {"label": "Pedidos", "href": "/dashboard/servicos"},
      {"label": "Documentos", "href": "/dashboard/documentos"}
    ]},
    {"group": "Ajuda", "links": [
      {"label": "Suporte", "href": "/suporte"}
    ]}
  ]'::jsonb,
  30,
  '{}'::jsonb
)
on conflict (scope) do update set links = excluded.links;

-- manager: gestor interno J&S (RH, fin, fiscal, etc)
insert into public.footer_configs (scope, links, sort_order, metadata)
values (
  'manager',
  '[
    {"group": "Operacao", "links": [
      {"label": "Painel", "href": "/dashboard"},
      {"label": "Funcionarios", "href": "/dashboard/funcionarios"},
      {"label": "Relatorios", "href": "/dashboard/relatorios"},
      {"label": "Configuracoes", "href": "/dashboard/configuracoes"}
    ]},
    {"group": "Ajuda", "links": [
      {"label": "Suporte interno", "href": "/suporte"}
    ]}
  ]'::jsonb,
  40,
  '{}'::jsonb
)
on conflict (scope) do update set links = excluded.links;

-- admin_master: admin global da J&S
insert into public.footer_configs (scope, links, sort_order, metadata)
values (
  'admin_master',
  '[
    {"group": "Administracao da Plataforma", "links": [
      {"label": "Visao Geral", "href": "/dashboard"},
      {"label": "Tenants", "href": "/dashboard/tenants"},
      {"label": "Usuarios", "href": "/dashboard/usuarios"},
      {"label": "Roles e Permissoes", "href": "/dashboard/roles-permissoes"},
      {"label": "Auditoria RBAC", "href": "/dashboard/rbac-auditoria"},
      {"label": "Documentos", "href": "/dashboard/documentos"},
      {"label": "LGPD", "href": "/dashboard/lgpd"},
      {"label": "Seguranca", "href": "/dashboard/seguranca"}
    ]},
    {"group": "Ajuda", "links": [
      {"label": "Suporte", "href": "/suporte"}
    ]}
  ]'::jsonb,
  50,
  '{}'::jsonb
)
on conflict (scope) do update set links = excluded.links;
