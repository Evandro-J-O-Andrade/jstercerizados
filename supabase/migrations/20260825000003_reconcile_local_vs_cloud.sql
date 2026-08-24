-- =============================================================================
-- RECONCILIATION: Local seed vs Supabase Cloud
-- =============================================================================
-- Purpose:
--   Compare local editorial seed with remote Supabase data before applying
--   migrations. This helps identify:
--   - Which jobs already exist in the cloud
--   - Which jobs are missing
--   - Which jobs have conflicting IDs/slugs
--   - Tenant alignment issues
--
-- Usage:
--   Run these queries in Supabase SQL Editor (cloud) to compare with local seed
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Check current jobs in cloud
-- -----------------------------------------------------------------------------
select
  id,
  title,
  slug,
  status,
  city,
  state,
  contract_type,
  tenant_id,
  company_relationship_id,
  created_at
from public.jobs
order by created_at desc;

-- -----------------------------------------------------------------------------
-- 2. Count jobs by status
-- -----------------------------------------------------------------------------
select
  status,
  count(*) as total
from public.jobs
group by status
order by status;

-- -----------------------------------------------------------------------------
-- 3. Check tenant alignment
-- -----------------------------------------------------------------------------
select
  tenant_id,
  count(*) as job_count
from public.jobs
group by tenant_id;

-- -----------------------------------------------------------------------------
-- 4. Check companies in cloud
-- -----------------------------------------------------------------------------
select
  id,
  legal_name,
  trading_name,
  cnpj,
  status,
  created_at
from public.companies
order by created_at desc;

-- -----------------------------------------------------------------------------
-- 5. Check company relationships
-- -----------------------------------------------------------------------------
select
  cr.id,
  cr.company_id,
  cr.tenant_id,
  crt.code as relationship_type,
  cr.status
from public.company_relationships cr
join public.company_relationship_types crt on cr.relationship_type_id = crt.id
order by cr.created_at desc;

-- -----------------------------------------------------------------------------
-- 6. Check services in cloud
-- -----------------------------------------------------------------------------
select
  id,
  tenant_id,
  slug,
  title,
  category,
  status,
  created_at
from public.services
order by created_at desc;

-- -----------------------------------------------------------------------------
-- 7. Check partners in cloud
-- -----------------------------------------------------------------------------
select
  id,
  tenant_id,
  name,
  slug,
  area,
  city,
  state,
  status,
  created_at
from public.partners
order by created_at desc;

-- -----------------------------------------------------------------------------
-- 8. Check suppliers in cloud
-- -----------------------------------------------------------------------------
select
  id,
  tenant_id,
  name,
  slug,
  products,
  status,
  created_at
from public.suppliers
order by created_at desc;

-- -----------------------------------------------------------------------------
-- 9. Identify missing jobs (compare with local seed)
-- -----------------------------------------------------------------------------
-- Run this AFTER applying seed to verify all 17 jobs were inserted
select
  id,
  title,
  slug,
  status
from public.jobs
where status = 'published'
order by created_at desc;
