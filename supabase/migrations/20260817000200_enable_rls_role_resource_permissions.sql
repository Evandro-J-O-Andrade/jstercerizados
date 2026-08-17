-- =============================================================================
-- GATE-DATA-04.014 — SECURITY: Enable RLS on role_resource_permissions
-- =============================================================================
-- Purpose:
--   The Supabase auth/SQL editor reported that role_resource_permissions
--   has policies defined, but RLS is not enabled on the table itself.
--   This migration hardens security by enabling RLS.
--
-- Rules:
--   - Do NOT edit migrations 001-013
--   - This is a security-only migration
--   - No schema changes other than enabling RLS
-- =============================================================================

ALTER TABLE public.role_resource_permissions
  ENABLE ROW LEVEL SECURITY;
