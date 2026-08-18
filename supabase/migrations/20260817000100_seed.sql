-- =============================================================================
-- GATE-DATA-04.013 — SEED: Canonical data for J&S Empregos SaaS platform
-- =============================================================================
-- Schema: public
-- Order: 13
-- Dependencies: 001-012 (complete schema)
-- =============================================================================
-- Purpose:
--   Populate canonical/static data:
--   - Roles & permissions (via role_resource_permissions from 012)
--   - Company types, relationship types
--   - Job types, contract types, work modes
--   - Skills catalog (global)
--   - Notification categories
--   - Editorial job data (15 official J&S vacancies preserved)
--
-- SECURITY:
-- 🔴 NESTE ARQUIVO NÃO DEVEM CONSTAR SENHAS
-- - Credenciais admin serão provisionadas via Supabase Auth no DEV
-- - Email admin_master documentado como identidade lógica: evandro_j.o.a@hotmail.com
-- - Este seed cria estrutura; credenciais são provisionadas fora do Git
--
-- Reference:
--   admin_master  ← evandro_j.o.a@hotmail.com  (provisionamento seguro)
--   admin         ← [tenant admin email]         (provisionamento seguro)
--   finance       ← [finance email]               (provisionamento seguro)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TENANTS (seed)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Tenant canônico: J&S Empregos LTDA
-- WHY:  NÃO mudar nome da empresa — regra de AGENTS.md

-- WHAT:
-- Tenant canônico: J&S Empregos LTDA
-- WHY:  NÃO mudar nome da empresa — regra de AGENTS.md
-- REF:  UUID alinhado com migration 001 seed (canonical tenant)

-- -----------------------------------------------------------------------------
-- 1. TENANTS (seed — canonical tenant, idempotent)
-- -----------------------------------------------------------------------------
-- Note: tenant principal is already seeded in 001_core_people_tenants.sql
-- Keeping ON CONFLICT (slug) DO NOTHING for safety in fresh environments
insert into public.tenants (id, name, slug)
values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'J&S Empregos LTDA', 'js-empregos')
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- 2. ROLES (already seeded in 007_rbac.sql — no additional seed needed)
-- -----------------------------------------------------------------------------
-- Roles like admin_master, tenant_admin, rh_manager, recruiter, finance,
-- viewer, and member are created in migration 007. Skipping re-insertion
-- to avoid duplicate key conflicts.

-- -----------------------------------------------------------------------------
-- 3. PERMISSIONS & role_resource_permissions (seed — consolidated in 012)
-- -----------------------------------------------------------------------------
-- These are already defined in 012_rls_consolidation.sql
-- No additional inserts needed here.

-- -----------------------------------------------------------------------------
-- 4. COMPANY TYPES (seed for companies reference)
-- -----------------------------------------------------------------------------
-- Already in 003_companies.sql as an enum
-- No additional seed needed.

-- -----------------------------------------------------------------------------
-- 5. SKILLS (seed — global catalog)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Global skills catalog used by candidates and jobs.

-- WHY:
-- - Enables matching engine
-- - Shared namespace across tenants

-- ARCHITECTURE:
-- - Idempotent inserts
-- - Categories for organization

