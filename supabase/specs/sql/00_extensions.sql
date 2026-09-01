-- ============================================================
-- J&S EMPREGOS SAAS
-- DATABASE V2.1 — CANONICAL SQL
-- ============================================================
-- DOMAIN: extensions
-- STATUS: scaffold
-- SOURCE: supabase/specs/sql/00_extensions.sql
-- DEPENDENCIES: none
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
