-- =============================================================================
-- FASE 3 — Test Fixtures: dados de exemplo para desenvolvimento
-- =============================================================================
-- Popula dados básicos para testes locais e previews.
-- ATENÇÃO: idempotente (usa INSERT ... ON CONFLICT DO NOTHING).
-- =============================================================================

-- 1. Tenant de exemplo
INSERT INTO public.tenants (id, name, slug, plan, settings, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Tenant de Exemplo',
  'exemplo',
  'pro',
  '{}'::jsonb,
  true,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Pessoas de exemplo
INSERT INTO public.people (id, tenant_id, full_name, email, phone, role, cpf, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'João Silva', 'joao@exemplo.com', '(11) 99999-0001', 'admin', '12345678901', now(), now()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Maria Souza', 'maria@exemplo.com', '(11) 99999-0002', 'recruiter', '98765432100', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. Vínculos tenant_memberships
INSERT INTO public.tenant_memberships (tenant_id, person_id, role, status, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'admin', 'active', now(), now()),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'recruiter', 'active', now(), now())
ON CONFLICT (tenant_id, person_id) DO NOTHING;

-- 4. Candidatos de exemplo
INSERT INTO public.candidates (id, tenant_id, full_name, email, phone, cpf, role, status, source, created_at, updated_at)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Ana Pereira', 'ana@exemplo.com', '(11) 98888-0001', '11122233344', 'candidate', 'active', 'website', now(), now()),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Carlos Lima', 'carlos@exemplo.com', '(11) 98888-0002', '55566677788', 'candidate', 'active', 'linkedin', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 5. Vagas de exemplo
INSERT INTO public.jobs (id, tenant_id, title, description, location, salary_range, status, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Desenvolvedor Frontend', 'Vaga para desenvolvimento React/TypeScript', 'São Paulo - SP', 'R$ 5.000 - R$ 8.000', 'open', now(), now()),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Desenvolvedor Backend', 'Vaga para desenvolvimento Node.js/Python', 'Remoto', 'R$ 6.000 - R$ 10.000', 'open', now(), now())
ON CONFLICT (id) DO NOTHING;