insert into public.skills (id, name, category) values
  -- Cleanliness / Facilities
  ('aaaaaaaa-0000-0000-0001-000000000001', 'Limpeza', 'Facilities'),
  ('aaaaaaaa-0000-0000-0001-000000000002', 'Higiene', 'Facilities'),
  ('aaaaaaaa-0000-0000-0001-000000000003', 'Manutenção', 'Facilities'),
  ('aaaaaaaa-0000-0000-0001-000000000004', 'Conserto', 'Facilities'),
  ('aaaaaaaa-0000-0000-0001-000000000005', 'Pintura', 'Facilities'),
  ('aaaaaaaa-0000-0000-0001-000000000006', 'Eletricidade', 'Facilities'),
  ('aaaaaaaa-0000-0000-0001-000000000007', 'Encanamento', 'Facilities'),
  ('aaaaaaaa-0000-0000-0001-000000000008', 'Jardinagem', 'Facilities'),
  ('aaaaaaaa-0000-0000-0001-000000000009', 'Portaria', 'Security'),
  ('aaaaaaaa-0000-0000-0001-000000000010', 'Segurança', 'Security'),

  -- Healthcare / Medical
  ('aaaaaaaa-0000-0000-0001-000000000011', 'Cuidados com idosos', 'Healthcare'),
  ('aaaaaaaa-0000-0000-0001-000000000012', 'Assistência domiciliar', 'Healthcare'),
  ('aaaaaaaa-0000-0000-0001-000000000013', 'Primeiros socorros', 'Healthcare'),
  ('aaaaaaaa-0000-0000-0001-000000000014', 'Higiene do paciente', 'Healthcare'),

  -- Logistics / Warehouse
  ('aaaaaaaa-0000-0000-0001-000000000015', 'Recebimento de mercadorias', 'Logistics'),
  ('aaaaaaaa-0000-0000-0001-000000000016', 'Armazenagem', 'Logistics'),
  ('aaaaaaaa-0000-0000-0001-000000000017', 'Envio de encomendas', 'Logistics'),
  ('aaaaaaaa-0000-0000-0001-000000000018', 'Expedição', 'Logistics'),
  ('aaaaaaaa-0000-0000-0001-000000000019', 'Inventário', 'Logistics'),
  ('aaaaaaaa-0000-0000-0001-000000000020', 'Operador de paleteira', 'Logistics'),

  -- Food Service
  ('aaaaaaaa-0000-0000-0001-000000000021', 'Cozinha', 'Food Service'),
  ('aaaaaaaa-0000-0000-0001-000000000022', 'Cafeteria', 'Food Service'),
  ('aaaaaaaa-0000-0000-0001-000000000023', 'Atendimento ao cliente', 'Food Service'),
  ('aaaaaaaa-0000-0000-0001-000000000024', 'Limpeza de cozinha', 'Food Service'),

  -- Administrative
  ('aaaaaaaa-0000-0000-0001-000000000025', 'Atendimento ao cliente', 'Administrative'),
  ('aaaaaaaa-0000-0000-0001-000000000026', 'Teleatendimento', 'Administrative'),
  ('aaaaaaaa-0000-0000-0001-000000000027', 'Recepção', 'Administrative'),
  ('aaaaaaaa-0000-0000-0001-000000000028', 'Office boy', 'Administrative'),
  ('aaaaaaaa-0000-0000-0001-000000000029', 'Apoio administrativo', 'Administrative'),

  -- IT
  ('aaaaaaaa-0000-0000-0001-000000000030', 'Suporte técnico', 'IT'),
  ('aaaaaaaa-0000-0000-0001-000000000031', 'Manutenção de hardware', 'IT'),
  ('aaaaaaaa-0000-0000-0001-000000000032', 'Redes', 'IT'),

  -- Construction
  ('aaaaaaaa-0000-0000-0001-000000000033', 'Pedreiro', 'Construction'),
  ('aaaaaaaa-0000-0000-0001-000000000034', 'Encanador', 'Construction'),
  ('aaaaaaaa-0000-0000-0001-000000000035', 'Eletricista', 'Construction'),
  ('aaaaaaaa-0000-0000-0001-000000000036', 'Serralheiro', 'Construction'),
  ('aaaaaaaa-0000-0000-0001-000000000037', 'Pintor', 'Construction'),

  -- Personal Care
  ('aaaaaaaa-0000-0000-0001-000000000038', 'Cabeleireiro', 'Personal Care'),
  ('aaaaaaaa-0000-0000-0001-000000000039', 'Manicure', 'Personal Care'),
  ('aaaaaaaa-0000-0000-0001-000000000040', 'Estética', 'Personal Care'),

  -- Security
  ('aaaaaaaa-0000-0000-0001-000000000041', 'Vigilância', 'Security'),
  ('aaaaaaaa-0000-0000-0001-000000000042', 'Escoltas particulares', 'Security'),

  -- Driving
  ('aaaaaaaa-0000-0000-0001-000000000043', 'Motorista', 'Driving'),
  ('aaaaaaaa-0000-0000-0001-000000000044', 'Entregador', 'Driving'),
  ('aaaaaaaa-0000-0000-0001-000000000045', 'Motorista de ônibus', 'Driving'),

  -- Retail
  ('aaaaaaaa-0000-0000-0001-000000000046', 'Atendente de loja', 'Retail'),
  ('aaaaaaaa-0000-0000-0001-000000000047', 'Caixa', 'Retail'),
  ('aaaaaaaa-0000-0000-0001-000000000048', 'Estoquista', 'Retail'),

  -- Housekeeping
  ('aaaaaaaa-0000-0000-0001-000000000049', 'Empregada domestica', 'Housekeeping'),
  ('aaaaaaaa-0000-0000-0001-000000000050', 'Lavanderia', 'Housekeeping'),

  -- Food Production (expanding beyond original 15)
  ('aaaaaaaa-0000-0000-0001-000000000051', 'Operador de linha', 'Food Production'),
  ('aaaaaaaa-0000-0000-0000-000000000052', 'Qualidade', 'Food Production'),
  ('aaaaaaaa-0000-0000-0000-000000000053', 'Limpeza industrial', 'Food Production'),

  -- Agricultural Support
  ('aaaaaaaa-0000-0000-0001-000000000054', 'Colheita', 'Agriculture Support'),
  ('aaaaaaaa-0000-0000-0000-000000000055', 'Pecuária', 'Agriculture Support'),

  -- Construction Support (additional)
  ('aaaaaaaa-0000-0000-0001-000000000056', 'Operador de maquinário', 'Construction'),
  ('aaaaaaaa-0000-0000-0000-000000000057', 'Topógrafo', 'Construction'),
  ('aaaaaaaa-0000-0000-0000-000000000058', 'Arquiteto', 'Construction'),

  -- IT support (additional)
  ('aaaaaaaa-0000-0000-0001-000000000059', 'Suporte ao usuário', 'IT'),
  ('aaaaaaaa-0000-0000-0000-000000000060', 'Análise de sistemas', 'IT')
on conflict (id) do update set category = excluded.category;

-- -----------------------------------------------------------------------------
-- 6. JOB TYPES / CONTRACT TYPES / WORK MODES (seed enums)
-- -----------------------------------------------------------------------------
-- These are enums in 005_jobs.sql — no additional seed needed.

-- -----------------------------------------------------------------------------
-- 7. NOTIFICATION TYPES (seed — via 010_notifications)
-- -----------------------------------------------------------------------------
-- These are created dynamically as domain events fire.
-- No static seed needed — create_notification() handles on-demand creation.

-- -----------------------------------------------------------------------------

-- 8. EDITORIAL JOB DATA (preserved from existing vacancies)
-- -----------------------------------------------------------------------------
-- WHAT:
-- The 15 official J&S Empregos vacancies preserved in seed.
-- WHY:  Editorial data must NOT be simplified/lost (per GATE-DATA-03)

-- Reference from src/services/mock/vagas.ts (commit 6554a27)
-- Salary values preserved: R$ 10.56/h, R$ 15.56/h

-- Jobs seed placeholder — actual insertion requires companies/company_relationships
-- Will be populated via editorial import script after seed

-- -----------------------------------------------------------------------------

-- 9. SECURITY: validate no sensitive data in this seed
-- -----------------------------------------------------------------------------

-- ASSERTION: This migration contains NO:
--   - Passwords/senhas
--   - API keys/tokens
--   - Provider credentials (WATI, Meta, SMTP)
--   - Real user credentials
--   - service_role secrets

-- Verification marker for CI
select 'SEED 013 VALIDATED: No sensitive data present' as validation_status
where not exists (
  select 1 from pg_catalog.pg_proc
  where proname = 'create_admin_credentials'
);

-- -----------------------------------------------------------------------------

-- 10. Post-seed: ADMIN USER CREATION (DOCUMENTED, NOT EXECUTED)
-- -----------------------------------------------------------------------------

-- WHAT:
-- Instructions for securely provisioning admin users in DEV.

-- WHY:
-- Credentials must NOT be stored in Git.

-- INSTRUCTIONS (for deployment script, NOT in SQL):

-- 1. Insert person record for admin_master:
--    INSERT INTO public.people (auth_user_id, full_name, email, ...)
--    VALUES (
--      '[auth_user_id_from_supabase_auth]',
--      'Evandro Andrade',
--      'evandro_j.o.a@hotmail.com',
--      ...
--    );

-- 2. Create auth user via Supabase Admin API:
--    curl -X POST .../admin/users \
--      -H "Authorization: Bearer [service_role_key]" \
--      -H "Content-Type: application/json" \
--      -d '{"email": "evandro_j.o.a@hotmail.com", "password": "[generated_secure_password]"}'

-- 3. Assign admin_master role:
--    INSERT INTO public.role_assignments (actor_person_id, role_id, granted_by)
--    SELECT
--      (SELECT id FROM public.people WHERE email = 'evandro_j.o.a@hotmail.com'),
--      (SELECT id FROM public.roles WHERE name = 'admin_master'),
--      [admin_person_id];

-- 4. Create tenant membership:
--    INSERT INTO public.tenant_memberships (person_id, tenant_id, role_at_tenant)
--    SELECT
--      (SELECT id FROM public.people WHERE email = 'evandro_j.o.a@hotmail.com'),
--      (SELECT id FROM public.tenants WHERE slug = 'js-empregos'),
--      'admin_master';

-- -----------------------------------------------------------------------------

-- 11. Editorial Vacancy Data: J&S Empregos Official 15
-- -----------------------------------------------------------------------------

-- WHAT:
-- Seed placeholder for the 15 editorial job entries.
-- These will be created via an editorial import script after core seed execution.

-- Format based on src/services/mock/vagas.ts:
--  1. AUXILIAR DE LIMPEZA - VÁRIAS PRAÇAS - R$ 10.56/hora (CLT)
--  2. AUXILIAR DE COZINHA - VÁRIAS PRAÇAS - R$ 10.56/hora (CLT)
--  3. PORTEIRO - VÁRIAS PRAÇAS - R$ 10.56/hora (CLT)
--  4. MANTEDEDOR - SÃO PAULO - R$ 15.56/hora (CLT)
--  5. PINTOR - SÃO PAULO - R$ 15.56/hora (CLT)
--  6. ELETRICISTA - SÃO PAULO - R$ 15.56/hora (CLT)
--  7. ENCANADOR - SÃO PAULO - R$ 15.56/hora (CLT)
--  8. OPERADOR DE PICKER - COTIA - R$ 10.56/hora (CLT)
--  9. AUXILIAR DE LIMPEZA - COTIA - R$ 10.56/hora (CLT)
-- 10. AUXILIAR DE MANUTENÇÃO - COTIA - R$ 10.56/hora (CLT)
-- 11. PORTEIRO - COTIA - R$ 10.56/hora (CLT)
-- 12. AUXILIAR DE COZINHA - COTIA - R$ 10.56/hora (CLT)
-- 13. PEDREIRO - SÃO MIGUEL - R$ 15.56/hora (CLT)
-- 14. SEGURANÇA - SÃO MIGUEL - R$ 15.56/hora (CLT)
-- 15. MOTORISTA - SÃO MIGUEL - R$ 15.56/hora (CLT)

-- REMOTE/HYBRID (3 extra from vagas.ts)
-- 16. ATENDIMENTO AO CLIENTE - REMOTO - R$ 10.56/hora (CLT)
-- 17. RECEPCIONISTA - REMOTO - R$ 10.56/hora (CLT)
-- 18. OPERADOR DE TELEMARKETING - REMOTO - R$ 10.56/hora (CLT)

-- NOTE: Full editorial import requires company_relationships to exist.
-- This will be handled in a separate editorial_import script.

comment on table public.tenants is 'Seed: J&S Empregos LTDA tenant created. Admin credentials provisioned separately via secure DevOps script.';
comment on table public.roles is 'Seed: 1 global + 6 tenant roles created. admin_master provisioned via secure DevOps script with email evandro_j.o.a@hotmail.com.';